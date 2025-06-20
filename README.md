# TinyFrameJS

**TinyFrameJS** is an advanced high-performance JavaScript framework for processing large-scale tabular and financial data. The project aims to provide capabilities in the JavaScript environment (Node.js and browser) that were previously available primarily in Python (Pandas) or R, without the need to switch between languages.

The library uses optimized data storage based on a columnar model with automatic selection between `TypedArray` and Apache Arrow for maximum performance and flexibility.

---

## 🚀 Project Purpose and Goals

TinyFrameJS aims to solve the problem of performance and ease of working with data in JavaScript. Traditional approaches (using regular arrays of objects in JS) are significantly slower than their Python/Pandas counterparts. The goal of the project is to **provide the JavaScript ecosystem with tools comparable in capabilities and speed to Pandas**.

---

## 🔥 Key Features

- Pure JavaScript without external binary dependencies
- Two-layer data storage architecture (TypedArray and Apache Arrow)
- Automatic selection of the optimal data storage engine
- Performance 10-100 times higher compared to traditional JS approaches
- Modular architecture with namespace support to avoid name conflicts
- Functional programming style with pure functions attached to prototypes
- Methods are added to DataFrame only when importing the corresponding packages
- Tree-shaking support for bundle size optimization

> Released under the MIT license, ensuring unrestricted academic and commercial application.

---

## 🔧 Core Architecture and Modular System

### ✅ Two-Layer DataFrame Architecture

TinyFrameJS implements a clean two-layer architecture for the DataFrame class:

- **DataFrame** - public API for working with data
- **Series** - data columns, wrapper over ColumnVector
- **ColumnVector** - abstraction for data storage, can be:
  - **TypedArrayVector** - fast storage for numeric data
  - **ArrowVector** - optimized storage with support for null values, strings, and complex types

The engine selection is done automatically through `VectorFactory` based on the data type and operation context.

```javascript
// Example lifecycle

// 1. Create DataFrame
const df = new DataFrame({ x: [1, 2, 3], y: ['a', 'b', 'c'] });

// 2. DataFrame calls VectorFactory for each column
// 3. VectorFactory decides whether to use Arrow or TypedArray
// 4. Returns the corresponding ColumnVector
// 5. Each column becomes a Series with the chosen ColumnVector
// 6. DataFrame methods work uniformly regardless of the storage type
```

### 📦 Modular Method Registration System

TinyFrameJS uses a modular method registration system, where each method:

1. Is defined in a separate file as a pure function
2. Is exported through a barrel file (pool.js)
3. Is registered in the DataFrame prototype through the `extendDataFrame` utility

```javascript
// Import core classes
import { DataFrame } from '@tinyframejs/core';

// Import additional packages (automatically register methods)
import '@tinyframejs/viz';
import '@tinyframejs/quant';

// Create DataFrame
const df = new DataFrame(data);

// Use aggregation methods (from core)
console.log(df.sum('price'));

// Use visualization methods (from viz)
df.plot('price');

// Use technical analysis methods (from quant)
const sma = df.ta.sma('price', 14);
```

### 🧩 Extending with Custom Methods

You can easily add your own methods using the `extendDataFrame` utility:

```javascript
import { DataFrame, extendDataFrame } from '@tinyframejs/core';

// Define methods as pure functions
const customMethods = {
  logReturn(df, column = 'close') {
    return df.col(column).map((value, i, series) => {
      if (i === 0) return 0;
      return Math.log(value / series.get(i - 1));
    });
  },
  
  volatility(df, column = 'close', window = 5) {
    const returns = df.logReturn(column);
    return returns.std({ window });
  }
};

// Register methods in DataFrame prototype
extendDataFrame(DataFrame.prototype, customMethods, { namespace: 'custom' });

// Use custom methods
const returns = df.custom.logReturn('price');
const volatility = df.custom.volatility('price', 5);
```

### 🌟 Benefits of such architecture

1. **Pure logic separation** - the calculation part of the method is separated from binding to the DataFrame class
2. **Tree-shaking** - unused methods do not enter the final bundle
3. **Namespaces** - methods from different packages do not conflict with each other
4. **Functional style** - methods are implemented as pure functions without side effects
5. **Ease of extension** - adding new methods does not require changing the library core

---

## 📊 Benchmark Results (vs competitors)

