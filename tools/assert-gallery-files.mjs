/**
 * Deploy gate. The manifest listing a photograph is not the photograph.
 * Pages and CI never have source-images/, so a green build used to ship a
 * 404 hero and a gallery of LQIPs. This exits 1 unless the derivatives
 * exist on disk.
 *
 * Local preview: LC_ALLOW_PENDING_CONSENT=1 skips the check.
 */
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const MANIFEST = path.join(ROOT, 'src', 'content', 'gallery-manifest.json')
const GALLERY = path.join(ROOT, 'dist', 'gallery')

if (process.env.LC_ALLOW_PENDING_CONSENT === '1') {
  console.log('gallery-files: skipped (LC_ALLOW_PENDING_CONSENT=1)')
  process.exit(0)
}

if (!existsSync(MANIFEST)) {
  console.error('gallery-files: no gallery-manifest.json')
  process.exit(1)
}

const manifest = JSON.parse(await readFile(MANIFEST, 'utf8'))
const published = manifest.entries.filter(e => e.disposition === 'published')
const missing = published.filter(e => !existsSync(path.join(GALLERY, `${e.stem}-800.jpg`)))

if (missing.length) {
  console.error(`build failed: ${missing.length} of ${published.length} photographs missing from dist/gallery`)
  console.error('Run npm run images against source-images/, or do not deploy.')
  process.exit(1)
}

console.log(`gallery-files: ${published.length} photographs present`)
