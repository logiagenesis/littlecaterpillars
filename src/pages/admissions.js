import { tile, section, breadcrumbs, crumbLd, field, honeypot, turnstile, icon } from '../partials/components.js'
import { esc, todo } from '../partials/layout.js'

export function hub (ctx) {
  const { site } = ctx
  const trail = [{ href: '/', label: 'Home' }, { label: 'Admissions' }]
  const faq = [
    { q: 'How do I apply?', a: 'Book a visit first. If Little Caterpillars is right for your family, complete the enrolment form and pay the enrolment fee. No application is processed until proof of payment is received.' },
    { q: 'What do I need to bring?', a: 'Bring your ID, your child’s birth certificate and their immunisation card. Medical details are completed on the signed paper form rather than online.' },
    { q: 'Does my child need a separate form for swimming?', a: 'Yes. Swimming has its own enrolment and indemnity form, which must be signed before a child joins a lesson.' }
  ]
  return {
    path: '/admissions/',
    title: 'Admissions | Enrolling at Little Caterpillars',
    description: 'How to enrol at Little Caterpillars in Midrand: book a visit, complete the enrolment form, and the separate swimming enrolment and indemnity.',
    jsonLd: [crumbLd(site.origin, trail), {
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } }))
    }],
    body: `
<section class="page-head">
  <div class="shell">
    ${breadcrumbs(trail)}
    <h1>Admissions</h1>
    <p class="lede">Three steps, and the first one is just coming to look.</p>
  </div>
</section>

${section({ body: `<ol class="steps plain">
  <li><span class="steps__n">1</span><div><h2>Book a visit</h2><p>Twenty minutes, and you are welcome to bring your child. <a href="/contact/">Book a visit</a>.</p></div></li>
  <li><span class="steps__n">2</span><div><h2>Complete the enrolment form</h2><p>Parent and child details, emergency contacts and the medical section. <a href="/admissions/enrolment/">Start the enrolment form</a>.</p></div></li>
  <li><span class="steps__n">3</span><div><h2>Pay the enrolment fee</h2><p>Once-off and non-refundable. No application is processed until proof of payment is received. <a href="/fees/">See the fees</a>.</p></div></li>
</ol>` })}

${section({ kind: 'section--sunk', body: `<ul class="tile-grid plain" data-cols="2">
  <li>${tile({ mark: icon('download'), title: 'Enrolment form', href: '/admissions/enrolment/', body: '<p>First parent, second parent, student details, medical and emergency contact.</p>' })}</li>
  <li>${tile({ mark: icon('download'), title: 'Swimming enrolment & indemnity', href: '/admissions/swimming/', body: '<p>Required before a child joins swimming lessons.</p>' })}</li>
</ul>` })}

${section({ eyebrow: 'Questions', heading: 'Before you start', body: `<dl class="faq">
  ${faq.map(f => `<dt>${esc(f.q)}</dt><dd>${esc(f.a)}</dd>`).join('')}
</dl>` })}
`
  }
}

const PARENT = who => [
  field({ name: `${who}_name`, label: 'Full name', required: true, autocomplete: 'name' }),
  field({ name: `${who}_id`, label: 'ID number', required: who === 'parent1' }),
  field({ name: `${who}_relationship`, label: 'Relationship to the child', type: 'select', required: who === 'parent1', options: ['Mother', 'Father', 'Guardian', 'Other'] }),
  field({ name: `${who}_phone`, label: 'Mobile number', type: 'tel', required: who === 'parent1', autocomplete: 'tel' }),
  field({ name: `${who}_email`, label: 'Email address', type: 'email', required: who === 'parent1', autocomplete: 'email' }),
  field({ name: `${who}_employer`, label: 'Employer' }),
  field({ name: `${who}_work_phone`, label: 'Work number', type: 'tel' })
].join('')

