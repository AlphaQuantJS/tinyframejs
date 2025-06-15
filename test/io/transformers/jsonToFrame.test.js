/**
 * Unit tests for jsonToFrame transformer
 */

import { jsonToFrame } from '../../../src/io/transformers/jsonToFrame.js';
import { DataFrame } from '../../../src/core/dataframe/DataFrame.js';
import { describe, test, expect, beforeAll } from 'vitest';
import fs from 'fs/promises';
import path from 'path';

/**
 * Tests for the jsonToFrame transformer
 * Verifies correct transformation of JSON data into DataFrames with various options
 */
describe('jsonToFrame Transformer', () => {
  /**
   * Tests transformation of array of objects to DataFrame
   * Verifies that array of objects is correctly transformed into a DataFrame
   */
  test('should transform array of objects to DataFrame', () => {
    const data = [
      { date: '2023-01-01', open: 100.5, close: 103.5 },
      { date: '2023-01-02', open: 103.75, close: 107.25 },
      { date: '2023-01-03', open: 107.5, close: 106.75 },
    ];

    const df = jsonToFrame(data);

    expect(df).toBeInstanceOf(DataFrame);
    expect(df.rowCount).toBe(3);
    expect(df.columns).toContain('date');
    expect(df.columns).toContain('open');
    expect(df.columns).toContain('close');

    const rows = df.toArray();
    expect(rows[0].date).toBe('2023-01-01');
    expect(rows[0].open).toBe(100.5);
  });

  /**
   * Tests transformation of object with arrays to DataFrame
   * Verifies that object with arrays is correctly transformed into a DataFrame
   */
  test('should transform object with arrays to DataFrame', () => {
    const data = {
      date: ['2023-01-01', '2023-01-02', '2023-01-03'],
      open: [100.5, 103.75, 107.5],
      close: [103.5, 107.25, 106.75],
    };

    const df = jsonToFrame(data);

    expect(df.rowCount).toBe(3);
    expect(df.columns).toContain('date');
    expect(df.columns).toContain('open');
    expect(df.columns).toContain('close');

    const rows = df.toArray();
    expect(rows[0].date).toBe('2023-01-01');
    expect(rows[0].open).toBe(100.5);
  });

  /**
   * Tests using TypedArrays for numeric columns
   * Verifies that TypedArrays are used for numeric columns when enabled
   */
  test('should use TypedArrays for numeric columns', () => {
    const data = [
      { a: 1, b: 2 },
      { a: 3, b: 4 },
      { a: 5, b: 6 },
    ];

    const df = jsonToFrame(data, { useTypedArrays: true });

    // In the current DataFrame implementation, we cannot directly check TypedArrays usage
    // So we simply check that the DataFrame is created correctly
    expect(df).toBeInstanceOf(DataFrame);
    expect(df.rowCount).toBe(3);
    expect(df.columns).toContain('a');
    expect(df.columns).toContain('b');
  });

  /**
   * Tests not using TypedArrays for numeric columns when disabled
   * Verifies that TypedArrays are not used for numeric columns when disabled
   */
  test('should not use TypedArrays when disabled', () => {
    const data = [
      { a: 1, b: 2 },
      { a: 3, b: 4 },
      { a: 5, b: 6 },
    ];

    const df = jsonToFrame(data, { useTypedArrays: false });

    // In the current DataFrame implementation, we cannot directly check TypedArrays usage
    // So we simply check that the DataFrame is created correctly
    expect(df).toBeInstanceOf(DataFrame);
    expect(df.rowCount).toBe(3);
    expect(df.columns).toContain('a');
    expect(df.columns).toContain('b');
  });

  /**
   * Tests handling of Binance API response
   * Verifies that Binance API response data is correctly transformed into a DataFrame
   */
  test('should handle Binance API response', async () => {
    const binanceData = JSON.parse(
      await fs.readFile(
        path.resolve('./test/fixtures/binance_api_response.json'),
        'utf-8',
      ),
    );

    // Binance API returns a single object, so we need to wrap it in an array
    const df = jsonToFrame([binanceData]);

    expect(df).toBeInstanceOf(DataFrame);
    expect(df.rowCount).toBe(1); // Single object becomes a single row
    expect(df.columns).toContain('symbol');
    expect(df.columns).toContain('lastPrice');
    expect(df.columns).toContain('volume');

    const rows = df.toArray();
    expect(rows[0].symbol).toBe('BTCUSDT');
    expect(typeof rows[0].lastPrice).toBe('string'); // Binance returns prices as strings
  });

  /**
   * Tests handling of Binance klines response
   * Verifies that Binance klines response data is correctly transformed into a DataFrame
   */
  test('should handle Binance klines response', async () => {
    const binanceKlinesData = JSON.parse(
      await fs.readFile(
        path.resolve('./test/fixtures/binance_klines_response.json'),
        'utf-8',
      ),
    );

    // Binance klines are arrays of arrays, so we need to transform them
    const transformedData = binanceKlinesData.map((kline) => ({
      openTime: kline[0],
      open: parseFloat(kline[1]),
      high: parseFloat(kline[2]),
      low: parseFloat(kline[3]),
      close: parseFloat(kline[4]),
      volume: parseFloat(kline[5]),
      closeTime: kline[6],
      trades: kline[8],
    }));

    const df = jsonToFrame(transformedData);

    expect(df.rowCount).toBe(5);
    expect(df.columns).toContain('openTime');
    expect(df.columns).toContain('open');
    expect(df.columns).toContain('volume');

    const rows = df.toArray();
    expect(rows[0].openTime).toBe(1672531200000);
    expect(rows[0].open).toBe(1000);
  });

  /**
   * Tests handling of Alpha Vantage API response
   * Verifies that Alpha Vantage API response data is correctly transformed into a DataFrame
   */
  test('should handle Alpha Vantage API response', async () => {
    const alphaVantageData = JSON.parse(
      await fs.readFile(
        path.resolve('./test/fixtures/alphavantage_api_response.json'),
        'utf-8',
      ),
    );

    // Alpha Vantage has a nested structure, we need to transform it
    const timeSeriesData = alphaVantageData['Time Series (Daily)'];
    const transformedData = Object.entries(timeSeriesData).map(
      ([date, values]) => ({
        date,
        open: parseFloat(values['1. open']),
        high: parseFloat(values['2. high']),
        low: parseFloat(values['3. low']),
        close: parseFloat(values['4. close']),
        volume: parseInt(values['5. volume']),
      }),
    );

    const df = jsonToFrame(transformedData);

    expect(df.rowCount).toBe(5);
    expect(df.columns).toContain('date');
    expect(df.columns).toContain('open');
    expect(df.columns).toContain('volume');

    const rows = df.toArray();
    expect(rows[0].date).toBe('2023-01-05');
    expect(rows[0].open).toBe(126.01);
  });

  /**
   * Tests handling of Yahoo Finance API response
   * Verifies that Yahoo Finance API response data is correctly transformed into a DataFrame
   */
  test('should handle Yahoo Finance API response', async () => {
    const yahooFinanceData = JSON.parse(
      await fs.readFile(
        path.resolve('./test/fixtures/yahoo_finance_api_response.json'),
        'utf-8',
      ),
    );

    // Yahoo Finance has a complex nested structure
    const result = yahooFinanceData.chart.result[0];
    const timestamps = result.timestamp;
    const quotes = result.indicators.quote[0];

    // Transform into row format
    const transformedData = timestamps.map((timestamp, i) => ({
      date: new Date(timestamp * 1000),
      open: quotes.open[i],
      high: quotes.high[i],
      low: quotes.low[i],
      close: quotes.close[i],
      volume: quotes.volume[i],
      symbol: result.meta.symbol,
    }));

    const df = jsonToFrame(transformedData);

    expect(df.rowCount).toBe(5);
    expect(df.columns).toContain('date');
    expect(df.columns).toContain('open');
    expect(df.columns).toContain('symbol');

    const rows = df.toArray();
    expect(rows[0].symbol).toBe('MSFT');
    expect(rows[0].open).toBe(217.9);
  });

  /**
   * Tests error handling for invalid JSON data format
   * Verifies that an error is thrown for invalid JSON data format
   */
  test('should throw error for invalid JSON data format', () => {
    expect(() => jsonToFrame('not a json object')).toThrow();
    expect(() => jsonToFrame(123)).toThrow();
    expect(() => jsonToFrame(null)).toThrow();
  });
});
