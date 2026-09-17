# Little Caterpillars

A rebuild of **littlecaterpillars.co.za** — Nursery School | Creche | Preschool,
Midrand, Gauteng. Ages 3 months – 6 years.

Hand-written HTML, CSS and ES modules. No framework, no jQuery, no Bootstrap,
no page builder. Nothing from `node_modules` is served except two self-hosted
WOFF2 font files.

```
npm install
npm run build      # -> dist/
npm run serve      # http://localhost:4321
npm test           # grid-law and catalogue assertions
npm run check      # assertions + build + HTML/SEO checks
npm run images     # image pipeline (needs source-images/)
node tools/todo.js # regenerate TODO_CONFIRM.md
```

Node 20 or newer.

---

## What this is a rebuild of

The original site was deleted. Two Wayback captures are the source of truth for
content:

- `web.archive.org/web/20190907074744/http://littlecaterpillars.co.za/`
- `web.archive.org/web/20220123202930/https://www.littlecaterpillars.co.za/`

**Nothing outside those captures is stated as fact.** Anything that could not be
sourced is rendered on the page as a visible `To confirm:` note and collected in
[TODO_CONFIRM.md](TODO_CONFIRM.md) — 34 open questions at the time of writing.
No phone numbers, prices, staff names, hours, accreditations, testimonials or
review counts have been invented.

Three additions came from the school directly in September 2026, not from the
archive: the Class Routine, the Weekly Programme and the two menus. Those are
transcribed in `src/content/programme.json` and are the only content on the site
newer than the captures.

---

## Photography

**The source photographs are not in this repository and must not be added to
it.** This repository is public and the photographs are of children at a
registered childcare centre.

The pipeline reads from `source-images/`, which is git-ignored:

```
source-images/              <- the school's originals, supplied out of band
  consent-register.json     <- { "IMG-1234.jpg": "CONSENT-2026-014", ... }
dist/gallery/               <- generated, also git-ignored
```

`npm run images` will:

1. **Dedupe** perceptually (dHash, Hamming ≤ 6) before spending work on a frame.
2. **Strip all metadata.** GPS coordinates on preschool photographs are a
   child-safety problem before they are a POPIA one.
3. **Auto-level** and grade gently warm, so a mixed WhatsApp set reads as one
   shoot rather than forty different phones.
4. **Smart-crop** every grid cell to a single 4:5 portrait with faces kept in
   frame. The lightbox serves the uncropped original.
5. Emit **AVIF + WebP + JPEG** at 400/800/1200/1600w with a 20px LQIP.
6. Write `src/content/gallery-manifest.json`.

### The consent gate

`gallery-manifest.json` carries a `consentRef` per published image. **A build
with any empty `consentRef` will not publish the gallery** — `npm test` fails and
`npm run build` renders the gallery page as a short explanation instead.

That is deliberate. No child's face goes on this site without written parental
consent on file. To preview locally without the register:

```bash
LC_ALLOW_PENDING_CONSENT=1 npm run build
```

Never set that in CI or on a deploy.

Removing one photograph is one line: delete its entry from
`tools/catalogue.js`, re-run `npm test`, and the grid law will tell you
immediately if the category no longer divides by six.

---

## The grid law

> Every gallery block must be perfectly rectangular at every breakpoint.

3 columns desktop, 2 tablet, 1 mobile — so every category's image count must be
divisible by **6**. This is enforced in code, not by eye:

- `tools/assert-grid.js` fails the build and names the offending category and
  the delta.
- `src/scripts/gallery.js` renders a red banner on `localhost` if a rendered
  grid ends on a short row at the current breakpoint.
- The lightbox counter reads the same array the grid renders from, so "7 of 12"
  cannot disagree with what is on screen.

The fixed grids — 5 classes, 6 teachers, 8 gallery covers — are laid out
explicitly rather than left to an auto grid. The classes grid is a deliberate
wide-feature-plus-2+2 arrangement with the Baby Centre as the feature card; it
is never 3+2 by accident.

---

## Layout of the repository

```
src/
  content/       site.json, copy.json, programme.json, gallery-manifest.json
  pages/         one module per route
  partials/      layout, components, icons
  scripts/       client ES modules  (~24 KB raw, well under the 60 KB budget)
  styles/        fonts, tokens, base, tile, layout, pages
tools/
  build.js       the static builder
  check.js       HTML, SEO, a11y and redirect assertions
  images.js      the image pipeline
  dhash.js       perceptual hash
  catalogue.js   the hand-written image catalogue: category + alt per image
  assert-grid.js the grid law and the consent gate
  redirects.js   the old-URL map
  todo.js        harvests every open question into TODO_CONFIRM.md
```

## The tile

Every card, panel and tile on the site is one component, `<lc-tile>`:

- Glass fill clipped to the padding box; the sheen is a masked conic gradient on
  the **border only**. The face of the tile never gets a shine sweep in any
  state.
- Tilt caps at **7°**. Content parallaxes in Z (mark 40px, heading 24px, body
  12px) — that is what sells the depth, not the rotation.
- Spring physics, not CSS easing. Near-critical damping while following the
  pointer; under-damped on release, so it overshoots **once** and settles.
- **One** `requestAnimationFrame` loop for the whole page, driven from a
  registry, with one delegated `pointermove` per grid and an
  `IntersectionObserver` unregistering off-screen tiles.
- Only custom properties are written per frame. No layout property is touched.
- `@media (hover: none)` disables tilt entirely — tilt-on-scroll is motion
  sickness — and substitutes a 0.985 press state.
- `prefers-reduced-motion: reduce` kills tilt, drift and parallax outright.

## Environment

Nothing is required to build. To deploy you will need:

| Variable | Used for |
|---|---|
| `LC_ALLOW_PENDING_CONSENT` | Local preview only. Never set in CI. |

And in `src/content/site.json`, the GTM container ID. Form endpoints
(`/api/visit`, `/api/enrolment`, `/api/swimming`) are not in this repository —
see [TAGGING.md](TAGGING.md) for what the handler must do.

## Deploy

`dist/` is a plain static directory. `_redirects` (Netlify-style) and
`.htaccess` (Apache) are both written by the build from `tools/redirects.js`.

Decide `www` vs apex **once** and 301 the other. HTTPS only; the `.htaccess`
sets HSTS.

## Further reading

- [TODO_CONFIRM.md](TODO_CONFIRM.md) — every open question, in one list
- [TAGGING.md](TAGGING.md) — events, consent mode, GA4 and Ads
- [AUDIT.md](AUDIT.md) — the self-audit, both passes
- [REDIRECTS.csv](REDIRECTS.csv) — the old-URL map
