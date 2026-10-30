# xgos: архитектура DOCX и PDF на Go

Проект без реализации: один модуль, Go 1.23 (`iter`), pure Go runtime без cgo/процессов/браузера/сети. Версии зависимостей — после квалификации.
Код — declarations, кроме одного usage §6. Приватные поля, подробные enum/getters опущены. Preservation, conformance и PDF support — разные свойства.

## 1. Границы, пакеты и DAG
Источник истины — preserving XML/OPC; typed views/styles/layout не второй mutable DOM. No-op сохраняет payload частей, не ZIP metadata/compression/order. Правка сохраняет unknown соседей; raw API охватывает все части, typed — v1. Save/PDF явно whole-document.
```text
xgos/                 один модуль
  diagnostic/         errors, locations, coverage
  resource/           Source, immutable Blob, операционные limits
  xmltree/            lexical spans, immutable roots, private builder
  opc/                parts, rels, content types, ZIP, raw drafts
  model/              vocabulary, identity, views, projection
  schema/             generated grammar, planner, validation
  edit/               commands, transactions, Store, history
  style/              cascade, provenance, resolver cache
  merge/              dependencies, conflicts, atomic Plan
  docx/               простой API и DOCX I/O
  font/               provider, shaping, subset
  display/            готовые страницы и writer contract
  layout/             строки, таблицы, sections, pagination
  pdf/                сериализация display
  render/             default PDF и injectable export
    fonts/            pinned bundle и license notices
```
`A → B` означает прямой импорт B из A; стандартная библиотека опущена. Полный граф:
- `diagnostic → ∅`; `resource → diagnostic`; `xmltree → diagnostic`.
- `opc → xmltree, resource, diagnostic, golang.org/x/sync/errgroup`; `model → opc, xmltree, resource, diagnostic`.
- `schema → model, xmltree, diagnostic`; `edit → schema, model, opc, xmltree, resource, diagnostic`.
- `style → model, opc, xmltree, diagnostic`; `merge → edit, style, model, opc, xmltree, resource, diagnostic`.
- `docx → merge, edit, schema, model, opc, xmltree, resource, diagnostic`.
- `font → resource, diagnostic`; `display → font, resource, diagnostic`.
- `layout → model, style, font, display, diagnostic`.
- `pdf → display, font, resource, diagnostic`; `render/fonts → font, resource, diagnostic`.
- `render → schema, model, opc, xmltree, resource, style, font, layout, display, pdf, render/fonts, diagnostic`.

Core closure docx не достигает render/layout/font/display/pdf/assets; внешние imports не возвращаются в xgos. Layout получает semantic views без OPC readers. Registrations per-instance, immutable.
Контракт leaf-пакета `diagnostic` (severity/status enum опущены):
```go
type Location struct { Part string; Node uint64; Path string }
type Issue struct { Code string; Rule string; Context string; Severity Severity; Location Location; Message string }
type Coverage struct { Rule string; Part string; Scope string; Status CoverageStatus }
type Error interface {
    error
    Code() string // Возвращает стабильный код ошибки.
    Location() Location // Возвращает место ошибки.
    Unwrap() error // Возвращает исходную причину.
}
type Report interface { Issues() iter.Seq[Issue] // Перечисляет сообщения проверки.
    Coverage() iter.Seq[Coverage] } // Перечисляет проверенные и отложенные области.
```
Report immutable; nil — пустой отчёт, проверяется до обхода. Issue.Rule/Location.Node/Context — violation key. Error поддерживает errors.Is/As через Unwrap; fatal не становится warning.

## 2. XML, OPC и lifetime
XML: ordered lexical tokens/spans + immutable roots; backing — распакованные bytes в памяти (deflate не ReaderAt). Parse O(bytes+nodes); retained root может держать весь backing. Сохраняются QName prefixes, attributes/order/quotes/entities, comments/PI, whitespace/CDATA/BOM, UTF-8/UTF-16 LE/BE; иные encoding — отказ.
Serializer воспроизводит untouched spans; parent patch поглощает child, независимые не пересекаются. Raw replacement удаляет IDs. encoding/xml.Marshal недостаточен. Move переносит namespace/MC bindings; unknown QName-valued строки не угадываются, конфликт — отказ. AlternateContent Choice/Fallback и Ignorable/ProcessContent/MustUnderstand сохраняются; unknown mandatory effect — отказ. Namespace closure не доказывает неизвестные ID references: нужен handler.
`resource` — единственная граница lifetime внешнего источника:
```go
type Source interface {
    io.ReaderAt
    Size() int64 // Возвращает размер источника.
    Close() error // Закрывает источник для последующих чтений.
}
type Blob interface { Size() int64 // Возвращает вычисленный размер.
    Open(context.Context) (io.ReadCloser, error) } // Открывает независимое чтение.
func NewSource(io.ReaderAt, int64, func() error) (Source, error) // Оборачивает источник и закрытие.
func CopyBlob(context.Context, io.ReaderAt, int64, Limits) (Blob, error) // Копирует данные под лимитами.
```
Caller держит Source неизменным/открытым для lazy reads; nil callback — borrowed descriptor; Close закрывает wrapper однократно, ждёт допущенные reads, новые возвращают ErrSourceClosed. Повторный Close возвращает прежний результат; многошаговое чтение не публикует частичные данные.
Loaded values доступны после Close; незагруженные Blob/stream bytes — нет. Streams закрывает caller, фасад Source не закрывает. Memory snapshots/views/plans/resolvers/display — GC, без Retain/Close/guards/finalizers. Lazy caches synchronized, cancellation не вечная cached error.
Контракт `xmltree` (payload/enum опущены):
```go
type NodeID uint64
type Ref struct { Node NodeID; root [16]byte }
type Node struct { ID NodeID; Kind Kind; QName QName; Text string }
type Patch struct { Kind PatchKind; Target Ref; Before Ref; Name QName; Value string; Fragment Tree }
type PatchSet struct { Expected Tree; Changes []Patch }
type Tree interface {
    Root() Ref // Возвращает корень разобранного дерева.
    Node(Ref) (Node, error) // Читает узел данного дерева.
    Children(Ref) iter.Seq2[Ref, error] // Перечисляет детей указанного узла.
    WriteTo(context.Context, io.Writer) error // Сохраняет preserving XML.
}
func Parse(context.Context, io.ReaderAt, int64, Options) (Tree, diagnostic.Report, error) // Разбирает XML, копируя источник под ограничения.
func Apply(context.Context, Tree, PatchSet) (Tree, diagnostic.Report, error) // Применяет правки точного root.
```
PatchSet.Expected=exact root; inputs копируются, namespaces/overlap проверяются. Foreign/deleted Ref запрещён; Root без I/O.
Ключевые объявления `opc`:
```go
type Part struct { URI string; ContentType string }
type Relationship struct { ID string; Type string; Target string; Mode TargetMode }
type Savepoint struct { owner uint64; sequence uint64 }
type Reader interface {
    Parts() iter.Seq[Part] // Перечисляет части root.
    Part(context.Context, string) (resource.Blob, error) // Читает payload части.
    XML(context.Context, string) (xmltree.Tree, error) // Читает XML части.
    Relationships(context.Context, string) iter.Seq2[Relationship, error] // Перечисляет исходящие связи.
}
type Package interface {
    Reader
    completedPackage() // Запрещает внешние реализации Package.
}
type Draft interface {
    View() Reader // Фиксирует незавершённый root.
    Savepoint() Savepoint // Открывает frame журнала.
    Restore(Savepoint) error // Откатывает последний frame.
    Release(Savepoint) error // Принимает последний frame.
    PutPart(context.Context, string, string, io.ReaderAt, int64) error // Копирует payload и MIME.
    PatchXML(context.Context, string, xmltree.PatchSet) error // Применяет XML правку.
    DeletePart(context.Context, string) error // Удаляет часть без каскада.
    SetRelationship(context.Context, string, Relationship) error // Согласует связь и XML.
    DeleteRelationship(context.Context, string, string) error // Удаляет исходящую связь.
    Freeze(context.Context) (Package, diagnostic.Report, error) // Проверяет замкнутость кандидата.
}
func New(context.Context, Options) (Draft, error) // Создаёт пустой черновик OPC.
func Begin(context.Context, Package) (Draft, error) // Создаёт черновик пакета.
func Open(context.Context, resource.Source, Options) (Package, diagnostic.Report, error) // Открывает проверенный контейнер.
func Write(context.Context, io.Writer, Package, WriteOptions) (diagnostic.Report, error) // Сохраняет завершённый root.
```
Open проверяет ZIP/URI/metadata/rels; payload integrity lazy до use/full check. New/Begin создают один part table XML/binary/rels/content types. View seals immutable root; Freeze проверяет delta/index OPC closure, не публикует Store и не full OOXML validation.
Raw mutators атомарны, копируют inputs. DeletePart удаляет свои rels/override, не чужие ссылки; raw metadata инвалидирует общие indexes. Savepoints — LIFO journal offsets без deep copy; invalid token ничего не меняет, allocator не откатывается. View переживает mutation/rollback.
XML Blob.Size вычисляется до возврата под context/limits. `.rels`/content types — preserving payload, не отдельная модель. archive/zip Reader/Writer; compressed copy только после integrity verification. Запрещены traversal/ambiguous URI/duplicates/DTD/external entities/expansion; проверяются реальные expanded bytes. External rels не скачиваются. Encrypted DOCX вне v1; signed edit требует RemoveOnEdit с атомарным удалением подписей/rels и warning.

