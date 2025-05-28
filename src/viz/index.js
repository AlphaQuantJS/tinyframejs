// src/viz/index.js

/**
 * TinyFrameJS Visualization Module
 * Provides visualization capabilities for TinyFrameJS DataFrames
 */

// Import chart types
import * as lineCharts from './types/line.js';
import * as barCharts from './types/bar.js';
import * as scatterCharts from './types/scatter.js';
import * as pieCharts from './types/pie.js';
import { areaChart } from './types/area.js';
import { radarChart } from './types/radar.js';
import { polarChart } from './types/polar.js';
import { candlestickChart } from './types/candlestick.js';

// Import renderers
import * as browserRenderer from './renderers/browser.js';
import * as nodeRenderer from './renderers/node.js';

// Import utilities
import * as colorUtils from './utils/colors.js';
import * as scaleUtils from './utils/scales.js';
import * as formatUtils from './utils/formatting.js';
import { createChartJSConfig, loadChartJS } from './adapters/chartjs.js';

// Import extension functionality
import { extendDataFrame, init } from './extend.js';
import { detectChartType } from './utils/autoDetect.js';

// Re-export all chart types
export const line = {
  lineChart: lineCharts.lineChart,
  multiAxisLineChart: lineCharts.multiAxisLineChart,
  areaChart, // Use the dedicated area chart implementation
  timeSeriesChart: lineCharts.timeSeriesChart,
};

export const bar = {
  barChart: barCharts.barChart,
  horizontalBarChart: barCharts.horizontalBarChart,
  stackedBarChart: barCharts.stackedBarChart,
  groupedBarChart: barCharts.groupedBarChart,
  histogram: barCharts.histogram,
  paretoChart: barCharts.paretoChart,
};

export const scatter = {
  scatterPlot: scatterCharts.scatterPlot,
  bubbleChart: scatterCharts.bubbleChart,
  regressionPlot: scatterCharts.regressionPlot,
};

// Financial charts
export const financial = {
  candlestickChart,
};

export const pie = {
  pieChart: pieCharts.pieChart,
  doughnutChart: pieCharts.doughnutChart,
  polarAreaChart: polarChart, // Use the dedicated polar chart implementation
  radarChart, // Use the dedicated radar chart implementation
  proportionPieChart: pieCharts.proportionPieChart,
};

// Re-export renderers
export const browser = {
  renderChart: browserRenderer.renderChart,
  exportChartAsImage: browserRenderer.exportChartAsImage,
  updateChart: browserRenderer.updateChart,
  createDashboard: browserRenderer.createDashboard,
};

export const node = {
  renderChart: nodeRenderer.renderChart,
  saveChartToFile: nodeRenderer.saveChartToFile,
  createHTMLReport: nodeRenderer.createHTMLReport,
};

// Re-export utilities
export const utils = {
  createChartJSConfig,
  loadChartJS,
  detectChartType,
  colors: colorUtils,
  scales: scaleUtils,
  formatting: formatUtils,
};

// Export extension functionality
export { extendDataFrame, init };

/**
 * Detect environment and return appropriate renderer
 * @returns {Object} Renderer for the current environment
 */
export function getRenderer() {
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    return browser;
  } else {
    return node;
  }
}

/**
 * Create a chart configuration based on the specified type
 * @param {Object} dataFrame - TinyFrameJS DataFrame
 * @param {string} type - Chart type
 * @param {Object} options - Chart options
 * @returns {Object} Chart configuration
 */
export function createChart(dataFrame, type, options) {
  switch (type.toLowerCase()) {
  case 'line':
    return line.lineChart(dataFrame, options);
  case 'bar':
    return bar.barChart(dataFrame, options);
  case 'scatter':
    return scatter.scatterPlot(dataFrame, options);
  case 'pie':
    return pie.pieChart(dataFrame, options);
  case 'doughnut':
    return pie.doughnutChart(dataFrame, options);
  case 'area':
    return line.areaChart(dataFrame, options);
  case 'timeseries':
    return line.timeSeriesChart(dataFrame, options);
  case 'bubble':
    return scatter.bubbleChart(dataFrame, options);
  case 'histogram':
    return bar.histogram(dataFrame, options);
  case 'radar':
    return pie.radarChart(dataFrame, options);
  case 'polar':
    return pie.polarAreaChart(dataFrame, options);
  case 'pareto':
    return bar.paretoChart(dataFrame, options);
  case 'regression':
    return scatter.regressionPlot(dataFrame, options);
  case 'candlestick':
    return financial.candlestickChart(dataFrame, options);
  default:
    throw new Error(`Unsupported chart type: ${type}`);
  }
}

/**
 * Render a chart in the current environment
 * @param {Object} chartConfig - Chart configuration
 * @param {Object} options - Rendering options
 * @returns {Promise<Object>} Rendered chart
 */
export async function renderChart(chartConfig, options = {}) {
  const renderer = getRenderer();
  return await renderer.renderChart(chartConfig, options);
}

// Default export
export default {
  line,
  bar,
  scatter,
  pie,
  financial,
  browser,
  node,
  utils,
  extendDataFrame,
  init,
  getRenderer,
  createChart,
  renderChart,
};
