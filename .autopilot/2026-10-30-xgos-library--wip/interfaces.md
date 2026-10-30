# Границы, решённые в спецификации

Модуль `github.com/mesocyclon/xdos`; Go language minimum 1.23, проверка фактической совместимости — CI gate. Ниже контракт, не исходники; поля enum/getters/payload опущены там, где они не меняют межпакетный обмен. Сигнатуры сгруппированы по пакету, не являются одним компилируемым файлом. Тела функций и реализация отсутствуют.

## 1. Владельцы, exports и скрываемые детали
| Каталог/пакет | Владеет | Открывает | Скрывает |
|---|---|---|---|
| diagnostic | Stable error codes, location, coverage | Error, Issue, Report | Mutable report builder |
| resource | External I/O lifetime, Blob bytes, finite budgets | Source, Blob, NewSource, CopyBlob | Close synchronization, scratch allocation |
| xmltree | Lexical tokens/spans, NodeID, immutable tree | Tree/Ref/PatchSet, Parse/Apply | Mutable builder/journal/seal, backing buffers |
| opc | Parts/rels/content types/ZIP как одна модель | Reader/Package/Draft, Open/Begin/New/Write | Part tables/indexes, compressed copy verification |
| model | Vocabulary, identity, coordinates, read-only semantics | Reader/Snapshot/Ref/State/views/Projection/FlowNode | XML bindings, interpretation identity construction |
| schema | Pinned grammar и общие rules | Validator, PlanProperty/CheckCommit/FullValidate | Generated tables, grammar planner internals |
| edit | Atomic frames, Store/CAS, history | Command/Draft/Store/ApplyEdits | Журнал команд, publication revision, mutator machinery |
| style | Property-specific cascade/provenance | Resolver/Factory/Effective | Bounded per-State cache |
| merge | Dependency closure, scoped conflict maps, interval splice | Prepare/Plan/Options/Mapping | ID allocators/closure traversal/materialization |
| docx | Простой owner-bound API и DOCX orchestration | Document/Tx/domain handles/New/Open/Save | Implicit Tx plumbing; не отдельные edit rules |
| font | Face/provider/shaping/subsetting contracts | Face/Provider/Shaper/Subsetter, ParseFace/NewProvider | Font parsing/metric caches; не OPC |
| display | Immutable neutral placed-page vocabulary | Document/Page/GlyphRun/Writer | Producer-owned arrays; нет mutable slices наружу |
| layout | Lines/tables/pages/notes/field fixed point | Input/Engine/Hyphenator/NewEngine | Paginator/work queues/counters consumption |
| pdf | PDF 1.7 serialization/embedding/Unicode mapping | NewWriter → display.Writer | Object IDs/xref/subset collection; не layout |
| render/fonts | Qualified default assets/licenses | Provider | Bundle bytes/index; core их не импортирует |
| render | DOCX→semantic preparation/default composition | Prepare/Export/PDF/Components/ElementAdapter | OPC/resource adaptation; не новый paginator |

Каждая строка — owner инвариантов, не требование создать пустой пакет заранее. Общий invariant меняется у owner и используется consumers. `util`, `manager`, универсальный service layer не создаются. Split/merge — только по связности данных/инвариантов и направлению imports; изменение фиксирует callers/tests/fixtures/config/exports impact. Private builder внутри XML/OPC остаётся той же моделью, не параллельным mutable DOM.

