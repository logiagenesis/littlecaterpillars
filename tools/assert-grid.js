/**
 * The grid law, enforced in code rather than by eye.
 *
 *   Every gallery category's image count MUST be divisible by 6 — the lowest
 *   common multiple of the 3-column desktop grid and the 2-column tablet grid.
 *   A category of 10 is illegal. A category of 14 is illegal. No grid on this
 *   site ships with a short final row.
 *
 * This runs on the catalogue (which exists with or without the photographs) and
 * again on the generated manifest when one is present. It also runs the
 * child-safety consent gate: an entry published without a consentRef fails the
 * build. That is deliberate — §5.3 calls it a launch blocker.
 *
 * Exit code 1 on any failure, naming the offending category and the delta.
 */
import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { CATEGORIES, PUBLISHED, CUTS, DOCUMENTS } from './catalogue.js'

const ROOT = path.resolve(import.meta.dirname, '..')
const MANIFEST = path.join(ROOT, 'src', 'content', 'gallery-manifest.json')
const DIVISOR = 6
const EXPECTED_UNIQUE = 102

// The classes and teachers grids are fixed-count and must also lay out square.
const FIXED_GRIDS = [
  { name: 'classes', count: 5, columns: [1, 2, 5], note: '5 items: a 2+3 editorial layout with the baby class as a wide feature card' },
  { name: 'teachers', count: 6, columns: [1, 2, 3], note: '6 items: a perfect 3x2' },
  { name: 'gallery category covers', count: 8, columns: [1, 2, 4], note: '8 covers: 4x2 desktop, 2x4 tablet' }
]

const failures = []
const notes = []
const fail = m => failures.push(m)

// --- 1. category counts ------------------------------------------------------
const counts = new Map(CATEGORIES.map(c => [c.slug, 0]))
for (const [n, entry] of Object.entries(PUBLISHED)) {
  if (!counts.has(entry.c)) { fail(`catalogue: image #${n} is assigned to unknown category "${entry.c}"`); continue }
  counts.set(entry.c, counts.get(entry.c) + 1)
}

for (const category of CATEGORIES) {
  const n = counts.get(category.slug)
  if (n === 0) { fail(`grid law: category "${category.slug}" has no images`); continue }
  const remainder = n % DIVISOR
  if (remainder !== 0) {
    fail(`grid law: category "${category.slug}" has ${n} images. ${n} % ${DIVISOR} = ${remainder}. ` +
      `Cut ${remainder} or add ${DIVISOR - remainder} to reach ${n - remainder} or ${n + DIVISOR - remainder}.`)
  }
}

// --- 2. every source image accounted for -------------------------------------
const assigned = [
  ...Object.keys(PUBLISHED), ...Object.keys(CUTS), ...Object.keys(DOCUMENTS)
].map(Number)
const seen = new Set()
for (const n of assigned) {
  if (seen.has(n)) fail(`catalogue: image #${n} is assigned twice`)
  seen.add(n)
}
for (let n = 1; n <= EXPECTED_UNIQUE; n++) {
  if (!seen.has(n)) fail(`catalogue: image #${n} is not assigned to a category, a cut or a document`)
}
if (assigned.length !== EXPECTED_UNIQUE) {
  fail(`catalogue: ${assigned.length} images assigned, expected ${EXPECTED_UNIQUE}`)
}

// --- 3. alt text ------------------------------------------------------------
for (const [n, entry] of Object.entries(PUBLISHED)) {
  const alt = (entry.alt || '').trim()
  if (!alt) fail(`alt text: image #${n} has none`)
  else if (alt.length < 20) fail(`alt text: image #${n} is too short to be descriptive ("${alt}")`)
  else if (/^(image|photo|picture|img|dsc|lc-)/i.test(alt)) fail(`alt text: image #${n} reads like a filename ("${alt}")`)
}

// --- 4. cuts are explained ---------------------------------------------------
for (const [n, reason] of Object.entries(CUTS)) {
  if (!reason || reason.trim().length < 20) fail(`cut: image #${n} has no usable reason recorded`)
}

// --- 5. fixed grids ----------------------------------------------------------
for (const grid of FIXED_GRIDS) {
  const short = grid.columns.filter(cols => grid.count % cols !== 0)
  if (short.length) {
    notes.push(`${grid.name}: ${grid.count} items leaves a short row at ${short.join(' and ')} columns — ` +
      `handled by an explicit layout, not by the auto grid (${grid.note}).`)
  }
}

// --- 6. manifest and the consent gate ---------------------------------------
let consentBlocked = 0
if (existsSync(MANIFEST)) {
  const manifest = JSON.parse(await readFile(MANIFEST, 'utf8'))
  const byCategory = new Map(CATEGORIES.map(c => [c.slug, 0]))
  for (const entry of manifest.entries) {
    if (entry.disposition !== 'published') continue
    byCategory.set(entry.category, (byCategory.get(entry.category) ?? 0) + 1)
    if (!entry.consentRef) consentBlocked++
  }
  for (const [slug, n] of byCategory) {
    if (n % DIVISOR !== 0) fail(`grid law (manifest): category "${slug}" rendered ${n} images, ${n % DIVISOR} short of a full row`)
    if (n !== counts.get(slug)) fail(`manifest drift: category "${slug}" has ${n} entries but the catalogue says ${counts.get(slug)}`)
  }
  if (consentBlocked && process.env.LC_ALLOW_PENDING_CONSENT !== '1') {
    fail(`child-safety gate: ${consentBlocked} published images have an empty consentRef. ` +
      `No child's face may be published without written parental consent on file. ` +
      `Supply source-images/consent-register.json, or set LC_ALLOW_PENDING_CONSENT=1 for a local preview only.`)
  }
} else {
  notes.push('no gallery-manifest.json yet — run `npm run images` against the school\'s originals. Catalogue checks ran on their own.')
}

// --- report ------------------------------------------------------------------
const total = [...counts.values()].reduce((a, b) => a + b, 0)
console.log('grid law')
for (const category of CATEGORIES) {
  const n = counts.get(category.slug)
  console.log(`  ${String(n).padStart(3)}  ${n % DIVISOR === 0 ? 'ok  ' : 'FAIL'}  ${category.slug}`)
}
console.log(`  ${String(total).padStart(3)}        published total (${Object.keys(CUTS).length} cut, ${Object.keys(DOCUMENTS).length} documents, ${EXPECTED_UNIQUE} unique sources)`)
for (const note of notes) console.log(`note: ${note}`)

if (failures.length) {
  console.error(`\n${failures.length} failure${failures.length === 1 ? '' : 's'}:`)
  for (const f of failures) console.error(`  - ${f}`)
  process.exit(1)
}
console.log('\nall grid-law and catalogue assertions passed')
