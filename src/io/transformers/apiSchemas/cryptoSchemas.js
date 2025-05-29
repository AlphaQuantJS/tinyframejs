/**
 * Schema mappings for cryptocurrency APIs
 * Standardizes data from different crypto exchanges to a common format
 */

/**
 * Standard column names for OHLCV (Open, High, Low, Close, Volume) data
 */
export const STANDARD_OHLCV_COLUMNS = [
  'timestamp', // Unix timestamp in milliseconds
  'open', // Opening price
  'high', // Highest price
  'low', // Lowest price
  'close', // Closing price
  'volume', // Volume in base currency
  'quoteVolume', // Volume in quote currency (optional)
];

/**
 * Binance OHLCV schema mapping
 * Maps Binance kline/candlestick data to standard column names
 */
export const binanceOHLCV = {
  timestamp: {
    path: '0',
    transform: (value) => parseInt(value),
  },
  open: {
    path: '1',
    transform: (value) => parseFloat(value),
  },
  high: {
    path: '2',
    transform: (value) => parseFloat(value),
  },
  low: {
    path: '3',
    transform: (value) => parseFloat(value),
  },
  close: {
    path: '4',
    transform: (value) => parseFloat(value),
  },
  volume: {
    path: '5',
    transform: (value) => parseFloat(value),
  },
  quoteVolume: {
    path: '7',
    transform: (value) => parseFloat(value),
  },
  trades: {
    path: '8',
    transform: (value) => parseInt(value),
  },
  buyVolume: {
    path: '9',
    transform: (value) => parseFloat(value),
  },
  buyQuoteVolume: {
    path: '10',
    transform: (value) => parseFloat(value),
  },
};

/**
 * CoinAPI OHLCV schema mapping
 * Maps CoinAPI OHLCV data to standard column names
 */
export const coinApiOHLCV = {
  timestamp: {
    path: 'time_period_start',
    transform: (value) => new Date(value).getTime(),
  },
  open: 'price_open',
  high: 'price_high',
  low: 'price_low',
  close: 'price_close',
  volume: 'volume_traded',
  quoteVolume: {
    path: 'volume_traded',
    transform: (value, obj) => value * obj.price_close,
  },
};

/**
 * Kraken OHLCV schema mapping
 * Maps Kraken OHLC data to standard column names
 */
export const krakenOHLCV = {
  timestamp: {
    path: '0',
    transform: (value) => parseInt(value) * 1000, // Convert to milliseconds
  },
  open: {
    path: '1',
    transform: (value) => parseFloat(value),
  },
  high: {
    path: '2',
    transform: (value) => parseFloat(value),
  },
  low: {
    path: '3',
    transform: (value) => parseFloat(value),
  },
  close: {
    path: '4',
    transform: (value) => parseFloat(value),
  },
  volume: {
    path: '6',
    transform: (value) => parseFloat(value),
  },
};

/**
 * FTX OHLCV schema mapping
 * Maps FTX historical data to standard column names
 */
export const ftxOHLCV = {
  timestamp: {
    path: 'startTime',
    transform: (value) => new Date(value).getTime(),
  },
  open: 'open',
  high: 'high',
  low: 'low',
  close: 'close',
  volume: 'volume',
};

/**
 * Coinbase Pro OHLCV schema mapping
 * Maps Coinbase Pro candles data to standard column names
 */
export const coinbaseProOHLCV = {
  timestamp: {
    path: '0',
    transform: (value) => parseInt(value) * 1000, // Convert to milliseconds
  },
  low: {
    path: '1',
    transform: (value) => parseFloat(value),
  },
  high: {
    path: '2',
    transform: (value) => parseFloat(value),
  },
  open: {
    path: '3',
    transform: (value) => parseFloat(value),
  },
  close: {
    path: '4',
    transform: (value) => parseFloat(value),
  },
  volume: {
    path: '5',
    transform: (value) => parseFloat(value),
  },
};

/**
 * Binance ticker schema mapping
 * Maps Binance ticker data to standard column names
 */
export const binanceTicker = {
  symbol: 'symbol',
  price: {
    path: 'price',
    transform: (value) => parseFloat(value),
  },
  timestamp: {
    path: 'time',
    transform: (value) => parseInt(value),
  },
  volume: {
    path: 'volume',
    transform: (value) => parseFloat(value),
  },
  quoteVolume: {
    path: 'quoteVolume',
    transform: (value) => parseFloat(value),
  },
  change: {
    path: 'priceChange',
    transform: (value) => parseFloat(value),
  },
  changePercent: {
    path: 'priceChangePercent',
    transform: (value) => parseFloat(value),
  },
  high: {
    path: 'highPrice',
    transform: (value) => parseFloat(value),
  },
  low: {
    path: 'lowPrice',
    transform: (value) => parseFloat(value),
  },
  open: {
    path: 'openPrice',
    transform: (value) => parseFloat(value),
  },
  close: {
    path: 'lastPrice',
    transform: (value) => parseFloat(value),
  },
};

/**
 * CoinGecko ticker schema mapping
 * Maps CoinGecko ticker data to standard column names
 */
export const coinGeckoTicker = {
  id: 'id',
  symbol: 'symbol',
  name: 'name',
  price: 'current_price',
  marketCap: 'market_cap',
  volume: 'total_volume',
  high: 'high_24h',
  low: 'low_24h',
  change: 'price_change_24h',
  changePercent: 'price_change_percentage_24h',
  timestamp: (obj) => Date.now(), // CoinGecko doesn't provide timestamp
};

/**
 * Transforms array data from Binance OHLCV format to standard format
 *
 * @param {Array} data - Array of Binance OHLCV data
 * @returns {Array} - Array of standardized OHLCV objects
 */
export function transformBinanceOHLCV(data) {
  if (!Array.isArray(data)) {
    throw new Error('Binance OHLCV data must be an array');
  }

  return data.map((item) => {
    const result = {};

    for (const [key, config] of Object.entries(binanceOHLCV)) {
      if (typeof config === 'object' && config.path !== undefined) {
        // Ensure we're accessing array indices as numbers, not strings
        const path = parseInt(config.path, 10);
        const value = Array.isArray(item) ? item[path] : item[config.path];
        result[key] = config.transform ? config.transform(value) : value;
      }
    }

    return result;
  });
}