## 2. Прямой DAG
`A → B` означает прямой импорт, стандартная библиотека опущена. Новые внешние dependencies разрешаются только после pin/qualification; не импортируют xdos обратно.
```text
diagnostic → ∅
resource → diagnostic
xmltree → diagnostic
opc → xmltree, resource, diagnostic, golang.org/x/sync/errgroup
model → opc, xmltree, resource, diagnostic
schema → model, xmltree, diagnostic
edit → schema, model, opc, xmltree, resource, diagnostic
style → model, opc, xmltree, diagnostic
merge → edit, style, model, opc, xmltree, resource, diagnostic
docx → merge, edit, schema, model, opc, xmltree, resource, diagnostic
font → resource, diagnostic
display → font, resource, diagnostic
layout → model, style, font, display, diagnostic
pdf → display, font, resource, diagnostic
render/fonts → font, resource, diagnostic
render → schema, model, opc, xmltree, resource, style, font, layout, display, pdf, render/fonts, diagnostic
```
CI import check проверяет список прямых связей, cycles и transitive closure `docx`: никаких render/layout/font/display/pdf/assets. Layout принимает только semantic views из model, не использует model.Reader.OPC. Статический API check запрещает Snapshot/Reader/OPC/XML/schema в layout.Input. Изменение DAG требует явного обоснования в ADR, не локального обхода.

## 3. Общие границы I/O и identity
```go
// diagnostic: сообщения immutable, nil Report означает пустой.
type Location struct { Part string; Node uint64; Path string }
type Issue struct { Code, Rule, Context string; Severity Severity; Location Location; Message string }
type Coverage struct { Rule, Part, Scope string; Status CoverageStatus }
type Error interface { error; Code() string; Location() Location; Unwrap() error }
type Report interface { Issues() iter.Seq[Issue]; Coverage() iter.Seq[Coverage] }
// resource: закрытие относится только к внешнему источнику.
type Source interface { io.ReaderAt; Size() int64; Close() error }
type Blob interface { Size() int64; Open(context.Context) (io.ReadCloser, error) }
func NewSource(io.ReaderAt, int64, func() error) (Source, error)
func CopyBlob(context.Context, io.ReaderAt, int64, Limits) (Blob, error)
// xmltree: ссылки привязаны к точному корню.
type NodeID uint64
type Ref struct { Node NodeID; root [16]byte }
type PatchSet struct { Expected Tree; Changes []Patch }
type Tree interface { Root() Ref; Node(Ref) (Node, error); Children(Ref) iter.Seq2[Ref, error]; WriteTo(context.Context, io.Writer) error }
func Parse(context.Context, io.ReaderAt, int64, Options) (Tree, diagnostic.Report, error)
func Apply(context.Context, Tree, PatchSet) (Tree, diagnostic.Report, error)
// model: State не является порядковым номером публикации.
type DocumentID [16]byte
type State struct { document DocumentID; root [16]byte }
type Ref struct { Document DocumentID; Node xmltree.NodeID }
type Rules struct { Profile string; Fingerprint string }
type Baseline struct { Origin Reader; Rules Rules }
type Offset uint64
type TextPoint struct { Paragraph Ref; Offset Offset; Edge Ref; Bias Bias }
type Anchor struct { Parent Ref; Before Ref }
type Position struct { State State; Kind PositionKind; Text TextPoint; Anchor Anchor }
type Range struct { Start Position; End Position }
type Value[T any] struct { V T; Set bool }
```
Операционные Limits принадлежат соответствующему пакету: общий finite-default/negative/overflow контракт, без глобального allocation manager. Source wrapper однократно Close, borrowed nil callback, допущенные reads завершаются; no partial lazy publish. Blob immutable, Open независим. Slices/maps входа копируются на ownership boundary; metadata views immutable. Trees/snapshots/display GC-only; callbacks trusted/concurrent-safe.

