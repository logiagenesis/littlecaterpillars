import { tile, grid, section, breadcrumbs, crumbLd, icon } from '../partials/components.js'
import { esc, rich, todo } from '../partials/layout.js'

export default function classes (ctx) {
  const { site, copy } = ctx
  const trail = [{ href: '/', label: 'Home' }, { label: 'Classes' }]

  const cards = copy.classes.map(c => tile({
    level: 'h2',
    meta: c.ages,
    title: c.name,
    href: `#${c.slug}`,
    body: `<p>${esc(c.subtitle ?? '')}${c.subtitle ? '. ' : ''}${rich(c.facts[0] ?? '')}</p>`,
    className: c.feature ? 'is-feature' : ''
  }))

  return {
    path: '/classes/',
    title: 'Classes at Little Caterpillars | 3 months to 6 years',
    description: 'Butterfly, Dragonfly, Ladybug, Caterpillar and Busy Bees — the five classes at Little Caterpillars and what each year focuses on.',
    jsonLd: crumbLd(site.origin, trail),
    body: `
<section class="page-head">
  <div class="shell">
    ${breadcrumbs(trail)}
    <h1>Five classes</h1>
    <p class="lede">Each class is shaped around what children that age are actually busy learning — not around a timetable inherited from the year above.</p>
  </div>
</section>

${section({ body: grid(5, cards, 'classes-grid') })}

${copy.classes.map((c, i) => `
<section class="section ${i % 2 ? 'section--sunk' : ''} class-detail" id="${esc(c.slug)}">
  <div class="shell class-detail__inner">
    <div class="class-detail__head">
      <p class="eyebrow">${esc(c.ages)}</p>
      <h2>${esc(c.name)}</h2>
      ${c.subtitle ? `<p class="class-detail__sub">${esc(c.subtitle)}</p>` : ''}
    </div>
    <div class="class-detail__body prose">
      <p>${rich(c.body)}</p>
      ${c.facts.length ? `<ul class="ticks">${c.facts.map(f => `<li>${icon('arrow')}<span>${esc(f)}</span></li>`).join('')}</ul>` : ''}
    </div>
  </div>
</section>`).join('')}

${section({
  kind: 'section--invert',
  heading: 'Not sure which class fits?',
  lede: 'Bring your child in and have a look around. We will tell you honestly where they would be happiest.',
  body: `<p class="actions"><a class="btn btn--primary" href="/contact/">Book a Visit</a>
    <a class="btn btn--ghost" href="/fees/">See the fees</a></p>`
})}
`
  }
}
