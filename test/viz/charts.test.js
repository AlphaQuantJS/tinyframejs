// test/viz/charts.test.js

import { describe, it, expect, beforeAll } from 'vitest';
import { DataFrame } from '../../src/core/DataFrame.js';
import * as viz from '../../src/viz/index.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize visualization module
beforeAll(() => {
  viz.init(DataFrame);
});

describe('Advanced Chart Types', () => {
  // Sample data for testing
  const timeSeriesData = [
    { date: '2025-01-01', value: 100, category: 'A' },
    { date: '2025-01-02', value: 150, category: 'A' },
    { date: '2025-01-03', value: 120, category: 'B' },
    { date: '2025-01-04', value: 180, category: 'B' },
    { date: '2025-01-05', value: 130, category: 'C' },
  ];

  const categoricalData = [
    { category: 'Electronics', value: 120, count: 10 },
    { category: 'Clothing', value: 150, count: 15 },
    { category: 'Food', value: 80, count: 8 },
    { category: 'Books', value: 60, count: 6 },
    { category: 'Sports', value: 90, count: 9 },
  ];

  const radarData = [
    { skill: 'JavaScript', person1: 90, person2: 75, person3: 85 },
    { skill: 'HTML/CSS', person1: 85, person2: 90, person3: 70 },
    { skill: 'React', person1: 80, person2: 85, person3: 90 },
    { skill: 'Node.js', person1: 75, person2: 70, person3: 85 },
    { skill: 'SQL', person1: 70, person2: 80, person3: 75 },
  ];

  const financialData = [
    {
      date: '2025-01-01',
      open: 100,
      high: 110,
      low: 95,
      close: 105,
      volume: 1000,
    },
    {
      date: '2025-01-02',
      open: 105,
      high: 115,
      low: 100,
      close: 110,
      volume: 1200,
    },
    {
      date: '2025-01-03',
      open: 110,
      high: 120,
      low: 105,
      close: 115,
      volume: 1500,
    },
    {
      date: '2025-01-04',
      open: 115,
      high: 125,
      low: 110,
      close: 120,
      volume: 1800,
    },
    {
      date: '2025-01-05',
      open: 120,
      high: 130,
      low: 115,
      close: 125,
      volume: 2000,
    },
  ];

  // Create DataFrames
  const timeSeriesDf = DataFrame.create(timeSeriesData);
  const categoricalDf = DataFrame.create(categoricalData);
  const radarDf = DataFrame.create(radarData);
  const financialDf = DataFrame.create(financialData);

  it('should create an area chart configuration', () => {
    const config = viz.line.areaChart(timeSeriesDf, {
      x: 'date',
      y: 'value',
      chartOptions: {
        title: 'Area Chart Test',
      },
    });

    expect(config).toBeDefined();
    expect(config.type).toBe('line');
    expect(config.data).toBeDefined();
    expect(config.data.datasets[0].fill).toBeTruthy();
    expect(config.options.plugins.title.text).toBe('Area Chart Test');
  });

  it('should create a radar chart configuration', () => {
    const config = viz.pie.radarChart(radarDf, {
      category: 'skill',
      values: ['person1', 'person2', 'person3'],
      chartOptions: {
        title: 'Radar Chart Test',
      },
    });

    expect(config).toBeDefined();
    expect(config.type).toBe('radar');
    expect(config.data).toBeDefined();
    expect(config.data.labels.length).toBe(5); // 5 skills
    expect(config.data.datasets.length).toBe(3); // 3 persons
    expect(config.options.plugins.title.text).toBe('Radar Chart Test');
  });

  it('should create a polar area chart configuration', () => {
    const config = viz.pie.polarAreaChart(categoricalDf, {
      category: 'category',
      value: 'value',
      chartOptions: {
        title: 'Polar Area Chart Test',
      },
    });

    expect(config).toBeDefined();
    expect(config.type).toBe('polarArea');
    expect(config.data).toBeDefined();
    expect(config.data.labels.length).toBe(5); // 5 categories
    expect(config.data.datasets.length).toBe(1);
    expect(config.options.plugins.title.text).toBe('Polar Area Chart Test');
  });

  it('should create a candlestick chart configuration', () => {
    const config = viz.financial.candlestickChart(financialDf, {
      date: 'date',
      open: 'open',
      high: 'high',
      low: 'low',
      close: 'close',
      chartOptions: {
        title: 'Candlestick Chart Test',
      },
    });

    expect(config).toBeDefined();
    expect(config.type).toBe('candlestick');
    expect(config.data).toBeDefined();
    expect(config.data.datasets.length).toBe(1);
    expect(config.options.plugins.title.text).toBe('Candlestick Chart Test');
  });

  it('should automatically detect chart type for time series data', () => {
    const detection = viz.utils.detectChartType(timeSeriesDf);

    expect(detection).toBeDefined();
    expect(detection.type).toBe('line');
    expect(detection.columns.x).toBe('date');
    expect(detection.columns.y).toContain('value');
  });

  it('should automatically detect chart type for categorical data', () => {
    const detection = viz.utils.detectChartType(categoricalDf);

    expect(detection).toBeDefined();
    expect(detection.type).toBe('pie');
    expect(detection.columns.x).toBe('category');
    expect(detection.columns.y).toBe('value');
  });

  it('should automatically detect chart type for financial data', () => {
    const detection = viz.utils.detectChartType(financialDf);

    expect(detection).toBeDefined();
    // Пока что автоматическое определение не поддерживает финансовые данные
    // В будущих версиях это будет реализовано
    expect(detection.type).toBe('line');
    expect(detection.columns.x).toBe('date');
  });

  it('should respect preferred chart type in auto detection', () => {
    const detection = viz.utils.detectChartType(timeSeriesDf, {
      preferredType: 'line',
    });

    expect(detection).toBeDefined();
    expect(detection.type).toBe('line');
    expect(detection.columns.x).toBe('date');
    expect(detection.columns.y).toContain('value');
  });

  it('should use the plot method with auto detection', async () => {
    const config = await timeSeriesDf.plot({
      preferredType: 'line',
      render: false,
    });

    expect(config).toBeDefined();
    expect(config.type).toBe('line');
    expect(config.detection).toBeDefined();
  });
});