export function enrolment (ctx) {
  const { site } = ctx
  const trail = [{ href: '/', label: 'Home' }, { href: '/admissions/', label: 'Admissions' }, { label: 'Enrolment form' }]
  const steps = [
    { title: 'First parent', note: 'The account holder.', body: PARENT('parent1') },
    { title: 'Second parent', note: 'If there is one.', body: PARENT('parent2') },
    {
      title: 'Your child',
      note: '',
      body: [
        field({ name: 'child_name', label: 'Child’s full name', required: true }),
        field({ name: 'child_dob', label: 'Date of birth', type: 'date', required: true }),
        field({ name: 'child_gender', label: 'Gender', type: 'select', required: true, options: ['Girl', 'Boy', 'Prefer not to say'] }),
        field({ name: 'child_home_language', label: 'Home language' }),
        field({ name: 'child_start', label: 'We’d like to start in…', type: 'month' }),
        field({ name: 'child_programme', label: 'Half day or full day', type: 'select', options: ['Half day', 'Full day', 'Not sure yet'] })
      ].join('')
    },
    {
      title: 'Medical',
      note: 'Only what we need in order to keep your child safe on the day.',
      body: [
        `<fieldset class="fieldset"><legend>Does your child suffer from any of the following?</legend>
         <p class="field__hint">Tick anything that applies. Detail goes on the signed paper form, not here.</p>
         <ul class="checks plain">
         ${['Asthma', 'Epilepsy', 'Diabetes', 'Eczema', 'Allergies', 'Hearing difficulty', 'Sight difficulty', 'None of these']
            .map((c, i) => `<li><input type="checkbox" id="med-${i}" name="medical" value="${esc(c)}"><label for="med-${i}">${esc(c)}</label></li>`).join('')}
         </ul></fieldset>`,
        field({ name: 'medical_practitioner', label: 'Doctor or clinic' }),
        field({ name: 'medical_practitioner_phone', label: 'Doctor’s number', type: 'tel' }),
        `<p class="callout"><b>We deliberately do not collect diagnoses, medication or medical-aid numbers on this form.</b>
         That detail belongs on the signed paper form we keep at the school, not in a mailbox. See our
         <a href="/popia/">POPIA notice</a>.</p>`
      ].join('')
    },
    {
      title: 'Emergency contact',
      note: 'Someone other than the parents above.',
      body: [
        field({ name: 'emergency_name', label: 'Full name', required: true }),
        field({ name: 'emergency_relationship', label: 'Relationship to the child', required: true }),
        field({ name: 'emergency_phone', label: 'Mobile number', type: 'tel', required: true }),
        field({ name: 'emergency_alt_phone', label: 'Alternative number', type: 'tel' })
      ].join('')
    }
  ]

  return {
    path: '/admissions/enrolment/',
    title: 'Enrolment Form | Little Caterpillars',
    description: 'The Little Caterpillars enrolment form — parent details, your child’s details, the medical section and an emergency contact.',
    jsonLd: crumbLd(site.origin, trail),
    head: NOSCRIPT_STEPS,
    body: formPage({
      trail, heading: 'Enrolment form',
      lede: 'Five short steps. Your answers are kept in this browser as you go, so you can stop and come back.',
      formId: 'enrolment', steps, simpleHref: '/admissions/enrolment/?simple=1'
    })
  }
}

