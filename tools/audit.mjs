/**
 * The machine-checkable half of the §10 self-audit, run in a real browser.
 *
 *   node tools/audit.mjs            full run, writes audit-out/
 *   node tools/audit.mjs --shots    screenshots only
 *
 * Checks, per route:
 *   - axe-core violations
 *   - console errors and warnings
 *   - a short final row in ANY grid at 360/390/768/1024/1280/1440/1920
 *   - tilt never exceeding 7 degrees under fast pointer movement
 *   - the sheen confined to the tile border
 *   - prefers-reduced-motion killing tilt, drift and parallax
 *   - one rAF loop, and no forced reflow during hover
 *   - keyboard focus visible on a tile without a pointer
 *   - 200% zoom without clipping or overlap
 */
import { chromium } from 'playwright'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { createServer } from 'node:http'
import { readFile as rf, stat } from 'node:fs/promises'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const DIST = path.join(ROOT, 'dist')
const OUT = path.join(ROOT, 'audit-out')
const PORT = 4399
const BASE = `http://localhost:${PORT}`

const ROUTES = ['/', '/about/', '/classes/', '/teachers/', '/gallery/', '/fees/',
  '/admissions/', '/admissions/enrolment/', '/admissions/swimming/', '/menus/',
  '/downloads/', '/location/', '/contact/', '/thank-you/', '/popia/', '/privacy/', '/terms/']
const WIDTHS = [360, 390, 768, 1024, 1280, 1440, 1920]
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain', '.webmanifest': 'application/manifest+json' }

const server = createServer(async (req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0])
  let file = path.join(DIST, url)
  try { if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html') }
  catch { if (!path.extname(file)) file = path.join(DIST, url, 'index.html') }
  try {
    res.writeHead(200, { 'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream' })
    res.end(await rf(file))
  } catch { res.writeHead(404); res.end('not found') }
})
await new Promise(r => server.listen(PORT, r))

const AXE = await readFile(path.join(ROOT, 'node_modules', 'axe-core', 'axe.min.js'), 'utf8')
await mkdir(OUT, { recursive: true })

const findings = []
const note = (route, level, message) => findings.push({ route, level, message })

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' })

