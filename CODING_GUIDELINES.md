# 📏 TinyFrameJS Coding Guidelines

This document outlines the **best practices** for writing high-performance, accurate, and maintainable JavaScript code in the context of **data processing**. It is intended for contributors to the TinyFrameJS project, which runs on **Node.js** and in the **browser** (V8 engine).

## ⚡ Performance Recommendations

### ✅ Arrays (V8 Optimizations)

- **Keep arrays dense** — avoid holes, use `.fill()` to prepopulate.
- **Do not delete elements** — use `.splice()` instead of `delete`.
- **Use sequential indices starting from 0** — avoid `arr[10000] = x` on an empty array.
- **Keep types homogeneous** — do not mix numbers, strings, and objects.
- **Avoid preallocating large sparse arrays** — grow them incrementally.
- **Use `.push()` to add elements** instead of manual indexing.
- **Stream large data when possible** — avoid loading millions of rows into memory at once.

### ✅ Loops and Iteration

- Use `for` / `for...of` / `.forEach()` — modern V8 optimizes all of them well.
- In performance-critical code, benchmark `for` vs `.forEach()`.

### ✅ Objects and Hidden Classes

- Initialize all object properties at creation.
- Do not add properties dynamically later.
- Maintain the same property order across instances.

```js
// Good
function Account(id, balance) {
  this.id = id;
  this.balance = balance;
}

// Bad (hidden class changes)
const acc = {};
acc.id = 'A123';
acc.balance = 1000;
acc.currency = 'USD';
```

### ✅ Type Monomorphism

- Write functions that operate on a single input type.
- Avoid mixing input types like `number` and `string` in the same function.

### ✅ Memory and GC

- Reuse objects inside loops.
- Avoid closures in hot loops.
- Minimize short-lived allocations in performance-sensitive code.

### ✅ Built-in Methods

- Use `Array.sort()`, `Math.sqrt()`, etc. — they are native and fast.
- Avoid bitwise hacks like `x | 0` — use `Math.trunc`, `Math.floor` instead.

### ✅ Exception Handling

- Avoid `try/catch` in hot loops.
- Wrap risky logic in a separate function.

```js
function process(data) {
  // hot path
}

function safeProcess(data) {
  try {
    process(data);
  } catch (e) {
    logError(e);
  }
}
```

### ✅ Optimizations Based on TinyFrameJS Experience

#### Efficient Data Storage

- **Use appropriate ColumnVector implementation** - TypedArrayVector for numeric data, ArrowVector for complex types
- **Let VectorFactory choose** the optimal storage backend based on data type
- **Avoid data copying** — use references or in-place operations where possible
- **Pre-allocate memory** for result arrays in a single call, knowing the size in advance
- **Use array pooling** for temporary arrays to reduce garbage collector pressure

```js
// Bad
const result = [];
for (let i = 0; i < data.length; i++) {
  result.push(data[i] * 2);
}

// Good
const result = new Float64Array(data.length);
for (let i = 0; i < data.length; i++) {
  result[i] = data[i] * 2;
}
```

#### Algorithmic Optimizations

- **Avoid nested loops** — aim for O(n) complexity instead of O(n²).
- **Use sliding windows** instead of recalculating for overlapping data ranges.
- **Apply prefix-sum** for efficient calculation of sliding statistics on large windows.
- **Cache intermediate results** to avoid repeated calculations.

```js
// Bad (O(n*k))
function rollingSum(values, windowSize) {
  const result = new Float64Array(values.length - windowSize + 1);
  for (let i = 0; i <= values.length - windowSize; i++) {
    let sum = 0;
    for (let j = 0; j < windowSize; j++) {
      sum += values[i + j];
    }
    result[i] = sum;
  }
  return result;
}

// Good (O(n))
function rollingSum(values, windowSize) {
  const result = new Float64Array(values.length - windowSize + 1);
  let sum = 0;

  // Initialize first window
  for (let i = 0; i < windowSize; i++) {
    sum += values[i];
  }
  result[0] = sum;

  // Sliding window
  for (let i = 1; i <= values.length - windowSize; i++) {
    sum = sum - values[i - 1] + values[i + windowSize - 1];
    result[i] = sum;
  }
  return result;
}
```

#### Efficient NaN and Invalid Value Handling

- **Use counters for invalid values** instead of repeated `isNaN()` checks.
- **Apply validity masks** for filtering NaN values in a single pass.
- **Avoid checks on each iteration** — group checks and perform them in advance.

