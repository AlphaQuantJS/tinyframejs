# Экспорт визуализаций в TinyFrameJS

TinyFrameJS предоставляет расширенные возможности для экспорта визуализаций в различные форматы. Эта документация описывает доступные методы и опции для экспорта графиков.

## Поддерживаемые форматы

TinyFrameJS поддерживает следующие форматы экспорта:

- **PNG** - растровое изображение, подходит для веб-страниц и презентаций
- **JPEG/JPG** - растровое изображение с компрессией, подходит для фотографий
- **PDF** - документ, подходит для печати и распространения
- **SVG** - векторное изображение, подходит для масштабирования и редактирования

## Методы экспорта

### Метод `exportChart` для DataFrame

Метод `exportChart` позволяет экспортировать график, созданный из DataFrame, в файл указанного формата.

```javascript
await dataFrame.exportChart(filePath, options);
```

#### Параметры

- `filePath` (string) - путь для сохранения файла
- `options` (object) - опции экспорта:
  - `format` (string, опционально) - формат файла ('png', 'jpeg', 'jpg', 'pdf', 'svg'). Если не указан, определяется из расширения файла.
  - `chartType` (string, опционально) - тип графика. Если не указан, определяется автоматически.
  - `chartOptions` (object, опционально) - дополнительные опции для графика.
  - `width` (number, по умолчанию 800) - ширина графика в пикселях.
  - `height` (number, по умолчанию 600) - высота графика в пикселях.
  - `preferredColumns` (string[], опционально) - колонки для приоритизации при автоматическом определении типа графика.

#### Поддерживаемые типы графиков

- `line` - линейный график
- `bar` - столбчатый график
- `scatter` - точечный график
- `pie` - круговой график
- `bubble` - пузырьковый график
- `area` - график с областями
- `radar` - радарный график
- `polar` - полярный график
- `candlestick` - свечной график (для финансовых данных)
- `doughnut` - кольцевой график
- `histogram` - гистограмма
- `pareto` - график Парето
- `regression` - график регрессии
- `timeseries` - график временных рядов

#### Пример использования

```javascript
// Экспорт линейного графика в PNG
await df.exportChart('chart.png', {
  chartType: 'line',
  chartOptions: {
    title: 'Линейный график',
    colorScheme: 'tableau10'
  }
});

// Экспорт кругового графика в PDF
await df.exportChart('chart.pdf', {
  chartType: 'pie',
  width: 1000,
  height: 800,
  chartOptions: {
    title: 'Круговой график'
  }
});

// Экспорт с автоматическим определением типа графика
await df.exportChart('chart.svg', {
  preferredColumns: ['category', 'value']
});
```

### Функция `saveChartToFile`

Функция `saveChartToFile` из модуля `viz.node` позволяет сохранить конфигурацию графика в файл.

```javascript
await viz.node.saveChartToFile(chartConfig, filePath, options);
```

#### Параметры

- `chartConfig` (object) - конфигурация графика Chart.js
- `filePath` (string) - путь для сохранения файла
- `options` (object) - опции сохранения:
  - `format` (string, опционально) - формат файла ('png', 'jpeg', 'jpg', 'pdf', 'svg'). Если не указан, определяется из расширения файла.
  - `width` (number, по умолчанию 800) - ширина графика в пикселях.
  - `height` (number, по умолчанию 600) - высота графика в пикселях.

#### Пример использования

```javascript
// Создание конфигурации графика
const config = viz.line.lineChart(df, {
  x: 'date',
  y: 'value',
  chartOptions: {
    title: 'Линейный график'
  }
});

// Сохранение графика в файл
await viz.node.saveChartToFile(config, 'chart.png', {
  width: 1200,
  height: 800
});
```

### Функция `createHTMLReport`

Функция `createHTMLReport` из модуля `viz.node` позволяет создать HTML-отчет с несколькими графиками.

```javascript
await viz.node.createHTMLReport(charts, outputPath, options);
```

#### Параметры

- `charts` (array) - массив конфигураций графиков
- `outputPath` (string) - путь для сохранения HTML-файла
- `options` (object) - опции отчета:
  - `title` (string, по умолчанию 'TinyFrameJS Visualization Report') - заголовок отчета
  - `description` (string, по умолчанию '') - описание отчета
  - `width` (number, по умолчанию 800) - ширина графиков в пикселях
  - `height` (number, по умолчанию 500) - высота графиков в пикселях

#### Пример использования

```javascript
// Создание конфигураций графиков
const lineConfig = viz.line.lineChart(df1, { x: 'date', y: 'value' });
const pieConfig = viz.pie.pieChart(df2, { x: 'category', y: 'value' });

// Создание HTML-отчета
await viz.node.createHTMLReport(
  [lineConfig, pieConfig],
  'report.html',
  {
    title: 'Отчет по продажам',
    description: 'Анализ продаж по категориям и времени'
  }
);
```

## Зависимости

Для работы функций экспорта в Node.js требуются следующие зависимости:

- `chart.js` - для создания графиков
- `canvas` - для рендеринга графиков в Node.js
- `pdf-lib` - для экспорта в PDF (опционально)
- `@svgdotjs/svg.js` - для экспорта в SVG (опционально)

Установите их с помощью npm:

```bash
npm install chart.js canvas pdf-lib @svgdotjs/svg.js
```

## Примечания

- Функции экспорта работают только в среде Node.js
- Для экспорта в PDF и SVG требуются дополнительные зависимости
- Для создания интерактивных графиков в браузере используйте методы `plot*` и `renderChart`