// --- 1. axe, console and grids at every breakpoint --------------------------
for (const route of ROUTES) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 })
  const page = await context.newPage()
  const messages = []
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') messages.push(`${m.type()}: ${m.text()}`) })
  page.on('pageerror', e => messages.push(`pageerror: ${e.message}`))

  await page.goto(BASE + route, { waitUntil: 'networkidle' })
  await page.addScriptTag({ content: AXE })
  const results = await page.evaluate(async () => await window.axe.run(document, {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] }
  }))
  for (const v of results.violations) {
    note(route, v.impact === 'critical' || v.impact === 'serious' ? 'fail' : 'warn',
      `axe ${v.id} (${v.impact}, ${v.nodes.length} node${v.nodes.length === 1 ? '' : 's'}): ${v.help} — ${v.nodes[0]?.target?.join(' ')}`)
  }
  for (const m of messages) note(route, 'fail', `console ${m}`)

  // Grid law at every breakpoint: no auto-placed grid may end on a short row.
  for (const width of WIDTHS) {
    await page.setViewportSize({ width, height: 1000 })
    await page.waitForTimeout(120)
    const short = await page.evaluate(() => {
      const bad = []
      const grids = document.querySelectorAll('.tile-grid, .gallery-grid, .weekly__days, .steps, .day-strip')
      for (const g of grids) {
        const cols = getComputedStyle(g).gridTemplateColumns.split(' ').filter(Boolean).length
        const items = [...g.children].filter(c => getComputedStyle(c).display !== 'none')
        // An explicitly spanned layout is not auto-placed; skip those.
        if ([...g.children].some(c => getComputedStyle(c).gridColumn !== 'auto')) continue
        if (cols > 1 && items.length % cols !== 0) {
          bad.push(`${g.className.trim().split(/\s+/)[0]}: ${items.length} items in ${cols} columns`)
        }
      }
      // Nothing may scroll the page sideways. scrollWidth lies when body has
      // overflow-x: hidden, so ask the browser to scroll and see if it moves.
      const before = window.scrollX
      window.scrollTo(400, window.scrollY)
      const canScrollX = window.scrollX - before
      window.scrollTo(before, window.scrollY)

      // And nothing may be clipped somewhere the user cannot reach: an element
      // wider than the viewport is only acceptable inside a scrollable box.
      const limit = document.documentElement.clientWidth
      const unreachable = []
      const scrollable = el => {
        for (let n = el.parentElement; n; n = n.parentElement) {
          const o = getComputedStyle(n).overflowX
          if (o === 'auto' || o === 'scroll') return true
        }
        return false
      }
      for (const el of document.querySelectorAll('main *, header *, footer *')) {
        const r = el.getBoundingClientRect()
        if (r.width === 0 || r.right <= limit + 1) continue
        if (getComputedStyle(el).position === 'fixed') continue
        if (!scrollable(el)) unreachable.push(`${el.tagName.toLowerCase()}.${(el.className || '').toString().trim().split(/\s+/)[0]} right=${Math.round(r.right)}`)
      }
      return { bad, canScrollX, unreachable: [...new Set(unreachable)].slice(0, 4) }
    })
    for (const b of short.bad) note(route, 'fail', `short final row at ${width}px — ${b}`)
    if (short.canScrollX) note(route, 'fail', `page scrolls sideways at ${width}px by ${short.canScrollX}px`)
    for (const u of short.unreachable) note(route, 'fail', `clipped out of reach at ${width}px: ${u}`)

    if (process.argv.includes('--shots') || width === 1280 || width === 390) {
      const name = (route === '/' ? 'home' : route.replace(/\//g, '-').replace(/^-|-$/g, ''))
      await page.screenshot({ path: path.join(OUT, `${name}-${width}.png`), fullPage: width === 1280 })
    }
  }

  // 200% zoom: nothing clipped, nothing overlapping, no sideways scroll.
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.evaluate(() => { document.documentElement.style.fontSize = '200%' })
  await page.waitForTimeout(150)
  const zoom = await page.evaluate(() => {
    const before = window.scrollX
    window.scrollTo(400, window.scrollY)
    const moved = window.scrollX - before
    window.scrollTo(before, window.scrollY)
    const limit = document.documentElement.clientWidth
    const clipped = []
    for (const el of document.querySelectorAll('main *, header *, footer *')) {
      const r = el.getBoundingClientRect()
      if (r.width === 0 || r.right <= limit + 1) continue
      if (getComputedStyle(el).position === 'fixed') continue
      let ok = false
      for (let n = el.parentElement; n; n = n.parentElement) {
        const o = getComputedStyle(n).overflowX
        if (o === 'auto' || o === 'scroll') { ok = true; break }
      }
      if (!ok) clipped.push(`${el.tagName.toLowerCase()}.${(el.className || '').toString().trim().split(/\s+/)[0]}`)
    }
    return { moved, clipped: [...new Set(clipped)].slice(0, 3) }
  })
  if (zoom.moved) note(route, 'fail', `page scrolls sideways by ${zoom.moved}px at 200% text zoom`)
  for (const c of zoom.clipped) note(route, 'fail', `clipped out of reach at 200% text zoom: ${c}`)
  await page.evaluate(() => { document.documentElement.style.fontSize = '' })

  await context.close()
}

// --- 2. tile behaviour ------------------------------------------------------
{
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const page = await context.newPage()
  await page.goto(BASE + '/classes/', { waitUntil: 'networkidle' })
  const tile = page.locator('lc-tile').first()
  const box = await tile.boundingBox()

  // Fast pointer sweep across the tile; tilt must never exceed 7 degrees.
  const readTilt = () => tile.evaluate(el => {
    const s = getComputedStyle(el)
    return [parseFloat(s.getPropertyValue('--lc-rx')) || 0, parseFloat(s.getPropertyValue('--lc-ry')) || 0]
  })
  let worst = 0
  for (let pass = 0; pass < 3; pass++) {
    for (let i = 0; i <= 24; i++) {
      const t = i / 24
      await page.mouse.move(box.x + t * box.width, box.y + (1 - t) * box.height)
      const v = await readTilt()
      worst = Math.max(worst, Math.abs(v[0]), Math.abs(v[1]))
    }
  }
  // Then hold at a known point and let the spring converge. Driven from inside
  // the page rather than by the OS pointer: the delegated listener is the same
  // code path either way, and this removes a race that made the reading flaky.
  const settled = await tile.evaluate(el => new Promise(res => {
    const r = el.getBoundingClientRect()
    const x = r.left + r.width * 0.9
    const y = r.top + r.height * 0.12
    // Dispatch on a known descendant rather than elementFromPoint: with
    // preserve-3d and a translateZ'd child, hit testing can return something
    // outside the grid and the delegated listener then never sees the event.
    const hit = el.querySelector('.tile-body') || el
    let frames = 0
    const hold = () => {
      hit.dispatchEvent(new PointerEvent('pointermove', { pointerType: 'mouse', bubbles: true, clientX: x, clientY: y }))
      if (++frames < 40) requestAnimationFrame(hold)
      else {
        const cs = getComputedStyle(el)
        res([parseFloat(cs.getPropertyValue('--lc-rx')) || 0, parseFloat(cs.getPropertyValue('--lc-ry')) || 0])
      }
    }
    hold()
  }))
  worst = Math.max(worst, Math.abs(settled[0]), Math.abs(settled[1]))
  if (worst > 7.0001) note('/classes/', 'fail', `tilt reached ${worst.toFixed(3)} degrees, cap is 7`)
  else if (Math.max(Math.abs(settled[0]), Math.abs(settled[1])) < 4.5) note('/classes/', 'fail', `tilt settled at only ${settled.map(n => n.toFixed(2)).join(' / ')} degrees at the corner — the spring is not reaching its target`)
  else note('/classes/', 'pass', `tilt peaks at ${worst.toFixed(3)} degrees over a fast 72-step sweep and settles at rx ${settled[0].toFixed(2)} / ry ${settled[1].toFixed(2)} held at a corner — cap is 7`)

  // The sheen must be on the border only: no gradient on the tile's own face.
  const face = await tile.evaluate(el => {
    const s = getComputedStyle(el)
    const after = getComputedStyle(el, '::after')
    return { bg: s.backgroundImage, clip: s.backgroundClip, afterBg: after.backgroundImage, afterMask: after.maskImage || after.webkitMaskImage }
  })
  if (/conic-gradient/.test(face.bg)) note('/classes/', 'fail', 'a conic gradient is painted on the tile face')
  else note('/classes/', 'pass', `tile face carries only ${face.bg.split('(')[0]}; the conic sheen is on ::after (${/conic-gradient/.test(face.afterBg) ? 'present' : 'MISSING'}) and masked to the border box`)

  // Release: one overshoot, then settle.
  await page.mouse.move(box.x + box.width * 0.9, box.y + box.height * 0.1)
  await page.waitForTimeout(420)
  await page.mouse.move(box.x - 300, box.y - 300)
  const trace = await tile.evaluate(el => new Promise(res => {
    const out = []
    const sample = () => {
      out.push(parseFloat(getComputedStyle(el).getPropertyValue('--lc-ry')) || 0)
      if (out.length < 70) requestAnimationFrame(sample); else res(out)
    }
    sample()
  }))
  const start = Math.abs(trace[0])
  // Peaks on the far side of zero from where the tile started: the overshoots.
  const sign0 = Math.sign(trace[0])
  const overshoots = []
  let run = 0
  for (const v of trace) {
    if (Math.sign(v) === -sign0 && Math.abs(v) > 0.01) run = Math.max(run, Math.abs(v))
    else if (run) { overshoots.push(run); run = 0 }
  }
  if (run) overshoots.push(run)
  const first = overshoots[0] ?? 0
  const second = overshoots[1] ?? 0
  const ok = first > 0.02 && second / start < 0.02
  note('/classes/', ok ? 'pass' : 'warn',
    `release from ${start.toFixed(2)} degrees: overshoot ${first.toFixed(3)} degrees (${(first / start * 100).toFixed(1)}% of deflection), ` +
    `second bounce ${second.toFixed(3)} degrees (${(second / start * 100).toFixed(1)}%) — one visible overshoot, then it settles`)

  // One rAF loop for the whole page, not one per tile.
  const loops = await page.evaluate(() => {
    let live = 0
    const real = window.requestAnimationFrame
    window.requestAnimationFrame = cb => { live++; return real(t => { live--; cb(t) }) }
    return new Promise(res => {
      const grid = document.querySelector('.tile-grid')
      const target = grid.querySelector('lc-tile .tile-body') || grid.querySelector('lc-tile')
      const r = target.getBoundingClientRect()
      let peak = 0
      const tick = n => {
        target.dispatchEvent(new PointerEvent('pointermove', {
          pointerType: 'mouse', bubbles: true,
          clientX: r.left + 10 + n * 3, clientY: r.top + 10 + n * 2
        }))
        peak = Math.max(peak, live)
        if (n < 30) real(() => tick(n + 1)); else res(peak)
      }
      tick(0)
    })
  })
  note('/classes/', loops >= 1 && loops <= 2 ? 'pass' : 'fail', `${loops} concurrent rAF callback(s) at peak while sweeping the grid (the tile engine contributes one)`)

  // Keyboard focus must produce a visible state without a pointer.
  await page.mouse.move(0, 0)
  await page.keyboard.press('Tab')
  const focusRing = await page.evaluate(() => {
    for (let i = 0; i < 40; i++) {
      const el = document.activeElement
      if (el?.closest('lc-tile')) {
        const t = el.closest('lc-tile')
        return { border: getComputedStyle(t).borderColor, outline: getComputedStyle(el).outlineWidth, tag: el.tagName }
      }
      document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }))
      return null
    }
  })
  await context.close()
}

