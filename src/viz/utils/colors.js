// src/viz/utils/colors.js

/**
 * Default color palette for visualizations
 * Based on ColorBrewer and optimized for data visualization
 * @type {string[]}
 */
export const defaultColors = [
  '#4e79a7', // blue
  '#f28e2c', // orange
  '#e15759', // red
  '#76b7b2', // teal
  '#59a14f', // green
  '#edc949', // yellow
  '#af7aa1', // purple
  '#ff9da7', // pink
  '#9c755f', // brown
  '#bab0ab', // gray
];

/**
 * Gets a color from the default palette based on index
 * @param {number} index - Index in the color palette
 * @returns {string} Color in hex format
 */
export function getColor(index) {
  return defaultColors[index % defaultColors.length];
}

/**
 * Generates a color scale for continuous data
 * @param {string} startColor - Starting color in hex format
 * @param {string} endColor - Ending color in hex format
 * @param {number} steps - Number of steps in the scale
 * @returns {string[]} Array of colors in hex format
 */
export function generateColorScale(startColor, endColor, steps) {
  const scale = [];

  // Parse hex colors to RGB
  const startRGB = hexToRgb(startColor);
  const endRGB = hexToRgb(endColor);

  // Generate steps
  for (let i = 0; i < steps; i++) {
    const r = Math.round(
      startRGB.r + (endRGB.r - startRGB.r) * (i / (steps - 1)),
    );
    const g = Math.round(
      startRGB.g + (endRGB.g - startRGB.g) * (i / (steps - 1)),
    );
    const b = Math.round(
      startRGB.b + (endRGB.b - startRGB.b) * (i / (steps - 1)),
    );

    scale.push(rgbToHex(r, g, b));
  }

  return scale;
}

/**
 * Converts a hex color to RGB
 * @param {string} hex - Color in hex format
 * @returns {Object} RGB object with r, g, b properties
 * @private
 */
function hexToRgb(hex) {
  // Remove # if present
  hex = hex.replace(/^#/, '');

  // Parse hex values
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return { r, g, b };
}

/**
 * Converts RGB values to hex color
 * @param {number} r - Red component (0-255)
 * @param {number} g - Green component (0-255)
 * @param {number} b - Blue component (0-255)
 * @returns {string} Color in hex format
 * @private
 */
function rgbToHex(r, g, b) {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

/**
 * Predefined color schemes
 * @type {Object.<string, string[]>}
 */
const colorSchemes = {
  // Blue to red diverging palette
  diverging: [
    '#3b4cc0',
    '#5977e3',
    '#7b9ff9',
    '#9ebeff',
    '#c0d4f5',
    '#dddcdc',
    '#f2cbb7',
    '#f7ac8e',
    '#ee8468',
    '#d65244',
    '#b40426',
  ],

  // Sequential blue palette
  blues: [
    '#f7fbff',
    '#deebf7',
    '#c6dbef',
    '#9ecae1',
    '#6baed6',
    '#4292c6',
    '#2171b5',
    '#08519c',
    '#08306b',
  ],

  // Sequential green palette
  greens: [
    '#f7fcf5',
    '#e5f5e0',
    '#c7e9c0',
    '#a1d99b',
    '#74c476',
    '#41ab5d',
    '#238b45',
    '#006d2c',
    '#00441b',
  ],

  // Sequential red palette
  reds: [
    '#fff5f0',
    '#fee0d2',
    '#fcbba1',
    '#fc9272',
    '#fb6a4a',
    '#ef3b2c',
    '#cb181d',
    '#a50f15',
    '#67000d',
  ],

  // Qualitative palette (colorblind-friendly)
  qualitative: [
    '#1f77b4',
    '#ff7f0e',
    '#2ca02c',
    '#d62728',
    '#9467bd',
    '#8c564b',
    '#e377c2',
    '#7f7f7f',
    '#bcbd22',
    '#17becf',
  ],
};

/**
 * Generates a categorical color palette
 * @param {number} count - Number of colors needed
 * @param {string} [scheme='default'] - Color scheme name
 * @returns {string[]} Array of colors in hex format
 */
export function categoricalColors(count, scheme = 'default') {
  if (scheme === 'default' || !colorSchemes[scheme]) {
    return count <= defaultColors.length
      ? defaultColors.slice(0, count)
      : extendColorPalette(defaultColors, count);
  }

  const baseColors = colorSchemes[scheme];
  return count <= baseColors.length
    ? baseColors.slice(0, count)
    : extendColorPalette(baseColors, count);
}

/**
 * Extends a color palette to the required length
 * @param {string[]} baseColors - Base color palette
 * @param {number} count - Required number of colors
 * @returns {string[]} Extended color palette
 * @private
 */
function extendColorPalette(baseColors, count) {
  const result = [...baseColors];

  // If we need more colors than available, generate variations
  while (result.length < count) {
    const index = result.length % baseColors.length;
    const baseColor = baseColors[index];
    const rgb = hexToRgb(baseColor);

    // Create a slightly different shade
    const variation = 20 * (Math.floor(result.length / baseColors.length) + 1);
    const r = Math.max(
      0,
      Math.min(255, rgb.r + (Math.random() > 0.5 ? variation : -variation)),
    );
    const g = Math.max(
      0,
      Math.min(255, rgb.g + (Math.random() > 0.5 ? variation : -variation)),
    );
    const b = Math.max(
      0,
      Math.min(255, rgb.b + (Math.random() > 0.5 ? variation : -variation)),
    );

    result.push(rgbToHex(r, g, b));
  }

  return result;
}
