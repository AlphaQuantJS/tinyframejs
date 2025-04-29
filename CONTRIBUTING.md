# 🤝 Contributing to tinyframejs

Thank you for your interest in contributing to **tinyframejs**, the high-performance JavaScript engine for tabular data. We welcome contributions of all kinds — code, docs, benchmarks, ideas.

---

## 🧰 Repository Overview

This repository is a standalone part of the [AlphaQuantJS](https://github.com/AlphaQuantJS) ecosystem and contains:

- ✅ The core tabular engine built on TypedArray structures (TinyFrame)
- ✅ Functional APIs for stats, filtering, reshaping
- ✅ Chainable `DataFrame` wrapper (inspired by Pandas)
- ✅ Vitest-based unit tests
- ✅ Benchmarks vs competitors in `/benchmarks`

Project structure is in [`README.md`](./README.md#-package-structure)

---

## 🧩 Module Structure and Plug-and-Play Aggregators

> Enables you to add new aggregators in a plug-and-play fashion — simply create a file in `primitives/` and export it in `index.js`.

### Step-by-Step Guide to Adding a New Aggregator

1. **Create the “primitive” file**  
   _(Here, `aggregation` is just an example — you may have other module directories, each with their own `primitives/` folder for plug-and-play modules.)_
   In `methods/aggregation/primitives/`, create `yourNew.js`:

   ```js
   // methods/aggregation/primitives/yourNew.js

   /**
    * yourNew — example of a new aggregator
    *
    * @param {{ validateColumn(frame, column): void }} deps
    * @returns {(frame: TinyFrame, column: string) => any}
    */
   export const yourNew =
     ({ validateColumn }) =>
     (frame, column) => {
       validateColumn(frame, column);
       // …your logic here
       return; /* result */
     };
   ```

2. **Register it in the barrel**  
   Open `methods/aggregation/primitives/index.js` and add:

   ```js
   // at the top, alongside other exports
   export { yourNew as _yourNew } from './yourNew.js';
   ```

3. **Inject dependencies**  
   Ensure your `index.js` wires it up automatically:

   ```js
   import * as rawFns from './index.js'; // _yourNew is now part of rawFns
   import { validateColumn } from '../../../primitives/validators.js';

   const deps = { validateColumn /*, other shared deps */ };

   export const aggregationFunctions = Object.fromEntries(
     Object.entries(rawFns).map(([key, fn]) => [
       key.replace(/^_/, ''), // strip the leading “_”
       fn(deps), // yields a (frame, column) => … function
     ]),
   );
   ```

4. **Facade remains unchanged**  
   In `methods/aggregation/groupByAgg.js` you don’t need to touch a thing — `yourNew` is picked up automatically:

   ```js
   import { aggregationFunctions } from './primitives/index.js';

   export function groupByAgg(frame, column, aggName) {
     const fn = aggregationFunctions[aggName];
     if (!fn) throw new Error(`Unknown aggregator: ${aggName}`);
     return fn(frame, column);
   }
   ```

5. **Use your new aggregator**

   ```js
   import { groupByAgg } from 'methods/aggregation';

   const result = groupByAgg(myFrame, 'someColumn', 'yourNew');
   ```

   That’s it — `yourNew` works out of the box, with no further edits to the facade or other modules.

---

## 🚀 Getting Started

1. **Fork this repo** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone git@github.com:AlphaQuantJS/tinyframejs.git
   cd tinyframejs
   npm install
   ```
3. **Create a feature branch:**
   ```bash
   git checkout -b feat/your-feature-name
   ```
4. Implement your feature or fix inside `src/`
5. Run tests and linting before pushing (see workflow below)
6. **Push and open a Pull Request** to the `main` branch

---

## 📏 Coding Standards & Guidelines

Please review our [`Coding Guidelines`](./CODING_GUIDELINES.md) for:

- Performance tips for V8
- Data integrity and numerical precision
- Modular and reusable function design
- Memory-efficient handling of large datasets

---

## ✅ Pull Request Checklist

- [ ] Code builds with `pnpm build`
- [ ] Added or updated relevant tests in `test/`
- [ ] Follows ESLint/Prettier rules
- [ ] Descriptive commit message (see below)
- [ ] Linked to a GitHub Issue (if applicable)
- [ ] Clear description in PR body of what was changed and why
- [ ] If change is test-only or doc-only, ensure CI does **not** fail due to lack of coverage
- [ ] If no tests are added, check that Vitest is configured with `passWithNoTests: true` and Codecov uses `fail_ci_if_error: false` or `handle_no_reports_found: false`
- [ ] If new code is added, ensure at least minimal test coverage is present (to trigger coverage report upload)

---

## ✅ Steps Before Commit

### 1. 🔍 Check and auto-fix formatting (Prettier)

```bash
pnpm format
```

📌 Automatically applies the `.prettierrc` style to all `.js`, `.json`, `.md`, `.yml`, etc.

---

### 2. ✅ Auto-fix code with ESLint rules

```bash
pnpm lint --fix
```

📌 Fixes linting errors and style, including JSDoc, spaces, indents, `no-unused-vars`, etc.

---

### 3. 🧪 Run tests

```bash
pnpm test
```

📌 Runs all tests (via Vitest) and checks that code is not broken.

---

### 4. 🧪 Check coverage (optional)

```bash
pnpm coverage
```

📌 Generates `coverage/lcov.info` and prints the report to the console.

---

### 5. 🐶 (Automatically) on `git commit`

```bash
git add .
git commit -m "feat: describe your change"
```

📌 This will automatically trigger:

- `npx lint-staged`
- `npx prettier --write` on staged files
- `eslint --fix` on staged `.js/.ts`

---

## 💡 Recommended one-liner for all:

```bash
pnpm format && pnpm lint --fix && pnpm test
```

---

## 🧾 Commit Message Format

We use [**Conventional Commits**](https://www.conventionalcommits.org/) for changelogs and releases.

### Format:

```
<type>(scope): short summary
```

### Examples:

> `feat(core): add corrMatrix support`  
> `fix(frame): handle NaN edge case in rollingMean`  
> `docs(readme): add usage examples`

Common types:

| Type     | Description                             |
| -------- | --------------------------------------- |
| feat     | New feature                             |
| fix      | Bug fix                                 |
| docs     | Documentation-only changes              |
| refactor | Code refactor without behavioral change |
| test     | Adding or updating tests                |
| chore    | Infrastructure, config, CI, etc.        |

---

## 🔄 Best Practices

- Keep pull requests small and focused
- Add tests for each new piece of logic
- Document public functions with JSDoc
- Benchmark performance-critical paths
- Update `examples/` when introducing new APIs

---

## 🧪 Testing and Coverage

- Run tests via `pnpm test`
- Coverage is uploaded to Codecov
- Benchmarks are located in `benchmarks/`
- Guard tests protect against performance/memory regressions

---

## 🐞 Bug Reports / Feature Requests

Use [GitHub Issues](https://github.com/AlphaQuantJS/tinyframejs/issues) for:

- Bugs and regressions
- Feature suggestions
- Discussion prompts

We tag beginner-friendly tasks as `good first issue`.

---

## 📚 Documentation & Examples

- See [`examples/`](./examples/) for real-world usage
- Contribute examples, notebooks, articles, or benchmark comparisons!

---

## 💬 Community & Support

- Ask in GitHub Discussions
- Submit new ideas via PR or Issues
- Mention us on Twitter: [@AlphaQuantJS](https://twitter.com/AlphaQuantJS)

---

Thanks again for being part of the TinyFrameJS open-source journey 🙌
Let's build next-gen tools for financial analysis and large-scale data processing in JavaScript together ⚡