## 3. Модель, State и координаты
Reader — fixed root/options; Snapshot.OPC/Package читают один завершённый root, draft Reader допускает незамкнутость с local errors. Element/Paragraph/Run/Table/Cell/Section/Header/Footer/Footnote — read-only Reader+Ref views. Section — block interval, List — numPr projection, Field — instruction/result ranges; mutable properties не раскрываются.
Ключевые типы `model`:
```go
type Rules struct { Profile string; Fingerprint string }
type Baseline struct { Origin Reader; Rules Rules }
type ElementHandler interface { Name() xmltree.QName // Возвращает расширенное имя элемента.
    Fingerprint() string // Возвращает версию интерпретации.
    Project(context.Context, Reader, Ref) (Element, error) } // Строит неизменяемое представление элемента.
type DocumentID [16]byte
type State struct { document DocumentID; root [16]byte }
type Ref struct { Document DocumentID; Node xmltree.NodeID }
type Offset uint64
type Position struct { State State; Kind PositionKind; Text TextPoint; Anchor Anchor }
type Range struct { Start Position; End Position }
type TextPoint struct { Paragraph Ref; Offset Offset; Edge Ref; Bias Bias }
type Anchor struct { Parent Ref; Before Ref }
type Value[T any] struct { V T; Set bool }
type Reader interface {
    OPC() opc.Reader // Возвращает OPC root.
    Options() Options // Возвращает настройки интерпретации.
    Rules() Rules // Возвращает закреплённый профиль и отпечаток правил.
    State() State // Возвращает идентичность root.
    Resolve(context.Context, Ref) (Element, error) // Разрешает ссылку root.
    Query(context.Context, Query) iter.Seq2[Element, error] // Перечисляет найденные элементы.
}
type Snapshot interface {
    Reader
    Package() opc.Package // Возвращает завершённый пакет.
    Baseline() Baseline // Возвращает исходный root и его правила.
}
func NewReader(opc.Reader, Options) (Reader, error) // Создаёт fixed чтение.
func NewSnapshot(opc.Package, Options) (Snapshot, error) // Создаёт завершённый снимок.
func (p Paragraph) FindRanges(context.Context, string) ([]Range, error) // Находит безопасные текстовые диапазоны.
func (p Paragraph) Projection(context.Context) (TextProjection, error) // Возвращает текстовую проекцию.
```
Options.Rules — value descriptor, без schema; Options.Elements — frozen []ElementHandler. NewReader/NewSnapshot требуют непустой Rules.
NewSnapshot копирует Options.Baseline либо закрепляет свой Reader как Origin. Требует Baseline.Rules==Origin.Rules()==snapshot.Rules() и одинаковую interpretation. Edits/history наследуют исходный baseline.
NewReader/NewSnapshot регистрируют handlers до чтения: nil, empty fingerprint, duplicate Name/override builtin — error. QName dispatch=namespace URI+local, не prefix.
Resolve/Query/projection после MC selection вызывает Project с fixed Reader/Ref. Результат — read-only Element того же Reader/Ref; иной owner/Ref, рекурсия same-Ref, error/cancel — отказ без partial result. Без handler остаётся preserving raw view, не semantics.
Name/version входят в State/cache; handler immutable/concurrent-safe, без Draft/мутации. Layout semantics — ElementAdapter §10.
State — opaque exact root+DocumentID+interpretation от OPC/model, не revision. Одинаковый root/options → тот же State; candidates одного base различны. Mutation/rollback/Undo/Redo создают новый envelope против ABA; preflight refusal/empty batch не меняют State. CAS сохраняет candidate identity, добавляет publication revision. Old views читаются, old mutation positions запрещены.
NodeID общий для parts/drafts: move сохраняет, clone создаёт, deletion→ErrDeleted, Undo восстанавливает; rollback IDs не переиспользует. Ref добавляет DocumentID; повторный Open не сохраняет IDs. Path(State,part,expanded-name ordinals) требует exact State, rebase нет.
Strict/Transitional используют общий Meaning/XMLName и RelationshipMeaning/RelationshipType. Unknown QName не равен известному по Local; новые nodes используют vocabulary части, Profile не конвертирует. Смена MC capabilities — новый context/DocumentID.
Offset — scalar boundary, не byte/UTF-16/grapheme/glyph. Anchor=Parent/Before (zero=конец); Edge=marker, Bias=сторона marker/group. Foreign/ambiguous/неверный Kind ошибочны. Без markers стороны эквивалентны; с markers одинаковый offset не означает пустой Range. Range полуоткрытый, один State/part/story, structural endpoints siblings; stale Position/Path отвергаются.
Projection хранит source map t/delText/instructions/revisions/hidden/fields/tab/break/drawing/markers: tab=\t, break=\n с видом, drawing=U+FFFC. Text — final без deleted/moveFrom/instructions, с hidden/inserted/cached results; не Position. Layout применяет vanish с mapping.
FindRanges — nonempty UTF-8 literal слева направо без regex/normalization/case folding, через runs только с непрерывным map. Filtered gaps/fields/revisions/sdt/drawing/tab/break/markers разрывают поиск: A+deleted X+B ≠ AB. Start After/End Before сохраняют markers; adjacent без markers эквивалентны. Error — без partial result.