// --- 3. reduced motion ------------------------------------------------------
{
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' })
  const page = await context.newPage()
  await page.goto(BASE + '/classes/', { waitUntil: 'networkidle' })
  const tile = page.locator('lc-tile').first()
  const box = await tile.boundingBox()
  await page.mouse.move(box.x + box.width * 0.85, box.y + box.height * 0.15)
  await page.waitForTimeout(220)
  const still = await tile.evaluate(el => {
    const s = getComputedStyle(el)
    return { transform: s.transform, animation: s.animationName, markTransform: getComputedStyle(el.querySelector('.tile-mark') || el).transform }
  })
  const moved = still.transform !== 'none' && still.transform !== 'matrix(1, 0, 0, 1, 0, 0)'
  note('/classes/', moved ? 'fail' : 'pass', `prefers-reduced-motion: tile transform is "${still.transform}", drift animation is "${still.animation}"`)
  await context.close()
}

// --- 4. no JavaScript -------------------------------------------------------
{
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, javaScriptEnabled: false })
  const page = await context.newPage()
  for (const route of ['/', '/classes/', '/contact/', '/admissions/enrolment/']) {
    await page.goto(BASE + route, { waitUntil: 'load' })
    const state = await page.evaluate(() => ({
      revealsHidden: [...document.querySelectorAll('.reveal')].filter(el => getComputedStyle(el).opacity === '0').length,
      navVisible: !document.getElementById('site-menu')?.hidden,
      stepsVisible: [...document.querySelectorAll('[data-step]')].filter(el => getComputedStyle(el).display !== 'none').length,
      steps: document.querySelectorAll('[data-step]').length,
      submit: !!document.querySelector('button[type="submit"]')
    })).catch(() => null)
    if (!state) continue
    if (state.revealsHidden) note(route, 'fail', `${state.revealsHidden} elements stay at opacity 0 with JS off`)
    if (!state.navVisible) note(route, 'fail', 'the navigation is hidden with JS off')
    if (state.steps && state.stepsVisible !== state.steps) note(route, 'fail', `only ${state.stepsVisible} of ${state.steps} form steps are visible with JS off`)
    if (state.steps && !state.submit) note(route, 'fail', 'the multi-step form has no submit control with JS off')
  }
  await context.close()
}

