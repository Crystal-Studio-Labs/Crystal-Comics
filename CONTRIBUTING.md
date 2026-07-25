# 🛠️ Contributing to Crystal Comics

First off, thank you for considering contributing to **Crystal Comics**! 🎉 We welcome contributions from developers, designers, and scanlation enthusiasts of all skill levels.

---

## 🚀 Getting Started

1. **Fork the Repository**: Create a personal copy of the repository on GitHub.
2. **Clone Locally**:
   ```bash
   git clone https://github.com/your-username/crystal-comics.git
   cd crystal-comics
   ```
3. **Install Dependencies**:
   ```bash
   npm install
   ```
4. **Start Development Server**:
   ```bash
   npm run dev
   ```

---

## 📋 How to Contribute

### 1. Reporting Bugs
- Check existing [GitHub Issues](https://github.com/your-org/crystal-comics/issues) to ensure the bug hasn't already been reported.
- Open a new issue containing:
  - Clear, descriptive title.
  - Steps to reproduce the bug.
  - Expected vs. actual behavior.
  - Browser and OS details.

### 2. Feature Requests
- Open an issue outlining:
  - Target feature description.
  - Why it would benefit manga scanlation platforms.
  - Proposed implementation overview.

### 3. Submitting Pull Requests (PRs)
1. Create a feature branch:
   ```bash
   git checkout -b feature/amazing-new-feature
   ```
2. Make your code changes adhering to our engineering standards in [`rules.md`](file:///D:/Projects/Crystal-Comics/rules.md).
3. Run build verification locally to ensure zero compilation or type errors:
   ```bash
   npm run build
   ```
4. Commit your changes with clear, descriptive commit messages:
   ```bash
   git commit -m "feat(reader): add touch swipe gesture support for mobile paged reader"
   ```
5. Push to your branch and open a Pull Request against `main`.

---

## 📜 Coding Conventions & Guidelines

- **TypeScript Strictness**: Always define explicit return types for functions and avoid implicit `any`.
- **Glassmorphic Styling**: Use pre-defined Tailwind CSS dark mode design tokens (`bg-[#050508]`, `bg-[#0E0E15]`, `text-purple-400`, `text-cyan-400`).
- **No Direct State Mutation**: Never mutate React state or LocalStorage arrays directly.

Thank you for helping make Crystal Comics the best open-source manga reading platform!
