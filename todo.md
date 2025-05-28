## 📦 Структура проекта tinyframejs (актуализировано)

tinyframejs/
├── src/
│   ├── core/                  # Базовые структуры данных и утилиты
│   │   ├── DataFrame.js       # ✅ ← импортирует methods/autoExtend.js
│   │   ├── StreamingFrame.js
│   │   ├── LazyPipeline.js
│   │   ├── createFrame.js       # Создание структуры TinyFrame
│   │   ├── types.js             # Типы данных и интерфейсы
│   │   ├── validators.js        # Валидаторы входных данных
│   │   └── index.js             # Экспорты
│   │
│   ├── io/                     # Модуль ввода-вывода
│   │   ├── readers/            # Чтение из разных источников
│   │   │   ├── csv.js          # Чтение CSV
│   │   │   ├── tsv.js          # Чтение TSV
│   │   │   ├── excel.js        # Чтение XLSX/XLS
│   │   │   ├── json.js         # Чтение JSON
│   │   │   ├── sql.js          # Чтение из SQL
│   │   │   ├── api/            # Чтение из API
│   │   │   │   ├── common.js   # Общие функции для API
│   │   │   │   ├── crypto.js   # API криптобирж
│   │   │   │   ├── stocks.js   # API фондовых бирж
│   │   │   │   └── index.js
│   │   │   └── index.js
│   │   ├── writers/            # Запись в разные форматы
│   │   │   ├── csv.js          # Запись в CSV
│   │   │   ├── excel.js        # Запись в XLSX
│   │   │   ├── json.js         # Запись в JSON
│   │   │   └── index.js
│   │   ├── parsers/            # Парсеры для разных форматов
│   │   │   ├── dateParser.js   # Парсинг дат
│   │   │   ├── numberParser.js # Парсинг чисел
│   │   │   └── index.js
│   │   ├── transformers/       # Преобразование "сырых" данных в tinyFrame
│   │   │   ├── jsonToFrame.js
│   │   │   ├── arrayToFrame.js
│   │   │   ├── apiToFrame.js
│   │   │   └── index.js
│   │   └── index.js            # Общий экспорт IO-функций
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
│   │   │   ├── mean.js      # Среднее значение
│   │   │   ├── sum.js       # Суммирование
│   │   │   ├── min.js       # Минимум
│   │   │   ├── max.js       # Максимум
│   │   │   └── ...          # Другие атомарные функции
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
│   │   │   ├── assign.js      # Добавление новых колонок
│   │   │   ├── mutate.js      # Изменение существующих колонок
│   │   │   ├── apply.js       # Применение функций к колонкам
│   │   │   ├── categorize.js  # Создание категориальных колонок
│   │   │   ├── cut.js         # Создание категориальных колонок с настройками
│   │   │   ├── oneHot.js      # One-hot кодирование категориальных колонок
│   │   │   ├── diff.js
│   │   │   ├── cumsum.js
│   │   │   └── index.js     # Экспорты
│   │   │
│   │   ├── raw.js           # Агрегатор (фасад) ← собирает все методы
│   │   ├── inject.js        # Централизованная инъекция ← инъекция зависимостей
│   │   ├── autoExtend.js    # Авторасширение DataFrame ← навешивает методы на DataFrame
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
│   ├── viz/                 # Модуль визуализации данных
│   │   ├── index.js         # Основной экспорт
│   │   ├── adapters/        # Адаптеры для разных библиотек
│   │   │   ├── chartjs.js   # Адаптер для Chart.js
│   │   │   ├── plotly.js    # Адаптер для Plotly.js
│   │   │   └── d3.js        # Адаптер для D3.js
│   │   ├── renderers/       # Рендереры для разных сред
│   │   │   ├── browser.js   # Рендерер для браузера
│   │   │   └── node.js      # Рендерер для Node.js
│   │   ├── types/           # Типы графиков
│   │   │   ├── line.js      # Линейный график
│   │   │   ├── bar.js       # Столбчатая диаграмма
│   │   │   ├── scatter.js   # Точечная диаграмма
│   │   │   └── pie.js       # Круговая диаграмма
│   │   ├── utils/           # Вспомогательные функции
│   │   │   ├── colors.js    # Работа с цветами
│   │   │   ├── scales.js    # Масштабирование данных
│   │   │   └── formatting.js # Форматирование меток
│   │   └── extend.js        # Расширение DataFrame методами визуализации
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

