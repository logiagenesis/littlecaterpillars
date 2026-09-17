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

/**
 * <lc-dial> — a circular glass gauge for a band on a scale.
 *
 * The age range on a class card used to be `tile-meta`: uppercase text, and
 * nothing more. A dial earns its place here because the arc carries real
 * information — where a class sits on the 3-months-to-6-years span, and how
 * wide its band is. Five dials side by side make the classes comparable at a
 * glance, which "2 – 3 YEARS" in small caps never did.
 *
 * The geometry is computed here, at build time, so a dial is a correct static
 * picture with JavaScript off. The script only adds tilt.
 *
 * Domain defaults to the span the school actually takes, which is the same
 * 0.25–6 the JSON-LD `audience` already declares.
 *
 * @param from  band start, in domain units
 * @param to    band end, in domain units
 * @param value short text for the centre — the fact a reader gets
 * @param label optional line under the value
 * @param size  'sm' inside a tile's mark slot, 'md' standing on its own
 */
export function dial ({ from, to, value, label, min = 0.25, max = 6, size = 'md', className = '' }) {
  const R = 44
  const C = 2 * Math.PI * R
  const SWEEP = 0.75                       // a 270° gauge, 90° open at the foot
  const track = C * SWEEP

  const span = max - min
  const clamp01 = n => n < 0 ? 0 : n > 1 ? 1 : n
  const f0 = clamp01((from - min) / span)
  const f1 = clamp01((to - min) / span)
  const arc = Math.max(f1 - f0, 0) * track

  // A hairline of arc for a zero-width band, so a dial is never blank.
  const len = arc > 0.5 ? arc : 0.5
  const round = n => Math.round(n * 100) / 100

  // A small dial carries the range alone. Inside a tile the unit is already in
  // the meta line directly beneath it, and two words in a 76px circle wrap.
  const showLabel = label && size !== 'sm'

  return `<lc-dial class="${esc(`dial dial--${size} ${className}`.trim())}">
  <svg class="dial__ring" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
    <circle class="dial__track" cx="50" cy="50" r="${R}"
            stroke-dasharray="${round(track)} ${round(C)}" transform="rotate(135 50 50)"/>
    <circle class="dial__arc" cx="50" cy="50" r="${R}"
            stroke-dasharray="${round(len)} ${round(C)}"
            stroke-dashoffset="${round(-f0 * track)}" transform="rotate(135 50 50)"/>
  </svg>
  <span class="dial__face">
    <span class="dial__value">${esc(value)}</span>
    ${showLabel ? `<span class="dial__label">${esc(label)}</span>` : ''}
  </span>
</lc-dial>`
}

/**
 * Compact centre text for an age dial, built from the numbers rather than by
 * abbreviating the prose — so a reworded `ages` string cannot change what the
 * dial reads. Bands under a year are shown in months, as the school states them.
 */
export function ageBand (from, to) {
  const months = to <= 1
  const n = v => Number((months ? v * 12 : v).toFixed(2)).toString()
  return { value: `${n(from)}–${n(to)}`, label: months ? 'months' : 'years' }
}

export function grid (cols, children, className = '') {
  return `<ul class="tile-grid plain ${className}" data-cols="${cols}">
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