```js
// Bad
function hasNaN(array) {
  for (let i = 0; i < array.length; i++) {
    if (isNaN(array[i])) return true;
  }
  return false;
}

// Good
function countNaN(array) {
  let badCount = 0;
  for (let i = 0; i < array.length; i++) {
    if (isNaN(array[i])) badCount++;
  }
  return badCount;
}
```

#### Hashing and Duplicate Detection

- **Avoid using `JSON.stringify`** for data serialization — use efficient hash functions (FNV-1a, Murmur3).
- **Use hash tables with open addressing** instead of Map for large datasets.
- **Pre-compute hashes** for reused values.

```js
// Bad
function findDuplicates(rows, keyColumns) {
  const seen = new Set();
  return rows.filter((row) => {
    const key = JSON.stringify(keyColumns.map((col) => row[col]));
    if (seen.has(key)) return true;
    seen.add(key);
    return false;
  });
}

// Good
function hashRow(row, keyColumns) {
  let hash = 2166136261; // FNV-1a offset basis
  for (const col of keyColumns) {
    const val = row[col];
    const str = String(val);
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = (hash * 16777619) >>> 0; // FNV prime
    }
  }
  return hash;
}

function findDuplicates(rows, keyColumns) {
  const seen = new Set();
  return rows.filter((row) => {
    const hash = hashRow(row, keyColumns);
    if (seen.has(hash)) return true;
    seen.add(hash);
    return false;
  });
}
```

#### Vectorization and Parallelism

- **Use block processing** for better vectorization in V8.
- **Split large tasks** into subtasks for parallel processing.
- **Consider using Web Workers** for CPU-intensive operations.

#### General Performance Recommendations

- **Measure before optimizing** — use profiling to identify bottlenecks.
- **Set performance budgets** for critical operations.
- **Test on realistic data volumes** — optimizations may only show up on large datasets.
- **Avoid premature optimization** — first achieve correctness, then optimize critical paths.

## 📊 Working with Data and Testing

### ✅ Handling Special Values

When working with numeric data, it is essential to clearly define and document how the library handles special values:

- **`null`** - converted to `0` in numeric columns
- **`undefined`** - converted to `NaN` in numeric columns
- **`NaN`** - preserved as `NaN`

### ✅ Preserving Original Data

- **Store "raw" values** - keep original data alongside optimized data for calculations
- **Use validity masks** - track where `undefined` and other special values were
- **Separate data and metadata** - do not lose information during optimization

```js
// Recommended approach
export function createFrame(data) {
  const columns = {}; // optimized data
  const rawColumns = {}; // original data
  // ...

  return { columns, rawColumns, rowCount, columnNames };
}
```

### ✅ Explicit Default Values

- **Document default behavior** - e.g., which standard deviation type (population or sample) is used
- **Avoid ambiguous defaults** - they lead to different expectations in tests
- **Extract conversion rules into separate functions** - e.g., `normalizeNumeric(value)`

### ✅ Testing

- **Test cases should be consistent** - they should not contradict each other
- **Document expected behavior** - especially for handling special values
- **Avoid special handling for tests** - functions should work universally

```js
// Bad: special handling for a specific test
if (values.length === 6 && values[0] === 1 && Number.isNaN(values[1])) {
  return 1.92; // Magic number for the test
}

// Good: universal algorithm that works for all cases
function calculateStandardDeviation(values, population = true) {
  // Universal algorithm...
}
```

### ✅ Quotes and Escaping in Tests

- Always use single quotes ('...') for string literals in tests.
- If the string contains an apostrophe (single quote), use the escape sequence `\u0027` instead of the regular `'` character.
- Example:
  ```js
  // Bad:
  expect(err.message).toBe("Column 'foo' not found");
  // Good:
  expect(err.message).toBe('Column \u0027foo\u0027 not found');
  ```

### ✅ Calculation Optimization

- **Avoid double passes** – do not perform separate validation if types are already checked
- **Trust the data structure** – if `createFrame` guarantees type homogeneity, do not recheck it
- **Minimize data copying** – work with original arrays where possible

## 🏗️ Руководство по разработке методов

### ✅ Двухслойная архитектура DataFrame

TinyFrameJS implements a clean two-layer architecture:

```
DataFrame (API) → Series (columns) → ColumnVector (storage)
```

- **DataFrame** - public API for working with data
- **Series** - columns of data, wrapper over ColumnVector
- **ColumnVector** - abstraction for storing data, can be:
  - **TypedArrayVector** - fast storage for numeric data
  - **ArrowVector** - optimized storage with support for null, strings and complex types
  - **SimpleVector** - simple storage for small datasets or mixed types

