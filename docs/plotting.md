---
id: plotting
title: How to create plots in TinyFrameJS?
sidebar_position: 4
description: Learn how to create visualizations from your data using TinyFrameJS
---

# How to create plots in TinyFrameJS?

Data visualization is an essential part of data analysis. TinyFrameJS provides a simple and intuitive API for creating various types of plots from your data. The visualization module is designed with a flexible adapter architecture that supports multiple rendering engines. Currently, the primary implementation uses Chart.js, with plans to add support for other popular visualization libraries like D3.js, Plotly, and ECharts in the future.

## Installation Requirements

To use the visualization features in TinyFrameJS, you need to install the following dependencies:

### For Browser Environments

```bash
npm install chart.js@^4.0.0
```

### For Node.js Environments

If you want to create and export charts in a Node.js environment, you'll need additional dependencies:

```bash
npm install chart.js@^4.0.0 canvas@^2.11.0
```

The `canvas` package is required for server-side rendering of charts and exporting them to image formats.

### Installing TinyFrameJS

If you haven't installed TinyFrameJS yet:

```bash
npm install tinyframejs
```

## Basic Plotting

TinyFrameJS offers two approaches to creating visualizations:

1. Using specific chart type methods
2. Using automatic chart type detection with the `plot()` method

### Line Charts

Line charts are useful for showing trends over time or continuous data:

```js
import { DataFrame } from 'tinyframejs';

// Create a DataFrame with time series data
const df = DataFrame.create([
  { date: '2023-01-01', value: 10, forecast: 11 },
  { date: '2023-02-01', value: 15, forecast: 14 },
  { date: '2023-03-01', value: 13, forecast: 15 },
  { date: '2023-04-01', value: 17, forecast: 16 },
  { date: '2023-05-01', value: 20, forecast: 19 }
]);

// Create a simple line chart
await df.plotLine({ x: 'date', y: 'value' });

// Create a line chart with multiple series
await df.plotLine({ x: 'date', y: ['value', 'forecast'] });

// Customize the chart
await df.plotLine({
  x: 'date', 
  y: ['value', 'forecast'],
  chartOptions: {
    title: 'Monthly Values',
    scales: {
      x: { title: { display: true, text: 'Month' } },
      y: { title: { display: true, text: 'Value' } }
    },
    plugins: {
      legend: { display: true }
    }
  }
});
```

### Area Charts

Area charts are similar to line charts but with the area below the line filled:

```js
// Create an area chart
await df.plotLine({
  x: 'date',
  y: 'value',
  chartType: 'area'
});

// Or use the dedicated area chart function
await df.line.areaChart({
  x: 'date',
  y: 'value',
  chartOptions: {
    title: 'Monthly Values with Area',
    fill: true
  }
});
```

### Bar Charts

Bar charts are great for comparing discrete categories:

```js
// Create a DataFrame with categorical data
const df = DataFrame.create([
  { category: 'A', value: 10, comparison: 8 },
  { category: 'B', value: 15, comparison: 12 },
  { category: 'C', value: 7, comparison: 10 },
  { category: 'D', value: 12, comparison: 9 },
  { category: 'E', value: 9, comparison: 11 }
]);

// Create a simple bar chart
await df.plotBar({ x: 'category', y: 'value' });

// Create a bar chart with multiple series
await df.plotBar({ x: 'category', y: ['value', 'comparison'] });

// Create a horizontal bar chart
await df.plotBar({
  x: 'category',
  y: 'value',
  chartOptions: {
    indexAxis: 'y'
  }
});

// Create a stacked bar chart
await df.plotBar({
  x: 'category',
  y: ['value', 'comparison'],
  chartOptions: {
    title: 'Comparison by Category',
    scales: {
      x: { stacked: true },
      y: { stacked: true }
    }
  }
});
```

### Scatter Plots

Scatter plots are useful for showing the relationship between two variables:

```js
// Create a DataFrame with two numeric variables
const df = DataFrame.create([
  { x: 1, y: 2, size: 10, category: 'A' },
  { x: 2, y: 3, size: 20, category: 'A' },
  { x: 3, y: 5, size: 30, category: 'A' },
  { x: 4, y: 7, size: 40, category: 'B' },
  { x: 5, y: 11, size: 50, category: 'B' },
  { x: 6, y: 13, size: 60, category: 'B' },
  { x: 7, y: 17, size: 70, category: 'C' },
  { x: 8, y: 19, size: 80, category: 'C' },
  { x: 9, y: 23, size: 90, category: 'C' },
  { x: 10, y: 29, size: 100, category: 'C' }
]);

// Create a simple scatter plot
await df.plotScatter({ x: 'x', y: 'y' });

// Create a bubble chart (scatter plot with size)
await df.plotBubble({
  x: 'x',
  y: 'y',
  size: 'size',
  chartOptions: {
    title: 'X vs Y with Size'
  }
});
```