export function swimming (ctx) {
  const { site } = ctx
  const trail = [{ href: '/', label: 'Home' }, { href: '/admissions/', label: 'Admissions' }, { label: 'Swimming enrolment' }]
  const steps = [
    { title: 'First parent', note: 'The account holder.', body: PARENT('parent1') },
    { title: 'Second parent', note: 'If there is one.', body: PARENT('parent2') },
    {
      title: 'Swimming student',
      note: '',
      body: [
        field({ name: 'child_name', label: 'Child’s full name', required: true }),
        field({ name: 'child_dob', label: 'Date of birth', type: 'date', required: true }),
        field({ name: 'swim_experience', label: 'Has your child swum before?', type: 'select', options: ['Never', 'A little', 'Confident in water'] }),
        field({ name: 'swim_notes', label: 'Anything the swimming teacher should know', type: 'textarea', rows: 4 })
      ].join('')
    },
    {
      title: 'Indemnity',
      note: '',
      body: `<fieldset class="fieldset"><legend>Indemnity</legend>
        <p>${todo('{{TODO_CONFIRM: the indemnity wording from the school’s signed swimming form — it is not recoverable from the archive and must not be drafted for them}}')}</p>
        <ul class="checks plain">
          <li><input type="checkbox" id="indemnity" name="indemnity" required>
              <label for="indemnity">I have read and accept the indemnity above.</label></li>
        </ul>
      </fieldset>`
    },
    {
      title: 'Emergency contact',
      note: 'Someone other than the parents above.',
      body: [
        field({ name: 'emergency_name', label: 'Full name', required: true }),
        field({ name: 'emergency_relationship', label: 'Relationship to the child', required: true }),
        field({ name: 'emergency_phone', label: 'Mobile number', type: 'tel', required: true })
      ].join('')
    }
  ]

  return {
    path: '/admissions/swimming/',
    title: 'Swimming Enrolment & Indemnity | Little Caterpillars',
    description: 'The swimming enrolment and indemnity form for Little Caterpillars, required before a child joins a swimming lesson.',
    jsonLd: crumbLd(site.origin, trail),
    head: NOSCRIPT_STEPS,
    body: formPage({
      trail, heading: 'Swimming enrolment & indemnity',
      lede: 'Required before your child joins a swimming lesson.',
      formId: 'swimming', steps, simpleHref: '/admissions/swimming/?simple=1'
    })
  }
}

/**
 * Scripting off: the five steps ship with `hidden` so a normal load never
 * flashes all of them at once, and this un-hides them again. A <noscript>
 * <style> is only parsed when scripting is disabled, so it costs a
 * script-enabled visitor nothing.
 */
const NOSCRIPT_STEPS = `<noscript><style>
  .form__step[hidden] { display: grid !important; }
  .form__step + .form__step { margin-top: 2rem; border-top: 1px solid var(--rule); padding-top: 2rem; }
  .form__nav [data-step-go] { display: none; }
  .progress { display: none; }
</style></noscript>`

function formPage ({ trail, heading, lede, formId, steps, simpleHref }) {
  return `
<section class="page-head">
  <div class="shell">
    ${breadcrumbs(trail)}
    <h1>${esc(heading)}</h1>
    <p class="lede">${esc(lede)}</p>
    <p class="note">Prefer it all on one page? <a href="${esc(simpleHref)}">Use the plain version</a>.</p>
  </div>
</section>

<section class="section">
  <div class="shell shell--narrow">
    <form id="${esc(formId)}" name="${esc(formId)}" class="form" method="post"
          action="/api/${esc(formId)}" data-validate data-steps novalidate>
      <p class="progress" data-step-dots aria-live="polite">Step 1 of ${steps.length}</p>
      <p class="form__summary" role="alert" data-error-summary></p>
      ${steps.map((s, i) => `
      <fieldset class="form__step" data-step hidden>
        <legend class="visually-hidden">${esc(s.title)}</legend>
        <h2 tabindex="-1">${esc(s.title)}</h2>
        ${s.note ? `<p class="lede">${esc(s.note)}</p>` : ''}
        ${s.body}
        ${i === steps.length - 1 ? `${honeypot()}${turnstile()}` : ''}
        <div class="form__nav">
          ${i > 0 ? '<button type="button" class="btn btn--ghost" data-step-go="-1">Back</button>' : ''}
          ${i < steps.length - 1
            ? '<button type="button" class="btn btn--primary" data-step-go="1">Next</button>'
            : '<button type="submit" class="btn btn--primary">Submit</button>'}
        </div>
      </fieldset>`).join('')}
      <noscript>
        <p class="callout">Without JavaScript every step above is shown at once and the form still submits.
        All validation is repeated on the server.</p>
      </noscript>
    </form>
  </div>
</section>`
}
