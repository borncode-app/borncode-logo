# Rebrand playbook (per stack)

Read this when you reach steps 4–8 of the workflow. The two reference projects show both styling approaches; copy whichever matches the target.

## Colour tokens

Brand colours come from the six layers of the logo triangle. Use them by role, not by taste:

| Role | Value | Notes |
|---|---|---|
| Primary / links / primary text accent | `#2D4799` (`brand-navy`) | 8.5:1 on white |
| Headings and body text | `#24265D` (`brand-ink`) | |
| Muted text | `#566091` | 5.9:1 on white; the dashboard uses `brand-navy/55–70` for the same job |
| Gradient start, focus ring, fills | `#62A5DF` (layer 1) | **never** text on white (2.6:1) |
| Middle blues | `#4F87CE`, `#4067BA`, `#314BA3`, `#2B3681` | gradients, chart bars |
| Background-only light | violet `#7B5CD6` (+ tints `#a48df0`, `#c4b5f5`) | blobs, one rank badge; never text |
| Danger / pending | rose `#BE123C` (`error-600`) | |
| Warning | orange (`warning-*`, `orange-*`) | |
| Success | brand blue in analytics UI (`success-*` mapped to the blue scale); a real green (`#0F7B4F`) is fine for "ready/OK" status chips | |

Page canvas: `linear-gradient(135deg, #EEF5FC, #E7EEFB, #F1EEFB)` fixed, with the blobs on top.

### When tests or components already use token names

`training-cert-portal` had `--color-brand`, `--color-brand-hover`, `--color-brand-active`, `--blue-*` and a unit test asserting their exact values. Keep the **names**, change the values (`#2D4799` / `#2B3681` / `#24265D`, blue ramp from the primary scale), and update the test's expected values — that is a deliberate spec change. Drop token groups nothing uses (the old `--cyan-*` ramp).

## Tailwind projects (dashboard pattern)

- `tailwind.config.js` → `theme.extend.colors`: `brand` (sky/blue/royal/cobalt/navy/indigo/ink), `primary` 50–950 mapped to the same blues, `success` = the same blue scale if "closed = on-brand" is wanted. `fontFamily`: `sans` = `var(--font-body)`, `brand` = `var(--font-brand)`. `boxShadow`: `glass` and `glass-lg` (inner top rim + soft navy drop).
- Check existing remaps before reusing a colour name. The dashboard remaps `amber-*` to a glass cyan, so a "warm" accent must be `orange-*`/`warning-*`.
- Put `.glass`, `.glass-strong`, `.glass-chip`, `.glass-input`, `.glass-select`, `.btn-brand`, `.section-eyebrow`, `.section-title`, `.nav-item` in `@layer components`; keyframes and `.liquid-bg` outside layers. `borncode-glass.css` has the base versions.
- Class names that tests assert (`cursor-pointer`, `lg:grid-cols-5`, `text-error`, `bg-warning-100`) must survive the restyle — keep them even when you add new classes.

## CSS-module projects (portal pattern)

- Define the glass utilities **globally** in `globals.css` and combine them in JSX with the module class: `className={\`glass glass-strong ${styles.card}\`}`. This is more robust than CSS-modules `composes`.
- Stagger entrances with a `.rise` class and a `--d` custom property; in TSX cast the style: `({ '--d': '240ms' }) as CSSProperties`.
- An element that is centred with `margin-left: 50%; transform: translateX(-50%)` cannot use `.rise` (its keyframes set `transform` and the block jumps left). Give it its own keyframes that include `translateX(-50%)`.
- Put `rise` on a wrapper and the shake/error animation on the inner card; switching `animation-name` on the same element restarts the entrance and flashes.

## Shells

- **Sidebar app (dashboard):** one `glass-frame` (32px radius, blur 28px) holding a sticky 256px sidebar (`sticky top-6 self-start h-[calc(100vh-3rem)]`), top bar, main, footer. Mobile: hamburger → `glass-strong` drawer over a blurred ink scrim. Routes that must be bare (print pages) are listed in one `BARE_ROUTES` array. Use `overflow-clip` on the frame so `sticky` still works.
- **Single-column portal:** a floating `glass` header bar (logo + title + logout chip), content, footer text inside a small glass pill (it must stay readable wherever a dark blob drifts behind it).
- Header logo: `borncode-horizontal-color.svg` as an `<img>`; hero/loader/skeleton logos use the inline `BrandMark` so they can animate.

## Components

- **Stat cards:** replace coloured left borders with a corner orb (blurred gradient circle) plus a short accent bar on the top edge; accent by meaning (pending = rose, total = blue, rate = sky, time = orange, count = neutral/orange/rose by value). Keep count-up numbers.
- **Charts (Recharts):** gradient bars via `<defs>` + `fill="url(#id)"`, dashed horizontal grid only (`rgba(45,71,153,.15)`), no axis lines, tick colour `#2D4799`, glass tooltip (`white/80`, blur 16px, radius 16). Bar animation 1100 ms.
- **Tables:** header `white/40`, row dividers `white/60`, hover `white/50`; rank badges with gradients (1 sky→navy, 2 pale sky→royal, 3 lavender→violet).
- **Modals/dropdowns:** overlay `bg-brand-ink/30 backdrop-blur-md`, panel `glass-strong rounded-3xl`, header strip a `from-brand-sky via-brand-royal to-brand-navy` gradient or `white/40`.
- **Inputs:** `white/78` fill, 1px `#C5CDE6` border, focus = `0 0 0 4px rgba(98,165,223,.28)` ring plus a 1px lift; error = rose border + ring, error box animates in with `scale-in`.
- **Print/PDF pages** stay plain white: don't apply glass to anything that gets printed.

## Loading and motion patterns

| Moment | Pattern |
|---|---|
| Login/submit, then navigation | `<BrandLoader show={loading \|\| redirecting} />`; set `redirecting` on success and leave it on, because the page unmounts when the route changes. It stays at least ~1 s so the logo can finish building and then blurs out |
| Image that takes time to render server-side | Glass skeleton (`.skeleton` shimmer + animated `BrandMark`) over the image; reveal with blur→sharp on load. Hydration can finish after the image loaded, so also check `img.complete && naturalWidth > 0` in an effect |
| File download that is generated on request | Intercept the click, `fetch` the file, show spinner + "creating file…", then a check for ~3 s; fall back to normal navigation if the fetch fails |
| Page entrance | `.rise` stagger, ~100 ms between blocks, 0.85 s `ease-out-expo` |
| Cards | `liquid-hover` + `trackLiquidHover` pointer glow |
| Ambient | blobs 22 s drift, logo `float` 5 s, primary button gradient flow 9 s |

Do not add a global splash: with streaming it flashes on every hard load, and it would reload every few seconds on any page that uses `<meta refresh>`.

## Fonts and icons

- `next/font/google`: `Noto_Sans_Thai` (subsets `thai`, `latin`, weights 400/500/600/700, variable `--font-noto` or `--font-body`) and `Comfortaa` (latin, 600/700, `--font-brand`).
- Icons: `favicon.svg` + `favicon.ico` + `apple-touch-icon.png` from the kit's `web/` folder; in the Next app router use `src/app/icon.png` and `src/app/apple-icon.png`. Set `viewport.themeColor = '#2D4799'`.
- Remove superseded logo files and the scripts that generated them once nothing references them (grep first).
