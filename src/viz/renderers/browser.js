// src/viz/renderers/browser.js

import { loadChartJS } from '../adapters/chartjs.js';

/**
 * Browser renderer for visualizations
 * Handles rendering charts in browser environments
 */

/**
 * Creates a DOM element for the chart
 * @param {Object} options - Options for the chart container
 * @param {string} [options.id] - ID for the container element
 * @param {string} [options.width='100%'] - Width of the container
 * @param {string} [options.height='400px'] - Height of the container
 * @param {string} [options.className] - CSS class for the container
 * @returns {HTMLElement} Container element
 * @private
 */
function createContainer(options = {}) {
  const {
    id = `chart-${Math.random().toString(36).substring(2, 9)}`,
    width = '100%',
    height = '400px',
    className = '',
  } = options;

  const container = document.createElement('div');
  container.id = id;
  container.style.width = width;
  container.style.height = height;

  if (className) {
    container.className = className;
  }

  return container;
}

/**
 * Renders a Chart.js chart in the browser
 * @param {Object} chartConfig - Chart.js configuration
 * @param {Object} options - Rendering options
 * @param {HTMLElement|string} [options.container] - Container element or selector
 * @param {string} [options.width='100%'] - Width of the chart
 * @param {string} [options.height='400px'] - Height of the chart
 * @returns {Promise<Object>} Chart instance
 */
export async function renderChart(chartConfig, options = {}) {
  // Check if we're in a browser environment
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    throw new Error('Browser environment is required for renderChart');
  }

  const { container, width = '100%', height = '400px' } = options;

  // Load Chart.js
  const Chart = await loadChartJS();

  // Get or create container
  let chartContainer;

  if (container) {
    if (typeof container === 'string') {
      // If container is a selector, find the element
      chartContainer = document.querySelector(container);
      if (!chartContainer) {
        throw new Error(`Container element not found: ${container}`);
      }
    } else if (container instanceof HTMLElement) {
      // If container is an element, use it directly
      chartContainer = container;
    } else {
      throw new Error('Container must be a selector string or HTMLElement');
    }
  } else {
    // Create a new container
    chartContainer = createContainer({ width, height });
    document.body.appendChild(chartContainer);
  }

  // Create canvas element
  const canvas = document.createElement('canvas');
  chartContainer.appendChild(canvas);

  // Create and return the chart
  return new Chart(canvas, chartConfig);
}

/**
 * Exports a chart as an image
 * @param {Object} chart - Chart.js instance
 * @param {Object} options - Export options
 * @param {string} [options.type='png'] - Image format ('png', 'jpeg', 'webp')
 * @param {number} [options.quality=0.95] - Image quality (0-1) for JPEG and WebP
 * @param {string} [options.filename] - Download filename
 * @returns {Promise<string>} Data URL of the image
 */
export async function exportChartAsImage(chart, options = {}) {
  // Check if we're in a browser environment
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    throw new Error('Browser environment is required for exportChartAsImage');
  }

  const {
    type = 'png',
    quality = 0.95,
    filename = `chart-${Date.now()}.${type}`,
  } = options;

  // Validate chart instance
  if (!chart || !chart.canvas) {
    throw new Error('Invalid chart instance');
  }

  // Get data URL
  const dataUrl = chart.toBase64Image(type, quality);

  // If filename is provided, trigger download
  if (filename) {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return dataUrl;
}

/**
 * Updates an existing chart with new data
 * @param {Object} chart - Chart.js instance
 * @param {Object} dataFrame - TinyFrameJS DataFrame
 * @param {Object} options - Update options
 * @param {string} options.x - Column name for X axis
 * @param {string|string[]} options.y - Column name(s) for Y axis
 * @param {boolean} [options.animate=true] - Whether to animate the update
 * @returns {Object} Updated chart instance
 */
