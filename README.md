# TinyFrameJS

**TinyFrameJS** is a high-performance JavaScript/TypeScript package for working with tabular financial data, powered by a custom in-memory data structure inspired by Pandas but optimized for the JavaScript ecosystem.

It is built as a lightweight, zero-dependency data engine using `TypedArray` for efficient memory layout and numerical operations.

---

## 🚀 Mission

TinyFrame's mission is to **bring scalable data processing tools to the JavaScript ecosystem**, enabling seamless analysis, modeling, and algorithmic research in environments ranging from browsers to Node.js.

We address the lack of fast, memory-efficient tabular computation in JS, enabling developers to perform analytics, statistical preprocessing, and time-series transformations **without switching to Python or R**.

---

## 🔍 Why TinyFrameJS?

`tinyframejs` is a low-level, high-performance data engine chosen for its simplicity, speed, and zero dependencies:

- 🔥 It is 100% written in JavaScript
- 🧠 Operates on `Float64Array` / `Int32Array` for vectorized performance
- ⚡ Outperforms traditional object/array-based processing by 10–100x
- 🧼 Clean modular functions allow tree-shaking and maximum composability

> TinyFrame is used under the MIT license. See full license in [`LICENSE`](./LICENSE).

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

## 📦 Package Structure

```bash
tinyframejs/
├── src/
│   ├── frame/              # TinyFrame structure and primitives
│   ├── methods/            # Data operations: groupBy, agg, pivot, etc.
│   ├── computation/        # zscore, normalize, mean, std
│   └── DataFrame.js        # Chainable functional wrapper (fluent API)
├── test/                   # Vitest unit tests
├── examples/               # Usage examples
├── benchmarks/             # Benchmark suite for performance testing
├── dist/                   # Compiled output (auto-generated)
├── package.json            # npm manifest
├── tsconfig.json           # TypeScript config
├── README.md               # This file
├── LICENSE                 # MIT license
└── .github/workflows/ci.yml # GitHub Actions workflow
```

---

## 🧠 API Highlights

### Construction

```js
import { DataFrame } from 'tinyframejs';

const df = new DataFrame({
  date: ['2023-01-01', '2023-01-02'],
  price: [100, 105],
  volume: [1000, 1500],
});
```

### Preprocessing

```js
df.setIndex('date').normalize('price').rollingMean('price', 2).dropNaN();
```

### Statistics

```js
const stats = df.describe();
const corr = df.corrMatrix();
```

### Grouping

```js
const grouped = df.groupByAgg(['sector'], {
  price: 'mean',
  volume: 'sum',
});
```

### Reshaping

```js
df.pivot('date', 'symbol', 'price');
df.melt(['date'], ['price', 'volume']);
```

More in [`examples/`](./examples/)

---

## 🧪 Testing

We use [Vitest](https://vitest.dev/) for blazing-fast unit testing with full JavaScript + ESM support.

To run tests:

```bash
npm run test
npm run test:watch
```

---

## 🧪 Development Workflow

```bash
npm run lint       # Lint code with ESLint
npm run build      # Build project
npm run test       # Run unit tests
npm run benchmark  # Run performance suite
```

CI/CD is automated via GitHub Actions + Changesets. See [`ci.yml`](.github/workflows/ci.yml).

---

## 💼 Roadmap

Our roadmap is focused on making `tinyframejs` the most efficient and intuitive tool for tabular and financial computation in JavaScript:

- [x] Implementation of core statistical and preprocessing functions ([`src/computation`](./src/computation))
- [x] Fluent `DataFrame` API for one-liner workflows ([`src/DataFrame.js`](./src/DataFrame.js))
- [x] Benchmark comparisons vs Python/Pandas and JS/DataForge ([`benchmarks/`](./benchmarks))
- [ ] Expand supported operations: aggregation, filtering, windowing ([`src/methods`](./src/methods))
- [ ] Optimize for 1M+ rows: memory use, GC pressure, time complexity ([`benchmark_tiny.js`](./benchmarks/benchmark_tiny.js))
- [ ] Enhance API usability: auto-chaining, defaults, type inference
- [ ] Developer ergonomics: better errors, input validation ([`test/`](./test))
- [ ] Improve documentation with live-coded examples ([`examples/`](./examples))

---

## 🤝 Contributing

We welcome contributors of all levels 🙌

- Fork → Branch → Code → Pull Request
- Follow [Conventional Commits](https://www.conventionalcommits.org/)
- Linting, testing and CI will run on PR automatically

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for details

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

MIT © TinyFrameJS — use freely, build boldly.
