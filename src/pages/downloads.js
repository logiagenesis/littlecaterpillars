import { tile, section, breadcrumbs, crumbLd, icon } from '../partials/components.js'
import { esc, todo } from '../partials/layout.js'

/**
 * Every download link resolves to its own file or is not a link at all.
 * The old site pointed "Aftercare Enrolment" at the swimming PDF; that defect
 * is not reproduced — an item without a file is rendered as a plain,
 * unclickable tile that says so.
 */
export default function downloads (ctx) {
  const { site, documents } = ctx
  const trail = [{ href: '/', label: 'Home' }, { label: 'Downloads' }]

  const items = [
    { title: 'Enrolment form', note: 'The full enrolment pack, for printing and signing.', file: null },
    { title: 'Swimming enrolment & indemnity', note: 'Required before a child joins swimming lessons.', file: null },
    { title: 'Daily routine', note: 'The class routine, from the 06:30 arrival to departure.', file: documents?.routine ?? null },
    { title: 'Weekly programme', note: 'What each day of the week holds.', file: documents?.['weekly-a'] ?? null },
    { title: 'Menu', note: 'The general menu, seven months upward.', file: documents?.['menu-general'] ?? null },
    { title: 'Baby menu', note: 'The Baby Centre menu, three to seven months.', file: documents?.['menu-baby'] ?? null },
    { title: 'Summer menu', note: 'A separate seasonal menu listed on the old site.', file: null },
    { title: 'Winter menu', note: 'A separate seasonal menu listed on the old site.', file: null },
    { title: 'Year planner', note: 'Term dates and the events calendar.', file: null }
  ]

  const cards = items.map(item => item.file
    ? tile({
        level: 'h2',
        mark: icon('download'),
        title: item.title,
        href: item.file,
        body: `<p>${esc(item.note)}</p>`,
        foot: `<a class="link-arrow" href="${esc(item.file)}" download>Download ${icon('arrow')}</a>`
      })
    : tile({
        level: 'h2',
        mark: icon('download'),
        title: item.title,
        body: `<p>${esc(item.note)}</p>`,
        foot: `<p class="todo" role="note"><b>To confirm:</b> the file for “${esc(item.title)}” has not been supplied. No link is published until it resolves to its own file.</p>`,
        className: 'is-pending'
      }))

  return {
    path: '/downloads/',
    title: 'Downloads | Forms, menus and the daily routine',
    description: 'Forms, menus, the class routine and the weekly programme from Little Caterpillars, ready to download.',
    jsonLd: crumbLd(site.origin, trail),
    body: `
<section class="page-head">
  <div class="shell">
    ${breadcrumbs(trail)}
    <h1>Downloads</h1>
    <p class="lede">Every link here opens its own file. Anything we do not have yet says so rather than pointing you at the wrong document.</p>
  </div>
</section>
${section({ body: `<ul class="tile-grid plain downloads-grid" data-cols="3" style="--cols:1">
  ${cards.map(c => `<li>${c}</li>`).join('\n  ')}
</ul>` })}`
  }
}
