# IO Module Documentation

## Обзор

IO модуль TinyFrameJS предоставляет инструменты для чтения, преобразования и записи данных из различных источников. Модуль включает в себя:

- **Readers** - функции для чтения данных из различных источников (CSV, JSON, Excel и т.д.)
- **Stream Readers** - функции для потоковой обработки больших файлов
- **API Client** - клиент для работы с REST API с поддержкой кеширования, троттлинга и ротации ключей
- **Schema Registry** - реестр схем для автоматического преобразования данных из различных API
- **Transformers** - функции для преобразования данных между различными форматами
- **Pipeline** - конвейер для последовательной обработки данных

## Readers

### Базовые ридеры

```javascript
import { readCsv, readJson, readExcel, readTsv, readSql } from 'tinyframejs/io';

// Чтение CSV файла
const df = await readCsv('data.csv');

// Чтение JSON файла
const df = await readJson('data.json');

// Чтение Excel файла
const df = await readExcel('data.xlsx', { sheet: 'Sheet1' });

// Чтение TSV файла
const df = await readTsv('data.tsv');

// Чтение SQL запроса
const df = await readSql('SELECT * FROM table', connection);
```

### Потоковые ридеры

Для обработки больших файлов без загрузки их полностью в память:

```javascript
import { readCSVStream, readJSONLStream } from 'tinyframejs/io';

// Потоковое чтение CSV файла
await readCSVStream('large-data.csv', {
  batchSize: 1000,
  onBatch: async (batch) => {
    // Обработка каждой партии данных
    console.log(`Обработано ${batch.rowCount} строк`);
    
    // Можно вернуть результат обработки
    return batch.sum('value');
  }
});

// Потоковое чтение JSONL файла
await readJSONLStream('large-data.jsonl', {
  batchSize: 500,
  onBatch: async (batch) => {
    // Обработка каждой партии данных
    await processData(batch);
  }
});
```

## API Client

API клиент предоставляет унифицированный интерфейс для работы с REST API, включая кеширование, троттлинг и ротацию ключей.

```javascript
import { ApiClient, createApiClient } from 'tinyframejs/io';

// Создание клиента
const client = createApiClient({
  baseUrl: 'https://api.example.com',
  defaultHeaders: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  // Настройки аутентификации
  auth: {
    keys: [
      { id: 'key1', key: 'api-key-1' },
      { id: 'key2', key: 'api-key-2' }
    ],
    authType: 'bearer' // 'bearer', 'basic', 'header', 'query'
  },
  // Настройки кеширования
  cache: {
    ttl: 3600000, // 1 час
    maxSize: 100 // максимальное количество элементов в кеше
  },
  // Настройки троттлинга
  throttle: {
    requestsPerSecond: 5,
    requestsPerMinute: 100
  },
  // Настройки повторных попыток
  retry: {
    retries: 3,
    retryDelay: 1000,
    retryOn: [429, 503]
  }
});

// Выполнение запросов
const data = await client.fetchJson('/endpoint');

// Выполнение запроса с преобразованием в DataFrame
const df = await client.fetchDataFrame('/endpoint');

// Выполнение запроса с применением схемы
const data = await client.fetchJson('/endpoint', {}, 'binanceOHLCV');

// Выполнение запроса с получением CSV данных
const df = await client.fetchCsv('/endpoint.csv');
```

## Schema Registry

Реестр схем позволяет автоматически преобразовывать данные из различных API к стандартному формату.

```javascript
import { 
  getSchema, 
  registerSchema, 
  applySchema,
  binanceOHLCV,
  alphaVantageDaily
} from 'tinyframejs/io';

// Получение схемы по имени
const schema = getSchema('binanceOHLCV');

// Регистрация новой схемы
registerSchema('myApiSchema', {
  timestamp: 'time',
  value: {
    path: 'data.value',
    transform: (value) => parseFloat(value)
  },
  name: (obj) => `${obj.type}-${obj.id}`
});

// Применение схемы к данным
const data = await client.fetchJson('/endpoint');
const transformed = applySchema(data, 'myApiSchema');

// Применение встроенной схемы
const binanceData = await client.fetchJson('/binance/klines');
const standardized = applySchema(binanceData, binanceOHLCV);
```

## Pipeline

Конвейер позволяет создавать цепочки обработки данных для ETL процессов.

```javascript
import { 
  createPipeline, 
  filter, 
  map, 
  sort, 
  limit, 
  toDataFrame,
  log
} from 'tinyframejs/io';
import { readCsv } from 'tinyframejs/io';

// Создание конвейера
const pipeline = createPipeline(
  // Ридер
  () => readCsv('data.csv'),
  // Трансформеры
  [
    filter(row => row.value > 0),
    map(row => ({ ...row, value: row.value * 2 })),
    sort('timestamp'),
    limit(1000),
    log('Processed data:'),
    toDataFrame()
  ]
);

// Выполнение конвейера
const result = await pipeline();
```

