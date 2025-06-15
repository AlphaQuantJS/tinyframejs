/**
 * Schema mappings for weather APIs
 * Standardizes data from different weather data providers to a common format
 */

/**
 * Standard column names for weather data
 */
export const STANDARD_WEATHER_COLUMNS = [
  'timestamp', // Unix timestamp in milliseconds
  'temperature', // Temperature in Celsius
  'feelsLike', // Feels like temperature in Celsius
  'humidity', // Humidity percentage
  'pressure', // Atmospheric pressure in hPa
  'windSpeed', // Wind speed in m/s
  'windDirection', // Wind direction in degrees
  'cloudiness', // Cloudiness percentage
  'precipitation', // Precipitation amount in mm
  'weatherCode', // Weather condition code
  'weatherDesc', // Weather condition description
];

/**
 * OpenWeatherMap current weather schema mapping
 * Maps OpenWeatherMap current weather data to standard column names
 */
export const openWeatherMapCurrent = {
  timestamp: {
    path: 'dt',
    transform: (value) => value * 1000, // Convert to milliseconds
  },
  temperature: {
    path: 'main.temp',
    transform: (value) => value - 273.15, // Convert from Kelvin to Celsius
  },
  feelsLike: {
    path: 'main.feels_like',
    transform: (value) => value - 273.15, // Convert from Kelvin to Celsius
  },
  humidity: 'main.humidity',
  pressure: 'main.pressure',
  windSpeed: 'wind.speed',
  windDirection: 'wind.deg',
  cloudiness: 'clouds.all',
  precipitation: (obj) => {
    if (obj.rain && obj.rain['1h']) return obj.rain['1h'];
    if (obj.snow && obj.snow['1h']) return obj.snow['1h'];
    return 0;
  },
  weatherCode: 'weather[0].id',
  weatherDesc: 'weather[0].description',
  location: {
    path: 'name',
    transform: (value, obj) => `${value}, ${obj.sys.country}`,
  },
  coordinates: (obj) => [obj.coord.lon, obj.coord.lat],
};

/**
 * OpenWeatherMap forecast schema mapping
 * Maps OpenWeatherMap forecast data to standard column names
 */
export const openWeatherMapForecast = {
  timestamp: {
    path: 'dt',
    transform: (value) => value * 1000, // Convert to milliseconds
  },
  temperature: {
    path: 'main.temp',
    transform: (value) => value - 273.15, // Convert from Kelvin to Celsius
  },
  feelsLike: {
    path: 'main.feels_like',
    transform: (value) => value - 273.15, // Convert from Kelvin to Celsius
  },
  tempMin: {
    path: 'main.temp_min',
    transform: (value) => value - 273.15, // Convert from Kelvin to Celsius
  },
  tempMax: {
    path: 'main.temp_max',
    transform: (value) => value - 273.15, // Convert from Kelvin to Celsius
  },
  humidity: 'main.humidity',
  pressure: 'main.pressure',
  windSpeed: 'wind.speed',
  windDirection: 'wind.deg',
  cloudiness: 'clouds.all',
  precipitation: (obj) => {
    if (obj.rain && obj.rain['3h']) return obj.rain['3h'];
    if (obj.snow && obj.snow['3h']) return obj.snow['3h'];
    return 0;
  },
  weatherCode: 'weather[0].id',
  weatherDesc: 'weather[0].description',
  dateTime: {
    path: 'dt_txt',
    transform: (value) => value,
  },
};

/**
 * WeatherAPI current weather schema mapping
 * Maps WeatherAPI current weather data to standard column names
 */
export const weatherApiCurrent = {
  timestamp: {
    path: 'current.last_updated_epoch',
    transform: (value) => value * 1000, // Convert to milliseconds
  },
  temperature: 'current.temp_c',
  feelsLike: 'current.feelslike_c',
  humidity: 'current.humidity',
  pressure: 'current.pressure_mb',
  windSpeed: 'current.wind_kph',
  windDirection: 'current.wind_degree',
  cloudiness: 'current.cloud',
  precipitation: 'current.precip_mm',
  weatherCode: 'current.condition.code',
  weatherDesc: 'current.condition.text',
  location: (obj) => `${obj.location.name}, ${obj.location.country}`,
  coordinates: (obj) => [obj.location.lon, obj.location.lat],
};

