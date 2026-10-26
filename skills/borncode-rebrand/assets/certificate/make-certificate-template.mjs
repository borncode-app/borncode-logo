// สร้างต้นแบบใบประกาศนียบัตร (A4 แนวนอน) — BornCode liquid glass
//
// รัน: node scripts/make-certificate-template.mjs
// ผลลัพธ์: assets/certificate.pdf (ใช้เป็น background ตอน render PDF/รูปประกาศ)
//
// โครงสร้าง 2 ชั้น
//   1) ภาพพื้นหลัง (SVG → JPEG 3501×2478 = 300 DPI): แสงฟุ้งสีแบรนด์ แผ่นแก้วหลัก
//      แผ่นสามเหลี่ยมซ้อนชั้นมุมซ้ายบน และตราประทับมุมขวาล่าง — งานที่ต้องใช้เบลอ/ไล่สี
//   2) เวกเตอร์ (pdf-lib): โลโก้ ตัวอักษร เส้นประชื่อ เส้นลงนาม — คมทุกขนาด
//
// ข้อตกลงกับโค้ดที่ render ใบจริง (อย่าย้ายโดยไม่แก้ที่สองฝั่ง)
//   • เส้นประชื่อ x 251–592, y 290        ↔ src/lib/certificate-config.ts (DOTTED_LINE_*)
//   • พื้นแผ่นแก้วกลางใบเป็นสีเรียบ #fcfcfc — กรอบ mask ลายเซ็น (signatureMask) ทาด้วย #fcfcfc
//     ทับลงมา จึงต้องไม่มีลาย/ไล่สีในบริเวณ x 170–672 · y 88–150
//   • เส้นลงนามอยู่ที่ y 86.5 ต่ำกว่าขอบล่างของกรอบ mask ทุกกรอบ (88.4) เพื่อไม่ถูกบัง
//   • ตราประทับอยู่ x ≥ 719 · y ≤ 125 ซึ่ง mask ไม่ล้ำเข้ามา

import { PDFDocument, rgb, LineCapStyle } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import sharp from 'sharp'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT = path.join(ROOT, 'assets', 'certificate.pdf')
const FONT = path.join(ROOT, 'assets', 'fonts', 'NotoSansThai-Regular.ttf')
// ฟอนต์ละติน — Noto Sans Thai ที่ ship มาไม่มี glyph ละติน (2/95) ถ้าวาดรวมจะออกมาเป็นช่องว่าง
const LATIN_FONT = path.join(ROOT, 'assets', 'fonts', 'Outfit-Regular.ttf')
const LATIN_BOLD = path.join(ROOT, 'assets', 'fonts', 'Outfit-SemiBold.ttf')
const LOGO_H = path.join(ROOT, 'assets', 'brand', 'borncode-horizontal.png')
const LOGO_MARK = path.join(ROOT, 'assets', 'brand', 'borncode-mark.png')

const W = 841.89, H = 595.28   // A4 แนวนอน (pt)
const PX_W = 3501, PX_H = 2478 // 300 DPI — ต้องตรงกับ FULL_WIDTH/FULL_HEIGHT ใน certificate-image.ts
const DOTTED_LINE_X1 = 251
const DOTTED_LINE_X2 = 592
const DOTTED_LINE_Y = 290
const SIG_LINE_Y = 86.5

// ---- สีแบรนด์ (BornCode DESIGN.md) ----
const hex = (h) => rgb(parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255)
const LAYERS = ['#62A5DF', '#4F87CE', '#4067BA', '#314BA3', '#2B3681', '#24265D']
const NAVY = hex('#2D4799')
const INK = hex('#24265D')
const MUTED = hex('#566091')   // navy ผสมเทา — 5.9:1 บนขาว
const HAIR = hex('#aeb9d6')

// ===================================================================
// 1) ภาพพื้นหลัง
// ===================================================================
const Y = (pdfY) => (H - pdfY).toFixed(3) // พิกัด PDF (ขึ้น) → SVG (ลง)

const CARD = { x: 30, y: 30, w: W - 60, h: H - 60, r: 22 } // y = ขอบล่าง (พิกัด PDF)
const cardTop = CARD.y + CARD.h