## Batch Processing

Для обработки данных партиями:

```javascript
import { batchProcess } from 'tinyframejs/io';
import { readCSVStream } from 'tinyframejs/io';

// Обработка данных партиями
const results = await batchProcess(
  // Ридер
  (options) => readCSVStream('large-data.csv', options),
  // Обработчик партии
  async (batch) => {
    // Обработка партии данных
    return batch.sum('value');
  },
  // Опции
  {
    batchSize: 1000,
    onProgress: ({ processedCount, batchCount }) => {
      console.log(`Processed ${processedCount} rows in ${batchCount} batches`);
    }
  }
);

// Результаты содержат массив результатов обработки каждой партии
console.log(`Total sum: ${results.reduce((sum, val) => sum + val, 0)}`);
```

## Middleware Hooks

Хуки (middleware) позволяют расширять функциональность API клиента.

### Logger Hook

```javascript
import { createLoggerHook } from 'tinyframejs/io';

const loggerHook = createLoggerHook({
  logRequest: true,
  logResponse: true,
  logErrors: true,
  logTiming: true,
  logger: console.log
});

client.addHook(loggerHook);
```

### Cache Hook

```javascript
import { createCacheHook, MemoryCache } from 'tinyframejs/io';

const cache = new MemoryCache({
  ttl: 3600000, // 1 час
  maxSize: 100
});

const cacheHook = createCacheHook({
  cache,
  ttl: 3600000,
  keyGenerator: (request) => `${request.method}:${request.url}`,
  shouldCache: (request) => request.method === 'GET'
});

client.addHook(cacheHook);
```

### Throttle Hook

```javascript
import { createThrottleHook } from 'tinyframejs/io';

const throttleHook = createThrottleHook({
  requestsPerSecond: 5,
  requestsPerMinute: 100,
  requestsPerHour: 1000,
  groupByDomain: true,
  onThrottle: (waitTime) => console.log(`Request throttled. Waiting ${waitTime}ms`)
});

client.addHook(throttleHook);
```

### Auth Hook

```javascript
import { createAuthHook, KeyRotator } from 'tinyframejs/io';

const authHook = createAuthHook({
  keys: [
    { id: 'key1', key: 'api-key-1' },
    { id: 'key2', key: 'api-key-2' }
  ],
  authType: 'bearer', // 'bearer', 'basic', 'header', 'query'
  headerName: 'Authorization',
  queryParam: 'api_key',
  maxErrorsBeforeDisable: 3,
  resetErrorsAfter: 3600000, // 1 час
  rotationStrategy: 'round-robin' // 'round-robin', 'least-used', 'random'
});

client.addHook(authHook);
```

## Примеры использования

### Загрузка и обработка данных о ценах криптовалют

```javascript
import { createApiClient, applySchema, binanceOHLCV } from 'tinyframejs/io';

async function getBitcoinPrices() {
  const client = createApiClient({
    baseUrl: 'https://api.binance.com',
    cache: { ttl: 300000 }, // 5 минут
    throttle: { requestsPerMinute: 60 }
  });
  
  // Получение данных
  const data = await client.fetchJson('/api/v3/klines?symbol=BTCUSDT&interval=1d&limit=30');
  
  // Применение схемы
  const standardized = applySchema(data, binanceOHLCV);
  
  // Преобразование в DataFrame
  return DataFrame.fromRecords(standardized);
}

// Использование
const btcPrices = await getBitcoinPrices();
btcPrices.plot('line', { x: 'timestamp', y: 'close' });
```

### Потоковая обработка большого CSV файла

```javascript
import { readCSVStream, batchProcess } from 'tinyframejs/io';

async function processLargeCSV(filePath) {
  let total = 0;
  let count = 0;
  
  await batchProcess(
    (options) => readCSVStream(filePath, options),
    async (batch) => {
      // Вычисление среднего значения для каждой партии
      const batchSum = batch.sum('value');
      const batchCount = batch.rowCount;
      
      total += batchSum;
      count += batchCount;
      
      return { batchSum, batchCount };
    },
    {
      batchSize: 10000,
      onProgress: ({ processedCount }) => {
        console.log(`Processed ${processedCount} rows`);
      }
    }
  );
  
  return total / count; // Среднее значение по всему файлу
}

// Использование
const average = await processLargeCSV('very-large-file.csv');
console.log(`Average value: ${average}`);
```
