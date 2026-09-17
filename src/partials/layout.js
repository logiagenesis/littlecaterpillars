import { icon } from './icons.js'

const esc = s => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')

/** {{TODO_CONFIRM: ...}} tokens are rendered visibly, never silently dropped. */
export function todo (text) {
  const m = /^\{\{TODO_CONFIRM:\s*([\s\S]*?)\}\}$/.exec(String(text).trim())
  if (!m) return null
  return `<span class="todo" role="note"><b>To confirm:</b> ${esc(m[1])}</span>`
}

/** Render a value that may be plain copy or may be a TODO_CONFIRM token. */
export function val (text) {
  const t = todo(text)
  return t ?? esc(text)
}

/** Render copy that may contain inline TODO_CONFIRM tokens. */
export function rich (text) {
  return String(text ?? '').replace(/\{\{TODO_CONFIRM:\s*([\s\S]*?)\}\}/g,
    (_, body) => `<span class="todo" role="note"><b>To confirm:</b> ${esc(body)}</span>`)
}

export { esc }

const NAV = [
  { href: '/about/', label: 'About' },
  { href: '/classes/', label: 'Classes' },
  { href: '/teachers/', label: 'Our Team' },
  { href: '/gallery/', label: 'Gallery' },
  { href: '/fees/', label: 'Fees' },
  { href: '/admissions/', label: 'Admissions' },
  { href: '/menus/', label: 'Menus' },
  { href: '/location/', label: 'Location' }
]

export function layout (page, ctx) {
  const { site } = ctx
  const basePath = ctx.basePath ?? ''
  const url = site.origin + basePath + page.path
  const title = page.title
  const description = page.description
  const waNumber = /^\+\d+$/.test(site.contact.whatsappTodo) ? site.contact.whatsappTodo : null

  return `<!doctype html>
<html lang="en-ZA" class="no-js" data-gtm="${esc(site.gtmId.startsWith('{{') ? '' : site.gtmId)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="robots" content="${page.noindex ? 'noindex, follow' : 'index, follow'}">
<link rel="canonical" href="${esc(url)}">
<meta name="theme-color" content="${esc(site.themeColor)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(url)}">
<meta property="og:locale" content="en_ZA">
<meta property="og:image" content="${esc(site.origin)}${basePath}/assets/og${page.path.replace(/\//g, '-').replace(/^-|-$/g, '') || '-home'}.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="preload" href="/assets/fonts/nunito-latin-800-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/inter-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/site.css">
<link rel="modulepreload" href="/assets/main.js">
${page.jsonLd ? `<script type="application/ld+json">${JSON.stringify(page.jsonLd)}</script>` : ''}
${page.head ?? ''}
</head>
<body${page.bodyClass ? ` class="${page.bodyClass}"` : ''}>
<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
  <div class="shell site-header__inner">
    <a class="brand" href="/">
      ${icon('caterpillar', 'brand__mark')}
      <span class="brand__text"><b>Little Caterpillars</b><span>${esc(site.ages)}</span></span>
    </a>
    <nav class="site-nav" aria-label="Main">
      <button type="button" class="site-nav__toggle" aria-expanded="false" aria-controls="site-menu">
        <span class="visually-hidden">Menu</span><span class="burger" aria-hidden="true"></span>
      </button>
      <ul id="site-menu" class="site-nav__list">
        ${NAV.map(item => `<li><a href="${item.href}"${page.path.startsWith(item.href) ? ' aria-current="page"' : ''}>${esc(item.label)}</a></li>`).join('\n        ')}
      </ul>
    </nav>
    <a class="btn btn--primary site-header__cta" href="/contact/">Book a Visit</a>
  </div>
</header>

<main id="main">
${page.body}
</main>

<footer class="site-footer">
  <div class="shell site-footer__grid">
    <div>
      <p class="site-footer__brand">${esc(site.name)}</p>
      <p class="site-footer__ages">${esc(site.ages)} · Nursery School | Creche | Preschool</p>
      <address>
        ${esc(site.contact.street)}, ${esc(site.contact.suburb)}, ${esc(site.contact.province)}<br>
        ${todo(site.contact.postalCodeTodo)}
      </address>
    </div>
    <div>
      <h2>Get in touch</h2>
      <ul class="plain">
        <li><a href="tel:${esc(site.contact.phoneE164)}">${esc(site.contact.phoneDisplay)}</a></li>
        <li><a href="mailto:${esc(site.contact.email)}">${esc(site.contact.email)}</a></li>
        <li><a href="${esc(site.contact.facebook)}" rel="noopener">Facebook</a></li>
      </ul>
    </div>
    <div>
      <h2>Visit</h2>
      <ul class="plain">
        <li><a href="/contact/">Book a visit</a></li>
        <li><a href="/admissions/">Admissions</a></li>
        <li><a href="/downloads/">Downloads</a></li>
        <li><a href="/location/">Find us</a></li>
      </ul>
    </div>
    <div>
      <h2>Small print</h2>
      <ul class="plain">
        <li><a href="/popia/">POPIA notice</a></li>
        <li><a href="/privacy/">Privacy</a></li>
        <li><a href="/terms/">Terms</a></li>
      </ul>
    </div>
  </div>
  <div class="shell site-footer__legal">
    <p>&copy; ${new Date().getFullYear()} ${esc(site.name)}. ${todo(site.campusesTodo) ?? ''}</p>
  </div>
</footer>

${waNumber ? `<a class="whatsapp-fab" data-track="whatsapp" rel="noopener"
   href="https://wa.me/${esc(waNumber.replace('+', ''))}?text=${encodeURIComponent("Hi Little Caterpillars, I'd like to enquire about a place for my child.")}"
   aria-label="Chat to Little Caterpillars on WhatsApp">${icon('whatsapp')}</a>`
: `<!-- WhatsApp FAB withheld: ${esc(site.contact.whatsappTodo)} -->`}

<script type="module" src="/assets/main.js"></script>
<script>document.documentElement.classList.remove('no-js')</script>
</body>
</html>
`
}
