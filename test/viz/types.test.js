/**
 * Unit tests for visualization types
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DataFrame } from '../../src/core/dataframe/DataFrame.js';
import {
  lineChart,
  barChart,
  scatterPlot,
  pieChart,
  histogram,
} from '../../src/viz/types/index.js';

// Test data
const sampleData = [
  { date: '2023-01-01', value: 10, category: 'A' },
  { date: '2023-01-02', value: 15, category: 'B' },
  { date: '2023-01-03', value: 7, category: 'A' },
  { date: '2023-01-04', value: 20, category: 'C' },
  { date: '2023-01-05', value: 12, category: 'B' },
];

describe('Visualization Types', () => {
  let df;

  beforeEach(() => {
    // Create a new DataFrame instance for each test
    df = DataFrame.create(sampleData);

    // Mock console.log
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  describe('lineChart', () => {
    it('should generate line chart configuration', () => {
      const config = lineChart(df, {
        x: 'date',
        y: 'value',
        chartOptions: { title: 'Line Chart Test' },
      });

      // Check that the result is an object
      expect(typeof config).toBe('object');

      // Check that the config has the correct properties
      expect(config).toHaveProperty('type', 'line');
      expect(config).toHaveProperty('data');
      expect(config.data).toHaveProperty('labels');
      expect(config.data).toHaveProperty('datasets');
      expect(config.options).toHaveProperty('title');
      expect(config.options.title).toHaveProperty('text', 'Line Chart Test');
    });
  });

  describe('barChart', () => {
    it('should generate bar chart configuration', () => {
      const config = barChart(df, {
        x: 'category',
        y: 'value',
        chartOptions: { title: 'Bar Chart Test' },
      });

      // Check that the result is an object
      expect(typeof config).toBe('object');

      // Check that the config has the correct properties
      expect(config).toHaveProperty('type', 'bar');
      expect(config).toHaveProperty('data');
      expect(config.data).toHaveProperty('labels');
      expect(config.data).toHaveProperty('datasets');
      expect(config.options).toHaveProperty('title');
      expect(config.options.title).toHaveProperty('text', 'Bar Chart Test');
    });
  });

  describe('scatterPlot', () => {
    it('should generate scatter plot configuration', () => {
      const config = scatterPlot(df, {
        x: 'date',
        y: 'value',
        chartOptions: { title: 'Scatter Plot Test' },
      });

      // Check that the result is an object
      expect(typeof config).toBe('object');

      // Check that the config has the correct properties
      expect(config).toHaveProperty('type', 'scatter');
      expect(config).toHaveProperty('data');
      expect(config.data).toHaveProperty('datasets');
      expect(config.options).toHaveProperty('title');
      expect(config.options.title).toHaveProperty('text', 'Scatter Plot Test');
    });
  });

  describe('pieChart', () => {
    it('should generate pie chart configuration', () => {
      const config = pieChart(df, {
        labels: 'category',
        values: 'value',
        chartOptions: { title: 'Pie Chart Test' },
      });

      // Check that the result is an object
      expect(typeof config).toBe('object');

      // Check that the config has the correct properties
      expect(config).toHaveProperty('type', 'pie');
      expect(config).toHaveProperty('data');
      expect(config.data).toHaveProperty('labels');
      expect(config.data).toHaveProperty('datasets');
      expect(config.options).toHaveProperty('title');
      expect(config.options.title).toHaveProperty('text', 'Pie Chart Test');
    });
  });

  describe('histogram', () => {
    it('should generate histogram configuration', () => {
      const config = histogram(df, {
        values: 'value',
        bins: 5,
        chartOptions: { title: 'Histogram Test' },
      });

      // Check that the result is an object
      expect(typeof config).toBe('object');

      // Check that the config has the correct properties
      expect(config).toHaveProperty('type', 'bar');
      expect(config).toHaveProperty('data');
      expect(config.data).toHaveProperty('labels');
      expect(config.data).toHaveProperty('datasets');
      expect(config.options).toHaveProperty('title');
      expect(config.options.title).toHaveProperty('text', 'Histogram Test');
    });
  });
});
