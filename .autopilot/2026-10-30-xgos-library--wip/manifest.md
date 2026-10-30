# Манифест требований

Источник: 2026-10-30-brief.md; подробные принятые границы — architecture-baseline.md. Все статусы пока open до брифинга и спецификации; ни одно требование не снято.

| ID | Из брифа (дословно) | Статус | Основание | Где |
|---|---|---|---|---|
| R01 | «manual deep» | open | Процесс: два согласования до разработки | будущая spec.md |
| R02 | «Да, готовим реализацию библиотеки по архитектуре» | open | Полный v1 по architecture-baseline.md, не только прототип | будущая spec.md |
| R03 | «для генерации Word-документов (.docx) с нуля» | open | docx.New и корректный минимальный OPC | будущая spec.md |
| R04 | «редактирования любых их частей» | open | Typed v1 и raw XML/binary части, preserving semantics | будущая spec.md |
| R05 | «вставки одного документа в другой» | open | Полный поддерживаемый merge с атомарным отказом | будущая spec.md |
| R06 | «экспорта в PDF без внешних программ» | open | Собственный layout/PDF, ограничения v1 явны | будущая spec.md |
| R07 | «без LibreOffice, headless-браузеров, cgo и т.п.» | open | Runtime pure Go без внешних конвертеров | будущая spec.md |
| R08 | «неизвестные элементы и атрибуты хранятся как есть» | open | Lexical DOM, QName/MC/unknown preservation | будущая spec.md |
| R09 | «записываются обратно без потерь» | open | No-op payload exact, local untouched spans preserved | будущая spec.md |
| R10 | «Слои и пакеты: OPC/ZIP» | open | Parts, relationships, content types и raw draft | будущая spec.md |
| R11 | «граф зависимостей (строго однонаправленный)» | open | CI запрет циклов и запрещённых imports | будущая spec.md |
| R12 | «доменный API» | open | Document/Section/Paragraph/Run/Table/List/Image/Header/Footer/Footnote/Field | будущая spec.md |
| R13 | «отдельный resolver» | open | Один property-specific cascade, basedOn/toggle/theme/table | будущая spec.md |
| R14 | «кэш вычисленных значений» | open | Bounded по exact State/context/config | будущая spec.md |
| R15 | «адресация узлов (стабильные ID/пути)» | open | NodeID/ref, State/root identity, paths exact state | будущая spec.md |
| R16 | «запросы и обход» | open | Reader/Query/Projection с единым source mapping | будущая spec.md |
| R17 | «транзакционные команды с undo/redo» | open | Builder/journal/seal, rollback/CAS/history | будущая spec.md |
| R18 | «валидация схемы OOXML» | open | Pinned XSD generation и общий planner/validator | будущая spec.md |
| R19 | «слияние styles, numbering, media» | open | Conflict matrix, dependency closure, preserve/adopt policies | будущая spec.md |
| R20 | «relationships и ID с разрешением конфликтов» | open | Scoped reuse/rename/remap; Plan exact target State | будущая spec.md |
| R21 | «сохранение разделов, колонтитулов, закладок и ссылок» | open | Interval splice/effective headers/parsed fields/bookmark ranges | будущая spec.md |
| R22 | «шрифты и метрики, subsetting» | open | Pinned candidate qualification, shaping context и subset отдельно | будущая spec.md |
| R23 | «переносы, разбиение на страницы» | open | Unicode breaks/graphemes/clusters, fixed-point pagination | будущая spec.md |
| R24 | «таблицы, колонтитулы, сноски, изображения» | open | PDF v1 матрица: simple notes/sections/fixed+autofit/images | будущая spec.md |
| R25 | «чтобы можно было подменить любую часть» | open | Prepared semantic Input и открытый immutable display/Writer | будущая spec.md |
| R26 | «какие возможности входят в v1, а какие нет» | open | Qualification profile, error/warning без silent drop | будущая spec.md |
| R27 | «горутины и errgroup» | open | Bounded workers, cancellation/join/deterministic results | будущая spec.md |
| R28 | «потоковая запись» | open | io.Writer ZIP/PDF, частичный output при I/O error явно | будущая spec.md |
| R29 | «sync.Pool» | open | Только scratch, не immutable published backing | будущая spec.md |
| R30 | «ленивая загрузка медиа» | open | Source lifetime, limits и loaded/lazy semantics | будущая spec.md |
| R31 | «контексты и отмена» | open | Cancellation atomicity и bounded loops | будущая spec.md |
| R32 | «неизменяемые снимки для безопасного чтения» | open | GC roots, old views survive edits, Source closed errors | будущая spec.md |
| R33 | «минимум аллокаций» | open | Bulk builder и no-copy display traversal benchmarks | будущая spec.md |
| R34 | «кастомные элементы, фильтры, шрифтовые провайдеры» | open | Per-instance handlers/Command filters/Provider без global registry | будущая spec.md |
| R35 | «опции конфигурации» | open | Обязательные dependencies явны, configs frozen | будущая spec.md |
| R36 | «чёткая модель ошибок» | open | Code/Location/Unwrap и Report/Coverage | будущая spec.md |
| R37 | «roundtrip docx→docx» | open | Byte и semantic fixtures, independent expectations | будущая spec.md |
| R38 | «golden-файлы» | open | Glyph/geometry/Unicode/visual pinned goldens | будущая spec.md |
| R39 | «корпус реальных документов» | open | До согласования не известен источник пользовательских эталонов | будущая spec.md |
| R40 | «fuzzing парсера» | open | Hostile ZIP/XML/font/ref cases, limits/race | будущая spec.md |
| R41 | «бенчмарки» | open | Public bulk/display scaling и resource measurements | будущая spec.md |
| R42 | «Расход памяти и вычислений должен быть обоснован» | open | Стоимость зависит от input/operation/retained roots, no RSS cap claim | будущая spec.md |
| R43 | «единая модель данных» | open | Один XML/OPC source, typed API и render не второй mutable DOM | будущая spec.md |
| R44 | «исправление общей причины без дублирования и частных обходов» | open | Общие grammar/commands/resolver/identity invariants | будущая spec.md |
| R45 | «Изменения внутри подсистемы должны затрагивать минимум несвязанного кода» | open | Consumers и boundaries согласованы | будущая spec.md |
| R46 | «Структура каталогов и Go-пакетов должна отражать ответственности подсистем» | open | Отдельный core DOCX и render composition root | будущая spec.md |
| R47 | «Добавить слой простого API» | open | Broad domain families, owner+Ref, grouped Tx основной | будущая spec.md |
| R48 | «очевидно что это не только 3 функции» | open | Text/table/image/section/header/list/field/note/link/merge families | будущая spec.md |
| R49 | «Close только у источников» | open | Sources/I/O streams caller-owned; snapshots без Close/Retain | будущая spec.md |
| R50 | «приблизительный autofit с предупреждением вместо отказа» | open | Bounded min/preferred/constraints/reflow solver; невозможное refusal | будущая spec.md |
| R51 | «Бандлить дефолтные шрифты» | open | Render-only assets, pinned provenance/licenses, no system heuristic | будущая spec.md |
| R52 | «Начать этапы со spike по subsetter и shaping» | open | Stage 0 independent glyph/subset/PDF/extraction evidence | будущая spec.md |
| R53 | «Ввести количественную метрику на корпусе» | open | H0/frozen denominator/positive/refusal/exact/approx profiles | будущая spec.md |
| R54 | «валидировать целиком на Save» | open | FullValidate+integrity fixed snapshot before bytes; acceptance policy отдельно | будущая spec.md |
| R55 | «при Commit — только быстрые инварианты» | open | Wellformed/OPC/delta/State/CAS с honest deferred refs, no reparse typed append | будущая spec.md |

