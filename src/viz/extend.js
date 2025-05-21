// src/viz/extend.js

import {
  lineChart,
  multiAxisLineChart,
  areaChart,
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
import {
  pieChart,
  doughnutChart,
  polarAreaChart,
  radarChart,
} from './types/pie.js';
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
   * @returns {Object} The DataFrame instance for method chaining
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
   * @returns {Object} The DataFrame instance for method chaining
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
   * @returns {Object} The DataFrame instance for method chaining
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
   * @returns {Object} The DataFrame instance for method chaining
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
   * @returns {Object} The DataFrame instance for method chaining
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
   * @param {string} [options.timeUnit='day'] - Time unit ('hour', 'day', 'week', 'month', 'quarter', 'year')
   * @param {Object} [options.chartOptions] - Additional chart options
   * @returns {Object} The DataFrame instance for method chaining
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
   * @returns {Object} The DataFrame instance for method chaining
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
   * @param {Object} options - Save options
   * @returns {Promise<string>} Path to the saved file
   */
  DataFrame.prototype.saveChart = async function (
    chartConfig,
    filePath,
    options = {},
  ) {
    if (
      typeof process === 'undefined' ||
      !process.versions ||
      !process.versions.node
    ) {
      throw new Error('saveChart is only available in Node.js environment');
    }

    return await saveChartToFile(chartConfig, filePath, options);
  };

  /**
   * Creates an HTML report with multiple charts (Node.js environment only)
   * @param {Object[]} charts - Array of chart configurations
   * @param {string} outputPath - Path to save the HTML file
   * @param {Object} options - Report options
   * @returns {Promise<string>} Path to the saved file
   */
  DataFrame.prototype.createReport = async function (
    charts,
    outputPath,
    options = {},
  ) {
    if (
      typeof process === 'undefined' ||
      !process.versions ||
      !process.versions.node
    ) {
      throw new Error('createReport is only available in Node.js environment');
    }

    return await createHTMLReport(charts, outputPath, options);
  };

  /**
   * Creates a dashboard with multiple charts (browser environment only)
   * @param {Object[]} charts - Array of chart configurations
   * @param {Object} options - Dashboard options
   * @returns {Promise<Object>} Dashboard object
   */
  DataFrame.prototype.createDashboard = async function (charts, options = {}) {
    if (!isBrowser) {
      throw new Error(
        'createDashboard is only available in browser environment',
      );
    }

    return await createDashboard(charts, options);
  };

  return DataFrame;
}

/**
 * Initializes the visualization module
 * @param {Object} DataFrame - DataFrame class to extend
 */
export function init(DataFrame) {
  return extendDataFrame(DataFrame);
}
