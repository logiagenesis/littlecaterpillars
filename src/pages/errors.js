export const notFound = () => ({
  path: '/404/',
  outFile: '404.html',
  noindex: true,
  title: 'Page not found | Little Caterpillars',
  description: 'That page is not here. Here is the way back.',
  body: `
<section class="page-head page-head--centre error-page">
  <div class="shell shell--narrow">
    <p class="error-page__code">404</p>
    <h1>That page has wandered off</h1>
    <p class="lede">It happens. Nothing is broken — the page you asked for is not at that address.</p>
    <p class="actions">
      <a class="btn btn--primary" href="/">Back to the home page</a>
      <a class="btn btn--ghost" href="/contact/">Book a Visit</a>
    </p>
    <ul class="error-page__links plain">
      <li><a href="/classes/">Classes</a></li>
      <li><a href="/fees/">Fees</a></li>
      <li><a href="/gallery/">Gallery</a></li>
      <li><a href="/menus/">Menus</a></li>
      <li><a href="/downloads/">Downloads</a></li>
    </ul>
  </div>
</section>`
})

export const serverError = () => ({
  path: '/500/',
  outFile: '500.html',
  noindex: true,
  title: 'Something went wrong | Little Caterpillars',
  description: 'Our side broke, not yours. Please try again shortly.',
  body: `
<section class="page-head page-head--centre error-page">
  <div class="shell shell--narrow">
    <p class="error-page__code">500</p>
    <h1>Something went wrong on our side</h1>
    <p class="lede">Not your doing. Try again in a moment — and if it is urgent, phone us rather than waiting on the website.</p>
    <p class="actions">
      <a class="btn btn--primary" href="/">Back to the home page</a>
    </p>
  </div>
</section>`
})
