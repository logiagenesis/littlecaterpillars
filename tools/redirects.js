/**
 * Redirect map from BOTH old URL sets to the new routes. 301, no chains.
 *
 * Anything whose destination depends on an unanswered question keeps a
 * {{TODO_CONFIRM}} destination and is deliberately NOT emitted into _redirects
 * or .htaccess — a redirect to a guess is worse than a 404, because it hides
 * the fact that the content is missing.
 */
export const REDIRECTS = [
  { from: '/classes', to: '/classes/' },
  { from: '/rates-extra-s', to: '/fees/' },
  { from: '/meet-the-principle', to: '/teachers/', note: 'Old URL reproduced the "principle" typo. The typo is not reproduced anywhere on the new site.' },
  { from: '/downloads', to: '/downloads/' },
  { from: '/contact-us', to: '/contact/' },
  { from: '/about', to: '/about/' },
  { from: '/our-teachers', to: '/teachers/' },
  { from: '/menus', to: '/menus/' },
  { from: '/stationery-lists', to: '/fees/#stationery' },
  { from: '/enrollment-form', to: '/admissions/enrolment/', note: 'Old URL used the US spelling. The new route uses en-ZA.' },
  { from: '/swimming-enrollment', to: '/admissions/swimming/' },
  { from: '/location', to: '/location/' },
  { from: '/gallery', to: '/gallery/' },
  { from: '/news-events', to: '{{TODO_CONFIRM: the news and events posts are not recoverable from either capture. Confirm whether this section returns, or redirect to /gallery/}}' },
  { from: '/parent-tips', to: '{{TODO_CONFIRM: the parent tips articles are not recoverable from either capture. Confirm whether this section returns, or retire the URL}}' },
  { from: '/kyalami-hills', to: '{{TODO_CONFIRM: campus consolidation}}' },
  { from: '/kyalami-ah', to: '{{TODO_CONFIRM: campus consolidation}}' },
  { from: '/lc-junior', to: '{{TODO_CONFIRM: campus consolidation}}' },
  { from: '/branches', to: '{{TODO_CONFIRM: campus consolidation}}' },
  { from: '/noordwyk', to: '{{TODO_CONFIRM: campus consolidation}}' }
]