### Pie Charts

Pie charts are useful for showing proportions of a whole:

```js
// Create a DataFrame with categorical data
const df = DataFrame.create([
  { category: 'A', value: 10 },
  { category: 'B', value: 15 },
  { category: 'C', value: 7 },
  { category: 'D', value: 12 },
  { category: 'E', value: 9 }
]);

// Create a simple pie chart
await df.plotPie({ x: 'category', y: 'value' });
// Alternative syntax
await df.plotPie({ category: 'category', value: 'value' });

// Create a donut chart
await df.plotPie({
  x: 'category',
  y: 'value',
  chartOptions: {
    cutout: '50%',
    title: 'Distribution by Category'
  }
});
```

## Advanced Chart Types

### Radar Charts

Radar charts display multivariate data on a two-dimensional chart with three or more quantitative variables:

```js
// Create a DataFrame with multiple variables
const df = DataFrame.create([
  { skill: 'JavaScript', person1: 90, person2: 75, person3: 85 },
  { skill: 'HTML/CSS', person1: 85, person2: 90, person3: 70 },
  { skill: 'React', person1: 80, person2: 85, person3: 90 },
  { skill: 'Node.js', person1: 75, person2: 70, person3: 85 },
  { skill: 'SQL', person1: 70, person2: 80, person3: 75 }
]);

// Create a radar chart
await df.pie.radarChart({
  category: 'skill',
  values: ['person1', 'person2', 'person3'],
  chartOptions: {
    title: 'Skills Comparison'
  }
});
```

### Polar Area Charts

Polar area charts are similar to pie charts but show values on radial axes:

```js
// Create a DataFrame with categorical data
const df = DataFrame.create([
  { category: 'A', value: 10 },
  { category: 'B', value: 15 },
  { category: 'C', value: 7 },
  { category: 'D', value: 12 },
  { category: 'E', value: 9 }
]);

// Create a polar area chart
await df.pie.polarChart({
  category: 'category',
  value: 'value',
  chartOptions: {
    title: 'Polar Area Chart'
  }
});
```

### Candlestick Charts

Candlestick charts are used for financial data showing open, high, low, and close values:

```js
// Create a DataFrame with financial data
const df = DataFrame.create([
  { date: '2023-01-01', open: 100, high: 110, low: 95, close: 105 },
  { date: '2023-01-02', open: 105, high: 115, low: 100, close: 110 },
  { date: '2023-01-03', open: 110, high: 120, low: 105, close: 115 },
  { date: '2023-01-04', open: 115, high: 125, low: 110, close: 120 },
  { date: '2023-01-05', open: 120, high: 130, low: 115, close: 125 }
]);

// Create a candlestick chart
await df.financial.candlestickChart({
  date: 'date',
  open: 'open',
  high: 'high',
  low: 'low',
  close: 'close',
  chartOptions: {
    title: 'Stock Price'
  }
});
```

## Automatic Chart Type Detection

TinyFrameJS can automatically detect the most appropriate chart type based on your data structure:

```js
// Create a DataFrame with time series data
const timeSeriesDf = DataFrame.create([
  { date: '2023-01-01', value: 10 },
  { date: '2023-02-01', value: 15 },
  { date: '2023-03-01', value: 13 },
  { date: '2023-04-01', value: 17 },
  { date: '2023-05-01', value: 20 }
]);

// Automatically creates a line chart
await timeSeriesDf.plot();

// Create a DataFrame with categorical data
const categoricalDf = DataFrame.create([
  { category: 'A', value: 10 },
  { category: 'B', value: 15 },
  { category: 'C', value: 7 },
  { category: 'D', value: 12 },
  { category: 'E', value: 9 }
]);

// Automatically creates a pie or bar chart
await categoricalDf.plot();

// You can specify a preferred chart type
await categoricalDf.plot({ preferredType: 'bar' });

// You can also specify preferred columns
await df.plot({
  preferredColumns: ['category', 'value'],
  chartOptions: {
    title: 'Auto-detected Chart'
  }
});
```

## Exporting Charts

TinyFrameJS provides comprehensive capabilities for exporting visualizations to various formats. This is particularly useful for reports, presentations, and sharing results.

### Supported Export Formats

The following export formats are supported:

- **PNG** - Raster image format, suitable for web pages and presentations
- **JPEG/JPG** - Compressed raster image format, suitable for photographs
- **PDF** - Document format, suitable for printing and distribution
- **SVG** - Vector image format, suitable for scaling and editing

### Basic Export Usage

In Node.js environments, you can export charts to various file formats using the `exportChart` method:

