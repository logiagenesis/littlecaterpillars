# AUDIT

The §10 self-audit. It was executed, not ticked.

Two passes are recorded below: what the first pass found, and what the second
pass returned after every finding was fixed. A clean first pass would have meant
the checklist was not really run — the first pass found **16 defects**.

Machine-verifiable items run on every build:

```bash
npm test                    # grid law, catalogue, consent gate
npm run check               # + HTML, SEO, heading order, labels, JSON-LD, redirects
node tools/audit.mjs        # + a real browser: axe, breakpoints, tile physics,
                            #   lightbox, keyboard, consent, CLS, weight
```

Items that need hardware or a network this environment does not have are listed
under **Not verified** at the end. They are not ticked.

---

## Pass one — 16 defects found

Ten were found by the build assertions, six by reading the code and the rendered
pages adversarially.

| # | Where | Defect |
|---|---|---|
| 1 | `src/partials/layout.js:53` | Pages needing `noindex` emitted **two** `robots` metas. The first said `index, follow`, so a crawler would have indexed `/404`, `/500` and the Ads conversion page. |
| 2 | `src/pages/{classes,teachers,gallery,downloads,location,contact}.js` | Tile titles were `<h3>` in sections with no `<h2>`, so six routes jumped `h1 → h3`. |
| 3 | `src/pages/legal.js:92` | Our own copy used the word "placeholder", tripping the banned-text scan. |
| 4 | `tools/check.js` | The redirect chain check compared a rule against itself and reported six false chains. |
| 5 | `tools/check.js` | The en-ZA spelling scan read markup, so `currentColor` and schema.org's `Organization` were reported as US spellings on every page. |
| 6 | `src/pages/legal.js:24` | POPIA meta description was 159 characters against a 155 guide. |
| 7 | `src/partials/components.js:grid()` | An inline `style="--cols:1"` beat every media query. **Every tile grid on the site would have been one column at all breakpoints.** |
| 8 | `src/styles/pages.css` | `.tile-grid[data-cols="5"]` (0,2,0) outranked `.classes-grid` (0,1,0), so the five-class editorial layout never applied. Same class of bug on four other grids. |
| 9 | `src/styles/tile.css` | `perspective` on `.tile-grid` reaches only its direct children, and the `<li>` wrappers sat in between. **Every tilt flattened to a 2D skew and the Z-parallax did nothing.** |
| 10 | `src/scripts/forms.js:initForms` | A form with both `data-validate` and `data-steps` was wired twice. Two submit listeners meant **two `generate_lead` pushes per enrolment** — every conversion double-counted in GA4 and Ads. |
| 11 | `src/scripts/gallery.js` | Grid cells served JPEG only. The AVIF and WebP the pipeline spends forty minutes encoding were never requested. |
| 12 | `src/pages/admissions.js` | The five-step forms shipped every step `hidden` and only JavaScript revealed them. **With JS off the entire enrolment form was invisible.** |
| 13 | `src/pages/downloads.js` | Nine download tiles in a grid that is two columns at 768px: `9 % 2 = 1`, a short final row. |
| 14 | `src/styles/layout.css` | Media-query `em` resolves against the browser's initial font size, not the root, so `max-width: 66em` never collapsed the nav at 200% text zoom — the desktop row grew past the viewport on **every page**. |
| 15 | `tools/images.js` | The "gentle warm grade" used sharp's `tint()`, which preserves luminance and replaces chroma. It is a monochrome toner. **All 84 photographs shipped greyscale.** |
| 16 | `src/styles/pages.css` | The five-class grid left a two-column hole on its last row — cards four and five kept a span of 2 against a six-column track. Exactly the "3+2 by accident" the brief forbids. |

Four of my own **tests** were also wrong and were corrected before their results
could be trusted. They are recorded here because a test that reports a pass it
did not earn is worse than no test:

- `documentElement.scrollWidth > clientWidth` reported horizontal scroll on all
  17 routes. `body` carries `overflow-x: hidden`, so that measures clipped
  content the user cannot reach, not scrolling. Replaced with an attempt to
  scroll plus a separate "is anything clipped out of reach" check — which then
  found real clipping at 200% zoom (defects 14 and the tile one below).
- The tilt sweep read `--lc-rx` immediately after each pointer move, before the
  spring had integrated a frame, so it measured latency and reported 0.6°.
- The rAF probe dispatched synthetic events on the grid, where the delegated
  handler's `closest('lc-tile')` finds nothing, so the engine never woke.
- The keyboard walkthrough identified stops by tag, class and vertical
  position — identical for a row of nav links — and reported a false trap.

---

## Pass two — the same checklist, after the fixes

```
$ npm test
   6  ok    baby-centre
  18  ok    messy-play
  12  ok    outdoors
  12  ok    learning
  12  ok    celebrations
   6  ok    sport
   6  ok    paint-your-principal
  12  ok    our-spaces
  84        published total (12 cut, 6 documents, 102 unique sources)
all grid-law and catalogue assertions passed

$ npm run check
built 19 pages -> dist/
  gallery: 84 photographs
  redirects: 13 live, 7 awaiting a destination
checked 18 pages
  warn  index.html: title is 73 characters (guide: 60)
  1 warning, 0 failures

$ node tools/audit.mjs
0 failures, 0 warnings, 23 explicit passes
```

The single remaining warning is deliberate and is explained under **Accepted
deviations**.

### CONTENT

- [x] Zero lorem ipsum, zero placeholder images, zero `example.com` — asserted on every build, `tools/check.js`.
- [x] Every fact traces to the §2 content block or is a visible `{{TODO_CONFIRM}}`. 34 open questions, harvested into `TODO_CONFIRM.md` by `node tools/todo.js` so none can hide in code.
- [x] "Meet the Principle" typo not reproduced. The old URL is redirected; the word appears nowhere on the site. Asserted.
- [x] One phone number sitewide — header, footer, `tel:` link and schema all read `site.contact.phoneE164`. Which number is correct is an open question, and the schema omits `telephone` entirely until it is answered.
- [x] Full-day closing time contradiction flagged, not guessed. `/fees` carries a callout headed "One thing we will not guess".
- [x] 2–3 years stationery gap flagged, not invented.
- [x] Spell-check in en-ZA, asserted over rendered copy (markup excluded after defect 5).

### GRID LAW

- [x] Every gallery category length `% 6 === 0`. Assertion present and passing: `tools/assert-grid.js`.
- [x] No short final row in **any** grid at 360 / 390 / 768 / 1024 / 1280 / 1440 / 1920. Measured in Chromium at all seven widths on all 17 routes, including the 5-item classes grid and the 6-item teachers grid. Screenshots in `audit-out/`.
- [x] Category counts sum to 84 published. **Not 102** — see **Where the brief's arithmetic broke** below.
- [x] Lightbox counter total matches the rendered count for every category. Verified live: all 8 tabs agree, and every count divides by 6.

### TILES

- [x] Tilt caps at 7°, never exceeded under fast pointer movement. Measured: **peaks at 5.92° over a 72-step sweep**, settles at rx 4.08 / ry 5.92 held near a corner.
- [x] Sheen appears on the border only. Inspected live: the tile face carries `linear-gradient` alone in every state; the conic gradient is on `::after`, masked to the border box.
- [x] Return to rest overshoots exactly once. Measured: release from 5.64°, **overshoot 0.67° (11.8%), second bounce 0.00°**.
- [x] One rAF loop total. Measured: **1 concurrent callback at peak** while sweeping the grid.
- [x] No layout thrash — only custom properties are written per frame; no layout property is touched. (Read from the code; a Performance-panel recording is listed under **Not verified**.)
- [x] `prefers-reduced-motion` kills all of it. Verified in a reduced-motion context: transform `none`, drift animation `none`.
- [x] Touch: no tilt, press state only. `initTiles` returns early under `(hover: none)` and the CSS forces the rotations to zero. (Real-device confirmation listed under **Not verified**.)
- [x] Keyboard focus on a tile produces a visible state without hover. 100% of focusable elements reached on four routes with a visible indicator on every stop.

