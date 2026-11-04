// Concatenates the 4 presentation PDFs into a single file, in order 1..4.
// Usage: node merge-pdfs.mjs
import { PDFDocument } from 'pdf-lib'
import { readFileSync, writeFileSync } from 'node:fs'

const INPUTS = [
  'Aurora-Quem-Decide.pdf',
  'Aurora-Quem-Decide-Apresentacao-2.pdf',
  'Aurora-Quem-Decide-Apresentacao-3.pdf',
  'Aurora-Quem-Decide-Apresentacao-4.pdf',
]
const OUT = 'Aurora-Quem-Decide-Apresentacoes-1-a-4.pdf'

const merged = await PDFDocument.create()

for (const file of INPUTS) {
  const src = await PDFDocument.load(readFileSync(file))
  const pages = await merged.copyPages(src, src.getPageIndices())
  for (const pg of pages) merged.addPage(pg)
  process.stdout.write(`${file}: ${src.getPageCount()} p\u00e1ginas \u2713\n`)
}

writeFileSync(OUT, await merged.save())
console.log(`\nPDF concatenado gerado: ${OUT} (${merged.getPageCount()} p\u00e1ginas)`)
