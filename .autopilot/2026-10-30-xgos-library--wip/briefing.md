# Брифинг и проверка исходных рисков

## Установленные факты

- Пользователь подтвердил: «Да, готовим реализацию библиотеки по архитектуре».
- Cwd /var/www/xgos. На старте только architecture.md, без кода/go.mod/Git/state.js.
- Точная архитектура закреплена в architecture-baseline.md, hash в brief.
- Режим manual, глубина deep; обязательны согласования спецификации и плана.
- Архитектурный профиль v1: оба OOXML vocabulary, полный поддерживаемый merge, LTR RU/EN PDF, glyph/subset qualification, approximate autofit, bundled fonts, full output validation. Это не обещание произвольного Word rendering.

## Проверка идеи до спецификации

| Вопрос | Риск | Действие |
|---|---|---|
| Почему готовой библиотекой могут не пользоваться? | Публичный API неудобен и corpus не соответствует документам пользователя | Bulk/examples в приёмке; выбрать источник корпуса до фиксации процентов |
| Какие требования сталкиваются? | Lossless arbitrary DOCX vs ограниченный PDF; GC snapshots vs закрытый lazy source | Сохранять разделение preservation/conformance/renderability и Source policy, не сужать DOCX до PDF subset |
| Что пока не доказано? | Нужное покрытие shaper/subsetter, лицензии/воспроизводимость assets/XSD, независимые visual goldens | Stage 0 обязателен, pins только после проверки, отсутствие эталона не считать PASS |
| Где основная стоимость? | Layout/pagination и schema/merge semantics, а не facade | Реализация по зависимостям с негативными fixtures; не объявлять короткий spike библиотекой |
| Чего нет для приёмки? | Пользовательского корпуса, Word PDF/визуальных эталонов и module path | Короткий раунд решений пользователя; секреты не нужны |
| Что сломается при росте? | O(n²) append, удержание GC roots, repeated preflight/display копии | Публичные scaling/retention/no-copy benchmarks из §12 и контроль ownership |
| Второй пользователь/актор? | Потребитель Go API и читатель полученного документа имеют разные критерии | API/API-errors проверять отдельно от DOCX validity и visual PDF |

## Полученные решения

1. Пользователь выбрал https://github.com/mesocyclon/xdos; module github.com/mesocyclon/xdos. GitHub API/ls-remote подтверждают пустой публичный репозиторий, default branch main. На входе нет чужих commits/files.
2. Пользователь поручил найти качественные документы и эталоны в интернете. Отбор выполняется в research/corpus-report.md; реальные источники/права/pins отдельно от acceptance. Нет произвольного обещания exact Word fidelity.
3. Пользователь подтвердил поддержку списков в headers/footers/simple footnotes. Спецификация обязана закрыть исходный main-story-only пробел: вычисление один раз для поддерживаемых stories, повторное размещение не меняет номера; order/counter scope/qualified fixtures явны.

## Дальнейшие разрешённые действия

Ответы получены. G1: все исходные требования остаются live, не сняты; неизвестных пользовательских решений для спецификации нет. Pins/квалификация корпуса/шрифтов являются технической работой и обязательствами этапа 0, не выдуманными готовыми результатами. Далее spec.md/interfaces.md, независимое G2 покрытие и показ спецификации целиком. Код библиотеки до manual spec/plan gates не писать.