```js
// Export a chart to PNG
await df.exportChart('chart.png', {
  chartType: 'bar',
  x: 'category',
  y: 'value',
  chartOptions: {
    title: 'Exported Chart'
  }
});

// Export a chart to SVG
await df.exportChart('chart.svg', {
  chartType: 'line',
  x: 'date',
  y: 'value'
});

// Export a chart with automatic type detection
await df.exportChart('auto-chart.png');
```

### Export Parameters

The `exportChart` method accepts the following parameters:

- `filePath` (string) - Path to save the file
- `options` (object) - Export options:
  - `format` (string, optional) - File format ('png', 'jpeg', 'jpg', 'pdf', 'svg'). If not specified, it's determined from the file extension.
  - `chartType` (string, optional) - Chart type. If not specified, it's automatically detected.
  - `chartOptions` (object, optional) - Additional options for the chart.
  - `width` (number, default 800) - Chart width in pixels.
  - `height` (number, default 600) - Chart height in pixels.
  - `preferredColumns` (string[], optional) - Columns to prioritize when automatically detecting chart type.
  - `x`, `y`, `category`, `value`, etc. - Data mapping parameters depending on the chart type.

### Advanced Export Examples

```js
// Export a line chart with custom dimensions
await df.exportChart('chart.png', {
  chartType: 'line',
  x: 'date',
  y: ['value', 'forecast'],
  width: 1200,
  height: 800,
  chartOptions: {
    title: 'Monthly Values',
    colorScheme: 'tableau10'
  }
});

// Export a pie chart to PDF
await df.exportChart('chart.pdf', {
  chartType: 'pie',
  category: 'category',
  value: 'value',
  width: 1000,
  height: 800,
  chartOptions: {
    title: 'Category Distribution'
  }
});

// Export with automatic chart type detection
await df.exportChart('chart.svg', {
  preferredColumns: ['category', 'value']
});
```

### Low-level Export API

For more advanced use cases, TinyFrameJS also provides lower-level export functions in the `viz.node` module:

```js
import { viz } from 'tinyframejs';

// Create a chart configuration
const config = viz.line.lineChart(df, {
  x: 'date',
  y: 'value',
  chartOptions: {
    title: 'Line Chart'
  }
});

// Save the chart to a file
await viz.node.saveChartToFile(config, 'chart.png', {
  width: 1200,
  height: 800
});
```

### Creating HTML Reports with Multiple Charts

You can create HTML reports containing multiple charts using the `createHTMLReport` function:

```js
import { viz } from 'tinyframejs';

// Create chart configurations
const lineConfig = viz.line.lineChart(df1, { x: 'date', y: 'value' });
const pieConfig = viz.pie.pieChart(df2, { x: 'category', y: 'value' });

// Create an HTML report
await viz.node.createHTMLReport(
  [lineConfig, pieConfig],
  'report.html',
  {
    title: 'Sales Report',
    description: 'Analysis of sales by category and time'
  }
);
```

### Dependencies for Export Functionality

To use the export functionality in Node.js, you need the following dependencies:

```bash
# Required for basic export functionality
npm install chart.js@^4.0.0 canvas@^2.11.0

# Optional: for PDF and SVG export
npm install pdf-lib@^1.17.0 @svgdotjs/svg.js@^3.1.0
```

### Notes on Export Functionality

- Export functions only work in a Node.js environment
- For interactive charts in the browser, use the `plot*` methods instead
- Large charts may require more memory for export
- For high-quality prints, consider using SVG or PDF formats

## Customizing Charts

TinyFrameJS provides a wide range of options for customizing charts through the `chartOptions` parameter:

```js
// Customize a line chart
await df.plotLine({
  x: 'date',
  y: 'value',
  chartOptions: {
    // General options
    responsive: true,
    maintainAspectRatio: false,
    
    // Title and legend
    plugins: {
      title: {
        display: true,
        text: 'Monthly Values',
        font: {
          size: 16,
          family: 'Arial, sans-serif'
        }
      },
      subtitle: {
        display: true,
        text: 'Data from 2023',
        font: {
          size: 14
        }
      },
      legend: {
        display: true,
        position: 'top'
      },
      tooltip: {
        enabled: true
      }
    },
    
    // Axes
    scales: {
      x: {
        title: {
          display: true,
          text: 'Month'
        },
        grid: {
          display: true,
          color: '#ddd'
        },
        ticks: {
          autoSkip: true,
          maxRotation: 45
        }
      },
      y: {
        title: {
          display: true,
          text: 'Value'
        },
        beginAtZero: true,
        grid: {
          display: true,
          color: '#ddd'
        }
      }
    },
    
    // Colors
    colorScheme: 'qualitative'
  }
});
```

## Next Steps

Now that you know how to create plots with TinyFrameJS, you can:

- Learn how to [create derived columns](./derived-columns) for more complex visualizations
- Explore how to [calculate summary statistics](./statistics) to better understand your data
- Discover how to [reshape your data](./reshaping) to make it more suitable for visualization
