# Design System: BornCode Liquid Glass — <PROJECT NAME>

<!-- Fill from the code as it stands. Replace every <...>; delete rows/sections that do not apply. -->

This document records the UI design <PROJECT NAME> uses today. The brand itself (logo geometry, colour rationale, glass recipe for the logo) comes from the BornCode brand kit; this file covers how that brand is applied in this app.

Source of truth in code:

| What | Where |
|---|---|
| Colour, font and shadow tokens | `<tailwind.config.js | src/app/globals.css>` |
| Glass surfaces, component classes, animations | `<app/globals.css>` |
| Fonts | `<app/layout.tsx>` (`next/font/google`) |
| Logo mark | `<path>/BrandMark.tsx` |
| Shell (frame, header/sidebar, background) | `<path>/AppShell.tsx | Shell.tsx>` |
| Loading screen | `<path>/BrandLoader.tsx` |
| Pointer-follow highlight | `<path>/liquidHover.ts` |

---

## 1. Principles

- **Liquid glass:** every surface is frosted glass over slowly drifting brand-coloured light.
- **Layered:** depth comes from blur, an inner rim highlight and soft navy shadows, not from borders or solid fills.
- **Calm motion:** things rise into place once, then stay still. The only continuous motion is the background blobs and gentle floating on the logo.
- **Readable first:** text sits on 50–90 % white glass so contrast holds whatever drifts behind it.

## 2. Colour

### Brand

| Token | Hex | Use |
|---|---|---|
| `brand-sky` / `--bc-layer-1` | `#62A5DF` | Highlights, gradient start, focus ring. Never body text on white (2.6:1) |
| `brand-blue` / `--bc-layer-2` | `#4F87CE` | Gradient middle, secondary bars |
| `brand-royal` / `--bc-layer-3` | `#4067BA` | <e.g. figures, gradient middle> |
| `brand-cobalt` / `--bc-layer-4` | `#314BA3` | Logo layer 4 |
| `brand-navy` | `#2D4799` | Primary accent, eyebrows, links, primary button end (8.5:1 on white) |
| `brand-indigo` / `--bc-layer-5` | `#2B3681` | Logo layer 5, hover |
| `brand-ink` / `--bc-layer-6` | `#24265D` | Headings and main text |

Background-only accent: violet `#7B5CD6` (tints `#a48df0`, `#c4b5f5`) for glow blobs <and rank-3 badge>. Never text.

### Semantic and scales

<Describe primary/success/error/warning scales as they are in this project. Note any remapped names (e.g. `amber-*` → cyan) and the safe alternative.>

### Gradients

| Name | Value | Use |
|---|---|---|
| Brand button | `135deg, #62A5DF → #4067BA → #2D4799 (→ #2B3681)` | `.btn-brand`, active nav icon, avatar |
| <Chart closed> | vertical `#62A5DF → #2D4799` | <charts> |
| <Chart pending> | vertical `#fda4af → #e11d48` | <charts> |
| Page canvas | `135deg, #eef5fc → #e7eefb → #f1eefb` | `body` behind the blobs |

## 3. Typography

| Role | Font | Class | Notes |
|---|---|---|---|
| All UI text, Thai and Latin | Noto Sans Thai 400–700 | `<font-sans>` | |
| BornCode wordmark only | Comfortaa 600–700 | `<font-brand>` | no Thai glyphs; wordmark only |

| Pattern | Class | Look |
|---|---|---|
| Eyebrow label | `<.section-eyebrow>` | 11 px, semibold, uppercase, wide tracking, `brand-navy` ~55 % |
| Section title | `<.section-title>` | `text-base sm:text-lg`, semibold, ink |
| Stat number | `<…>` | `text-3xl sm:text-4xl font-bold`, counts up |

## 4. Glass surfaces

