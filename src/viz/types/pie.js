// src/viz/types/pie.js

import { createChartJSConfig } from '../adapters/chartjs.js';
import { categoricalColors } from '../utils/colors.js';
import { formatValue } from '../utils/formatting.js';

/**
 * Creates a pie chart configuration
 * @param {Object} dataFrame - TinyFrameJS DataFrame
 * @param {Object} options - Chart options
 * @param {string} options.x - Column name for labels
 * @param {string} options.y - Column name for values
 * @param {Object} [options.chartOptions] - Additional Chart.js options
 * @returns {Object} Chart configuration object
 */
export function pieChart(dataFrame, options) {
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
    throw new Error('Label column must be specified');
  }

  if (!options.y) {
    throw new Error('Value column must be specified');
  }

  // Create Chart.js configuration
  return createChartJSConfig(dataFrame, {
    ...options,
    type: 'pie',
  });
}

/**
 * Creates a doughnut chart configuration
 * @param {Object} dataFrame - TinyFrameJS DataFrame
 * @param {Object} options - Chart options
 * @param {string} options.x - Column name for labels
 * @param {string} options.y - Column name for values
 * @param {Object} [options.chartOptions] - Additional Chart.js options
 * @returns {Object} Chart configuration object
 */
export function doughnutChart(dataFrame, options) {
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
    throw new Error('Label column must be specified');
  }

  if (!options.y) {
    throw new Error('Value column must be specified');
  }

  // Create pie chart configuration
  const config = createChartJSConfig(dataFrame, {
    ...options,
    type: 'pie',
  });

  // Modify for doughnut type
  config.type = 'doughnut';

  // Add doughnut-specific options
  if (!config.options) {
    config.options = {};
  }

  if (!config.options.cutout) {
    config.options.cutout = options.chartOptions?.cutout || '50%';
  }

  return config;
}

/**
 * Creates a pie chart with a center text or value
 * @param {Object} dataFrame - TinyFrameJS DataFrame
 * @param {Object} options - Chart options
 * @param {string} options.x - Column name for labels
 * @param {string} options.y - Column name for values
 * @param {string|number} options.centerText - Text or value to display in the center
 * @param {Object} [options.chartOptions] - Additional Chart.js options
 * @returns {Object} Chart configuration object
 */
export function pieChartWithCenter(dataFrame, options) {
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
    throw new Error('Label column must be specified');
  }

  if (!options.y) {
    throw new Error('Value column must be specified');
  }

  if (options.centerText === undefined) {
    throw new Error('Center text must be specified');
  }

  // Create doughnut chart configuration
  const config = doughnutChart(dataFrame, options);

  // Add center text plugin
  if (!config.plugins) {
    config.plugins = [];
  }

  config.plugins.push({
    id: 'centerText',
    beforeDraw(chart) {
      const width = chart.width;
      const height = chart.height;
      const ctx = chart.ctx;

      ctx.restore();

      // Font settings
      const fontSize = (height / 114).toFixed(2);
      ctx.font = fontSize + 'em sans-serif';
      ctx.textBaseline = 'middle';

      // Text settings
      const text = options.centerText;
      const textX = Math.round((width - ctx.measureText(text).width) / 2);
      const textY = height / 2;

      // Draw text
      ctx.fillText(text, textX, textY);
      ctx.save();
    },
  });

  return config;
}

/**
 * Creates a polar area chart configuration
 * @param {Object} dataFrame - TinyFrameJS DataFrame
 * @param {Object} options - Chart options
 * @param {string} options.x - Column name for labels
 * @param {string} options.y - Column name for values
 * @param {Object} [options.chartOptions] - Additional Chart.js options
 * @returns {Object} Chart configuration object
 */
export function polarAreaChart(dataFrame, options) {
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
    throw new Error('Label column must be specified');
  }

  if (!options.y) {
    throw new Error('Value column must be specified');
  }

  // Extract data
  const labels = data.map((row) => row[options.x]);
  const values = data.map((row) => row[options.y]);

  // Generate colors
  const colors = categoricalColors(values.length);

  return {
    type: 'polarArea',
    data: {
      labels,
      datasets: [
        {
          data: values,
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
          display: !!options.chartOptions?.title,
          text: options.chartOptions?.title || '',
        },
        tooltip: {
          callbacks: {
            label(context) {
              const value = context.raw;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = Math.round((value / total) * 100);
              return `${context.label}: ${value} (${percentage}%)`;
            },
          },
        },
        legend: {
          position: options.chartOptions?.legendPosition || 'right',
        },
      },
      scales: {
        r: {
          beginAtZero: true,
        },
      },
      ...options.chartOptions,
    },
  };
}

/**
 * Creates a radar chart configuration
 * @param {Object} dataFrame - TinyFrameJS DataFrame
 * @param {Object} options - Chart options
 * @param {string} options.x - Column name for labels (categories)
 * @param {string|string[]} options.y - Column name(s) for values (series)
 * @param {Object} [options.chartOptions] - Additional Chart.js options
 * @returns {Object} Chart configuration object
 */
