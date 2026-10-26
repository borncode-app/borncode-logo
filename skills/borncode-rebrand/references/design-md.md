# Writing DESIGN.md

`DESIGN.md` records the design the project has **now**, so the next person (or the next session) can extend it without reverse-engineering CSS. Model: `C:\Users\snowb4ll\Documents\portfolio\n8n-auto-ticket-dashboard\DESIGN.md`. Start from `assets/DESIGN.template.md`.

## Honesty rules

- Read the files and copy values; do not write from memory. A DESIGN.md that disagrees with the code is worse than none. Re-open `tailwind.config.js` / `globals.css` / the shell and brand components right before writing.
- Describe the project's real classes and files by name (`.glass-chip`, `AppShell.tsx`), with the numbers actually used (blur px, opacities, durations, delays).
- Record gotchas that would bite the next editor: remapped colour names, ids that must stay unique, transforms that conflict with animations, constraints from tests or renderers.
- Say what is **not** part of the system (e.g. print pages stay white, Comfortaa only for the wordmark).
- English by default for repo-facing docs (it keeps the portfolio international); follow the user's language if they ask for something else. The brand kit's own DESIGN.md is Thai — that is fine, it is a different document.

## Sections

1. **Header + source-of-truth table** — what the doc covers and which files hold the tokens, glass CSS, fonts, logo, shell, loader.
2. **Principles** — 3–4 lines (liquid glass, layered, calm motion, readable first).
3. **Colour** — brand table (token, hex, use, contrast note), scales, semantic colours, gradients; list forbidden uses (sky/violet text).
4. **Typography** — role, font, tailwind/CSS class, notes; text patterns (eyebrow, section title, stat number).
5. **Glass surfaces** — table of classes with background, blur, where used; shadows; overlay recipe; the background gradient and sheen specs.
6. **Layout** — frame, sidebar, mobile behaviour, grid order, bare routes, radii.
7. **Components** — nav item, stat card, buttons, badges, lists, charts, inputs, modals; the logo mark and its id rule.
8. **Motion** — easing tokens and a table: animation, class, timing, where.
9. **Accessibility** — contrast, focus, keyboard, reduced motion, reduced transparency, `role="status"` on loaders.
10. **Rules of thumb** — how to add a new surface, depth limits, stagger spacing, wordmark font.
11. **(If relevant)** documents/PDF section: coordinates and mask constraints that the design must respect.

Keep it to ~150–200 lines; tables beat prose. Link it from the README ("see DESIGN.md") when the README has a features/design line, and mention it in the final report.
