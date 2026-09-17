/**
 * Static build. No framework, no runtime dependencies — sharp and the two
 * font packages are build-time only, and nothing from node_modules is shipped
 * except the WOFF2 files themselves.
 *
 *   node tools/build.js           build into dist/
 *   node tools/build.js --check   build, then run the HTML/SEO assertions
 */
import { readFile, writeFile, mkdir, rm, cp, readdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

import { layout } from '../src/partials/layout.js'
import home from '../src/pages/home.js'
import about from '../src/pages/about.js'
import classes from '../src/pages/classes.js'
import teachers from '../src/pages/teachers.js'
import galleryPage from '../src/pages/gallery.js'
import fees from '../src/pages/fees.js'
import menus from '../src/pages/menus.js'
import downloads from '../src/pages/downloads.js'
import location from '../src/pages/location.js'
import contact from '../src/pages/contact.js'
import thankyou from '../src/pages/thankyou.js'
import { hub, enrolment, swimming } from '../src/pages/admissions.js'
import { popia, privacy, terms } from '../src/pages/legal.js'
import { notFound, serverError } from '../src/pages/errors.js'
import { REDIRECTS } from './redirects.js'

const ROOT = path.resolve(import.meta.dirname, '..')
const SRC = path.join(ROOT, 'src')
const DIST = path.join(ROOT, 'dist')
const CHECK = process.argv.includes('--check')

const read = async p => JSON.parse(await readFile(path.join(SRC, 'content', p), 'utf8'))

async function buildContext () {
  const site = await read('site.json')
  const copy = await read('copy.json')
  const programme = await read('programme.json')

  let gallery = null
  let documents = null
  let hero = null

  const manifestPath = path.join(SRC, 'content', 'gallery-manifest.json')
  if (existsSync(manifestPath)) {
    const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
    const published = manifest.entries.filter(e => e.disposition === 'published')
    const blocked = published.filter(e => !e.consentRef)
    const allow = process.env.LC_ALLOW_PENDING_CONSENT === '1'

    if (blocked.length && !allow) {
      console.warn(`gallery withheld: ${blocked.length} of ${published.length} images have no consentRef. ` +
        `Set LC_ALLOW_PENDING_CONSENT=1 for a local preview.`)
    } else {
      const srcset = (stem, ext) => manifest.widths.map(w => `/gallery/${stem}-${w}.${ext} ${w}w`).join(', ')
      gallery = {
        total: published.length,
        categories: manifest.categories.map(c => ({
          ...c,
          images: published.filter(e => e.category === c.slug).map(e => ({
            src: `/gallery/${e.stem}-800.jpg`,
            srcset: srcset(e.stem, 'jpg'),
            avif: srcset(e.stem, 'avif'),
            webp: srcset(e.stem, 'webp'),
            full: e.full.src,
            fullWidth: e.full.width,
            fullHeight: e.full.height,
            width: e.width,
            height: e.height,
            alt: e.alt,
            lqip: e.lqip
          }))
        }))
      }
      const lead = published.find(e => e.category === 'outdoors') ?? published[0]
      if (lead) {
        hero = {
          src: `/gallery/${lead.stem}-1600.jpg`,
          alt: lead.alt,
          srcset: { avif: srcset(lead.stem, 'avif'), webp: srcset(lead.stem, 'webp') }
        }
      }
    }
    documents = Object.fromEntries(manifest.entries
      .filter(e => e.disposition === 'document')
      .map(e => [e.use, `/documents/${e.use}-${e.n}.jpg`]))
  }

  const ld = { childCare: childCareLd(site, copy) }
  return { site, copy, programme, gallery, documents, hero, ld }
}

function childCareLd (site, copy) {
  // No aggregateRating: there are no verifiable reviews in the source.
  // No geo and no postalCode until the address is confirmed — a LocalBusiness
  // schema with an unverified address is worse than no schema.
  const unresolved = v => typeof v === 'string' && v.includes('{{TODO_CONFIRM')
  const address = { '@type': 'PostalAddress', streetAddress: site.contact.street, addressLocality: site.contact.suburb, addressRegion: site.contact.province, addressCountry: 'ZA' }
  return {
    '@context': 'https://schema.org',
    '@type': ['ChildCare', 'Organization'],
    '@id': site.origin + '/#organisation',
    name: site.name,
    legalName: site.legalName,
    url: site.origin + '/',
    description: site.meta.description,
    slogan: site.tagline,
    email: site.contact.email,
    ...(unresolved(site.contact.phoneTodo) ? {} : { telephone: site.contact.phoneE164 }),
    address,
    areaServed: site.contact.areaServed.map(n => ({ '@type': 'Place', name: n })),
    sameAs: [site.contact.facebook],
    audience: { '@type': 'PeopleAudience', suggestedMinAge: 0.25, suggestedMaxAge: 6 }
  }
}

async function bundleCss () {
  const dir = path.join(SRC, 'styles')
  const order = ['fonts.css', 'tokens.css', 'base.css', 'tile.css', 'layout.css', 'pages.css']
  const files = await readdir(dir)
  const rest = files.filter(f => f.endsWith('.css') && !order.includes(f)).sort()
  const parts = []
  for (const f of [...order.filter(f => files.includes(f)), ...rest]) {
    parts.push(`/* ${f} */\n` + await readFile(path.join(dir, f), 'utf8'))
  }
  return parts.join('\n')
}

const FAVICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
<rect width="64" height="64" rx="14" fill="#0a303a"/>
<circle cx="16" cy="40" r="8" fill="#b2c633"/>
<circle cx="31" cy="41" r="9.5" fill="#b2c633"/>
<circle cx="46" cy="39" r="8" fill="#b2c633"/>
<circle cx="52" cy="26" r="7" fill="#167287"/>
<circle cx="54" cy="24" r="1.8" fill="#fff"/>
<path d="M49 20.5 47 15M55.5 20 58 14.5" stroke="#b2c633" stroke-width="2.6" stroke-linecap="round"/>
</svg>`

function ogSvg (title, kicker) {
  const wrap = (s, n) => {
    const words = String(s).split(' ')
    const lines = ['']
    for (const w of words) {
      if ((lines.at(-1) + ' ' + w).trim().length > n) lines.push(w)
      else lines[lines.length - 1] = (lines.at(-1) + ' ' + w).trim()
    }
    return lines.slice(0, 3)
  }
  const lines = wrap(title, 26)
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#0a303a"/>
  <circle cx="1040" cy="520" r="230" fill="#167287" opacity="0.35"/>
  <circle cx="1160" cy="120" r="150" fill="#b2c633" opacity="0.22"/>
  <text x="80" y="140" font-family="Nunito, sans-serif" font-size="30" font-weight="800" fill="#b2c633" letter-spacing="6">${esc(kicker.toUpperCase())}</text>
  ${lines.map((l, i) => `<text x="80" y="${250 + i * 84}" font-family="Nunito, sans-serif" font-size="72" font-weight="800" fill="#ffffff">${esc(l)}</text>`).join('\n  ')}
  <text x="80" y="560" font-family="Inter, sans-serif" font-size="30" fill="#f4f1ea" opacity="0.85">littlecaterpillars.co.za · 3 months – 6 years</text>
</svg>`
}