| Operation     | tinyframejs | Pandas (Python) | Data-Forge (JS) | Notes                      |
| ------------- | ----------- | --------------- | --------------- | -------------------------- |
| `rollingMean` | ✅ ~50ms    | 🟢 ~5ms         | ❌ ~400ms       | JS now on par with Python  |
| `normalize`   | ✅ ~35ms    | 🟢 ~6ms         | ❌ ~300ms       | Memory: 10x more efficient |
| `corrMatrix`  | ✅ ~60ms    | 🟢 ~8ms         | ❌ ~500ms       | TypedArray wins            |
| `dropNaN`     | ✅ ~20ms    | 🟢 ~20ms        | ❌ ~100ms       | Parity achieved            |

> All results measured on 100,000 rows × 10 columns. See [`benchmark_tiny.js`](./benchmarks/benchmark_tiny.js) for test script.

---

## 📦 Project Structure Overview

TinyFrameJS uses a monorepo structure with module separation:

```bash
packages/
├─ core/                # Library core: DataFrame, Series, vectors, and basic methods
│   ├─ src/
│   │   ├─ core/          # Main classes: DataFrame, Series, VectorFactory
│   │   ├─ vectors/       # Vector implementations: TypedArray, Arrow, Simple
│   │   ├─ methods/       # DataFrame methods: aggregation, filtering, transformation
│   │   └─ utils/        # Utilities: validators, math functions
│   ├─ tests/         # Tests for the main module
│   └─ package.json   # Configuration for the main module
├─ io/                 # Module for working with input/output: CSV, JSON, SQL, API
├─ quant/              # Module for financial and quantum calculations
├─ viz/                # Module for visualization and data display
└─ utils/              # Common utilities and helper functions

tests/               # Integration tests and performance tests
benсhmarks/          # Scripts for comparing performance
```

---

## 🧠 Architecture Design

### Data Flow Pipeline

Methods in TinyFrameJS are categorized as follows:

1. **Transform methods** (e.g., `sort()`, `filter()`, `select()`)

   - Return a new DataFrame
   - Can be chained with other methods

2. **Aggregation methods** (e.g., `count()`, `mean()`, `sum()`)

   - Return a scalar value or array
   - Typically terminate a method chain

3. **Methods in namespaces** (e.g., `df.ta.sma()`, `df.viz.plot()`)

   - Grouped by functional modules
   - Avoid name conflicts between different packages

### DataFrame Creation

Create a DataFrame using the constructor or static method:

```javascript
// From column-oriented data (preferred way)
const df = new DataFrame({
  price: [10.5, 11.2, 9.8, 12.3],
  quantity: [100, 50, 75, 200],
});

// From row-oriented data
const df = DataFrame.fromRecords([
  { price: 10.5, quantity: 100 },
  { price: 11.2, quantity: 50 },
  // ...
]);
```

### Example of method usage

```javascript
// Chain of transform and aggregation methods
const avgPrice = df
  .filter(row => row.quantity > 0)
  .sort('price')
  .select(['price', 'quantity'])
  .mean('price');

// Use methods from namespaces
const sma20 = df.ta.sma('price', 20);
const histogram = df.viz.histogram('price', { bins: 10 });
```

---

## 🧠 Extending DataFrame with Custom Methods

You can easily extend DataFrame with your own methods:

```js
import { DataFrame } from '@tinyframejs/core';
import { extendDataFrame } from '@tinyframejs/core/utils';

// Creating a method
const myCustomMethod = (frame, column, factor = 1) => {
  // Validation and implementation...
  return result;
};

// Register at the root
extendDataFrame(DataFrame.prototype, { myCustomMethod });

// Or in a namespace
extendDataFrame(DataFrame.prototype, { myNamespacedMethod }, { namespace: 'custom' });

// Usage
const df = new DataFrame({ /* ... */ });
const result1 = df.myCustomMethod('price', 2);
const result2 = df.custom.myNamespacedMethod('price');
```

**Main methods include:**

- **Base transformations**: `filter`, `select`, `sort`, `head`, `tail`
- **Aggregations**: `count`, `mean`, `sum`, `min`, `max`, `std`, `var`
- **Working with missing values**: `dropNaN`, `fillNaN`, `isNaN`

**Module methods in namespaces:**

- **Technical analysis (ta)**: `sma`, `ema`, `rsi`, `macd`, `bollinger`
- **Visualization (viz)**: `plot`, `histogram`, `boxplot`, `heatmap`
- **Statistics (stats)**: `correlation`, `regression`, `distribution`

All methods are registered through the `extendDataFrame` system and are available in the corresponding namespaces.

### Grouping and aggregation

