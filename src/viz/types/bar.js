// src/viz/types/bar.js

import { createChartJSConfig } from '../adapters/chartjs.js';
import { getColor, categoricalColors } from '../utils/colors.js';
import { formatValue } from '../utils/formatting.js';

/**
 * Creates a bar chart configuration
 * @param {Object} dataFrame - TinyFrameJS DataFrame
 * @param {Object} options - Chart options
 * @param {string} options.x - Column name for X axis
 * @param {string|string[]} options.y - Column name(s) for Y axis
 * @param {Object} [options.chartOptions] - Additional Chart.js options
 * @returns {Object} Chart configuration object
 */
export function barChart(dataFrame, options) {
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
    type: 'bar',
  });
}

/**
 * Creates a horizontal bar chart configuration
 * @param {Object} dataFrame - TinyFrameJS DataFrame
 * @param {Object} options - Chart options
 * @param {string} options.x - Column name for X axis (will be displayed on Y axis)
 * @param {string|string[]} options.y - Column name(s) for Y axis (will be displayed on X axis)
 * @param {Object} [options.chartOptions] - Additional Chart.js options
 * @returns {Object} Chart configuration object
 */
export function horizontalBarChart(dataFrame, options) {
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
  const config = createChartJSConfig(dataFrame, {
    ...options,
    type: 'bar',
  });

  // Modify for horizontal orientation
  config.options = config.options || {};
  config.options.indexAxis = 'y';

  // Swap axis labels
  if (
    config.options.scales &&
    config.options.scales.x &&
    config.options.scales.y
  ) {
    const temp = config.options.scales.x.title.text;
    config.options.scales.x.title.text = config.options.scales.y.title.text;
    config.options.scales.y.title.text = temp;
  }

  return config;
}

/**
 * Creates a stacked bar chart configuration
 * @param {Object} dataFrame - TinyFrameJS DataFrame
 * @param {Object} options - Chart options
 * @param {string} options.x - Column name for X axis
 * @param {string[]} options.y - Column names for Y axis (multiple required)
 * @param {boolean} [options.horizontal=false] - Whether to create a horizontal stacked bar chart
 * @param {Object} [options.chartOptions] - Additional Chart.js options
 * @returns {Object} Chart configuration object
 */
export function stackedBarChart(dataFrame, options) {
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

  if (!options.y || !Array.isArray(options.y) || options.y.length < 2) {
    throw new Error(
      'Multiple Y-axis columns must be specified for a stacked bar chart',
    );
  }

  // Create Chart.js configuration
  const config = createChartJSConfig(dataFrame, {
    ...options,
    type: 'bar',
  });

  // Modify for stacked bars
  config.options = config.options || {};
  config.options.scales = config.options.scales || {};

  // Set horizontal orientation if needed
  if (options.horizontal) {
    config.options.indexAxis = 'y';

    // Swap axis labels
    if (config.options.scales.x && config.options.scales.y) {
      const temp = config.options.scales.x.title.text;
      config.options.scales.x.title.text = config.options.scales.y.title.text;
      config.options.scales.y.title.text = temp;
    }

    // Configure stacking on x-axis
    config.options.scales.x = {
      ...config.options.scales.x,
      stacked: true,
    };
  } else {
    // Configure stacking on y-axis
    config.options.scales.y = {
      ...config.options.scales.y,
      stacked: true,
    };
  }

  // Always stack the category axis
  const categoryAxis = options.horizontal ? 'y' : 'x';
  config.options.scales[categoryAxis] = {
    ...config.options.scales[categoryAxis],
    stacked: true,
  };

  return config;
}

/**
 * Creates a grouped bar chart configuration
 * @param {Object} dataFrame - TinyFrameJS DataFrame
 * @param {Object} options - Chart options
 * @param {string} options.x - Column name for X axis
 * @param {string[]} options.y - Column names for Y axis (multiple required)
 * @param {boolean} [options.horizontal=false] - Whether to create a horizontal grouped bar chart
 * @param {Object} [options.chartOptions] - Additional Chart.js options
 * @returns {Object} Chart configuration object
 */
export function groupedBarChart(dataFrame, options) {
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

  if (!options.y || !Array.isArray(options.y) || options.y.length < 2) {
    throw new Error(
      'Multiple Y-axis columns must be specified for a grouped bar chart',
    );
  }

  // Create Chart.js configuration
  const config = createChartJSConfig(dataFrame, {
    ...options,
    type: 'bar',
  });

  // Modify for horizontal orientation if needed
  if (options.horizontal) {
    config.options = config.options || {};
    config.options.indexAxis = 'y';

    // Swap axis labels
    if (
      config.options.scales &&
      config.options.scales.x &&
      config.options.scales.y
    ) {
      const temp = config.options.scales.x.title.text;
      config.options.scales.x.title.text = config.options.scales.y.title.text;
      config.options.scales.y.title.text = temp;
    }
  }

  return config;
}

