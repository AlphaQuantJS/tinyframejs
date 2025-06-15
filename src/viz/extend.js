// src/viz/extend.js

// Import basic chart types
import {
  lineChart,
  multiAxisLineChart,
  timeSeriesChart,
} from './types/line.js';
import {
  barChart,
  horizontalBarChart,
  stackedBarChart,
  groupedBarChart,
  histogram,
  paretoChart,
} from './types/bar.js';
import { scatterPlot, bubbleChart, regressionPlot } from './types/scatter.js';
import { pieChart, doughnutChart } from './types/pie.js';

// Import new chart types
import { areaChart } from './types/area.js';
import { radarChart } from './types/radar.js';
import { polarChart } from './types/polar.js';
import { candlestickChart } from './types/candlestick.js';
import {
  renderChart,
  exportChartAsImage,
  updateChart,
  createDashboard,
} from './renderers/browser.js';
import {
  renderChart as renderChartNode,
  saveChartToFile,
  createHTMLReport,
} from './renderers/node.js';

import { detectChartType } from './utils/autoDetect.js';

/**
 * Extends DataFrame with visualization methods
 * @param {Object} DataFrame - DataFrame class to extend
 * @returns {void} - This function doesn't return a value, it modifies the DataFrame class
 */
export function extendDataFrame(DataFrame) {
  // Check if we're in a browser or Node.js environment
  const isBrowser =
    typeof window !== 'undefined' && typeof document !== 'undefined';

  /**
   * Creates a line chart from DataFrame data
   * @param {Object} options - Chart options
   * @param {string} options.x - Column name for X axis
   * @param {string|string[]} options.y - Column name(s) for Y axis
   * @param {Object} [options.chartOptions] - Additional chart options
   * @returns {Promise<Object>} Chart instance or configuration
   */
  DataFrame.prototype.plotLine = async function (options) {
    const config = lineChart(this, options);

    if (isBrowser && options.render !== false) {
      return await renderChart(config, options);
    }

    return config;
  };

  /**
   * Creates a bar chart from DataFrame data
   * @param {Object} options - Chart options
   * @param {string} options.x - Column name for X axis
   * @param {string|string[]} options.y - Column name(s) for Y axis
   * @param {Object} [options.chartOptions] - Additional chart options
   * @returns {Promise<Object>} Chart instance or configuration
   */
  DataFrame.prototype.plotBar = async function (options) {
    const config = barChart(this, options);

    if (isBrowser && options.render !== false) {
      return await renderChart(config, options);
    }

    return config;
  };

  /**
   * Creates a scatter plot from DataFrame data
   * @param {Object} options - Chart options
   * @param {string} options.x - Column name for X axis
   * @param {string|string[]} options.y - Column name(s) for Y axis
   * @param {Object} [options.chartOptions] - Additional chart options
   * @returns {Promise<Object>} Chart instance or configuration
   */
  DataFrame.prototype.plotScatter = async function (options) {
    const config = scatterPlot(this, options);

    if (isBrowser && options.render !== false) {
      return await renderChart(config, options);
    }

    return config;
  };

  /**
   * Creates a pie chart from DataFrame data
   * @param {Object} options - Chart options
   * @param {string} options.x - Column name for labels
   * @param {string} options.y - Column name for values
   * @param {Object} [options.chartOptions] - Additional chart options
   * @returns {Promise<Object>} Chart instance or configuration
   */
  DataFrame.prototype.plotPie = async function (options) {
    const config = pieChart(this, options);

    if (isBrowser && options.render !== false) {
      return await renderChart(config, options);
    }

    return config;
  };

  /**
   * Creates a histogram from DataFrame data
   * @param {Object} options - Chart options
   * @param {string} options.column - Column name for data
   * @param {number} [options.bins=10] - Number of bins
   * @param {Object} [options.chartOptions] - Additional chart options
   * @returns {Promise<Object>} Chart instance or configuration
   */
  DataFrame.prototype.plotHistogram = async function (options) {
    const config = histogram(this, options);

    if (isBrowser && options.render !== false) {
      return await renderChart(config, options);
    }

    return config;
  };

  /**
   * Creates a time series chart from DataFrame data
   * @param {Object} options - Chart options
   * @param {string} options.x - Column name for X axis (should contain date/time values)
   * @param {string|string[]} options.y - Column name(s) for Y axis
   * @param {string} [options.timeUnit='day'] - Time unit
   *    ('hour', 'day', 'week', 'month', 'quarter', 'year')
   * @param {Object} [options.chartOptions] - Additional chart options
   * @returns {Promise<Object>} Chart instance or configuration
   */
  DataFrame.prototype.plotTimeSeries = async function (options) {
    const config = timeSeriesChart(this, options);

    if (isBrowser && options.render !== false) {
      return await renderChart(config, options);
    }

    return config;
  };

  /**
   * Creates a bubble chart from DataFrame data
   * @param {Object} options - Chart options
   * @param {string} options.x - Column name for X axis
   * @param {string} options.y - Column name for Y axis
   * @param {string} options.size - Column name for bubble size
   * @param {string} [options.color] - Column name for bubble color (categorical)
   * @param {Object} [options.chartOptions] - Additional chart options
   * @returns {Promise<Object>} Chart instance or configuration
   */
  DataFrame.prototype.plotBubble = async function (options) {
    const config = bubbleChart(this, options);

    if (isBrowser && options.render !== false) {
      return await renderChart(config, options);
    }

    return config;
  };

  /**
   * Creates a heatmap from DataFrame data
   * @param {Object} options - Chart options
   * @param {string} options.x - Column name for X axis
   * @param {string} options.y - Column name for Y axis
   * @param {string} options.value - Column name for cell values
   * @param {Object} [options.chartOptions] - Additional Chart.js options
   * @returns {Promise<Object>} Chart instance or configuration
   */
  DataFrame.prototype.plotHeatmap = async function (options) {
    // This is a placeholder - heatmaps require additional plugins for Chart.js
    throw new Error('Heatmap plotting is not implemented yet');
  };

  /**
   * Saves a chart to a file (Node.js environment only)
   * @param {Object} chartConfig - Chart.js configuration
   * @param {string} filePath - Path to save the file
   * @param {Object} [options] - Save options
   * @param {string} [options.format='png'] - File format ('png', 'jpeg', 'pdf', 'svg')
   * @param {number} [options.width=800] - Width of the chart in pixels
   * @param {number} [options.height=600] - Height of the chart in pixels
   * @returns {Promise<string>} Path to the saved file
   */
  DataFrame.prototype.saveChart = async function (
    chartConfig,
    filePath,
    options = {},
  ) {
    // Check if we're in Node.js environment
    if (
      typeof process === 'undefined' ||
      !process.versions ||
      !process.versions.node
    ) {
      throw new Error('Node.js environment is required for saveChart');
    }

    return await saveChartToFile(chartConfig, filePath, options);
  };

  /**
   * Creates an HTML report with multiple charts
   * @param {Object[]} charts - Array of chart configurations
   * @param {string} filePath - Path to save the HTML file
   * @param {Object} [options] - Report options
   * @param {string} [options.title='DataFrame Visualization Report'] - Report title
   * @param {string} [options.description=''] - Report description
   * @param {Object} [options.layout] - Layout options
   * @returns {Promise<string>} Path to the saved file
   */
  DataFrame.prototype.createReport = async function (
    charts,
    filePath,
    options = {},
  ) {
    // Check if we're in Node.js environment
    if (
      typeof process === 'undefined' ||
      !process.versions ||
      !process.versions.node
    ) {
      throw new Error('Node.js environment is required for createReport');
    }

    return await createHTMLReport(charts, filePath, options);
  };

  /**
   * Automatically detects the best chart type and creates a visualization
   * @param {Object} [options] - Chart options
   * @param {string[]} [options.preferredColumns] - Columns to prioritize for visualization
   * @param {string} [options.preferredType] - Preferred chart type if multiple are suitable
   * @param {Object} [options.chartOptions] - Additional chart options
   * @returns {Promise<Object>} Chart instance or configuration
   */
  DataFrame.prototype.plot = async function (options = {}) {
    // Extract chart options
    const { preferredColumns, preferredType, chartOptions = {} } = options;

    // Detect the best chart type
    const detection = detectChartType(this, {
      preferredColumns,
      preferredType,
    });

    // Create chart configuration based on detected type
    let config;

    switch (detection.type) {
      case 'line':
        config = lineChart(this, {
          x: detection.columns.x,
          y:
            detection.columns.y && detection.columns.y.length > 0
              ? detection.columns.y[0]
              : undefined,
          chartOptions,
        });
        break;
      case 'bar':
        config = barChart(this, {
          x: detection.columns.x,
          y:
            detection.columns.y && detection.columns.y.length > 0
              ? detection.columns.y[0]
              : undefined,
          chartOptions,
        });
        break;
      case 'scatter':
        config = scatterPlot(this, {
          x: detection.columns.x,
          y:
            detection.columns.y && detection.columns.y.length > 0
              ? detection.columns.y[0]
              : undefined,
          chartOptions,
        });
        break;
      case 'pie':
        config = pieChart(this, {
          x: detection.columns.x,
          y:
            detection.columns.y && detection.columns.y.length > 0
              ? detection.columns.y[0]
              : undefined,
          chartOptions,
        });
        break;
      case 'bubble':
        config = bubbleChart(this, {
          x: detection.columns.x,
          y:
            detection.columns.y && detection.columns.y.length > 0
              ? detection.columns.y[0]
              : undefined,
          size: detection.columns.size,
          color: detection.columns.color,
          chartOptions,
        });
        break;
      default:
        config = scatterPlot(this, {
          x: detection.columns.x,
          y:
            detection.columns.y && detection.columns.y.length > 0
              ? detection.columns.y[0]
              : undefined,
          chartOptions,
        });
    }

    // Add detection info to the configuration
    config.detection = detection;

    // Render the chart if in browser
    if (isBrowser && options.render !== false) {
      return await renderChart(config, options);
    }

    return config;
  };

  /**
   * Exports a chart to a file
   * @param {string} filePath - Path to save the file
   * @param {Object} options - Export options
   * @param {string} [options.format] - File format ('png', 'jpeg', 'jpg', 'pdf', 'svg').
   *    If not specified, it will be inferred from the file extension.
   * @param {string} [options.chartType] - Chart type to use.
   *    If not specified, it will be automatically detected.
   * @param {Object} [options.chartOptions] - Additional chart options
   * @param {number} [options.width=800] - Width of the chart in pixels
   * @param {number} [options.height=600] - Height of the chart in pixels
   * @param {string[]} [options.preferredColumns] - Columns to prioritize for visualization
   * @returns {Promise<string>} Path to the saved file
   */
  DataFrame.prototype.exportChart = async function (filePath, options = {}) {
    // Check if we're in Node.js environment
    if (
      typeof process === 'undefined' ||
      !process.versions ||
      !process.versions.node
    ) {
      throw new Error('Node.js environment is required for exportChart');
    }

    // Extract options
    const {
      format,
      chartType,
      chartOptions = {},
      width = 800,
      height = 600,
      preferredColumns,
    } = options;

    // Create chart configuration
    let config;

    if (chartType) {
      // Use specified chart type
      switch (chartType.toLowerCase()) {
        case 'line':
          config = await this.plotLine({
            ...options,
            render: false,
          });
          break;
        case 'bar':
          config = await this.plotBar({
            ...options,
            render: false,
          });
          break;
        case 'scatter':
          config = await this.plotScatter({
            ...options,
            render: false,
          });
          break;
        case 'pie':
          config = await this.plotPie({
            ...options,
            render: false,
          });
          break;
        case 'bubble':
          config = await this.plotBubble({
            ...options,
            render: false,
          });
          break;
        default:
          config = await this.plot({
            ...options,
            render: false,
          });
      }
    } else {
      // Auto-detect chart type
      config = await this.plot({
        preferredColumns,
        chartOptions,
        render: false,
      });
    }

    // Save chart to file
    return await saveChartToFile(config, filePath, {
      format,
      width,
      height,
    });
  };

  return DataFrame;
}

/**
 * Initializes the visualization module
 * @param {Object} DataFrame - DataFrame class to extend
 * @returns {Object} Extended DataFrame class
 */
export function init(DataFrame) {
  return extendDataFrame(DataFrame);
}
