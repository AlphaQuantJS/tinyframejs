---
id: io
title: How do I read and write tabular data?
sidebar_position: 2
description: Learn how to import and export data in various formats with TinyFrameJS
---

# How do I read and write tabular data?

TinyFrameJS provides a variety of functions for reading data from different sources and writing data to different formats. This section covers the most common input/output operations.

<div align="center">
  <img src="/img/io.png" alt="TinyFrameJS I/O Operations" width="25%" />
</div>

## Installation Requirements

To use the I/O features in TinyFrameJS, you may need to install additional dependencies depending on which file formats you want to work with:

### Basic Requirements

```bash
# Install TinyFrameJS if you haven't already
npm install tinyframejs
```

### For Excel Files

```bash
# Required for reading and writing Excel files
npm install exceljs@^4.4.0
```

### For SQL Support

```bash
# Required for SQL database operations
npm install better-sqlite3@^8.0.0
```

### For Large File Processing

```bash
# Optional: Improves performance for large file processing
npm install worker-threads-pool@^2.0.0
```

### For Node.js Environments

```bash
# For file system operations in Node.js (usually included with Node.js)
# No additional installation required
```

### For Browser Environments

```bash
# No additional packages required for basic CSV/JSON operations in browsers
# TinyFrameJS uses native browser APIs for these formats
```

## Reading Data

### Reading from CSV

CSV (Comma-Separated Values) is one of the most common formats for tabular data. TinyFrameJS provides the `readCsv` function for reading CSV files:

```js
import { readCsv } from 'tinyframejs/io/readers';

// Asynchronous reading from a CSV file
const df = await readCsv('data.csv');

// Reading from a URL
const dfFromUrl = await readCsv('https://example.com/data.csv');

// Reading from a File object (in browser)
const fileInput = document.getElementById('fileInput');
const file = fileInput.files[0];
const dfFromFile = await readCsv(file);

// With additional options
const dfWithOptions = await readCsv('data.csv', {
  delimiter: ';',             // Delimiter character to separate values (default ',')
  header: true,               // Use first row as header names (default true)
  skipEmptyLines: true,       // Skip empty lines in the file (default true)
  dynamicTyping: true,        // Automatically convert string values to appropriate types (numbers, booleans, etc.) (default true)
  emptyValue: null,           // Value to use for empty cells (see "Handling Empty Values" section for strategies)
  batchSize: 10000,           // Process file in batches of 10000 rows to reduce memory usage for large files
  encoding: 'utf-8'           // Character encoding of the file (default 'utf-8')
});
```

You can also use the DataFrame class method:

```js
import { DataFrame } from 'tinyframejs';

const df = await DataFrame.readCsv('data.csv');
```

#### Batch Processing for Large CSV Files

For large CSV files that don't fit in memory, you can use batch processing:

```js
import { readCsv } from 'tinyframejs/io/readers';

// Create a batch processor
const batchProcessor = await readCsv('large-data.csv', { batchSize: 10000 });

// Process each batch
let totalSum = 0;
for await (const batchDf of batchProcessor) {
  // batchDf is a DataFrame with a portion of data
  totalSum += batchDf.sum('value');
}
console.log(`Total sum: ${totalSum}`);

// Alternatively, use the process method
await batchProcessor.process(async (batchDf) => {
  // Process each batch
  console.log(`Batch with ${batchDf.rowCount} rows`);
});

// Or collect all batches into a single DataFrame
const fullDf = await batchProcessor.collect();
```

### Reading from TSV

TSV (Tab-Separated Values) is similar to CSV but uses tabs as delimiters. TinyFrameJS provides the `readTsv` function:

```js
import { readTsv } from 'tinyframejs/io/readers';

// Asynchronous reading from a TSV file
const df = await readTsv('data.tsv');

// Reading from a URL
const dfFromUrl = await readTsv('https://example.com/data.tsv');

// With options (similar to readCsv)
const dfWithOptions = await readTsv('data.tsv', {
  header: true,               // Use first row as column headers (default true)
  skipEmptyLines: true,       // Ignore empty lines in the TSV file (default true)
  dynamicTyping: true,        // Automatically detect and convert data types (numbers, booleans, etc.) (default true)
  batchSize: 5000,            // Process file in chunks of 5000 rows to handle large files efficiently
  emptyValue: null,           // Value to assign to empty cells (see "Handling Empty Values" section for strategies)
  encoding: 'utf-8'           // Character encoding of the TSV file (default 'utf-8')
});
```

DataFrame class method:

```js
import { DataFrame } from 'tinyframejs';

const df = await DataFrame.readTsv('data.tsv');
```

### Reading from JSON

JSON is a popular format for data exchange. TinyFrameJS can read JSON files with various structures:

```js
import { readJson } from 'tinyframejs/io/readers';

// Reading from a JSON file
const df = await readJson('data.json');

// Reading from a URL
const dfFromUrl = await readJson('https://example.com/data.json');

// Reading from a File object (in browser)
const fileInput = document.getElementById('fileInput');
const file = fileInput.files[0];
const dfFromFile = await readJson(file);

// With options
const dfWithOptions = await readJson('data.json', {
  recordPath: 'data.records',  // Path to the array of records within the JSON structure (e.g., 'data.records' for nested data)
  dynamicTyping: true,         // Automatically detect and convert data types from strings to appropriate JS types (default true)
  emptyValue: null,            // Value to use for null or undefined fields in the JSON (see "Handling Empty Values" section)
  batchSize: 5000,             // Process large JSON files in chunks of 5000 records to manage memory usage
  flatten: false,              // Whether to flatten nested objects into column names with dot notation (default false)
  dateFields: ['createdAt']    // Array of field names that should be parsed as dates
});
```

DataFrame class method:

```js
import { DataFrame } from 'tinyframejs';

const df = await DataFrame.readJson('data.json');
```

#### Batch Processing for Large JSON Files

For large JSON files, you can use batch processing:

```js
import { readJson } from 'tinyframejs/io/readers';

// Create a batch processor
const batchProcessor = await readJson('large-data.json', { 
  batchSize: 10000,
  recordPath: 'data.items' 
});

// Process each batch
for await (const batchDf of batchProcessor) {
  // Process each batch DataFrame
  console.log(`Processing batch with ${batchDf.rowCount} rows`);
}

// Or collect all batches
const fullDf = await batchProcessor.collect();
```

### Reading from Excel

TinyFrameJS uses the exceljs library for working with Excel files:

```js
import { readExcel } from 'tinyframejs/io/readers';

// Reading from an Excel file
const df = await readExcel('data.xlsx');

// Reading from a File object (in browser)
const fileInput = document.getElementById('fileInput');
const file = fileInput.files[0];
const dfFromFile = await readExcel(file);

// With options
const dfWithOptions = await readExcel('data.xlsx', {
  sheet: 'Sheet1',           // Name of the worksheet to read (default is the first sheet)
  header: true,              // Use first row as column headers (default true)
  dynamicTyping: true,       // Automatically convert cell values to appropriate JavaScript types (default true)
  emptyValue: null,          // Value to assign to empty cells in the spreadsheet (see "Handling Empty Values" section)
  batchSize: 5000,           // Process large Excel files in batches of 5000 rows to manage memory usage
  range: 'A1:F100',          // Specific cell range to read (optional, default is the entire used range)
  dateFormat: 'YYYY-MM-DD',  // Format to use when converting Excel dates to strings (default is ISO format)
  skipHiddenRows: true       // Whether to skip hidden rows in the Excel sheet (default false)
});
```

DataFrame class method:

```js
import { DataFrame } from 'tinyframejs';

const df = await DataFrame.readExcel('data.xlsx', { sheet: 'Data' });
```

#### Batch Processing for Large Excel Files

For large Excel files, you can use batch processing:

```js
import { readExcel } from 'tinyframejs/io/readers';

// Create a batch processor
const batchProcessor = await readExcel('large-data.xlsx', { 
  batchSize: 5000,
  sheet: 'Data' 
});

// Process each batch
for await (const batchDf of batchProcessor) {
  // Process each batch DataFrame
  console.log(`Processing batch with ${batchDf.rowCount} rows`);
}

// Or collect all batches
const fullDf = await batchProcessor.collect();
```

### Reading from SQL

TinyFrameJS can read data from SQLite databases:

```js
import { readSql } from 'tinyframejs/io/readers';

// Reading from a SQLite database
const df = await readSql('database.sqlite', 'SELECT * FROM users');

// With options
const dfWithOptions = await readSql('database.sqlite', 'SELECT * FROM users', {
  params: [1, 'active'],      // Array of parameters for prepared statements (replaces ? placeholders in query)
  dynamicTyping: true,        // Automatically convert SQL types to appropriate JavaScript types (default true)
  emptyValue: null,           // Value to use for NULL fields in the database (see "Handling Empty Values" section)
  batchSize: 10000,           // Process large result sets in batches of 10000 rows to manage memory usage
  timeout: 30000,             // Query timeout in milliseconds (default 30000)
  readOnly: true,             // Open database in read-only mode for safety (default true for SELECT queries)
  dateFields: ['created_at']  // Array of field names that should be parsed as dates
});
```

DataFrame class method:

```js
import { DataFrame } from 'tinyframejs';

const df = await DataFrame.readSql('database.sqlite', 'SELECT * FROM users');
```

#### Batch Processing for Large SQL Queries

For large SQL queries, you can use batch processing:

```js
import { readSql } from 'tinyframejs/io/readers';

// Create a batch processor
const batchProcessor = await readSql(
  'database.sqlite', 
  'SELECT * FROM large_table', 
  { batchSize: 10000 }
);

// Process each batch
for await (const batchDf of batchProcessor) {
  // Process each batch DataFrame
  console.log(`Processing batch with ${batchDf.rowCount} rows`);
}

// Or collect all batches
const fullDf = await batchProcessor.collect();
```

### Reading from array of objects

You can create a DataFrame directly from a JavaScript array of objects. This is useful when you already have data in memory or when receiving data from an API:

```js
import { DataFrame } from 'tinyframejs';

const data = [
  { date: '2023-01-01', price: 100, volume: 1000 },
  { date: '2023-01-02', price: 105, volume: 1500 },
  { date: '2023-01-03', price: 102, volume: 1200 }
];

// Create DataFrame with default options
const df = DataFrame.create(data);

// With options
const dfWithOptions = DataFrame.create(data, {
  index: 'date',              // Use the 'date' field as the DataFrame index
  dynamicTyping: true,        // Automatically convert string values to appropriate types
  dateFields: ['date'],       // Fields to parse as dates
  dateFormat: 'YYYY-MM-DD',   // Format for date parsing
  emptyValue: null            // Value to use for undefined or null fields (see "Handling Empty Values" section)
});
```

### Reading from column object

You can also create a DataFrame from an object where keys are column names and values are data arrays. This format is useful when your data is already organized by columns or when working with column-oriented data structures:

```js
import { DataFrame } from 'tinyframejs';

const data = {
  date: ['2023-01-01', '2023-01-02', '2023-01-03'],
  price: [100, 105, 102],
  volume: [1000, 1500, 1200]
};

// Create DataFrame with default options
const df = DataFrame.create(data);

// With options
const dfWithOptions = DataFrame.create(data, {
  index: 'date',              // Use the 'date' column as the DataFrame index
  dynamicTyping: true,        // Automatically convert string values to appropriate types
  dateFields: ['date'],       // Columns to parse as dates
  dateFormat: 'YYYY-MM-DD',   // Format for date parsing
  emptyValue: null,           // Value to use for undefined or null entries (see "Handling Empty Values" section)
  validateArrayLengths: true  // Verify that all arrays have the same length (default true)
});
```

### Handling Empty Values

When working with real-world data, you'll often encounter empty, missing, or null values. TinyFrameJS provides flexible options for handling these cases through the `emptyValue` parameter available in all readers. Here's a guide to different strategies:

#### Available Options for Empty Values

```js
// Different strategies for handling empty values

// 1. Using null (default for object-like data)
emptyValue: null,  // Good for maintaining data integrity and indicating missing values

// 2. Using undefined (default for primitive data)
emptyValue: undefined,  // JavaScript's native way to represent absence of value

// 3. Using zero for numerical columns
emptyValue: 0,  // Fastest performance, but can skew statistical calculations

// 4. Using empty string for text columns
emptyValue: '',  // Useful for text processing where null might cause issues

// 5. Using NaN for numerical data that needs to be excluded from calculations
emptyValue: NaN,  // Mathematical operations will ignore these values

// 6. Using custom placeholder value
emptyValue: -999,  // Domain-specific sentinel value that indicates missing data

// 7. Using a function to determine value based on context
emptyValue: (columnName, rowIndex) => {
  if (columnName === 'price') return 0;
  if (columnName === 'name') return 'Unknown';
  return null;
}
```

#### When to Use Each Strategy

| Strategy | Best Used When | Advantages | Disadvantages |
|----------|---------------|------------|---------------|
| `null` | Working with complex objects or when you need to explicitly identify missing values | Clearly indicates missing data; Compatible with most databases | May require null checks in code |
| `undefined` | Working with primitive values or when you want JavaScript's default behavior | Native JavaScript representation; Memory efficient | Can cause issues with some operations |
| `0` | Processing numerical data where zeros won't affect analysis; Performance is critical | Fastest performance; No type conversion needed | Can significantly skew statistical calculations (mean, standard deviation, etc.) |
| `''` (empty string) | Working with text data where empty string is semantically appropriate | Works well with string operations | May be confused with intentionally empty strings |
| `NaN` | Performing mathematical calculations where missing values should be excluded | Automatically excluded from mathematical operations | Only applicable to numerical columns |
| Custom sentinel values | Domain-specific requirements where a specific value indicates missing data | Clear semantic meaning in your domain | Requires documentation and consistent usage |
| Function | Complex datasets where empty value handling depends on column context | Maximum flexibility; Context-aware | Slightly higher processing overhead |

#### Example: Context-Dependent Empty Value Handling