## 4. OPC/model/schema/edit
```go
// opc: все представления читают один part-table root.
type Part struct { URI, ContentType string }
type Relationship struct { ID, Type, Target string; Mode TargetMode }
type Reader interface {
    Parts() iter.Seq[Part]
    Part(context.Context, string) (resource.Blob, error)
    XML(context.Context, string) (xmltree.Tree, error)
    Relationships(context.Context, string) iter.Seq2[Relationship, error]
}
type Package interface { Reader; completedPackage() }
type Savepoint struct { owner, sequence uint64 }
type Draft interface {
    View() Reader
    Savepoint() Savepoint
    Restore(Savepoint) error
    Release(Savepoint) error
    PutPart(context.Context, string, string, io.ReaderAt, int64) error
    PatchXML(context.Context, string, xmltree.PatchSet) error
    DeletePart(context.Context, string) error
    SetRelationship(context.Context, string, Relationship) error
    DeleteRelationship(context.Context, string, string) error
    Freeze(context.Context) (Package, diagnostic.Report, error)
}
func New(context.Context, Options) (Draft, error)
func Begin(context.Context, Package) (Draft, error)
func Open(context.Context, resource.Source, Options) (Package, diagnostic.Report, error)
func Write(context.Context, io.Writer, Package, WriteOptions) (diagnostic.Report, error)
// model: views связаны с fixed root и frozen options.
type Reader interface {
    OPC() opc.Reader
    Options() Options
    Rules() Rules
    State() State
    Resolve(context.Context, Ref) (Element, error)
    Query(context.Context, Query) iter.Seq2[Element, error]
}
type Snapshot interface { Reader; Package() opc.Package; Baseline() Baseline }
type ElementHandler interface { Name() xmltree.QName; Fingerprint() string; Project(context.Context, Reader, Ref) (Element, error) }
func NewReader(opc.Reader, Options) (Reader, error)
func NewSnapshot(opc.Package, Options) (Snapshot, error)
func (p Paragraph) FindRanges(context.Context, string) ([]Range, error)
func (p Paragraph) Projection(context.Context) (TextProjection, error)
// schema: planner и полная проверка используют общие правила.
type Validator interface {
    Rules() model.Rules
    PlanProperty(context.Context, xmltree.Tree, xmltree.Ref, PropertyChange) (xmltree.PatchSet, diagnostic.Report, error)
    CheckCommit(context.Context, model.Reader, Delta) (diagnostic.Report, error)
    FullValidate(context.Context, model.Snapshot, Policy) (diagnostic.Report, error)
}
func NewValidator(Profile, []Extension) (Validator, error)
// edit: команды используют один атомарный frame.
type TextEdit struct { Range model.Range; Text string; Formatting ReplacementFormatting; Properties model.PropertyPatch }
type Command interface { Apply(context.Context, Draft) error }
type Draft interface {
    View() (model.Reader, error)
    Apply(context.Context, Command) error
    ApplyEdits(context.Context, model.State, []TextEdit) error
    Commit(context.Context) (model.Snapshot, diagnostic.Report, error)
    Rollback() error
}
type Store interface { Snapshot() model.Snapshot; Begin(context.Context) (Draft, error); Undo(context.Context) (model.Snapshot, error); Redo(context.Context) (model.Snapshot, error) }
func NewStore(context.Context, model.Snapshot, schema.Validator, Options) (Store, error)
```
Raw/typed command mutators у Draft используют один private opc.Draft; доступные операции соответствуют opc.Draft и семействам docx ниже, creation возвращает model.Ref. Сырой opc.Draft не публикуется наружу для обхода Apply/frame. Savepoint LIFO, Restore не отзывает old View; allocator не откатывается. Package завершённый/sealed, Reader может иметь local unresolved errors. Model.Options содержит Rules/Baseline/Elements и interpretation, не schema dependency.
State exact-root+interpretation, unique candidates, publication CAS отдельно. Positional/raw/merge проверяют exact State; append вычисляет позицию внутри builder без View. Validator.Rules сверяется до CheckCommit/FullValidate; один сервис grammar для property planner и private builder facts. FullValidate target вызывается ровно один раз в Save/Prepare; baseline сравнивается без повторного полного сканирования совпадающего root.

