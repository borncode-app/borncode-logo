---
name: borncode-rebrand
description: Rebrand a web app (and optionally its PDF/certificate templates) to the BornCode "liquid glass" brand, add the branded loading screen and entrance animations, and write a DESIGN.md that records the resulting design. Use this whenever the user says rebrand, "ทำเป็นแบรนด์ BornCode", "liquid glass", glassmorphism, "ปรับ UI ให้เหมือนที่ทำใน dashboard / training-cert-portal", wants a loading screen or animations in the BornCode style, wants a certificate / PDF template redesigned to match the brand, or asks to create or update DESIGN.md for a BornCode project — even if they never name this skill.
---

# BornCode rebrand + DESIGN.md

Turns an existing web project into a BornCode liquid-glass product and leaves a `DESIGN.md` behind that describes what was actually built. It was distilled from two finished jobs, which are the best examples to look at when something is unclear:

- `C:\Users\snowb4ll\Documents\portfolio\n8n-auto-ticket-dashboard` — Next.js + Tailwind dashboard (app shell with sidebar, charts, modals, tables). Its `DESIGN.md` is the model for the document you will write.
- `C:\Users\snowb4ll\Documents\portfolio\training-cert-portal` — Next.js + CSS modules portal with a generated A4 certificate PDF (`scripts/make-certificate-template.mjs`).

The brand kit itself is `C:\Users\snowb4ll\Documents\portfolio\borncode-logo` (`DESIGN.md` = the brand spec, `svg/`, `png/`, `web/` = logo files and favicons). Read its `DESIGN.md` first: it is the source of truth for colours, fonts and the glass recipe, and it may have changed since this skill was written. If the folder is missing, ask the user where the kit is rather than inventing brand values.

> **Style status (2026-10-26).** The brand spec is the lighter **soft glass, blue-and-white only** look (no navy backdrop, no violet or other coloured glow). Everything in this skill now follows it: logo PNGs, tokens, glass CSS (16 px blur), background blobs, the certificate template and the doc templates. `n8n-auto-ticket-dashboard` and `training-cert-portal` were built from the earlier heavier style (violet/navy blobs, 22 px blur) and keep it until they are rebranded again from this skill.

## Decide the scope before touching anything

Users phrase this loosely ("อันนี้ด้วย", "แค่ rebrand"), and the pieces have very different blast radius. Work out which of these they want, and ask once if it is genuinely unclear:

1. **UI rebrand** (tokens, fonts, glass surfaces, shell, loading screen, animation)
2. **PDF / certificate / email template redesign**
3. **DESIGN.md** (and the README screenshot tour, if they ask)
4. **Publishing** (commit, push, repo rename, sanitising private data) — never implied by 1–3. When the user only said "rebrand", leave the work uncommitted and offer a commit at the end.

Sanitising company/personal data is a separate job with its own checks; do it only when asked.

## Workflow

Keep a task list; the order matters because each step makes the next one checkable.

1. **Survey the target.** Framework and styling approach (Tailwind config vs CSS modules vs plain CSS), where fonts load, which pages exist, which icons/logos are used, and — important — which *tests* assert colours, class names or measurements. Those tests will need updating on purpose, not by accident.
2. **Baseline.** Install dependencies and run the test suite and a build before editing, so later failures are attributable. Note anything already failing.
3. **Brand assets.** Copy logo SVGs (web) and PNGs (PDF embedding) and favicons from the kit; templates for the shared pieces are in `assets/` (see below). Replace old logos, favicons and the now-unused scripts that generated them.
4. **Tokens + glass CSS.** Add `assets/css/borncode-tokens.css` and `borncode-glass.css`, adapting to the project: keep existing token *names* if tests or components reference them and change the values; in a Tailwind project mirror the same colours in `tailwind.config.js` (`brand-*`, `primary-*`) and put the glass classes in `@layer components`. See `references/rebrand-playbook.md`.
5. **Fonts.** Noto Sans Thai for all UI text (Thai and Latin); Comfortaa only for the "BornCode" wordmark, because it has no Thai glyphs and reads badly in paragraphs. Load both through `next/font/google` with CSS variables.
6. **Shell.** A fixed smooth sky gradient with a faint sheen behind everything (`LiquidBackground`), then a glass header or a single glass frame with sidebar. Use `overflow: clip` (not `hidden`) on the frame if a sticky sidebar lives inside it.
7. **Restyle components.** Cards → `.glass`, floating things (modals, dropdowns) → `.glass-strong`, small controls and pills → `.glass-chip`, primary buttons → `.btn-brand`. Convert chart colours to brand gradients, table rows to `white/50` hovers, modal overlays to a blurred ink scrim. Search for leftover `bg-white`, `bg-black`, orange/amber headers and old brand colours.
8. **Loading and motion.** Use `BrandMark` (animated: layers drop in base-first, shadow fades in after) and `BrandLoader` at the moments the user actually waits — submitting a login, navigating after it, long server renders, PDF generation — plus `.rise` staggered entrances, skeletons with a shimmer while images load, and `liquid-hover` highlights on cards. Do not add a splash on every page load or on pages that auto-refresh. Motion must respect `prefers-reduced-motion`, and glass must fall back to solid under `prefers-reduced-transparency`.
9. **Documents (only if in scope).** Follow `references/certificate-pdf.md`; the renderer's coordinates and the signature-mask colour constrain the design.
10. **Verify** (`references/verification.md`): typecheck, tests, build, then look at it in a browser at desktop and phone width, including the loading and error states. Fix what you see; do not declare it done from a green build alone.
11. **Screenshot tour (only if in scope).** A rebrand invalidates every old screenshot, so capture a fresh tour of 15–20 images — hero, panel close-ups, loading and error states, every modal and dropdown, every secondary route, plus a phone pass — and rebuild the README around them as a numbered *Product tour* (the model is `training-cert-portal/README.md`). `references/screenshot-tour.md` has the workflow, the gotchas and the bundled capture script. Reviewing the images is also a bug hunt: the dashboard tour exposed a dropdown painted over by a later sibling, modals sitting off-centre, and dialogs hidden from screen readers.
12. **DESIGN.md.** Fill `assets/DESIGN.template.md` from the *code as it now stands* (read `tailwind.config.js` / `globals.css` / the shell component, do not paraphrase from memory), save as `DESIGN.md` at the repo root, and link it from the README if one exists. `references/design-md.md` explains what each section must contain and how to keep it honest.
13. **Report.** Say what changed, which tests were deliberately updated and why, what you did not touch (publishing, README screenshots, other repos), and anything you noticed but left alone.

