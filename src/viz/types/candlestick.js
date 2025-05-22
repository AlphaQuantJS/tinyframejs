// src/viz/types/candlestick.js

/**
 * Candlestick chart implementation for TinyFrameJS
 */

import { validateDataFrame } from '../utils/validation.js';

/**
 * Creates a candlestick chart configuration
 * @param {Object} dataFrame - DataFrame instance
 * @param {Object} options - Chart options
 * @param {string} [options.date] - Column to use for date/time
 * @param {string} [options.open] - Column to use for opening values
 * @param {string} [options.high] - Column to use for high values
 * @param {string} [options.low] - Column to use for low values
 * @param {string} [options.close] - Column to use for closing values
 * @param {string} [options.x] - Column to use for date/time (alternative to date)
 * @param {string} [options.o] - Column to use for opening values (alternative to open)
 * @param {string} [options.h] - Column to use for high values (alternative to high)
 * @param {string} [options.l] - Column to use for low values (alternative to low)
 * @param {string} [options.c] - Column to use for closing values (alternative to close)
 * @param {Object} [options.chartOptions] - Additional chart options
 * @returns {Object} Chart.js configuration object
 */
export function candlestickChart(dataFrame, options) {
  // Validate DataFrame
  validateDataFrame(dataFrame);

  // Validate options
  const dateCol = options.date || options.x;
  const openCol = options.open || options.o;
  const highCol = options.high || options.h;
  const lowCol = options.low || options.l;
  const closeCol = options.close || options.c;

  if (!options || !dateCol || !openCol || !highCol || !lowCol || !closeCol) {
    throw new Error(
      'Candlestick chart requires date/x, open/o, high/h, low/l, and close/c options',
    );
  }

  const chartOptions = options.chartOptions || {};

  // Get data from DataFrame
  const data = dataFrame.toArray();

  // Prepare data for candlestick chart
  const ohlcData = data.map((row) => ({
    x: row[dateCol],
    o: row[openCol],
    h: row[highCol],
    l: row[lowCol],
    c: row[closeCol],
  }));

  // Create Chart.js configuration
  return {
    type: 'candlestick', // This requires chart.js-financial plugin
    data: {
      datasets: [
        {
          label: 'OHLC',
          data: ohlcData,
          color: {
            up: chartOptions.upColor || 'rgba(75, 192, 192, 1)',
            down: chartOptions.downColor || 'rgba(255, 99, 132, 1)',
            unchanged: chartOptions.unchangedColor || 'rgba(201, 203, 207, 1)',
          },
        },
      ],
    },
    options: {
      ...chartOptions,
      scales: {
        x: {
          type: 'time',
          time: {
            unit: chartOptions.timeUnit || 'day',
          },
          title: {
            display: true,
            text: chartOptions.xTitle || dateCol,
          },
          ...chartOptions.scales?.x,
        },
        y: {
          title: {
            display: true,
            text: chartOptions.yTitle || 'Price',
          },
          ...chartOptions.scales?.y,
        },
        ...chartOptions.scales,
      },
      plugins: {
        title: {
          display: true,
          text: chartOptions.title || 'Candlestick Chart',
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
        tooltip: {
          callbacks: {
            label(context) {
              const point = context.raw;
              return [
                `Open: ${point.o}`,
                `High: ${point.h}`,
                `Low: ${point.l}`,
                `Close: ${point.c}`,
              ];
            },
          },
          ...chartOptions.plugins?.tooltip,
        },
        ...chartOptions.plugins,
      },
    },
  };
}
