/**
 * Build-time assertions over the rendered HTML. These are the items from the
 * §10 audit that a machine can check honestly; the rest are in AUDIT.md.
 */
import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'

const BANNED = [
  /lorem\s+ipsum/i,
  /\byour text here\b/i,
  /\bplaceholder\b(?!\s*=)/i,
  /example\.com/i,
  /\bmeet the principle\b/i,
  /\blorem\b/i
]

// en-ZA. These are the US spellings most likely to slip into this copy.
const US_SPELLINGS = [
  [/\bcolor(s|ed|ing)?\b/gi, 'colour'],
  [/\bfavorite\b/gi, 'favourite'],
  [/\bcenter(s|ed)?\b/gi, 'centre'],
  [/\bprogram(s)?\b/gi, 'programme'],
  [/\borganiz(e|ed|ing|ation)\b/gi, 'organise'],
  [/\brecogniz(e|ed|ing)\b/gi, 'recognise'],
  [/\benroll(ment)\b/gi, 'enrolment'],
  [/\bsavory\b/gi, 'savoury'],
  [/\bneighbor(s|hood)?\b/gi, 'neighbour']
]

export async function check (dist, ctx, pages) {
  const failures = []
  const warnings = []
  const files = await htmlFiles(dist)

  for (const file of files) {
    const rel = path.relative(dist, file)
    const html = await readFile(file, 'utf8')

    for (const rx of BANNED) {
      if (rx.test(stripSafe(html))) failures.push(`${rel}: contains banned text matching ${rx}`)
    }

    const h1s = html.match(/<h1[\s>]/g) ?? []
    if (h1s.length !== 1) failures.push(`${rel}: ${h1s.length} <h1> elements, expected exactly 1`)

    if (!/<html lang="en-ZA"/.test(html)) failures.push(`${rel}: missing lang="en-ZA"`)
    if (!/<link rel="canonical"/.test(html)) failures.push(`${rel}: missing canonical`)
    if (!/name="robots"/.test(html)) failures.push(`${rel}: missing robots meta`)

    const robots = /<meta name="robots" content="([^"]+)"/.exec(html)?.[1]
    const expectNoindex = /^(404|500)\.html$/.test(rel) || rel.startsWith('thank-you')
    if (expectNoindex) {
      if (!/noindex/.test(robots ?? '')) failures.push(`${rel}: should be noindex`)
    } else if (robots !== 'index, follow') {
      failures.push(`${rel}: robots is "${robots}", expected "index, follow"`)
    }

    const title = /<title>([^<]*)<\/title>/.exec(html)?.[1] ?? ''
    if (!title) failures.push(`${rel}: no <title>`)
    else if (title.length > 60) warnings.push(`${rel}: title is ${title.length} characters (guide: 60) — "${title}"`)

    const desc = /<meta name="description" content="([^"]*)"/.exec(html)?.[1] ?? ''
    if (!desc) failures.push(`${rel}: no meta description`)
    else if (desc.length > 155) warnings.push(`${rel}: description is ${desc.length} characters (guide: 155)`)

    // Heading order: no level may be skipped.
    const levels = [...html.matchAll(/<h([1-6])[\s>]/g)].map(m => Number(m[1]))
    for (let i = 1; i < levels.length; i++) {
      if (levels[i] > levels[i - 1] + 1) {
        failures.push(`${rel}: heading level jumps from h${levels[i - 1]} to h${levels[i]}`)
        break
      }
    }

    // Every image carries meaningful alt and intrinsic dimensions.
    for (const m of html.matchAll(/<img\b[^>]*>/g)) {
      const tag = m[0]
      const alt = /\balt="([^"]*)"/.exec(tag)
      if (!alt) failures.push(`${rel}: <img> without an alt attribute`)
      else if (!alt[1].trim()) failures.push(`${rel}: <img> with an empty alt: ${tag.slice(0, 90)}`)
      if (!/\bwidth="/.test(tag) || !/\bheight="/.test(tag)) {
        failures.push(`${rel}: <img> without width/height (CLS): ${tag.slice(0, 90)}`)
      }
    }

    // Every form control is programmatically labelled.
    for (const m of html.matchAll(/<(input|select|textarea)\b[^>]*>/g)) {
      const tag = m[0]
      if (/type="(hidden|submit|button)"/.test(tag)) continue
      const id = /\bid="([^"]+)"/.exec(tag)?.[1]
      if (!id) { failures.push(`${rel}: form control without an id: ${tag.slice(0, 80)}`); continue }
      if (!new RegExp(`<label[^>]*for="${id}"`).test(html)) {
        failures.push(`${rel}: no <label for="${id}">`)
      }
    }

    for (const [rx, better] of US_SPELLINGS) {
      const hits = (stripSafe(html).match(rx) ?? []).filter(h => !/programme/i.test(h))
      if (hits.length) warnings.push(`${rel}: US spelling "${hits[0]}" — en-ZA prefers "${better}"`)
    }

    for (const m of html.matchAll(/<a\b[^>]*href="(http[^"]+)"[^>]*>/g)) {
      if (!/rel="[^"]*noopener/.test(m[0]) && !m[1].startsWith(ctx.site.origin)) {
        warnings.push(`${rel}: external link without rel="noopener": ${m[1]}`)
      }
    }

    for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
      try { JSON.parse(m[1]) } catch (e) { failures.push(`${rel}: invalid JSON-LD (${e.message})`) }
    }
  }

  // Sitemap lists every indexable route and nothing else.
  const sitemap = await readFile(path.join(dist, 'sitemap.xml'), 'utf8')
  const listed = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].replace(ctx.site.origin, ''))
  const expected = pages.filter(p => !p.noindex).map(p => p.path)
  for (const p of expected) if (!listed.includes(p)) failures.push(`sitemap.xml: ${p} is missing`)
  for (const p of listed) if (!expected.includes(p)) failures.push(`sitemap.xml: ${p} should not be listed`)

  // No redirect may chain, loop or point at a non-existent route.
  const { REDIRECTS } = await import('./redirects.js')
  const routes = new Set(pages.map(p => p.path))
  const froms = new Set(REDIRECTS.map(r => r.from))
  for (const r of REDIRECTS) {
    if (r.to.includes('{{')) continue
    const target = r.to.split('#')[0]
    if (!routes.has(target)) failures.push(`redirects: ${r.from} -> ${r.to} does not resolve to a built route`)
    const bare = target.replace(/\/$/, '')
    if (bare !== r.from && froms.has(bare)) failures.push(`redirects: ${r.from} -> ${r.to} is a chain`)
    if (r.from === target) failures.push(`redirects: ${r.from} redirects to itself`)
  }

  console.log(`\nchecked ${files.length} pages`)
  for (const w of warnings) console.log(`  warn  ${w}`)
  if (failures.length) {
    console.error(`\n${failures.length} failure${failures.length === 1 ? '' : 's'}:`)
    for (const f of failures) console.error(`  - ${f}`)
    process.exit(1)
  }
  console.log(`  ${warnings.length} warning${warnings.length === 1 ? '' : 's'}, 0 failures`)
}

/** Ignore text inside the TODO_CONFIRM notes and code comments when banned-word scanning. */
const stripSafe = html => html
  .replace(/<!--[\s\S]*?-->/g, '')
  .replace(/<script[\s\S]*?<\/script>/g, '')
  .replace(/<style[\s\S]*?<\/style>/g, '')
  .replace(/<svg[\s\S]*?<\/svg>/g, '')
  .replace(/<[^>]+>/g, ' ')          // copy only: attribute values are code, not prose
  .replace(/&[a-z]+;|&#\d+;/gi, ' ')

async function htmlFiles (dir) {
  const out = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'gallery' || entry.name === 'documents' || entry.name === 'assets') continue
      out.push(...await htmlFiles(full))
    } else if (entry.name.endsWith('.html')) out.push(full)
  }
  return out
}