```js
// Grouping by one column
const grouped = df.groupBy('sector').aggregate({
  price: 'mean',
  volume: 'sum'
});

// Grouping by multiple columns
const multiGrouped = df.groupBy(['sector', 'region']).aggregate({
  price: 'mean',
  volume: 'sum',
  count: 'count'
});
```

### Data reshaping operations

```js
// Long to wide
const pivoted = df.pivot({
  index: 'date',     // Column for rows
  columns: 'symbol', // Column for generating new columns
  values: 'price'    // Column for values
});

// Wide to long
const melted = df.melt({
  idVars: ['date'],           // Columns to keep
  valueVars: ['price', 'volume'] // Columns to transform
});
```

Additional examples of usage are available in [`examples/`](./examples).

---

## 🚀 Future Improvements

The roadmap for TinyFrameJS includes the following performance improvements:

### Vector optimization

Further optimization of working with different types of vectors:

- Automatic conversion between vector types
- Operation optimization for each vector type
- Expansion of Arrow support for complex data types

### Lazy calculations

Optimization of complex transformations execution:

- Lazy execution until results are requested
- Automatic joining and optimization of operations
- Reduction of intermediate memory allocations

### Stream processing

For processing large datasets that do not fit into memory:

- Chunk processing of large files
- Stream API for continuous data input
- Memory-efficient operations with datasets of more than 10 million rows

---

## 🔧 Development Process

```bash
# Run from the root of the project
npm run lint        # Code check with ESLint
npm run build       # Build all packages
npm run test        # Run tests (Vitest)
npm run benchmark   # Run performance tests

# Work with individual packages
cd packages/core
npm run build       # Build the main package
npm run test        # Run tests for the main package
```

CI/CD is automated through GitHub Actions + Changesets. See [`ci.yml`](.github/workflows/ci.yml).

---

## 📈 Data visualization

TinyFrameJS provides a powerful visualization module through the `@tinyframejs/viz` package:

### Supported chart types

- **Basic**: line, bar, point, pie
- **Advanced**: with areas, radar, polar, candlestick (for financial data)
- **Specialized**: histogram, regression, bubble, time series

### Usage in namespace

```js
import { DataFrame } from '@tinyframejs/core';
import '@tinyframejs/viz'; // Registers methods in viz namespace

const df = new DataFrame({ /* ... */ });

// Usage in viz namespace
const lineChart = df.viz.plot('price', { type: 'line' });
const histogram = df.viz.histogram('price', { bins: 10 });
const heatmap = df.viz.heatmap(['x', 'y', 'value']);
```

### Exporting charts

```js
// Export to various formats: PNG, JPEG, PDF, SVG
await df.viz.export('chart.png', { type: 'line' });
await df.viz.export('report.pdf', { type: 'pie' });
```

More details about visualization capabilities in the `@tinyframejs/viz` package documentation.

## 🚛 Roadmap

### Implemented

- [x] Two-layer architecture DataFrame → Series → ColumnVector
- [x] Optimized vectors for different data types (TypedArray, Arrow, Simple)
- [x] Module system for method registration through extendDataFrame
- [x] Namespaces for methods from different packages
- [x] Monorepo structure with independent packages
- [x] Performance at the level of compiled libraries

### In development

- [ ] Extension of Arrow support for complex data types
- [ ] Lazy calculations and deferred operation execution
- [ ] Stream processing for large datasets
- [ ] Integration with WebAssembly for resource-intensive operations
- [ ] Expansion of library of statistical and financial methods
- [ ] Interactive documentation with examples and integration with Jupyter

---

## 🤝 Contributing Guidelines

- Fork → Feature Branch → Pull Request
- Adopt Conventional Commits (e.g., `feat:`, `fix:`, `docs:`)
- Ensure all changes pass `lint`, `test`, and CI gates

Refer to [`CONTRIBUTING.md`](./CONTRIBUTING.md) for detailed guidelines.

---

## 🧑‍💻 Developer

Made with ❤️ by [@a3ka](https://github.com/a3ka)

---

## 🌟 Support the Project

If you like what we're building, please consider:

- ⭐️ Starring this repository
- 🐦 Sharing on Twitter / Reddit
- 👨‍💻 Submitting a PR
- 💬 Giving feedback in [Discussions](https://github.com/a3ka/alphaquantjs/discussions)

Together we can bring **efficient data tools to the web**.

---

## 📜 License

MIT © TinyFrameJS authors. Use freely. Build boldly.