export function radarChart(dataFrame, options) {
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
    throw new Error('Label column must be specified');
  }

  if (!options.y) {
    throw new Error('Value column(s) must be specified');
  }

  // Extract labels
  const labels = dataFrame.data.map((row) => row[options.x]);

  // Create datasets
  const yColumns = Array.isArray(options.y) ? options.y : [options.y];
  const datasets = [];

  if (yColumns.length === 1) {
    // Single series
    const color = options.chartOptions?.color || categoricalColors(1)[0];

    datasets.push({
      label: options.chartOptions?.label || yColumns[0],
      data: data.map((row) => row[yColumns[0]]),
      backgroundColor: color + '40', // Very transparent
      borderColor: color,
      borderWidth: 2,
      pointBackgroundColor: color,
      pointRadius: 3,
    });
  } else {
    // Multiple series
    const colors = categoricalColors(yColumns.length);

    yColumns.forEach((column, index) => {
      const color = colors[index];

      datasets.push({
        label: column,
        data: data.map((row) => row[column]),
        backgroundColor: color + '40', // Very transparent
        borderColor: color,
        borderWidth: 2,
        pointBackgroundColor: color,
        pointRadius: 3,
      });
    });
  }

  return {
    type: 'radar',
    data: {
      labels,
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
          callbacks: {
            label(context) {
              return `${context.dataset.label}: ${context.raw}`;
            },
          },
        },
        legend: {
          position: options.chartOptions?.legendPosition || 'top',
          display: yColumns.length > 1,
        },
      },
      scales: {
        r: {
          beginAtZero: options.chartOptions?.beginAtZero !== false,
          ticks: {
            backdropColor: 'rgba(255, 255, 255, 0.75)',
          },
        },
      },
      ...options.chartOptions,
    },
  };
}

/**
 * Creates a pie chart showing the proportion of a part to the whole
 * @param {number} value - The value to display
 * @param {number} total - The total value
 * @param {Object} [options] - Chart options
 * @param {string} [options.label='Value'] - Label for the value
 * @param {string} [options.color] - Color for the value segment
 * @param {Object} [options.chartOptions] - Additional Chart.js options
 * @returns {Object} Chart configuration object
 */
export function proportionPieChart(value, total, options = {}) {
  // Validate input
  if (typeof value !== 'number' || isNaN(value)) {
    throw new Error('Value must be a number');
  }

  if (typeof total !== 'number' || isNaN(total) || total <= 0) {
    throw new Error('Total must be a positive number');
  }

  // Calculate proportion
  const proportion = Math.min(1, Math.max(0, value / total));
  const remainder = 1 - proportion;

  // Set colors
  const valueColor = options.color || categoricalColors(1)[0];
  const remainderColor = options.chartOptions?.remainderColor || '#e0e0e0';

  // Create chart configuration
  const config = {
    type: 'doughnut',
    data: {
      labels: [options.label || 'Value', ''],
      datasets: [
        {
          data: [proportion, remainder],
          backgroundColor: [valueColor, remainderColor],
          borderColor: [valueColor, remainderColor],
          borderWidth: 1,
          hoverOffset: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: options.chartOptions?.cutout || '70%',
      plugins: {
        title: {
          display: !!options.chartOptions?.title,
          text: options.chartOptions?.title || '',
        },
        tooltip: {
          callbacks: {
            label(context) {
              if (context.dataIndex === 0) {
                return `${options.label || 'Value'}: ${value} (${(proportion * 100).toFixed(1)}%)`;
              } else {
                return '';
              }
            },
          },
        },
        legend: {
          display: false,
        },
      },
      ...options.chartOptions,
    },
  };

  // Add center text plugin to display the percentage
  if (!config.plugins) {
    config.plugins = [];
  }

  config.plugins.push({
    id: 'centerText',
    beforeDraw(chart) {
      const width = chart.width;
      const height = chart.height;
      const ctx = chart.ctx;

      ctx.restore();

      // Font settings for percentage
      const percentText = `${Math.round(proportion * 100)}%`;
      const percentFontSize = (height / 80).toFixed(2);
      ctx.font = `bold ${percentFontSize}em sans-serif`;
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';
      ctx.fillStyle = options.chartOptions?.centerTextColor || '#333';

      // Draw percentage
      ctx.fillText(percentText, width / 2, height / 2);

      // Font settings for label (smaller)
      const labelText = options.chartOptions?.centerLabel || '';
      if (labelText) {
        const labelFontSize = (height / 160).toFixed(2);
        ctx.font = `${labelFontSize}em sans-serif`;
        ctx.fillStyle = options.chartOptions?.centerLabelColor || '#666';

        // Draw label below percentage
        ctx.fillText(labelText, width / 2, height / 2 + height / 16);
      }

      ctx.save();
    },
  });

  return config;
}
