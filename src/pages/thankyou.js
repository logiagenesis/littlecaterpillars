import { section } from '../partials/components.js'

export default function thankyou (ctx) {
  return {
    path: '/thank-you/',
    // Reachable only after a submit, and it is the Ads conversion page, so it
    // must never be indexed on its own.
    noindex: true,
    title: 'Thank you | Little Caterpillars',
    description: 'Your message has reached Little Caterpillars. We will be in touch by email.',
    body: `
<section class="page-head page-head--centre">
  <div class="shell shell--narrow">
    <h1>Thank you</h1>
    <p class="lede">Your message has reached us. We will come back to you by email, usually within a working day.</p>
    <p class="actions">
      <a class="btn btn--primary" href="/">Back to the home page</a>
      <a class="btn btn--ghost" href="/gallery/">Have a look around</a>
    </p>
  </div>
</section>`
  }
}