/**
 * Tomorrow.io current weather schema mapping
 * Maps Tomorrow.io current weather data to standard column names
 */
export const tomorrowIoCurrent = {
  timestamp: {
    path: 'data.time',
    transform: (value) => new Date(value).getTime(),
  },
  temperature: 'data.values.temperature',
  feelsLike: 'data.values.temperatureApparent',
  humidity: 'data.values.humidity',
  pressure: 'data.values.pressureSurfaceLevel',
  windSpeed: 'data.values.windSpeed',
  windDirection: 'data.values.windDirection',
  cloudiness: 'data.values.cloudCover',
  precipitation: 'data.values.precipitationIntensity',
  weatherCode: 'data.values.weatherCode',
  weatherDesc: (obj) => mapTomorrowIoWeatherCode(obj.data.values.weatherCode),
};

/**
 * Maps Tomorrow.io weather codes to descriptions
 *
 * @param {number} code - Tomorrow.io weather code
 * @returns {string} - Weather description
 */
function mapTomorrowIoWeatherCode(code) {
  const weatherCodes = {
    1000: 'Clear',
    1100: 'Mostly Clear',
    1101: 'Partly Cloudy',
    1102: 'Mostly Cloudy',
    1001: 'Cloudy',
    2000: 'Fog',
    2100: 'Light Fog',
    4000: 'Drizzle',
    4001: 'Rain',
    4200: 'Light Rain',
    4201: 'Heavy Rain',
    5000: 'Snow',
    5001: 'Flurries',
    5100: 'Light Snow',
    5101: 'Heavy Snow',
    6000: 'Freezing Drizzle',
    6001: 'Freezing Rain',
    6200: 'Light Freezing Rain',
    6201: 'Heavy Freezing Rain',
    7000: 'Ice Pellets',
    7101: 'Heavy Ice Pellets',
    7102: 'Light Ice Pellets',
    8000: 'Thunderstorm',
  };

  return weatherCodes[code] || 'Unknown';
}

/**
 * Transforms OpenWeatherMap current weather data to standard format
 *
 * @param {Object} data - OpenWeatherMap API response
 * @returns {Object} - Standardized weather object
 */
export function transformOpenWeatherMap(data) {
  if (!data || !data.main) {
    throw new Error('Invalid OpenWeatherMap data format');
  }

  const result = {};

  for (const [key, config] of Object.entries(openWeatherMapCurrent)) {
    if (typeof config === 'string') {
      // Simple path mapping
      result[key] = getNestedValue(data, config);
    } else if (typeof config === 'function') {
      // Function mapping
      result[key] = config(data);
    } else if (typeof config === 'object' && config.path !== undefined) {
      // Path with transform
      const value = getNestedValue(data, config.path);
      result[key] = config.transform ? config.transform(value, data) : value;
    }
  }

  return result;
}

/**
 * Get a nested value from an object using a dot-notation path
 *
 * @param {Object} obj - Object to get value from
 * @param {string} path - Dot-notation path (e.g., 'data.items[0].name')
 * @param {*} defaultValue - Default value if path not found
 * @returns {*} - Value at path or defaultValue
 */
function getNestedValue(obj, path, defaultValue = null) {
  if (!obj || !path) {
    return defaultValue;
  }

  // Handle array access in path (e.g., 'items[0]')
  const parts = path.split('.');
  let current = obj;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const arrayMatch = part.match(/^([^[]+)\[(\d+)\]$/);

    if (arrayMatch) {
      // Handle array access
      const arrayName = arrayMatch[1];
      const arrayIndex = parseInt(arrayMatch[2]);

      if (
        !current[arrayName] ||
        !Array.isArray(current[arrayName]) ||
        arrayIndex >= current[arrayName].length
      ) {
        return defaultValue;
      }

      current = current[arrayName][arrayIndex];
    } else {
      // Handle regular property access
      if (current === null || current === undefined || !(part in current)) {
        return defaultValue;
      }

      current = current[part];
    }
  }

  return current !== undefined ? current : defaultValue;
}
