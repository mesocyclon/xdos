# Самопроверка спецификации для G2

Изменены только spec.md, interfaces.md и этот файл. architecture.md/AGENTS.md/manifest/state не менялись; реализации, установки инструментов, Git и Docker операций исполнитель не делал.

| IDs | Где закреплена приёмка/контракт |
|---|---|
| R01–R02, G01 | spec §1, §2, §2.1; процесс manual/full v1/module |
| R03–R04, R08–R10, R12, R15–R17, R32, R43, R47–R49 | spec §2–§3, interfaces §3–§5; typed/raw/identity/atomicity/lifetime |
| R18, R54–R55 | spec §4, interfaces §4; shared rules, fast Commit, full Save |
| R13–R14 | spec §4, interfaces §5; resolver/cascade/cache |
| R05, R19–R21 | spec §5, interfaces §5; полный merge conflict matrix |
| R06–R07, R22–R26, R50–R52 | spec §6, §9, interfaces §6; pure Go/font/layout/display/PDF |
| G03 | spec §6.1, interfaces §6–§7; logical scopes/body/header-footer/footnotes, repeated placement |
| R27–R31, R33, R41–R42, G04 | spec §2.1, §7–§8; concurrency/cost/limits/retained/bench |
| R34–R36 | spec §4, interfaces §3–§6; per-instance extensions/config/error |
| R37–R40, R53, G02 | spec §8, interfaces §7; corpus/oracles/fuzz/qualification |
| R11, R44–R46, G05–G06 | spec §7, interfaces §1–§2 и §7; owners/DAG/cohesion/root-cause/caller-impact |

Самопроверка: все 61 base IDs R01–R55/G01–G06 присутствуют в acceptance rows §2; deep матрица §2.1 покрывает восемь измерений сгруппированных требований. Fence balance и размеры: spec 153 строки, interfaces 276 строк. Это проверка текста, не runtime/golden/fidelity/performance.

Уточнение после исследования: первоначальное per-part/per-note считывание удалено. G03 отличает physical parts от logical counter scopes; body независим, headers+footers общий scope, footnotes общий scope. Default order обхода сформулирован явно и не назван Word-exact. Pinned docx4j upstream assertions дают основание для технического контракта; независимые Word fixtures/repeated placements остаются обязательным gate Stage 0 до acceptance, поддержку не снимают.

Корпус актуализирован до 16 DOCX+11 PDF: 10 Word pairs, 5 structural, 1 реальная docs-пара с FOP PDF. Qualified exact Word geometry = 0; private fonts/independent parser/raster/RU/story-numbering gaps указаны. Merge cost учитывает target indexes/scans/materialization, не обещает только O(source closure).

Независимый G2 должен читать только brief и spec, не этот mapping/manifest. Полный runtime, минимальный Go toolchain, dependency pins, реальные font/subset/visual gates ещё не выполнены; spec обозначает будущую приёмку.