## 5. Простой API, style и merge
```go
// docx: Editor общий для point edits и группового Tx.
type Editor interface {
    AddParagraph(context.Context, string) (Paragraph, error)
    AddTable(context.Context, model.TableInput) (Table, error)
    AddSection(context.Context, model.SectionInput) (Section, error)
    InsertDocument(context.Context, model.Position, model.Snapshot, merge.Options) (diagnostic.Report, error)
}
type Document interface {
    Editor
    Snapshot() model.Snapshot
    Validator() schema.Validator
    Begin(context.Context) (Tx, error)
    Save(context.Context, io.Writer, SaveOptions) (diagnostic.Report, error)
    Undo(context.Context) (model.Snapshot, error)
    Redo(context.Context) (model.Snapshot, error)
}
type Tx interface { Editor; Draft() edit.Draft; Commit(context.Context) (model.Snapshot, diagnostic.Report, error); Rollback() error }
func WithValidator(schema.Validator) Option
func WithElements(...model.ElementHandler) Option
func New(context.Context, ...Option) (Document, error)
func Open(context.Context, resource.Source, ...Option) (Document, diagnostic.Report, error)
func (p Paragraph) AddRun(context.Context, string) (Run, error)
// style: Effective не раскрывает mutable property maps.
type Resolver interface { Resolve(context.Context, model.Ref, Context) (Effective, error) }
type Factory func(model.Reader) (Resolver, error)
func NewResolver(model.Reader, Options) (Resolver, error)
// merge: Plan одновременно immutable preview и atomic Command.
type Options struct { Profile Profile; Sections SectionPolicy; Numbering NumberingPolicy }
type Plan interface { edit.Command; Expected() model.State; Mappings() iter.Seq[Mapping]; Report() diagnostic.Report }
func Prepare(context.Context, model.Reader, model.Position, model.Snapshot, Options) (Plan, error)
```
| Docx handles / input vocabulary | Обязательная поверхность, общий edit owner |
|---|---|
| Paragraph/Run, PropertyPatch, ReplacementFormatting | Add/insert/split/delete/move/clone; FindRanges/ApplyEdits; Set/Clear properties |
| Table/Row/Cell, TableInput | Grid/widths/borders/alignment; rows/cell paragraphs; rectangular merge; invalid grid refusal |
| Image, Blob/bytes+MIME+extents | Inline insertion/replacement; media+rels+drawing IDs одним frame |
| Section/Header/Footer, SectionInput | Interval page geometry/break; first/odd/even content, explicit link-to-previous |
| ListDefinition/ListInstance/levels | Create definition/instance, assign paragraph, restart/continue; no mutable counters |
| Field/Bookmark | Parsed instruction/result, complete range/name, known reference rewrites |
| Footnote/Hyperlink | Note text/ID/separators, external rel/internal anchor, atomic delete |
| Document/Tx | Merge, raw mutations/batch via Draft commands, undo/redo |
Handles хранят owner+Ref, не cached XML/properties. Tx handle после завершения требует resolve через Document; read-only model views сохраняют old root. Merge target Reader может быть незавершённым Draft.View; Plan удерживает closure и roots; Apply отказ при stale State. Существующие архитектурные declarations деталей используются при разработке, новые публичные payload варианты требуют соответствующего сценария, не добавляются «на будущее».
Usage остаётся 10 строк с error handling по baseline §6: New → Begin → defer Rollback → bulk AddParagraph → Commit → Save → render.PDF(snapshot, Validator). Импорты простого API — `github.com/mesocyclon/xdos/docx`; PDF отдельно `github.com/mesocyclon/xdos/render`.

