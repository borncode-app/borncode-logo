# The screenshot tour

A README with one screenshot shows a landing page. A README with a **tour** shows the product: every screen, every state, desktop and phone. The model is `training-cert-portal/README.md` — a hero shot, then a numbered *Product tour* where each step is one sentence and one or two images.

Capture the tour as part of the rebrand, not afterwards. A rebrand changes every pixel, so the old screenshots are wrong the moment you start.

## What to capture

Aim for **15–20 images**. A workable set:

| Group | Shots |
|---|---|
| Hero | The main screen, full viewport |
| Layout close-ups | One crop per major region (stat row, chart, table, feed) — the panels, not the whole page |
| States | Loading overlay, empty state, error state, a skeleton |
| Overlays | Every modal and dropdown, open, in the viewport |
| Secondary screens | Every other route |
| Mobile | The main screen, the menu/drawer, one more screen — at 260 px in the README table |

Name files by what they show (`stat-cards.webp`, `modal-outlier-explanation.webp`, `mobile-drawer.webp`), not by position (`shot-3.webp`). Delete the screenshots the tour replaces.

## How to capture

`assets/scripts/capture-screenshots.mjs` drives it from a JSON spec. Copy `assets/scripts/capture-screenshots.example.json`, adapt it, and run:

```bash
npm run build && npm start          # drive the production build, not the dev server
node <skill>/assets/scripts/capture-screenshots.mjs my-shots.json .
```

`playwright` and `sharp` are resolved from the **target project's** `node_modules`, so the project needs `playwright` (and `sharp`, unless you accept PNG).

Each shot is a list of steps: `goto`, `waitFor`, `wait`, `click`, `fill`, `press`, `scrollTo`, `shot`, `shotEl`, `shotPanel`. `shotPanel` finds the panel that contains a heading — the nearest `card`/`glass` ancestor — which is how you get a tight crop of one region without hard-coding fragile class names.

## The README shape

```markdown
![Hero](docs/screenshots/dashboard.webp)

## Product tour

### 1. The dashboard

One sentence about what the screen answers.

| Left | Right |
|---|---|
| ![Stat row](docs/screenshots/stat-cards.webp) | ![Modal](docs/screenshots/modal-tickets.webp) |

### 2. The next screen

![Panel](docs/screenshots/daily-chart.webp)
```

Every image needs descriptive alt text — it is the only thing a screen-reader user gets from a screenshot.

## Gotchas that cost real time

- **`getByRole` cannot see anything inside `aria-hidden="true"`.** If a modal overlay carries `aria-hidden` (a common mistake — see `pitfalls.md`), every role query inside it returns nothing. Use a CSS locator instead, and treat "Playwright cannot find a button I can see" as a hint that the element is hidden from assistive tech too.
- **Panels are rarely `.card`.** Find them by heading text and walk up to the nearest `card`/`glass` ancestor rather than guessing the container class.
- **Playwright only writes PNG and JPEG.** Convert to WebP with `sharp` afterwards; the repo's existing screenshots are WebP.
- **A loading screen needs the API slowed down**, not luck: route `**/api/**` and delay the response, then screenshot before the delay elapses. Take the shot *after* the logo layers have landed, or you capture a half-built logo.
- **Resize the viewport for tall pages instead of `fullPage`** — a full-page shot of a long dashboard produces a thin unreadable strip.
- **Re-capture everything after any fix.** A screenshot taken before a z-index or portal fix is worse than no screenshot: it shows the bug.
- **Mobile needs its own pass.** The drawer, the collapsed sidebar and the stacked tables only exist at phone width, and the drawer often needs an explicit click.

## The tour pays for itself

Reviewing the captured images is a real bug hunt. On the dashboard this produced three defects that no build or test had flagged:

1. The search dropdown painted *behind* the card below it — two sibling stacking contexts, so the later one won.
2. Every modal sat off-centre, because the app shell's `backdrop-filter` made it the containing block for `position: fixed` descendants.
3. Four modals put `aria-hidden="true"` on the overlay that wraps their own `role="dialog"`, hiding the dialog from screen readers entirely.

Look at every image before you write the README.
