// src/viz/types/radar.js

/**
 * Radar chart implementation for TinyFrameJS
 */

import { validateDataFrame } from '../utils/validation.js';
import { createChartJSConfig } from '../adapters/chartjs.js';
import { getColorScheme } from '../utils/colors.js';

/**
 * Creates a radar chart configuration
 * @param {Object} dataFrame - DataFrame instance
 * @param {Object} options - Chart options
 * @param {string} [options.category] - Column to use for categories (radar axes)
 * @param {string|string[]} [options.values] - Column(s) to use for values
 * @param {string} [options.x] - Column to use for categories (alternative to category)
 * @param {string|string[]} [options.y] - Column(s) to use for values (alternative to values)
 * @param {Object} [options.chartOptions] - Additional chart options
 * @returns {Object} Chart.js configuration object
 */
export function radarChart(dataFrame, options) {
  // Validate DataFrame
  validateDataFrame(dataFrame);

  // Validate options
  const categoryCol = options.category || options.x;
  const valueColumns = options.values || options.y;

  if (!options || !categoryCol || !valueColumns) {
    throw new Error('Radar chart requires category/x and values/y options');
  }

  const chartOptions = options.chartOptions || {};

  // Convert to array if single column
  const valCols = Array.isArray(valueColumns) ? valueColumns : [valueColumns];

  // Get data from DataFrame
  const data = dataFrame.toArray();

  // Get unique categories for radar axes
  const categories = [...new Set(data.map((row) => row[categoryCol]))];

  // Get color scheme
  const colorScheme = getColorScheme(chartOptions.colorScheme || 'default');

  // Create datasets
  const datasets = valCols.map((column, index) => {
    const color = colorScheme[index % colorScheme.length];

    // For each value column, create a dataset with values for each category
    const categoryValues = {};
    data.forEach((row) => {
      categoryValues[row[categoryCol]] = row[column];
    });

    return {
      label: column,
      data: categories.map((cat) => categoryValues[cat] || 0),
      backgroundColor: color.replace('rgb', 'rgba').replace(')', ', 0.2)'),
      borderColor: color,
      borderWidth: 1,
      pointBackgroundColor: color,
      pointRadius: 3,
    };
  });

  // Create Chart.js configuration
  return {
    type: 'radar',
    data: {
      labels: categories,
      datasets,
    },
    options: {
      ...chartOptions,
      scales: {
        r: {
          angleLines: {
            display: true,
          },
          suggestedMin: 0,
          ...chartOptions.scales?.r,
        },
        ...chartOptions.scales,
      },
      plugins: {
        title: {
          display: true,
          text: chartOptions.title || 'Radar Chart',
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
