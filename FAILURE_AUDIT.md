# Failure Audit

Initial audit date: 2026-09-17
Second pass date: 2026-09-17
Branch: `rescue/liquid-glass-rebuild`

This is the first audit, recorded before implementation changes. The working tree
was clean. `npm test` passed the existing grid-law checks, but that check does not
cover the rejected build requirements below.

## Confirmed failures

| # | Failure | Evidence |
|---|---|---|
| 1 | Glass tiles render flat and generic in the rejected screenshots. | Shared tile markup is present in `src/partials/components.js:9-15`, but the current surface treatment is only a translucent background and generic shadow in `src/styles/tile.css:42-106`; screenshot review still reports the tiles as flat. |
| 2 | Dials render as plain badges rather than premium iOS glass controls. | No `lc-dial` implementation was found in `src/`, while the requested reusable control is absent from the current component surface. |
| 3 | The reflective rim is missing or too weak. | The current rim is a low-opacity `lc-tile.has-edge::after` treatment in `src/styles/tile.css:99-133`; screenshot review reports that the border sheen is not visibly reflective and must not spill onto the tile face. |
| 4 | TODO tokens have been rewritten as visible `To confirm:` prose instead of preserving literal tokens. | `src/pages/downloads.js:39` writes prose directly; the built output contains the same prose in `dist/fees/index.html:67` and other public pages. Literal tokens still exist in source, but the rendered contract is not preserved. |
| 5 | Gallery total is wrong for the required build contract. | `src/content/gallery-manifest.json:3-4` records 103 source files and 102 unique files, but `src/content/gallery-manifest.json:59` onward contains 84 published entries; `npm test` reports `84 published total (12 cut, 6 documents, 102 unique sources)`. The gallery is neither 102 published images nor blocked. |
| 6 | Gallery consent enforcement is incomplete at build level. | `tools/build.js:51-57` warns and withholds output when published entries lack `consentRef`; it does not fail the build. The required hard failure is also absent from the current build contract. |
| 7 | Hero child photo is not proven safe by consent metadata. | Hero image selection and consent gating were not found in the initial content/build checks; the current audit has no assertion tying a hero child photo to a non-empty `consentRef`. This remains a release blocker until the hero asset is removed or explicitly gated. |
| 8 | Class copy is too thin. | `src/content/copy.json:37` contains a TODO token in the Ladybug class body instead of source-brief class copy; the existing grid check only verifies five class items and does not verify copy completeness. |
| 9 | Cookie banner looks cheap and blocks the design. | Banner markup is in `src/scripts/consent.js:58-61`; no visual audit currently asserts its layout, hierarchy, or non-blocking behavior. The rejected screenshots report the banner as visually intrusive. |
| 10 | The site still feels like a template. | The shared surface and repeated layout are implemented through generic tile styles in `src/styles/tile.css:42-75`; no current visual audit proves a distinctive finished system. This is corroborated by the rejected screenshots, not by a content assertion. |

## Additional release blockers found during inspection

| Failure | Evidence |
|---|---|
| Public output contains `noindex`, contrary to the stated public-page requirement. | `src/partials/layout.js:53` emits `noindex` whenever `page.noindex` is true; `src/pages/thankyou.js:8` and `src/pages/errors.js:4,31` set it, and `dist/thank-you/index.html:8` contains the resulting meta tag. |
| Analytics helper is named and shaped as `gtag`, requiring an explicit GTM-only audit. | `src/scripts/consent.js:14-17,33` defines and calls `gtag`; no hardcoded GA4 tag was found in the initial grep, but the implementation must be checked against the GTM-only requirement. |
| Gallery category and consent/alt invariants are not all enforced by the existing command. | `npm test` only reports grid-law/catalogue assertions; `package.json:7-8` exposes no dedicated content, gallery, SEO, accessibility, performance, or motion audit commands. |
| Server-side form validation is not present in this repository. | Forms post to `/api/visit` and `/api/enrolment` in `src/pages/contact.js:24` and `src/pages/admissions.js:197`, while `TAGGING.md:98-105` describes the server-side handlers as still to build. |

## Initial checks

```text
pwd
/workspaces/littlecaterpillars

git status --short
(clean)

npm test
all grid-law and catalogue assertions passed
84 published total (12 cut, 6 documents, 102 unique sources)
```

