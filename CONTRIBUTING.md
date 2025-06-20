# 🤝 Contributing to TinyFrameJS

Thank you for your interest in contributing to **TinyFrameJS**, the high-performance JavaScript engine for tabular data processing with a modular, functional architecture. We welcome contributions of all kinds — code, docs, benchmarks, ideas.

---

## 🛠 Repository Overview

This repository is a monorepo part of the [AlphaQuantJS](https://github.com/AlphaQuantJS) ecosystem and contains:

- ✅ **packages/core**: The core tabular engine with DataFrame, Series, and ColumnVector implementations
- ✅ **packages/io**: Input/output functionality for CSV, JSON, Excel
- ✅ **packages/viz**: Visualization methods for charts and plots
- ✅ **packages/quant**: Technical analysis and quantitative methods
- ✅ **packages/utils**: Shared utilities and helper functions
- ✅ Vitest-based unit tests
- ✅ Benchmarks vs competitors in `/benchmarks`

Project structure is in [`README.md`](./README.md#-package-structure)

---

## 👌 Modular Structure and Method Registration

> Allows adding new methods in a "plug-and-play" style — just create a file with your method and export it in a barrel file.

### Step-by-Step Guide to Adding a New Method

1. **Create a file with your method**  
   In the `packages/core/src/methods/dataframe/aggregation/` directory, create a file `yourNew.js`:

   ```js
   /**
    * yourNew - example of a new aggregation method
    *
    * @param {{ validateColumn(frame, column): void }} deps - Dependencies
    * @returns {(frame: DataFrame, column: string) => any} - Function for working with DataFrame
    */
   export const yourNew =
     ({ validateColumn }) =>
     (frame, column) => {
       validateColumn(frame, column);
       // Your logic here
       return; /* result */
     };
   ```

2. **Add the method to the barrel file**  
   Open `packages/core/src/methods/dataframe/aggregation/pool.js` and add:

   ```js
   // Add along with other exports
   export { yourNew } from './yourNew.js';
   ```

3. **Method Registration**  
   All methods are automatically registered via `extendDataFrame` in the file `packages/core/src/methods/dataframe/aggregation/index.js`:

   ```js
   import { DataFrame } from '../../../core/DataFrame.js';
   import { extendDataFrame } from '../../../core/extendDataFrame.js';
   import * as pool from './pool.js';

   // Dependencies
   import { validateColumn } from '../../../utils/validators.js';

   const deps = { validateColumn };

   // Register methods
   extendDataFrame(DataFrame.prototype, pool);

   // Export methods for direct use
   export * from './pool.js';
   ```

4. **Using the new method**

   ```js
   import { DataFrame } from '@tinyframejs/core';
   
   const df = new DataFrame({ x: [1, 2, 3], y: [4, 5, 6] });
   
   // The method is automatically available in DataFrame
   const result = df.yourNew('x');
   ```

   Done! Your method works without needing to modify other files or the library core.

### Adding Methods to Namespaces

For specialized methods that belong to a specific domain (like technical analysis, visualization, etc.), use namespaces:

1. **Create a method in the appropriate package**
   ```js
   // packages/quant/src/methods/ta/sma.js
   export const sma = 
     ({ validateColumn }) =>
     (frame, column, period = 14) => {
       validateColumn(frame, column);
       // Implementation
       return result;
     };
   ```

2. **Register with namespace**
   ```js
   // packages/quant/src/methods/ta/index.js
   import { DataFrame } from '@tinyframejs/core';
   import { extendDataFrame } from '@tinyframejs/core';
   import * as taMethods from './pool.js';
   
   // Register methods in the 'ta' namespace
   extendDataFrame(DataFrame.prototype, taMethods, { namespace: 'ta' });
   ```

3. **Usage**
   ```js
   import { DataFrame } from '@tinyframejs/core';
   import '@tinyframejs/quant'; // Registers methods
   
   const df = new DataFrame({ close: [100, 101, 102, 101, 99] });
   
   // Access through namespace
   const smaValues = df.ta.sma('close', 3);
   ```

---

## 🕊 Git Workflow and Branch Structure

For project organization, we use the following branch structure:

### 📌 Main Branches:

* `main`
  * Production version.
  * Ready for release.
  * Each commit is stable and tested code.

* `dev`
  * Main development branch.
  * All completed feature branches are merged here.
  * May contain minor bugs and improvements in progress.
  * Regularly undergoes integration testing.

### 📌 Feature Branches:

For each task, issue, or feature, create a separate branch from `dev`:

* Naming format:

  ```bash
  feature/<feature-name>
  fix/<issue-name-or-number>
  refactor/<description>
  ```

Examples:

* `feature/lazy-computation`
* `fix/null-pointer-issue-32`
* `refactor/dataframe-optimizations`

After completing work on the task:

* ✅ Create a Pull Request (PR) from the feature branch to the `dev` branch.
* ✅ Conduct code review and testing.
* ✅ After successful review, merge into `dev`.
* ✅ Delete the feature branch after merging.

### 📌 Hotfix Branches (Emergency Fixes):

If a serious error is discovered in a release (the `main` branch), we quickly fix it through a special `hotfix` branch from `main`:

* Naming format:

  ```bash
  hotfix/<critical-issue>
  ```

Example:

* `hotfix/dataframe-critical-bug`

After fixing:

* ✅ Merge the `hotfix` branch into `main`.
* ✅ Then merge `main` back into `dev` to incorporate the fixes into the development branch.

### 📌 Complete Workflow Process:

```
main (stable)
  │
  ├─ dev (development)
  │   ├─ feature/lazy-computation
  │   ├─ feature/arrow-integration
  │   ├─ fix/null-pointer-issue-32
  │   └─ refactor/dataframe-optimizations
  │
  └─ hotfix/dataframe-critical-bug (if urgent fix needed)
```

### 📊 Steps Before Release (when updating main):

1. ✅ Verify that the `dev` branch is fully stable and tested.
2. ✅ Create a release PR from the `dev` branch to `main`.
3. ✅ Conduct final review, CI/CD tests, and regression tests.
4. ✅ Merge the PR into `main`.
5. ✅ Create a git release tag (e.g., `v1.0.0`) to mark the stable release point.

Example:

```bash
git checkout main
git merge dev
git tag v1.0.0
git push origin main --tags
```

### ⚙️ Supporting Tools and Practices (Best Practices):

* ✅ **Pull Requests (PR)**:
  Perform mandatory code reviews and tests before merging.

* ✅ **Automation through CI/CD (GitHub Actions)**:
  Run automated testing, linting, and benchmarking.

* ✅ **Branch protection rules** on GitHub:
  Protect `main` and `dev` branches from accidental direct commits.
  Configure mandatory PR reviews before merging.

* ✅ **Semantic Versioning (SemVer)**:
  Strictly follow semantic versioning (`1.0.0`, `1.1.0`, `1.1.1`).

### 📎 Example of Semantic Versioning Approach:

* `1.0.0` — first stable release.
* `1.0.1` — bug fixes and minor corrections.
* `1.1.0` — new features that maintain backward compatibility.
* `2.0.0` — release with changes that break backward compatibility.

### ✅ **Daily Work Recommendations (Best Practices):**

* Commit small changes frequently with informative messages.
* Create issues and PRs for each task.
* Regularly merge the `dev` branch into your feature branches to avoid conflicts.
* Use Squash/Merge commits for a clean history.
* Monitor stability and test coverage through CI/CD.

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

## 📋 Pull Request Checklist

- [ ] Code builds with `pnpm build`
- [ ] Added or updated relevant tests in the appropriate package
- [ ] Methods properly registered with `extendDataFrame`
- [ ] Namespaces used for domain-specific methods
- [ ] Follows ESLint/Prettier rules
- [ ] Descriptive commit message (see below)
- [ ] Linked to a GitHub Issue (if applicable)
- [ ] Clear description in PR body of what was changed and why
- [ ] If change is test-only or doc-only, ensure CI does **not** fail due to lack of coverage
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
- Use dependency injection pattern for all methods
- Register methods properly with `extendDataFrame`
- Use namespaces for domain-specific methods
- Benchmark performance-critical paths
- Update `examples/` when introducing new APIs

---

## 🧪 Testing and Coverage

- Run tests via `pnpm test` (all packages) or `pnpm -F @tinyframejs/[package] test` (specific package)
- Test through the DataFrame API, not internal functions
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