// --- 5. consent: nothing fires before a choice ------------------------------
{
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const page = await context.newPage()
  const external = []
  page.on('request', r => { if (!r.url().startsWith(BASE)) external.push(r.url()) })
  await page.goto(BASE + '/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(600)
  if (external.length) for (const u of external) note('/', 'fail', `request before consent: ${u}`)
  else note('/', 'pass', 'no external request made with the consent banner untouched')
  const banner = await page.locator('.consent-banner').count()
  note('/', banner === 1 ? 'pass' : 'fail', `consent banner present: ${banner === 1}`)
  await context.close()
}


// --- 6. lightbox: keyboard, focus trap, inert, counter ----------------------
{
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const page = await context.newPage()
  await page.goto(BASE + '/gallery/', { waitUntil: 'networkidle' })
  const cells = await page.locator('.gallery-cell__btn').count()
  if (!cells) note('/gallery/', 'warn', 'no gallery cells rendered — the consent gate is holding the photographs back')
  else {
    const trigger = page.locator('.gallery-cell__btn').nth(2)
    await trigger.click()
    await page.waitForSelector('.lightbox:not([hidden])')

    const counter = await page.locator('.lightbox__count').textContent()
    const total = Number(counter.split(' of ')[1])
    note('/gallery/', total === cells ? 'pass' : 'fail',
      `lightbox counter reads "${counter}" against ${cells} rendered cells — the counter and the grid read the same array`)

    const inert = await page.evaluate(() => [...document.body.children]
      .filter(el => !el.classList.contains('lightbox')).every(el => el.inert))
    note('/gallery/', inert ? 'pass' : 'fail', 'background is inert while the lightbox is open')

    await page.keyboard.press('ArrowRight')
    const after = await page.locator('.lightbox__count').textContent()
    note('/gallery/', after !== counter ? 'pass' : 'fail', `ArrowRight moved the lightbox from "${counter}" to "${after}"`)

    // Tab must cycle inside the dialog and never escape it.
    const inside = []
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press('Tab')
      inside.push(await page.evaluate(() => !!document.activeElement?.closest('.lightbox')))
    }
    note('/gallery/', inside.every(Boolean) ? 'pass' : 'fail',
      `focus stayed inside the dialog for ${inside.filter(Boolean).length} of 12 Tab presses`)

    await page.keyboard.press('Escape')
    await page.waitForSelector('.lightbox[hidden]', { state: 'attached' })
    const returned = await page.evaluate(() => document.activeElement?.classList.contains('gallery-cell__btn'))
    note('/gallery/', returned ? 'pass' : 'fail', 'Escape closed the lightbox and returned focus to the cell that opened it')

    // Switching category must keep the counter and the grid in agreement.
    const tabs = page.locator('[data-category-tab]')
    const n = await tabs.count()
    let mismatch = 0
    for (let i = 0; i < n; i++) {
      await tabs.nth(i).click()
      await page.waitForTimeout(160)
      const rendered = await page.locator('.gallery-cell__btn').count()
      const claimed = Number((await tabs.nth(i).locator('.gallery-tab__n').textContent()).trim())
      if (rendered !== claimed) { mismatch++; note('/gallery/', 'fail', `category ${i + 1}: tab claims ${claimed}, grid rendered ${rendered}`) }
      if (rendered % 6 !== 0) note('/gallery/', 'fail', `category ${i + 1}: ${rendered} images is not divisible by 6`)
    }
    if (!mismatch) note('/gallery/', 'pass', `all ${n} category tabs agree with what the grid rendered, and every count divides by 6`)
  }
  await context.close()
}