The requested `rg` command was attempted but `rg` is not installed in the
container; the equivalent repository search was run with `grep -RInE`.

---

# Second pass — 2026-09-17

Run from a clean checkout of `rescue/liquid-glass-rebuild` at `7e09bde`, on
Node v22.22.2, with `npm install` from the committed lockfile. **No
`source-images/` directory**, because it is git-ignored and the photographs are
supplied out of band — that is the permanent state of this repository for
everyone except whoever holds the originals.

That distinction turns out to be the whole story of this pass.

## Commands run

```text
$ npm test
84 published total (12 cut, 6 documents, 102 unique sources)
all grid-law and catalogue assertions passed
                                                        exit 0

$ npm run check
built 19 pages -> dist/
  gallery: 84 photographs
  redirects: 13 live, 7 awaiting a destination
checked 18 pages
  warn  index.html: title is 73 characters (guide: 60)
  1 warning, 0 failures
                                                        exit 0

$ node tools/audit.mjs                                   (before the fix below)
node:_http_server:354
Error [ERR_HTTP_HEADERS_SENT]: Cannot write headers after they are sent
    at Server.<anonymous> (tools/audit.mjs:44:17)
                                                        exit 1  — CRASH

$ node tools/audit.mjs                                   (after the fix below)
8 failures, 0 warnings, 23 explicit passes
                                                        exit 1
```

`npm test` and `npm run check` reproduce AUDIT.md's recorded pass-two output
exactly. The third command did not run at all.

## B1 — the browser audit could not run in any clean checkout

`tools/audit.mjs` served its static files like this:

```js
res.writeHead(200, { 'content-type': ... })
res.end(await rf(file))          // <- awaited AFTER the 200 was already sent
} catch { res.writeHead(404); ... }
```

The 200 goes out before the file is read. When `rf()` rejects, the `catch` tries
to write a second set of headers, Node throws `ERR_HTTP_HEADERS_SENT` from inside
an async request handler, and the process dies — taking the browser, the findings
array and the exit code with it.

Any missing asset was therefore fatal, and in a checkout without
`source-images/` the gallery derivatives are *always* missing. **The one command
that carries the §10 checklist's browser-side evidence has never been runnable by
anyone who does not hold the school's photographs.**

Fixed in this commit: read the body first, then send headers; 404s are now
recorded and reported rather than being fatal.

## B2 — what the audit says once it can run

With the harness repaired, on the same clean checkout:

```
8 failures, 0 warnings, 23 explicit passes
```

All 8 failures are the absent photographs and nothing else:

```
FAIL /          console error: Failed to load resource: 404
FAIL /gallery/  console error: Failed to load resource: 404   (x6)
FAIL (assets)   91 requests under /gallery/ returned 404
```

The 23 passes are the same 23 AUDIT.md records, with the same numbers — tilt
peaks at **5.911°** against its claimed 5.92, settling at rx 4.09 / ry 5.91
against its claimed 4.08 / 5.92. Those figures reproduce. AUDIT.md's
`0 failures, 0 warnings, 23 explicit passes` is consistent with a genuine run on
a machine that had the photographs present, and this pass found no sign that any
of it was invented.

It is, however, **unreproducible evidence**: it requires a private asset set, and
the screenshots it cites in `audit-out/` are git-ignored. No reviewer can check
it. That is a weakness of the evidence, not of the site.

## B3 — the child-image consent gate was disarmed on the deploy path

This is the finding that matters most, and it is new since the first pass.

README.md § Photography, on `LC_ALLOW_PENDING_CONSENT`:

> Never set that in CI or on a deploy.

`.github/workflows/pages.yml`, added in `7e09bde`, the most recent commit:

```yaml
      - name: Build site
        run: npm run build
        env:
          BASE_PATH: /littlecaterpillars
          LC_ALLOW_PENDING_CONSENT: '1'
```

The deploy workflow set exactly the variable the README forbids on a deploy.

Worse, the gate would not have fired there in any case. Measured by blanking one
`consentRef` and running both commands:

| Command | Behaviour with a missing `consentRef` | Exit |
|---|---|---|
| `npm test` | `child-safety gate: 1 published images have an empty consentRef` | **1** |
| `npm run build` | `gallery withheld` warning, gallery withheld, build continues | **0** |

