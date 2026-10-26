#!/usr/bin/env node
/**
 * Capture a screenshot tour of a web app for its README.
 *
 * Driven by a JSON spec (see capture-screenshots.example.json) so the same
 * tool works for any project: one entry per shot, each with the steps needed
 * to reach the state and the file to write.
 *
 *   node capture-screenshots.mjs <spec.json> [projectRoot]
 *
 * The spec's `baseUrl` and `outDir` are relative to the project root, which
 * defaults to the current directory. `playwright` and `sharp` are resolved
 * from that project's own node_modules, so the project must have them
 * installed (playwright is usually a dev dependency; sharp is needed only to
 * write WebP - drop the `webp` flag and write PNG if it is not available).
 */
import { createRequire } from 'node:module'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { tmpdir } from 'node:os'

const specPath = process.argv[2]
if (!specPath) {
  console.error('usage: node capture-screenshots.mjs <spec.json> [projectRoot]')
  process.exit(1)
}
const root = resolve(process.argv[3] || process.cwd())
const spec = JSON.parse(readFileSync(specPath, 'utf8'))

const require = createRequire(join(root, 'package.json'))
let chromium
let sharp = null
try {
  ({ chromium } = require('playwright'))
} catch {
  console.error('playwright not found in the project - run: npm i -D playwright && npx playwright install chromium')
  process.exit(1)
}
try {
  sharp = require('sharp')
} catch {
  console.warn('sharp not found - writing PNG instead of WebP')
}

const BASE = spec.baseUrl.replace(/\/$/, '')
const OUT = resolve(root, spec.outDir)
mkdirSync(OUT, { recursive: true })

const viewports = spec.viewports || {
  desktop: { width: 1440, height: 900 },
  mobile: { width: 390, height: 844, deviceScaleFactor: 2 },
}

const browser = await chromium.launch()
const pages = new Map()

async function pageFor(name) {
  const vp = viewports[name] || viewports.desktop
  if (!pages.has(name)) {
    const context = await browser.newContext({ viewport: vp, reducedMotion: 'reduce' })
    pages.set(name, await context.newPage())
  }
  return pages.get(name)
}

/** Playwright can only write png/jpeg, so convert to webp with sharp. */
async function save(page, file, target) {
  const tmp = join(tmpdir(), `shot-${file.replace(/[^\w.-]/g, '_')}.png`)
  await page.screenshot({ path: tmp, type: 'png' })
  const out = join(OUT, file)
  if (sharp) {
    await sharp(tmp).webp({ quality: spec.quality || 88 }).toFile(out)
  } else {
    writeFileSync(out, readFileSync(tmp))
  }
  console.log('wrote', file)
  return out
}

async function saveElement(locator, file) {
  const tmp = join(tmpdir(), `shot-${file.replace(/[^\w.-]/g, '_')}.png`)
  await locator.screenshot({ path: tmp, type: 'png' })
  const out = join(OUT, file)
  if (sharp) {
    await sharp(tmp).webp({ quality: spec.quality || 88 }).toFile(out)
  } else {
    writeFileSync(out, readFileSync(tmp))
  }
  console.log('wrote', file)
  return out
}

for (const shot of spec.shots) {
  const page = await pageFor(shot.viewport || 'desktop')
  console.log(`\n[${shot.name}]`)

  // Hold the API back so a loading overlay can be captured.
  if (shot.delayApi) {
    await page.route('**/api/**', async (route) => {
      await new Promise((r) => setTimeout(r, shot.delayApi))
      await route.continue()
    })
  }

  try {
    for (const step of shot.steps) {
      if (step.goto !== undefined) {
        await page.goto(new URL(step.goto, BASE).href, { waitUntil: step.waitUntil || 'networkidle' })
      } else if (step.click !== undefined) {
        await page.locator(step.click).first().click()
      } else if (step.fill !== undefined) {
        await page.locator(step.fill.selector).first().fill(step.fill.value)
      } else if (step.press !== undefined) {
        await page.keyboard.press(step.press)
      } else if (step.waitFor !== undefined) {
        await page.locator(step.waitFor).first().waitFor({ timeout: step.timeout || 20000 })
      } else if (step.wait !== undefined) {
        await page.waitForTimeout(step.wait)
      } else if (step.scrollTo !== undefined) {
        await page.locator(step.scrollTo).first().scrollIntoViewIfNeeded()
      } else if (step.shot !== undefined) {
        await save(page, step.shot)
      } else if (step.shotEl !== undefined) {
        const el = page.locator(step.shotEl.selector).first()
        await el.scrollIntoViewIfNeeded()
        await page.waitForTimeout(350)
        await saveElement(el, step.shotEl.file)
      } else if (step.shotPanel !== undefined) {
        // The panel that contains a heading - the nearest card/glass ancestor.
        const heading = page.locator(`text=${step.shotPanel.text}`).first()
        const panel = heading.locator(
          'xpath=ancestor::div[contains(@class,"card") or contains(@class,"glass")][1]'
        )
        await panel.scrollIntoViewIfNeeded()
        await page.waitForTimeout(350)
        await saveElement(panel, step.shotPanel.file)
      }
    }
  } catch (err) {
    console.error(`  FAILED: ${err.message.split('\n')[0]}`)
  } finally {
    if (shot.delayApi) await page.unroute('**/api/**')
  }
}

await browser.close()
console.log('\ndone')