-------------------------
-------------------------
-------------------------
-------------------------

# TinyFrameJS Обновлённая архитектура (после autoExtend, StreamingFrame и централизованной инъекции зависимостей)

---

## 🌍 Текущая схема архитектуры (обновлённая)

```mermaid
graph TD
    A[loader.js] --> B[autoExtend.js ⭐️ нов.] 
    B --> C[DataFrame.prototype + методы]
    C --> D[Пользовательский код]
    D --> E[df.sort().dropNaN().head().count()]
    A --> R[IO-модуль (readXlsx, readCsv)] --> T[transformers/*ToFrame]
    T --> F[TinyFrame] --> DF[DataFrame]
```

**Поток:**

- `loader.js` импортирует `autoExtend.js` один раз при старте.
- `autoExtend.js` вешает все методы (`sort`, `dropNaN`, `count` и т.д.) на `DataFrame.prototype`.
- Чтение через `readXxx()` → трансформация в `TinyFrame` → оборачивание в `new DataFrame()` ✅
- Пользователь использует fluent API сразу без дополнительных действий.

---

## ✅ Последовательность реализации новой архитектуры

1. Создать `methods/aggregation/methods/*.js` — каждый метод как отдельный модуль: `count.js`, `sort.js`, `dropNaN.js`, и т.д.
2. Создать `methods/aggregation/raw.js` — экспорт всех методов в одном месте.
3. Создать `methods/aggregation/inject.js` — централизованная инъекция зависимостей (`validateColumn`, `logger`, и т.д.).
4. Написать `methods/aggregation/autoExtend.js` — подключает методы к `DataFrame.prototype`.
5. Обновить `src/loader.js`, вставив `import './methods/aggregation/autoExtend.js'` для инициализации.
6. Обновить все `readers/*.js` — чтобы возвращали `new DataFrame(...)` из `core/DataFrame.js`.
7. (опц.) Создать `StreamingFrame.js` для построчной / чанковой обработки больших данных.
8. (опц.) Добавить `LazyPipeline.js` для поддержки отложенных цепочек `.pipe()`.

---

## 📦 Дополнительная структура для централизованной инъекции

```bash
methods/
  raw.js            # ⭐️ Все методы
  inject.js         # ⭐️ Инъекция зависимостей в методы
  autoExtend.js     # ⭐️ Авторасширение DataFrame
  aggregation/
    primitives/
      count.js
      mean.js
      sum.js
      min.js
      max.js
```

---

## 🔄 Выявленные точки улучшения

| Текущее состояние                                               | Предлагаемое улучшение                 | Почему                      |
| --------------------------------------------------------------- | -------------------------------------- | --------------------------- |
| DataFrame обертывает TinyFrame, но открывает сырьевую структуру | Скрыть внутреннюю структуру (геттеры)  | Улучшенная инкапсуляция     |
| Клонирование в каждом методе                                    | Ленивая оценка / батч-мутации          | Снижение нагрузки на память |
| Загрузка всех данных сразу                                      | StreamingFrame с обработкой чанками ⭐️ | Обработка 10M+ строк        |
| Сразу исполняются все методы                                    | Ленивая пипелайн-обработка ⭐️          | Создание сложных воркфлоу   |
| Тесная связь TinyFrame и DataFrame                              | Явное разделение core/API              | Легче развивать             |

---



## 🧱 Базовый стек ядра TinyFrameJS

| Компонент              | Назначение                                                                |
|------------------------|---------------------------------------------------------------------------|
| `createFrame.js`        | Создание структуры TinyFrame из строк/колонок/других фреймов               |
| `DataFrame.create()`    | Обёртка вокруг `createFrame`, сразу возвращает DataFrame с методами       |
| `DataFrame.js`          | Класс-обёртка над TinyFrame с базовым API (`columns`, `rowCount`, `toArray`) |
| `autoExtend.js`         | Автоматическое подключение всех методов к `DataFrame.prototype`           |
| `inject.js`             | Централизованная инъекция зависимостей в методы                           |
| `raw.js`                | Экспорт всех методов агрегации и трансформаций в одном месте               |
| `readers/*.js`          | Источники данных, возвращающие `DataFrame.create(...)`                    |

---

## ⚙️ Что должно быть реализовано прямо в `DataFrame`

