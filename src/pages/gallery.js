import { tile, section, breadcrumbs, crumbLd } from '../partials/components.js'
import { esc, todo } from '../partials/layout.js'
import { galleryFilesPresent } from '../../tools/gallery-files.js'

export default function gallery (ctx) {
  const { site, gallery } = ctx
  const trail = [{ href: '/', label: 'Home' }, { label: 'Gallery' }]

  if (!gallery || !galleryFilesPresent()) {
    return {
      path: '/gallery/',
      title: 'Gallery | Little Caterpillars',
      description: 'Photographs from a term at Little Caterpillars — the classes, the playground, the messy days and the dress-up days.',
      jsonLd: crumbLd(site.origin, trail),
      body: `
<section class="page-head">
  <div class="shell">
    ${breadcrumbs(trail)}
    <h1>Gallery</h1>
    <p class="lede">The photographs are held back until the image-consent register is in place.</p>
  </div>
</section>
${section({ body: `<div class="prose">
  <p>No photograph of a child is published from this site until the school has
  written parental consent on file for it. The gallery is built and ready; it
  renders the moment a consent reference exists for every image.</p>
  <p>${todo('{{TODO_CONFIRM: signed image-consent register from the school}}')}</p>
</div>` })}
`
    }
  }

  const covers = gallery.categories.map(c => tile({
    level: 'h2',
    meta: `${c.images.length} photos`,
    title: c.title,
    href: `#${c.slug}`,
    body: `<p>${esc(c.blurb)}</p>`
  }))

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'ImageGallery',
    name: 'Little Caterpillars gallery',
    url: site.origin + '/gallery/',
    image: gallery.categories.flatMap(c => c.images.slice(0, 3)).map(im => ({
      '@type': 'ImageObject',
      contentUrl: site.origin + im.full,
      caption: im.alt,
      width: im.fullWidth,
      height: im.fullHeight
    }))
  }

  return {
    path: '/gallery/',
    title: 'Gallery | A term at Little Caterpillars',
    description: 'Photographs from a term at Little Caterpillars — the Baby Centre, messy play, the playground, dress-up days and the classrooms themselves.',
    jsonLd: [crumbLd(site.origin, trail), ld],
    body: `
<section class="page-head">
  <div class="shell">
    ${breadcrumbs(trail)}
    <h1>Gallery</h1>
    <p class="lede">${gallery.total} photographs from a term at Little Caterpillars, sorted by what is actually going on in them.</p>
  </div>
</section>

${section({ body: `<ul class="tile-grid plain covers-grid" data-cols="4">
  ${covers.map(c => `<li>${c}</li>`).join('\n  ')}
</ul>` })}

<section class="section section--sunk" data-gallery data-category="${esc(gallery.categories[0].slug)}">
  <div class="shell">
    <h2 id="photos">Browse the photographs</h2>
    <div class="gallery-tabs" role="tablist" aria-label="Gallery categories">
      ${gallery.categories.map((c, i) => `<button type="button" role="tab" class="gallery-tab"
        data-category-tab="${esc(c.slug)}" aria-selected="${i === 0}">${esc(c.title)}
        <span class="gallery-tab__n">${c.images.length}</span></button>`).join('\n      ')}
    </div>
    <ul class="gallery-grid plain" aria-live="polite"></ul>
    <noscript>
      <p class="note">The filtered view needs JavaScript. Every photograph is listed below instead.</p>
      ${gallery.categories.map(c => `
        <h3>${esc(c.title)}</h3>
        <ul class="gallery-grid plain">
          ${c.images.map(im => `<li class="gallery-cell"><picture>
            <source type="image/avif" srcset="${esc(im.avif)}" sizes="(min-width:64em) 33vw, (min-width:40em) 50vw, 100vw">
            <source type="image/webp" srcset="${esc(im.webp)}" sizes="(min-width:64em) 33vw, (min-width:40em) 50vw, 100vw">
            <img src="${esc(im.src)}" srcset="${esc(im.srcset)}"
              sizes="(min-width:64em) 33vw, (min-width:40em) 50vw, 100vw"
              width="${im.width}" height="${im.height}" alt="${esc(im.alt)}" loading="lazy" decoding="async">
          </picture></li>`).join('')}
        </ul>`).join('')}
    </noscript>
  </div>
</section>

<script type="application/json" id="gallery-data">${JSON.stringify({ categories: gallery.categories })}</script>
`
  }
}