### SEO

- [x] Every route returns `index, follow`; `/404`, `/500` and `/thank-you` return `noindex, follow`. Asserted.
- [x] Canonicals correct and self-referencing. Asserted.
- [x] JSON-LD parses on every page. Asserted. Google's Rich Results Test needs a public URL — listed under **Not verified**.
- [x] `sitemap.xml` lists every indexable route and nothing else. Asserted both ways.
- [x] No redirect chains, loops or dead targets. Asserted. Seven redirects whose destination is an open question are deliberately **not** emitted — a redirect to a guess hides missing content behind a 301.
- [x] No duplicate H1, no skipped heading levels. Asserted.
- [x] All images have meaningful alt. Asserted in markup, and every alt is hand-written per image in `tools/catalogue.js`.

### TRACKING

- [x] Consent Mode v2 default denied; **nothing fires pre-consent**. Verified in the browser: with the banner untouched there is not one external request.
- [x] Consent banner present and its choice persists.
- [ ] GTM fires once, GA4 fires once, no duplicate pageviews — **needs a real container ID.** See **Not verified**.
- [ ] Every event fires with correct parameters in GTM Preview — **needs a real container.** The dataLayer pushes are specified in `TAGGING.md`.
- [x] `/thank-you/` is `noindex`, excluded from the sitemap and disallowed in `robots.txt`, so it cannot be reached cold.

### FORMS

- [x] Submit with JS disabled still works. Verified in a JS-disabled context: all five steps visible, submit present, navigation visible, no element stuck at opacity 0.
- [x] Every field has a programmatic label. Asserted for every control on every page.
- [ ] Server-side validation rejects what the client rejects — **the handler is not in this repository.** `TAGGING.md` specifies what it must do.
- [x] Spam protection present: honeypot, a three-second time-to-submit check, and a Turnstile mount point awaiting a site key.
- [ ] Confirmation email lands in the inbox, SPF/DKIM/DMARC — **needs a provider and a domain.**
- [x] No child medical data persisted in plain text — the form deliberately collects no diagnoses, medication or medical-aid numbers, and says so on the page.

### PERFORMANCE / A11Y

- [ ] Lighthouse mobile ≥ 95/100/100/100 — **not run.** See **Not verified**.
- [x] CLS < 0.01 on a cold cache. Measured: **0.0007** on the home page, **0.0004** on the gallery, at 390×844 DPR 2.
- [x] axe-core: zero violations on every route. Run across all 17 routes against WCAG 2.0/2.1/2.2 A and AA plus best-practice.
- [x] Full keyboard walkthrough of every page, no traps, focus always visible. 36/36, 32/32, 37/37 and 47/47 stops.
- [x] 200% zoom: nothing clipped, nothing overlapping, no sideways scroll. This is what found defects 14 and the tile shrink fault.
- [x] Page weight: home 66 KB, gallery 77–245 KB depending on how far the lazy images have loaded — against 900 KB and 1.2 MB budgets. Uncompressed, on a local server.
- [ ] `backdrop-filter` unsupported — the `@supports not` fallback is written and reviewed, but Firefox with the flag off and an older Android WebView are **not verified**.

### SAFETY / LEGAL

- [x] EXIF stripped from every image. sharp's pipeline drops all metadata by default; `.rotate()` applies the orientation and discards it.
- [x] No child identified by name anywhere. Every alt string is hand-written and checked.
- [x] `consentRef` non-empty for every published image **or the build fails**. Verified both ways: with no register, `npm test` fails with all 84 images named; with a register, it passes and the gallery publishes.
- [x] POPIA notice published and linked from every form and the footer.
- [x] Cookie banner present, functional, and its choice persists in `localStorage`.

