// src/viz/types/polar.js

/**
 * Polar chart implementation for TinyFrameJS
 */

import { validateDataFrame } from '../utils/validation.js';
import { getColorScheme } from '../utils/colors.js';

/**
 * Creates a polar area chart configuration
 * @param {Object} dataFrame - DataFrame instance
 * @param {Object} options - Chart options
 * @param {string} [options.category] - Column to use for categories
 * @param {string} [options.value] - Column to use for values
 * @param {string} [options.x] - Column to use for categories (alternative to category)
 * @param {string} [options.y] - Column to use for values (alternative to value)
 * @param {Object} [options.chartOptions] - Additional chart options
 * @returns {Object} Chart.js configuration object
 */
export function polarChart(dataFrame, options) {
  // Validate DataFrame
  validateDataFrame(dataFrame);

  // Validate options
  const categoryCol = options.category || options.x;
  const valueCol = options.value || options.y;

  if (!options || !categoryCol || !valueCol) {
    throw new Error('Polar chart requires category/x and value/y options');
  }

  const chartOptions = options.chartOptions || {};

  // Get data from DataFrame
  const data = dataFrame.toArray();

  // Get labels and values
  const labels = data.map((row) => row[categoryCol]);
  const values = data.map((row) => row[valueCol]);

  // Get color scheme
  const colorScheme = getColorScheme(chartOptions.colorScheme || 'qualitative');

  // Create background colors
  const backgroundColor = labels.map((_, index) =>
    colorScheme[index % colorScheme.length]
      .replace('rgb', 'rgba')
      .replace(')', ', 0.7)'),
  );

  // Create border colors
  const borderColor = labels.map(
    (_, index) => colorScheme[index % colorScheme.length],
  );

  // Create Chart.js configuration
  return {
    type: 'polarArea',
    data: {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor,
          borderColor,
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
          text: chartOptions.title || 'Polar Area Chart',
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
        legend: {
          position: chartOptions.legendPosition || 'right',
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
        ...chartOptions.plugins,
      },
      scales: {
        r: {
          ticks: {
            beginAtZero: true,
          },
          ...chartOptions.scales?.r,
        },
        ...chartOptions.scales,
      },
    },
  };
}