| G01 | «инициируй в репозитоории https://github.com/mesocyclon/xdos» | open | Выбран module github.com/mesocyclon/xdos; проверить remote, не уничтожать историю | будущая spec.md |
| G02 | «найди качественные документы эталоны в интернете» | open | Найти/закрепить публичные fixtures и independent output oracles, проверить provenance/license | будущая spec.md |
| G03 | «поддерживаем» | open | В ответ на списки в headers/footers/simple footnotes: входят в PDF v1 | будущая spec.md |
| G04 | «Расход памяти и вычислений должен быть обоснован объёмом обрабатываемых данных и выполняемой операцией.» | open | Подтверждение R42: обязательная per-operation cost/limits/evidence матрица, публичные scaling benchmarks и retained-root accounting | будущая spec.md |
| G05 | «Структура каталогов и Go-пакетов должна отражать ответственности подсистем. Разбиение должно обеспечивать понятную навигацию и направленные зависимости; объединение и разделение кода должны быть обоснованы его связностью» | open | Подтверждение/уточнение R45–R46: owner/data/invariants/dependencies по пакетам; split/merge требует cohesion-based ADR, автоматический import check | будущая spec.md |
| G06 | «Понятные границы подсистем и зависимости, единая модель данных, исправление общей причины без дублирования и частных обходов. Изменения внутри подсистемы должны затрагивать минимум несвязанного кода.» | open | Подтверждение R43–R45: трассировка callers/root cause, одна реализация инварианта, regression на публичной границе, no parallel mutable model и no unrelated churn | будущая spec.md |

## Решения брифинга

- Путь Go-модуля: github.com/mesocyclon/xdos. Cwd остаётся /var/www/xgos; remote URL выбран пользователем.
- Источник PDF/Word эталонов: пользователь поручил найти качественные публичные документы и эталоны (R38–R39/R53, G02).
- Нумерованные списки в headers/footers/simple footnotes входят в v1; правила счётчиков и повторного размещения закрепить в спецификации (R23–R24, G03).
- H0 — гипотезы; ни один будущий metric threshold не объявлен пройденным.
