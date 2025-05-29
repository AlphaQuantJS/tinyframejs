/**
 * Schema mappings for financial market APIs
 * Standardizes data from different financial data providers to a common format
 */

/**
 * Standard column names for stock price data
 */
export const STANDARD_STOCK_COLUMNS = [
  'timestamp', // Unix timestamp in milliseconds
  'open', // Opening price
  'high', // Highest price
  'low', // Lowest price
  'close', // Closing price
  'volume', // Trading volume
  'adjClose', // Adjusted close price
];

/**
 * Alpha Vantage daily time series schema mapping
 * Maps Alpha Vantage daily time series data to standard column names
 */
export const alphaVantageDaily = {
  timestamp: {
    path: 'date',
    transform: (value) => new Date(value).getTime(),
  },
  open: {
    path: '1. open',
    transform: (value) => parseFloat(value),
  },
  high: {
    path: '2. high',
    transform: (value) => parseFloat(value),
  },
  low: {
    path: '3. low',
    transform: (value) => parseFloat(value),
  },
  close: {
    path: '4. close',
    transform: (value) => parseFloat(value),
  },
  volume: {
    path: '5. volume',
    transform: (value) => parseInt(value),
  },
};

/**
 * Alpha Vantage intraday time series schema mapping
 * Maps Alpha Vantage intraday time series data to standard column names
 */
export const alphaVantageIntraday = {
  timestamp: {
    path: 'datetime',
    transform: (value) => new Date(value).getTime(),
  },
  open: {
    path: '1. open',
    transform: (value) => parseFloat(value),
  },
  high: {
    path: '2. high',
    transform: (value) => parseFloat(value),
  },
  low: {
    path: '3. low',
    transform: (value) => parseFloat(value),
  },
  close: {
    path: '4. close',
    transform: (value) => parseFloat(value),
  },
  volume: {
    path: '5. volume',
    transform: (value) => parseInt(value),
  },
};

/**
 * Yahoo Finance historical data schema mapping
 * Maps Yahoo Finance historical data to standard column names
 */
export const yahooFinanceHistory = {
  timestamp: {
    path: 'date',
    transform: (value) => new Date(value).getTime(),
  },
  open: 'open',
  high: 'high',
  low: 'low',
  close: 'close',
  adjClose: 'adjClose',
  volume: 'volume',
};

/**
 * IEX Cloud historical data schema mapping
 * Maps IEX Cloud historical data to standard column names
 */
export const iexCloudHistory = {
  timestamp: {
    path: 'date',
    transform: (value) => new Date(value).getTime(),
  },
  open: 'open',
  high: 'high',
  low: 'low',
  close: 'close',
  volume: 'volume',
  change: 'change',
  changePercent: 'changePercent',
  symbol: 'symbol',
};

/**
 * Polygon.io historical data schema mapping
 * Maps Polygon.io historical data to standard column names
 */
export const polygonHistory = {
  timestamp: {
    path: 't',
    transform: (value) => value,
  },
  open: {
    path: 'o',
    transform: (value) => parseFloat(value),
  },
  high: {
    path: 'h',
    transform: (value) => parseFloat(value),
  },
  low: {
    path: 'l',
    transform: (value) => parseFloat(value),
  },
  close: {
    path: 'c',
    transform: (value) => parseFloat(value),
  },
  volume: {
    path: 'v',
    transform: (value) => parseInt(value),
  },
};

/**
 * Finnhub stock candles schema mapping
 * Maps Finnhub stock candles data to standard column names
 */
export const finnhubCandles = {
  timestamp: {
    path: 't',
    transform: (value, obj, index) =>
      (Array.isArray(value) ? value[index] * 1000 : value * 1000),
  },
  open: {
    path: 'o',
    transform: (value, obj, index) =>
      (Array.isArray(value) ? value[index] : value),
  },
  high: {
    path: 'h',
    transform: (value, obj, index) =>
      (Array.isArray(value) ? value[index] : value),
  },
  low: {
    path: 'l',
    transform: (value, obj, index) =>
      (Array.isArray(value) ? value[index] : value),
  },
  close: {
    path: 'c',
    transform: (value, obj, index) =>
      (Array.isArray(value) ? value[index] : value),
  },
  volume: {
    path: 'v',
    transform: (value, obj, index) =>
      (Array.isArray(value) ? value[index] : value),
  },
};

/**
 * Transforms Alpha Vantage daily time series data to standard format
 *
 * @param {Object} data - Alpha Vantage API response
 * @returns {Array} - Array of standardized price objects
 */
export function transformAlphaVantageDaily(data) {
  if (!data || !data['Time Series (Daily)']) {
    throw new Error('Invalid Alpha Vantage daily data format');
  }

  const timeSeriesData = data['Time Series (Daily)'];
  const result = [];

  for (const [date, values] of Object.entries(timeSeriesData)) {
    result.push({
      date,
      ...values,
    });
  }

  // Sort by date (newest first)
  result.sort((a, b) => new Date(b.date) - new Date(a.date));

  return result.map((item) => {
    const standardItem = {};

    for (const [key, config] of Object.entries(alphaVantageDaily)) {
      if (typeof config === 'object' && config.path !== undefined) {
        const value = key === 'timestamp' ? item.date : item[config.path];
        standardItem[key] = config.transform ? config.transform(value) : value;
      }
    }

    return standardItem;
  });
}

/**
 * Transforms Yahoo Finance historical data to standard format
 *
 * @param {Object} data - Yahoo Finance API response
 * @returns {Array} - Array of standardized price objects
 */
export function transformYahooFinance(data) {
  if (!data || !data.chart || !data.chart.result || !data.chart.result[0]) {
    throw new Error('Invalid Yahoo Finance data format');
  }

  const result = data.chart.result[0];
  const timestamps = result.timestamp;
  const quotes = result.indicators.quote[0];
  const adjClose = result.indicators.adjclose ?
    result.indicators.adjclose[0].adjclose :
    null;

  return timestamps.map((timestamp, i) => ({
    timestamp: timestamp * 1000, // Convert to milliseconds
    open: quotes.open[i],
    high: quotes.high[i],
    low: quotes.low[i],
    close: quotes.close[i],
    volume: quotes.volume[i],
    adjClose: adjClose ? adjClose[i] : quotes.close[i],
  }));
}
