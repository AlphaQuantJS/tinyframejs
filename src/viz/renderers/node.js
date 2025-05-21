// src/viz/renderers/node.js

/**
 * Node.js renderer for visualizations
 * Handles rendering charts in server-side environments
 */

/**
 * Renders a chart in Node.js environment using canvas
 * @param {Object} chartConfig - Chart.js configuration
 * @param {Object} options - Rendering options
 * @param {number} [options.width=800] - Width of the chart in pixels
 * @param {number} [options.height=600] - Height of the chart in pixels
 * @returns {Promise<Buffer>} Image buffer
 */
export async function renderChart(chartConfig, options = {}) {
  const { width = 800, height = 600, format = 'png' } = options;

  // Check if we're in a Node.js environment
  if (
    typeof process === 'undefined' ||
    !process.versions ||
    !process.versions.node
  ) {
    throw new Error(
      'Node.js environment is required for server-side rendering',
    );
  }

  // Try to load required modules
  let Canvas, Chart;

  try {
    // Dynamic imports to avoid bundling issues
    const canvasModule = await dynamicRequire('canvas');
    Canvas = canvasModule;

    const chartModule = await dynamicRequire('chart.js');
    Chart = chartModule.Chart || chartModule.default;

    // Register the required controllers and elements
    const registerModule = chartModule.register || chartModule.default.register;

    if (registerModule) {
      const {
        LineController,
        BarController,
        PieController,
        ScatterController,
        LinearScale,
        CategoryScale,
        TimeScale,
        LogarithmicScale,
        PointElement,
        LineElement,
        BarElement,
        ArcElement,
        Tooltip,
        Legend,
        Title,
      } = await dynamicRequire('chart.js');

      registerModule(
        LineController,
        BarController,
        PieController,
        ScatterController,
        LinearScale,
        CategoryScale,
        TimeScale,
        LogarithmicScale,
        PointElement,
        LineElement,
        BarElement,
        ArcElement,
        Tooltip,
        Legend,
        Title,
      );
    }
  } catch (error) {
    throw new Error(`Failed to load required modules: ${error.message}. 
      Please install them with: npm install chart.js canvas`);
  }

  // Create canvas
  const canvas = Canvas.createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Create chart
  const chart = new Chart(ctx, chartConfig);

  // Render chart
  await new Promise((resolve) => setTimeout(resolve, 100)); // Give time for rendering

  // Convert to buffer
  let buffer;

  if (format === 'png') {
    buffer = canvas.toBuffer('image/png');
  } else if (format === 'jpeg' || format === 'jpg') {
    buffer = canvas.toBuffer('image/jpeg');
  } else if (format === 'pdf') {
    try {
      const { PDFDocument } = await dynamicRequire('pdf-lib');
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([width, height]);

      // Convert canvas to PNG and embed in PDF
      const pngImage = await pdfDoc.embedPng(canvas.toBuffer('image/png'));
      page.drawImage(pngImage, {
        x: 0,
        y: 0,
        width,
        height,
      });

      buffer = await pdfDoc.save();
    } catch (error) {
      throw new Error(`Failed to create PDF: ${error.message}. 
        Please install pdf-lib with: npm install pdf-lib`);
    }
  } else {
    throw new Error(`Unsupported format: ${format}`);
  }

  return buffer;
}

/**
 * Saves a chart to a file
 * @param {Object} chartConfig - Chart.js configuration
 * @param {string} filePath - Path to save the file
 * @param {Object} options - Save options
 * @param {string} [options.format='png'] - File format ('png', 'jpeg', 'pdf')
 * @param {number} [options.width=800] - Width of the chart in pixels
 * @param {number} [options.height=600] - Height of the chart in pixels
 * @returns {Promise<string>} Path to the saved file
 */
export async function saveChartToFile(chartConfig, filePath, options = {}) {
  // Check if we're in a Node.js environment
  if (
    typeof process === 'undefined' ||
    !process.versions ||
    !process.versions.node
  ) {
    throw new Error('Node.js environment is required for saveChartToFile');
  }

  // Get file format from path if not specified
  const format = options.format || filePath.split('.').pop().toLowerCase();

  // Render chart to buffer
  const buffer = await renderChart(chartConfig, {
    ...options,
    format,
  });

  // Save to file
  const fs = await dynamicRequire('fs/promises');
  await fs.writeFile(filePath, buffer);

  return filePath;
}

/**
 * Creates an HTML report with multiple charts
 * @param {Object[]} charts - Array of chart configurations
 * @param {string} outputPath - Path to save the HTML file
 * @param {Object} options - Report options
 * @param {string} [options.title='TinyFrameJS Visualization Report'] - Report title
 * @param {string} [options.description=''] - Report description
 * @returns {Promise<string>} Path to the saved file
 */
export async function createHTMLReport(charts, outputPath, options = {}) {
  // Check if we're in a Node.js environment
  if (
    typeof process === 'undefined' ||
    !process.versions ||
    !process.versions.node
  ) {
    throw new Error('Node.js environment is required for createHTMLReport');
  }

  const {
    title = 'TinyFrameJS Visualization Report',
    description = '',
    width = 800,
    height = 500,
  } = options;

  // Load required modules
  const fs = await dynamicRequire('fs/promises');
  const path = await dynamicRequire('path');

  // Create output directory if it doesn't exist
  const outputDir = path.dirname(outputPath);
  await fs.mkdir(outputDir, { recursive: true });

  // Generate image files
  const imageFiles = [];
  const imageDir = path.join(outputDir, 'images');
  await fs.mkdir(imageDir, { recursive: true });

  for (let i = 0; i < charts.length; i++) {
    const chartConfig = charts[i];
    const imagePath = path.join(imageDir, `chart-${i + 1}.png`);

    await saveChartToFile(chartConfig, imagePath, {
      width,
      height,
      format: 'png',
    });

    imageFiles.push(path.relative(outputDir, imagePath));
  }

  // Generate HTML
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 {
      color: #2c3e50;
      border-bottom: 1px solid #eee;
      padding-bottom: 10px;
    }
    .description {
      margin-bottom: 30px;
      color: #666;
    }
    .chart-container {
      margin-bottom: 40px;
      border: 1px solid #eee;
      border-radius: 5px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    .chart-title {
      font-size: 1.2em;
      margin-bottom: 15px;
      color: #2c3e50;
    }
    img {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 0 auto;
    }
    .footer {
      margin-top: 50px;
      text-align: center;
      font-size: 0.9em;
      color: #7f8c8d;
    }
  </style>
</head>
<body>
  <h1>${title}</h1>
  ${description ? `<div class="description">${description}</div>` : ''}
  
  ${charts
    .map(
      (chart, index) => `
  <div class="chart-container">
    <div class="chart-title">${chart.options?.plugins?.title?.text || `Chart ${index + 1}`}</div>
    <img src="${imageFiles[index]}" alt="Chart ${index + 1}" width="${width}" height="${height}">
  </div>
  `,
    )
    .join('')}
  
  <div class="footer">
    Generated with TinyFrameJS on ${new Date().toLocaleDateString()}
  </div>
</body>
</html>
  `;

  // Save HTML file
  await fs.writeFile(outputPath, html);

  return outputPath;
}

/**
 * Dynamically requires a module in Node.js
 * @param {string} moduleName - Name of the module to require
 * @returns {Promise<any>} Module exports
 * @private
 */
async function dynamicRequire(moduleName) {
  // Use dynamic import for ESM compatibility
  if (typeof require !== 'undefined') {
    return require(moduleName);
  } else {
    return await import(moduleName);
  }
}
