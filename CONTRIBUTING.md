# 🤝 Contributing to tinyframejs

Thank you for your interest in contributing to **tinyframejs**, the high-performance JavaScript engine for financial tabular data. We welcome contributions of all kinds — code, docs, benchmarks, ideas.

---

## 🧰 Repository Overview

This repository is a standalone part of the [TinyFrameJS](https://github.com/a3ka/tinyframejs) ecosystem and contains:

- ✅ The core tabular engine built on TypedArray structures (TinyFrame)
- ✅ Functional APIs for stats, filtering, reshaping
- ✅ Chainable `AQDataFrame` wrapper (inspired by Pandas)
- ✅ Vitest-based unit tests
- ✅ Benchmarks vs competitors in `/benchmarks`

Project structure is in [`README.md`](./README.md#-package-structure)

---

## 🚀 Getting Started

1. **Fork this repo** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone git@github.com:yourname/tinyframejs.git
   cd tinyframejs
   npm install
   ```
3. **Create a feature branch:**
   ```bash
   git checkout -b feat/your-feature-name
   ```
4. Implement your feature or fix inside `src/`
5. Run tests and linting before pushing:
   ```bash
   npm run lint && npm run test
   ```
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

- [ ] Code builds with `npm run build`
- [ ] Added or updated relevant tests in `test/`
- [ ] Follows ESLint/Prettier rules
- [ ] Descriptive commit message (see below)
- [ ] Linked to a GitHub Issue (if applicable)
- [ ] Clear description in PR body of what was changed and why
- [ ] If change is test-only or doc-only, ensure CI does **not** fail due to lack of coverage
- [ ] If no tests are added, check that Vitest is configured with `passWithNoTests: true` and Codecov uses `fail_ci_if_error: false` or `handle_no_reports_found: false`
- [ ] If new code is added, ensure at least minimal test coverage is present (to trigger coverage report upload)

---

## ✨ Auto-formatting with Prettier

To ensure consistent code style across the codebase, we use [Prettier](https://prettier.io/) integrated via `lint-staged` and `Husky`.

### 🔧 How it works

Before each commit, the following happens automatically:

- `eslint --fix` runs on all staged `.js` and `.mjs` files
- `prettier --write` runs on all staged `.js`, `.json`, `.yml`, `.md`, etc.

This is done via `pre-commit` hook configured by [Husky](https://typicode.github.io/husky/) and driven by `lint-staged`.

### 📁 `lint-staged.config.js`

```js
export default {
  '*.js': ['eslint --fix', 'prettier --write'],
  '*.mjs': ['eslint --fix', 'prettier --write'],
  '*.json': ['prettier --write'],
  '*.yml': ['prettier --write'],
  '*.yaml': ['prettier --write'],
  '*.md': ['prettier --write'],
};
```

### 🐶 `.husky/pre-commit`

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged
```

With this setup, formatting will be enforced automatically during development — no manual formatting required!

---

## 🧾 Commit Message Format

We use [**Conventional Commits**](https://www.conventionalcommits.org/) for changelogs and releases.

### Format:

```
<type>(scope): short summary
```

### Examples:

> `feat(core): add corrMatrix support` > `fix(frame): handle NaN edge case in rollingMean` > `docs(readme): add usage examples`

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

- Run tests via `vitest run`
- Coverage is uploaded to Codecov
- Benchmarks are located in `benchmarks/`
- Guard tests protect against performance/memory regressions

---

## 🐞 Bug Reports / Feature Requests

Use [GitHub Issues](https://github.com/a3ka/tinyframejs/issues) for:

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
- Mention us on Twitter: [@TinyFrameJS](https://twitter.com/TinyFrameJS)

---

Thanks again for being part of the TinyFrameJS open-source journey 🙌
Let’s build next-gen tools for financial analysis and large-scale data processing in JavaScript together ⚡