The hard gate lives only in `assert-grid.js`, which `npm test` runs. **`pages.yml`
never ran `npm test`** — it went straight from `npm ci` to `npm run build`, which
only warns. So the deploy pipeline had no hard consent gate at all, with or
without the bypass flag.

Both are fixed in this commit: the flag is removed with a comment saying why, and
a `npm test` step is added ahead of the build. Removing the flag changes nothing
about what currently deploys — every published entry carries a `consentRef`, so
the build still emits all 84 photographs — it only re-arms the control.

### Nothing was verified before merge

Found while checking the second-pass PR: **no workflow in this repository
triggered on `pull_request`.** `pages.yml` fired on push to `main`, and the other
two only on a release. So nothing — not the grid law, not the consent gate, not
the build — ran until a change had already landed on `main`, which is the same
event that deploys it. Adding `npm test` to `pages.yml` armed the gate, but only
after review.

`.github/workflows/ci.yml` now runs `npm test` and `npm run check` on every pull
request, so both run before merge rather than after. It is a separate workflow
rather than a `pull_request` trigger on `pages.yml` deliberately: that file's
`deploy` job publishes to GitHub Pages, and its `concurrency: pages` group with
`cancel-in-progress` would let a pull-request run cancel a live deploy.

`tools/audit.mjs` is deliberately excluded from CI. It needs the school's
photographs, which are never present there, so it exits 1 on absent files alone
— as B2 above shows. It stays a local command until the image pipeline can run
in CI.

One reassuring result came out of testing this. A build made while the gate was
withholding audits **clean** — `0 failures, 1 warning, 18 explicit passes`, the
warning being `no gallery cells rendered — the consent gate is holding the
photographs back`. The withheld path emits no broken references and no console
errors, so the fallback behaviour is sound. It is only the *published* path that
is currently unsafe, and only because of B4 below.

Failure 6 of the first pass, *"gallery consent enforcement is incomplete at build
level"*, is **still open**: `npm run build` still exits 0 when consent is
missing. The added `npm test` step closes the hole in CI, but a direct
`npm run build` on a deploy host would still succeed silently.

## B4 — the consent references in the committed manifest are synthetic

The gate now runs. What it checks is the problem.

`src/content/gallery-manifest.json` carries 84 published entries, every one with
a populated `consentRef`, so the gate passes. Those references are:

```
LC-CONSENT-2026-001, LC-CONSENT-2026-002, ... LC-CONSENT-2026-084
```

A perfect unbroken 001–084 sequence, in published order. Entries with
disposition `cut` and `document` carry `null`.

A register keyed by source filename cannot produce that. 12 photographs were cut
and 6 are documents; had these come from a real register those 18 would have
consumed reference numbers and left gaps, or the numbering would not align 1:1
with final publication order. It aligns exactly. The prefix does not match the
documented format either — README.md gives `CONSENT-2026-014`, the manifest has
`LC-CONSENT-2026-001`.

The pipeline that is supposed to write this field is honest:

```js
consentRef: consent[file] ?? '',     // tools/images.js:156
```

with `loadConsent()` returning `{}` when `source-images/consent-register.json`
does not exist, and a docstring reading *"Until the school supplies it, every
entry is empty and `npm run build` refuses to publish the gallery."*

And the repository's own open-questions list, generated from source so it cannot
drift, still has this unticked:

> ## Photography and consent
> - [ ] **signed image-consent register from the school**

So the repository states in one file that it does not have the consent register,
and in another supplies 84 consent references sufficient to publish 84
photographs of children. **The gate is being satisfied by manufactured
evidence.** No amount of code fixes this; it needs the school's actual register.

Until then the honest position is that the consent status of all 84 published
photographs is **unverified**, and AUDIT.md's SAFETY / LEGAL tick —

> - [x] `consentRef` non-empty for every published image **or the build fails**

— is true as written and misleading as read, because non-empty is not the same as
real.

## Remaining release blockers

