import { esc, rich, todo } from './layout.js'
import { icon } from './icons.js'

/**
 * The one tile. Class cards, teacher cards, fee tiles, gallery covers, download
 * tiles, the contact card and the stats strip are all this function.
 */
export function tile ({ mark, meta, title, href, body, foot, className = '', level = 'h3' }) {
  return `<lc-tile class="${className}">
  ${mark ? `<span class="tile-mark" aria-hidden="true">${mark}</span>` : ''}
  ${meta ? `<p class="tile-meta">${esc(meta)}</p>` : ''}
  ${title ? `<${level} class="tile-title">${href ? `<a href="${esc(href)}">${esc(title)}</a>` : esc(title)}</${level}>` : ''}
  ${body ? `<div class="tile-body">${body}</div>` : ''}
  ${foot ? `<div class="tile-foot">${foot}</div>` : ''}
</lc-tile>`
}

export function grid (cols, children, className = '') {
  return `<ul class="tile-grid plain ${className}" style="--cols:1" data-cols="${cols}">
    ${children.map(c => `<li>${c}</li>`).join('\n    ')}
  </ul>`
}

export function section (opts) {
  const { id, kind = '', eyebrow, heading, lede, body, headingLevel = 'h2' } = opts
  return `<section class="section ${kind}"${id ? ` id="${esc(id)}"` : ''}>
  <div class="shell">
    ${eyebrow ? `<p class="eyebrow">${esc(eyebrow)}</p>` : ''}
    ${heading ? `<${headingLevel}>${esc(heading)}</${headingLevel}>` : ''}
    ${lede ? `<p class="lede">${rich(lede)}</p>` : ''}
    ${body ?? ''}
  </div>
</section>`
}

/** An organic two-stop curve, not the 1000-node scallop the old theme shipped. */
export function wave (from = 'var(--ground)', to = 'var(--ground-sunk)') {
  return `<div class="wave" aria-hidden="true" style="--wave-from:${from};--wave-to:${to}">
  <svg viewBox="0 0 1440 90" preserveAspectRatio="none" focusable="false">
    <path d="M0 46C300 92 560 4 840 26s420 62 600 34V90H0Z"/>
  </svg>
</div>`
}

export function breadcrumbs (trail) {
  return `<nav class="crumbs" aria-label="Breadcrumb"><ol class="plain">
    ${trail.map((c, i) => i === trail.length - 1
      ? `<li aria-current="page">${esc(c.label)}</li>`
      : `<li><a href="${esc(c.href)}">${esc(c.label)}</a></li>`).join('')}
  </ol></nav>`
}

export function crumbLd (origin, trail) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((c, i) => ({
      '@type': 'ListItem', position: i + 1, name: c.label,
      ...(c.href ? { item: origin + c.href } : {})
    }))
  }
}

/** A field that renders its own error region and stays labelled for a reader. */
export function field ({ name, label, type = 'text', required = false, autocomplete, hint, options, rows }) {
  const id = `f-${name}`
  const describedBy = [hint ? `${id}-hint` : null, `${id}-error`].filter(Boolean).join(' ')
  const attrs = [
    `id="${id}"`, `name="${esc(name)}"`,
    required ? 'required' : '',
    autocomplete ? `autocomplete="${esc(autocomplete)}"` : '',
    `aria-describedby="${describedBy}"`
  ].filter(Boolean).join(' ')

  let control
  if (type === 'textarea') control = `<textarea ${attrs} rows="${rows ?? 5}"></textarea>`
  else if (type === 'select') {
    control = `<select ${attrs}>
      <option value="">Please choose…</option>
      ${options.map(o => `<option value="${esc(o)}">${esc(o)}</option>`).join('')}
    </select>`
  } else control = `<input ${attrs} type="${esc(type)}">`

  return `<div class="field">
  <label for="${id}">${esc(label)}${required ? ' <span class="req" aria-hidden="true">*</span><span class="visually-hidden"> (required)</span>' : ''}</label>
  ${hint ? `<p class="field__hint" id="${id}-hint">${esc(hint)}</p>` : ''}
  ${control}
  <p class="field__error" id="${id}-error" aria-live="polite"></p>
</div>`
}

/** Honeypot + the server-side timing pair. Hidden from everyone, including readers. */
export function honeypot () {
  return `<div class="hp" aria-hidden="true">
  <label for="f-website">Leave this field empty</label>
  <input id="f-website" name="website" type="text" tabindex="-1" autocomplete="off">
</div>
<noscript><p class="note">This form works without JavaScript. Every field is checked again on the server.</p></noscript>`
}

export function turnstile () {
  return `<div class="field">
  <div class="cf-turnstile" data-sitekey="{{TODO_CONFIRM_TURNSTILE_KEY}}"></div>
  ${todo('{{TODO_CONFIRM: Cloudflare Turnstile site key and secret}}')}
</div>`
}

export { icon }
