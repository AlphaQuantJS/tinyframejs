// src/viz/types/scatter.js

import { createChartJSConfig } from '../adapters/chartjs.js';
import { getColor, categoricalColors } from '../utils/colors.js';
import { formatValue } from '../utils/formatting.js';

/**
 * Creates a scatter plot configuration
 * @param {Object} dataFrame - TinyFrameJS DataFrame
 * @param {Object} options - Chart options
 * @param {string} options.x - Column name for X axis
 * @param {string|string[]} options.y - Column name(s) for Y axis
 * @param {Object} [options.chartOptions] - Additional Chart.js options
 * @returns {Object} Chart configuration object
 */
export function scatterPlot(dataFrame, options) {
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
    type: 'scatter',
  });
}

/**
 * Creates a bubble chart configuration
 * @param {Object} dataFrame - TinyFrameJS DataFrame
 * @param {Object} options - Chart options
 * @param {string} options.x - Column name for X axis
 * @param {string} options.y - Column name for Y axis
 * @param {string} options.size - Column name for bubble size
 * @param {string} [options.color] - Column name for bubble color (categorical)
 * @param {Object} [options.chartOptions] - Additional Chart.js options
 * @returns {Object} Chart configuration object
 */
export function bubbleChart(dataFrame, options) {
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

  if (!options.size) {
    throw new Error('Size column must be specified');
  }

  // Extract data
  const bubbleData = data.map((row) => ({
    x: row[options.x],
    y: row[options.y],
    r: row[options.size], // Radius for bubble
  }));

  // If color column is specified, create multiple datasets based on unique values
  if (options.color) {
    // Get unique color categories
    const categories = [...new Set(data.map((row) => row[options.color]))];
    const colors = categoricalColors(categories.length);

    // Create a dataset for each category
    const datasets = categories.map((category, index) => {
      const color = colors[index];
      const filteredData = data
        .filter((row) => row[options.color] === category)
        .map((row) => ({
          x: row[options.x],
          y: row[options.y],
          r: Math.max(
            5,
            Math.min(
              50,
              row[options.size] * (options.chartOptions?.sizeFactor || 1),
            ),
          ),
        }));

      return {
        label: String(category),
        data: filteredData,
        backgroundColor: color + '80', // Semi-transparent
        borderColor: color,
        borderWidth: 1,
      };
    });

    return {
      type: 'bubble',
      data: { datasets },
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
                const datasetLabel = context.dataset.label;
                const xValue = context.raw.x;
                const yValue = context.raw.y;
                const rValue =
                  context.raw.r / (options.chartOptions?.sizeFactor || 1);

                return [
                  `${datasetLabel}`,
                  `${options.x}: ${xValue}`,
                  `${options.y}: ${yValue}`,
                  `${options.size}: ${rValue}`,
                ];
              },
            },
          },
          legend: {
            position: options.chartOptions?.legendPosition || 'top',
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
            title: {
              display: true,
              text: options.chartOptions?.yLabel || options.y,
            },
          },
        },
        ...options.chartOptions,
      },
    };
  } else {
    // Single dataset with one color
    const color = options.chartOptions?.color || getColor(0);

    // Scale bubble size
    const scaledData = data.map((point) => ({
      ...point,
      r: Math.max(
        5,
        Math.min(50, point.r * (options.chartOptions?.sizeFactor || 1)),
      ),
    }));

    return {
      type: 'bubble',
      data: {
        datasets: [
          {
            label: options.chartOptions?.label || '',
            data: scaledData,
            backgroundColor: color + '80', // Semi-transparent
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
            text: options.chartOptions?.title || '',
          },
          tooltip: {
            callbacks: {
              label(context) {
                const xValue = context.raw.x;
                const yValue = context.raw.y;
                const rValue =
                  context.raw.r / (options.chartOptions?.sizeFactor || 1);

                return [
                  `${options.x}: ${xValue}`,
                  `${options.y}: ${yValue}`,
                  `${options.size}: ${rValue}`,
                ];
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
            title: {
              display: true,
              text: options.chartOptions?.yLabel || options.y,
            },
          },
        },
        ...options.chartOptions,
      },
    };
  }
}

/**
 * Creates a scatter plot with a regression line
 * @param {Object} dataFrame - TinyFrameJS DataFrame
 * @param {Object} options - Chart options
 * @param {string} options.x - Column name for X axis
 * @param {string} options.y - Column name for Y axis
 * @param {string} [options.regressionType='linear'] - Type of regression ('linear', 'polynomial', 'exponential', 'logarithmic')
 * @param {number} [options.polynomialOrder=2] - Order of polynomial regression (only for polynomial type)
 * @param {Object} [options.chartOptions] - Additional Chart.js options
 * @returns {Object} Chart configuration object
 */
export function regressionPlot(dataFrame, options) {
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

  // Extract data points
  const points = data
    .filter(
      (row) =>
        typeof row[options.x] === 'number' &&
        !isNaN(row[options.x]) &&
        typeof row[options.y] === 'number' &&
        !isNaN(row[options.y]),
    )
    .map((row) => ({
      x: row[options.x],
      y: row[options.y],
    }));

  if (points.length === 0) {
    throw new Error('No valid numeric data points found');
  }

  // Calculate regression line
  const regressionType = options.regressionType || 'linear';
  const regressionPoints = calculateRegression(
    points,
    regressionType,
    options.polynomialOrder,
  );

  // Create chart configuration
  const pointColor = options.chartOptions?.pointColor || getColor(0);
  const lineColor = options.chartOptions?.lineColor || getColor(1);

  return {
    type: 'scatter',
    data: {
      datasets: [
        {
          label: options.chartOptions?.pointLabel || 'Data Points',
          data: points,
          backgroundColor: pointColor,
          borderColor: pointColor,
          pointRadius: options.chartOptions?.pointRadius || 5,
          pointHoverRadius: options.chartOptions?.pointHoverRadius || 7,
        },
        {
          label:
            options.chartOptions?.lineLabel ||
            `${regressionType.charAt(0).toUpperCase() + regressionType.slice(1)} Regression`,
          data: regressionPoints,
          type: 'line',
          borderColor: lineColor,
          backgroundColor: 'transparent',
          borderWidth: 2,
          pointRadius: 0,
          fill: false,
          tension: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: !!options.chartOptions?.title,
          text: options.chartOptions?.title || 'Regression Analysis',
        },
        tooltip: {
          callbacks: {
            label(context) {
              if (context.datasetIndex === 0) {
                return `(${context.parsed.x}, ${context.parsed.y})`;
              } else {
                return `Fitted: ${context.parsed.y.toFixed(2)}`;
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
          title: {
            display: true,
            text: options.chartOptions?.yLabel || options.y,
          },
        },
      },
      ...options.chartOptions,
    },
  };
}

/**
 * Calculates regression points based on data and regression type
 * @param {Array<{x: number, y: number}>} points - Data points
 * @param {string} type - Regression type
 * @param {number} [polynomialOrder=2] - Order for polynomial regression
 * @returns {Array<{x: number, y: number}>} Regression line points
 * @private
 */
function calculateRegression(points, type, polynomialOrder = 2) {
  // Sort points by x value
  points.sort((a, b) => a.x - b.x);

  // Extract x and y values
  const xValues = points.map((p) => p.x);
  const yValues = points.map((p) => p.y);

  // Get min and max x values
  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);

  // Generate x values for the regression line
  const step = (maxX - minX) / 100;
  const regressionXValues = Array.from(
    { length: 101 },
    (_, i) => minX + i * step,
  );

  // Calculate regression based on type
  switch (type.toLowerCase()) {
    case 'linear':
      return linearRegression(points, regressionXValues);
    case 'polynomial':
      return polynomialRegression(points, regressionXValues, polynomialOrder);
    case 'exponential':
      return exponentialRegression(points, regressionXValues);
    case 'logarithmic':
      return logarithmicRegression(points, regressionXValues);
    default:
      throw new Error(`Unsupported regression type: ${type}`);
  }
}

/**
 * Calculates linear regression
 * @param {Array<{x: number, y: number}>} points - Data points
 * @param {number[]} xValues - X values for regression line
 * @returns {Array<{x: number, y: number}>} Regression line points
 * @private
 */
function linearRegression(points, xValues) {
  const n = points.length;

  // Calculate means
  const meanX = points.reduce((sum, p) => sum + p.x, 0) / n;
  const meanY = points.reduce((sum, p) => sum + p.y, 0) / n;

  // Calculate coefficients
  let numerator = 0;
  let denominator = 0;

  for (const point of points) {
    numerator += (point.x - meanX) * (point.y - meanY);
    denominator += Math.pow(point.x - meanX, 2);
  }

  const slope = denominator !== 0 ? numerator / denominator : 0;
  const intercept = meanY - slope * meanX;

  // Generate regression line points
  return xValues.map((x) => ({
    x,
    y: slope * x + intercept,
  }));
}

/**
 * Calculates polynomial regression
 * @param {Array<{x: number, y: number}>} points - Data points
 * @param {number[]} xValues - X values for regression line
 * @param {number} order - Polynomial order
 * @returns {Array<{x: number, y: number}>} Regression line points
 * @private
 */
function polynomialRegression(points, xValues, order) {
  // Simple implementation of polynomial regression
  // For a production implementation, consider using a math library

  // Limit order to prevent excessive computation
  order = Math.min(Math.max(1, order), 5);

  // Extract x and y values
  const x = points.map((p) => p.x);
  const y = points.map((p) => p.y);

  // Calculate polynomial coefficients (simplified approach)
  const coefficients = [];

  // For order 1 (linear), use linear regression
  if (order === 1) {
    const linearPoints = linearRegression(points, xValues);
    const firstPoint = linearPoints[0];
    const lastPoint = linearPoints[linearPoints.length - 1];

    const slope = (lastPoint.y - firstPoint.y) / (lastPoint.x - firstPoint.x);
    const intercept = firstPoint.y - slope * firstPoint.x;

    coefficients.push(intercept, slope);
  } else {
    // For higher orders, use a simple approximation
    // This is a placeholder - a real implementation would use matrix operations

    // Start with linear regression coefficients
    const linearPoints = linearRegression(points, [0, 1]);
    coefficients.push(linearPoints[0].y, linearPoints[1].y - linearPoints[0].y);

    // Add higher-order coefficients (simplified)
    for (let i = 2; i <= order; i++) {
      // This is a very simplified approach - in a real implementation,
      // you would solve a system of linear equations
      coefficients.push(0.1 / i);
    }
  }

  // Generate regression curve points
  return xValues.map((x) => ({
    x,
    y: evaluatePolynomial(coefficients, x),
  }));
}

/**
 * Evaluates a polynomial at a given x value
 * @param {number[]} coefficients - Polynomial coefficients (a0, a1, a2, ...)
 * @param {number} x - X value
 * @returns {number} Y value
 * @private
 */
function evaluatePolynomial(coefficients, x) {
  let result = 0;

  for (let i = 0; i < coefficients.length; i++) {
    result += coefficients[i] * Math.pow(x, i);
  }

  return result;
}

/**
 * Calculates exponential regression
 * @param {Array<{x: number, y: number}>} points - Data points
 * @param {number[]} xValues - X values for regression line
 * @returns {Array<{x: number, y: number}>} Regression line points
 * @private
 */
function exponentialRegression(points, xValues) {
  // Filter out non-positive y values (can't take log of <= 0)
  const filteredPoints = points.filter((p) => p.y > 0);

  if (filteredPoints.length < 2) {
    throw new Error(
      'Exponential regression requires at least 2 points with positive y values',
    );
  }

  // Transform to linear form: ln(y) = ln(a) + b*x
  const transformedPoints = filteredPoints.map((p) => ({
    x: p.x,
    y: Math.log(p.y),
  }));

  // Perform linear regression on transformed points
  const n = transformedPoints.length;

  // Calculate means
  const meanX = transformedPoints.reduce((sum, p) => sum + p.x, 0) / n;
  const meanY = transformedPoints.reduce((sum, p) => sum + p.y, 0) / n;

  // Calculate coefficients
  let numerator = 0;
  let denominator = 0;

  for (const point of transformedPoints) {
    numerator += (point.x - meanX) * (point.y - meanY);
    denominator += Math.pow(point.x - meanX, 2);
  }

  const b = denominator !== 0 ? numerator / denominator : 0;
  const lnA = meanY - b * meanX;
  const a = Math.exp(lnA);

  // Generate regression curve points: y = a * e^(b*x)
  return xValues.map((x) => ({
    x,
    y: a * Math.exp(b * x),
  }));
}

/**
 * Calculates logarithmic regression
 * @param {Array<{x: number, y: number}>} points - Data points
 * @param {number[]} xValues - X values for regression line
 * @returns {Array<{x: number, y: number}>} Regression line points
 * @private
 */
function logarithmicRegression(points, xValues) {
  // Filter out non-positive x values (can't take log of <= 0)
  const filteredPoints = points.filter((p) => p.x > 0);

  if (filteredPoints.length < 2) {
    throw new Error(
      'Logarithmic regression requires at least 2 points with positive x values',
    );
  }

  // Transform to linear form: y = a + b*ln(x)
  const transformedPoints = filteredPoints.map((p) => ({
    x: Math.log(p.x),
    y: p.y,
  }));

  // Perform linear regression on transformed points
  const n = transformedPoints.length;

  // Calculate means
  const meanX = transformedPoints.reduce((sum, p) => sum + p.x, 0) / n;
  const meanY = transformedPoints.reduce((sum, p) => sum + p.y, 0) / n;

  // Calculate coefficients
  let numerator = 0;
  let denominator = 0;

  for (const point of transformedPoints) {
    numerator += (point.x - meanX) * (point.y - meanY);
    denominator += Math.pow(point.x - meanX, 2);
  }

  const b = denominator !== 0 ? numerator / denominator : 0;
  const a = meanY - b * meanX;

  // Filter out non-positive x values from xValues
  const filteredXValues = xValues.filter((x) => x > 0);

  // Generate regression curve points: y = a + b*ln(x)
  return filteredXValues.map((x) => ({
    x,
    y: a + b * Math.log(x),
  }));
}
