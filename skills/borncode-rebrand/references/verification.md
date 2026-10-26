# Verifying a rebrand

A green build says nothing about how it looks. Do all of these.

## 1. Static checks

```bash
npx tsc --noEmit -p .          # catches the escape/typo class of edit mistakes
npm test                       # or the project's runner (vitest / node --test)
npx next build                 # production build, all routes listed
npx eslint <src>               # compare against the baseline, see pitfalls.md
```

Test suites that were already failing before you started stay out of scope; say which they are.

## 2. Run it and look

- Add a config to `.claude/launch.json` of the session's working folder (`name`, `runtimeExecutable`, `runtimeArgs`, `port`) and start it with `preview_start`. For a sibling project use `npm --prefix ../<project> run dev`. If a local setting is wrong for dev, override it in the command instead of editing `.env` (`cmd /c "set X=...&& npm ..."`).
- Use the demo/seed data that the project ships (mock-data mode, the seed script's users). Do not invent credentials for real services.
- Screenshot desktop (1440×900) **and** `resize_window` preset `mobile`. Reset the viewport to `desktop` when finished.
- **The first screenshot after a navigation usually catches the entrance animation half-way** (cards invisible, grey logo). Take a second screenshot a few seconds later before judging, then use the early frame deliberately to inspect the loading state.
- Check the states, not just the happy page: loading overlay (grab it with a screenshot right after submit), error state (wrong login with obviously fake values), skeleton while an image loads, a modal, the mobile drawer, a long/edge-case content sample.
- Read the console and server log for errors after clicking through.
- **Prove the blur is really applied**, don't trust the look: in the page run `[...document.querySelectorAll('.glass, .glass-frame, [class*=backdrop-blur]')].filter(e => getComputedStyle(e).backdropFilter === 'none')` and expect an empty list (also with a modal open). A frosted look can come from translucent white alone while the blur is silently missing.
- For animations defined in CSS modules, check `getComputedStyle(el).animationName` points to a keyframes that exists, or watch the element move across two screenshots.

## 3. Things that must not be downloaded or sent

For a download button, do not actually save a file during testing. Stub `HTMLAnchorElement.prototype.click` in the page (record `this.download`, return early), click the button, then read the recorded filename. This proves the flow and the filename without writing to disk.

## 4. Generated documents

Render the PDF/template through the same code path the app uses, once with the sample watermark/mask on and once off, plus the widest name. Look at full-size crops of each region (header, name zone, signatures, seal). Sample pixel colours in any region that a mask rectangle covers; the mean should be within ~2 levels of the background (see `certificate-pdf.md`).

## 5. README screenshots (only if asked)

Use an isolated copy so you never touch the user's data: a scratch folder with its own `data/` plus junctions (`New-Item -ItemType Junction`) to `.next`, `assets`, `public`, `node_modules`, `src`, `scripts`, and `next start` from there with explicit env vars (`AUTH_SECRET`, `LOG_PASSWORD`, `CERT_WATERMARK=off`). Seed with the project's own seed script; send `x-forwarded-for` with RFC 5737 addresses (`203.0.113.x`, `198.51.100.x`, `192.0.2.x`) so an audit log looks realistic. Hold requests with `page.route` plus a switchable flag (don't `unroute` while a handler is pending) to capture loading overlays, skeletons and busy buttons. For page-tall shots resize the viewport instead of `fullPage`. Never delete the scratch folder with `rm -rf` while junctions exist; remove the junctions first.

Details:

Drive the production build (`next start`, no dev badge) with Playwright from the project's own `node_modules`: loader frame ~1 s after load, settled dashboard after ~2.5 s, one modal, one secondary page, one phone-sized shot. Store as WebP at ~1600 px (phone ~780 px), about 250 KB total, under `docs/screenshots/`.
