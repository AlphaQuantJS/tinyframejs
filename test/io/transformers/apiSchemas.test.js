import { describe, it, expect } from 'vitest';
import {
  getSchema,
  registerSchema,
  applySchema,
} from '../../../src/io/transformers/apiSchemas/index.js';
import {
  binanceOHLCV,
  transformBinanceOHLCV,
} from '../../../src/io/transformers/apiSchemas/cryptoSchemas.js';
import {
  alphaVantageDaily,
  transformAlphaVantageDaily,
} from '../../../src/io/transformers/apiSchemas/financeSchemas.js';

describe('API Schema Registry', () => {
  it('should register and retrieve schemas', () => {
    // Register a new schema
    const testSchema = {
      name: 'testSchemaName',
      transform: (data) => ({ transformed: true, ...data }),
    };

    registerSchema('testSchema', testSchema);

    // Retrieve the schema
    const retrievedSchema = getSchema('testSchema');

    expect(retrievedSchema).toEqual(testSchema);
  });

  it('should return null for non-existent schemas', () => {
    const nonExistentSchema = getSchema('nonExistentSchema');

    expect(nonExistentSchema).toBeNull();
  });

  it('should apply schema to transform data', () => {
    // Register a test schema
    const testSchema = {
      name: 'testTransform',
      transform: (data) => ({
        newName: data.oldName,
        newValue: data.oldValue * 2,
      }),
    };

    registerSchema('testTransform', testSchema);

    // Test data
    const testData = {
      oldName: 'Test',
      oldValue: 5,
    };

    // Apply schema by name
    const transformed = applySchema('testTransform', testData);

    expect(transformed).toEqual({
      newName: 'Test',
      newValue: 10,
    });
  });

  it('should apply schema to an array of objects', () => {
    // Register a test schema
    const testSchema = {
      name: 'testArrayTransform',
      transform: (dataArray) =>
        dataArray.map((data) => ({
          newName: data.oldName,
          newValue: data.oldValue * 2,
        })),
    };

    registerSchema('testArrayTransform', testSchema);

    // Test data array
    const testDataArray = [
      { oldName: 'Test1', oldValue: 5 },
      { oldName: 'Test2', oldValue: 10 },
    ];

    // Apply schema by name
    const transformed = applySchema('testArrayTransform', testDataArray);

    expect(transformed).toEqual([
      { newName: 'Test1', newValue: 10 },
      { newName: 'Test2', newValue: 20 },
    ]);
  });
});

describe('Crypto API Schemas', () => {
  it('should transform Binance OHLCV data', () => {
    // Mock Binance OHLCV data (array format)
    const binanceData = [
      [
        1625097600000, // timestamp
        '35000.00', // open
        '36000.00', // high
        '34500.00', // low
        '35500.00', // close
        '100.5', // volume
        1625097900000, // close timestamp
        '3567750.00', // quote volume
        500, // trades
        '50.5', // buy volume
        '1792500.00', // buy quote volume
      ],
    ];

    // Transform using the schema directly
    const transformed = transformBinanceOHLCV(binanceData);

    expect(transformed[0]).toEqual({
      timestamp: 1625097600000,
      open: 35000.0,
      high: 36000.0,
      low: 34500.0,
      close: 35500.0,
      volume: 100.5,
      quoteVolume: 3567750.0,
      trades: 500,
      buyVolume: 50.5,
      buyQuoteVolume: 1792500.0,
    });

    // In the new implementation, applySchema takes the schema name, not the schema itself
    // So we use the transform function directly
    const manuallyTransformed = transformBinanceOHLCV([binanceData[0]])[0];

    expect(manuallyTransformed).toEqual(transformed[0]);
  });
});

describe('Finance API Schemas', () => {
  it('should transform Alpha Vantage daily data', () => {
    // Mock Alpha Vantage daily data
    const alphaVantageData = {
      'Meta Data': {
        '1. Information': 'Daily Prices',
        '2. Symbol': 'AAPL',
      },
      'Time Series (Daily)': {
        '2023-01-03': {
          '1. open': '130.28',
          '2. high': '131.03',
          '3. low': '124.17',
          '4. close': '125.07',
          '5. volume': '112117500',
        },
        '2023-01-02': {
          '1. open': '128.41',
          '2. high': '129.95',
          '3. low': '127.43',
          '4. close': '129.62',
          '5. volume': '70790400',
        },
      },
    };

    // Transform using the schema
    const transformed = transformAlphaVantageDaily(alphaVantageData);

    expect(transformed).toHaveLength(2);
    expect(transformed[0].timestamp).toBeGreaterThan(transformed[1].timestamp);
    expect(transformed[0].open).toBeCloseTo(130.28);
    expect(transformed[0].high).toBeCloseTo(131.03);
    expect(transformed[0].low).toBeCloseTo(124.17);
    expect(transformed[0].close).toBeCloseTo(125.07);
    expect(transformed[0].volume).toBe(112117500);
  });
});