## 6. Font → semantic layout → immutable display → PDF
```go
// font: Face identity разделяют layout и writer.
type FaceID struct { Fingerprint string; Index uint32; Variations string }
type Scope struct { Embedded []Face }
type Face interface { ID() FaceID; Data() resource.Blob; Metrics() Metrics }
type ShapeInput struct { Paragraph string; Range ScalarRange; Script, Language string; Direction Direction; Features []Feature; Boundary ShapeBoundary }
type Glyph struct { ID uint32; AdvanceX, AdvanceY, OffsetX, OffsetY int64 }
type ShapedCluster struct { GlyphStart, GlyphEnd uint32; Source ScalarRange; UnsafeToBreak, UnsafeToConcat bool }
type GlyphSequence struct { Glyphs []Glyph; Clusters []ShapedCluster }
type GlyphSet []uint32
type EmbeddedFont struct { Data resource.Blob; GlyphIDs map[uint32]uint32 }
type Provider interface { Resolve(context.Context, Scope, Request) (Face, diagnostic.Report, error) }
type Shaper interface { Shape(context.Context, Face, ShapeInput) (GlyphSequence, error) }
type Subsetter interface { Subset(context.Context, Face, GlyphSet) (EmbeddedFont, error) }
func ParseFace(context.Context, resource.Blob, Options) (Face, error)
func NewProvider([]Face, Options) (Provider, error)
// model: FlowNode предоставляет только immutable семантику.
type Story struct { Root Ref; Kind StoryKind }
type FlowNode interface { Ref() Ref; Kind() FlowKind; Text() TextProjection; Geometry() FlowGeometry }
// layout: producer проверяет документ, engine проверяет геометрию.
type Config struct { Fingerprint string; ExactGeometry, EmergencyBreak bool }
type Input interface {
    State() model.State
    Config() Config
    Stories() iter.Seq[model.Story]
    Blocks(context.Context, model.Ref) iter.Seq2[model.FlowNode, error]
    Properties(context.Context, model.Ref, style.Context) (style.Effective, error)
    Font(context.Context, model.Ref, font.Request) (font.Face, diagnostic.Report, error)
    Image(model.Ref) (display.ImageResource, error)
}
type Engine interface { Layout(context.Context, Input, Limits) (display.Document, diagnostic.Report, error) }
type Hyphenator interface { Breaks(context.Context, string, string) ([]model.Offset, error); Fingerprint() string }
func NewEngine(font.Shaper, Hyphenator, Limits) (Engine, error)
// display: обход не копирует backing и не требует Close.
type Coord int64
type Point struct { X, Y Coord }
type Rect struct { Min, Max Point }
type PageBoxes struct { MediaBox, CropBox Rect }
type FontID string
type ImageID string
type PositionedGlyph struct { ID uint32; Position Point }
type UnicodeCluster struct { GlyphStart, GlyphEnd uint32; Text string }
type GlyphRun interface { Font() FontID; Size() Coord; Paint() Paint; Glyphs() iter.Seq[PositionedGlyph]; Clusters() iter.Seq[UnicodeCluster] }
type Page interface { Boxes() PageBoxes; Commands() iter.Seq[Command]; Annotations() iter.Seq[Annotation] }
type ImageResource struct { Width, Height uint32; BitsPerComponent uint8; Encoding ImageEncoding; ColorSpace ImageColorSpace; Data, Alpha resource.Blob }
type Document interface { Pages() iter.Seq[Page]; Font(FontID) (font.Face, error); Image(ImageID) (ImageResource, error) }
type Writer interface { Write(context.Context, io.Writer, Document) (diagnostic.Report, error) }
// pdf: writer не принимает ни XML, ни layout.Input.
func NewWriter(font.Subsetter, Options) (display.Writer, error)
// render/fonts: bundle подключается только через render.
func Provider(context.Context) (font.Provider, diagnostic.Report, error)
// render: единственная композиция стандартного экспорта.
type Components struct { Styles style.Factory; Fonts font.Provider; Elements []ElementAdapter }
type Options struct { Validator schema.Validator; Policy schema.Policy; Geometry layout.Config; Limits Limits; UnsupportedContent UnsupportedContentPolicy; OtherFields FieldPolicy; AllowCompatibilityApproximation bool }
type ElementAdapter interface { Namespaces() iter.Seq[string]; Fingerprint() string; Project(context.Context, model.Reader, model.Ref) (model.FlowNode, error) }
func Prepare(context.Context, model.Snapshot, Components, Options) (layout.Input, diagnostic.Report, error)
func Export(context.Context, io.Writer, model.Snapshot, Components, layout.Engine, display.Writer, Options) (diagnostic.Report, error)
func PDF(context.Context, io.Writer, model.Snapshot, Options) (diagnostic.Report, error)
```
Font ShapeInput paragraph context/range и clusters — scalar coordinates; advances/offsets signed 1/64 font unit. GlyphSequence/maps принадлежат caller как копии, display producer отделяет backing один раз и отдаёт повторяемые iter.Seq без deep copy. Display Coord=1/1000 pt, origin top-left/Y вниз; Command tagged payload включает source location/text/image/path/transform/clip/save/restore, save/restore balanced и geometry finite. Resource IDs локальны одному display.Document. ImageResource содержит checked 8-bit samples/JPEG + straight alpha, не PNG decoder input.
Flow vocabulary: paragraph/run/table/row/cell/image/section/field/note/link/destination; Geometry содержит grid/spans/widths, section intervals/effective headers, fields/dependencies, note anchors/separators, links/bookmarks/extents. Нет OPC handles. Story physical root и logical numbering scope различаются: scope policy spec §6.1, prepared labels/source map immutable; Layout не увеличивает счётчики при placement/passes.
Prepare вычисляет fingerprint policies/adapter/style/font, не доверяет входной строке; сначала rules/baseline match, затем один FullValidate и semantic/resource/compat preflight. Input выдаётся только при успехе. Export всегда Prepare→Layout→Write и объединяет reports; PDF выбирает qualified defaults и вызывает Export. Nil Validator допустим лишь при точном builtin rules/baseline match; certificate cache нет. Custom Input producer обязан гарантировать schema/OPC/integrity/visible/resources; engine только geometry/limits.