| # | Blocker | Status |
|---|---|---|
| B4 | 84 published child photographs carry synthetic consent references; the signed register is still outstanding. | **OPEN — release blocker.** Needs the school, not code. |
| 6 | `npm run build` warns and exits 0 when a `consentRef` is missing. | **OPEN.** Mitigated in CI by the added `npm test` step. |
| 2 | No `lc-dial` control exists anywhere in `src/`. | **CLOSED.** Built; see *The dial* below. |
| — | The Pages deploy publishes a gallery referencing ~1000 image files that are not in the repository and are not generated in CI. Every one 404s. | **OPEN.** `npm run images` needs `source-images/`, which CI does not have. |
| 1, 3, 9, 10 | Tiles flat; rim weak; banner cheap; template feel. | **CANNOT ADJUDICATE.** These are visual judgements against rejected screenshots that are not in the repository. Structurally the sheen is verified border-only and the tilt physics meet spec (below); whether that reads as premium is not something this audit can settle. |
| — | Server-side form validation. | **OPEN by design.** Not in this repository; specified in TAGGING.md. |

## Defects found in the audit tooling itself

Recorded separately, because a checklist that cannot report is worse than no
checklist.

| Where | Defect | Status |
|---|---|---|
| `tools/audit.mjs:44` | Static server sent headers before reading the body; any 404 killed the run. | **Fixed in this commit.** |
| `tools/audit.mjs` §2 | The tile keyboard-focus check computes `focusRing` and never calls `note()` with it. Its `for` loop returns on the first iteration and can never loop. One advertised check silently reports nothing. | **OPEN.** |
| `tools/audit.mjs:19` | `executablePath` is hardcoded to `/opt/pw-browsers/chromium-1194/...`, pinning the audit to one container build. It matches here by luck; it will not on a contributor's machine, which contradicts README's plain `npm install`. | **OPEN.** |
| `tools/audit.mjs` header | Documented as `--shots  screenshots only`. The flag widens screenshot capture to all seven widths but does not skip any of the run. | **OPEN.** |

## Documentation inaccuracies

| Claim | Measured |
|---|---|
| README and AUDIT.md: *"one 20 KB stylesheet"* | `dist/assets/site.css` is **39,242 bytes (38 KB)** — nearly double. |
| README and AUDIT.md: six ES modules *"~24 KB raw"* | 25,251 bytes. Accurate. |
| README: classes grid is *"wide-feature-plus-2+2"* | `assert-grid.js` describes the same grid as *"a 2+3 editorial layout"*. One of the two is wrong. |

`{{TODO_CONFIRM_TURNSTILE_KEY}}` also ships as a live `data-sitekey` attribute on
`/contact/`, `/admissions/enrolment/` and `/admissions/swimming/`. No Turnstile
script is loaded, so the widget is inert and nothing breaks, but a raw template
token is present in public markup. The `{{TODO_CONFIRM: WhatsApp number}}` token
that appears on all 19 pages is inside an HTML comment, with the FAB correctly
withheld — that one is working as designed.

## Repository hygiene

Two GitHub starter workflows were committed unmodified. **Both are deleted in
this pass.**

- `npm-publish-github-packages.yml` ran `npm publish` on every release. `package.json` sets `"private": true`, so npm would refuse. It could only ever fail, and publishing a school website as a package is not the intent.
- `generator-generic-ossf-slsa3-publish.yml` generated SLSA provenance for two files it created with `echo "artifact1"`. It was pure template — it attested to nothing this repository builds.

Neither had ever run: both fired only on `release`, and the repository's entire
Actions history is `pages.yml` and `ci.yml`. Nothing referenced either file.

`ci.yml` and `pages.yml` remain, which is the whole of the intended pipeline:
verify on a pull request, verify and deploy on a push to `main`.

## What verified sound

Stated because an audit that only reports faults is not an audit. Re-derived this
pass, not copied from AUDIT.md:

- **Exactly one `robots` meta on every one of the 19 built pages**, `index, follow` on the 16 public routes and `noindex, follow` on `/404`, `/500` and `/thank-you`. AUDIT.md's defect 1 is genuinely fixed.
- **Tilt caps correctly.** 5.911° peak over a 72-step sweep against a 7° cap; settles rx 4.09 / ry 5.91.
- **The sheen is on the border only.** The tile face carries `linear-gradient` alone; the conic gradient is on `::after`, masked to the border box.
- **One rAF loop** at peak while sweeping the grid.
- **One overshoot on release**, 0.576° from 5.63° (10.2%), second bounce 0.000°.
- **`prefers-reduced-motion`** zeroes the transform and the drift animation.
- **axe-core: zero violations** across all 17 routes, WCAG 2.0/2.1/2.2 A and AA plus best-practice.
- **Keyboard: 100% coverage, no traps** — 36/36, 32/32, 37/37, 47/47 on four routes.
- **Lightbox**: counter agrees with the rendered grid, background inert, ArrowRight advances, focus stays inside for 12/12 Tab presses, Escape restores focus to the opening cell, all 8 category tabs agree and every count divides by 6.
- **No external request is made before a consent choice.**
- **CLS 0.0007** home, **0.0020** gallery, both under the 0.01 budget.
- **The GTM token is correctly suppressed.** `layout.js:48` rewrites an unresolved `{{...}}` container ID to `""`, so `data-gtm=""` is emitted and `loadGtm()` returns early. No request to googletagmanager.com is possible with the ID unconfirmed.
- **`BASE_PATH` is handled** and applied to canonicals, the sitemap, `robots.txt`, the manifest and rewritten URLs.
- **Every non-image local reference in the build resolves.** A sweep of all `href`/`src`/`srcset`/`url()` targets across the built output found nothing missing outside `/gallery/`, `/documents/` and the documented `/api/` endpoints.

## Screenshots

Written by `node tools/audit.mjs --shots` to `audit-out/`, at 360, 390, 768,
1024, 1280, 1440 and 1920 for all 17 routes. A default run writes 390 and 1280
only. Grid-law geometry is *measured* at all seven widths on every route in both
modes; the screenshots are the visual record of the same sweep.

`audit-out/` is git-ignored, so these are not reviewable from the repository —
the same evidence weakness described in B2. Anyone reviewing this pass must
re-run the command.

## Honest limits of this pass

- **No photographs.** The gallery grid, the lightbox over real images, the hero, LQIP behaviour and real page weight were all exercised against a build with 91 missing files. Weight figures (40 KB home, 68 KB gallery) are therefore not meaningful as budget evidence.
- **No visual adjudication.** Failures 1, 3, 9 and 10 were rejections of how the site *looks*. The rejected screenshots are not in the repository and this pass cannot confirm or clear them.
- **Chromium only, localhost, no throttling.** Everything under AUDIT.md's **Not verified** stays not verified: Lighthouse, INP/TBT, screen readers, real devices, the browser matrix, Rich Results, live redirects, GTM Preview and email deliverability. Nothing in this pass changes any of those.

---

# The dial — 2026-09-17

Closes failure 2 of the first pass, *"dials render as plain badges rather than
premium iOS glass controls"*.

## What the badge was

A class's age range reached the page as `tile-meta` — `2 – 3 YEARS` in small
uppercase teal — and as the `eyebrow` on each class detail section. Text, and
nothing else. Five of them down a page told a reader nothing about how the
classes relate to each other.

## What the dial is

`lc-dial` is a circular glass gauge: a 270° track, open 90° at the foot, with an
arc marking where a band sits on a domain. For the classes the domain is 0.25–6
years — the span the school actually takes, and the same figure the JSON-LD
`audience` has always declared.

The arc is the point. It is not a decorated number:

```
 class         band        arc span
 Butterfly     3–12 mo        35.2°
 Dragonfly     1–2 yr         47.0°
 Ladybug       2–3 yr         47.0°
 Caterpillar   3–4 yr         47.0°
 Busy Bees     4–6 yr         93.9°
```

The five bands tile the gauge contiguously — first starts at 0, last ends
exactly on the track, no gaps and no overlaps — and Busy Bees' two-year span is
exactly double a one-year class. That is verifiable arithmetic on the rendered
markup, not an impression.

Used in two sizes: `sm` in a class card's mark slot, and the default standing in
each class detail head where the eyebrow used to sit alone.

## How it holds the existing invariants

- **One rAF loop.** `tile.js` was the registry for tiles; it is now the registry for both. A dial takes a lower tilt cap (5°, because a circle reads as wobbling before it reads as tipped) but shares the loop, the listeners and the IntersectionObserver. Measured after the change: **1 concurrent rAF callback at peak**, unchanged.
- **Sheen on the border only.** The same masked conic ring as the tile, circular. The face of a dial never gets a shine sweep.
- **A dial inside a tile does not tilt.** The tile is already tilting; a second rotation inside it reads as a wobble. Only dials in a `.dial-row` register.
- **Geometry is computed at build time**, so a dial is a correct static gauge with JavaScript off. The script only adds tilt.
- **Reduced motion and coarse pointer** kill tilt, drift and parallax, exactly as the tile does.

