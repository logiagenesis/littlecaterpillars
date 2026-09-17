import { tile, grid, section, wave, icon } from '../partials/components.js'
import { esc, rich, todo } from '../partials/layout.js'

export default function home (ctx) {
  const { site, copy, hero } = ctx

  const classCards = copy.classes.map(c => tile({
    meta: c.ages,
    title: c.name,
    href: `/classes/#${c.slug}`,
    body: `<p>${rich(c.subtitle ? `${c.subtitle}. ${firstSentence(c.body)}` : firstSentence(c.body))}</p>`,
    className: c.feature ? 'is-feature' : ''
  }))

  return {
    path: '/',
    title: site.meta.title,
    description: site.meta.description,
    jsonLd: ctx.ld.childCare,
    body: `
<section class="hero" data-hero>
  <div class="hero__media" data-parallax>
    ${hero
      ? `<picture>
           <source type="image/avif" srcset="${hero.srcset.avif}" sizes="100vw">
           <source type="image/webp" srcset="${hero.srcset.webp}" sizes="100vw">
           <img src="${hero.src}" alt="${esc(hero.alt)}" width="1600" height="2000"
                fetchpriority="high" decoding="async">
         </picture>`
      : `<div class="hero__stand-in" role="img" aria-label="Little Caterpillars, Midrand"></div>`}
  </div>
  <div class="shell hero__inner">
    <p class="hero__eyebrow">Nursery School · Creche · Preschool · Midrand</p>
    <h1 class="hero__title">Their Future,<br>Our Passion.</h1>
    <p class="hero__lede">A home away from home for children from three months to six years.</p>
    <p class="hero__actions">
      <a class="btn btn--primary" href="/contact/">Book a Visit</a>
      <a class="btn btn--ghost" href="/classes/">See the classes</a>
    </p>
  </div>
</section>

${wave('transparent', 'var(--ground)')}

${section({
  eyebrow: 'Welcome',
  heading: 'A fun and professional child day care facility',
  lede: firstSentences(copy.about.story, 2),
  body: `
    <ul class="stats tile-grid plain" data-cols="3">
      <li>${tile({ mark: icon('clock'), title: '3 months – 6 years', body: '<p>From the Baby Centre through to the reception year, on one campus.</p>' })}</li>
      <li>${tile({ mark: icon('caterpillar'), title: 'Five classes', body: '<p>Butterfly, Dragonfly, Ladybug, Caterpillar and Busy Bees.</p>' })}</li>
      <li>${tile({ mark: icon('pin'), title: 'Midrand', body: `<p>${esc(site.contact.street)}, ${esc(site.contact.suburb)}. ${todo(site.contact.postalCodeTodo)}</p>` })}</li>
    </ul>
    <p><a class="link-arrow" href="/about/">Read our story ${icon('arrow')}</a></p>`
})}

${section({
  kind: 'section--sunk',
  eyebrow: 'Classes',
  heading: 'Where your child will land',
  lede: 'Five classes, each shaped around what children that age are actually busy learning.',
  body: `${grid(5, classCards, 'classes-grid')}
    <p><a class="link-arrow" href="/classes/">All five classes in detail ${icon('arrow')}</a></p>`
})}

${section({
  eyebrow: 'Our day',
  heading: 'A happy routine, a bright day',
  lede: 'The shape of a day at Little Caterpillars, from the 06:30 arrival to the last snack.',
  body: `
    <ol class="day-strip plain">
      ${ctx.programme.routine.rows.filter((_, i) => [0, 3, 5, 7, 9, 13, 15].includes(i)).map(r => `
        <li><span class="day-strip__time">${esc(r.time)}</span><span class="day-strip__what">${esc(r.activity)}</span></li>`).join('')}
    </ol>
    <p><a class="link-arrow" href="/menus/#routine">The full daily routine ${icon('arrow')}</a></p>`
})}

${section({
  kind: 'section--invert',
  eyebrow: 'Come and see',
  heading: 'At Little Caterpillars we are always available for you',
  lede: copy.contactCopy.invite,
  body: `<p class="actions">
    <a class="btn btn--primary" href="/contact/">Book a Visit</a>
    <a class="btn btn--ghost" href="tel:${esc(site.contact.phoneE164)}">${icon('phone')} ${esc(site.contact.phoneDisplay)}</a>
  </p>
  <p class="note">${todo(site.contact.phoneTodo)}</p>`
})}
`
  }
}

const firstSentence = t => String(t).split(/(?<=\.)\s/)[0]
const firstSentences = (t, n) => String(t).split(/(?<=[.!])\s/).slice(0, n).join(' ')
