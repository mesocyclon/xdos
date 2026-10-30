# Открытый seed-корпус DOCX и независимые Word PDF

Дата проверки: **2026-10-30**. Это исследование для спецификации; реализация xdos, её runtime и fidelity не проверялись.

Сохранены **16 DOCX, 636 042 байт**, и **11 парных PDF**. Общий объём документов — **2 198 031 байт** (2,10 MiB). Полный реестр: [manifest.json](manifest.json), файлы: [corpus-seed/](corpus-seed/), лицензии и свидетельства происхождения: [sources/](sources/). Для каждого документа закреплены upstream commit, полный raw URL, SHA-256, размер, назначение и ограничения.

## Что здесь является эталоном

У десяти `docxide-pdf/case*/reference.pdf` обнаружена строка PDF metadata `/Creator(Microsoft Word)`. Это согласуется с [README закреплённой ревизии](https://github.com/sverrejb/docxide-pdf/blob/c2fa4fa461d987653dc717d7327096e57afb4686/README.md), описывающим Word for Mac 16.106.1+, и с [отдельным экспортным инструментом Word](https://github.com/sverrejb/docxide-pdf/blob/c2fa4fa461d987653dc717d7327096e57afb4686/tools/word_export.py). Генераторы исходных DOCX лежат рядом с каждым выбранным case; их копии сохранены как provenance, **не запускались**. Таким образом, это заранее созданные внешним renderer PDF, а не результаты xdos или конвертера docxide. Однако metadata и заявление upstream не являются криптографическим доказательством истории генерации.

**Полностью квалифицированных exact-geometry эталонов: 0.** В [CI upstream](https://github.com/sverrejb/docxide-pdf/blob/c2fa4fa461d987653dc717d7327096e57afb4686/.github/workflows/comparison.yml) шрифты приходят из приватного `sverrejb/docxide-pdf-assets`; точные версии, хеши и права на эти font binaries здесь не установлены. Список fontnames в manifest — декларации DOCX, включая неиспользуемые стили и fontTable, не итог font resolution. Дефолтные Liberation/Noto вместо Aptos/Calibri не делают геометрию точной.

`pdfinfo`, `pdftotext`, `pdffonts` на host не найдены, инструменты не устанавливались. Metadata извлечена ограниченным поиском строк по PDF bytes; полноценный независимый PDF parser, extraction, page count, bbox, raster и visual diff ещё не выполнены. Картинки side-by-side не загружались: основной сохранённый независимый артефакт — PDF. Девять пар пригодны для дальнейшей квалификации положительного v1 профиля; charts case29 — кандидат ожидаемого отказа PDF при сохранении XML roundtrip. Пять python-docx fixtures — структурные примеры, без Word PDF oracle.

## Отбор и лицензии

Отобраны малые синтетические fixtures с конкретными функциями. Для docxide исходный генератор показывает собственные тестовые строки/таблицы/данные, а [Apache-2.0 LICENSE](sources/docxide-pdf/LICENSE) закреплён и сохранён. Это сильнее одной лицензии на случайный репозиторий с чужими документами. Права на font programs внутри PDF требуют отдельной квалификации перед выделением или повторным использованием шрифтов.

У python-docx выбраны простые служебные test fixtures без изображений и внешнего заимствованного текста по выполненному XML осмотру; сохранена [MIT license](corpus-seed/python-docx/LICENSE). Лицензия репозитория и характер собственных тестов — основание отбора, отдельной лицензии внутри каждого DOCX нет. Это не заявление, что все файлы любого из репозиториев можно свободно перепубликовать. Юридической экспертизой исследование не является.

## Матрица фактически осмотренного seed

Числа — подсчёт XML элементов в stories, не прохождение сценариев. H/F — количество частей headers/footers; fields — число fldChar/fldSimple, не количество вычисленных полей. Списки — прямые numPr в stories; inherited numbering отдельно не разрешался. Все 16 документов Transitional, EN=true и RU=false. В части документов встречаются реальные элементы namespaces w14/w15, но независимый arbitrary unknown/MC stress case не отобран.

| Файл | Таблицы | numPr | H/F | Ссылки сносок | Изображения | Секции | Fields | Роль |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| [case11](corpus-seed/docxide-pdf/tests/fixtures/cases/case11/input.docx) | 0 | 0 | 2/2 | 0 | 0 | 1 | 4 | roundtrip + Word PDF candidate |
| [case14](corpus-seed/docxide-pdf/tests/fixtures/cases/case14/input.docx) | 0 | 0 | 0/0 | 0 | 0 | 1 | 0 | roundtrip + Word PDF candidate |
| [case15](corpus-seed/docxide-pdf/tests/fixtures/cases/case15/input.docx) | 5 | 0 | 0/0 | 0 | 0 | 1 | 0 | roundtrip + Word PDF candidate |
| [case18](corpus-seed/docxide-pdf/tests/fixtures/cases/case18/input.docx) | 0 | 0 | 0/0 | 6 | 0 | 1 | 0 | roundtrip + Word PDF candidate |
| [case19](corpus-seed/docxide-pdf/tests/fixtures/cases/case19/input.docx) | 0 | 12 | 0/0 | 0 | 0 | 1 | 0 | roundtrip + Word PDF candidate |
| [case20](corpus-seed/docxide-pdf/tests/fixtures/cases/case20/input.docx) | 0 | 32 | 0/0 | 0 | 0 | 1 | 0 | roundtrip + Word PDF candidate |
| [case25](corpus-seed/docxide-pdf/tests/fixtures/cases/case25/input.docx) | 0 | 0 | 0/0 | 0 | 0 | 4 | 0 | roundtrip + Word PDF candidate |
| [case26](corpus-seed/docxide-pdf/tests/fixtures/cases/case26/input.docx) | 0 | 0 | 0/0 | 0 | 0 | 4 | 0 | roundtrip + Word PDF candidate |
| [case28](corpus-seed/docxide-pdf/tests/fixtures/cases/case28/input.docx) | 0 | 0 | 1/3 | 0 | 0 | 3 | 10 | roundtrip + Word PDF candidate |
| [case29](corpus-seed/docxide-pdf/tests/fixtures/cases/case29/input.docx) | 0 | 0 | 0/0 | 0 | 0 | 1 | 0 | roundtrip + PDF refusal (4 charts) |
| [blk-inner-content.docx](corpus-seed/python-docx/tests/test_files/blk-inner-content.docx) | 1 | 0 | 0/0 | 0 | 0 | 1 | 0 | roundtrip |
| [sct-inner-content.docx](corpus-seed/python-docx/tests/test_files/sct-inner-content.docx) | 2 | 0 | 0/0 | 0 | 0 | 3 | 0 | roundtrip |
| [hdr-header-footer.docx](corpus-seed/python-docx/features/steps/test_files/hdr-header-footer.docx) | 0 | 0 | 3/3 | 0 | 0 | 2 | 0 | roundtrip |
| [num-having-numbering-part.docx](corpus-seed/python-docx/features/steps/test_files/num-having-numbering-part.docx) | 0 | 0 | 0/0 | 0 | 0 | 1 | 0 | roundtrip |
| [tbl-cell-props.docx](corpus-seed/python-docx/features/steps/test_files/tbl-cell-props.docx) | 1 | 0 | 0/0 | 0 | 0 | 1 | 0 | roundtrip |

| [Docx4j_GettingStarted](corpus-seed/docx4j/docs/Docx4j_GettingStarted.docx) | 15 | 222 | 0/1 | 4 | 1 | 3 | 291 | real authored documentation + FOP comparator candidate |

case11 — headers/footers/PAGE; case14 — external hyperlinks (не открывались); case15 — пять таблиц, включая merged cells; case18 — простые сноски; case19/20 — multilevel numbering; case25/26 — разные размеры и ориентации секций; case28 — несколько секций и поля в колонтитулах; case29 — диаграммы вне PDF v1. `num-having-numbering-part` содержит numbering part, но не даёт положительный пример видимого списка: прямых story numPr не найдено.

## Проверенные источники и неподтверждённые кандидаты

Количество ниже относится к файлам в полном Git tree закреплённой ревизии, **не** к проверенным эталонам, качеству или подходящим парам. Деревья получены через GitHub API без clone и без скачивания всего corpus; `truncated=false`.

| Источник | Commit | DOCX / PDF в tree | Решение |
|---|---|---:|---|
| [apache/poi](https://github.com/apache/poi/tree/17de566ac64dee14bc1c132b9b4972b9a21165b3) | `17de566ac64dee14bc1c132b9b4972b9a21165b3` | 182 / 1 | Расширение roundtrip/regressions; не скачан без проверки происхождения каждого документа |
| [microsoft/OfficeComprehensionBench](https://github.com/microsoft/OfficeComprehensionBench/tree/ce90d36916025d5a4a9c3794e422d10a30c0ae80) | `ce90d36916025d5a4a9c3794e422d10a30c0ae80` | 0 / 0 | Dataset расположен вне Git; не Word layout benchmark |
| [plutext/docx4j](https://github.com/plutext/docx4j/tree/4cc16a7c70f4ee7499260ae8bdeed0f7ac7e133b) | `4cc16a7c70f4ee7499260ae8bdeed0f7ac7e133b` | 623 / 169 | Добавлена 1 реальная docs-пара, PDF FOP; MC/numbering — metadata-only кандидаты |
| [python-openxml/python-docx](https://github.com/python-openxml/python-docx/tree/e45454602b53e8e572b179ccf1c91093ec9f4ed7) | `e45454602b53e8e572b179ccf1c91093ec9f4ed7` | 46 / 4 | 5 fixtures; PDF в ref — стандарты, не render goldens |
| [sverrejb/docxide-pdf](https://github.com/sverrejb/docxide-pdf/tree/c2fa4fa461d987653dc717d7327096e57afb4686) | `c2fa4fa461d987653dc717d7327096e57afb4686` | 1062 / 1064 | 10 синтетических пар отобрано; остальное не квалифицировано |
| [xberg-io/test_documents](https://github.com/xberg-io/test_documents/tree/fe07f80b1f185053b4e454781048e11783532ad1) | `fe07f80b1f185053b4e454781048e11783532ad1` | 0 / 0 | Лицензии по документам; в текущем tree бинарных DOCX/PDF нет |


- **Apache POI**: [test-data/document](https://github.com/apache/poi/tree/17de566ac64dee14bc1c132b9b4972b9a21165b3/test-data/document), [license](https://github.com/apache/poi/blob/17de566ac64dee14bc1c132b9b4972b9a21165b3/legal/LICENSE). Полезен для reader/roundtrip и старых регрессий. Имя crash/bug fixture и лицензия кода не доказывают разрешение на любое содержимое присланного документа; binary candidates не скачаны.
- **docx4j**: [numbering tests](https://github.com/plutext/docx4j/tree/4cc16a7c70f4ee7499260ae8bdeed0f7ac7e133b/docx4j-core-tests/src/test/java/org/docx4j/model/listnumbering), в частности `numbering-stories.docx`, и [2010 MC fixtures](https://github.com/plutext/docx4j/tree/4cc16a7c70f4ee7499260ae8bdeed0f7ac7e133b/docx4j-core-tests/src/test/resources/2010). `docs/Docx4j_GettingStarted.docx/.pdf` проверена ограниченным дозапросом ниже: скачана, PDF создан FOP и не признан Word oracle. MC/numbering binaries не скачаны.
- **LibreOffice**: [Writer OOXML regressions](https://github.com/LibreOffice/core/tree/master/sw/qa/extras/ooxmlexport/data) — дополнительный источник MC/section/layout regression и assertions. В этой ограниченной сессии дерево/commit/per-file license не закреплены, прямое web открытие каталога завершилось ошибкой; ни одного файла не скачано. LibreOffice-rendered PDF должен иметь отдельную метку renderer и не подменяет Word.
- **Xberg**: [LICENSES.md](https://github.com/xberg-io/test_documents/blob/fe07f80b1f185053b4e454781048e11783532ad1/LICENSES.md) прямо ограничивает MIT собственным tooling; сторонние документы сохраняют свои лицензии. [ATTRIBUTIONS.md](https://github.com/xberg-io/test_documents/blob/fe07f80b1f185053b4e454781048e11783532ad1/ATTRIBUTIONS.md) ведёт к per-document manifests. Не скачивать reference/research-only или неустановленные лицензии в публичный seed. В текущем Git tree нет `.docx/.pdf` blobs; это не означает отсутствия внешнего dataset.
- **OfficeComprehensionBench**: [download/conversion code](https://github.com/microsoft/OfficeComprehensionBench/blob/ce90d36916025d5a4a9c3794e422d10a30c0ae80/download_and_convert_files.py) создаёт Office из PDF через Adobe, иногда предварительно из HTML. Такие пары имеют обратное направление происхождения и не доказывают Word DOCX→PDF layout. Hugging Face subset и crawled content не скачивались.

## Незакрытые требования и следующий отбор

1. RU/EN в одном абзаце, combining marks, реальный RU документ: **0** в seed. Нужно сначала найти разрешённый текст и независимый Word export с pinned fonts; не объявлять EN корпуса достаточным.
2. **Синтетические изолированные image goldens: 0**. Реальная документация docx4j содержит 1 media part, но сопровождающий PDF создан FOP. case27 исключён из seed: генератор ссылается на фото, их исходные права не установлены. Следующий кандидат — собственные синтетические рисунки с открытым генератором и Word PDF.
3. Нумерация внутри headers и footnotes: **0 загруженных независимых goldens**. Найден конкретный upstream Word-probe test (дополнение ниже). Наличие отдельно списков и headers/sносок не равно этому сценарию; первым проверить docx4j numbering-stories и затем получить независимые Word goldens.
4. Strict, UTF-16, malformed OPC, hostile ZIP, unknown mandatory MC, namespace relocation, поля с изменённым cached result, merge conflicts: отдельные точечные cases, со своими positive/refusal assertions. Namespace inventory существующего DOCX не заменяет негативные fixture.
5. Перед приемкой PDF: разрешённые точные font binaries с hash/version/embedding permissions, независимый parser/extractor, fixed DPI rasterizer и manual visual qualification. Только после этого frozen positive/refusal denominators, geometry и визуальные пороги architecture §12. Текущие 16/11 не считаются прошедшими cases.

## Воспроизводимость и пределы проверки

`manifest.json` содержит immutable raw URLs и SHA-256. Future fetch: читать только перечисленные entries, лимит 2 MB на файл и 15 MB суммарно, timeout 25 s; сверять SHA-256 и byte count **до** замены локального файла. Не разрешать редирект к неутверждённому источнику и не fetch external relationships. Новые документы добавлять отдельным review: source commit, фактическая лицензия материала, генератор/origin, fonts, XML profile, независимый renderer, role. Непроверенные права — metadata-only candidate, без binary download/redistribution.

ZIP осмотр выполнен стандартной библиотекой Python: до 256 entries, до 20 MB expanded bytes на DOCX, до 5 MB на часть; duplicate/traversal, DTD/ENTITY отвергаются. XML прочитан без выполнения макросов или загрузки external rels. Проверены XML parseability и структурные признаки; OOXML XSD/conformance не проверялись. Собственный regex PDF metadata не считается независимым PDF parser. `verify-seed.py` перепроверяет целостность сохранённых bytes и документные лимиты без сети.

Библиотечный код, зависимости, Git, Docker, внешний renderer и генераторы upstream не запускались и не изменялись. Seed не закрывает release gate; главные риски — неизвестные точные шрифты и пока отсутствующие RU/images/story-numbering сценарии.


## Дополнение: реальная авторская документация и scope нумерации

В seed добавлена реальная, написанная для пользователей проекта [Docx4j_GettingStarted.docx](corpus-seed/docx4j/docs/Docx4j_GettingStarted.docx), 194086 байт, и [сопровождающий PDF](corpus-seed/docx4j/docs/Docx4j_GettingStarted.pdf), 546019 байт. Это авторская техническая документация проекта Plutext, не synthetic fixture. Закреплён commit `4cc16a7c70f4ee7499260ae8bdeed0f7ac7e133b`; сохранены upstream LICENSE и NOTICE. Основание включения — собственная документация лицензированного проекта; это не перенос лицензии на произвольный чужой пример. Один реальный документ не закрывает разнообразие реальных договоров, отчётов и русскоязычных документов R39.

В PDF прямо записаны **Creator и Producer: Apache FOP Version SVN**, CreationDate `20261022142747+11'00'`. Поэтому он **не Word oracle**. Соответствие точной версии DOCX данному PDF, шрифты и визуальная fidelity не доказаны. Он пригоден как независимый от xdos FOP comparator после квалификации, но не добавляет Word goldens. Word-пар по-прежнему 10; fully qualified exact Word geometry по-прежнему 0. DOCX содержит таблицы, списки, media и поля; структурные количества в manifest. Это полезная реальная комбинация функций, а не автоматически positive-v1 case (есть, например, TOC/сложные поля).

[NumberingStoriesTest.java, pinned](https://github.com/plutext/docx4j/blob/4cc16a7c70f4ee7499260ae8bdeed0f7ac7e133b/docx4j-core-tests/src/test/java/org/docx4j/model/listnumbering/NumberingStoriesTest.java) сохранён в sources/docx4j. Его явно лицензированный исходник содержит ссылки на Word probe P7 и golden от 2026-09-12. Проверки ожидают при одинаковом numId70: body 1–3, затем 4–6 после обхода других stories; header 1–3 и footer 4–6 используют **один** state; две обычные сноски внутри FootnotesPart продолжают 1–3 и 4–6. Endnotes, comments и text box имеют отдельные states. Это конкретное upstream ожидание, а не наша догадка об OOXML.

Сам Word golden для этого probe не просмотрен, `numbering-stories.docx` не загружен. Семантика linked headers, повторения на страницах и нескольких секций этим ограниченным чтением не установлена. **G03 нельзя фиксировать как счётчик на каждый XML part или каждую отдельную сноску** без квалификации: такой shortcut противоречил бы найденному upstream test. Следующий gate должен сверить эти exact assertions с независимым Word output и определить поведение повторяющихся headers; чужой unit test не равен нормативному доказательству.
