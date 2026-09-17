import { tile, section, breadcrumbs, crumbLd, field, honeypot, turnstile, icon } from '../partials/components.js'
import { esc, todo } from '../partials/layout.js'

export default function contact (ctx) {
  const { site, copy } = ctx
  const trail = [{ href: '/', label: 'Home' }, { label: 'Contact' }]
  return {
    path: '/contact/',
    title: 'Contact & Book a Visit | Little Caterpillars, Midrand',
    description: 'Book a tour of Little Caterpillars in Midrand, or get in touch by phone or email. We are always available for you.',
    jsonLd: crumbLd(site.origin, trail),
    body: `
<section class="page-head">
  <div class="shell">
    ${breadcrumbs(trail)}
    <h1>Book a visit</h1>
    <p class="lede">${esc(copy.contactCopy.invite)}</p>
  </div>
</section>

<section class="section">
  <div class="shell split split--form">
    <div>
      <form id="visit" name="visit" class="form" method="post" action="/api/visit" data-validate novalidate>
        <p class="form__summary" role="alert" data-error-summary></p>
        ${field({ name: 'name', label: 'Your name', required: true, autocomplete: 'name' })}
        ${field({ name: 'email', label: 'Email address', type: 'email', required: true, autocomplete: 'email' })}
        ${field({ name: 'phone', label: 'Mobile number', type: 'tel', required: true, autocomplete: 'tel' })}
        ${field({ name: 'child_dob', label: 'Your child’s date of birth', type: 'date', hint: 'So we know which class to show you.' })}
        ${field({ name: 'start', label: 'We’d like to start in…', type: 'month' })}
        ${field({ name: 'visit_when', label: 'When would you like to visit?', type: 'datetime-local' })}
        ${field({ name: 'message', label: 'Anything you’d like us to know', type: 'textarea', rows: 5 })}
        ${honeypot()}
        ${turnstile()}
        <button type="submit" class="btn btn--primary">Send</button>
        <p class="note">We reply by email. We do not pass your details to anyone else — see our <a href="/popia/">POPIA notice</a>.</p>
      </form>
    </div>
    <aside>
      ${tile({
        level: 'h2',
        mark: icon('phone'),
        title: copy.contactCopy.reassurance,
        body: `<ul class="plain contact-list">
          <li>${icon('phone')} <a href="tel:${esc(site.contact.phoneE164)}">${esc(site.contact.phoneDisplay)}</a></li>
          <li>${icon('mail')} <a href="mailto:${esc(site.contact.email)}">${esc(site.contact.email)}</a></li>
          <li>${icon('pin')} ${esc(site.contact.street)}, ${esc(site.contact.suburb)}, ${esc(site.contact.province)}</li>
        </ul>
        <p class="note">${todo(site.contact.phoneTodo)}</p>
        <p class="note">${todo(site.contact.hoursTodo)}</p>`,
        foot: `<a class="link-arrow" href="${esc(site.contact.facebook)}" rel="noopener">Find us on Facebook ${icon('arrow')}</a>`
      })}
    </aside>
  </div>
</section>`
  }
}
