import { tile, section, breadcrumbs, crumbLd, icon } from '../partials/components.js'
import { esc, rich, todo } from '../partials/layout.js'

export default function fees (ctx) {
  const { site, copy } = ctx
  const trail = [{ href: '/', label: 'Home' }, { label: 'Fees' }]

  const faq = [
    { q: 'Is the enrolment fee refundable?', a: 'No. The enrolment fee is a once-off, non-refundable charge, and no application is processed until proof of payment is received.' },
    { q: 'Do you offer a discount for paying in advance?', a: 'Yes. Paying per term — four payments in advance — carries a 5% discount, and paying annually in advance carries 10%.' },
    { q: 'Is there a sibling discount?', a: 'Yes. The first child pays the full rates and a sibling discount of R300 applies.' },
    { q: 'What happens if I collect late?', a: 'A late collection fee of R70 applies for every 10 minutes after 17:30.' }
  ]

  return {
    path: '/fees/',
    title: 'Fees & Extras | Little Caterpillars, Midrand',
    description: 'Day-care fees at Little Caterpillars: half day and full day rates, term and annual discounts, casual rates, the sibling discount and stationery fees.',
    jsonLd: [crumbLd(site.origin, trail), {
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } }))
    }],
    body: `
<section class="page-head">
  <div class="shell">
    ${breadcrumbs(trail)}
    <h1>Fees &amp; extras</h1>
    <p class="lede">Everything that gets charged, in one table. ${rich(`Rates correct as at ${copy.fees.asAt}`)}</p>
    <p class="note">${esc(copy.fees.sourceNote)}</p>
  </div>
</section>

${section({ body: `
  <div class="table-wrap">
    <table>
      <caption>Day-care fees</caption>
      <thead><tr><th scope="col">Fee</th><th scope="col">What it covers</th><th scope="col" class="num">Amount</th></tr></thead>
      <tbody>
        ${copy.fees.rows.map(r => `<tr>
          <th scope="row">${esc(r.item)}</th>
          <td>${rich(r.detail)}</td>
          <td class="num">${esc(r.amount)}</td>
        </tr>`).join('\n        ')}
      </tbody>
    </table>
  </div>
  <div class="callout callout--warn">
    <h2>One thing we will not guess</h2>
    <p>${esc(copy.fees.defect)}</p>
  </div>`
})}

${section({
  id: 'stationery',
  kind: 'section--sunk',
  eyebrow: 'Stationery',
  heading: 'Stationery fees',
  lede: 'A once-off stationery fee per child, per year, by age group.',
  body: `
  <div class="table-wrap">
    <table>
      <caption>Stationery fee by age group</caption>
      <thead><tr><th scope="col">Age group</th><th scope="col" class="num">Fee</th></tr></thead>
      <tbody>
        ${copy.stationery.rows.map(r => `<tr><th scope="row">${esc(r.ages)}</th><td class="num">${rich(r.amount)}</td></tr>`).join('\n        ')}
      </tbody>
    </table>
  </div>
  <p class="note">${todo(copy.stationery.listsTodo)}</p>`
})}

${section({
  eyebrow: 'Questions',
  heading: 'The things parents ask first',
  body: `<dl class="faq">
    ${faq.map(f => `<dt>${esc(f.q)}</dt><dd>${esc(f.a)}</dd>`).join('\n    ')}
  </dl>`
})}

${section({
  kind: 'section--invert',
  heading: 'Ready to enrol?',
  lede: 'Start with a visit. If it feels right, the enrolment form takes about ten minutes.',
  body: `<p class="actions"><a class="btn btn--primary" href="/contact/">Book a Visit</a>
    <a class="btn btn--ghost" href="/admissions/">Admissions</a></p>`
})}
`
  }
}
