/**
 * Release-quality gate. A green HTML/SEO check is not a finished site.
 *
 * Fails when:
 *   - published photographs are missing from dist/gallery
 *   - shipped HTML points at an image that is not on disk
 *   - consent refs are the synthetic LC-CONSENT-2026-NNN series
 *
 * LC_ALLOW_PENDING_CONSENT=1 is local preview only.
 */
import { existsSync } from 'node:fs'
import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const DIST = path.join(ROOT, 'dist')
const MANIFEST = path.join(ROOT, 'src', 'content', 'gallery-manifest.json')
const SYNTHETIC = /^LC-CONSENT-2026-\d{3}$/

if (process.env.LC_ALLOW_PENDING_CONSENT === '1') {
  console.log('quality: skipped (LC_ALLOW_PENDING_CONSENT=1)')
  process.exit(0)
}

const failures = []
const fail = m => failures.push(m)

if (!existsSync(MANIFEST)) fail('no gallery-manifest.json')
else {
  const manifest = JSON.parse(await readFile(MANIFEST, 'utf8'))
  const published = manifest.entries.filter(e => e.disposition === 'published')
  let missing = 0
  let synthetic = 0
  for (const e of published) {
    if (!existsSync(path.join(DIST, 'gallery', `${e.stem}-800.jpg`))) missing++
    if (!e.consentRef || SYNTHETIC.test(String(e.consentRef))) synthetic++
  }
  if (missing) fail(`${missing} of ${published.length} photographs missing from dist/gallery`)
  if (synthetic) fail(`${synthetic} of ${published.length} published images carry a synthetic or empty consentRef`)
}

async function htmlFiles (dir) {
  const out = []
  if (!existsSync(dir)) return out
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'assets' || entry.name === 'gallery' || entry.name === 'documents') continue
      out.push(...await htmlFiles(full))
    } else if (entry.name.endsWith('.html')) out.push(full)
  }
  return out
}

for (const file of await htmlFiles(DIST)) {
  const html = await readFile(file, 'utf8')
  const rel = path.relative(DIST, file)
  for (const m of html.matchAll(/\b(?:src|srcset)="([^"]+)"/g)) {
    const parts = m[1].split(',').map(s => s.trim().split(/\s+/)[0]).filter(Boolean)
    for (const raw of parts) {
      if (!raw.startsWith('/') || raw.startsWith('data:')) continue
      const clean = raw.replace(/^\/littlecaterpillars/, '').replace(/^\//, '')
      const onDisk = path.join(DIST, clean)
      if (!existsSync(onDisk)) fail(`${rel}: ${raw} is not in dist`)
    }
  }
}

if (failures.length) {
  console.error(`quality failed: ${failures.length} issue${failures.length === 1 ? '' : 's'}`)
  for (const f of failures) console.error(`  - ${f}`)
  process.exit(1)
}

console.log('quality: release-ready')
