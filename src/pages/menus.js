import { section, breadcrumbs, crumbLd } from '../partials/components.js'
import { esc, rich, todo } from '../partials/layout.js'

export default function menus (ctx) {
  const { site, programme } = ctx
  const trail = [{ href: '/', label: 'Home' }, { label: 'Menus' }]
  const days = programme.days

  const menuTable = m => `
  <div class="table-wrap">
    <table>
      <caption>${esc(m.title)} — ${rich(m.ages)}</caption>
      <thead>
        <tr><th scope="col">Meal</th>${days.map(d => `<th scope="col">${esc(d)}</th>`).join('')}</tr>
      </thead>
      <tbody>
        ${m.slots.map(s => `<tr>
          <th scope="row">${esc(s.slot)}<span class="cell-time">${esc(s.time)}</span></th>
          ${s.days.map(v => `<td>${esc(v)}</td>`).join('')}
        </tr>`).join('\n        ')}
      </tbody>
    </table>
  </div>
  ${m.footer ? `<p class="menu-footer">${esc(m.footer)}</p>` : ''}`

  return {
    path: '/menus/',
    title: 'Menus & Daily Routine | Little Caterpillars',
    description: 'What the children eat and how the day runs at Little Caterpillars — the baby menu, the general menu, the class routine and the weekly programme.',
    jsonLd: crumbLd(site.origin, trail),
    body: `
<section class="page-head">
  <div class="shell">
    ${breadcrumbs(trail)}
    <h1>Menus &amp; the day</h1>
    <p class="lede">What the children eat, and the shape of the day they eat it in.</p>
  </div>
</section>

${section({
  eyebrow: 'Menus',
  heading: 'What is on the table',
  body: `${programme.menus.map(menuTable).join('\n')}
    <p class="note">${todo(programme.menusTodo)}</p>`
})}

${section({
  id: 'routine',
  kind: 'section--sunk',
  eyebrow: programme.routine.kicker,
  heading: programme.routine.title,
  lede: programme.routine.note,
  body: `
  <div class="table-wrap">
    <table class="routine">
      <caption>Class routine</caption>
      <thead><tr><th scope="col">Time</th><th scope="col">Activity</th></tr></thead>
      <tbody>
        ${programme.routine.rows.map(r => `<tr>
          <th scope="row" class="routine__time">${esc(r.time)}</th>
          <td><b>${esc(r.activity)}</b>${r.detail ? `<span class="routine__detail">${esc(r.detail)}</span>` : ''}</td>
        </tr>`).join('\n        ')}
      </tbody>
    </table>
  </div>
  <p class="note">${todo(programme.routine.defect)}</p>`
})}

${section({
  id: 'weekly',
  eyebrow: 'Weekly programme',
  heading: 'What each day of the week holds',
  lede: 'The school runs two weekly programmes. Both are reproduced here exactly as they are printed.',
  body: programme.weeklyProgrammes.map(w => `
    <article class="weekly">
      <h3>${esc(w.title)}</h3>
      <p class="note">${todo(w.classTodo)}</p>
      <ol class="weekly__days plain">
        ${w.days.map(d => `<li><h4>${esc(d.day)}</h4><ul>${d.items.map(i => `<li>${esc(i)}</li>`).join('')}</ul></li>`).join('\n        ')}
      </ol>
      <p class="weekly__footer">${esc(w.footer)}</p>
    </article>`).join('\n')
})}
`
  }
}
