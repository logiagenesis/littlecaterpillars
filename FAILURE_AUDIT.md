# Failure Audit

Initial audit date: 2026-09-17
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

## Required second pass

This file must be updated after the implementation work with the commands run,
the resulting audit output, screenshot paths for 360, 390, 768, 1024, 1280,
1440, and 1920 pixels, and any remaining release blockers. No build is complete
until the second audit passes and the branch is committed and pushed.