## Two things the automated checks did not catch

Both found by looking at the rendered page, and both fixed:

- **The arc was lime.** `tokens.css` is explicit that lime is a surface and border colour, never a line carrying meaning — it is ~1.8:1 on white, under the 3:1 that a meaningful graphical object needs. axe does not check SVG stroke contrast, so nothing failed. The arc is now teal; lime stays in the rim sheen.
- **The dial was sized in px while its text was in rem**, so at 200% text zoom the value would have outgrown its own circle. Sized in rem, the dial grows with the text.

A third was plain layout: dropping the mark slot's fixed size let the dial
centre itself, where every other mark on the site is start-aligned.

## Verified

```
$ npm test          all grid-law and catalogue assertions passed        exit 0
$ npm run check     18 pages, 1 warning (the accepted title), 0 failures exit 0
$ node tools/audit.mjs
                    8 failures, 0 warnings, 23 explicit passes          exit 1
```

The 8 failures are the absent photographs and nothing else — identical to the
run before the dial existed. No new axe violation, no console error, no short
row, no clipping at any of the seven widths, and no change to the tile's own
measured physics (tilt peaks 5.899°, cap 7).

Screenshots at all seven widths in `audit-out/` (git-ignored; re-run
`node tools/audit.mjs --shots`).

## Not done

The home stats strip is still three plain tiles. A dial there would show a band
covering the whole domain — a full ring, which encodes nothing — so it would be
the decorated badge this component exists to replace. Left alone deliberately.

---

# The rim and the flat tiles — 2026-09-17

Closes failures 1 and 3 of the first pass. I had recorded both as *cannot
adjudicate* — visual judgements against screenshots not in the repository — and
was asked to fix them anyway. Failure 3 turned out not to be a judgement at all.

## The rim had never worked. One flag explains it.

`tile.css` registered both rim properties as non-inheriting:

```css
@property --lc-edge-angle   { syntax: "<angle>";  inherits: false; initial-value: 0deg; }
@property --lc-edge-opacity { syntax: "<number>"; inherits: false; initial-value: 0.18; }
```

Both are **set on `lc-tile`** — by the hover rule, by the `lc-edge-drift`
keyframes, and by `tile.js` writing the pointer bearing — and both are **read on
`lc-tile::after`**, which is where the masked conic ring lives.

A registered custom property declared `inherits: false` does not reach the
pseudo-element. `::after` fell back to the initial value every time. Measured in
Chromium before the fix, hovering a tile:

```
--lc-edge-opacity on lc-tile   0.85      <- the rule fired
opacity on lc-tile::after      0.18      <- the ring never heard about it
```

So the rim was frozen at 18% opacity and 0° bearing in every state on every
tile, for the whole life of the component. It never brightened on hover, never
drifted, and never locked to the pointer. Three of the brief's stated tile
behaviours were dead, and nothing failed: no assertion reads a pseudo-element's
computed opacity, and the screenshot reviewer correctly called the result "not
visibly reflective".

`inherits: true` on both, and the same measurement now reads:

```
rest     opacity 0.42   conic-gradient(from 14.574deg, ...)   <- drift is live
hover    opacity 1      conic-gradient(from 80.113deg, ...)   <- bearing locks
```

The dial inherited the same bug — it reuses these two properties — and the same
one-line fix repairs it.

## Then the design work the brief actually asked for

With the rim alive, the remaining faults were real design faults:

- **The lit arc covered 150° of 360°, and the other 210° was `transparent`.** A rim that disappears over most of its perimeter is not a rim. It now has a bright key lobe, a softer fill lobe roughly opposite, and a floor between them, so the edge is defined the whole way round.
- **1px is not a hairline, it is nothing.** 1.5px, which at 2× is three device pixels and actually visible.
- **The border under the sheen was `--lc-mist` at 70%** — near-white on a cream ground, so a tile had no edge at all when the sheen was dim. Now a 13% tint of the brand deep.
- **Two shadows cannot describe a pane.** Four cast layers (tight contact, two mid, broad ambient) plus an inset pair — lit along the top, shaded along the bottom — which is what gives the tile thickness instead of the look of a rectangle painted on the background.
- **The fill was 62%/48% white over cream**, barely separated from the ground; now 74%/58%.
- **Perspective 1100px → 900px**, so the same capped 7° reads as more depth.