| Метод / Свойство | Назначение                                                       | Почему в DataFrame    |
|------------------|------------------------------------------------------------------|------------------------|
| `.columns`       | Возвращает список всех колонок                                   | Метаданные             |
| `.rowCount`      | Возвращает количество строк                                       | Быстрая навигация      |
| `.toArray()`     | Преобразует весь фрейм в массив объектов                         | Часто нужен экспорт    |
| `.frame`         | Безопасный доступ к внутреннему TinyFrame                        | Низкоуров. доступ      |
| `static .create()`| Создаёт DataFrame из любых входных данных                       | Инкапсуляция логики    |

Эти элементы являются **частью ядра DataFrame**, и не подлежат внешнему расширению.  
Они аналогичны свойствам `.shape`, `.columns`, `.to_numpy()` в Pandas.

---

## ⚙️ Статический метод: `DataFrame.create()`

Чтобы упростить работу с фреймами и убрать явный импорт `createFrame`, мы добавляем в `DataFrame.js` следующее:

```js
import { createFrame } from './createFrame.js'

export class DataFrame {
  static create(input, options) {
    const tiny = createFrame(input, options)
    return new DataFrame(tiny)
  }
  ... // остальные методы
}
```

Теперь ты можешь писать:
```js
import { DataFrame } from 'core/DataFrame.js'

const df = DataFrame.create(rows)
```

---

## 🔁 Цепочка данных: от сырых данных до API

```mermaid
graph TD
    input[Входные данные: CSV, JSON, API] --> reader[reader.js]
    reader --> createFrame(createFrame.js)
    createFrame --> tf[TinyFrame (plain object)]
    tf --> df[DataFrame (обёртка)]
    df --> auto[autoExtend подключает методы]
    auto --> user[Пользователь вызывает: df.sort().dropNaN().head().count()]
```

## 📐 Как писать методы для DataFrame

> Все методы (агрегация и трансформации) оформляются как каррированные функции с зависимостями.

### ✅ Шаблон сигнатуры метода
```js
export const mean = ({ validateColumn }) => (frame, column) => {
  validateColumn(frame, column)
  const data = frame.columns[column]
  return data.reduce((a, b) => a + b, 0) / data.length
}
```

### ✅ Где разместить:
- `methods/aggregation/methods/mean.js` — исходный файл метода
- `methods/raw.js` — `export { mean } from './aggregation/methods/mean.js'`
- `methods/inject.js` — подключит `mean()` через `fn(deps)`
- `methods/autoExtend.js` — навесит метод на `DataFrame.prototype`

### ✅ Правила именования:
| Часть            | Стандарт          |
|------------------|-------------------|
| Имя файла         | `mean.js`         |
| Имя функции       | `export const mean` |
| Аргументы         | `({ validateColumn }) => (frame, column)` |

### ✅ Тесты:
- `test/methods/aggregation/methods/mean.test.js`
- Используют `DataFrame.create()` и `.mean()` напрямую

---

## 🧊 Пометки:

- Все новые файлы учтены и их создание запланировано ✅
- Централизованная инъекция упрощает тестирование и поддержку ✅
- Возможность подключить StreamingFrame и LazyPipeline в будущем без изменений существующей логики ✅

---

---

## 🌍 Текущая схема архитектуры (обновлённая)

```mermaid
graph TD
    A[loader.js] --> B[autoExtend.js ⭐️ нов.] 
    B --> C[DataFrame.prototype + методы]
    C --> D[Пользовательский код]
    D --> E[df.sort().dropNaN().head().count()]
    A --> R[IO-модуль (readXlsx, readCsv)] --> T[transformers/*ToFrame]
    T --> F[TinyFrame] --> DF[DataFrame]
```

**Поток:**

- `loader.js` импортирует `autoExtend.js` один раз при старте
- `autoExtend.js` вешает все методы (`sort`, `dropNaN`, `count` и т.д.) на `DataFrame.prototype`
- Чтение через `readXxx()` → трансформация → `new DataFrame()` ✅
- Пользователь использует fluent API сразу

---

## ✅ Последовательность реализации новой архитектуры

1. Создаем `raw.js` для сбора всех чистых функций-методов
2. Добавляем `inject.js` для иньекции `validateColumn` в агрегаторы
3. Пишем `autoExtend.js` — перебираем импорты и вешаем на `DataFrame.prototype`
4. В `loader.js` пишем: `import './methods/autoExtend.js'`
5. Обновляем все `readers/` — чтобы возвращали `new DataFrame(data)` ✅
6. (опц.) Реализуем `StreamingFrame` для чанковой обработки
7. (опц.) Добавляем `LazyPipeline` API

