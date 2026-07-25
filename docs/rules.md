# 📜 Crystal Comics — Development Rules & Engineering Standards

> **Platform**: Crystal Comics (`crystal-scans`)  
> **Repository Root**: `D:\Projects\Crystal-Comics`  
> **Scope**: Front-end React code, TypeScript typing, Tailwind CSS styling, Supabase services, and Discord integration scripts.

---

## 🚫 1. Absolute Prohibitions (Anti-Pattern Checklist)

1. **NO Direct Mutation of React / LocalStorage State**:
   - ❌ Never do `user.bookmarks.push(id)` without updating state through setter functions or copying objects (`[...user.bookmarks, id]`).
2. **NO Unchecked Null/Undefined Object Dereferencing**:
   - ❌ Never call `user.discord.id` directly without safe navigation or fallback optional chaining (`user?.discord?.id`).
3. **NO Hardcoded Pixel Container Offsets for Dynamic Elements**:
   - ❌ Avoid `height: calc(100vh - 147px)`. Use flexbox (`flex-grow`, `min-h-screen`) or grid layout containers.
4. **NO Silent Promise Failure Rejections**:
   - ❌ Never catch errors silently with an empty `catch {}` block. Always log errors or provide meaningful UI error states.
5. **NO Wildcard Unscoped CSS Overrides**:
   - ❌ Avoid modifying global HTML elements directly inside component files. Keep component styles scoped via Tailwind CSS utility classes.

---

## 🎯 2. TypeScript & React Guidelines

### 2.1 Typing Standards
- **Explicit Return Types**: All async service functions in `services/` must have explicit return types (e.g. `Promise<Manga[]>`, `Promise<boolean>`).
- **No Implicit `any`**: Always define proper interfaces in [types.ts](file:///D:/Projects/Crystal-Comics/types.ts) or extend existing ones.
- **Strict Optional Handling**: Mark optional properties with `?` (e.g., `heroUrl?: string`).

### 2.2 React Component Best Practices
- **Functional Components**: Use `React.FC<Props>` signature for components.
- **Effect Cleanup**: Always return cleanup functions in `useEffect` when subscribing to listeners (e.g. `subscription.unsubscribe()` in `onAuthStateChange`).
- **Route Scroll Reset**: Ensure all pages rendered inside `Routes` benefit from the `<ScrollToTop />` component.

---

## 🎨 3. Styling & Tailwind CSS Conventions

- **Dark Mode Design System**: Use curated dark tokens (`bg-[#050508]`, `bg-[#0E0E15]`, `text-purple-400`, `text-cyan-400`).
- **Glassmorphism**: Use backdrop filters for overlays: `backdrop-blur-md bg-[#0E0E15]/80 border border-white/10`.
- **Interactive Feedback**: All clickable cards, buttons, and icons MUST include visible hover states (`hover:text-purple-400`, `hover:scale-105 transition-all`).

---

## 🔒 4. Supabase & Security Rules

- **Environment Key Safety**: Never hardcode Supabase project secrets or Discord Bot tokens in frontend files. Use `import.meta.env.VITE_SUPABASE_URL` and `import.meta.env.VITE_SUPABASE_ANON_KEY`.
- **Fallback Verification**: Always handle cases where `supabase` client is `null` (e.g. when env vars are unconfigured in local dev mode).

---

## 🧪 5. Code Quality & Pre-Commit Checklist

Before declaring any feature complete:
1. Run `npm run build` to verify there are zero TypeScript compilation errors.
2. Test responsive layouts at mobile (`375px`), tablet (`768px`), and desktop (`1440px`) viewport widths.
3. Test bookmarking, reading history tracking, and comment creation locally to confirm LocalStorage state persistence.
