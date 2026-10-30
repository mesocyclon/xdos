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
  "updatedAt": "2026-10-30T21:27:44+05:00",
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
    "inSpec": 0,
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
  "coverage": null,
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
    "2026-10-30T21:27:44+05:00"
  ],
  "rev": 10,
  "waiting": null,
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
    }
  ],
  "reqList": [
    {
      "id": "R01",
      "text": "«manual deep»",
      "status": "open"
    },
    {
      "id": "R02",
      "text": "«Да, готовим реализацию библиотеки по архитектуре»",
      "status": "open"
    },
    {
      "id": "R03",
      "text": "«для генерации Word-документов (.docx) с нуля»",
      "status": "open"
    },
    {
      "id": "R04",
      "text": "«редактирования любых их частей»",
      "status": "open"
    },
    {
      "id": "R05",
      "text": "«вставки одного документа в другой»",
      "status": "open"
    },
    {
      "id": "R06",
      "text": "«экспорта в PDF без внешних программ»",
      "status": "open"
    },
    {
      "id": "R07",
      "text": "«без LibreOffice, headless-браузеров, cgo и т.п.»",
      "status": "open"
    },
    {
      "id": "R08",
      "text": "«неизвестные элементы и атрибуты хранятся как есть»",
      "status": "open"
    },
    {
      "id": "R09",
      "text": "«записываются обратно без потерь»",
      "status": "open"
    },
    {
      "id": "R10",
      "text": "«Слои и пакеты: OPC/ZIP»",
      "status": "open"
    },
    {
      "id": "R11",
      "text": "«граф зависимостей (строго однонаправленный)»",
      "status": "open"
    },
    {
      "id": "R12",
      "text": "«доменный API»",
      "status": "open"
    },
    {
      "id": "R13",
      "text": "«отдельный resolver»",
      "status": "open"
    },
    {
      "id": "R14",
      "text": "«кэш вычисленных значений»",
      "status": "open"
    },
    {
      "id": "R15",
      "text": "«адресация узлов (стабильные ID/пути)»",
      "status": "open"
    },
    {
      "id": "R16",
      "text": "«запросы и обход»",
      "status": "open"
    },
    {
      "id": "R17",
      "text": "«транзакционные команды с undo/redo»",
      "status": "open"
    },
    {
      "id": "R18",
      "text": "«валидация схемы OOXML»",
      "status": "open"
    },
    {
      "id": "R19",
      "text": "«слияние styles, numbering, media»",
      "status": "open"
    },
    {
      "id": "R20",
      "text": "«relationships и ID с разрешением конфликтов»",
      "status": "open"
    },
    {
      "id": "R21",
      "text": "«сохранение разделов, колонтитулов, закладок и ссылок»",
      "status": "open"
    },
    {
      "id": "R22",
      "text": "«шрифты и метрики, subsetting»",
      "status": "open"
    },
    {
      "id": "R23",
      "text": "«переносы, разбиение на страницы»",
      "status": "open"
    },
    {
      "id": "R24",
      "text": "«таблицы, колонтитулы, сноски, изображения»",
      "status": "open"
    },
    {
      "id": "R25",
      "text": "«чтобы можно было подменить любую часть»",
      "status": "open"
    },
    {
      "id": "R26",
      "text": "«какие возможности входят в v1, а какие нет»",
      "status": "open"
    },
    {
      "id": "R27",
      "text": "«горутины и errgroup»",
      "status": "open"
    },
    {
      "id": "R28",
      "text": "«потоковая запись»",
      "status": "open"
    },
    {
      "id": "R29",
      "text": "«sync.Pool»",
      "status": "open"
    },
    {
      "id": "R30",
      "text": "«ленивая загрузка медиа»",
      "status": "open"
    },
    {
      "id": "R31",
      "text": "«контексты и отмена»",
      "status": "open"
    },
    {
      "id": "R32",
      "text": "«неизменяемые снимки для безопасного чтения»",
      "status": "open"
    },
    {
      "id": "R33",
      "text": "«минимум аллокаций»",
      "status": "open"
    },
    {
      "id": "R34",
      "text": "«кастомные элементы, фильтры, шрифтовые провайдеры»",
      "status": "open"
    },
    {
      "id": "R35",
      "text": "«опции конфигурации»",
      "status": "open"
    },
    {
      "id": "R36",
      "text": "«чёткая модель ошибок»",
      "status": "open"
    },
    {
      "id": "R37",
      "text": "«roundtrip docx→docx»",
      "status": "open"
    },
    {
      "id": "R38",
      "text": "«golden-файлы»",
      "status": "open"
    },
    {
      "id": "R39",
      "text": "«корпус реальных документов»",
      "status": "open"
    },
    {
      "id": "R40",
      "text": "«fuzzing парсера»",
      "status": "open"
    },
    {
      "id": "R41",
      "text": "«бенчмарки»",
      "status": "open"
    },
    {
      "id": "R42",
      "text": "«Расход памяти и вычислений должен быть обоснован»",
      "status": "open"
    },
    {
      "id": "R43",
      "text": "«единая модель данных»",
      "status": "open"
    },
    {
      "id": "R44",
      "text": "«исправление общей причины без дублирования и частных обходов»",
      "status": "open"
    },
    {
      "id": "R45",
      "text": "«Изменения внутри подсистемы должны затрагивать минимум несвязанного кода»",
      "status": "open"
    },
    {
      "id": "R46",
      "text": "«Структура каталогов и Go-пакетов должна отражать ответственности подсистем»",
      "status": "open"
    },
    {
      "id": "R47",
      "text": "«Добавить слой простого API»",
      "status": "open"
    },
    {
      "id": "R48",
      "text": "«очевидно что это не только 3 функции»",
      "status": "open"
    },
    {
      "id": "R49",
      "text": "«Close только у источников»",
      "status": "open"
    },
    {
      "id": "R50",
      "text": "«приблизительный autofit с предупреждением вместо отказа»",
      "status": "open"
    },
    {
      "id": "R51",
      "text": "«Бандлить дефолтные шрифты»",
      "status": "open"
    },
    {
      "id": "R52",
      "text": "«Начать этапы со spike по subsetter и shaping»",
      "status": "open"
    },
    {
      "id": "R53",
      "text": "«Ввести количественную метрику на корпусе»",
      "status": "open"
    },
    {
      "id": "R54",
      "text": "«валидировать целиком на Save»",
      "status": "open"
    },
    {
      "id": "R55",
      "text": "«при Commit — только быстрые инварианты»",
      "status": "open"
    },
    {
      "id": "G01",
      "text": "«инициируй в репозитоории https://github.com/mesocyclon/xdos»",
      "status": "open"
    },
    {
      "id": "G02",
      "text": "«найди качественные документы эталоны в интернете»",
      "status": "open"
    },
    {
      "id": "G03",
      "text": "«поддерживаем»",
      "status": "open"
    },
    {
      "id": "G04",
      "text": "«Расход памяти и вычислений должен быть обоснован объёмом обрабатываемых данных и выполняемой операцией.»",
      "status": "open"
    },
    {
      "id": "G05",
      "text": "«Структура каталогов и Go-пакетов должна отражать ответственности подсистем. Разбиение должно обеспечивать понятную навигацию и направленные зависимости; объединение и разделение кода должны быть обоснованы его связностью»",
      "status": "open"
    },
    {
      "id": "G06",
      "text": "«Понятные границы подсистем и зависимости, единая модель данных, исправление общей причины без дублирования и частных обходов. Изменения внутри подсистемы должны затрагивать минимум несвязанного кода.»",
      "status": "open"
    }
  ],
  "gates": {
    "G1": {
      "ok": false,
      "at": "2026-10-30T21:25:25+05:00",
      "open": 58,
      "total": 58
    }
  },
  "result": null
}
