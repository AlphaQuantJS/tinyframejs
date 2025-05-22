// src/viz/types/area.js

/**
 * Area chart implementation for TinyFrameJS
 */

import { validateDataFrame } from '../utils/validation.js';
import { getColorScheme } from '../utils/colors.js';

/**
 * Creates an area chart configuration
 * @param {Object} dataFrame - DataFrame instance
 * @param {Object} options - Chart options
 * @param {string} [options.x] - Column to use for x-axis
 * @param {string|string[]} [options.y] - Column(s) to use for y-axis
 * @param {string} [options.category] - Column to use for x-axis (alternative to x)
 * @param {string|string[]} [options.values] - Column(s) to use for y-axis (alternative to y)
 * @param {Object} [options.chartOptions] - Additional chart options
 * @returns {Object} Chart.js configuration object
 */
export function areaChart(dataFrame, options = {}) {
  // Validate DataFrame
  validateDataFrame(dataFrame);

  // Validate options
  const xCol = options.x || options.category;
  const yCol = options.y || options.values;

  if (!xCol || !yCol) {
    throw new Error('Area chart requires x/category and y/values options');
  }

  const chartOptions = options.chartOptions || {};

  // Convert to array if single column
  const yColumns = Array.isArray(yCol) ? yCol : [yCol];

  // Get data from DataFrame
  const data = dataFrame.toArray();

  // Get color scheme
  const colorScheme = getColorScheme(chartOptions.colorScheme || 'default');

  // Create datasets
  const datasets = yColumns.map((column, index) => {
    const color = colorScheme[index % colorScheme.length];

    return {
      label: column,
      data: data.map((row) => ({ x: row[xCol], y: row[column] })),
      backgroundColor: color.replace('rgb', 'rgba').replace(')', ', 0.2)'),
      borderColor: color,
      borderWidth: 1,
      fill: true,
      tension: 0.4, // Adds a slight curve to the line
    };
  });

  // Create Chart.js configuration
  return {
    type: 'line', // Use line chart with fill for area chart
    data: {
      datasets,
    },
    options: {
      ...chartOptions,
      scales: {
        x: {
          type: 'category',
          title: {
            display: true,
            text: xCol,
          },
        },
        y: {
          title: {
            display: true,
            text: yColumns.length === 1 ? yColumns[0] : 'Values',
          },
        },
        ...chartOptions.scales,
      },
      plugins: {
        title: {
          display: true,
          text: chartOptions.title || 'Area Chart',
          font: {
            size: 16,
          },
        },
        subtitle: {
          display: !!chartOptions.subtitle,
          text: chartOptions.subtitle || '',
          font: {
            size: 14,
          },
        },
        ...chartOptions.plugins,
      },
    },
  };
}
