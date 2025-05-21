// src/viz/types/line.js

import { createChartJSConfig } from '../adapters/chartjs.js';
import { getColor } from '../utils/colors.js';
import { formatDate, formatValue } from '../utils/formatting.js';

/**
 * Creates a line chart configuration
 * @param {Object} dataFrame - TinyFrameJS DataFrame
 * @param {Object} options - Chart options
 * @param {string} options.x - Column name for X axis
 * @param {string|string[]} options.y - Column name(s) for Y axis
 * @param {Object} [options.chartOptions] - Additional Chart.js options
 * @returns {Object} Chart configuration object
 */
export function lineChart(dataFrame, options) {
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

  if (!options.x) {
    throw new Error('X-axis column must be specified');
  }

  if (!options.y) {
    throw new Error('Y-axis column(s) must be specified');
  }

  // Create Chart.js configuration
  return createChartJSConfig(dataFrame, {
    ...options,
    type: 'line',
  });
}

/**
 * Creates a multi-line chart with multiple y-axes
 * @param {Object} dataFrame - TinyFrameJS DataFrame
 * @param {Object} options - Chart options
 * @param {string} options.x - Column name for X axis
 * @param {Array<{column: string, axis: string, color: string}>} options.series - Series configuration
 * @param {Object} [options.chartOptions] - Additional Chart.js options
 * @returns {Object} Chart configuration object
 */
export function multiAxisLineChart(dataFrame, options) {
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

  if (!options.x) {
    throw new Error('X-axis column must be specified');
  }

  if (
    !options.series ||
    !Array.isArray(options.series) ||
    options.series.length === 0
  ) {
    throw new Error('Series configuration must be provided');
  }

  // Extract data
  const xValues = data.map((row) => row[options.x]);

  // Create datasets
  const datasets = options.series.map((series, index) => {
    const color = series.color || getColor(index);

    return {
      label: series.label || series.column,
      data: data.map((row) => row[series.column]),
      borderColor: color,
      backgroundColor: color + '20', // Add transparency
      fill: false,
      tension: options.chartOptions?.tension || 0.1,
      pointRadius: options.chartOptions?.pointRadius || 3,
      yAxisID: series.axis || 'y',
    };
  });

  // Determine x-axis type
  const xAxisType = determineAxisType(xValues);

  // Create scales configuration
  const scales = {
    x: {
      type: xAxisType,
      title: {
        display: true,
        text: options.chartOptions?.xLabel || options.x,
      },
    },
  };

  // Create y-axes
  const axes = new Set(options.series.map((s) => s.axis || 'y'));

  [...axes].forEach((axis, index) => {
    const position = index % 2 === 0 ? 'left' : 'right';

    scales[axis] = {
      type: 'linear',
      position,
      title: {
        display: true,
        text: options.chartOptions?.yLabels?.[axis] || '',
      },
      grid: {
        display: index === 0, // Only show grid for the first axis
      },
    };
  });

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
          display: !!options.chartOptions?.title,
          text: options.chartOptions?.title || '',
        },
        tooltip: {
          mode: 'index',
          intersect: false,
        },
        legend: {
          position: options.chartOptions?.legendPosition || 'top',
        },
      },
      scales,
      ...options.chartOptions,
    },
  };
}

/**
 * Creates an area chart (filled line chart)
 * @param {Object} dataFrame - TinyFrameJS DataFrame
 * @param {Object} options - Chart options
 * @param {string} options.x - Column name for X axis
 * @param {string|string[]} options.y - Column name(s) for Y axis
 * @param {boolean} [options.stacked=false] - Whether to stack the areas
 * @param {Object} [options.chartOptions] - Additional Chart.js options
 * @returns {Object} Chart configuration object
 */
export function areaChart(dataFrame, options) {
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

  if (!options.x) {
    throw new Error('X-axis column must be specified');
  }

  if (!options.y) {
    throw new Error('Y-axis column(s) must be specified');
  }

  const stacked = options.stacked || false;

  // Create Chart.js configuration
  const config = createChartJSConfig(dataFrame, {
    ...options,
    type: 'line',
    chartOptions: {
      ...options.chartOptions,
      fill: true,
    },
  });

  // Modify datasets for area chart
  config.data.datasets.forEach((dataset, index) => {
    dataset.fill = stacked ? 'origin' : index > 0 ? '-1' : 'origin';
    dataset.backgroundColor = dataset.borderColor + '80'; // Add more opacity
  });

  // Add stacked option if needed
  if (stacked) {
    if (!config.options.scales) {
      config.options.scales = {};
    }

    config.options.scales.y = {
      ...config.options.scales.y,
      stacked: true,
    };
  }

  return config;
}

/**
 * Creates a time series chart optimized for time data
 * @param {Object} dataFrame - TinyFrameJS DataFrame
 * @param {Object} options - Chart options
 * @param {string} options.x - Column name for X axis (should contain date/time values)
 * @param {string|string[]} options.y - Column name(s) for Y axis
 * @param {string} [options.timeUnit='day'] - Time unit ('hour', 'day', 'week', 'month', 'quarter', 'year')
 * @param {Object} [options.chartOptions] - Additional Chart.js options
 * @returns {Object} Chart configuration object
 */
export function timeSeriesChart(dataFrame, options) {
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

  if (!options.x) {
    throw new Error('X-axis column must be specified');
  }

  if (!options.y) {
    throw new Error('Y-axis column(s) must be specified');
  }

  // Ensure x values are dates
  const xValues = data.map((row) => {
    const value = row[options.x];
    return value instanceof Date ? value : new Date(value);
  });

  // Check if all dates are valid
  if (xValues.some((date) => isNaN(date.getTime()))) {
    throw new Error('X-axis column must contain valid date/time values');
  }

  // Create Chart.js configuration
  const config = createChartJSConfig(dataFrame, {
    ...options,
    type: 'line',
    chartOptions: {
      ...options.chartOptions,
      timeUnit: options.timeUnit || 'day',
    },
  });

  // Ensure x-axis is time
  if (config.options.scales && config.options.scales.x) {
    config.options.scales.x.type = 'time';
    config.options.scales.x.time = {
      unit: options.timeUnit || 'day',
      displayFormats: {
        hour: 'HH:mm',
        day: 'MMM D',
        week: 'MMM D',
        month: 'MMM YYYY',
        quarter: 'MMM YYYY',
        year: 'YYYY',
      },
      tooltipFormat: 'MMM D, YYYY',
    };
  }

  // Replace labels with date objects
  config.data.labels = xValues;

  return config;
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