/** แผ่นสามเหลี่ยมซ้อนชั้นมุมซ้ายบน — เลียนโลโก้: ยาวที่สุดอยู่บน สั้นลงทีละชั้น */
function slabs() {
  const widths = [214, 184, 154, 124, 94, 66]
  const h = 10.5, gap = 3.6, skew = 9
  const x0 = CARD.x
  const yTop = H - (cardTop - 30) // svg y ของแผ่นแรก
  return widths
    .map((w, i) => {
      const y = yTop + i * (h + gap)
      const c = LAYERS[i]
      const pts = `${x0},${y} ${x0 + w},${y} ${x0 + w - skew},${y + h} ${x0},${y + h}`
      return `
    <g>
      <polygon points="${pts}" fill="#000814" opacity="0.28" transform="translate(0 2.6)" filter="url(#blurS)"/>
      <polygon points="${pts}" fill="url(#slab${i})" stroke="#ffffff" stroke-opacity="0.85" stroke-width="0.7" stroke-linejoin="round"/>
      <polygon points="${x0},${y} ${x0 + w},${y} ${x0 + w - skew * 0.45},${y + h * 0.46} ${x0},${y + h * 0.46}" fill="#ffffff" opacity="0.28"/>
    </g>`
    })
    .join('')
}

function slabGradients() {
  return LAYERS.map(
    (c, i) => `
    <linearGradient id="slab${i}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${c}" stop-opacity="0.78"/>
      <stop offset="0.7" stop-color="${c}" stop-opacity="0.96"/>
      <stop offset="1" stop-color="${c}" stop-opacity="0.86"/>
    </linearGradient>`,
  ).join('')
}

const SEAL = { cx: 756, cy: 86, r: 37 } // พิกัด PDF