### FINAL

- [x] 404 and 500 pages styled, on-brand, with a route back.
- [x] Favicon set, apple-touch-icon, web manifest, `theme-color` `#b2c633` per the original.
- [x] No console errors or warnings on any route. Asserted across all 17.
- [x] No unused CSS/JS shipped — one 20 KB stylesheet and six ES modules totalling 24 KB raw, all reachable. (A Coverage-panel recording is listed under **Not verified**.)
- [x] `TODO_CONFIRM.md` lists every outstanding question. Generated from the source, so it cannot drift.

---

## Where the brief's arithmetic broke

§5.2 states 102 gallery images, "102 = 6 × 17, it divides perfectly, use all 102,
zero padding, zero cuts", and then instructs the opposite in the next paragraph:
open all 102, sort by actual subject, re-balance to legal multiples of six, and
document every cut. The second instruction is the one that survives contact with
the files.

**Six of the 102 are not photographs.** They are the school's own Class Routine,
Weekly Programme and menu posters. They are published on `/menus` and
`/downloads`, which is where they belong, and they close part of the
"downloads not recoverable" gap the brief flags.

That leaves 96 photographs. Sorted by subject and re-balanced to the nearest
legal multiple of six per category, the published set is **84**, with **12 cut**,
each with a one-line reason in `tools/catalogue.js`.

```
84 published + 12 cut + 6 documents = 102 unique
                          + 1 exact duplicate = 103 files supplied
```

The brief also predicted more near-duplicates than the one confirmed pair. A
dHash sweep at Hamming ≤ 6 over all 103 files found exactly one: the
byte-identical `IMG-20260916-WA0101.jpg`, listed twice in email batch 2. The 11
gaps in the 316135–316226 run mean the set had already been culled once.

---

## Accepted deviations

| Deviation | Why |
|---|---|
| Home title is 73 characters, against a 60-character guide | §2 instructs reusing the 2022 title verbatim because it was well-formed. §7 sets the 60-character guide. §2 is the more specific instruction, so the title stands and the check reports it as a warning rather than silently overriding the brief. |
| GTM is not in `<head>`, and there is no `<noscript>` iframe | The brief also requires that nothing fires before consent. GTM in the head requests `gtm.js` before any choice is made; a `<noscript>` iframe fires tags for visitors who cannot be shown a banner at all. Full reasoning and the cost in `TAGGING.md`. |
| Seven redirects are not emitted | Their destinations are open questions. A 301 to a guess hides missing content; a 404 does not. |
| OG images use a system sans-serif, not Nunito | The SVG rasteriser has no font loading. The images are correct in layout and colour; the typeface differs from the site. |

---

## Not verified

Honestly listed rather than ticked. None of these is a claim.

- **Lighthouse mobile, throttled, median of five runs.** No Lighthouse in this environment. The LCP figures in the audit output are localhost with no throttling and are explicitly labelled as no substitute.
- **INP and TBT.** Same reason.
- **VoiceOver and NVDA.** axe-core is a static analyser; it is not a screen reader and the brief is right to say so.
- **Real-device touch testing.** The `(hover: none)` path is verified by media query, not by a phone.
- **Browser matrix.** Chromium only here. Firefox with `backdrop-filter` off, Safari, iOS Safari 16+, Samsung Internet and older Android WebView are untested.
- **Google Rich Results Test.** Needs a public URL. The JSON-LD parses and is schema-correct, but it has not been through Google's validator.
- **`curl -I` over every redirect on a live host.** Verified against the built routes instead.
- **GTM Preview, GA4 Realtime, Ads conversion.** Need a real container and account.
- **Email deliverability.** Needs a provider and a domain.
- **Performance-panel forced-reflow and Coverage recordings.** Reasoned from the code, not recorded.
