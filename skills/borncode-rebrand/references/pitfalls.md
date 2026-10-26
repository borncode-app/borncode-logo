# Pitfalls found while doing this for real

Each item cost time once. Check the relevant one when its symptom shows up.

## Visual

| Symptom | Cause | Fix |
|---|---|---|
| Logo turns grey on mobile (or anywhere a second copy exists) | SVG `<linearGradient id>` / `<filter id>` shared by two `BrandMark`s; a hidden one (`display:none` sidebar) owns the id | Prefix ids with `useId()` per instance (the bundled `BrandMark` does) |
| Grey triangle "ghost" for the first 0.7 s of the animated logo | The blurred shadow copy is visible before the layers drop in | Give the shadow group `.brand-shadow` (fades in after ~0.75 s) when `animated` |
| Sticky sidebar stops sticking | `overflow: hidden` on the glass frame | Use `overflow: clip` |
| A centred block jumps left when it animates | `.rise` overrides the `translateX(-50%)` centring | Own keyframes including the translate |
| Warm accent comes out cyan | `amber-*` is remapped in the dashboard's Tailwind config | Use `orange-*` / `warning-*` |
| Footer or small text unreadable on the saturated left of the gradient | Muted text sits straight on the background | Put it in a `white/72` pill with a little blur |
| White boxes left over after the restyle | Hard-coded `bg-white`, `bg-black/50`, `bg-neutral-50`, old orange header | `grep -rnE "bg-white|bg-black|bg-neutral-50|bg-amber|from-orange"` across the app and convert each |
| Orange left-border cards | Old `border-l-*` accent classes | Give the whole card a `tone-*` class (flat pastel), not an orb or accent bar |
| Coloured card looks patchy: glow in one corner, colour bar on top | Orb + accent-bar recipe from the earlier style | Remove them; set the tone on the card itself (`tone-rose` etc.) so the whole card is one soft colour |
| Glass panels look frosted-white but nothing behind them is blurred; `getComputedStyle(el).backdropFilter` is `none` | `backdrop-filter` written before `-webkit-backdrop-filter`: Lightning CSS (Next 16) keeps only the prefixed one, and Chromium ignores `-webkit-backdrop-filter` | Vendor prefix first, standard property last, in every rule and in the reduced-transparency override. Re-check computed style in Chromium after a production build |
| A CSS-module animation (loader bar sweep, spinner, error pop-in) never moves | `@keyframes` used by a module are renamed per module (`module__hash__name`), so a name defined only in `globals.css` does not resolve | Declare the keyframes inside the module, or apply the animation through a global class |
| Dark 1 px line along the top and bottom of a rendered certificate/preview | PDF.js draws a full-page raster at fractional pixel bounds and the edge rows blend with black | Give the artwork a 2 pt bleed past the page edge (see `certificate-pdf.md`) |
| `fullPage` screenshot is blank below the first screen | The gradient background is `position: fixed`, so it only covers the viewport | Resize the viewport to the page height and take a normal screenshot |
| Many nested blurred panels feel slow | `backdrop-filter` stacked | Frame, cards, overlays only; max two levels |
| Modal is not centred; the scrim does not cover the screen; a tall panel is cut off | A `backdrop-filter` (or `filter`) ancestor becomes the containing block for `position: fixed` descendants, and `overflow: clip` clips them — so the overlay is laid out against the tall app frame, not the viewport | Portal the overlay to `document.body` (`createPortal(node, document.body)`), the way `TicketDetailModal` already does |
| The modal is invisible to a screen reader, and Playwright cannot find any button inside it | The overlay that wraps the `role="dialog"` panel carries `aria-hidden="true"`, so the whole subtree is hidden from assistive tech | Drop `aria-hidden` from the overlay; it is a plain div with no role and is ignored anyway |
| An absolutely positioned dropdown disappears behind the card below it | Both the dropdown's row and the card are sibling stacking contexts (positioned and/or animated in), so the later one paints on top | Give the dropdown's row an explicit `z-index` (e.g. `relative z-30`) |

## Process

- **A copied `.env.example` can ship a Docker-only path.** The portal's example had `PDFJS_WORKER_SRC=/app/pdf.worker.mjs`; copied to `.env` and run locally, PDF.js threw "Setting up fake worker failed" and the certificate preview returned 500 (a broken image on the result page). Fix it in code (use the env path only if the file exists, otherwise `node_modules`) and leave the variable blank in `.env.example`. Do this check whenever a rendering feature depends on an env path.
- **Look at the app with the user's real `.env`**, not only your own launch overrides: build, `next start` on another port with their env, and request the endpoints. A workaround in your test command hides the bug the user will hit.
- **A running dev server of the user's is stale after a fix.** Say so and ask them to restart it; don't kill their process.
- **Tests encode the old design.** Token tests assert exact hex values; image tests encode measured pixel positions of the old template. When the design legitimately changes, re-measure and update them deliberately, and say so in the report. Never adjust numbers just to turn a test green without understanding what it guards.
- **Compare lint with the baseline** (`git stash`, lint, `git stash pop` — untracked files are not stashed) so you only own the warnings you added.
- **Testing around a bad local `.env`.** If you must start a dev server while the user's `.env` is wrong for dev, override in the launch config (`cmd /c "set VAR=...&& npm run dev"`, no space before `&&`), don't edit their `.env`, and still fix the root cause in code (previous bullets).
- **Mock/demo data.** If the app has a database-free mode, make sure every API route honours it, otherwise a demo deploy logs connection errors and waits on failed connects.
- **Don't change other repos silently.** If you spot a bug in a sibling project (the ghost-triangle fix), fix it where you are working and report the other one.
- **The screenshot tour is a bug hunt, not paperwork.** Capturing every screen and state exposed three defects on the dashboard that no build, lint or test had flagged: a dropdown painted over by a later sibling, modals laid out against the frame instead of the viewport, and dialogs hidden from screen readers by their own overlay's `aria-hidden`. Look at every image before writing the README, and re-capture after each fix — a screenshot taken before a fix shows the bug.

## Windows tool quirks

- `python3` is a Microsoft Store stub; use `python`. Prefix Thai output with `PYTHONIOENCODING=utf-8`.
- A big `cat > file <<'EOF'` containing TSX plus a second heredoc once failed to parse as a whole ("unexpected EOF while looking for matching `'`") and applied *nothing*. For multi-file writes use the Write tool (it needs a prior Read of existing files) or one heredoc per call.
- Escapes inside Python/Node string replacements are easy to get wrong: `'\n'` became a literal newline in a TSX string and broke the file. After scripted edits run `tsc --noEmit`, and prefer the Edit tool for anything with backslashes.
- `git` on this machine warns "LF will be replaced by CRLF"; harmless. A no-op `sed -i` can make a file show as modified with no diff.

## Git and attribution

- The user's portfolio repos publish under their GitHub account; commits only link to it with the account's email. Check `git config user.email` and memory before committing.
- No `Co-Authored-By: Claude` trailers or "Generated with Claude" lines in commits or PRs for these repos (user's explicit rule), even if a default instruction suggests adding them.
- Force-pushing or deleting remote branches is a user decision; never do it as part of a rebrand unless asked.