/**
 * Creates a histogram chart configuration
 * @param {Object} dataFrame - TinyFrameJS DataFrame
 * @param {Object} options - Chart options
 * @param {string} options.column - Column name for data
 * @param {number} [options.bins=10] - Number of bins
 * @param {Object} [options.chartOptions] - Additional Chart.js options
 * @returns {Object} Chart configuration object
 */
export function histogram(dataFrame, options) {
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

  if (!options.column) {
    throw new Error('Data column must be specified');
  }

  // Extract data
  const values = data
    .map((row) => row[options.column])
    .filter((val) => typeof val === 'number' && !isNaN(val));

  if (values.length === 0) {
    throw new Error('No numeric data found in the specified column');
  }

  // Calculate bins
  const bins = options.bins || 10;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const binWidth = (max - min) / bins;

  // Create histogram data
  const histogramData = Array(bins).fill(0);
  const binLabels = [];

  // Create bin labels
  for (let i = 0; i < bins; i++) {
    const binStart = min + i * binWidth;
    const binEnd = binStart + binWidth;
    binLabels.push(`${binStart.toFixed(2)} - ${binEnd.toFixed(2)}`);
  }

  // Count values in each bin
  values.forEach((value) => {
    // Handle edge case for the maximum value
    if (value === max) {
      histogramData[bins - 1]++;
      return;
    }

    const binIndex = Math.floor((value - min) / binWidth);
    histogramData[binIndex]++;
  });

  // Create chart configuration
  const color = options.chartOptions?.color || getColor(0);

  return {
    type: 'bar',
    data: {
      labels: binLabels,
      datasets: [
        {
          label: options.chartOptions?.label || options.column,
          data: histogramData,
          backgroundColor: color,
          borderColor: color,
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: !!options.chartOptions?.title,
          text: options.chartOptions?.title || `Histogram of ${options.column}`,
        },
        tooltip: {
          callbacks: {
            label(context) {
              return `Count: ${context.raw}`;
            },
          },
        },
        legend: {
          display: !!options.chartOptions?.showLegend,
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: options.chartOptions?.xLabel || options.column,
          },
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: options.chartOptions?.yLabel || 'Frequency',
          },
        },
      },
      ...options.chartOptions,
    },
  };
}

/**
 * Creates a pareto chart (bar chart sorted by value with cumulative line)
 * @param {Object} dataFrame - TinyFrameJS DataFrame
 * @param {Object} options - Chart options
 * @param {string} options.x - Column name for categories
 * @param {string} options.y - Column name for values
 * @param {Object} [options.chartOptions] - Additional Chart.js options
 * @returns {Object} Chart configuration object
 */
export function paretoChart(dataFrame, options) {
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
    throw new Error('Y-axis column must be specified');
  }

  // Extract and sort data
  // Use the data array created from DataFrame.toArray()
  data.sort((a, b) => b[options.y] - a[options.y]);

  // Extract sorted categories and values
  const categories = data.map((row) => row[options.x]);
  const values = data.map((row) => row[options.y]);

  // Calculate cumulative values and percentages
  const total = values.reduce((sum, val) => sum + val, 0);
  let cumulative = 0;
  const cumulativePercentages = values.map((value) => {
    cumulative += value;
    return (cumulative / total) * 100;
  });

  // Create chart configuration
  const barColor = options.chartOptions?.barColor || getColor(0);
  const lineColor = options.chartOptions?.lineColor || getColor(1);

  return {
    type: 'bar',
    data: {
      labels: categories,
      datasets: [
        {
          label: options.chartOptions?.barLabel || options.y,
          data: values,
          backgroundColor: barColor,
          borderColor: barColor,
          borderWidth: 1,
          order: 1,
        },
        {
          label: options.chartOptions?.lineLabel || 'Cumulative %',
          data: cumulativePercentages,
          type: 'line',
          borderColor: lineColor,
          backgroundColor: 'transparent',
          borderWidth: 2,
          pointRadius: 3,
          pointBackgroundColor: lineColor,
          yAxisID: 'percentage',
          order: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: !!options.chartOptions?.title,
          text: options.chartOptions?.title || 'Pareto Chart',
        },
        tooltip: {
          callbacks: {
            label(context) {
              const datasetLabel = context.dataset.label;
              const value = context.raw;

              if (context.datasetIndex === 0) {
                return `${datasetLabel}: ${value}`;
              } else {
                return `${datasetLabel}: ${value.toFixed(1)}%`;
              }
            },
          },
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: options.chartOptions?.xLabel || options.x,
          },
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: options.chartOptions?.yLabel || options.y,
          },
        },
        percentage: {
          position: 'right',
          beginAtZero: true,
          max: 100,
          title: {
            display: true,
            text: 'Cumulative %',
          },
          grid: {
            drawOnChartArea: false,
          },
        },
      },
      ...options.chartOptions,
    },
  };
}