The engine selection is done automatically through `VectorFactory` based on the data type and operation context.

### ✅ Method structure

All methods in TinyFrameJS follow a unified pattern with dependency injection:

```js
/**
 * Описание метода
 * @param {Object} frame - Объект DataFrame
 * @param {String} column - Имя колонки
 * @returns {Number|Array|Object} - Description of the returned value
 */
export const methodName =
  ({ validateColumn, otherDep }) =>
  (frame, column, ...otherArgs) => {
    // Input data validation
    validateColumn(frame, column);
    
    // Implementation
    const result = /* ... */;
    
    return result;
  };
```

This pattern provides:

- **Dependency injection** - dependencies are passed to the method
- **Testability** - dependencies can be mocked
- **Consistency** - all methods follow the same structure
- **Functional style** - pure functions without side effects

### ✅ Method types

TinyFrameJS differentiates between two types of methods:

1. **Transform methods** - return a new DataFrame:

```js
export const sort =
  ({ validateColumn }) =>
  (frame, column) => {
    validateColumn(frame, column);

    // Create indices for sorting
    const arr = frame.columns[column];
    const sortedIndices = [...arr.keys()].sort((a, b) => arr[a] - arr[b]);

    // Create new frame with sorted data
    const newColumns = {};
    for (const col of Object.keys(frame.columns)) {
      const originalArray = frame.columns[col];
      newColumns[col] = sortedIndices.map(i => originalArray[i]);
    }

    return { columns: newColumns, rowCount: frame.rowCount };
  };
```

2. **Aggregation methods** - return a scalar value:

```js
export const sum =
  ({ validateColumn }) =>
  (frame, column) => {
    validateColumn(frame, column);

    const arr = frame.columns[column];
    let total = 0;
    for (let i = 0; i < arr.length; i++) {
      total += arr[i];
    }
    return total;
  };
```

### ✅ Module system for method registration

TinyFrameJS uses a unified utility `extendDataFrame` for registering methods. The process consists of three steps:

#### 1. Creating a method in a separate file

```js
// src/methods/dataframe/aggregation/sum.js
export const sum = ({ validateColumn }) => (frame, column) => {
  validateColumn(frame, column);
  // Implementation...
  return total;
};
```

#### 2. Creating barrel-file (pool.js) for re-exporting methods

```js
// src/methods/dataframe/aggregation/pool.js
export { sum } from './sum.js';
export { mean } from './mean.js';
export { min } from './min.js';
export { max } from './max.js';
```

#### 3. Registering methods through extendDataFrame

```js
// src/methods/dataframe/aggregation/index.js
import { DataFrame } from '../../../core/DataFrame.js';
import { extendDataFrame } from '../../../core/extendDataFrame.js';
import * as pool from './pool.js';

// Зависимости
import { validateColumn } from '../../../utils/validators.js';

const deps = { validateColumn };

// Регистрация методов
extendDataFrame(DataFrame.prototype, pool);

// Export methods for direct use
export * from './pool.js';
```

#### 4. Implementation of extendDataFrame

```js
// src/core/extendDataFrame.js
export function extendDataFrame(proto, pool, { namespace, strict = true } = {}) {
  const target = namespace ? (proto[namespace] ??= {}) : proto;

  for (const [name, fn] of Object.entries(pool)) {
    if (strict && name in target) {
      throw new Error(`Method conflict: ${namespace ? namespace + '.' : ''}${name}`);
    }
    target[name] = function (...args) {
      return fn(this, ...args);      // Transparently pass this as the first argument
    };
  }
}
```

Benefits of this approach:

- **Clean logic separation** - the calculation part of the method is separated from binding to the DataFrame class
- **Tree-shaking** - unused methods do not enter the final bundle
- **Namespaces** - methods from different packages do not conflict with each other

### ✅ Testing methods

When writing tests for DataFrame methods, follow these rules:

1. **Test file location**: `/tests/core/methods/{category}/{methodName}.test.js`
2. **Test through DataFrame API**: Test through the DataFrame interface, not directly through functions
3. **Test successful and error scenarios**: Check both normal execution and error handling
4. **For transformation methods**: Check that the returned DataFrame has the expected structure
5. **For aggregation methods**: Verify the returned value is correct

Example test structure:

```js
import { describe, test, expect } from 'vitest';
import { DataFrame } from '../../../src/core/DataFrame.js';

describe('DataFrame.methodName', () => {
  const df = DataFrame.create({
    a: [1, 2, 3],
    b: [10, 20, 30],
  });

  test('performs expected operation', () => {
    // For transformation method
    const result = df.methodName('a');
    expect(result).toBeInstanceOf(DataFrame);
    expect(result.columns).toContain('a');

    // For aggregation method
    const value = df.methodName('a');
    expect(value).toBe(expectedValue);
  });

  test('throws on invalid input', () => {
    expect(() => df.methodName('nonexistent')).toThrow();
  });
});
```

## 🔄 Architectural Principles

### ✅ Two-Layer Architecture

TinyFrameJS implements a clean two-layer architecture:

```
DataFrame (API) → Series (columns) → ColumnVector (storage)
```

1. **DataFrame** - Public API for working with data, provides method chaining
2. **Series** - Column representation, wraps a ColumnVector
3. **ColumnVector** - Abstract storage interface with multiple implementations:
   - **TypedArrayVector** - Fast storage for numeric data using JavaScript TypedArrays
   - **ArrowVector** - Optimized storage with Arrow for complex types and null values
   - **SimpleVector** - Fallback for mixed data types

The appropriate vector implementation is automatically selected by `VectorFactory` based on data type and operation context.

### ✅ Dependency Injection Pattern

TinyFrameJS uses dependency injection for all methods:

1. **Methods are pure functions** with dependencies as their first parameter
2. **No direct imports** of utilities in method files
3. **Easier testing** - dependencies can be mocked

```js
// Example method with dependency injection
export const sum =
  ({ validateColumn }) =>
  (frame, column) => {
    validateColumn(frame, column);
    const arr = frame.columns[column];
    let total = 0;
    for (let i = 0; i < arr.length; i++) {
      total += arr[i];
    }
    return total;
  };
```

### ✅ Modular Method Registration

TinyFrameJS uses a modular method registration system via `extendDataFrame`:

1. **Methods defined as pure functions** in individual files
2. **Exported through barrel files** (index.js) for organization
3. **Registered with DataFrame** via the `extendDataFrame` utility
4. **Support for namespaces** to avoid conflicts between packages

```js
// Example method registration
import { DataFrame } from '../core/DataFrame.js';
import { extendDataFrame } from '../utils/extendDataFrame.js';
import * as aggregationMethods from './aggregation/index.js';

// Register methods directly on DataFrame.prototype
extendDataFrame(DataFrame.prototype, aggregationMethods);

// Register methods in a namespace
extendDataFrame(DataFrame.prototype, technicalMethods, { namespace: 'ta' });
```

### ✅ Transformation vs. Aggregation

When implementing a new method, decide whether it's a transformation or aggregation:

1. **Transformation methods**:
   - Return a new DataFrame
   - Can be chained with other methods
   - Example: `sort()`, `filter()`, `select()`

2. **Aggregation methods**:
   - Return a scalar value or array
   - Typically terminate a method chain
   - Example: `count()`, `mean()`, `sum()`

This distinction is handled automatically by the method implementation:

```js
// Transformation method example
export const filter =
  ({ validateFunction }) =>
  (frame, predicate) => {
    validateFunction(predicate);
    // Implementation that returns a new DataFrame
    return new DataFrame(/* filtered data */); 
  };

// Aggregation method example
export const sum =
  ({ validateColumn }) =>
  (frame, column) => {
    validateColumn(frame, column);
    // Implementation that returns a scalar value
    return total;
  };
```

## 💰 Numerical Accuracy

### ✅ Use Integers for Money (e.g., cents)

- Avoid using `Number` directly for monetary values.
- Represent money in cents: `$1.99` → `199`
- Use formatting functions like `Intl.NumberFormat`, divide by 100 when needed.

### ✅ Use BigInt for Very Large Values

- Use `BigInt` when values exceed 2^53.
- Do not mix `BigInt` and `Number` in operations.

### ✅ Use Decimal Libraries

- For precise decimal math, use: `decimal.js`, `big.js`, `dinero.js`
- Trade-off: slower but much safer for rates, taxes, percentages.

```js
import Decimal from 'decimal.js';
const total = new Decimal('0.1').plus('0.2'); // "0.3"
```

### ✅ Rounding

- Use `Math.round`, `toFixed`, or proper libraries.
- For bankers' rounding, use custom rounding or appropriate libraries.

### ✅ Test Edge Cases

- Add tests for rounding errors (`0.1 + 0.2 !== 0.3`).
- Use `Number.EPSILON` or absolute tolerance (`abs(result - expected) < ε`).

