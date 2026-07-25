# 🎨 Crystal Comics — UI/UX Design System & Specification

> **Platform**: Crystal Comics (`crystal-scans`)  
> **Inspired By**: Asura Scans & Flame Comics  
> **Design Philosophy**: High-Impact Dark Glassmorphism, Distraction-Free Webtoon Reading, Immersive Micro-Animations, and Premium Tier Highlights.

---

## 👁️ 1. Aesthetic Inspiration & Core Pillars

Crystal Comics synthesizes the visual strengths of top-tier webtoon/manga platforms:

### 1.1 From **Asura Scans**
- **Deep Obsidian Surfaces**: Replaces harsh pure black (`#000000`) with layered dark slate surfaces (`#050508` and `#0E0E15`) for high contrast with minimal eye strain.
- **Hero Banner Spotlight**: Prominent top slider showcasing trending manhwa with full-width backdrop art, match percentages, rating badges, and quick chapter CTAs.
- **Tier & Badge Identity**: Custom rank badges (Squire, Knight, Sovereign) and S-Rank gameplay badges overlaying cards and comment avatars.
- **Structured Chapter Cards**: Clean list presentation highlighting release timestamps (`1 hour ago`, `5 days ago`) and premium paywall locks.

### 1.2 From **Flame Comics**
- **Distraction-Free Reader**: Auto-hiding navigation bars, zero side margins for vertical webtoon continuous scroll, and clean page spacing.
- **Dual Reader Engine**: Instant switching between **Vertical Webtoon** (continuous strip) and **Horizontal Paged Spread** (manga book mode).
- **Quality & Zoom Controls**: Floating glass control pill allowing fast toggle between HD (`1600x2400`) and Standard (`800x1200`) rendering.
- **Quick-Jump Bottom Sheet**: Drawer menu allowing readers to jump directly to any chapter without exiting the reader screen.

---

## 🎨 2. Color Palette & Token System

```css
/* Core Color Tokens */
:root {
  /* Surface Colors */
  --bg-obsidian: #050508;      /* Primary page background */
  --surface-card: #0E0E15;     /* Card and drawer container background */
  --surface-glass: rgba(14, 14, 21, 0.75); /* Glassmorphic headers & floating docks */
  --border-subtle: rgba(255, 255, 255, 0.08);

  /* Brand & Accent Tokens */
  --accent-purple: #8B5CF6;    /* Primary brand violet / S-Rank highlight */
  --accent-cyan: #06B6D4;      /* Flame cyan secondary accent */
  --accent-crimson: #E11D48;   /* Hot release & warning badge red */
  --accent-gold: #F59E0B;      /* Sovereign tier & star rating yellow */

  /* Text & Content Tokens */
  --text-primary: #F9FAFB;     /* High-contrast headings and title text */
  --text-secondary: #9CA3AF;   /* Subtitles, chapter info, and timestamps */
  --text-muted: #6B7280;       /* Disabled labels & placeholder text */
}
```

---

## 🧩 3. Component Hierarchy & Specs

### 3.1 Hero Slider (`HeroSlider.tsx`)
- **Dimensions**: Full container width, 480px height on Desktop (`md:h-[520px]`).
- **Background**: High-res hero cover image with multi-stage gradient overlay (`bg-gradient-to-t from-[#050508] via-[#050508]/60 to-transparent`).
- **Elements**: Title `h1` in bold font, match score badge (`98% Match`), release year, rank badge, tags list, multi-line synopsis, and prominent gradient action buttons (`Read Chapter 1`, `Add to Library`).

### 3.2 Vertical Manga Card (`MangaCard.tsx`)
- **Aspect Ratio**: 2:3 vertical poster card (`aspect-[2/3]`).
- **Interactions**:
  - `hover:scale-[1.03] transition-all duration-300`
  - Subtle purple glow shadow on hover (`hover:shadow-[0_0_20px_rgba(139,92,246,0.3)]`).
- **Overlays**: Top-left rating pill (`★ 4.9`), top-right status tag (`Ongoing` in green/blue), and bottom title gradient mask.

### 3.3 Floating Glass Dock (`FloatingDock.tsx`)
- **Position**: Fixed bottom center (`fixed bottom-6 left-1/2 -translate-x-1/2 z-50`).
- **Styling**: `bg-[#0E0E15]/80 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 shadow-2xl`.
- **Navigation Tabs**: Home (`/`), Explore (`/explore`), Library (`/library`), Guild (`/guild`), Profile (`/profile`).

### 3.4 Interactive Reader (`Read.tsx`)
- **Layout Modes**:
  1. **Vertical Webtoon Mode**: Centered column (`max-w-4xl mx-auto`), gapless image stack, continuous scrolling.
  2. **Paged Mode**: Single page centered or dual spread (`grid-cols-2`), keyboard arrow key controls (`Left/Right`), touch swipe support.
- **Floating Controls**: Top header auto-hides on scroll, featuring Chapter Selector, HD/SD Quality toggle, Bookmark button, and Close reader button.

### 3.5 Community Comments Drawer (`Comments.tsx`)
- **Structure**: Section located below chapter reader or on manga detail page.
- **Card Format**: Avatar with level ring, user name, tier badge (`Crystal Knight`, `Sovereign`), comment body, timestamp, and like counter (`thumbs-up` button).

---

## 📱 4. Responsive Breakpoints

| Breakpoint | Target Devices | Layout Adjustments |
| :--- | :--- | :--- |
| **`< 640px` (Mobile)** | Phones | 2-column card grid, full-bleed hero banner, bottom floating navigation dock visible |
| **`640px - 1024px` (Tablet)** | Tablets / Portables | 3-column card grid, sidebar overlay, dual webtoon reader column width |
| **`> 1024px` (Desktop)** | Monitors / Laptops | 5-column card grid, full hero slider with synopsis preview, fixed glass header logo |

---

## ✨ 5. Micro-Animations & Interactivity Guidelines

1. **Card Hover**: Scale by `1.03` with a smooth cubic bezier transition (`transition-transform duration-300 ease-out`).
2. **Button Active State**: Micro scale down `active:scale-95` on clicks.
3. **Toast Notifications**: Slide in from top-right with `animate-bounce-short` when bookmarking or logging in.
4. **Page Transitions**: Smooth top scroll reset on route changes (`ScrollToTop` helper in [App.tsx](file:///D:/Projects/Crystal-Comics/App.tsx)).