## Rules that save time (details in `references/pitfalls.md`)

- Write `-webkit-backdrop-filter` **before** `backdrop-filter` in every rule. With the unprefixed property first, Next's CSS pipeline (Lightning CSS) emits only the `-webkit-` one, which Chromium ignores: no glass is blurred and nothing in a build or test tells you. After building, check `getComputedStyle(el).backdropFilter !== 'none'` on a glass element in a real browser.
- Keyframes referenced from a CSS **module** are name-scoped to that module. `animation: shimmer` in `x.module.css` finds nothing when `shimmer` lives in `globals.css`, so the animation silently does not run. Declare the keyframes in the module (the bundled `brand-loader.module.css` does) or use a global class from JSX.
- SVG gradient/filter ids must be unique per component instance (`useId`). A hidden duplicate of the logo (desktop sidebar on mobile) otherwise owns the shared ids and every other logo turns grey.
- Tailwind remaps like `amber-*` → cyan exist in the dashboard config; check what a colour name really resolves to before reusing it, and use `orange-*`/`warning-*` for real warm accents.
- `backdrop-filter` is expensive: frame, cards and overlays only, never more than two levels deep.
- A `backdrop-filter` (or `filter`) ancestor becomes the **containing block for `position: fixed` descendants**, and `overflow: clip` clips them too. A modal rendered inside the glass frame is then laid out against the tall frame instead of the viewport: not centred, scrim not covering the screen, tall panel cut off. **Portal every full-screen overlay to `document.body`.**
- A `role="dialog"` must not sit inside an `aria-hidden="true"` container — that hides the dialog from screen readers and makes the modal unreachable for Playwright's role queries.
- An absolutely positioned dropdown can be painted over by a later sibling that is also a stacking context (both animated in, both positioned). Give the dropdown's own row a `z-index` so it wins.
- Colour a card by giving the **whole card** a `tone-*` class. Never add a corner orb, a top accent bar or a gradient fill to show meaning.
- Never put sky `#62A5DF` on text over white (2.6:1); sky is for fills and focus rings. Glow colours (`--bc-glow`, `--bc-sky`) are background-only. No violet, no dark navy backdrop.
- Do not edit the user's local `.env`; if a local setting breaks dev (e.g. a Docker-only path), override it in the launch command and tell the user.
- Commits in the user's portfolio repos use the author email that links to their GitHub account and carry no Claude co-author line (check memory / `git config user.email` before committing).

## Bundled files

- `assets/components/` — `BrandMark.tsx`, `BrandLoader.tsx` (+ `brand-loader.module.css`), `LiquidBackground.tsx`, `liquidHover.ts`: copy into the project's components folder and adjust import paths.
- `assets/css/borncode-tokens.css`, `borncode-glass.css` — tokens, glass utilities, the sky-gradient background, keyframes, reduced-motion/transparency fallbacks, and the pastel card tones (`.tone-blue|rose|mint|peach`: add one to any `.glass`, `.glass-chip`, `.bc-card` or `.bc-toast` to tint the whole card).
- `assets/css/borncode-dashboard.css` + `assets/examples/dashboard-formal.html` — dashboard layout with a short-to-long side menu (icon rail that expands on hover, button + drawer on touch/mobile), search bar, stat cards with sparklines, table with priority pills, message feed and bar chart; the spec is section 5.1 of the kit's `DESIGN.md`. Use it for admin, report and back-office screens. The example page is the visual reference to open in a browser.
- `assets/brand/` — horizontal logo and mark PNGs for embedding in PDFs.
- `assets/certificate/make-certificate-template.mjs` — the generator for the A4 certificate (background artwork rendered from SVG with sharp, vector text with pdf-lib).
- `assets/scripts/capture-screenshots.mjs` (+ `capture-screenshots.example.json`) — drives the README screenshot tour from a JSON spec: one entry per shot with the steps to reach the state (goto / wait / click / fill / shot / shotEl / shotPanel), writing WebP through the project's own `playwright` and `sharp`.
- `assets/DESIGN.template.md` — skeleton for the DESIGN.md you write.
- `references/` — `rebrand-playbook.md` (per-stack detail), `pitfalls.md`, `verification.md`, `certificate-pdf.md`, `design-md.md`, `screenshot-tour.md` (how to capture a full screenshot tour and build the README around it). Read the one you need when you reach that step.
