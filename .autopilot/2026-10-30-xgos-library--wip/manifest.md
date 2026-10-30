# Манифест требований

Источник: 2026-10-30-brief.md; подробные принятые границы — architecture-baseline.md. Все 61 требования отражены в спецификации для manual-согласования; ни одно не снято. Реализация не начата.

| ID | Из брифа (дословно) | Статус | Основание | Где |
|---|---|---|---|---|
| R01 | «manual deep» | in-spec | Процесс: два согласования до разработки | spec.md §1–2; interfaces.md |
| R02 | «Да, готовим реализацию библиотеки по архитектуре» | in-spec | Полный v1 по architecture-baseline.md, не только прототип | spec.md §1–2; interfaces.md |
| R03 | «для генерации Word-документов (.docx) с нуля» | in-spec | docx.New и корректный минимальный OPC | spec.md §2–3; interfaces.md |
| R04 | «редактирования любых их частей» | in-spec | Typed v1 и raw XML/binary части, preserving semantics | spec.md §2–3; interfaces.md |
| R05 | «вставки одного документа в другой» | in-spec | Полный поддерживаемый merge с атомарным отказом | spec.md §5; interfaces.md |
| R06 | «экспорта в PDF без внешних программ» | in-spec | Собственный layout/PDF, ограничения v1 явны | spec.md §6, §9; interfaces.md |
| R07 | «без LibreOffice, headless-браузеров, cgo и т.п.» | in-spec | Runtime pure Go без внешних конвертеров | spec.md §6, §9; interfaces.md |
| R08 | «неизвестные элементы и атрибуты хранятся как есть» | in-spec | Lexical DOM, QName/MC/unknown preservation | spec.md §2–3; interfaces.md |
| R09 | «записываются обратно без потерь» | in-spec | No-op payload exact, local untouched spans preserved | spec.md §2–3; interfaces.md |
| R10 | «Слои и пакеты: OPC/ZIP» | in-spec | Parts, relationships, content types и raw draft | spec.md §2–3; interfaces.md |
| R11 | «граф зависимостей (строго однонаправленный)» | in-spec | CI запрет циклов и запрещённых imports | spec.md §7; interfaces.md |
| R12 | «доменный API» | in-spec | Document/Section/Paragraph/Run/Table/List/Image/Header/Footer/Footnote/Field | spec.md §2–3; interfaces.md |
| R13 | «отдельный resolver» | in-spec | Один property-specific cascade, basedOn/toggle/theme/table | spec.md §4; interfaces.md |
| R14 | «кэш вычисленных значений» | in-spec | Bounded по exact State/context/config | spec.md §4; interfaces.md |
| R15 | «адресация узлов (стабильные ID/пути)» | in-spec | NodeID/ref, State/root identity, paths exact state | spec.md §2–3; interfaces.md |
| R16 | «запросы и обход» | in-spec | Reader/Query/Projection с единым source mapping | spec.md §2–3; interfaces.md |
| R17 | «транзакционные команды с undo/redo» | in-spec | Builder/journal/seal, rollback/CAS/history | spec.md §2–3; interfaces.md |
| R18 | «валидация схемы OOXML» | in-spec | Pinned XSD generation и общий planner/validator | spec.md §4; interfaces.md |
| R19 | «слияние styles, numbering, media» | in-spec | Conflict matrix, dependency closure, preserve/adopt policies | spec.md §5; interfaces.md |
| R20 | «relationships и ID с разрешением конфликтов» | in-spec | Scoped reuse/rename/remap; Plan exact target State | spec.md §5; interfaces.md |
| R21 | «сохранение разделов, колонтитулов, закладок и ссылок» | in-spec | Interval splice/effective headers/parsed fields/bookmark ranges | spec.md §5; interfaces.md |
| R22 | «шрифты и метрики, subsetting» | in-spec | Pinned candidate qualification, shaping context и subset отдельно | spec.md §6, §9; interfaces.md |
| R23 | «переносы, разбиение на страницы» | in-spec | Unicode breaks/graphemes/clusters, fixed-point pagination | spec.md §6, §9; interfaces.md |
| R24 | «таблицы, колонтитулы, сноски, изображения» | in-spec | PDF v1 матрица: simple notes/sections/fixed+autofit/images | spec.md §6, §9; interfaces.md |
| R25 | «чтобы можно было подменить любую часть» | in-spec | Prepared semantic Input и открытый immutable display/Writer | spec.md §6, §9; interfaces.md |
| R26 | «какие возможности входят в v1, а какие нет» | in-spec | Qualification profile, error/warning без silent drop | spec.md §6, §9; interfaces.md |
| R27 | «горутины и errgroup» | in-spec | Bounded workers, cancellation/join/deterministic results | spec.md §7–8; interfaces.md |
| R28 | «потоковая запись» | in-spec | io.Writer ZIP/PDF, частичный output при I/O error явно | spec.md §7–8; interfaces.md |
| R29 | «sync.Pool» | in-spec | Только scratch, не immutable published backing | spec.md §7–8; interfaces.md |
| R30 | «ленивая загрузка медиа» | in-spec | Source lifetime, limits и loaded/lazy semantics | spec.md §7–8; interfaces.md |
| R31 | «контексты и отмена» | in-spec | Cancellation atomicity и bounded loops | spec.md §7–8; interfaces.md |
| R32 | «неизменяемые снимки для безопасного чтения» | in-spec | GC roots, old views survive edits, Source closed errors | spec.md §2–3; interfaces.md |
| R33 | «минимум аллокаций» | in-spec | Bulk builder и no-copy display traversal benchmarks | spec.md §7–8; interfaces.md |
| R34 | «кастомные элементы, фильтры, шрифтовые провайдеры» | in-spec | Per-instance handlers/Command filters/Provider без global registry | spec.md §4; interfaces.md |
| R35 | «опции конфигурации» | in-spec | Обязательные dependencies явны, configs frozen | spec.md §4; interfaces.md |
| R36 | «чёткая модель ошибок» | in-spec | Code/Location/Unwrap и Report/Coverage | spec.md §4; interfaces.md |
| R37 | «roundtrip docx→docx» | in-spec | Byte и semantic fixtures, independent expectations | spec.md §8; interfaces.md |
| R38 | «golden-файлы» | in-spec | Glyph/geometry/Unicode/visual pinned goldens | spec.md §8; interfaces.md |
| R39 | «корпус реальных документов» | in-spec | До согласования не известен источник пользовательских эталонов | spec.md §8; interfaces.md |
| R40 | «fuzzing парсера» | in-spec | Hostile ZIP/XML/font/ref cases, limits/race | spec.md §8; interfaces.md |
| R41 | «бенчмарки» | in-spec | Public bulk/display scaling и resource measurements | spec.md §7–8; interfaces.md |
| R42 | «Расход памяти и вычислений должен быть обоснован» | in-spec | Стоимость зависит от input/operation/retained roots, no RSS cap claim | spec.md §7–8; interfaces.md |
| R43 | «единая модель данных» | in-spec | Один XML/OPC source, typed API и render не второй mutable DOM | spec.md §2–3; interfaces.md |
| R44 | «исправление общей причины без дублирования и частных обходов» | in-spec | Общие grammar/commands/resolver/identity invariants | spec.md §7; interfaces.md |
| R45 | «Изменения внутри подсистемы должны затрагивать минимум несвязанного кода» | in-spec | Consumers и boundaries согласованы | spec.md §7; interfaces.md |
| R46 | «Структура каталогов и Go-пакетов должна отражать ответственности подсистем» | in-spec | Отдельный core DOCX и render composition root | spec.md §7; interfaces.md |
| R47 | «Добавить слой простого API» | in-spec | Broad domain families, owner+Ref, grouped Tx основной | spec.md §2–3; interfaces.md |
| R48 | «очевидно что это не только 3 функции» | in-spec | Text/table/image/section/header/list/field/note/link/merge families | spec.md §2–3; interfaces.md |
| R49 | «Close только у источников» | in-spec | Sources/I/O streams caller-owned; snapshots без Close/Retain | spec.md §2–3; interfaces.md |
| R50 | «приблизительный autofit с предупреждением вместо отказа» | in-spec | Bounded min/preferred/constraints/reflow solver; невозможное refusal | spec.md §6, §9; interfaces.md |
| R51 | «Бандлить дефолтные шрифты» | in-spec | Render-only assets, pinned provenance/licenses, no system heuristic | spec.md §6, §9; interfaces.md |
| R52 | «Начать этапы со spike по subsetter и shaping» | in-spec | Stage 0 independent glyph/subset/PDF/extraction evidence | spec.md §6, §9; interfaces.md |
| R53 | «Ввести количественную метрику на корпусе» | in-spec | H0/frozen denominator/positive/refusal/exact/approx profiles | spec.md §8; interfaces.md |
| R54 | «валидировать целиком на Save» | in-spec | FullValidate+integrity fixed snapshot before bytes; acceptance policy отдельно | spec.md §4; interfaces.md |
| R55 | «при Commit — только быстрые инварианты» | in-spec | Wellformed/OPC/delta/State/CAS с honest deferred refs, no reparse typed append | spec.md §4; interfaces.md |
| G01 | «инициируй в репозитоории https://github.com/mesocyclon/xdos» | in-spec | Выбран module github.com/mesocyclon/xdos; проверить remote, не уничтожать историю | spec.md §1–2; interfaces.md |
| G02 | «найди качественные документы эталоны в интернете» | in-spec | Найти/закрепить публичные fixtures и independent output oracles, проверить provenance/license | spec.md §8; interfaces.md |
| G03 | «поддерживаем» | in-spec | В ответ на списки в headers/footers/simple footnotes: входят в PDF v1 | spec.md §6.1; interfaces.md |
| G04 | «Расход памяти и вычислений должен быть обоснован объёмом обрабатываемых данных и выполняемой операцией.» | in-spec | Подтверждение R42: обязательная per-operation cost/limits/evidence матрица, публичные scaling benchmarks и retained-root accounting | spec.md §7–8; interfaces.md |
| G05 | «Структура каталогов и Go-пакетов должна отражать ответственности подсистем. Разбиение должно обеспечивать понятную навигацию и направленные зависимости; объединение и разделение кода должны быть обоснованы его связностью» | in-spec | Подтверждение/уточнение R45–R46: owner/data/invariants/dependencies по пакетам; split/merge требует cohesion-based ADR, автоматический import check | spec.md §7; interfaces.md |
| G06 | «Понятные границы подсистем и зависимости, единая модель данных, исправление общей причины без дублирования и частных обходов. Изменения внутри подсистемы должны затрагивать минимум несвязанного кода.» | in-spec | Подтверждение R43–R45: трассировка callers/root cause, одна реализация инварианта, regression на публичной границе, no parallel mutable model и no unrelated churn | spec.md §7; interfaces.md |

## Решения брифинга

- Путь Go-модуля: github.com/mesocyclon/xdos. Cwd остаётся /var/www/xgos; remote URL выбран пользователем.
- Источник PDF/Word эталонов: пользователь поручил найти качественные публичные документы и эталоны (R38–R39/R53, G02).
- Нумерованные списки в headers/footers/simple footnotes входят в v1; правила счётчиков и повторного размещения закрепить в спецификации (R23–R24, G03).
- H0 — гипотезы; ни один будущий metric threshold не объявлен пройденным.
