/**
 * The deployed shape, asserted.
 *
 * Every other check in this repository builds with no BASE_PATH, while the
 * Pages deploy always sets one. That gap shipped two bugs to the live site and
 * nothing went red:
 *
 *   css   content: "/"         ->  content: "/littlecaterpillars/"
 *   js    .replace(/"/g, ...)  ->  a syntax error, which took main.js's whole
 *                                  module graph down with it
 *
 * This builds the way the deploy builds and checks what comes out.
 *
 *   node tools/assert-basepath.mjs
 */
import { execFile } from 'node:child_process'
import { readdir, readFile, writeFile, rm, mkdtemp } from 'node:fs/promises'
import { promisify } from 'node:util'
import { tmpdir } from 'node:os'
import path from 'node:path'

const run = promisify(execFile)
const ROOT = path.resolve(import.meta.dirname, '..')
const DIST = path.join(ROOT, 'dist')
const BASE = 'littlecaterpillars'

const failures = []
const fail = m => failures.push(m)

await rm(DIST, { recursive: true, force: true })
await run('node', [path.join(ROOT, 'tools', 'build.js')], {
  cwd: ROOT,
  // No LC_ALLOW_PENDING_CONSENT: this is a shape check, and a throwaway build
  // is no reason to normalise the consent bypass. The two faults this catches
  // live in the stylesheet and the scripts, which ship either way.
  env: { ...process.env, BASE_PATH: `/${BASE}` }
})

const files = (await readdir(DIST, { recursive: true }))
  .filter(f => /\.(?:html|css|js|json|xml|webmanifest|txt)$/.test(f))

for (const rel of files) {
  const text = await readFile(path.join(DIST, rel), 'utf8')

  // A repeated segment is always a rewrite that fired twice. Unambiguous.
  if (text.includes(`/${BASE}/${BASE}`)) fail(`${rel}: base path applied twice`)

  // A CSS content string is text, never a URL. This is the breadcrumb bug:
  // `content: "/"` became `content: "/littlecaterpillars/"` on every page.
  if (rel.endsWith('.css')) {
    for (const m of text.matchAll(/content:\s*"([^"]*)"/g)) {
      if (m[1].includes(BASE)) fail(`${rel}: base path written into a CSS content string — content: "${m[1]}"`)
    }
  }
}

// Every shipped script must still parse. One syntax error here is enough to
// take down tilt, the rim, the lightbox, form validation and the consent
// banner at once, because main.js imports them all.
const tmp = await mkdtemp(path.join(tmpdir(), 'lc-parse-'))
for (const rel of files.filter(f => f.endsWith('.js'))) {
  const probe = path.join(tmp, 'probe.mjs')
  await writeFile(probe, await readFile(path.join(DIST, rel), 'utf8'))
  try {
    await run('node', ['--check', probe], { cwd: ROOT })
  } catch (e) {
    const line = String(e.stderr || e).split('\n').find(l => l.includes('Error')) ?? 'syntax error'
    fail(`${rel}: does not parse — ${line.trim()}`)
  }
}
await rm(tmp, { recursive: true, force: true })

console.log(`base-path build: ${files.length} files checked at BASE_PATH=/${BASE}`)
if (failures.length) {
  console.error(`\n${failures.length} failure${failures.length === 1 ? '' : 's'}:`)
  for (const f of failures) console.error(`  - ${f}`)
  process.exit(1)
}
console.log('deployed shape is clean')