function artworkSvg() {
  const cx = SEAL.cx, cy = Y(SEAL.cy)
  const cardSvgY = H - cardTop
  // ขอบนอกของแผ่นแก้วที่ "สีแสงฟุ้ง" ซึมเข้ามา: ซ้าย/บน/ขวา ลึก 80, ล่างตื้น 26
  // (ล่างต้องตื้น เพราะบริเวณลายเซ็นต้องเป็นสีเรียบสำหรับกรอบ mask)
  const inset = { l: 84, t: 84, r: 84, b: 26 }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${PX_W}" height="${PX_H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#e4eefb"/>
      <stop offset="0.55" stop-color="#e9edfb"/>
      <stop offset="1" stop-color="#f1ecfb"/>
    </linearGradient>
    <radialGradient id="bSky" cx="0.38" cy="0.35" r="0.75">
      <stop offset="0" stop-color="#9cc8ef"/><stop offset="0.55" stop-color="#4F87CE"/><stop offset="1" stop-color="#2B3681"/>
    </radialGradient>
    <radialGradient id="bViolet" cx="0.4" cy="0.4" r="0.7">
      <stop offset="0" stop-color="#cdbff7"/><stop offset="0.6" stop-color="#7B5CD6"/><stop offset="1" stop-color="#2B3681"/>
    </radialGradient>
    <radialGradient id="bPale" cx="0.5" cy="0.5" r="0.6">
      <stop offset="0" stop-color="#c3e0f8"/><stop offset="1" stop-color="#62A5DF"/>
    </radialGradient>
    <linearGradient id="rim" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffffff"/><stop offset="0.45" stop-color="#9cc8ef"/><stop offset="1" stop-color="#ffffff"/>
    </linearGradient>
    <linearGradient id="sealRing" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#8fc3ee"/><stop offset="0.55" stop-color="#4067BA"/><stop offset="1" stop-color="#24265D"/>
    </linearGradient>
    <radialGradient id="sealFace" cx="0.35" cy="0.3" r="0.9">
      <stop offset="0" stop-color="#ffffff"/><stop offset="0.7" stop-color="#f1f6fd"/><stop offset="1" stop-color="#dbe8f8"/>
    </radialGradient>
    ${slabGradients()}
    <filter id="blurXL" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="46"/></filter>
    <filter id="blurL" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14"/></filter>
    <filter id="blurM" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="22"/></filter>
    <filter id="blurS" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2"/></filter>
    <clipPath id="cardClip"><rect x="${CARD.x}" y="${cardSvgY}" width="${CARD.w}" height="${CARD.h}" rx="${CARD.r}"/></clipPath>
    <mask id="edgeOnly" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}">
      <rect width="${W}" height="${H}" fill="white"/>
      <rect x="${CARD.x + inset.l}" y="${cardSvgY + inset.t}" width="${CARD.w - inset.l - inset.r}" height="${CARD.h - inset.t - inset.b}" rx="70" fill="black" filter="url(#blurM)"/>
    </mask>
  </defs>

  <!-- พื้นหลัง + แสงฟุ้ง -->
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <g filter="url(#blurXL)">
    <circle cx="30" cy="${Y(40)}" r="250" fill="url(#bSky)" opacity="0.95"/>
    <circle cx="${W - 20}" cy="${Y(H - 30)}" r="220" fill="url(#bViolet)" opacity="0.85"/>
    <circle cx="${W - 150}" cy="${Y(-10)}" r="170" fill="url(#bSky)" opacity="0.75"/>
    <circle cx="260" cy="${Y(H + 20)}" r="120" fill="url(#bPale)" opacity="0.85"/>
  </g>

  <!-- แผ่นแก้วหลัก -->
  <rect x="${CARD.x}" y="${cardSvgY + 9}" width="${CARD.w}" height="${CARD.h}" rx="${CARD.r}" fill="#24265D" opacity="0.30" filter="url(#blurL)"/>
  <rect x="${CARD.x}" y="${cardSvgY}" width="${CARD.w}" height="${CARD.h}" rx="${CARD.r}" fill="#fcfcfc"/>

  <!-- สีของแสงซึมเข้าขอบแผ่น (เฉพาะริม · กลางใบเป็นสีเรียบ) -->
  <g clip-path="url(#cardClip)">
    <g mask="url(#edgeOnly)" filter="url(#blurL)">
      <circle cx="${CARD.x + 30}" cy="${cardSvgY + 40}" r="150" fill="#62A5DF" opacity="0.55"/>
      <circle cx="${CARD.x + CARD.w - 20}" cy="${cardSvgY + 30}" r="140" fill="#9d86e6" opacity="0.5"/>
      <circle cx="${CARD.x + CARD.w - 10}" cy="${cardSvgY + CARD.h - 30}" r="96" fill="#62A5DF" opacity="0.5"/>
      <circle cx="${CARD.x + 10}" cy="${cardSvgY + CARD.h - 10}" r="64" fill="#9cc8ef" opacity="0.4"/>
    </g>
    <!-- แสงสะท้อนเฉียงบนผิวแก้ว -->
    <polygon points="${CARD.x},${cardSvgY} ${CARD.x + 330},${cardSvgY} ${CARD.x + 120},${cardSvgY + CARD.h} ${CARD.x},${cardSvgY + CARD.h}" fill="#ffffff" opacity="0.0"/>
  </g>

  <!-- ขอบแก้ว: ประกายขอบนอก + เส้นเงาในแผ่น -->
  <rect x="${CARD.x}" y="${cardSvgY}" width="${CARD.w}" height="${CARD.h}" rx="${CARD.r}" fill="none" stroke="url(#rim)" stroke-width="2.2"/>
  <rect x="${CARD.x + 1.6}" y="${cardSvgY + 1.6}" width="${CARD.w - 3.2}" height="${CARD.h - 3.2}" rx="${CARD.r - 1.6}" fill="none" stroke="#ffffff" stroke-opacity="0.9" stroke-width="0.8"/>
  <rect x="${CARD.x + 12}" y="${cardSvgY + 12}" width="${CARD.w - 24}" height="${CARD.h - 24}" rx="${CARD.r - 9}" fill="none" stroke="#2D4799" stroke-opacity="0.2" stroke-width="0.7"/>

  <!-- แผ่นสามเหลี่ยมซ้อนชั้น (มุมซ้ายบน) -->
  <g clip-path="url(#cardClip)">${slabs()}</g>

  <!-- ตราประทับมุมขวาล่าง (โลโก้วางเป็นเวกเตอร์ทีหลัง) -->
  <circle cx="${cx}" cy="${cy + 3}" r="${SEAL.r + 3}" fill="#24265D" opacity="0.30" filter="url(#blurL)"/>
  <circle cx="${cx}" cy="${cy}" r="${SEAL.r}" fill="url(#sealRing)"/>
  <circle cx="${cx}" cy="${cy}" r="${SEAL.r - 4}" fill="url(#sealFace)" stroke="#ffffff" stroke-width="1.1"/>
  <circle cx="${cx}" cy="${cy}" r="${SEAL.r - 8.5}" fill="none" stroke="#4F87CE" stroke-opacity="0.55" stroke-width="0.6" stroke-dasharray="1 2.2" stroke-linecap="round"/>
  <path d="M ${cx - SEAL.r + 7} ${cy - 8} A ${SEAL.r - 6} ${SEAL.r - 6} 0 0 1 ${cx + SEAL.r - 7} ${cy - 8}" fill="none" stroke="#ffffff" stroke-opacity="0.9" stroke-width="1.4" stroke-linecap="round" transform="translate(0 -3)"/>
</svg>`
}

const artworkJpeg = await sharp(Buffer.from(artworkSvg()), { density: 72 })
  .resize(PX_W, PX_H, { fit: 'fill' })
  .jpeg({ quality: 93, chromaSubsampling: '4:4:4' })
  .toBuffer()

// ===================================================================
// 2) เวกเตอร์ทับ
// ===================================================================
const doc = await PDFDocument.create()
doc.registerFontkit(fontkit)
const thai = await doc.embedFont(fs.readFileSync(FONT), { subset: true })
const latin = await doc.embedFont(fs.readFileSync(LATIN_FONT), { subset: true })
const latinBold = await doc.embedFont(fs.readFileSync(LATIN_BOLD), { subset: true })
const bg = await doc.embedJpg(artworkJpeg)
const logoH = await doc.embedPng(fs.readFileSync(LOGO_H))
const logoMark = await doc.embedPng(fs.readFileSync(LOGO_MARK))
const page = doc.addPage([W, H])
page.drawImage(bg, { x: 0, y: 0, width: W, height: H })

/** แยกข้อความเป็น run ไทย/ละติน — แต่ละ run ใช้ฟอนต์ของตัวเอง */
function splitRuns(text) {
  return text.match(/[฀-๿]+|[^฀-๿]+/g) ?? []
}
function runFont(run, latinFont = latin) {
  return /[฀-๿]/.test(run) ? thai : latinFont
}
function measureMixed(text, size, latinFont = latin) {
  return splitRuns(text).reduce((w, run) => w + runFont(run, latinFont).widthOfTextAtSize(run, size), 0)
}
/** วาดข้อความผสมไทย/ละติน · bold = ตัวหนาเทียม (ฟอนต์ไทยที่ ship มามีน้ำหนักเดียว) */
function drawMixed(text, { x, y, size, color, latinFont = latin, bold = 0 }) {
  const offsets = bold ? [-bold, 0, bold] : [0]
  for (const dx of offsets) {
    let cursor = x + dx
    for (const run of splitRuns(text)) {
      const font = runFont(run, latinFont)
      page.drawText(run, { x: cursor, y, size, font, color })
      cursor += font.widthOfTextAtSize(run, size)
    }
  }
}
function drawCentered(text, opts) {
  const w = measureMixed(text, opts.size, opts.latinFont)
  drawMixed(text, { ...opts, x: (opts.cx ?? W / 2) - w / 2 })
}
/** ข้อความละตินตัวพิมพ์ใหญ่เว้นระยะตัวอักษร (tracking) */
function drawTracked(text, { cx, y, size, color, tracking, font = latinBold }) {
  const widths = [...text].map((ch) => font.widthOfTextAtSize(ch, size))
  const total = widths.reduce((a, b) => a + b, 0) + tracking * (text.length - 1)
  let x = cx - total / 2
  ;[...text].forEach((ch, i) => {
    page.drawText(ch, { x, y, size, font, color })
    x += widths[i] + tracking
  })
}

// ---- หัวใบ: โลโก้ + ชื่อเรื่อง ----
const LOGO_HEIGHT = 34
const logoW = (logoH.width / logoH.height) * LOGO_HEIGHT
page.drawImage(logoH, { x: W / 2 - logoW / 2, y: 512, width: logoW, height: LOGO_HEIGHT })

drawCentered('ใบประกาศนียบัตร', { y: 456, size: 42, color: INK, bold: 0.35 })
drawTracked('CERTIFICATE OF COMPLETION', { cx: W / 2, y: 432, size: 11, color: NAVY, tracking: 4.4 })

// ตัวแบ่งแผ่นซ้อนชั้น 6 ชิ้น (สีไล่จากยอดสว่างลงฐานเข้ม ตามโลโก้)
{
  const sw = 17, sh = 4.2, gap = 3.2, skew = 3
  const total = LAYERS.length * sw + (LAYERS.length - 1) * gap
  let x = W / 2 - total / 2
  LAYERS.forEach((c) => {
    page.drawSvgPath(`M ${skew} 0 L ${sw} 0 L ${sw - skew} ${sh} L 0 ${sh} Z`, { x, y: 408 + sh, color: hex(c) })
    x += sw + gap
  })
}

// ---- ผู้รับ ----
drawCentered('ขอมอบใบประกาศนียบัตรฉบับนี้ให้แก่', { y: 366, size: 14, color: MUTED })
drawCentered('This certificate is proudly presented to', { y: 350, size: 9.5, color: MUTED })

// เส้นประสำหรับชื่อ (พิกัดตรงกับ certificate-config.ts) — จุดกลมสีกรมท่า
page.drawLine({
  start: { x: DOTTED_LINE_X1, y: DOTTED_LINE_Y },
  end: { x: DOTTED_LINE_X2, y: DOTTED_LINE_Y },
  thickness: 1.3, color: NAVY, opacity: 0.9, dashArray: [0.01, 3.7], lineCap: LineCapStyle.Round,
})
drawCentered('ชื่อ - นามสกุล  ·  Full name', { y: 273, size: 9.5, color: MUTED })

// ---- เนื้อหา ----
drawCentered('ได้ผ่านการอบรมตามหลักสูตรที่กำหนด', { y: 245, size: 13, color: MUTED })
drawCentered('ออกแบบและพัฒนาเว็บแอปพลิเคชันด้วย Next.js', { y: 218, size: 19, color: INK, latinFont: latinBold, bold: 0.18 })
drawCentered('App Router, React Server Components และการทำ SEO', { y: 196, size: 11.5, color: NAVY })

// ---- ลงนาม ----
// โครงสร้างเหมือนต้นแบบจริง: พื้นที่ลายเซ็นอยู่ด้านบนเส้น (บริเวณที่ mask ครอบ)
// ชื่อ/ตำแหน่งที่พิมพ์ไว้อยู่ใต้เส้น (บริเวณที่ mask ห้ามไปแตะ)
const SIGNERS = [
  { cx: 250, th: 'ผู้อำนวยการหลักสูตร', en: 'Programme Director' },
  { cx: 600, th: 'วิทยากร', en: 'Instructor' },
]
for (const s of SIGNERS) {
  page.drawLine({ start: { x: s.cx - 72, y: SIG_LINE_Y }, end: { x: s.cx + 72, y: SIG_LINE_Y }, thickness: 1.3, color: NAVY, opacity: 0.8 })
  drawCentered(s.th, { cx: s.cx, y: 70, size: 13, color: INK, bold: 0.15 })
  drawCentered(s.en, { cx: s.cx, y: 57, size: 9, color: MUTED })
}

// ช่องเลขที่/วันที่ — คอลัมน์กลางระหว่างสองผู้ลงนาม ลอยเหนือเส้นลงนาม
// (นอกกรอบ mask ทั้งหมด: mask อยู่ x 172–321 และ 528–670 · คอลัมน์นี้ x 338–510)
const FIELDS = [
  { y: 146, th: 'เลขที่ใบประกาศนียบัตร', en: 'Certificate No.' },
  { y: 118, th: 'วันที่ออก', en: 'Date of issue' },
]
const FIELD_X = 338, FIELD_X2 = 510
const labelCol = Math.max(...FIELDS.map((f) => measureMixed(f.th, 9.5))) + 10
for (const f of FIELDS) {
  drawMixed(f.th, { x: FIELD_X, y: f.y, size: 9.5, color: INK })
  drawMixed(f.en, { x: FIELD_X, y: f.y - 10, size: 7.5, color: MUTED })
  page.drawLine({ start: { x: FIELD_X + labelCol, y: f.y - 1.5 }, end: { x: FIELD_X2, y: f.y - 1.5 }, thickness: 0.8, color: HAIR })
}

// ตราประทับ: โลโก้เวกเตอร์ตรงกลาง
{
  const mw = 52, mh = (logoMark.height / logoMark.width) * mw
  page.drawImage(logoMark, { x: SEAL.cx - mw / 2, y: SEAL.cy - mh / 2 + 1, width: mw, height: mh })
}

drawCentered('เอกสารนี้สร้างโดยระบบอัตโนมัติ', { y: 49, size: 8, color: MUTED })

doc.setTitle('ต้นแบบใบประกาศนียบัตร')
doc.setAuthor('BornCode')
const bytes = await doc.save()
fs.mkdirSync(path.dirname(OUT), { recursive: true })
fs.writeFileSync(OUT, bytes)
console.log(`สร้างต้นแบบใบประกาศนียบัตรเรียบร้อย — ${OUT} (${bytes.length} bytes)`)