```js
import { readCsv } from 'tinyframejs/io/readers';

// Advanced empty value handling based on column type
const df = await readCsv('financial_data.csv', {
  emptyValue: (columnName, rowIndex, columnType) => {
    // Use column name pattern matching for different strategies
    if (columnName.includes('price') || columnName.includes('amount')) {
      return 0;  // Use 0 for financial amounts
    }
    if (columnName.includes('ratio') || columnName.includes('percentage')) {
      return NaN;  // Use NaN for statistical values
    }
    if (columnName.includes('date')) {
      return null;  // Use null for dates
    }
    if (columnType === 'string') {
      return '';  // Use empty string for text fields
    }
    // Default fallback
    return undefined;
  }
});
```

## Writing Data

### Writing to CSV

```js
import { writeCsv } from 'tinyframejs/io/writers';

// Writing DataFrame to a CSV file
await writeCsv(df, 'output.csv');

// With options
await writeCsv(df, 'output.csv', {
  delimiter: ';',             // Delimiter (default ',')
  header: true,               // Include header (default true)
  index: false,               // Include index (default false)
  encoding: 'utf-8',          // File encoding (default 'utf-8')
  dateFormat: 'YYYY-MM-DD'    // Date format (default ISO)
});
```

DataFrame method:

```js
// Writing to CSV via DataFrame method
await df.toCsv('output.csv');
```

### Writing to JSON

```js
import { writeJson } from 'tinyframejs/io/writers';

// Writing DataFrame to a JSON file
await writeJson(df, 'output.json');

// With options
await writeJson(df, 'output.json', {
  orientation: 'records',     // JSON format: 'records', 'columns', 'split', 'index'
  indent: 2,                  // Indentation for formatting (default 2)
  dateFormat: 'ISO'           // Date format (default ISO)
});
```

DataFrame method:

```js
// Writing to JSON via DataFrame method
await df.toJson('output.json');
```

### Writing to Excel

```js
import { writeExcel } from 'tinyframejs/io/writers';

// Writing DataFrame to an Excel file
await writeExcel(df, 'output.xlsx');

// With options
await writeExcel(df, 'output.xlsx', {
  sheet: 'Data',              // Sheet name (default 'Sheet1')
  header: true,               // Include header (default true)
  index: false,               // Include index (default false)
  startCell: 'A1',            // Starting cell (default 'A1')
  dateFormat: 'YYYY-MM-DD'    // Date format (default ISO)
});
```

DataFrame method:

```js
// Writing to Excel via DataFrame method
await df.toExcel('output.xlsx');
```

### Converting to string

For debugging or console output, you can convert a DataFrame to a string:

```js
import { toString } from 'tinyframejs/methods/display';

// Converting DataFrame to string
const str = toString(df);

// With options
const strWithOptions = toString(df, {
  maxRows: 10,               // Maximum number of rows (default 10)
  maxCols: 5,                // Maximum number of columns (default all)
  precision: 2,              // Precision for floating-point numbers (default 2)
  includeIndex: true         // Include index (default true)
});
```

DataFrame method:

```js
// Converting to string via DataFrame method
const str = df.toString();

// Console output
console.log(df.toString());
```

## Environment Detection

TinyFrameJS automatically detects the JavaScript environment (Node.js, Deno, Bun, or browser) and uses the most efficient methods available in each environment:

- In Node.js, it uses native modules like `fs` for file operations and optimized CSV parsers
- In browsers, it uses the Fetch API and browser-specific file handling
- In Deno and Bun, it uses their respective APIs for optimal performance

This ensures that your code works consistently across different JavaScript environments without any changes.

## Data Conversion

When reading data, TinyFrameJS automatically converts it to an optimized TinyFrame structure:

- String data is stored as regular JavaScript arrays
- Numeric data is converted to Float64Array for efficient storage and calculations
- Integer data is converted to Int32Array
- Dates are converted to Date objects or stored in a special format for efficient time series operations

This process happens automatically and ensures optimal performance when working with data.

## Multi-threading Support

In environments that support it (like Node.js with worker threads), TinyFrameJS can utilize multiple threads for data processing:

```js
import { readCsv } from 'tinyframejs/io/readers';

// Enable multi-threading for processing
const df = await readCsv('large-data.csv', {
  useThreads: true,           // Enable multi-threading
  threadCount: 4,             // Number of threads to use (default: CPU cores)
  batchSize: 10000            // Batch size for each thread
});
```

This can significantly improve performance when working with large datasets.

## Conclusion

TinyFrameJS provides flexible and efficient tools for reading and writing tabular data in various formats. Thanks to the optimized TinyFrame data structure, input/output operations are performed quickly and with minimal memory usage.

For more complex scenarios, such as processing large files or streaming data processing, TinyFrameJS offers specialized tools like batch processing and multi-threading support.

## Next Steps

Now that you know how to read and write data with TinyFrameJS, you can:

- Learn about [filtering and selecting data](./filtering)
- Explore how to [create plots from your data](./plotting)
- Discover how to [create derived columns](./derived-columns)