| Class | Background | Blur | Used for |
|---|---|---|---|
| `<.glass-frame>` | white 50 % → 22 % → 34 %, 150° | 28 px, saturate 180 % | Outer app pane (32 px radius) |
| `.glass` | white 78 % → 48 %, 145° | 22 px, saturate 170 % | Cards and panels (16–22 px radius) |
| `.glass-strong` | white 90 % → 66 % | 22 px | Modals, dropdowns, drawers |
| `.glass-chip` | white 55–60 % + inner rim | none | Pills, small buttons, helper boxes |
| `<.glass-input / .glass-select>` | white 60 % | 16 px / none | Search, selects |

Every `.glass` has a specular edge from `::before` (1 px gradient border, bright top-left).
Shadows: `shadow-glass` (inner rim + `0 8px 32px -8px rgba(36,38,93,.18)`), `shadow-glass-lg` for hover/modals.
Overlay: `bg-brand-ink/30 backdrop-blur-md`. Dividers/rows: `white/60`, row hover `white/50`.

### Background (`.liquid-bg`)

Four fixed blurred (40 px) radial blobs drifting on a 22 s `blob-drift` loop with staggered delays: <list size, position, colours, opacity>.

## 5. Layout

<Frame size and padding, sidebar width and stickiness, mobile behaviour, page grid order, routes rendered without the shell, radii.>

## 6. Components

<One short bullet per component that has a BornCode-specific treatment: nav item, stat card (orb + accent bar), buttons, badges, lists, charts (gradient bars, dashed grid, glass tooltip), inputs, modals.>

### Logo mark (`BrandMark`)

Inline SVG built from the six layer polygons: vertical fill gradient per layer (opacity 0.72 → 0.95 → 0.85), white 0.75 rim stroke, diagonal sheen, blurred shadow copy underneath. Gradient ids are generated per instance with `useId()` — never hard-code them, or a hidden copy turns every other mark grey. With `animated`, layers drop in base-first (120 ms apart) and the shadow fades in after ~0.75 s.

## 7. Motion

Easing tokens: `--ease-out-expo` `cubic-bezier(0.16,1,0.3,1)`, `--ease-out-quart` `cubic-bezier(0.25,1,0.5,1)`.

| Animation | Class | Timing | Where |
|---|---|---|---|
| Loader build-up | `.brand-layer` | 0.7 s per layer, then breathing | `BrandLoader`, hero marks |
| Loader exit | `exit` keyframes | 0.6 s fade + scale 1.04 + 10 px blur; on screen ≥ ~1 s | `BrandLoader` |
| Progress shimmer | `shimmer` | 1.5 s loop | Loader bar, skeletons, busy buttons |
| Float | `.float` | 5 s, ±8 px | Logo marks |
| Rise | `.rise` + `--d` | 0.85 s, blur 6 px → 0, ~100 ms stagger | Page blocks |
| Liquid hover | `.liquid-hover` | 0.4 s | Cards (pointer glow via `--mx/--my`) |
| Gradient flow | `.btn-brand` | 9 s | Primary buttons |
| Background | `blob-drift` | 22 s alternate | `.liquid-blob` |
| <project-specific> | | | |

## 8. Accessibility

- Text is `brand-ink` / `brand-navy` on light glass; sky is never used for text on white.
- Focus: `focus-visible` ring in `brand-sky`/`primary-500` with offset.
- `prefers-reduced-motion`: animations and transitions collapse to ~0.
- `prefers-reduced-transparency`: glass classes drop `backdrop-filter` and become solid `#f4f7fd`.
- Loaders use `role="status"` with `aria-live="polite"`; clickable non-links have `role="button"` and keyboard handlers.

## 9. Rules of thumb

- New surface: start with `.glass`; `.glass-strong` for anything floating above content; `.glass-chip` for small controls. Avoid raw `bg-white` boxes.
- Keep `backdrop-filter` to the frame, cards and overlays (≤ 2 levels deep).
- Section header: eyebrow (English) above title (Thai or mixed).
- Stagger entrances ~100 ms per block; don't replay animations on every re-render.
- The wordmark is the only place Comfortaa appears.
<If the project generates documents/PDFs: add a section with the coordinates and mask constraints the design must respect.>
