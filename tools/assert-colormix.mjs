#!/usr/bin/env node
/**
 * Grid law has a colour cousin.
 *
 * `color-mix()` in a polar space (oklch, lch, hsl, hwb) interpolates a HUE
 * channel. White, black and grey have no hue to interpolate. CSS Color 4 calls
 * that channel powerless and says the mix should keep the other colour's hue —
 * but engines disagree, and the disagreement is an open interop issue rather
 * than a closed one (w3c/csswg-drafts#8609, web-platform-tests/interop#1334).
 *
 * Measured on this site's own tokens: `color-mix(in oklch, var(--lc-lime) 26%,
 * var(--lc-white))` is pale green in Chrome 141 and peach in Chrome 119. The
 * stylesheet cannot tell which one a visitor is running, so it must not ask.
 *
 * The rule: in a polar space, never mix against an achromatic OPAQUE colour.
 * State it in srgb instead, which has no hue channel to get wrong. Mixing
 * against `transparent` is fine in any space — alpha is premultiplied, so the
 * other endpoint carries the hue on its own.
 *
 * Exits non-zero on a violation. Wired into `npm test`.
 */
import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'

const STYLES = new URL('../src/styles/', import.meta.url)
const POLAR = new Set(['oklch', 'lch', 'hsl', 'hwb'])

// Achromatic and opaque: no hue to contribute, so it cannot survive a polar mix
// intact. `transparent` is deliberately absent — it is the allowed case.
const ACHROMATIC = [
  /^white$/i, /^black$/i, /^gr[ae]y$/i,
  /^#(?:fff|ffffff|000|000000)$/i,
  /^var\(\s*--lc-(?:white|mist)\s*\)$/i
]

const stripComments = css => css.replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '))

/** Every `color-mix(...)` in `css`, with its balanced argument list. */
function * mixes (css) {
  const open = /color-mix\s*\(/gi
  let m
  while ((m = open.exec(css))) {
    let depth = 1
    let i = open.lastIndex
    for (; i < css.length && depth > 0; i++) {
      if (css[i] === '(') depth++
      else if (css[i] === ')') depth--
    }
    if (depth === 0) yield { args: css.slice(open.lastIndex, i - 1), index: m.index }
  }
}

/** Split on top-level commas only, so `var(--a, b)` stays one argument. */
function topLevelSplit (s) {
  const out = []
  let depth = 0
  let start = 0
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '(') depth++
    else if (s[i] === ')') depth--
    else if (s[i] === ',' && depth === 0) { out.push(s.slice(start, i)); start = i + 1 }
  }
  out.push(s.slice(start))
  return out.map(p => p.trim())
}

/** Strip a trailing percentage so `var(--lc-white) 70%` compares as the colour. */
const colourOf = arg => arg.replace(/\s+-?[\d.]+%\s*$/, '').trim()

const lineOf = (css, index) => css.slice(0, index).split('\n').length

const files = (await readdir(STYLES)).filter(f => f.endsWith('.css')).sort()
const findings = []

for (const file of files) {
  const raw = await readFile(new URL(file, STYLES), 'utf8')
  const css = stripComments(raw)
  for (const { args, index } of mixes(css)) {
    const parts = topLevelSplit(args)
    const space = parts[0]?.match(/^in\s+([a-z-]+)/i)?.[1]?.toLowerCase()
    if (!space || !POLAR.has(space) || parts.length !== 3) continue

    const ends = parts.slice(1).map(colourOf)
    const kind = c => /^transparent$/i.test(c) ? 'transparent'
      : ACHROMATIC.some(re => re.test(c)) ? 'achromatic'
        : 'chromatic'
    const kinds = ends.map(kind)

    // A hue only goes wrong when there IS one to lose: an achromatic endpoint
    // opposite a coloured one. Two achromatic endpoints have no hue between
    // them, and `transparent` contributes nothing at all.
    const bad = kinds.indexOf('achromatic')
    if (bad === -1 || kinds[1 - bad] !== 'chromatic') continue

    findings.push({
      file,
      line: lineOf(css, index),
      space,
      colour: ends[bad],
      against: ends[1 - bad],
      snippet: `color-mix(${args.replace(/\s+/g, ' ')})`
    })
  }
}

if (findings.length) {
  console.error(`\n  colour law: ${findings.length} polar color-mix(es) against an achromatic colour\n`)
  for (const f of findings) {
    console.error(`  ${f.file}:${f.line}`)
    console.error(`    ${f.snippet}`)
    console.error(`    "${f.colour}" has no hue of its own, so "in ${f.space}" has to guess`)
    console.error(`    what to do with "${f.against}"'s. Engines guess differently.`)
    console.error(`    State this mix "in srgb", or mix against transparent instead.\n`)
  }
  process.exit(1)
}

console.log(`colour law: ${files.length} stylesheets, no polar color-mix against an achromatic colour`)