---

## 🔄 Выявленные точки улучшения

| Текущее состояние                                               | Предлагаемое улучшение                 | Почему                      |
| --------------------------------------------------------------- | -------------------------------------- | --------------------------- |
| DataFrame обертывает TinyFrame, но открывает сырьевую структуру | Скрыть внутреннюю структуру (геттеры)  | Улучшенная инкапсуляция     |
| Клонирование в каждом методе                                    | Ленивая оценка / батч-мутации          | Снижение нагрузки на память |
| Загрузка всех данных сразу                                      | StreamingFrame с обработкой чанками ⭐️ | Обработка 10M+ строк        |
| Сразу исполняются все методы                                    | Ленивая пипелайн-обработка ⭐️          | Создание сложных воркфлоу   |
| Тесная связь TinyFrame и DataFrame                              | Явное разделение core/API              | Легче развивать             |

---

## 🧰 Ответ на вопрос:

> Где мы реализуем `new DataFrame(...)`?

✅ Во всех `readers/*.js` (например, `readCsv.js`, `readXlsx.js`) мы должны **вставить**:

```js
import { DataFrame } from '../../frame/DataFrame.js'
...
return new DataFrame(tinyFrameLikeObject)
```

Итог: **readers работают на выход только в форме DataFrame**, а тот, в свою очередь, уже внутренне хранит `TinyFrame`.

---

## 🧊 Пометки:

- Новые файлы все учтены ✅
- Общая схема включает `loader.js`, `autoExtend.js`, `StreamingFrame.js`
- `StreamingFrame.js` и `LazyPipeline.js` еще могут быть реализованы позже

---


# ✨ Как правильно это сделать

## 1. Убираем деление на "примитивы" и "методы"

➡ Всё считается **методами**, которые можно применять к `DataFrame`.

Типы методов:

| Тип | Примеры | Что возвращают |
|----|----------|----------------|
| Трансформирующие | `sort`, `dropNaN`, `head` | `new DataFrame` |
| Агрегирующие | `count`, `mean`, `sum`, `min`, `max` | `number`, `array`, `scalar`, etc |

---

## 2. Структура папок

```bash
methods/
  aggregation/
    methods/
      sort.js
      dropNaN.js
      head.js
      count.js
      mean.js
      sum.js
      min.js
      max.js
    raw.js          # все методы одним файлом
    inject.js       # централизованная инъекция
    extender.js     # прикрутка всех методов к прототипу DataFrame
```

---

## 3. Пример метода (`count.js`)

```js
// methods/aggregation/methods/count.js

/**
 * Counts non-null values in a column.
 *
 * @param {{ validateColumn(frame, column): void }} deps
 * @returns {(frame: TinyFrame, column: string) => number}
 */
export const count = ({ validateColumn }) => (frame, column) => {
  validateColumn(frame, column)
  return frame.columns[column].length
}
```
И для трансформирующего метода:

```js
// methods/aggregation/methods/sort.js

export const sort = () => (frame, column) => {
  const arr = frame.columns[column]
  const sortedIndices = [...arr.keys()].sort((a, b) => arr[a] - arr[b])
  
  const sortedFrame = frame.clone()

  for (const col of Object.keys(frame.columns)) {
    sortedFrame.columns[col] = sortedIndices.map(i => frame.columns[col][i])
  }
  
  return sortedFrame
}
```

---

## 4. raw.js — собираем всё

```js
// methods/aggregation/raw.js

export { sort }    from './methods/sort.js'
export { dropNaN } from './methods/dropNaN.js'
export { head }    from './methods/head.js'
export { count }   from './methods/count.js'
export { mean }    from './methods/mean.js'
export { sum }     from './methods/sum.js'
export { min }     from './methods/min.js'
export { max }     from './methods/max.js'
```

---

## 5. inject.js — централизованная инъекция

```js
// methods/aggregation/inject.js

import * as rawFns from './raw.js'
import { validateColumn } from '../../primitives/validators.js'

const deps = { validateColumn }

export function injectMethods() {
  return Object.fromEntries(
    Object.entries(rawFns).map(([name, fn]) => [
      name,
      fn(deps)
    ])
  )
}
```

