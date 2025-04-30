/**
 * Unit tests for apiToFrame transformer
 */

import { apiToFrame } from '../../../src/io/transformers/apiToFrame.js';
import { describe, test, expect } from 'vitest';
import fs from 'fs/promises';
import path from 'path';

/**
 * Tests for the apiToFrame transformer
 * Verifies correct transformation of API data into DataFrames with various options
 */
describe('apiToFrame Transformer', () => {
  /**
   * Tests basic transformation of simple API data to DataFrame
   * Verifies that API data is correctly transformed into a DataFrame
   */
  test('should transform simple API data to DataFrame', () => {
    const data = [
      { date: '2023-01-01', open: 100.5, close: 103.5 },
      { date: '2023-01-02', open: 103.75, close: 107.25 },
      { date: '2023-01-03', open: 107.5, close: 106.75 },
    ];

    const df = apiToFrame(data);

    expect(df.constructor.name).toBe('DataFrame');
    expect(df.rowCount).toBe(3);
    expect(df.columns).toContain('date');
    expect(df.columns).toContain('open');
    expect(df.columns).toContain('close');

    const rows = df.toArray();
    expect(rows[0].date).toBe('2023-01-01');
    expect(rows[0].open).toBe(100.5);
  });

  /**
   * Tests handling of nested data paths
   * Verifies that nested data can be correctly accessed and transformed
   */
  test('should handle nested data paths', () => {
    const data = {
      response: {
        status: 'success',
        result: {
          items: [
            { id: 1, name: 'Item 1' },
            { id: 2, name: 'Item 2' },
            { id: 3, name: 'Item 3' },
          ],
        },
      },
    };

    const df = apiToFrame(data, { dataPath: 'response.result.items' });

    expect(df.rowCount).toBe(3);
    expect(df.columns).toContain('id');
    expect(df.columns).toContain('name');

    const rows = df.toArray();
    expect(rows[0].id).toBe(1);
    expect(rows[0].name).toBe('Item 1');
  });

  /**
   * Tests error handling for invalid data path
   * Verifies that an error is thrown when an invalid data path is provided
   */
  test('should throw error for invalid data path', () => {
    const data = { results: [] };

    expect(() => apiToFrame(data, { dataPath: 'invalid.path' })).toThrow(
      'Invalid data path',
    );
  });

  /**
   * Tests error handling for no data found
   * Verifies that an error is thrown when no data is found in the API response
   */
  test('should throw error for no data found', () => {
    const data = null;

    expect(() => apiToFrame(data)).toThrow('No data found in API response');
  });

  /**
   * Tests application of field mapping
   * Verifies that field mapping is correctly applied to the transformed data
   */
  test('should apply field mapping', () => {
    const data = [
      { date: '2023-01-01', priceOpen: 100.5, priceClose: 103.5 },
      { date: '2023-01-02', priceOpen: 103.75, priceClose: 107.25 },
      { date: '2023-01-03', priceOpen: 107.5, priceClose: 106.75 },
    ];

    const mapping = {
      date: 'date',
      priceOpen: 'open',
      priceClose: 'close',
    };

    const df = apiToFrame(data, { mapping });

    expect(df.columns).toContain('date');
    expect(df.columns).toContain('open');
    expect(df.columns).toContain('close');

    const rows = df.toArray();
    expect(rows[0].date).toBe('2023-01-01');
    expect(rows[0].open).toBe(100.5);
  });

  /**
   * Tests application of nested field mapping
   * Verifies that nested field mapping is correctly applied to the transformed data
   */
  test('should apply nested field mapping', () => {
    const data = [
      {
        time: { date: '2023-01-01', timezone: 'UTC' },
        values: { open: 100.5, close: 103.5 },
      },
      {
        time: { date: '2023-01-02', timezone: 'UTC' },
        values: { open: 103.75, close: 107.25 },
      },
    ];

    const mapping = {
      'time.date': 'date',
      'values.open': 'open',
      'values.close': 'close',
    };

    const df = apiToFrame(data, { mapping });

    expect(df.columns).toContain('date');
    expect(df.columns).toContain('open');
    expect(df.columns).toContain('close');

    const rows = df.toArray();
    expect(rows[0].date).toBe('2023-01-01');
    expect(rows[0].open).toBe(100.5);
  });

  /**
   * Tests application of custom transform function
   * Verifies that a custom transform function is correctly applied to the transformed data
   */
  test('should apply custom transform function', () => {
    const data = [
      { date: '2023-01-01', values: [100.5, 105.75, 99.25, 103.5] },
      { date: '2023-01-02', values: [103.75, 108.25, 102.5, 107.25] },
      { date: '2023-01-03', values: [107.5, 110.0, 105.0, 106.75] },
    ];

    const transform = (item) => ({
      date: item.date,
      open: item.values[0],
      high: item.values[1],
      low: item.values[2],
      close: item.values[3],
    });

    const df = apiToFrame(data, { transform });

    expect(df.columns).toContain('date');
    expect(df.columns).toContain('open');
    expect(df.columns).toContain('high');
    expect(df.columns).toContain('low');
    expect(df.columns).toContain('close');

    const rows = df.toArray();
    expect(rows[0].date).toBe('2023-01-01');
    expect(rows[0].open).toBe(100.5);
    expect(rows[0].high).toBe(105.75);
  });

  /**
   * Tests handling of Binance API response format with transform
   * Verifies that Binance API response data is correctly transformed
   * with a custom transform function
   */
  test('should handle Binance API response format with transform', async () => {
    const binanceData = JSON.parse(
      await fs.readFile(
        path.resolve('./test/fixtures/binance_api_response.json'),
        'utf-8',
      ),
    );

    // Use apiToFrame with custom transform function
    const df = apiToFrame(binanceData, {
      transform: (item) => ({
        symbol: item.symbol,
        price: parseFloat(item.lastPrice),
        volume: parseFloat(item.quoteVolume),
      }),
    });

    expect(df.rowCount).toBe(1);
    expect(df.columns).toContain('symbol');
    expect(df.columns).toContain('price');
    expect(df.columns).toContain('volume');

    const rows = df.toArray();
    expect(rows[0].symbol).toBe('BTCUSDT');
    expect(typeof rows[0].price).toBe('number');
    expect(rows[0].price).toBe(1001);
  });

  /**
   * Tests handling of Binance klines response format with transform
   * Verifies that Binance klines response data is correctly transformed
   * with a custom transform function
   */
  test('should handle Binance klines response format with transform', async () => {
    const binanceKlinesData = JSON.parse(
      await fs.readFile(
        path.resolve('./test/fixtures/binance_klines_response.json'),
        'utf-8',
      ),
    );

    // Use apiToFrame with custom transform function
    const df = apiToFrame(binanceKlinesData, {
      transform: (item) => ({
        timestamp: new Date(item[0]),
        open: parseFloat(item[1]),
        high: parseFloat(item[2]),
        low: parseFloat(item[3]),
        close: parseFloat(item[4]),
        volume: parseFloat(item[5]),
      }),
    });

    expect(df.rowCount).toBe(5);
    expect(df.columns).toContain('timestamp');
    expect(df.columns).toContain('open');
    expect(df.columns).toContain('volume');

    const rows = df.toArray();
    expect(rows[0].timestamp instanceof Date).toBe(true);
    expect(rows[0].open).toBe(1000);
  });

  /**
   * Tests handling of Alpha Vantage API response format with transform
   * Verifies that Alpha Vantage API response data is correctly transformed
   * with a custom transform function
   */
  test('should handle Alpha Vantage API response format with transform', async () => {
    // Load test data
    const alphaVantageData = JSON.parse(
      await fs.readFile(
        path.resolve('./test/fixtures/alphavantage_api_response.json'),
        'utf-8',
      ),
    );

    // Find time series key
    const timeSeriesKey = Object.keys(alphaVantageData).find((key) =>
      key.includes('Time Series'),
    );
    const timeSeries = alphaVantageData[timeSeriesKey];

    // Convert time series object to array
    const timeSeriesArray = Object.entries(timeSeries).map(
      ([date, values]) => ({
        date,
        open: values['1. open'],
        high: values['2. high'],
        low: values['3. low'],
        close: values['4. close'],
        volume: values['5. volume'],
      }),
    );

    // Use apiToFrame with transformed array and transform function
    const df = apiToFrame(timeSeriesArray, {
      transform: (item) => ({
        date: new Date(item.date),
        open: parseFloat(item.open),
        high: parseFloat(item.high),
        low: parseFloat(item.low),
        close: parseFloat(item.close),
        volume: parseInt(item.volume, 10),
      }),
    });

    // Check results
    expect(df.rowCount).toBe(5);
    expect(df.columns).toContain('date');
    expect(df.columns).toContain('open');
    expect(df.columns).toContain('volume');

    const rows = df.toArray();
    expect(rows[0].date instanceof Date).toBe(true);
    expect(typeof rows[0].open).toBe('number');
    expect(rows[0].open).toBeCloseTo(126.01, 2);
  });

  /**
   * Tests handling of Yahoo Finance API response format with transform
   * Verifies that Yahoo Finance API response data is correctly transformed
   * with a custom transform function
   */
  test('should handle Yahoo Finance API response format with transform', async () => {
    // Load test data
    const yahooFinanceData = JSON.parse(
      await fs.readFile(
        path.resolve('./test/fixtures/yahoo_finance_api_response.json'),
        'utf-8',
      ),
    );

    // Extract data from Yahoo Finance response
    const result = yahooFinanceData.chart.result[0];
    const { timestamp, indicators } = result;
    const quote = indicators.quote[0];

    // Create array of data points
    const dataPoints = [];
    for (let i = 0; i < timestamp.length; i++) {
      if (quote.open[i] !== null && quote.close[i] !== null) {
        dataPoints.push({
          date: new Date(timestamp[i] * 1000),
          open: quote.open[i],
          high: quote.high[i],
          low: quote.low[i],
          close: quote.close[i],
          volume: quote.volume[i],
          symbol: result.meta.symbol,
        });
      }
    }

    // Use apiToFrame with transformed array
    const df = apiToFrame(dataPoints);

    // Check results
    expect(df.rowCount).toBe(5);
    expect(df.columns).toContain('date');
    expect(df.columns).toContain('open');
    expect(df.columns).toContain('symbol');

    const rows = df.toArray();
    expect(rows[0].symbol).toBe('MSFT');
    expect(rows[0].open).toBe(217.9);
  });

  /**
   * Tests cleaning of API data with numeric fields
   * Verifies that numeric fields are correctly cleaned and converted to numbers
   */
  test('should clean API data with numeric fields', () => {
    const data = [
      { id: '1', price: '100.50', active: 'true' },
      { id: '2', price: '200.75', active: 'false' },
    ];

    const df = apiToFrame(data, {
      clean: {
        numericFields: ['id', 'price'],
        booleanFields: ['active'],
      },
    });

    expect(df.rowCount).toBe(2);

    const rows = df.toArray();
    expect(typeof rows[0].id).toBe('number');
    expect(rows[0].id).toBe(1);
    expect(typeof rows[0].price).toBe('number');
    expect(rows[0].price).toBe(100.5);
    expect(typeof rows[0].active).toBe('boolean');
    expect(rows[0].active).toBe(true);
    expect(rows[1].active).toBe(false);
  });

  /**
   * Tests cleaning of API data after converting to DataFrame
   * Verifies that data is correctly cleaned after conversion to DataFrame
   */
  test('should clean API data after converting to DataFrame', () => {
    const data = [
      { date: '2023-01-01', value: '100.5', active: 'yes' },
      { date: '2023-01-02', value: '200.75', active: 'no' },
    ];

    const df = apiToFrame(data, {
      cleanFirst: false,
      clean: {
        dateField: 'date',
        numericFields: ['value'],
        booleanFields: ['active'],
      },
    });

    expect(df.rowCount).toBe(2);

    const rows = df.toArray();
    expect(rows[0].date instanceof Date).toBe(true);
    expect(typeof rows[0].value).toBe('number');
    expect(rows[0].value).toBe(100.5);
    expect(typeof rows[0].active).toBe('boolean');
    expect(rows[0].active).toBe(true);
    expect(rows[1].active).toBe(false);
  });

  /**
   * Tests processing of API data with combined options
   * Verifies that API data is correctly processed with combined options
   */
  test('should process API data with combined options', () => {
    const data = [
      {
        timestamp: '2023-01-01',
        priceOpen: '100.5',
        priceClose: '103.5',
        status: 'active',
      },
      {
        timestamp: '2023-01-02',
        priceOpen: '103.75',
        priceClose: '107.25',
        status: 'inactive',
      },
    ];

    const df = apiToFrame(data, {
      clean: {
        numericFields: ['priceOpen', 'priceClose'],
        booleanFields: ['status'],
        renameFields: { timestamp: 'date' },
      },
      useTypedArrays: true,
    });

    expect(df.constructor.name).toBe('DataFrame');
    expect(df.rowCount).toBe(2);
    expect(df.columns).toContain('date');
    expect(df.columns).toContain('priceOpen');
    expect(df.columns).toContain('priceClose');
    expect(df.columns).toContain('status');

    const rows = df.toArray();
    expect(rows[0].date).toBe('2023-01-01');
    expect(typeof rows[0].priceOpen).toBe('number');
    expect(rows[0].priceOpen).toBe(100.5);
    expect(typeof rows[0].status).toBe('boolean');
    expect(rows[0].status).toBe(true);
  });

  /**
   * Tests application of post-cleaning to DataFrame
   * Verifies that post-cleaning is correctly applied to the DataFrame
   */
  test('should apply post-cleaning to DataFrame', () => {
    const data = [
      { date: '2023-01-01', value: 100.5, category: 'A' },
      { date: '2023-01-02', value: 200.75, category: 'B' },
      { date: '2023-01-03', value: 150.25, category: 'A' },
    ];

    const df = apiToFrame(data, {
      postClean: {
        convertTypes: {
          date: 'date',
        },
        renameColumns: {
          category: 'group',
        },
        filterRows: (row) => row.value > 180,
      },
    });

    expect(df.rowCount).toBe(1);
    expect(df.columns).toContain('date');
    expect(df.columns).toContain('value');
    expect(df.columns).toContain('group');
    expect(df.columns).not.toContain('category');

    const rows = df.toArray();
    expect(rows[0].date instanceof Date).toBe(true);
    expect(rows[0].value).toBe(200.75);
    expect(rows[0].group).toBe('B');
  });
});
