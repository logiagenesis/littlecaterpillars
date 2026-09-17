import { section, breadcrumbs, crumbLd, wave } from '../partials/components.js'
import { metamorphosis } from '../partials/icons.js'
import { rich, todo } from '../partials/layout.js'

export default function about (ctx) {
  const { site, copy } = ctx
  const trail = [{ href: '/', label: 'Home' }, { label: 'About' }]
  return {
    path: '/about/',
    title: 'About Little Caterpillars | Our story, mission and vision',
    description: 'How Little Caterpillars began, what we set out to do every day, and the promise we make to the families who trust us with their children.',
    jsonLd: crumbLd(site.origin, trail),
    body: `
<section class="page-head">
  <div class="shell">
    ${breadcrumbs(trail)}
    <h1>Our story</h1>
    <p class="lede">A fun and professional child day care facility in Midrand, run by a team who are as invested in your child as you are.</p>
  </div>
</section>

${section({ body: `<div class="prose">${para(copy.about.story)}</div>` })}

<section class="section section--sunk metamorphosis-band">
  <div class="shell metamorphosis-band__inner">
    ${metamorphosis()}
    <p class="metamorphosis-band__caption">Every caterpillar is on its way somewhere.</p>
  </div>
</section>

${section({ eyebrow: 'Mission', heading: 'What we set out to do', body: `<div class="prose">${para(copy.about.mission)}</div>` })}
${section({ eyebrow: 'Vision', heading: 'Where we are heading', kind: 'section--sunk', body: `<div class="prose">${para(copy.about.vision)}</div>` })}
${section({ eyebrow: 'Our commitment', heading: 'The promise we make to you', body: `<div class="prose">${para(copy.about.commitment)}</div>
  <p class="note">${todo(copy.teachersNote)}</p>
  <p class="actions"><a class="btn btn--primary" href="/contact/">Book a Visit</a>
  <a class="btn btn--secondary" href="/teachers/">Meet the team</a></p>` })}
`
  }
}

const para = t => rich(String(t)).split(/\n\n+/).map(p => `<p>${p}</p>`).join('')
