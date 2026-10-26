# Certificate / PDF template in the BornCode style

Use this only when the project has a generated template (A4 landscape certificate, report cover…). `assets/certificate/make-certificate-template.mjs` is the working generator from `training-cert-portal`; copy it and adjust text and coordinates.

## Architecture

Two layers, because the look needs blur and gradients but text must stay sharp:

1. **Background artwork:** an SVG (in point units, `viewBox="0 0 841.89 595.28"`) rasterised by `sharp` to exactly 3501×2478 px (300 DPI) JPEG q93 4:4:4 and embedded full-page. It holds the page gradient, blurred colour blobs (`feGaussianBlur`), the white glass card with shadow, rim and hairline frame, the six-layer slab motif, and the seal ring.
2. **Vector overlay (pdf-lib):** logo PNG, all text, the dotted name line, signature lines and field lines. Thai + Latin runs are split and drawn with their own fonts (the Thai font has no Latin glyphs). The Thai font has one weight, so "bold" is three draws offset ±0.15–0.35 pt.

Fonts: Noto Sans Thai (Thai), Outfit Regular/SemiBold (Latin) — the files in `assets/fonts` of the project. Logo: `assets/brand/borncode-horizontal.png` and `borncode-mark.png`.

## Constraints from the renderer (check the target project's config and tests)

- **The name is overlaid at fixed coordinates** (portal: dotted line x 251–592, y 290; baseline 299; max 33 pt, auto-shrunk to the line width). Keep the line exactly there and ≤1.3 pt thick with round dots (`dashArray [0.01, 3.7]`, `lineCap Round`) so descenders (lowest at ~291.3) clear it.
- **Signature masks.** In sample/watermark mode the app paints near-white rectangles (`#fcfcfc` with ±3 noise) over the signature areas. Any gradient, tint or line under them becomes a visible patch. So: the card interior is a flat `#fcfcfc`; edge tints are masked out of the lower zone; blobs near the bottom corners are small enough not to reach a mask box; signature **lines sit below the lowest mask box** (portal: line at y 86.5, boxes end at 88.4).
- Keep the seal/decoration out of mask boxes (portal: x ≥ 719).
- The preview image is WebP < 300 KB (a test enforces it) — no noise textures or fine patterns in the artwork; smooth gradients only.
- The rasterised template must stay 3501×2478; the app resizes to that.
- **Bleed.** PDF.js draws the full-page JPEG at fractional pixel bounds and leaves a near-black row along the top and bottom (visible as a dark hairline on the preview). Render the SVG with a 2 pt bleed (`viewBox="-2 -2 W+4 H+4"`, pixel size scaled to match) and draw the image at `x:-2, y:-2, width:W+4, height:H+4`. Check by rendering the template with PDF.js and printing the first and last pixel rows.
- Name colour: set to brand ink `#24265D` in the project's certificate config.

## Design recipe that worked

- Page gradient `#e4eefb → #e8eff9 → #eff4fb`; blobs: sky/royal bottom-left (r≈250), blue (`#6FA3E0 → #2D4799`) top-right, sky top-right edge, pale sky top-left. Blue and white only: no violet.
- Glass card inset 30 pt, radius 22, fill `#fcfcfc`, shadow = same shape in `#24265D` at 30 % blurred ~14 pt offset 9 pt down; rim gradient white→`#9cc8ef`→white 2.2 px; inner white hairline; inner frame 12 pt in at `#2D4799` 20 %.
- Edge tint: blobs clipped to the card and revealed only near the edge via an SVG mask (black rounded rect, blurred, inset ~84 pt on left/top/right but only ~26 pt at the bottom).
- Slab stack top-left: six parallelograms, widths 214→66, height 10.5, gap 3.6, skew 9, layer colours 1→6, white rim and a top-half gloss.
- Seal bottom-right: ring gradient sky→royal→ink, white-glass face, dotted inner ring, highlight arc; logo mark placed as a PNG on top.
- Header: horizontal logo (34 pt tall) → title 42 pt faux-bold ink → tracked English subtitle (Outfit SemiBold 11 pt, tracking 4.4) → six-slab divider → "presented to" lines → name zone → course lines → centre column fields (certificate no. / date, left blank because the app does not fill them) → two signature blocks with Thai and English role → footnote.
- Fix copy errors you meet (the original had "หลักสูรร"), and don't print a placeholder label where the app overlays text (the old "ชื่อ - นามสกุล" collided with the name; move captions below the line).

## Re-measuring the tests

If tests assert ink positions of the old template, measure the new one instead of nudging constants: render at 300 DPI, threshold grey < 200, take the bounding box of ink in each zone, and update the constants and their comments. Then confirm: mask boxes still cover the signing areas, stay clear of the signer-name zone and the seal, and the "ink survives the mask" test still passes (a zone needs > 500 px of ink — the signature line plus role text provides it).
