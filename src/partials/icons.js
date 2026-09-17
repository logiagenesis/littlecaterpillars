/**
 * Inline SVG only — no icon font, no sprite request. Each is drawn on a 24-unit
 * grid, inherits currentColor, and is hidden from assistive tech because every
 * one of them sits next to real text.
 */
const PATHS = {
  caterpillar: `<circle cx="5" cy="14" r="3.4"/><circle cx="11" cy="14.6" r="3.9"/><circle cx="17.6" cy="14" r="3.4"/>
    <circle cx="20.4" cy="9.6" r="3.2" fill="currentColor"/><path d="M19.4 6.6 18.4 4M21.8 6.4 22.8 3.9"/>`,
  whatsapp: `<path d="M12.04 2A9.9 9.9 0 0 0 2.1 11.9c0 1.75.46 3.46 1.34 4.97L2 22l5.27-1.38a9.9 9.9 0 0 0 4.77 1.21h.01A9.9 9.9 0 0 0 22 11.94 9.9 9.9 0 0 0 12.04 2Zm5.8 14.06c-.24.68-1.42 1.32-1.96 1.36-.5.04-.98.22-3.32-.7-2.8-1.1-4.56-3.98-4.7-4.16-.13-.18-1.12-1.48-1.12-2.83s.71-2 .96-2.28c.25-.27.54-.34.72-.34h.52c.17 0 .4-.06.62.47.24.57.8 1.97.87 2.11.07.14.12.31.02.5-.1.18-.15.3-.29.46l-.44.5c-.14.14-.29.3-.12.59.17.28.74 1.22 1.59 1.98 1.09.97 2 1.27 2.29 1.41.28.15.45.12.62-.07.17-.2.71-.83.9-1.11.19-.29.38-.24.64-.14.25.09 1.62.76 1.9.9.28.14.46.21.53.33.07.12.07.68-.17 1.36Z" fill="currentColor" stroke="none"/>`,
  phone: `<path d="M6.6 3h3l1.5 4-2 1.4a12 12 0 0 0 5.5 5.5l1.4-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.6 5.2 2 2 0 0 1 6.6 3Z"/>`,
  mail: `<rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="m3.5 7 8.5 6 8.5-6"/>`,
  pin: `<path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z"/><circle cx="12" cy="10" r="2.6"/>`,
  clock: `<circle cx="12" cy="12" r="9"/><path d="M12 7v5.4l3.4 2"/>`,
  download: `<path d="M12 3v11m0 0 4-4m-4 4-4-4"/><path d="M4 17v2.5A1.5 1.5 0 0 0 5.5 21h13a1.5 1.5 0 0 0 1.5-1.5V17"/>`,
  arrow: `<path d="M4 12h15m0 0-5.5-5.5M19 12l-5.5 5.5"/>`
}

export function icon (name, className = '') {
  const d = PATHS[name]
  if (!d) throw new Error(`unknown icon: ${name}`)
  return `<svg class="icon${className ? ' ' + className : ''}" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`
}

/**
 * The one accent motion moment on the whole site: a caterpillar that draws
 * itself into a butterfly, once, when the About page scrolls it into view.
 * Stroke-dash animation, so it is a line-draw rather than a fade.
 */
export function metamorphosis () {
  return `<svg class="metamorphosis" data-metamorphosis viewBox="0 0 320 120" role="img"
    aria-label="A caterpillar becoming a butterfly">
  <g fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
    <path class="m-crawl" d="M12 84c8-10 16 10 24 0s16 10 24 0 16 10 24 0"/>
    <circle class="m-head" cx="92" cy="78" r="7"/>
    <path class="m-arc" d="M112 80c22-6 36-34 62-34s40 28 62 34"/>
    <path class="m-wing-l" d="M236 60c-16-22-40-26-48-12s6 28 22 30c-10 10-8 26 4 28s22-16 22-30"/>
    <path class="m-wing-r" d="M240 60c16-22 40-26 48-12s-6 28-22 30c10 10 8 26-4 28s-22-16-22-30"/>
    <path class="m-body" d="M238 46v58"/>
    <path class="m-antenna" d="M238 46c-3-6-8-9-13-10M238 46c3-6 8-9 13-10"/>
  </g>
</svg>`
}
