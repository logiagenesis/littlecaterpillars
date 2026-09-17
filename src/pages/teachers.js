import { tile, grid, section, breadcrumbs, crumbLd } from '../partials/components.js'
import { esc, rich, todo } from '../partials/layout.js'

export default function teachers (ctx) {
  const { site, copy } = ctx
  const trail = [{ href: '/', label: 'Home' }, { label: 'Our Team' }]

  const cards = copy.teachers.map(t => tile({
    level: 'h2',
    mark: esc(t.name.slice(0, 1)),
    meta: t.role,
    title: t.name,
    body: `<p>${rich(t.bio)}</p>`
  }))

  return {
    path: '/teachers/',
    title: 'Our Team | The teachers at Little Caterpillars',
    description: 'The six people who look after the children at Little Caterpillars every day — who teaches which class, and what they bring to it.',
    jsonLd: crumbLd(site.origin, trail),
    body: `
<section class="page-head">
  <div class="shell">
    ${breadcrumbs(trail)}
    <h1>Our team</h1>
    <p class="lede">Six people, and the children know all six of them by name.</p>
  </div>
</section>

${section({ body: `${grid(6, cards, 'teachers-grid')}
  <p class="note">${todo(copy.teachersNote)}</p>` })}

${section({
  kind: 'section--sunk',
  heading: 'Come and meet them',
  lede: 'A tour takes about twenty minutes, and you are welcome to bring your child along.',
  body: `<p class="actions"><a class="btn btn--primary" href="/contact/">Book a Visit</a></p>`
})}
`
  }
}
