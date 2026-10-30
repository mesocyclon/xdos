# Подготовка: проверенные факты

- Рабочий каталог: /var/www/xgos.
- Перед началом на диске был только architecture.md; активного Autopilot state, кода, go.mod и Git не было.
- Архитектура: 549 строк, SHA-256 5d3eba60a89dacd814f644648b5f18be0a2834a4ce1c75c91d7cb16d769c3d13. Скопирована в architecture-baseline.md без изменений.
- Создан локальный Git без commit/remote/push. Созданы .gitignore, AGENTS.md и CLAUDE.md pointer.
- Autopilot 2.2.0, manual/deep; наличие обновления 2.2.1 сообщено, обновление не выполнено.
- Dashboard поднят ap.py на http://localhost:34493/dashboard.html; автоматического browser opener в среде нет.
- Host: go version go1.27.3 linux/amd64; Python 3.12.3; git 2.43.0. Совместимость реализации с минимальной Go 1.23 ещё не проверялась — реализации нет.
- Docker/Compose конфигурации проекта нет. Docker не запускался, окружения и volumes не создавались/не удалялись.
- Требования: 55 исходных строк manifest.md; разбиение на проверяемые acceptance stories предстоит в спецификации. Никакое требование не удалено.
- Подтверждён переход к реализации. Module path, корпус/эталоны и numbering дополнительных stories ждут ответа.

Обновление после ответов: module github.com/mesocyclon/xdos, default branch main; public remote пуст, origin подключён. Пользователь поручил найти публичные эталоны и поддержать списки headers/footers/simple footnotes. Локальный baseline commit 470434e создан (architecture/.gitignore/AGENTS/CLAUDE). HTTPS push отвергнут из-за недоступной авторизации VS Code; SSH с ключами хоста из HTTPS GitHub Meta API прошёл host verification, но authentication publickey отвергнута. Изменений remote нет. GitHub token/key в чат не запрашивались, helper/config секретов не читались. Дальнейший push требует локальной настройки доступа пользователем.

Позднее пользователь сообщил «запушилось все». Проверено ls-remote: GitHub HEAD/main = eb9787993f9367004d691f0c7ed387e50fb95492, совпадает с локальным main (commit «comm 1» над 470434e). Начальная публикация завершена пользователем. Последующие spec/corpus изменения остаются отдельными рабочими изменениями; чужой commit не переписывается.

Результаты read-only команд не являются тестами будущей библиотеки. Код библиотеки, XSD/font assets, зависимости и go.mod не создавались. Следующий этап — завершить брифинг, подготовить spec/interfaces, пройти независимое покрытие G2, показать спецификацию пользователю. Без её явного согласования не переходить к плану; без согласования плана не начинать разработку.