## 🧱 Code Structure and Modularity

### ✅ When Classes Are Justified

Although we prefer pure functions, classes are justified in cases like:

- **Modeling complex entities with internal state** (e.g., `Portfolio`, `StrategySession`, `BacktestRun`).
- **Simulating time-dependent state**, e.g., strategy object tracking positions, flags, counters.
- **Framework integration**, where classes are expected (`class Strategy` with `onBar` method).
- **Inheritance/templates**, when structure justifies reuse via class inheritance (use cautiously!).

When using classes:

- Do not add properties dynamically after `constructor`;
- Always initialize all fields in the `constructor`;
- Avoid deep hierarchies — prefer composition over inheritance.

### ✅ Prefer Pure Functions Over Classes

- Use pure functions when no internal state is needed.
- They are easier to test, V8 optimizes them better, and no hidden class churn.
- Classes can be used when necessary, but default to functions for simpler logic.

```js
// Preferred:
function calculatePnL(entryPrice, exitPrice) {
  return exitPrice - entryPrice;
}

// Less efficient:
class Trade {
  constructor(entry, exit) {
    this.entry = entry;
    this.exit = exit;
  }
  getPnL() {
    return this.exit - this.entry;
  }
}
```

### ✅ SRP (Single Responsibility Principle)

- One file = one module = one purpose
- Separate strategy logic, formatting, calculations, UI
- Each method in its own file with clear dependency injection

### ✅ Use Modular System (ESM)

- Follow the project standard (ESM)
- Use barrel files (index.js) for organizing related methods
- Register methods with `extendDataFrame` in namespace or directly

### ✅ Keep Functions Small

- Prefer functions < 50 lines
- Extract sub-functions for clarity and testability

### ✅ Do Not Mix Platform-Specific APIs

- Avoid using `fs`, `path`, `process` in browser-targeted code
- Abstract platform-specific behavior

### ✅ Consistent Code Style

- Follow ESLint + Prettier rules
- Use `camelCase` for variables/functions, `PascalCase` for classes

### ✅ Document Complex Logic

- Use JSDoc to document all methods, especially their parameters and return values
- Explain complex calculations with inline comments
- Document namespace methods with their intended usage patterns
- For methods that extend DataFrame, document how they interact with the two-layer architecture

## 🧪 Testing

### ✅ Always Add Tests

- Cover new logic with unit tests
- Test through the DataFrame API, not internal functions
- Include correctness and boundary conditions
- Test both direct methods and namespace methods

### ✅ For Financial Computation

- Validate against known correct values
- Add tolerances (`±1e-12`) for floating-point results
- Test with different ColumnVector implementations
- Verify results are consistent across backends

### ✅ Integration Tests

- Include full backtest runs if applicable

## 🔥 Profiling

### ✅ Use `--inspect`, `--prof`, `perf_hooks`

- Benchmark with realistic datasets (100k+ rows)
- Use `console.time` or `performance.now()` for timing

### ✅ Identify Bottlenecks

- Use flamegraphs, DevTools, or CLI tools
- Only optimize based on real measurements

## 🧨 Anti-Patterns

- Using raw `Number` for money without scaling
- Mixing types in arrays or structures
- Sparse arrays / use of `delete`
- Dynamically adding properties to hot objects
- Allocating temporary objects in loops
- Synchronous blocking on large datasets (e.g., in UI or Node event loop)
- Silent `catch` blocks or unhandled Promise rejections

## 📋 Pull Request Checklist

Before submitting a PR, please verify:

- [ ] Followed **project code style** (Prettier, ESLint)
- [ ] Used **pure functions** with dependency injection
- [ ] Properly registered methods using `extendDataFrame`
- [ ] Added **tests** for new logic and edge cases
- [ ] Benchmarked performance (if critical path is affected)
- [ ] Avoided anti-patterns (e.g., array holes, mixed types, etc.)
- [ ] Used **conventional commits** and described your PR clearly
- [ ] Highlighted any code that is **precision-sensitive** (money, rates)
- [ ] Updated documentation if adding to public API
- [ ] CI passes ✅

## 🧠 Summary

Write code that is:

- **Fast** — V8-optimized, low-GC, optimized vector storage
- **Accurate** — financial results must be precise to the cent
- **Modular** — clear separation of responsibilities with namespaces
- **Predictable** — pure functions with explicit dependencies
- **Extensible** — properly registered via `extendDataFrame`

Thank you for keeping TinyFrameJS fast and reliable ⚡