## 7. Test seams и правила изменений
| Граница | Независимое доказательство / negative |
|---|---|
| Source/Blob→OPC/XML | ReaderAt error/cancel/Close race; hostile ZIP/XML; exact untouched bytes; no partial lazy publish |
| Grammar→edit→public docx | Pinned regeneration; fast/full call counters; mismatched rules before validation; AA→BB, markers/gaps, ignored child error, CAS/undo/old snapshot |
| Store→merge→Save/Open | Stale plan, all conflict kinds, sections begin/middle/end/final, unknown closure, independent expected relationships/styles/bookmarks |
| Public bulk→builder | N scaling, no hidden View/reparse, retained roots separately; no production-only internal benchmark substitute |
| Resolver→prepared Input | Cascade contexts, basedOn/toggle/theme/cache invalidation; labels body/header-footer/footnotes and repeated placements |
| Font→manual display→Writer | Independent GSUB/GPOS/cluster/subset/rights/GID goldens; independent parser/extraction; invalid mapping failure |
| Custom Input→Engine | No DOCX setup; geometry/notes/fields/autofit convergence and impossible minima; no schema call |
| Custom display→Writer | No engine dependency; immutable twice-traversal allocation check, images/fonts/Unicode, streaming failure |
| Full render→frozen corpus | Exactly one FullValidate, no bytes before preflight/stability/embedding, Word geometry only qualified fonts/oracle, warnings/refusals separately |
| Import graph / change review | Actual direct imports+core closure; caller trace/root cause/public regression; each cross-boundary change explained |

Fakes используют существующие Source/Validator/Engine/Writer/Provider seams; дополнительные mock-framework/service abstractions не вводятся. Fixtures независимы от implementation planner/writer; fuzz/race не подменяют corpus fidelity. Каждая новая/изменённая функция в будущей реализации получает русский однострочный purpose comment ≤10 слов; нет implementation claims в этом документе.