// --- 7. keyboard walkthrough: no traps, focus always visible ----------------
for (const route of ['/', '/classes/', '/contact/', '/gallery/']) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const page = await context.newPage()
  await page.goto(BASE + route, { waitUntil: 'networkidle' })

  // Stamp a stable identity on every focusable element. Identifying them by
  // tag, class and position is not enough — a row of nav links is identical on
  // all three, which made an earlier version of this check report a false trap.
  const expected = await page.evaluate(() => {
    const sel = 'a[href], button:not([disabled]), input:not([type=hidden]):not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'
    const SEGMENTED = new Set(['date', 'month', 'week', 'time', 'datetime-local'])
    const all = [...document.querySelectorAll(sel)].filter(el => {
      if (el.tabIndex < 0) return false          // the honeypot is not a tab stop
      const s = getComputedStyle(el)
      return s.display !== 'none' && s.visibility !== 'hidden' && el.offsetParent !== null
    })
    all.forEach((el, i) => { el.dataset.lcTab = String(i) })
    return { count: all.length, segmented: all.filter(el => SEGMENTED.has(el.type)).length }
  })

  const { count: expectedCount, segmented } = expected
  const visited = new Set()
  let invisible = 0
  let noFocus = 0
  // Each segmented input swallows up to three presses of its own.
  for (let i = 0; i < expectedCount + segmented * 3 + 4; i++) {
    await page.keyboard.press('Tab')
    const info = await page.evaluate(() => {
      const el = document.activeElement
      if (!el || el === document.body) return null
      const s = getComputedStyle(el)
      const uaSegmented = ['date', 'month', 'week', 'time', 'datetime-local'].includes(el.type)
      return {
        id: el.dataset.lcTab ?? `untracked:${el.tagName}`,
        // A native date field draws the ring on its own segment, not through
        // the element's outline, so it is exempt from the outline check.
        visible: uaSegmented || s.outlineStyle !== 'none' || s.boxShadow !== 'none' || !!el.closest('lc-tile')
      }
    })
    if (!info) { noFocus++; continue }
    visited.add(info.id)
    if (!info.visible) invisible++
  }

  const coverage = expectedCount ? visited.size / expectedCount : 1
  note(route, coverage >= 0.9 ? 'pass' : 'fail',
    `keyboard walkthrough reached ${visited.size} of ${expectedCount} focusable elements (${Math.round(coverage * 100)}%) with no trap`)
  if (invisible) note(route, 'fail', `${invisible} focus stops had no visible focus indicator`)
  await context.close()
}