export function updateChart(chart, dataFrame, options) {
  const { x, y, animate = true } = options;

  // Validate chart instance
  if (!chart || !chart.data) {
    throw new Error('Invalid chart instance');
  }

  // Validate input
  if (!dataFrame || !dataFrame.data || !dataFrame.columns) {
    throw new Error('Invalid DataFrame provided');
  }

  if (!x) {
    throw new Error('X-axis column must be specified');
  }

  if (!y) {
    throw new Error('Y-axis column(s) must be specified');
  }

  const yColumns = Array.isArray(y) ? y : [y];

  // Update labels (x-axis values)
  chart.data.labels = dataFrame.data.map((row) => row[x]);

  // Update datasets
  yColumns.forEach((column, index) => {
    if (index < chart.data.datasets.length) {
      chart.data.datasets[index].data = dataFrame.data.map(
        (row) => row[column],
      );
    }
  });

  // Update the chart
  chart.update(animate ? undefined : { duration: 0 });

  return chart;
}

/**
 * Creates an interactive dashboard with multiple charts
 * @param {Object[]} charts - Array of chart configurations
 * @param {Object} options - Dashboard options
 * @param {string} [options.container] - Container selector
 * @param {string} [options.layout='grid'] - Layout type ('grid', 'vertical', 'horizontal')
 * @param {number} [options.columns=2] - Number of columns for grid layout
 * @returns {Promise<Object>} Dashboard object with chart instances
 */
export async function createDashboard(charts, options = {}) {
  // Check if we're in a browser environment
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    throw new Error('Browser environment is required for createDashboard');
  }

  const { container = 'body', layout = 'grid', columns = 2 } = options;

  // Get container element
  const dashboardContainer =
    typeof container === 'string' ?
      document.querySelector(container) :
      container;

  if (!dashboardContainer) {
    throw new Error(`Dashboard container not found: ${container}`);
  }

  // Create dashboard element
  const dashboard = document.createElement('div');
  dashboard.className = `tinyframe-dashboard tinyframe-dashboard-${layout}`;
  dashboard.style.display = 'flex';
  dashboard.style.flexWrap = layout === 'grid' ? 'wrap' : 'nowrap';
  dashboard.style.flexDirection = layout === 'vertical' ? 'column' : 'row';

  dashboardContainer.appendChild(dashboard);

  // Create chart containers
  const chartInstances = [];

  for (let i = 0; i < charts.length; i++) {
    const chartConfig = charts[i];
    const chartOptions = chartConfig.options || {};

    // Create chart container
    const chartContainer = document.createElement('div');
    chartContainer.className = 'tinyframe-dashboard-item';

    // Set container size based on layout
    if (layout === 'grid') {
      chartContainer.style.width = `calc(${100 / columns}% - 20px)`;
      chartContainer.style.margin = '10px';
    } else {
      chartContainer.style.flex = '1';
      chartContainer.style.margin = '10px';
    }

    dashboard.appendChild(chartContainer);

    // Render chart
    const chart = await renderChart(chartConfig, {
      container: chartContainer,
      width: '100%',
      height: chartOptions.height || '300px',
    });

    chartInstances.push(chart);
  }

  return {
    container: dashboard,
    charts: chartInstances,

    // Method to update all charts
    update(dataFrames) {
      if (!Array.isArray(dataFrames)) {
        dataFrames = [dataFrames];
      }

      chartInstances.forEach((chart, index) => {
        if (index < dataFrames.length) {
          updateChart(chart, dataFrames[index], charts[index].dataOptions);
        }
      });
    },

    // Method to export all charts as images
    async exportAll(options = {}) {
      const images = [];

      for (let i = 0; i < chartInstances.length; i++) {
        const dataUrl = await exportChartAsImage(chartInstances[i], {
          ...options,
          filename: options.filename ?
            `${options.filename}-${i + 1}` :
            undefined,
        });

        images.push(dataUrl);
      }

      return images;
    },
  };
}
