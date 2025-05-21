// src/viz/adapters/chartjs.js

import { getColor, categoricalColors } from '../utils/colors.js';
import {
  calculateScaleRange,
  generateTicks,
  formatNumber,
} from '../utils/scales.js';
import { formatDate, truncateText } from '../utils/formatting.js';

/**
 * Adapter for Chart.js library
 * Converts TinyFrameJS data to Chart.js configuration
 */

/**
 * Creates a Chart.js dataset configuration from DataFrame data
 * @param {Object} dataFrame - TinyFrameJS DataFrame
 * @param {Object} options - Chart options
 * @param {string} options.x - Column name for X axis
 * @param {string|string[]} options.y - Column name(s) for Y axis
 * @param {string} options.type - Chart type ('line', 'bar', 'scatter', 'pie')
 * @param {Object} [options.chartOptions] - Additional Chart.js options
 * @returns {Object} Chart.js configuration object
 */
export function createChartJSConfig(dataFrame, options) {
  const { x, y, type = 'line', chartOptions = {} } = options;

  // Validate input
  if (
    !dataFrame ||
    typeof dataFrame.toArray !== 'function' ||
    typeof dataFrame.columns === 'undefined'
  ) {
    throw new Error('Invalid DataFrame provided');
  }

  // Convert DataFrame to array of objects for easier processing
  const data = dataFrame.toArray();

  if (!x) {
    throw new Error('X-axis column must be specified');
  }

  if (!y) {
    throw new Error('Y-axis column(s) must be specified');
  }

  // Process data based on chart type
  switch (type.toLowerCase()) {
    case 'line':
      return createLineChartConfig(dataFrame, options);
    case 'bar':
      return createBarChartConfig(dataFrame, options);
    case 'scatter':
      return createScatterChartConfig(dataFrame, options);
    case 'pie':
      return createPieChartConfig(dataFrame, options);
    default:
      throw new Error(`Unsupported chart type: ${type}`);
  }
}

/**
 * Creates a line chart configuration
 * @param {Object} dataFrame - TinyFrameJS DataFrame
 * @param {Object} options - Chart options
 * @returns {Object} Chart.js configuration
 * @private
 */
function createLineChartConfig(dataFrame, options) {
  const { x, y, chartOptions = {} } = options;
  const yColumns = Array.isArray(y) ? y : [y];

  // Convert DataFrame to array of objects for easier processing
  const data = dataFrame.toArray();

  // Extract data
  const xValues = data.map((row) => row[x]);
  const datasets = yColumns.map((column, index) => {
    const color = getColor(index);

    return {
      label: column,
      data: data.map((row) => row[column]),
      borderColor: color,
      backgroundColor: color + '20', // Add transparency
      fill: chartOptions.fill || false,
      tension: chartOptions.tension || 0.1,
      pointRadius: chartOptions.pointRadius || 3,
    };
  });

  // Determine x-axis type
  const xAxisType = determineAxisType(xValues);

  return {
    type: 'line',
    data: {
      labels: xValues,
      datasets,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: !!chartOptions.title,
          text: chartOptions.title || '',
        },
        tooltip: {
          mode: 'index',
          intersect: false,
        },
        legend: {
          position: chartOptions.legendPosition || 'top',
          display: yColumns.length > 1,
        },
      },
      scales: createScales(
        xValues,
        data.map((row) => Math.max(...yColumns.map((col) => row[col] || 0))),
        xAxisType,
        chartOptions,
      ),
      ...chartOptions,
    },
  };
}

/**
 * Creates a bar chart configuration
 * @param {Object} dataFrame - TinyFrameJS DataFrame
 * @param {Object} options - Chart options
 * @returns {Object} Chart.js configuration
 * @private
 */
function createBarChartConfig(dataFrame, options) {
  const { x, y, chartOptions = {} } = options;
  const yColumns = Array.isArray(y) ? y : [y];

  // Convert DataFrame to array of objects for easier processing
  const data = dataFrame.toArray();

  // Extract data
  const xValues = data.map((row) => row[x]);
  const datasets = yColumns.map((column, index) => {
    const color = getColor(index);

    return {
      label: column,
      data: data.map((row) => row[column]),
      backgroundColor: color,
      borderColor: color,
      borderWidth: 1,
    };
  });

  // Determine x-axis type
  const xAxisType = determineAxisType(xValues);

  return {
    type: 'bar',
    data: {
      labels: xValues,
      datasets,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: !!chartOptions.title,
          text: chartOptions.title || '',
        },
        tooltip: {
          mode: 'index',
          intersect: false,
        },
        legend: {
          position: chartOptions.legendPosition || 'top',
          display: yColumns.length > 1,
        },
      },
      scales: createScales(
        xValues,
        data.map((row) => Math.max(...yColumns.map((col) => row[col] || 0))),
        xAxisType,
        chartOptions,
      ),
      ...chartOptions,
    },
  };
}

/**
 * Creates a scatter chart configuration
 * @param {Object} dataFrame - TinyFrameJS DataFrame
 * @param {Object} options - Chart options
 * @returns {Object} Chart.js configuration
 * @private
 */