## 4. Атомарность, batch и история
Store публикует immutable roots; drafts независимы, один Draft меняет одна goroutine. Typed/simple/raw используют общий edit путь.
Выбор: private builder в opc/xmltree + undo journal. Первое изменение после seal отделяет затронутый контейнер/part table; далее children — растущий buffer, parts — mutable map, append амортизированно добавляет только новые entries. Журнал хранит прежние значения/длины; savepoint — offset, не root. Это рабочее состояние XML/OPC, не второй Document.
Явные View/Freeze/Commit seals публикуют immutable backing; следующее изменение отделяется от него. Restore после seal восстанавливает journal в новом envelope, не меняет old views; IDs не откатываются. Частые явные View между append могут копировать растущий контейнер: цена snapshots отдельно от bulk.
Typed planner читает private builder/локальные facts по той же generated grammar, без публичного View/Apply/serialize/reparse на append и без дублирования rules. K команд дают K journal frames, не K roots; State обновляется независимо от materialization. Batch — один State. Point append разрешает границу внутри builder; positional/raw/merge проверяют exact State.
Apply frame использует OPC savepoint; child error poison enclosing frame даже при ignored error. Commit/Rollback внутри callback запрещены; panic откатывает frame перед propagation. Внешние callback side effects не атомарны.
Контракты `edit`:
```go
type TextEdit struct { Range model.Range; Text string; Formatting ReplacementFormatting; Properties model.PropertyPatch }
type Command interface { Apply(context.Context, Draft) error } // Выполняет действие внутри frame.
type Draft interface {
    View() (model.Reader, error) // Фиксирует чтение черновика.
    Apply(context.Context, Command) error // Выполняет атомарную команду.
    ApplyEdits(context.Context, model.State, []TextEdit) error // Применяет пакет точного State.
    Commit(context.Context) (model.Snapshot, diagnostic.Report, error) // Проверяет и публикует кандидат.
    Rollback() error // Завершает черновик без публикации.
}
func NewStore(context.Context, model.Snapshot, schema.Validator, Options) (Store, error) // Создаёт Store с общей grammar.
```
Фильтр — edit.Command.Apply(ctx,Draft) error; явный Tx.Draft().Apply(ctx,filter) до Commit. Один frame, error/cancel/panic откатывает изменения. Save/render/read-only hooks фильтры не вызывают.
Draft предоставляет typed §6/raw §2 через один private opc.Draft; creation возвращает Ref. Commit: seal/delta OPC checks → unique private candidate Reader → CheckCommit → CAS(base publication). Hooks read-only; один из двух drafts одного base побеждает. Snapshot выдаётся после CAS; cancel/error до CAS сохраняет Store, после CAS — успех. Check/conflict оставляет draft исправимым, успех завершает.
ApplyEdits требует current expected State всех endpoints. Preflight проверяет UTF-8/XML/limits/formatting/ranges/overlap; patches группируются по parts/nodes, включая несколько w:t edits, без rebasing. Overlap, одинаковые вставки, вставка внутри/на endpoint range ошибочны; adjacent nonempty ranges разрешены по resolved boundaries, не Bias: AA→FindRanges("A")→BB; markers сохраняются.
Одна TextEdit — обычный текст одного paragraph, batch — разные parts. Fields/results, table/cell/section, revision/sdt/unknown/filtered gap запрещают batch. PreserveStart копирует direct rPr с unknown; ExplicitProperties — только Run. Для вставки PreserveStart берёт соседа по Bias того же контейнера, иначе нужен explicit. Zero mode/set+clear/неподходящий target ошибочны. Empty Text удаляет range. Error/cancel откатывает parts/rels/metadata/dirty sets; успех меняет State один раз.
InsertRun: XML code points, tab→w:tab, CR/LF/CRLF→line break, page/column явные, xml:space. Split сохраняет rPr/unknown/surviving Ref, новые fragments — новые IDs; coalescing нет. Разрыв field/bookmark — только согласованная команда.
History ограничена Entries/unique retained bytes; Undo/Redo — новый State/revision, edit очищает redo. Eviction снимает history references, не caller snapshots; Rollback завершает Tx, не memory Close.