---

## 6. extender.js — расширяем DataFrame

```js
// methods/aggregation/extender.js

import { injectMethods } from './inject.js'

const injectedMethods = injectMethods()

export function extendDataFrame(DataFrameClass) {
  for (const [name, methodFn] of Object.entries(injectedMethods)) {
    DataFrameClass.prototype[name] = function (...args) {
      const result = methodFn(this._frame, ...args)
      
      // Разница между методами
      if (result instanceof TinyFrame) {
        return new DataFrameClass(result) // трансформация → новый DataFrame
      } else {
        return result                    // агрегация → возвращаем значение
      }
    }
  }
}
```

---
**ВАЖНО:**  
- `.sort()`, `.dropNaN()`, `.head()` возвращают новый `DataFrame`.  
- `.count()`, `.mean()`, `.sum()` возвращают значение.  

---

# 🔥 Теперь использование будет **идеальным**:

```js
import { extendDataFrame } from 'methods/aggregation/extender.js'
import { DataFrame } from 'tinyframejs'

// Инициализация методов один раз при старте проекта
extendDataFrame(DataFrame)

// Теперь можно писать:
const result = df
  .sort('price')
  .dropNaN('price')
  .head(10)
  .count('price')
```

🚀🚀🚀

---

# 📋 ИТОГО:  

| Что делаем | Почему |
|---|---|
| Объединяем всё как методы | Упрощает архитектуру, нет деления на агрегаторы/трансформаторы |
| inject.js централизует deps | Контролируем зависимости |
| extendDataFrame автоматом вешает методы | DataFrame становится богаче без лишних импортов |
| Один красивый fluent API | Как в Pandas: `.sort().dropNaN().head().count()` |

---