function createScatterChartConfig(dataFrame, options) {
  const { x, y, chartOptions = {} } = options;
  const yColumns = Array.isArray(y) ? y : [y];

  // Convert DataFrame to array of objects for easier processing
  const data = dataFrame.toArray();

  // Extract data
  const datasets = yColumns.map((column, index) => {
    const color = getColor(index);

    return {
      label: column,
      data: data.map((row) => ({
        x: row[x],
        y: row[column],
      })),
      backgroundColor: color,
      borderColor: color,
      pointRadius: chartOptions.pointRadius || 5,
      pointHoverRadius: chartOptions.pointHoverRadius || 8,
    };
  });

  // Get all x and y values for scale calculation
  const xValues = data.map((row) => row[x]);
  const yValues = data.flatMap((row) => yColumns.map((col) => row[col]));

  // Determine axis types
  const xAxisType = determineAxisType(xValues);
  const yAxisType = 'linear'; // Scatter plots always use linear y-axis

  return {
    type: 'scatter',
    data: {
      datasets,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: !!chartOptions.title,
          text: chartOptions.title || '',
        },
        tooltip: {
          callbacks: {
            label(context) {
              return `${context.dataset.label}: (${context.parsed.x}, ${context.parsed.y})`;
            },
          },
        },
        legend: {
          position: chartOptions.legendPosition || 'top',
          display: yColumns.length > 1,
        },
      },
      scales: {
        x: {
          type: xAxisType,
          title: {
            display: true,
            text: chartOptions.xLabel || x,
          },
        },
        y: {
          type: yAxisType,
          title: {
            display: true,
            text:
              chartOptions.yLabel || (yColumns.length === 1 ? yColumns[0] : ''),
          },
        },
      },
      ...chartOptions,
    },
  };
}

/**
 * Creates a pie chart configuration
 * @param {Object} dataFrame - TinyFrameJS DataFrame
 * @param {Object} options - Chart options
 * @returns {Object} Chart.js configuration
 * @private
 */
function createPieChartConfig(dataFrame, options) {
  const { x, y, chartOptions = {} } = options;

  if (Array.isArray(y) && y.length > 1) {
    throw new Error('Pie charts support only one data series');
  }

  // Convert DataFrame to array of objects for easier processing
  const dataArray = dataFrame.toArray();

  const yColumn = Array.isArray(y) ? y[0] : y;

  // Extract data
  const labels = dataArray.map((row) => row[x]);
  const data = dataArray.map((row) => row[yColumn]);

  // Generate colors
  const colors = categoricalColors(data.length);

  return {
    type: 'pie',
    data: {
      labels,
      datasets: [
        {
          data,
          backgroundColor: colors,
          borderColor: colors.map((color) => color),
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: !!chartOptions.title,
          text: chartOptions.title || '',
        },
        tooltip: {
          callbacks: {
            label(context) {
              const value = context.parsed;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = Math.round((value / total) * 100);
              return `${context.label}: ${value} (${percentage}%)`;
            },
          },
        },
        legend: {
          position: chartOptions.legendPosition || 'right',
        },
      },
      ...chartOptions,
    },
  };
}

/**
 * Determines the type of axis based on data values
 * @param {Array} values - Array of values
 * @returns {string} Axis type ('category', 'linear', 'time')
 * @private
 */
function determineAxisType(values) {
  if (!values || values.length === 0) {
    return 'category';
  }

  // Check if all values are dates
  const allDates = values.every(
    (value) => value instanceof Date || !isNaN(new Date(value).getTime()),
  );

  if (allDates) {
    return 'time';
  }

  // Check if all values are numbers
  const allNumbers = values.every(
    (value) =>
      typeof value === 'number' ||
      (typeof value === 'string' && !isNaN(Number(value))),
  );

  if (allNumbers) {
    return 'linear';
  }

  // Default to category
  return 'category';
}

/**
 * Creates scale configurations for Chart.js
 * @param {Array} xValues - X-axis values
 * @param {Array} yValues - Y-axis values
 * @param {string} xAxisType - X-axis type
 * @param {Object} chartOptions - Additional chart options
 * @returns {Object} Scales configuration
 * @private
 */
function createScales(xValues, yValues, xAxisType, chartOptions = {}) {
  // Create y-axis scale
  const yScale = {
    beginAtZero: chartOptions.beginAtZero !== false,
    title: {
      display: true,
      text: chartOptions.yLabel || '',
    },
  };

  // Create x-axis scale based on type
  const xScale = {
    type: xAxisType,
    title: {
      display: true,
      text: chartOptions.xLabel || '',
    },
  };

  // Add time-specific options if needed
  if (xAxisType === 'time') {
    xScale.time = {
      unit: chartOptions.timeUnit || 'day',
      displayFormats: {
        day: 'MMM D',
        week: 'MMM D',
        month: 'MMM YYYY',
        quarter: 'MMM YYYY',
        year: 'YYYY',
      },
      ...chartOptions.timeOptions,
    };
  }

  return {
    x: xScale,
    y: yScale,
  };
}

/**
 * Loads Chart.js dynamically if not already available
 * @returns {Promise<Object>} Chart.js library
 */
export async function loadChartJS() {
  // Check if Chart is already available
  if (typeof window !== 'undefined' && window.Chart) {
    return window.Chart;
  }

  // In browser environment, load from CDN
  if (typeof window !== 'undefined') {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
      script.onload = () => resolve(window.Chart);
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // In Node.js environment, require the module
  if (typeof require !== 'undefined') {
    try {
      return require('chart.js');
    } catch (error) {
      throw new Error(
        'Chart.js is not installed. Please install it with: npm install chart.js',
      );
    }
  }

  throw new Error('Unable to load Chart.js in the current environment');
}