## 5. Grammar и границы validation
Rules.Profile=canonical edition/vocabulary; Fingerprint=grammar checksum+версии/конфигурация всех rules/extensions. Policy PreserveExisting/Strict — acceptance, не rules identity. Immutable Validator общий для planner/Commit/Save/render; global registry нет.
Контракт `schema`:
```go
type Validator interface {
    Rules() model.Rules // Возвращает профиль и точный отпечаток правил.
    PlanProperty(context.Context, xmltree.Tree, xmltree.Ref, PropertyChange) (xmltree.PatchSet, diagnostic.Report, error) // Планирует свойство общей grammar.
    CheckCommit(context.Context, model.Reader, Delta) (diagnostic.Report, error) // Проверяет быстрые инварианты.
    FullValidate(context.Context, model.Snapshot, Policy) (diagnostic.Report, error) // Проверяет снимок целиком.
}
func NewValidator(Profile, []Extension) (Validator, error) // Закрепляет профиль и rules.
```
| Момент | Coverage |
|---|---|
| Mutator | URI/IDs/XML code points/limits/owner/State, copied inputs; typed planner сохраняет grammar/well-formedness. |
| Commit fast | Без reparse typed XML; OPC parts/rels/content types/internal targets по delta/index, identity/CAS. Raw replacement parses O(input) один раз; detach/seal/new index/raw metadata могут быть линейными. |
| References | Typed известный scope + OPC inbound index. Delete/merge строит bounded closure либо ErrReferenceCoverage; raw может дать DeferredReferences. Unsafe OPC closure запрещена. |
| Save | Fixed Snapshot, FullValidate XML/refs и integrity всех payload до первого byte, затем opc.Write того же root. |
| PDF | render.Prepare full validation+visible/fonts/images/compat; stable layout и writer embedding до первого byte. |
NewStore сверяет Validator.Rules с snapshot/Origin/Baseline.Rules; Store planner использует этот service. CheckCommit/FullValidate проверяют Rules входа; Save сверяет baseline до единственного FullValidate. Кандидаты наследуют binding.
Fast Commit не full conformance: Report содержит rules/parts/scope/deferred/unknown. Save/PDF проверяет unchanged consumer→changed target; concurrent Commit не меняет выбранный Snapshot. Output I/O — §11.
Policy отдельно от scope: PreserveExisting принимает unchanged legacy/unknown с diagnostics/no-op preservation; Strict требует покрытой conformance. Security/OPC обязательны, PDF требует известного visible смысла. Baseline.Origin удерживает исходное чтение для сравнения rule/node/context и unchanged областей; это не certificate и не второй mutable DOM. FullValidate совместно проверяет target и нужные исходные факты, одинаковый root не сканирует дважды. Новое/изменённое проверяется, недоказуемое влияние отклоняется; unknown не validated. Смена Rules требует явного нового открытия/контекста/baseline; Save/render его не создают.
Planner/full validation используют общие generated sequence/choice/cardinality/wildcards/version/MC tables. Set/Clear по model vocabulary; Clear возвращает inheritance с minOccurs. Unknown children/choice siblings не переставляются/не удаляются молча; repeated target явно адресуется, unknown particle — handler/отказ, PatchSet exact-root.
Pinned [ECMA-376](https://ecma-international.org/publications-and-standards/standards/ecma-376/): Strict/Transitional entrypoints, общий mapping/grammar. Manifest=edition/Parts/XSD closure/import/include/SHA-256/licenses/generator/toolchain/options/tables checksum. CI regeneration детерминирована, drift/unsupported XSD блокирует build; runtime без XSD/сети. Файлы/hashes ещё не получены. Вне-XSD rules: versioned ID/нормативный пункт/fixture; Word deviations с независимым эталоном не меняют conformance.

## 6. Простой API поверх edit
Document handles owner+Ref разрешаются в текущем root; Tx handles — только своём Tx, после завершения Ref разрешается заново через Document. Foreign/deleted ошибочны; properties/XML не кешируются. Основной путь — Begin→Tx mutators→один Commit/undo entry; implicit doc/p mutators — point edits. Append строит Position внутри builder, positional API требует exact State.
Контракт `docx`, payload семейств — в таблице:
```go
type Editor interface {
    AddParagraph(context.Context, string) (Paragraph, error) // Добавляет абзац командой.
    AddTable(context.Context, model.TableInput) (Table, error) // Добавляет таблицу.
    AddSection(context.Context, model.SectionInput) (Section, error) // Добавляет раздел.
    InsertDocument(context.Context, model.Position, model.Snapshot, merge.Options) (diagnostic.Report, error) // Вставляет документ через merge.
}
type Document interface {
    Editor
    Snapshot() model.Snapshot // Возвращает текущий снимок.
    Validator() schema.Validator // Возвращает закреплённый сервис проверки.
    Begin(context.Context) (Tx, error) // Начинает группу изменений.
    Save(context.Context, io.Writer, SaveOptions) (diagnostic.Report, error) // Проверяет и сохраняет DOCX.
    Undo(context.Context) (model.Snapshot, error) // Отменяет последнюю публикацию.
    Redo(context.Context) (model.Snapshot, error) // Повторяет отменённую публикацию.
}
type Tx interface {
    Editor
    Draft() edit.Draft // Возвращает общий Draft.
    Commit(context.Context) (model.Snapshot, diagnostic.Report, error) // Публикует группу атомарно.
    Rollback() error // Откатывает группу.
}
func WithValidator(schema.Validator) Option // Выбирает immutable правила документа.
func WithElements(...model.ElementHandler) Option // Регистрирует интерпретаторы элементов документа.
func New(context.Context, ...Option) (Document, error) // Создаёт минимальный корректный DOCX.
func Open(context.Context, resource.Source, ...Option) (Document, diagnostic.Report, error) // Открывает caller-owned источник.
func (p Paragraph) AddRun(context.Context, string) (Run, error) // Добавляет текст абзаца.
```
| Семейство v1 | Handles и операции общего edit пути |
|---|---|
| Текст/форматирование | Paragraph/Run: add/insert/split/delete, properties, FindRanges/ApplyEdits; Move/Clone; Twips/HalfPoints и absent/false различимы. |
| Таблицы/ячейки | Table/Row/Cell: grid, rows/cell paragraphs, widths/borders/alignment, rectangular merges; сложная перестройка только явной командой. |
| Изображения | Inline Blob/bytes+ContentType+extents; атомарные media/rels/drawing IDs, mutable вход копируется. |
| Sections/headers | Интервалы, page size/margins/break; first/odd/even Header/Footer contents и явный link-to-previous; sectPr/rels согласованы. |
| Lists | Definitions/levels/num instances, назначение paragraphs, explicit restart/continue; не mutable счётчики в handles. |
| Fields/bookmarks | Parsed instruction/cached result и boundaries, полные Bookmark ranges/names, согласованное изменение известных references. |
| Notes/links | Footnote text/IDs/separators, Hyperlink external rel/internal anchor; атомарное удаление, без сети. |
| Merge/raw/history | InsertDocument → Prepare/Plan.Apply; Tx.Draft даёт raw XML/parts/rels/batch, тот же undo/redo. |
Open/New: explicit Validator либо builtin профиля→model.Options.Rules/baseline→Store; New создаёт parts/rels/types/body/sectPr. MC/history/limits/handlers frozen; docx без render/font. Полный typed styles/settings/extensions вне v1.
Usage: тело функции `(diagnostic.Report, error)`, входы `ctx`, `paragraphs`, `docxOut`, `pdfOut`. Ошибка до Commit откатывает группу; здесь Save нового документа не ожидает warnings, для legacy caller сохраняет Report.
```go
doc, err := docx.New(ctx)
if err != nil { return nil, err }
tx, err := doc.Begin(ctx)
if err != nil { return nil, err }
defer tx.Rollback()
for _, text := range paragraphs { if _, err = tx.AddParagraph(ctx, text); err != nil { return nil, err } }
if _, _, err = tx.Commit(ctx); err != nil { return nil, err }
if _, err = doc.Save(ctx, docxOut, docx.SaveOptions{}); err != nil { return nil, err }
return render.PDF(ctx, pdfOut, doc.Snapshot(), render.Options{Validator: doc.Validator()})
```
Rollback завершённого Tx — идемпотентный no-op.

## 7. Merge: профили, конфликты, sections
Merge обязателен в поддержанном профиле. PreserveSource сохраняет оформление; UseDestination явно выбирает target formatting с diagnostics.
Контракт `merge`:
```go
type Options struct { Profile Profile; Sections SectionPolicy; Numbering NumberingPolicy }
type Plan interface {
    edit.Command
    Expected() model.State // Возвращает ожидаемый State.
    Mappings() iter.Seq[Mapping] // Перечисляет сопоставления переноса.
    Report() diagnostic.Report // Возвращает diagnostics переноса.
}
func Prepare(context.Context, model.Reader, model.Position, model.Snapshot, Options) (Plan, error) // Планирует вставку в root.
```
Prepare: target Draft.View+exact Position, source Snapshot; style resolver читает оба без Freeze. Plan удерживает roots/closure/mappings/preview. Apply проверяет State==Expected/owner/anchors, переносит одним frame; изменённый target — ErrConflict, Commit отдельно CAS. Key=source DocumentID/part/ID kind/old ID; target NodeIDs новые/deterministic. Reuse=graph/context equivalence, rename=strings/URI, remap=scoped IDs/rId.
| Части/ID | Политика |
|---|---|
| URI/types/rels | Rename URI, согласованный MIME; part-scoped rId remap, type/mode/target/external links сохраняются. |
| Styles | Reuse basedOn/link/numbering/theme/defaults graph либо rename styleId+refs; UseDestination требует type/mapping. |
| Numbering | Equivalent abstractNum reuse, num instance новый; IDs/overrides remap; continue explicit compatible levels/restart. |
| Media | Bytes без recompression; reuse bytes+type/role/graph, hash не equality; drawing IDs/rels новые. |
| Sections | Interval splice, effective first/odd/even/связи/source final sectPr вместе. |
| Bookmarks/links | Целые ranges, pair ID remap/name rename/anchor rewrite; разрез/unknown dependency — отказ. |
| Fields | Parsed REF/PAGEREF/HYPERLINK tokens с switches/quoting; unknown ссылочный instruction — handler/отказ. |
| Notes/comments | Scoped ID remap, definitions/separators/parts closure; ranges целые, comments PDF не обещан. |
| Globals | Target сохраняется; source defaults/theme/settings materialize в styles/direct/sections, equivalent reuse; нелокализуемое — отказ. |
| Metadata | Drawing IDs document-wide, paraId part-scoped, textId соответствует edit; rsid не unique. |
| customXML/MC/unknown | Versioned enumerator/remapper; opaque только при доказанной closure/неизменном reference context, иначе ErrUnknownReference. |
Sections: до splice разрешаются final/paragraph sectPr/break/headers/inheritance обеих сторон. Middle=target prefix+source+target suffix; begin/end без пустой стороны. Target сохраняет свойства; source final становится boundary/terminal, body final только последнему interval. Paragraph carrier/пустая строка/страница видны в Plan; недопустимое — отказ, break policy явна.
Link-to-previous только при том же effective content, иначе explicit rel/пустой header/footer. First/odd/even/titlePg/footer независимы. Включение evenAndOddHeaders материализует прежние target even (при выключенном — odd). Materialization только известных theme/defaults; global compat/footnote/unknown field конфликт обеих сторон блокирует Plan. Closure отвечает Prepare, не Commit; Source/full Save — §2/5.

## 8. Styles
Resolver immutable Reader (включая draft): docDefaults→table/numbering→paragraph→character→direct. Precedence/toggle/combine property-specific, absent≠false. basedOn наследует, next выбирает следующий стиль, link связывает типы; cnfStyle/tblLook/cell/theme/language учитываются. Cycles/missing/ambiguous — diagnostics, repair только явный.
Контракты `style`:
```go
type Resolver interface { Resolve(context.Context, model.Ref, Context) (Effective, error) } // Вычисляет свойства и provenance.
func NewResolver(model.Reader, Options) (Resolver, error) // Создаёт resolver чтения.
type Factory func(model.Reader) (Resolver, error) // Создаёт настроенный resolver.
```
Effective — immutable properties/provenance. Merge использует NewResolver(target/source); render.Factory(snapshot) готовит resolver для Input.Properties. Cache bounded по State/NodeID/context/theme/numbering/config; новый root — новый cache.
Render строит paragraph→label map один раз в main-story order, включая tables; passes/headers counters не увеличивают. num/abstractNum/levels/overrides/start/restart/lvlText обязательны. V1 decimal/decimalZero/Roman 1..3999/Latin letters/bullet/none; прочие/picture bullets — refusal, не fallback.

## 9. Fonts, ранний spike и display
Provider/Face/Shaper/Subsetter независимы. FaceID=bytes fingerprint+index+variations, layout/writer используют один face. V1 static TrueType glyf, RU/EN Latin/Cyrillic LTR; CFF/variable/color/Bidi/другие scripts вне квалифицированного профиля.
Default render/fonts — pinned RU/EN Regular/Bold/Italic/BoldItalic bundle, кандидаты [Carlito OFL](https://github.com/googlefonts/carlito/blob/main/OFL.txt) и [Liberation](https://github.com/liberationfonts/liberation-fonts/blob/main/LICENSE). Manifest: commit/version/files/SHA-256/coverage/licenses/NOTICE/provenance; assets ещё не получены. Core bundle не импортирует.
Resolution: embedded→exact configured→explicit versioned substitution→разрешённый bundled mapping. Каждый fallback диагностирует requested/selected/location/reason; без name heuristics, pagination не гарантируется. Render читает fontTable/rels/fontKey/subsetted и bounded deobfuscation; font не знает OPC. Wrong key/corrupt/external/недостающая coverage до/после shaping — отказ либо разрешённый fallback до layout.
[OS/2 fsType](https://learn.microsoft.com/en-us/typography/opentype/spec/os2#fstype)/provenance проверяются: restricted/bitmap-only — отказ, NoSubsetting требует разрешённый full embedding. Writer face не заменяет.
Контракты `font`:
```go
type FaceID struct { Fingerprint string; Index uint32; Variations string }
type Scope struct { Embedded []Face }
type Glyph struct { ID uint32; AdvanceX int64; AdvanceY int64; OffsetX int64; OffsetY int64 }
type GlyphSequence struct { Glyphs []Glyph; Clusters []ShapedCluster }
type GlyphSet []uint32
type EmbeddedFont struct { Data resource.Blob; GlyphIDs map[uint32]uint32 }
type Face interface {
    ID() FaceID // Возвращает идентичность шрифта.
    Data() resource.Blob // Возвращает байты шрифта.
    Metrics() Metrics // Возвращает метрики шрифта.
}
type ShapeInput struct { Paragraph string; Range ScalarRange; Script string; Language string; Direction Direction; Features []Feature; Boundary ShapeBoundary }
type ShapedCluster struct { GlyphStart uint32; GlyphEnd uint32; Source ScalarRange; UnsafeToBreak bool; UnsafeToConcat bool }
type Provider interface { Resolve(context.Context, Scope, Request) (Face, diagnostic.Report, error) } // Выбирает face с coverage.
type Shaper interface { Shape(context.Context, Face, ShapeInput) (GlyphSequence, error) } // Формирует glyphs с контекстом.
type Subsetter interface { Subset(context.Context, Face, GlyphSet) (EmbeddedFont, error) } // Готовит subset и mapping.
```
GlyphIDs old→embedded (identity при full embedding); slices/maps — caller-owned copies, Face metadata loaded, Scope копируется. ShapeInput paragraph+scalar range/cluster Source, не isolated run; font без Ref, mapping хранит layout. Advances/offsets signed 1/64 font unit.
Style boundary ≠ line boundary; many-to-many/unsafe flags требуют reshaping, потеря flags — conservative. UAX #14/#29/clusters различаются; nil Hyphenator выключает только versioned RU/EN словарь.
Spike shaper+subsetter→manual display→PDF→independent extraction. go-text/typesetting v0.3.5 — кандидат (pin/pure Go/Unicode/fonts), не принятая dependency. GSUB/GPOS/context/kerning/combining/ligatures/breaks/clusters/cancel; subset отдельно: composite closure/checksum/GID/rights/corrupt/limits/ToUnicode/ActualText. Full embedding не закрывает subset gate.
Display: immutable страницы, 1/1000 pt, origin top-left/Y вниз; boxes/glyph positions/exact fonts/Unicode/images/paths/links/destinations/transforms/clip/save/restore. Writer без OOXML; lifetime §2.
Контракт `display`: открытые read-only interfaces реализуемы любым Engine/fixture; enum/scalar paint/annotation payload опущены:
```go
type Coord int64
type Point struct { X Coord; Y Coord }
type Rect struct { Min Point; Max Point }
type PageBoxes struct { MediaBox Rect; CropBox Rect }
type Matrix struct { A float64; B float64; C float64; D float64; TX Coord; TY Coord }
type FontID string
type ImageID string
type PositionedGlyph struct { ID uint32; Position Point }
type UnicodeCluster struct { GlyphStart uint32; GlyphEnd uint32; Text string }
type GlyphRun interface {
    Font() FontID // Возвращает FontID.
    Size() Coord // Возвращает размер шрифта.
    Paint() Paint // Возвращает окраску.
    Glyphs() iter.Seq[PositionedGlyph] // Перечисляет размещённые глифы.
    Clusters() iter.Seq[UnicodeCluster] // Перечисляет Unicode clusters.
}
type Image struct { Resource ImageID; Matrix Matrix }
type PathSegment struct { Kind SegmentKind; P1 Point; P2 Point; P3 Point }
type Path interface {
    Segments() iter.Seq[PathSegment] // Перечисляет геометрию пути.
    Paint() PathPaint // Возвращает линию и заливку.
}
type Clip interface {
    Segments() iter.Seq[PathSegment] // Перечисляет границу clip.
    Rule() FillRule // Возвращает fill rule.
}
type Command struct { Kind CommandKind; Source diagnostic.Location; Text GlyphRun; Image Image; Path Path; Transform Matrix; Clip Clip }
type Page interface {
    Boxes() PageBoxes // Возвращает размеры страницы.
    Commands() iter.Seq[Command] // Перечисляет команды страницы.
    Annotations() iter.Seq[Annotation] // Перечисляет ссылки и назначения.
}
type ImageResource struct { Width uint32; Height uint32; BitsPerComponent uint8; Encoding ImageEncoding; ColorSpace ImageColorSpace; Data resource.Blob; Alpha resource.Blob }
type Document interface {
    Pages() iter.Seq[Page] // Перечисляет immutable страницы.
    Font(FontID) (font.Face, error) // Разрешает FontID с проверкой.
    Image(ImageID) (ImageResource, error) // Разрешает ImageID с проверкой.
}
type Writer interface { Write(context.Context, io.Writer, Document) (diagnostic.Report, error) } // Проверяет ресурсы, записывает страницы.
```
Kind выбирает payload; Save/Restore balanced, geometry finite. Repeatable Pages/Commands/Glyphs — GC views без deep copy/Close/Retain/guards. Producer отделяет buffers один раз; metadata по значению, mutable slices/maps/pointers скрыты.
Original GID/baseline positions, Size по unitsPerEm; half-open many-to-many clusters. Metadata loaded; обход проверяет context, Blob I/O — §2. Font/Image IDs локальны Document.
ImageResource: validated 8-bit Gray/RGB Samples либо JPEG Gray/RGB/YCbCr, Alpha straight 8-bit, не PNG. Render проверяет pixels до decode; extents, не DPI. PNG8/JPEG8+alpha/clipping; PNG16/CMYK/YCCK/EXIF rotation/unknown ICC — refusal. Writer не decoder.

## 10. Layout, autofit и PDF
Prepare проверяет входы; layout размещает semantics, writer пишет display. Work/pages/spool/passes конечны; context проверяется в loops.
V1 tabs/indents/spacing/alignment/justify/keep/widow-orphan; headers/footers измеряются до body. Soft hyphen имеет width только на break; emergency grapheme break явный с reshaping. Неразмещаемый grapheme/row/note/keep — location error, не clipping.
PAGE/NUMPAGES/PAGEREF/notes требуют fixed point по breaks/values/notes distribution/geometry; oscillation/MaxPasses→ErrLayoutUnstable. Notes separator/continuation, spool в памяти.
Default допускает approximate autofit, включая default tblLayout. OOXML описывает базовый table layout; конкретный Word/compat требует квалификации. Layout учитывает section/cell width/margins/indents, min/preferred dxa/pct/auto, tblW/tcW/gridCol/spans; grid hint. Solver измеряет min/preferred text/images/padding, распределяет span constraints/minima, остаток — пропорционально deficits с deterministic rounding.
Nested tables снизу вверх, widths вызывают reflow; MaxTableCells/Depth/WidthPasses/MeasuredScalars ограничены. Невозможные minima/fixed constraints/несходимость — отказ, без shrinking/clipping/DOCX mutation. Каждая approximation даёт part/node/width/assumptions warning; ExactGeometry запрещает её. Exact row height не разрешает потерю текста, сложный page split/vMerge вне v1.
| PDF v1 | Поддержка и границы |
|---|---|
| Sections/headers | Single column next/odd/even pages, first/odd/even headers; continuous/multicolumn/floating wrap — refusal. |
| Tables | Fixed и bounded autofit, nesting/rectangular spans/merges/repeated headings; impossible geometry и сложные splits — refusal. |
| Notes/fields | Simple footnotes/PAGE/NUMPAGES/PAGEREF; endnotes/full TOC/прочие fields — reject либо explicit CachedResult warning. |
| Content | Final revisions projection с warning, sdtContent без databinding, supported MC fallback; unknown visible/OMML/charts/SmartArt/comments — reject. |
| Output | PDF 1.7 subset, links/bookmarks, exact fonts/Unicode; tagged PDF, PDF/A, signatures/encryption вне v1. |
VisiblePlaceholder — opt-in warning, не normal success. PDF refusal не теряет XML. Render читает compat name/uri/value/default: база xgos-v1, неизвестное → UnsupportedCompatibility. Только AllowCompatibilityApproximation разрешает base semantics; autofit permission недостаточно.
Layout Input — immutable semantics без Snapshot/Reader/OPC/XML/schema; DOCX adapter/policy принадлежат render.
```go
type Config struct { Fingerprint string; ExactGeometry bool; EmergencyBreak bool }
type Input interface {
    State() model.State // Возвращает исходный State.
    Config() Config // Возвращает геометрическую политику.
    Stories() iter.Seq[model.Story] // Перечисляет потоки документа.
    Blocks(context.Context, model.Ref) iter.Seq2[model.FlowNode, error] // Читает дочерние flow nodes.
    Properties(context.Context, model.Ref, style.Context) (style.Effective, error) // Читает effective свойства.
    Font(context.Context, model.Ref, font.Request) (font.Face, diagnostic.Report, error) // Разрешает подготовленный шрифт.
    Image(model.Ref) (display.ImageResource, error) // Возвращает проверенное изображение.
}
type Engine interface { Layout(context.Context, Input, Limits) (display.Document, diagnostic.Report, error) } // Размещает подготовленную семантику.
type Hyphenator interface {
    Breaks(context.Context, string, string) ([]model.Offset, error) // Возвращает границы переносов.
    Fingerprint() string // Возвращает версию словарей.
}
func NewEngine(font.Shaper, Hyphenator, Limits) (Engine, error) // Создаёт ограниченный движок.
```
Semantic vocabulary `model`, используемый только как read-only views:
```go
type Story struct { Root Ref; Kind StoryKind }
type FlowNode interface {
    Ref() Ref // Возвращает исходный Ref.
    Kind() FlowKind // Возвращает вид элемента.
    Text() TextProjection // Возвращает source-mapped текст.
    Geometry() FlowGeometry // Возвращает геометрию элемента.
}
```
FlowKind: paragraph/run/table/row/cell/image/section/field/note/link/destination; Blocks(ref) — дети. TextProjection/FlowGeometry — immutable semantic views: source map/labels, grid/spans/widths, section intervals/header refs, fields/results/dependencies, note anchors/separators, links/bookmarks/extents. Подробные getters опущены; OPC/XML handles отсутствуют.
Prepare адаптирует snapshot/resolver/resource maps в Input без mutable DOM. State/config/resources fixed; geometry-dependent fields — в layout. Fingerprint policies/adapter/style/font вычисляется, входной не принимается. ElementAdapter выдаёт общие FlowNodes без своего paginator.
Input producer (Prepare либо custom) проверяет schema/OPC/integrity/visible semantics/resources. Engine проверяет geometry/limits; Snapshot не принимает, FullValidate не вызывает. Limits можно ужесточить; lazy Blob lifetime — §2. Validation certificate cache отсутствует.
Контракт `pdf`:
```go
func NewWriter(font.Subsetter, Options) (display.Writer, error) // Создаёт PDF writer.
```
Writer собирает glyph sets/subsets до output, отвечает за objects/xref/pages/resources/streams/annotations, не shaping/layout; indirect Length позволяет io.Writer без Seeker.
CID/ToUnicode и нужный ActualText должны сохранять many-to-many Unicode; невозможный точный extraction — отказ профиля. Формат опирается на [ISO 32000-1](https://pdfa.org/resource/iso-32000-1/), независимый parser проверяет результат.
Фасад `render` (copied/frozen per call):
```go
type Components struct { Styles style.Factory; Fonts font.Provider; Elements []ElementAdapter }
type Options struct { Validator schema.Validator; Policy schema.Policy; Geometry layout.Config; Limits Limits; UnsupportedContent UnsupportedContentPolicy; OtherFields FieldPolicy; AllowCompatibilityApproximation bool }
type ElementAdapter interface {
    Namespaces() iter.Seq[string] // Перечисляет namespaces.
    Fingerprint() string // Возвращает версию преобразования.
    Project(context.Context, model.Reader, model.Ref) (model.FlowNode, error) // Строит semantic flow.
}
func Prepare(context.Context, model.Snapshot, Components, Options) (layout.Input, diagnostic.Report, error) // Готовит семантику layout.
func PDF(context.Context, io.Writer, model.Snapshot, Options) (diagnostic.Report, error) // Экспортирует PDF стандартным конвейером.
func Export(context.Context, io.Writer, model.Snapshot, Components, layout.Engine, display.Writer, Options) (diagnostic.Report, error) // Экспортирует заданными компонентами.
```
Prepare до FullValidate требует Options.Validator.Rules==snapshot.Rules==Baseline.Rules==Baseline.Origin.Rules. Same Profile, extensions A≠B → mismatch/error без FullValidate/output; baseline не пересоздаётся.
При совпадении A — один FullValidate target, затем semantic/compat/resource preflight/resolver/counters/adapters. Input только при успехе; Engine/Writer без schema validation. Adapters immutable/versioned; nil/duplicate/ambiguous namespace/features — error.
Export требует Components и Options.Validator; всегда Prepare→Engine.Layout→Writer.Write, объединяя reports. PDF использует explicit Options.Validator (например Document.Validator()); nil допустим лишь при точном builtin Rules профиля snapshot/baseline, иначе отказ. Затем standard Factory/bundle/NewEngine/NewWriter→Export. Core не знает render defaults.
Limits ограничивают preparation/layout, writer имеет конечные Options. Render создаёт Blob через CopyBlob, faces через ParseFace; Input.Font связывает Provider.Resolve(Scope{Embedded: faces}, request) со State. Factories font (первые две), render/fonts (последняя):
```go
func ParseFace(context.Context, resource.Blob, Options) (Face, error) // Разбирает шрифт под лимитами.
func NewProvider([]Face, Options) (Provider, error) // Закрепляет шрифты и подстановки.
func Provider(context.Context) (font.Provider, diagnostic.Report, error) // Создаёт bundled provider.
```
Shaper/Subsetter defaults квалифицируются на spike §9; готовность реализации не заявлена.

## 11. Ресурсы, расширения и потоки
Стоимость памяти — input + work + unique retained roots/backings caller/history/cache, без глобального RSS cap. Limits: parts/expanded bytes/ratio/XML depth/tokens, edit visited/copied, merge closure, fonts/glyphs/pixels/cache/history/text/tables/pages/spool/passes/workers; zero=finite default, negative/overflow/incompatible ошибочны, allocation проверяется заранее.
Eviction не отзывает caller values. sync.Pool только scratch, oversized buffers не возвращаются; immutable опубликованные данные не pool-backed. Независимые parts используют errgroup.WithContext/SetLimit/Wait: общий конечный budget без nested blocking submissions, fatal отменяет siblings, Wait join до возврата, IDs/order не от scheduler.
Cancel закрывает operation I/O readers/temporary roots; disk spill нет. Blocked ReaderAt/Writer требует caller timeout. Частичный ZIP/PDF при I/O/cancel/Close возможен: atomic file replace делает caller temp/sync/rename, не перезаписывая lazy source.
| Extension/error граница | Контракт |
|---|---|
| model/edit | ElementHandler §3: Name/Reader/Ref→Element; filter §4: явный Command через Apply. |
| schema/render/font | Versioned rules/reference remapper; ElementAdapter → semantic flow общего paginator; injectable Provider/Shaper/Subsetter. |
| Registrations | Per-instance copied/frozen versions/namespaces/features/thread-safety; fingerprint caches. Go callback — доверенный код, sandbox/plugin.Open не обещаются. |
| Diagnostics | Контракты §1: ZIP/XML, limit/schema/reference/coverage, rules mismatch, conflict/stale/deleted/foreign owner, source closed, unsupported/font/layout unstable/I/O. |
| Потоки | Open: Source→OPC→Snapshot→views; edit: New/Open→Tx→commands/batch→fast CAS→full Save; merge: View+source→Prepare→exact-State Apply→Commit; PDF: fixed Snapshot→render.Prepare→semantic Input→layout→stable display→writer. |

## 12. Проверки и количественный корпус
H0 — инженерные гипотезы, не измерения. Spike может пересмотреть их через versioned ADR до freeze acceptance manifest; после прогона подгонка/переклассификация запрещены. Fonts/корпус ещё не получены.
Manifest: provenance/license/SHA-256/features/profile/rules/Unicode/fonts/rights/mappings/policies/limits/toolchain, независимые Word PDF/images+версия окружения. RU/EN mixed/combining, lists/tables/spans/images/sections/notes/fields; corrupt/unknown/unsupported/fonts/limits — негативы. Critical/regression, exploratory positive, expected refusals и placeholders раздельны; exact/approximate geometry отдельно от OOXML conformance. Runtime Word не запускает.
| Метрика | H0 gate и способ учёта |
|---|---|
| Critical/regression | 100% cases проходят все заявленные проверки; ошибка не исключается из denominator. |
| Expected refusal | 100% code+location совпадений, отдельно от positive success. |
| Content/warnings | 0 missing Unicode spans/visible objects/glyphs и 0 unexpected warnings; source map + независимый extraction. Placeholder не normal success. |
| Exploratory positive | ≥95% всех заранее positive cases проходят профиль, не просто возвращают nil error. |
| Exact geometry | Δpages=0; p95 matched bbox error ≤1 pt, unmatched content=0; exact fonts/policies. |
| Approximate geometry | ≥90% cases с Δpages=0; остальные abs(Δpages)≤max(1,ceil(0.05×referencePages)); approximation/location warnings обязательны. |
| Lines/visual | Matched line-break mismatch, unmatched lines и pixels сверх порога при fixed DPI; численные визуальные пороги фиксирует spike ADR. Без независимого renderer нет visual acceptance. |
| Bulk scaling | N=1000/2000/5000/10000 одинаковых paragraphs, один Tx/Commit без View; warmup, pinned toolchain/hardware/GOMAXPROCS/concurrency. H0 T(2N)/T(N)≤3 и AllocBytes(2N)/AllocBytes(N)≤3 для 1000→2000 и 5000→10000; абсолютные ms не обещаются. |
| Display traversal | Два полных обхода того же IR; отдельно время/alloc bytes относительно glyph payload. H0: второй обход добавляет ≤1% payload bytes, не клонирует страницы/массивы; scalar checksum предотвращает elimination. |
| Memory/CPU | Wall/CPU p50/p95, allocs/op, allocated bytes, peak RSS/heap, baseline/concurrency/retained roots/font/image/spool high-water. Измерения, не RSS cap. |
Benchmarks публичного API, не builder internals. 95% exploratory не заменяет обязательные cases; warnings не разрешают missing content.
| Тесты | Обязательные швы |
|---|---|
| XML/OPC/grammar | No-op bytes/unknown/namespace/MC/UTF-16/hostile ZIP/raw metadata; оба profiles/regeneration/choice/Clear/coverage. |
| State/lifetime | Два candidates/один CAS; old View mutation/rollback/undo; loaded после Close/lazy ErrSourceClosed/concurrent race. |
| Edit/history | Read→FindRanges→batch→Save/Open; AA→BB/Bias/markers/filtered gaps/field/table/section refusal; formatting/ignored error/cancel/§6 families/implicit=grouped/image undo-redo. |
| Validation/merge | Rules mismatch до FullValidate; matched target один раз; unchanged consumer→changed target до output; legacy/Strict; reuse/new num/media/fields/bookmarks; section begin/middle/end/final/header/global/unknown conflicts; stale Plan. |
| Font/layout/PDF | Independent GSUB/GPOS/clusters/GID/checksum/rights/extraction/visual goldens; autofit minima/spans/no clipping/feedback/counters; style edit только нового Snapshot. |
| Race/fuzz/bench | ZIP/XML/QName/fonts/merge graphs/cancel/workers/caches/source; deterministic scheduling, nested/image-heavy/long docs/resource exhaustion. |
Expected независим от planner/writer; свой PDF parser не эталон. Каждый bug — regression fixture. Self-check документа не runtime/golden/corpus/race/fuzz acceptance.

## 13. Решения и стоимость
| Решение | Альтернатива | Причина/цена |
|---|---|---|
| Spans/views/GC + caller Source | Marshal/вторая модель/memory Close | Preservation, явное I/O; retained backings. |
| Builder+journal/seal | Root на каждый append | Bulk без repeated copy; явные View оплачиваются. |
| Exact State + единый edit | Revision identity/два mutator пути | Unique candidates, stale merge rejection. |
| Fast Commit/full output | Full scan каждого edit/всегда Strict | Coverage/preservation, дорогой Save. |
| Scoped merge/intervals | Body concatenation/global ID replacement | Closure/sections; unknown refusal. |
| Prepare→Input→layout→display | XML-aware layout/double validation/IR copies | Один preflight, независимые engine/writer. |
| Render bundle/approx autofit | Core fonts/external converter/exact Word | Pure Go, assets qualification/warnings. |
| Font spike/frozen corpus | Сначала весь layout/свой parser oracle | Ранние независимые gates до расширения. |
Open — metadata, первый parse/index O(bytes+nodes). K typed append в Tx: O(detached containers+added bytes/nodes+journal), без K copies/reparses. Random insertion/deletion O(siblings), raw replacement O(input), explicit View оплачивает seal/detach. Commit не O(1): seal/dirty checks/index delta; raw metadata может перестроить O(parts+rels) index.
ApplyEdits O(K log K)+область; Save — полный проход/output, merge — closure, PDF — visible content/bounded passes. Display traversal O(commands+glyphs) без IR copy. Retained root может держать весь backing; CPU/RSS ещё не измерены.

## 14. Этапы, риски, unsupported
| Этап | Gate |
|---|---|
| 0. Контракты/font spike | DAG/State/Input/H0, shaper/subsetter→manual display→independent PDF extraction; ADR до freeze. |
| 1. OPC/XML | Builder/journal/seal/Source/views/vocabulary; lossless/hostile/Close-race/rollback/retention. |
| 2. Grammar/Store | Pinned generation/fast-full/CAS/history; choice/deferred/Strict/cancel/candidates. |
| 3. Typed API | Все §6 families/bulk/FindRanges/batch; Bias/gaps/child errors/undo; scaling §12. |
| 4. Styles/merge | Resolver/closure/interval splice; theme/headers/bookmarks/globals/unknown/stale target. |
| 5. Display/PDF | Qualified bundle/subsetter/immutable IR; independent parser/extraction/codecs/I/O/allocations. |
| 6. Layout | RU/EN→lists→tables→sections→notes/fields; stable render, minima/feedback/compat/work limits. |
| 7. Release | Frozen corpus/race/fuzz/bench/core closure; incomplete visual evidence не закрывает gate. |
Gates требуют независимых review/negative fixtures/замеров; spike не production qualification, merge не ждёт завершения PDF.
Вероятности ниже — качественные гипотезы до spike, не статистика.
| Риск | Вероятность H0 | Влияние | Ранний индикатор | План Б |
|---|---|---|---|---|
| Word/compat/layout | Высокая | Иные breaks/pages | Exact corpus выходит за §12 | Сузить квалифицированный профиль, точный refusal. |
| Autofit/nested tables | Высокая | Overflow/нестабильность | Minima/width passes исчерпаны | Bounded approximation с warning; невозможное отклонить. |
| Font substitution/shaping | Высокая | Потеря glyphs/метрик | Cluster/context/font spike расходится | Exact configured face либо явный refusal. |
| Subsetter/Unicode | Средняя | Нечитаемый PDF/extraction | Composite/checksum/ToUnicode failures | Разрешённый full embedding; subset gate остаётся незакрытым. |
| Cross-part merge | Высокая | Чужие links/styles/headers | Closure/reference fixture ломается | Отказ всего Plan; explicit mapping/handler. |
| Retention/GC | Средняя | Рост heap при old roots | Retained-root/heap slope | Ограничить history/cache; caller отпускает snapshots. |
| Grammar/validation | Средняя | Ложная conformance | XSD drift/deferred unknown scope | Block regeneration/strict output; сохранить raw с diagnostics. |
| Bulk/sealing cost | Средняя | Квадратичное построение | Scaling ratio >3 | Исправить shared builder; не скрывать snapshots в mutators. |
| Source/I/O cancellation | Средняя | Частичный output/задержка | Close race/blocked reader fixture | Caller timeout и temp/sync/rename, оставить source открытым. |
При недоказуемом переносе/геометрии — точный отказ; совместимость неизвестного архива не обещается.
Не входят в v1: полный typed OOXML/Word layout, templates/automatic rebase/full XPath, revision accept/reject, arbitrary OMML/charts/SmartArt, все scripts/fonts, encrypted DOCX, PDF/A/signatures/encryption, network/processes/cgo и disk spill. Неохваченный XML сохраняется в пределах preservation/security policy.
Реализация/assets/XSD/runtime/golden/corpus/performance не выполнены. Риски: fidelity, merge, caller-retained память.
