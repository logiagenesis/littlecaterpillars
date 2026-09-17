import { section, breadcrumbs, crumbLd } from '../partials/components.js'
import { esc, todo } from '../partials/layout.js'

const page = (path, heading, lede, body) => ctx => {
  const trail = [{ href: '/', label: 'Home' }, { label: heading }]
  return {
    path,
    title: `${heading} | Little Caterpillars`,
    description: lede,
    jsonLd: crumbLd(ctx.site.origin, trail),
    body: `
<section class="page-head">
  <div class="shell shell--narrow">
    ${breadcrumbs(trail)}
    <h1>${esc(heading)}</h1>
    <p class="lede">${esc(lede)}</p>
  </div>
</section>
<section class="section"><div class="shell shell--narrow prose">${body(ctx)}</div></section>`
  }
}

export const popia = page('/popia/', 'POPIA notice',
  'How Little Caterpillars collects, uses and protects personal information, including children’s information, under POPIA.',
  ctx => `
<h2>Who we are</h2>
<p>Little Caterpillars, ${esc(ctx.site.contact.street)}, ${esc(ctx.site.contact.suburb)}, ${esc(ctx.site.contact.province)}.
You can reach us at <a href="mailto:${esc(ctx.site.contact.email)}">${esc(ctx.site.contact.email)}</a>.</p>
<p>${todo('{{TODO_CONFIRM: the registered entity name and company registration number for the responsible party}}')}</p>
<p>${todo('{{TODO_CONFIRM: the name and contact details of the appointed Information Officer, as registered with the Information Regulator}}')}</p>

<h2>What we collect, and why</h2>
<p>Through this website we collect only what we need to answer you: a parent or
guardian’s name, email address and phone number, the child’s date of birth so
that we know which class to talk to you about, and whatever you choose to write
in the message field.</p>
<p>We deliberately do not collect diagnoses, medication, medical-aid details or
identity numbers of children through this website. That information is recorded
on the signed paper form we keep at the school.</p>

<h2>Children’s information</h2>
<p>A child cannot consent for themselves. We process a child’s personal
information only with the consent of a competent person — a parent or guardian.</p>
<p>No photograph of a child appears on this website unless we hold that
consent in writing. Consent can be withdrawn at any time by emailing us, and the
photograph is removed at the next site update.</p>
<p>${todo('{{TODO_CONFIRM: signed image-consent register from the school}}')}</p>

<h2>How long we keep it</h2>
<p>${todo('{{TODO_CONFIRM: the retention period for website enquiries and for enrolment records}}')}</p>

<h2>Who else sees it</h2>
<p>Website enquiries are delivered to the school by a transactional email
provider over TLS. Analytics and advertising cookies are not set unless you
accept them on the cookie banner, and you can change your mind at any time by
clearing this site’s data in your browser.</p>
<p>${todo('{{TODO_CONFIRM: the transactional email provider to be used, so it can be named here as an operator}}')}</p>

<h2>Your rights</h2>
<p>You may ask us what personal information we hold about you or your child, ask
us to correct or delete it, and object to our processing it. Email us and we will
respond. You may also complain to the Information Regulator of South Africa.</p>`)

export const privacy = page('/privacy/', 'Privacy',
  'What this website stores in your browser, what it measures, and what it does not.',
  () => `
<h2>Cookies and storage</h2>
<p>Nothing is measured until you choose. When you first arrive, this site asks
whether you accept analytics and advertising cookies. Until you accept, no
analytics script is loaded at all — not deferred, not throttled; simply not
requested.</p>
<p>Your choice is stored in this browser so we do not ask again. The gallery
also remembers which category you were looking at, and a part-completed
enrolment form is kept in this browser so a refresh does not cost you the lot.
None of that leaves your device.</p>

<h2>What we measure if you accept</h2>
<p>Which pages are read, which downloads are taken, and whether an enquiry form
was sent. We use this to see whether the site is doing its job.</p>

<h2>Changing your mind</h2>
<p>Clear this site’s data in your browser and the banner will ask again.</p>
<p>For how we handle personal information, see the <a href="/popia/">POPIA notice</a>.</p>`)

export const terms = page('/terms/', 'Terms',
  'The terms on which this website is provided.',
  () => `
<h2>This website</h2>
<p>The information on this website is provided in good faith and kept as accurate
as we can. Fees, menus, routines and programmes change; the figures published
here are the ones we have confirmed and are not an offer.</p>
<p>${todo('{{TODO_CONFIRM: whether the school wants terms of use published at all, and if so whose wording — the section headings below are a structure only and carry no legal undertakings}}')}</p>

<h2>Enrolment</h2>
<p>Enrolment is governed by the signed enrolment contract between the parent or
guardian and Little Caterpillars, not by this website.</p>

<h2>Photographs</h2>
<p>Photographs on this site are published with written parental consent. If you
are a parent and would like a photograph removed, email us and we will remove it.</p>`)