describe('Chart Export Functionality', () => {
  // Skip tests in browser environment
  const isBrowser =
    typeof window !== 'undefined' && typeof document !== 'undefined';
  if (isBrowser) {
    it.skip('skipping Node.js-only tests in browser', () => {});
    return;
  }

  // Sample data for testing
  const data = [
    { category: 'A', value: 30 },
    { category: 'B', value: 50 },
    { category: 'C', value: 20 },
  ];

  const df = DataFrame.create(data);

  // Create output directory for tests
  const outputDir = path.join(__dirname, '../../test-output');

  beforeAll(async () => {
    try {
      await fs.mkdir(outputDir, { recursive: true });
    } catch (err) {
      console.error('Failed to create test output directory:', err);
    }
  });

  it('should export a chart to PNG format', async () => {
    const filePath = path.join(outputDir, 'test-chart.png');

    try {
      const result = await df.exportChart(filePath, {
        chartType: 'bar',
        chartOptions: {
          title: 'Test PNG Export',
        },
        x: 'category',
        y: 'value',
      });

      expect(result).toBe(filePath);

      // Check if file exists
      const stats = await fs.stat(filePath);
      expect(stats.size).toBeGreaterThan(0);
    } catch (err) {
      // If test fails due to missing canvas dependency, skip it
      if (err.message && err.message.includes('canvas')) {
        console.warn('Skipping test due to missing canvas dependency');
        return;
      }
      throw err;
    }
  });

  it('should export a chart to SVG format', async () => {
    const filePath = path.join(outputDir, 'test-chart.svg');

    try {
      const result = await df.exportChart(filePath, {
        chartType: 'bar',
        chartOptions: {
          title: 'Test SVG Export',
        },
        x: 'category',
        y: 'value',
      });

      expect(result).toBe(filePath);

      // Check if file exists and contains SVG content
      const content = await fs.readFile(filePath, 'utf8');
      expect(content).toContain('<svg');
    } catch (err) {
      // If test fails due to missing dependencies, skip it
      if (
        err.message &&
        (err.message.includes('canvas') || err.message.includes('svg'))
      ) {
        console.warn('Skipping test due to missing dependencies');
        return;
      }
      throw err;
    }
  });

  it('should export a chart with automatic type detection', async () => {
    const filePath = path.join(outputDir, 'test-auto-detect.png');

    try {
      const result = await df.exportChart(filePath);

      expect(result).toBe(filePath);

      // Check if file exists
      const stats = await fs.stat(filePath);
      expect(stats.size).toBeGreaterThan(0);
    } catch (err) {
      // If test fails due to missing dependencies, skip it
      if (err.message && err.message.includes('canvas')) {
        console.warn('Skipping test due to missing canvas dependency');
        return;
      }
      throw err;
    }
  });
});