# ❓ Хочешь, я ещё дам идеальный `DataFrame.js` (обновлённый), чтобы всё это сразу туда встроить нативно?  
(без необходимости даже вручную делать `extendDataFrame`)  
👉 Напиши «Да», и я сделаю! 🚀
```

## 📦 Структура методов TinyFrameJS (на основе скриншотов)

tinyframejs/src/methods/
├── aggregation/                  # Методы агрегации
│   ├── count.js                  # Подсчет непустых значений
│   ├── fastNumericGroupBy.js     # Быстрая группировка числовых данных
│   ├── first.js                  # Первое значение
│   ├── genericGroupBy.js         # Универсальная группировка
│   ├── groupByAgg.js             # Агрегация по группам
│   ├── index.js                  # Экспорты
│   ├── isNumericArray.js         # Проверка на числовой массив
│   ├── last.js                   # Последнее значение
│   ├── max.js                    # Максимум
│   ├── mean.js                   # Среднее значение
│   ├── median.js                 # Медиана
│   ├── min.js                    # Минимум
│   ├── mode.js                   # Мода
│   ├── std.js                    # Стандартное отклонение
│   └── sum.js                    # Суммирование
│
├── filtering/                    # Методы фильтрации
│   ├── duplicated/               # Работа с дубликатами
│   │   ├── dropDuplicates.js     # Удаление дубликатов
│   │   ├── dropDuplicatesFast.js # Быстрое удаление дубликатов
│   │   ├── duplicated.js         # Поиск дубликатов
│   │   ├── duplicatedFast.js     # Быстрый поиск дубликатов
│   │   ├── hashRow.js            # Хеширование строк
│   │   └── index.js              # Экспорты
│   ├── nan/                      # Работа с NaN
│   │   ├── dropNaN.js            # Удаление строк с NaN
│   │   ├── fillNaN.js            # Заполнение NaN значений
│   │   └── index.js              # Экспорты
│   ├── query/                    # Запросы для фильтрации
│   │   ├── comparison.js         # Операторы сравнения
│   │   ├── filter.js             # Основной фильтр
│   │   ├── filterByColumn.js     # Фильтр по колонке
│   │   ├── index.js              # Экспорты
│   │   ├── patterns.js           # Шаблоны для фильтрации
│   │   ├── query.js              # Построение запросов
│   │   └── sets.js               # Операции с множествами
│   └── index.js                  # Экспорты
│
├── sampling/                     # Методы выборки
│   ├── createSeededRandom.js     # Создание генератора случайных чисел с сидом
│   ├── index.js                  # Экспорты
│   ├── sample.js                 # Случайная выборка
│   ├── sampleFraction.js         # Выборка доли данных
│   └── trainTestSplit.js         # Разделение на обучающую и тестовую выборки
│
├── sorting/                      # Методы сортировки
│   ├── argsort.js                # Возвращает индексы отсортированного массива
│   ├── index.js                  # Экспорты
│   ├── sortByIndex.js            # Сортировка по индексу
│   ├── sortValues.js             # Сортировка значений
│   └── sortValuesMultiple.js     # Сортировка по нескольким колонкам
│
├── transform/                    # Методы трансформации
│   ├── applyWindowFunction.js    # Применение оконной функции
│   ├── cumsum.js                 # Кумулятивная сумма
│   ├── deriveColumn.js           # Создание производной колонки
│   ├── diff.js                   # Разница между значениями
│   ├── getUniqueValues.js        # Получение уникальных значений
│   ├── index.js                  # Экспорты
│   ├── shift.js                  # Сдвиг значений
│   ├── transform.js              # Общая трансформация
│   ├── transformMultipleSeries.js # Трансформация нескольких колонок
│   └── transformSeries.js        # Трансформация одной колонки
│
├── reshape/                      # Методы изменения формы
│   ├── pivot/                    # Сводные таблицы
│   │   ├── index.js              # Экспорты
│   │   ├── melt.js               # Преобразование широкого формата в длинный
│   │   ├── pivot.js              # Базовое сведение
│   │   └── pivot_table.js        # Сводная таблица с агрегацией
│   └── index.js                  # Экспорты
│
├── window/                       # Оконные функции
│   ├── rolling/                  # Скользящие окна
│   │   ├── calculateRollingMeanDirect.js    # Прямой расчет скользящего среднего
│   │   ├── calculateRollingMeanPrefixSum.js # Расчет через префиксные суммы
│   │   ├── calculateRollingMeanSliding.js   # Расчет через скользящее окно
│   │   ├── ewm.js                # Экспоненциально взвешенное среднее
│   │   ├── index.js              # Экспорты
│   │   ├── rollingMean.js        # Скользящее среднее
│   │   └── rollingMeanTyped.js   # Типизированное скользящее среднее
│   └── index.js                  # Экспорты
│
├── display/                      # Методы отображения
│   ├── display.js                # Вывод в консоль
│   ├── index.js                  # Экспорты
│   ├── toCSV.js                  # Преобразование в CSV
│   ├── toHTML.js                 # Преобразование в HTML
│   ├── toJSON.js                 # Преобразование в JSON
│   └── toString.js               # Преобразование в строку
│
├── autoExtend.js                 # Автоматическое расширение DataFrame
└── index.js                      # Общий экспорт методов

-------------------------
-------------------------
-------------------------
-------------------------

# TinyFrameJS Обновлённая архитектура (после autoExtend, StreamingFrame и централизованной инъекции зависимостей)

---

{{ ... }}
## 📊 Дальнейшее развитие модуля визуализации

### 1. Улучшение автоматического определения типов графиков

Можно расширить функцию `detectChartType` для более точного определения типов графиков на основе структуры данных:
- Улучшить алгоритм определения финансовых данных (OHLC) для создания свечных графиков
- Добавить эвристики для определения временных рядов с несколькими переменными
- Реализовать определение данных для тепловых карт и других специализированных графиков

### 2. Добавление новых типов графиков

Расширить библиотеку поддержкой других популярных типов графиков:
- Тепловая карта (Heatmap)
- Древовидная карта (Treemap)
- Сетчатый график (Network graph)
- Графики для геоданных (Choropleth maps)
- Воронкообразные диаграммы (Funnel charts)
- Диаграммы Санкея (Sankey diagrams)

### 3. Интеграция с другими библиотеками визуализации

Сейчас TinyFrameJS использует Chart.js для визуализации. Можно добавить поддержку других популярных библиотек:
- D3.js для сложных интерактивных визуализаций
- Plotly для научных и статистических графиков
- ECharts для бизнес-ориентированных визуализаций
- Vega-Lite для декларативных визуализаций

### 4. Оптимизация производительности

Для больших наборов данных реализовать механизмы оптимизации:
- Агрегация данных перед визуализацией для больших наборов
- Выборка данных для предотвращения перегрузки браузера
- Прогрессивная загрузка для больших графиков
- Оптимизация рендеринга с использованием WebGL для графиков с большим количеством точек

### 5. Исправление ошибки в функции sort

Исправить ошибку в функции `sort.js`, где вызывается несуществующий метод `frame.clone()`. Заменить его на `cloneFrame` из `createFrame.js`.

### 6. Создание интерактивных дашбордов

Расширить функциональность модуля визуализации для создания интерактивных дашбордов:
- Комбинирование нескольких графиков на одной странице
- Добавление элементов управления (фильтры, слайдеры, выпадающие списки)
- Связывание графиков для интерактивного взаимодействия
- Шаблоны дашбордов для типичных сценариев анализа данных

### 7. Экспорт в различные форматы

Расширить возможности экспорта графиков и отчетов:
- Улучшить экспорт в PDF с поддержкой многостраничных отчетов
- Добавить экспорт в интерактивные HTML-страницы
- Реализовать экспорт в форматы для презентаций (PowerPoint, Google Slides)
- Добавить поддержку экспорта в векторные форматы (SVG, EPS)

### 8. Улучшение документации и примеров

Создать подробную документацию по использованию модуля визуализации:
- Примеры для каждого типа графика
- Интерактивные демонстрации в стиле Observable Notebooks
- Руководства по кастомизации графиков
- Рекомендации по выбору типа графика для разных видов данных


-------------------------

# План реорганизации кодовой базы TinyFrameJS

## 1. Создание структуры каталогов (1-2 дня)

* Создать структуру каталогов согласно CONCEPT.md:
  * `core/` - ядро библиотеки
  * `io/` - модули ввода-вывода с подкаталогами readers, writers, parsers, transformers
  * `methods/` - с разделением на aggregation, transformation, rolling, reshape
  * `computation/`, `display/`, `viz/` и другие модули
* Подготовить базовые index.js файлы для каждого модуля

## 2. Перенос существующих функций (3-5 дней)

* Перенести существующий код в соответствующие новые файлы
* Сохранить функциональность, не меняя логику работы
* Обновить импорты/экспорты для соответствия новой структуре
* Исправить выявленные баги (например, с `frame.clone()` в sort.js)
* Исправить проблемы с импортами несуществующих модулей

## 3. Переписывание кода под новую архитектуру (1-2 недели)

* Внедрить механизм auto-extend и dependency injection
* Обновить API для соответствия новой концепции (например, статический метод `DataFrame.create()`)
* Реализовать инкапсуляцию TinyFrame внутри DataFrame
* Заменить уязвимую библиотеку xlsx на exceljs
* Расширить функциональность метода `where()` для поддержки всех операторов сравнения
* Переименовать метод `query$()` в `expr$()` для избежания путаницы
* Доработать метод print для отображения DataFrame в табличном виде с границами

## 4. Дополнение кодовой базы для MVP (2-3 недели)

* Добавить недостающие компоненты для MVP:
  * Реализовать `StreamingFrame` для потоковой обработки данных
  * Реализовать `LazyPipeline` для ленивых вычислений
  * Внедрить базовую поддержку Apache Arrow формата
  * Добавить оптимизации для работы с большими наборами данных
* Реализовать базовые методы визуализации:
  * Интеграция с Chart.js для отображения графиков
  * Поддержка основных типов графиков (line, bar, scatter, candlestick)
* Добавить базовые компоненты для квантовой аналитики:
  * Простые индикаторы (Moving Average, RSI)
  * Простой класс Portfolio
* Создать минимальный бэктестинг:
  * Простая событийная модель
  * Интерфейс стратегии с базовыми методами

## 5. Тестирование и документация (1 неделя)

* Обновить существующие тесты для работы с новой архитектурой
* Добавить тесты для новых компонентов и функциональности
* Обновить README.md с описанием новой архитектуры
* Добавить примеры использования новых возможностей
* Документировать API и внутренние механизмы

## Приоритеты внедрения архитектурных улучшений

1. **Высокий приоритет**:
   * Колонко-ориентированное хранение данных (TypedArray)
   * Минимизация аллокаций и GC
   * Ленивая модель вычислений (LazyPipeline)

2. **Средний приоритет**:
   * Поддержка Apache Arrow формата
   * Hidden classes и inline caching
   * Продуманная работа с типами

3. **Низкий приоритет (после MVP)**:
   * SIMD/WebAssembly для критических участков
   * Параллелизм через Web Workers / Worker Threads