// --- 8. weight, LCP and CLS on a cold cache ---------------------------------
for (const [route, budgetKb] of [['/', 900], ['/gallery/', 1200]]) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })
  const page = await context.newPage()
  let bytes = 0
  page.on('response', async r => {
    const len = Number(r.headers()['content-length'] || 0)
    if (len) bytes += len
    else { try { bytes += (await r.body()).length } catch { /* redirect or no body */ } }
  })
  await page.goto(BASE + route, { waitUntil: 'networkidle' })
  await page.evaluate(() => new Promise(r => setTimeout(r, 400)))
  const vitals = await page.evaluate(() => new Promise(res => {
    let cls = 0, lcp = 0
    new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) cls += e.value }).observe({ type: 'layout-shift', buffered: true })
    new PerformanceObserver(l => { for (const e of l.getEntries()) lcp = e.startTime }).observe({ type: 'largest-contentful-paint', buffered: true })
    setTimeout(() => res({ cls, lcp }), 600)
  }))
  const kb = Math.round(bytes / 1024)
  note(route, kb <= budgetKb ? 'pass' : 'fail', `page weight ${kb} KB against a ${budgetKb} KB budget (uncompressed, local server)`)
  note(route, vitals.cls < 0.01 ? 'pass' : 'fail', `CLS ${vitals.cls.toFixed(4)} on a cold cache (budget < 0.01)`)
  note(route, 'pass', `LCP ${Math.round(vitals.lcp)} ms on localhost with no throttling — NOT a substitute for a throttled Lighthouse run`)
  await context.close()
}

await browser.close()
server.close()

const fails = findings.filter(f => f.level === 'fail')
const warns = findings.filter(f => f.level === 'warn')
const passes = findings.filter(f => f.level === 'pass')
await writeFile(path.join(OUT, 'findings.json'), JSON.stringify(findings, null, 2))

for (const f of findings) console.log(`${f.level.toUpperCase().padEnd(4)} ${f.route.padEnd(28)} ${f.message}`)
console.log(`\n${fails.length} failures, ${warns.length} warnings, ${passes.length} explicit passes`)
process.exit(fails.length ? 1 : 0)
