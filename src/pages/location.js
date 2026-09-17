import { section, breadcrumbs, crumbLd, icon, tile } from '../partials/components.js'
import { esc, todo } from '../partials/layout.js'

export default function location (ctx) {
  const { site } = ctx
  const trail = [{ href: '/', label: 'Home' }, { label: 'Location' }]
  return {
    path: '/location/',
    title: 'Location & Directions | Little Caterpillars, Midrand',
    description: 'Where to find Little Caterpillars in Midrand, Gauteng, and how to get here from Vorna Valley, Kyalami, Halfway House, Noordwyk and Carlswald.',
    jsonLd: crumbLd(site.origin, trail),
    body: `
<section class="page-head">
  <div class="shell">
    ${breadcrumbs(trail)}
    <h1>Find us</h1>
    <p class="lede">We are in Midrand, and we serve families across ${esc(site.contact.areaServed.join(', '))}.</p>
  </div>
</section>

${section({ body: `
<div class="split">
  <div>
    ${tile({
      level: 'h2',
      mark: icon('pin'),
      title: 'Little Caterpillars',
      body: `<address>
        ${esc(site.contact.street)}<br>
        ${esc(site.contact.suburb)}, ${esc(site.contact.province)}<br>
        ${esc(site.contact.country)}
      </address>
      <p>${todo(site.contact.streetTodo)}</p>
      <p>${todo(site.contact.postalCodeTodo)}</p>`,
      foot: `<ul class="plain">
        <li>${icon('phone')} <a href="tel:${esc(site.contact.phoneE164)}">${esc(site.contact.phoneDisplay)}</a></li>
        <li>${icon('mail')} <a href="mailto:${esc(site.contact.email)}">${esc(site.contact.email)}</a></li>
      </ul>`
    })}
    <p class="note">${todo(site.contact.hoursTodo)}</p>
  </div>
  <div>
    <div class="map-consent" data-map>
      <p><b>Map</b></p>
      <p>The map is loaded from Google, which sets cookies. We do not load it until you ask us to.</p>
      <p>${todo(site.contact.geoTodo)}</p>
      <button type="button" class="btn btn--secondary" disabled>Show the map</button>
      <p class="note">The button is disabled until the address above is confirmed — we will not publish a pin we cannot verify.</p>
    </div>
  </div>
</div>` })}`
  }
}