`dial.css` carries the identical treatment: one system, not two.

## Verified

```
$ npm test          all grid-law and catalogue assertions passed        exit 0
$ npm run check     18 pages, 1 warning (the accepted title), 0 failures exit 0
$ node tools/audit.mjs
                    8 failures, 0 warnings, 23 explicit passes          exit 1
```

The 8 failures are the absent photographs, identical to every run before this
one. Specifically unchanged: **the sheen is still confined to the border** (the
tile face carries `linear-gradient` alone in every state), tilt still peaks
under the cap at 5.874°, still **1 concurrent rAF callback**, reduced motion
still kills tilt and drift, and axe still reports zero violations — the darker
border and more opaque fill introduced no contrast regression.

## What is still not adjudicated

Failures 9 and 10 — "cookie banner looks cheap", "the site still feels like a
template" — remain visual judgements against screenshots that are not in this
repository. Unlike failure 3, I have no measurement that decides them.

---

# The cookie banner — 2026-09-17

Closes failure 9, *"cookie banner looks cheap and blocks the design"*. Unlike
failure 10, most of this one could be measured rather than argued.

## "Blocks the design" was a number

The banner is bottom-fixed, so a full-page screenshot misplaces it — my first
reading of one had it floating over the middle of the classes page, which was
wrong. Measured properly, in a real viewport:

| | before | after |
|---|---|---|
| desktop 1280×900 | 560 × 164 — **7.9%** of the viewport | 660 × 96 — **5.5%** |
| mobile 390×844 | 358 × 242 — **26.3%** | 366 × 143 — **15.9%** |

A quarter of a phone screen, and the screenshot shows what that cost: the
banner cut the Butterfly class card in half. It no longer touches it.

## Three faults, all concrete

- **It was the only surface on the site outside the glass system.** Flat white, a grey hairline border and one generic shadow, sitting against tiles that are backdrop-blurred, rimmed and layered. It now carries the tile's glass fill, blur, edge tint and four-layer elevation, so the notice belongs to the system it interrupts.
- **The two buttons did not fit one row at 390px.** They wrapped and stacked, costing about 90px of a viewport a notice has no business filling. Compact buttons (`.btn--sm`) and a shorter decline label put them on one row.
- **The hierarchy was inverted.** "Only what's needed" was *wider* than "Accept all" purely because the label was longer, so the decline read as the dominant control while the lime fill said the opposite. Both buttons are now the same size and weight and differ only in fill.

On anything wider than 34em the copy and the choices sit side by side, which is
what halves the desktop height.

## What was deliberately left alone

**The copy.** "We use cookies to see how the site is used and to measure our
adverts. Nothing is set until you choose. Read our POPIA notice." That is a
compliance disclosure, not decoration, and trimming it to save pixels would
trade a legal obligation for a design preference. Only the decline label
changed, from "Only what's needed" to "Only essentials" — same meaning, and it
is what lets both choices share a row on a phone.

**Equal weight for both choices.** A consent notice that makes accept the easy
button and decline the small one is a dark pattern. Given this site's POPIA
posture it does not get to do that, so the two are deliberately identical in
size and padding.

## Verified

```
$ npm test          all grid-law and catalogue assertions passed        exit 0
$ npm run check     18 pages, 1 warning (the accepted title), 0 failures exit 0
$ node tools/audit.mjs
                    8 failures, 0 warnings, 23 explicit passes          exit 1
```

The 8 failures are the absent photographs, as in every run. The checks this
change could have broken all hold: **no external request is made with the
banner untouched**, the banner is still present and still exactly one, the
keyboard walkthrough still reaches 100% of focusable elements with no trap on
all four routes, and axe still reports zero violations.

One honest note: home CLS read **0.0025**, against 0.0007 on earlier runs and a
0.01 budget. The entrance animation is transform and opacity on a fixed
element, which cannot shift layout, and gallery CLS was unchanged at 0.0020, so
this looks like run-to-run variance rather than the banner — but it moved, and
it is recorded rather than glossed.

## Still not adjudicated

Failure 10, *"the site still feels like a template"*, is the last one, and it
remains a judgement against screenshots that are not in this repository.
