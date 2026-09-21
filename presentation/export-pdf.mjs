// Generates a single landscape PDF of all deck slides.
// Usage: node export-pdf.mjs  (preview server must be running on PORT/8443)
import { chromium } from 'playwright'
import { PDFDocument } from 'pdf-lib'
import { writeFileSync } from 'node:fs'

const URL = process.env.DECK_URL ?? 'http://localhost:8443/'
const TOTAL = 13
const OUT = 'Aurora-Quem-Decide.pdf'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 950 }, deviceScaleFactor: 2 })
await page.emulateMedia({ media: 'screen', colorScheme: 'dark' })
await page.goto(URL, { waitUntil: 'networkidle' })

const merged = await PDFDocument.create()

for (let i = 0; i < TOTAL; i++) {
  await page.locator(`button[aria-label="Ir para o slide ${i + 1}"]`).click({ force: true })
  await page.waitForTimeout(750) // let the slide-in animation settle

  const stage = page.locator('div[style*="aspect-ratio"]').first()
  const box = await stage.boundingBox()

  const pdfBytes = await page.pdf({
    printBackground: true,
    width: `${Math.round(box.width)}px`,
    height: `${Math.round(box.height)}px`,
    pageRanges: '1',
    clip: { x: box.x, y: box.y, width: box.width, height: box.height },
  })

  const src = await PDFDocument.load(pdfBytes)
  const [pg] = await merged.copyPages(src, [0])
  merged.addPage(pg)
  process.stdout.write(`slide ${i + 1}/${TOTAL} ✓\n`)
}

writeFileSync(OUT, await merged.save())
await browser.close()
console.log(`\nPDF gerado: ${OUT}`)
