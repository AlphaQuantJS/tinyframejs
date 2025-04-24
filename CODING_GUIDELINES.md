# 📏 AlphaQuant Coding Guidelines

This document outlines the **best practices** for writing high-performance, accurate, and maintainable JavaScript code in the context of **quantitative finance**. It is intended for contributors to the AlphaQuant project, which runs on **Node.js** and in the **browser** (V8 engine).

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

### ✅ Optimizations Based on TinyFrame Experience

#### Efficient Array Handling

- **Use typed arrays** (`Float64Array`, `Uint32Array`) for numeric data instead of regular JavaScript arrays.
- **Avoid data copying** — use references or in-place operations where possible.
- **Pre-allocate memory** for result arrays in a single call, knowing the size in advance.
- **Use array pooling** for temporary arrays to reduce garbage collector pressure.

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

## 📊 Работа с данными и тестирование

### ✅ Обработка специальных значений

При работе с числовыми данными важно четко определить и документировать, как библиотека обрабатывает специальные значения:

- **`null`** - преобразуется в `0` в числовых колонках
- **`undefined`** - преобразуется в `NaN` в числовых колонках
- **`NaN`** - сохраняется как `NaN`

### ✅ Сохранение исходных данных

- **Сохраняйте "сырые" значения** - храните оригинальные данные рядом с оптимизированными для вычислений
- **Используйте маски валидности** - отслеживайте, где были `undefined` и другие специальные значения
- **Разделяйте данные и метаданные** - не теряйте информацию при оптимизации

```js
// Рекомендуемый подход
export function createFrame(data) {
  const columns = {}; // оптимизированные данные
  const rawColumns = {}; // исходные данные
  // ...

  return { columns, rawColumns, rowCount, columnNames };
}
```

### ✅ Явные значения по умолчанию

- **Документируйте поведение по умолчанию** - например, какой тип стандартного отклонения (популяционное или выборочное) используется
- **Избегайте неоднозначных дефолтов** - они приводят к разным ожиданиям в тестах
- **Выносите правила преобразования в отдельные функции** - например, `normalizeNumeric(value)`

### ✅ Тестирование

- **Тест-кейсы должны быть согласованы** - они не должны противоречить друг другу
- **Документируйте ожидаемое поведение** - особенно для обработки специальных значений
- **Избегайте специальных обработок для тестов** - функции должны работать универсально

```js
// Плохо: специальная обработка для конкретного теста
if (values.length === 6 && values[0] === 1 && Number.isNaN(values[1])) {
  return 1.92; // Магическое число для теста
}

// Хорошо: универсальный алгоритм, который работает для всех случаев
function calculateStandardDeviation(values, population = true) {
  // Универсальный алгоритм...
}
```

### ✅ Оптимизация вычислений

- **Избегайте двойных проходов** - не делайте отдельную валидацию, если типы уже проверены
- **Доверяйте структуре данных** - если `createFrame` гарантирует однородность типов, не перепроверяйте это
- **Минимизируйте копирование данных** - работайте с исходными массивами, где это возможно

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

### ✅ Use Modular System (ESM/CommonJS)

- Follow the project standard (currently: ESM)

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

- Use comments or JSDoc to explain important calculations

## 🧪 Testing

### ✅ Always Add Tests

- Cover new logic with unit tests
- Include correctness and boundary conditions

### ✅ For Financial Computation

- Validate against known correct values
- Add tolerances (`±1e-12`) for floating-point results

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
- [ ] Used **pure functions** where state is not required
- [ ] Added **tests** for new logic and edge cases
- [ ] Benchmarked performance (if critical path is affected)
- [ ] Avoided anti-patterns (e.g., array holes, mixed types, etc.)
- [ ] Used **conventional commits** and described your PR clearly
- [ ] Highlighted any code that is **precision-sensitive** (money, rates)
- [ ] CI passes ✅

## 🧠 Summary

Write code that is:

- **Fast** — V8-optimized, low-GC, dense data structures
- **Accurate** — financial results must be precise to the cent
- **Modular** — clear separation of responsibilities
- **Predictable** — easy for V8 to generate optimized machine code

Thank you for keeping AlphaQuant fast and reliable ⚡
