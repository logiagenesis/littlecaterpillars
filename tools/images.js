/**
 * Image pipeline.  `npm run images`
 *
 * Reads originals from source-images/ (never committed — see .gitignore) and
 * writes derivatives plus src/content/gallery-manifest.json.
 *
 * Order matters:
 *   1. perceptual-hash dedupe, before any work is spent on a frame
 *   2. normalise — strip ALL metadata, auto-level, warm slightly toward the
 *      cream/lime palette so a mixed WhatsApp set reads as one shoot
 *   3. smart-crop to a single 4:5 portrait for grid cells; the lightbox gets
 *      the uncropped original
 *   4. AVIF + WebP + JPEG at 400/800/1200/1600w, plus a 20px LQIP
 *
 * EXIF is stripped rather than edited. GPS on preschool photographs is a
 * child-safety problem before it is a POPIA one.
 */
import { readdir, mkdir, writeFile, readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import { dhash, hamming } from './dhash.js'
import { CATEGORIES, PUBLISHED, CUTS, DOCUMENTS, EXACT_DUPLICATES } from './catalogue.js'

const ROOT = path.resolve(import.meta.dirname, '..')
const SRC = path.join(ROOT, 'source-images')
const OUT = path.join(ROOT, 'dist', 'gallery')
const DOCS_OUT = path.join(ROOT, 'dist', 'documents')
const MANIFEST = path.join(ROOT, 'src', 'content', 'gallery-manifest.json')

const WIDTHS = [400, 800, 1200, 1600]
const ASPECT = 4 / 5
const HAMMING_LIMIT = 6

/**
 * Consent register. Maps a source filename to the reference of the signed
 * parental image-consent form the school holds. Until the school supplies it,
 * every entry is empty and `npm run build` refuses to publish the gallery.
 * See TODO_CONFIRM.md.
 */
async function loadConsent () {
  const file = path.join(ROOT, 'source-images', 'consent-register.json')
  if (!existsSync(file)) return {}
  return JSON.parse(await readFile(file, 'utf8'))
}

async function main () {
  if (!existsSync(SRC)) {
    console.error(`\nNo source-images/ directory.\n\n` +
      `The originals are not in this repository and never will be: it is public,\n` +
      `and these are photographs of children. Put the school's originals in\n` +
      `  ${SRC}\n` +
      `and run this again. See README.md § Photography.\n`)
    process.exit(1)
  }

  const consent = await loadConsent()
  const files = (await readdir(SRC)).filter(f => /\.(jpe?g|png|webp)$/i.test(f)).sort()

  // 1. dedupe -------------------------------------------------------------
  const kept = []
  const dropped = []
  const hashes = []
  for (const file of files) {
    if (EXACT_DUPLICATES[file]) { dropped.push({ file, reason: EXACT_DUPLICATES[file] }); continue }
    const h = await dhash(path.join(SRC, file))
    const twin = hashes.find(x => hamming(x.h, h) <= HAMMING_LIMIT)
    if (twin) {
      dropped.push({ file, reason: `Perceptual near-duplicate of ${twin.file} (dHash Hamming distance ${hamming(twin.h, h)}).` })
      continue
    }
    hashes.push({ file, h })
    kept.push(file)
  }

  console.log(`source ${files.length} · deduped to ${kept.length} · dropped ${dropped.length}`)

  await mkdir(OUT, { recursive: true })
  await mkdir(DOCS_OUT, { recursive: true })

  const entries = []
  for (const [i, file] of kept.entries()) {
    const n = i + 1
    const stem = `lc-${String(n).padStart(3, '0')}`
    const assignment = PUBLISHED[n]

    if (DOCUMENTS[n]) {
      // Documents are not gallery photographs. They are served whole, at their
      // own aspect, from /documents/.
      await sharp(path.join(SRC, file))
        .rotate()
        .resize({ width: 1400, withoutEnlargement: true })
        .jpeg({ quality: 88, mozjpeg: true })
        .toFile(path.join(DOCS_OUT, `${DOCUMENTS[n].use}-${n}.jpg`))
      entries.push({ n, file, disposition: 'document', use: DOCUMENTS[n].use, reason: DOCUMENTS[n].note })
      continue
    }

    if (CUTS[n]) { entries.push({ n, file, disposition: 'cut', reason: CUTS[n] }); continue }
    if (!assignment) { entries.push({ n, file, disposition: 'unassigned', reason: 'Not present in tools/catalogue.js.' }); continue }

    const input = path.join(SRC, file)
    const base = sharp(input).rotate()          // honours EXIF orientation, then drops it
    const meta = await base.metadata()

    const normalise = s => s
      .normalise()                               // auto-level
      .modulate({ saturation: 1.04 })
      .tint('#fffaf0')                           // a gentle warm grade toward the cream ground

    // Grid cell: one 4:5 portrait for every image, faces kept in frame.
    const cellHeight = w => Math.round(w / ASPECT)
    for (const w of WIDTHS) {
      const cell = normalise(sharp(input).rotate())
        .resize(w, cellHeight(w), { fit: 'cover', position: sharp.strategy.attention })
      await cell.clone().avif({ quality: 52 }).toFile(path.join(OUT, `${stem}-${w}.avif`))
      await cell.clone().webp({ quality: 74 }).toFile(path.join(OUT, `${stem}-${w}.webp`))
      await cell.clone().jpeg({ quality: 78, mozjpeg: true }).toFile(path.join(OUT, `${stem}-${w}.jpg`))
    }

    // Lightbox: the uncropped frame, long edge 1600.
    const full = normalise(sharp(input).rotate()).resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
    await full.clone().jpeg({ quality: 84, mozjpeg: true }).toFile(path.join(OUT, `${stem}-full.jpg`))
    const fullMeta = await sharp(await full.clone().jpeg().toBuffer()).metadata()

    const lqip = await normalise(sharp(input).rotate())
      .resize(20, 25, { fit: 'cover', position: sharp.strategy.attention })
      .webp({ quality: 40 }).toBuffer()

    entries.push({
      n,
      file,
      disposition: 'published',
      stem,
      category: assignment.c,
      alt: assignment.alt,
      consentRef: consent[file] ?? '',
      aspect: '4:5',
      width: 1200,
      height: cellHeight(1200),
      full: { src: `/gallery/${stem}-full.jpg`, width: fullMeta.width, height: fullMeta.height },
      source: { width: meta.width, height: meta.height },
      lqip: `data:image/webp;base64,${lqip.toString('base64')}`
    })
  }

  const manifest = {
    generated: new Date().toISOString(),
    sourceCount: files.length,
    uniqueCount: kept.length,
    widths: WIDTHS,
    categories: CATEGORIES,
    dropped,
    entries
  }
  await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + '\n')

  const published = entries.filter(e => e.disposition === 'published')
  console.log(`published ${published.length} · cut ${entries.filter(e => e.disposition === 'cut').length} · documents ${entries.filter(e => e.disposition === 'document').length}`)
  console.log(`manifest written to ${path.relative(ROOT, MANIFEST)}`)
}

main().catch(err => { console.error(err); process.exit(1) })
