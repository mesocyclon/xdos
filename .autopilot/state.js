window.STATE =
{
  "version": 2,
  "slug": "xgos-library",
  "dir": "2026-10-30-xgos-library--wip",
  "title": "xdos — библиотека DOCX и PDF",
  "mode": "manual",
  "depth": "deep",
  "tier": null,
  "briefFile": "2026-10-30-brief.md",
  "memoryFile": "AGENTS.md",
  "memoryOwner": "autopilot",
  "skillDir": "/home/vortex/.codex/skills/autopilot",
  "baseCommit": null,
  "startedAt": "2026-10-30T21:12:58+05:00",
  "updatedAt": "2026-10-30T21:41:17+05:00",
  "finishedAt": null,
  "stages": [
    {
      "id": "preflight",
      "status": "done",
      "startedAt": "2026-10-30T21:12:58+05:00",
      "finishedAt": "2026-10-30T21:13:26+05:00"
    },
    {
      "id": "manifest",
      "status": "done",
      "startedAt": "2026-10-30T21:13:26+05:00",
      "finishedAt": "2026-10-30T21:17:14+05:00"
    },
    {
      "id": "briefing",
      "status": "done",
      "startedAt": "2026-10-30T21:17:14+05:00",
      "finishedAt": "2026-10-30T21:25:25+05:00"
    },
    {
      "id": "spec",
      "status": "active",
      "startedAt": "2026-10-30T21:25:25+05:00"
    },
    {
      "id": "plan",
      "status": "pending"
    },
    {
      "id": "build",
      "status": "pending"
    },
    {
      "id": "review",
      "status": "pending"
    },
    {
      "id": "final",
      "status": "pending"
    }
  ],
  "requirements": {
    "total": 61,
    "done": 0,
    "inTicket": 0,
    "inSpec": 61,
    "placeholder": 0,
    "deferred": 0,
    "dropped": 0
  },
  "tickets": [],
  "tests": null,
  "debt": {
    "placeholders": [],
    "assumptions": [],
    "emptyEnv": []
  },
  "additions": [],
  "coverage": {
    "found": 0,
    "fixed": 0,
    "deferred": 0,
    "items": []
  },
  "concerns": [
    "GitHub origin настроен; initial commit локально создан, HTTPS push не прошёл из-за отсутствующей авторизации VS Code credential socket. Секреты не запрашиваются; проверить существующий SSH доступ."
  ],
  "blind": null,
  "beats": [
    "2026-10-30T21:12:58+05:00",
    "2026-10-30T21:13:26+05:00",
    "2026-10-30T21:16:32+05:00",
    "2026-10-30T21:17:14+05:00",
    "2026-10-30T21:17:23+05:00",
    "2026-10-30T21:22:53+05:00",
    "2026-10-30T21:24:23+05:00",
    "2026-10-30T21:25:25+05:00",
    "2026-10-30T21:27:44+05:00",
    "2026-10-30T21:32:59+05:00",
    "2026-10-30T21:41:02+05:00",
    "2026-10-30T21:41:17+05:00"
  ],
  "rev": 14,
  "waiting": {
    "kind": "spec",
    "since": "2026-10-30T21:41:17+05:00",
    "note": "Спецификация полного xdos v1 и interfaces готовы; G2 PASS, 61 требование. Ожидается explicit согласование пользователя перед планом."
  },
  "waits": [
    {
      "kind": "briefing",
      "from": "2026-10-30T21:17:23+05:00",
      "to": "2026-10-30T21:22:53+05:00"
    }
  ],
  "log": [
    {
      "t": "2026-10-30T21:12:58+05:00",
      "k": "init"
    },
    {
      "t": "2026-10-30T21:13:26+05:00",
      "k": "stage",
      "id": "manifest",
      "act": "start"
    },
    {
      "t": "2026-10-30T21:17:14+05:00",
      "k": "stage",
      "id": "briefing",
      "act": "start"
    },
    {
      "t": "2026-10-30T21:17:23+05:00",
      "k": "ask",
      "kind": "briefing",
      "note": "Нужны ответы: путь Go-модуля, корпус и эталоны PDF, списки в дополнительных stories"
    },
    {
      "t": "2026-10-30T21:22:53+05:00",
      "k": "answered",
      "kind": "briefing"
    },
    {
      "t": "2026-10-30T21:25:25+05:00",
      "k": "gate",
      "g": "G1",
      "ok": false,
      "open": 58,
      "total": 58
    },
    {
      "t": "2026-10-30T21:25:25+05:00",
      "k": "stage",
      "id": "spec",
      "act": "start"
    },
    {
      "t": "2026-10-30T21:27:44+05:00",
      "k": "add",
      "key": "concerns",
      "n": 1
    },
    {
      "t": "2026-10-30T21:32:59+05:00",
      "k": "add",
      "key": "report",
      "n": 1
    },
    {
      "t": "2026-10-30T21:41:02+05:00",
      "k": "gate",
      "g": "G2",
      "ok": true,
      "found": 0,
      "fixed": 0,
      "deferred": 0
    },
    {
      "t": "2026-10-30T21:41:17+05:00",
      "k": "ask",
      "kind": "spec",
      "note": "Спецификация полного xdos v1 и interfaces готовы; G2 PASS, 61 требование. Ожидается explicit согласование пользователя перед планом."
    }
  ],
  "reqList": [
    {
      "id": "R01",
      "text": "«manual deep»",
      "status": "in-spec"
    },
    {
      "id": "R02",
      "text": "«Да, готовим реализацию библиотеки по архитектуре»",
      "status": "in-spec"
    },
    {
      "id": "R03",
      "text": "«для генерации Word-документов (.docx) с нуля»",
      "status": "in-spec"
    },
    {
      "id": "R04",
      "text": "«редактирования любых их частей»",
      "status": "in-spec"
    },
    {
      "id": "R05",
      "text": "«вставки одного документа в другой»",
      "status": "in-spec"
    },
    {
      "id": "R06",
      "text": "«экспорта в PDF без внешних программ»",
      "status": "in-spec"
    },
    {
      "id": "R07",
      "text": "«без LibreOffice, headless-браузеров, cgo и т.п.»",
      "status": "in-spec"
    },
    {
      "id": "R08",
      "text": "«неизвестные элементы и атрибуты хранятся как есть»",
      "status": "in-spec"
    },
    {
      "id": "R09",
      "text": "«записываются обратно без потерь»",
      "status": "in-spec"
    },
    {
      "id": "R10",
      "text": "«Слои и пакеты: OPC/ZIP»",
      "status": "in-spec"
    },
    {
      "id": "R11",
      "text": "«граф зависимостей (строго однонаправленный)»",
      "status": "in-spec"
    },
    {
      "id": "R12",
      "text": "«доменный API»",
      "status": "in-spec"
    },
    {
      "id": "R13",
      "text": "«отдельный resolver»",
      "status": "in-spec"
    },
    {
      "id": "R14",
      "text": "«кэш вычисленных значений»",
      "status": "in-spec"
    },
    {
      "id": "R15",
      "text": "«адресация узлов (стабильные ID/пути)»",
      "status": "in-spec"
    },
    {
      "id": "R16",
      "text": "«запросы и обход»",
      "status": "in-spec"
    },
    {
      "id": "R17",
      "text": "«транзакционные команды с undo/redo»",
      "status": "in-spec"
    },
    {
      "id": "R18",
      "text": "«валидация схемы OOXML»",
      "status": "in-spec"
    },
    {
      "id": "R19",
      "text": "«слияние styles, numbering, media»",
      "status": "in-spec"
    },
    {
      "id": "R20",
      "text": "«relationships и ID с разрешением конфликтов»",
      "status": "in-spec"
    },
    {
      "id": "R21",
      "text": "«сохранение разделов, колонтитулов, закладок и ссылок»",
      "status": "in-spec"
    },
    {
      "id": "R22",
      "text": "«шрифты и метрики, subsetting»",
      "status": "in-spec"
    },
    {
      "id": "R23",
      "text": "«переносы, разбиение на страницы»",
      "status": "in-spec"
    },
    {
      "id": "R24",
      "text": "«таблицы, колонтитулы, сноски, изображения»",
      "status": "in-spec"
    },
    {
      "id": "R25",
      "text": "«чтобы можно было подменить любую часть»",
      "status": "in-spec"
    },
    {
      "id": "R26",
      "text": "«какие возможности входят в v1, а какие нет»",
      "status": "in-spec"
    },
    {
      "id": "R27",
      "text": "«горутины и errgroup»",
      "status": "in-spec"
    },
    {
      "id": "R28",
      "text": "«потоковая запись»",
      "status": "in-spec"
    },
    {
      "id": "R29",
      "text": "«sync.Pool»",
      "status": "in-spec"
    },
    {
      "id": "R30",
      "text": "«ленивая загрузка медиа»",
      "status": "in-spec"
    },
    {
      "id": "R31",
      "text": "«контексты и отмена»",
      "status": "in-spec"
    },
    {
      "id": "R32",
      "text": "«неизменяемые снимки для безопасного чтения»",
      "status": "in-spec"
    },
    {
      "id": "R33",
      "text": "«минимум аллокаций»",
      "status": "in-spec"
    },
    {
      "id": "R34",
      "text": "«кастомные элементы, фильтры, шрифтовые провайдеры»",
      "status": "in-spec"
    },
    {
      "id": "R35",
      "text": "«опции конфигурации»",
      "status": "in-spec"
    },
    {
      "id": "R36",
      "text": "«чёткая модель ошибок»",
      "status": "in-spec"
    },
    {
      "id": "R37",
      "text": "«roundtrip docx→docx»",
      "status": "in-spec"
    },
    {
      "id": "R38",
      "text": "«golden-файлы»",
      "status": "in-spec"
    },
    {
      "id": "R39",
      "text": "«корпус реальных документов»",
      "status": "in-spec"
    },
    {
      "id": "R40",
      "text": "«fuzzing парсера»",
      "status": "in-spec"
    },
    {
      "id": "R41",
      "text": "«бенчмарки»",
      "status": "in-spec"
    },
    {
      "id": "R42",
      "text": "«Расход памяти и вычислений должен быть обоснован»",
      "status": "in-spec"
    },
    {
      "id": "R43",
      "text": "«единая модель данных»",
      "status": "in-spec"
    },
    {
      "id": "R44",
      "text": "«исправление общей причины без дублирования и частных обходов»",
      "status": "in-spec"
    },
    {
      "id": "R45",
      "text": "«Изменения внутри подсистемы должны затрагивать минимум несвязанного кода»",
      "status": "in-spec"
    },
    {
      "id": "R46",
      "text": "«Структура каталогов и Go-пакетов должна отражать ответственности подсистем»",
      "status": "in-spec"
    },
    {
      "id": "R47",
      "text": "«Добавить слой простого API»",
      "status": "in-spec"
    },
    {
      "id": "R48",
      "text": "«очевидно что это не только 3 функции»",
      "status": "in-spec"
    },
    {
      "id": "R49",
      "text": "«Close только у источников»",
      "status": "in-spec"
    },
    {
      "id": "R50",
      "text": "«приблизительный autofit с предупреждением вместо отказа»",
      "status": "in-spec"
    },
    {
      "id": "R51",
      "text": "«Бандлить дефолтные шрифты»",
      "status": "in-spec"
    },
    {
      "id": "R52",
      "text": "«Начать этапы со spike по subsetter и shaping»",
      "status": "in-spec"
    },
    {
      "id": "R53",
      "text": "«Ввести количественную метрику на корпусе»",
      "status": "in-spec"
    },
    {
      "id": "R54",
      "text": "«валидировать целиком на Save»",
      "status": "in-spec"
    },
    {
      "id": "R55",
      "text": "«при Commit — только быстрые инварианты»",
      "status": "in-spec"
    },
    {
      "id": "G01",
      "text": "«инициируй в репозитоории https://github.com/mesocyclon/xdos»",
      "status": "in-spec"
    },
    {
      "id": "G02",
      "text": "«найди качественные документы эталоны в интернете»",
      "status": "in-spec"
    },
    {
      "id": "G03",
      "text": "«поддерживаем»",
      "status": "in-spec"
    },
    {
      "id": "G04",
      "text": "«Расход памяти и вычислений должен быть обоснован объёмом обрабатываемых данных и выполняемой операцией.»",
      "status": "in-spec"
    },
    {
      "id": "G05",
      "text": "«Структура каталогов и Go-пакетов должна отражать ответственности подсистем. Разбиение должно обеспечивать понятную навигацию и направленные зависимости; объединение и разделение кода должны быть обоснованы его связностью»",
      "status": "in-spec"
    },
    {
      "id": "G06",
      "text": "«Понятные границы подсистем и зависимости, единая модель данных, исправление общей причины без дублирования и частных обходов. Изменения внутри подсистемы должны затрагивать минимум несвязанного кода.»",
      "status": "in-spec"
    }
  ],
  "gates": {
    "G1": {
      "ok": false,
      "at": "2026-10-30T21:25:25+05:00",
      "open": 58,
      "total": 58
    },
    "G2": {
      "ok": true,
      "at": "2026-10-30T21:41:02+05:00",
      "found": 0,
      "fixed": 0,
      "deferred": 0
    }
  },
  "result": null,
  "report": [
    "GitHub origin/main подтверждён: eb9787993f9367004d691f0c7ed387e50fb95492 совпадает с local main; начальная публикация пользователем выполнена, прежняя запись о неудачном push относится к более ранней попытке."
  ]
}