async function main () {
  const ctx = await buildContext()
  const pages = [
    home(ctx), about(ctx), classes(ctx), teachers(ctx), galleryPage(ctx), fees(ctx),
    hub(ctx), enrolment(ctx), swimming(ctx), menus(ctx), downloads(ctx), location(ctx),
    contact(ctx), thankyou(ctx), popia(ctx), privacy(ctx), terms(ctx),
    notFound(ctx), serverError(ctx)
  ]

  // dist/gallery and dist/documents are produced by `npm run images` and are
  // expensive, so they are preserved across builds.
  for (const entry of existsSync(DIST) ? await readdir(DIST) : []) {
    if (entry === 'gallery' || entry === 'documents') continue
    await rm(path.join(DIST, entry), { recursive: true, force: true })
  }
  await mkdir(path.join(DIST, 'assets', 'fonts'), { recursive: true })

  for (const page of pages) {
    const html = layout(page, ctx)
    const out = page.outFile
      ? path.join(DIST, page.outFile)
      : path.join(DIST, page.path.replace(/^\/|\/$/g, ''), 'index.html')
    await mkdir(path.dirname(out), { recursive: true })
    await writeFile(out, html)
  }

  await writeFile(path.join(DIST, 'assets', 'site.css'), await bundleCss())
  await cp(path.join(SRC, 'scripts'), path.join(DIST, 'assets'), { recursive: true })

  for (const [pkg, file] of [
    ['@fontsource/nunito', 'nunito-latin-400-normal.woff2'],
    ['@fontsource/nunito', 'nunito-latin-700-normal.woff2'],
    ['@fontsource/nunito', 'nunito-latin-800-normal.woff2'],
    ['@fontsource/inter', 'inter-latin-400-normal.woff2'],
    ['@fontsource/inter', 'inter-latin-600-normal.woff2']
  ]) {
    await cp(path.join(ROOT, 'node_modules', pkg, 'files', file), path.join(DIST, 'assets', 'fonts', file))
  }

  await writeFile(path.join(DIST, 'assets', 'favicon.svg'), FAVICON)
  await sharp(Buffer.from(FAVICON)).resize(180, 180).png().toFile(path.join(DIST, 'assets', 'apple-touch-icon.png'))
  await sharp(Buffer.from(FAVICON)).resize(512, 512).png().toFile(path.join(DIST, 'assets', 'icon-512.png'))
  await sharp(Buffer.from(FAVICON)).resize(192, 192).png().toFile(path.join(DIST, 'assets', 'icon-192.png'))

  for (const page of pages) {
    const slug = page.path.replace(/\//g, '-').replace(/^-|-$/g, '') || '-home'
    const kicker = page.path === '/' ? 'Little Caterpillars' : 'Little Caterpillars'
    await sharp(Buffer.from(ogSvg(page.title.split('|')[0].trim(), kicker)))
      .png({ compressionLevel: 9 }).toFile(path.join(DIST, 'assets', `og${slug}.png`))
  }

  const indexable = pages.filter(p => !p.noindex)
  await writeFile(path.join(DIST, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    indexable.map(p => `  <url><loc>${ctx.site.origin}${p.path}</loc></url>`).join('\n') +
    `\n</urlset>\n`)

  await writeFile(path.join(DIST, 'robots.txt'),
    `User-agent: *\nAllow: /\nDisallow: /thank-you/\n\nSitemap: ${ctx.site.origin}/sitemap.xml\n`)

  await writeFile(path.join(DIST, 'humans.txt'),
    `/* SITE */\nName: Little Caterpillars\nWhere: Midrand, Gauteng, South Africa\nAges: 3 months – 6 years\n\n` +
    `/* BUILD */\nStack: hand-written HTML, CSS and ES modules. No framework.\nBuild: Node, sharp for images.\n`)

  await writeFile(path.join(DIST, 'site.webmanifest'), JSON.stringify({
    name: ctx.site.name, short_name: 'Little Caterpillars',
    start_url: '/', display: 'standalone',
    background_color: ctx.site.themeColor, theme_color: ctx.site.themeColor,
    icons: [
      { src: '/assets/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/assets/icon-512.png', sizes: '512x512', type: 'image/png' }
    ]
  }, null, 2))

  // Redirects, emitted for the two hosts this is most likely to land on.
  const live = REDIRECTS.filter(r => !r.to.includes('{{'))
  await writeFile(path.join(DIST, '_redirects'), live.map(r => `${r.from}  ${r.to}  301`).join('\n') + '\n')
  await writeFile(path.join(DIST, '.htaccess'),
    'RewriteEngine On\n' +
    'RewriteCond %{HTTPS} off\nRewriteRule ^(.*)$ https://%{HTTP_HOST}/$1 [R=301,L]\n' +
    'Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"\n' +
    'ErrorDocument 404 /404.html\nErrorDocument 500 /500.html\n' +
    live.map(r => `Redirect 301 ${r.from} ${r.to}`).join('\n') + '\n')
  await writeFile(path.join(ROOT, 'REDIRECTS.csv'),
    'old_path,new_path,status,note\n' +
    REDIRECTS.map(r => `${r.from},${r.to},301,"${(r.note ?? '').replace(/"/g, '""')}"`).join('\n') + '\n')

  console.log(`built ${pages.length} pages -> dist/`)
  console.log(`  gallery: ${ctx.gallery ? `${ctx.gallery.total} photographs` : 'withheld (no consent register)'}`)
  console.log(`  redirects: ${live.length} live, ${REDIRECTS.length - live.length} awaiting a destination`)

  if (CHECK) {
    const { check } = await import('./check.js')
    await check(DIST, ctx, pages)
  }
}

main().catch(err => { console.error(err); process.exit(1) })
