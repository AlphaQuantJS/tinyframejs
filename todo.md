## Структура проекта 

tinyframejs/
├── src/
│   ├── primitives/          # Базовые структуры данных и утилиты
│   │   ├── createFrame.js   # Создание структуры TinyFrame
│   │   ├── types.js         # Типы данных и интерфейсы
│   │   ├── validators.js    # Валидаторы входных данных
│   │   └── index.js         # Экспорты
│   │
│   ├── computation/         # Вычислительные функции
│   │   ├── corr.js          # Корреляция
│   │   ├── normalize.js     # Нормализация
│   │   ├── zscore.js        # Z-преобразование
│   │   ├── describe/        # Описательная статистика
│   │   │   ├── calculateQuantile.js
│   │   │   ├── describe.js
│   │   │   └── index.js
│   │   └── index.js         # Экспорты
│   │
│   ├── methods/             # Методы для работы с данными
│   │   ├── aggregation/     # Функции агрегации
│   │   │   ├── count.js     # Подсчет непустых значений
│   │   │   ├── groupByAgg.js
│   │   │   ├── mean.js      # Среднее значение
│   │   │   └── index.js     # Экспорты
│   │   │
│   │   ├── filtering/       # Функции фильтрации
│   │   │   ├── dropNaN.js   # Удаление строк с NaN
│   │   │   ├── fillNaN.js   # Заполнение NaN значений
│   │   │   ├── duplicated/  # Функции работы с дубликатами
│   │   │   │   ├── dropDuplicates.js
│   │   │   │   └── index.js
│   │   │   └── index.js     # Экспорты
│   │   │
│   │   ├── sorting/         # Сортировка
│   │   │   ├── sortValues.js
│   │   │   └── index.js     # Экспорты
│   │   │
│   │   ├── transform/       # Функции трансформации
│   │   │   ├── diff.js
│   │   │   ├── cumsum.js
│   │   │   └── index.js     # Экспорты
│   │   │
│   │   └── index.js         # Общий экспорт методов
│   │
│   ├── window/              # Скользящие окна
│   │   ├── rolling/         # Обычные скользящие окна
│   │   │   ├── rollingMean.js
│   │   │   └── index.js
│   │   └── index.js         # Экспорты
│   │
│   ├── display/             # Вывод данных (новый модуль)
│   │   ├── console/         # Для консоли
│   │   │   ├── table.js
│   │   │   └── index.js
│   │   ├── web/             # Для веб/Jupyter
│   │   │   ├── html.js
│   │   │   ├── jupyter.js
│   │   │   └── index.js
│   │   └── index.js         # Экспорты
│   │
│   ├── utils/               # Общие утилиты
│   │   ├── array.js         # Работа с массивами
│   │   ├── date.js          # Работа с датами
│   │   ├── hash.js          # Хеш-функции
│   │   └── index.js         # Экспорты
│   │
│   ├── DataFrame.js         # Основной класс с цепочечным API
│   ├── types.js             # Общие типы для всего проекта
│   └── index.js             # Главный экспорт библиотеки
│
├── test/                    # Тесты
│   ├── unit/                # Модульные тесты
│   │   ├── primitives/
│   │   ├── computation/
│   │   ├── methods/
│   │   └── DataFrame.test.js
│   ├── integration/         # Интеграционные тесты
│   └── fixtures/            # Тестовые данные
│
├── benchmarks/              # Бенчмарки
│   ├── corr.bench.js
│   ├── rollingMean.bench.js
│   └── runner.js            # Запуск всех бенчмарков
│
├── examples/                # Примеры использования
│   ├── basic.js
│   ├── financial.js
│   └── jupyter.js
│
├── docs/                    # Документация
│   ├── api/
│   ├── tutorials/
│   └── performance.md
│
├── scripts/                 # Скрипты для сборки, публикации и т.д.
│   ├── build.js
│   └── publish.js
│
├── .github/                 # GitHub-специфичные файлы
│   └── workflows/
│       └── ci.yml           # CI/CD конфигурация
│
├── .husky/                  # Хуки Git
│   ├── pre-commit
│   └── commit-msg
│
├── package.json             # Манифест npm
├── tsconfig.json            # Конфигурация TypeScript
├── vitest.config.js         # Конфигурация Vitest
├── .eslintrc.js             # Конфигурация ESLint
├── .prettierrc              # Конфигурация Prettier
├── README.md                # Документация
├── CHANGELOG.md             # История изменений
└── LICENSE                  # Лицензия MIT