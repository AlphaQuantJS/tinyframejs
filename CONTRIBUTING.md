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

## ✅ Последовательность действий перед коммитом

### 1. 🔍 Проверка и авто-исправление форматирования (Prettier)

```bash
pnpm format
```

📌 Автоматически применит стиль `.prettierrc` ко всем `.js`, `.json`, `.md`, `.yml`, и т.д.

---

### 2. ✅ Авто-исправление кода по правилам ESLint

```bash
pnpm lint --fix
```

📌 Исправит ошибки линтинга и стиль, включая JSDoc, пробелы, отступы, `no-unused-vars`, и т.д.

---

### 3. 🧪 Запуск тестов

```bash
pnpm test
```

📌 Запускает все тесты (через Vitest) и проверяет, что код не ломается.

---

### 4. 🧪 Проверка покрытия (по желанию)

```bash
pnpm coverage
```

📌 Генерирует `coverage/lcov.info` и печатает отчёт в консоль.

---

### 5. 🐶 (Автоматически) при `git commit`

```bash
git add .
git commit -m "feat: describe your change"
```

📌 При этом автоматически сработает:

- `npx lint-staged`
- `npx prettier --write` на staged файлы
- `eslint --fix` на staged `.js/.ts`

---

## 💡 Рекомендуемая команда на всё:

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
