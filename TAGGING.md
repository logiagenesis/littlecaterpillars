# TAGGING

Every measurement event on littlecaterpillars.co.za: what fires it, what it
carries, and what it maps to in GA4 and Google Ads.

## How the stack is wired

```
consent.js  →  dataLayer  →  GTM container  →  GA4  →  Google Ads
```

GA4 is configured **through GTM only**. There is no hard-coded `gtag()`
alongside it — that double-counts every pageview and is the single most common
way a GA4 property ends up reporting twice the traffic it has.

### One deliberate deviation from the brief

The brief asks for the GTM container in `<head>` with the `<noscript>` iframe
immediately after `<body>`. This build does neither, and the reason is the
brief's own consent requirement.

| Approach | GTM request before consent? |
|---|---|
| GTM in `<head>`, Consent Mode defaults denied | **Yes** — `gtm.js` loads, then withholds tags |
| This build: GTM injected on grant | **No** — nothing is requested at all |

With the banner untouched, the Network tab shows **zero** requests to
`googletagmanager.com`. That is a stricter reading of "nothing fires
pre-consent", and under POPIA it is the safer one for a site whose visitors are
parents of young children.

The `<noscript>` iframe is omitted for the same reason: a visitor without
JavaScript cannot be shown a consent banner, so firing tags for them would be
collecting without consent. The cost is that JS-disabled sessions are not
measured. That is the correct trade.

**Consequence to accept:** consent-granted sessions start measuring roughly
200–400 ms later than they would with GTM in the head. Attribution is
unaffected; the pageview still fires on the same page.

## Consent Mode v2

Pushed before anything else touches the dataLayer, in `src/scripts/consent.js`:

| Signal | Default | On "Accept all" | On "Only what's needed" |
|---|---|---|---|
| `ad_storage` | denied | granted | denied |
| `ad_user_data` | denied | granted | denied |
| `ad_personalization` | denied | granted | denied |
| `analytics_storage` | denied | granted | denied |
| `functionality_storage` | granted | granted | granted |
| `security_storage` | granted | granted | granted |

`wait_for_update: 500`. The choice persists in `localStorage` under
`lc-consent-v2` and the banner does not return.

## Events

| dataLayer `event` | Trigger | Parameters | GA4 event | Ads |
|---|---|---|---|---|
| `generate_lead` | Any `form[data-validate]` passing client validation on submit | `form_name` | `generate_lead` | Primary conversion, via `/thank-you/` |
| `whatsapp_click` | Click on `a[data-track="whatsapp"]` (the FAB) | `link_url` | `whatsapp_click` | Secondary conversion |
| `phone_click` | Click on any `a[href^="tel:"]` | `link_url` | `phone_click` | Secondary conversion |
| `email_click` | Click on any `a[href^="mailto:"]` | `link_url` | `email_click` | — |
| `brochure_download` | Click on any `a[download]` | `file_name` | `brochure_download` | — |
| `gallery_open` | Lightbox opened from a gallery cell | `gallery_category` | `gallery_open` | — |
| `virtual_tour_request` | **Not yet wired.** No virtual tour exists to request. | — | — | — |

`virtual_tour_request` is listed in the brief but has nothing to fire it. It is
left unimplemented rather than bound to an unrelated click; see TODO_CONFIRM.md.

### Where each one lives

- `generate_lead` — `src/scripts/forms.js`, in the submit handler, after
  validation passes and after the time-to-submit check.
- `gallery_open` — `src/scripts/gallery.js`, in the grid click handler.
- The four link events — `src/scripts/main.js`, one delegated `click` listener
  on `document`.

## GA4 configuration

1. Create each event above as a **custom event** in GA4 if you want it in
   Explorations; `generate_lead` is already a recommended event.
2. Register `form_name`, `link_url`, `file_name` and `gallery_category` as
   **custom dimensions** (event-scoped), or they will not appear in reports.
3. Mark `generate_lead`, `whatsapp_click` and `phone_click` as **key events**.

## Google Ads

- **Conversion linker**: enabled in GTM, firing on all pages.
- **Conversion page**: `/thank-you/`, which is `noindex, follow` and excluded
  from `sitemap.xml` and `robots.txt` so it cannot be reached cold.
- **Enhanced conversions**: wired from the `/thank-you/` page load, reading the
  email field. This requires the form POST handler to render `/thank-you/` with
  the hashed email available — see the server note below.
- **Consent Mode**: already handled above; Ads tags respect `ad_storage`.

## Server side — still to build

This repository is the front end. The three form actions
(`/api/visit`, `/api/enrolment`, `/api/swimming`) need a handler that:

1. Re-validates every field server-side. The client validation in `forms.js` is
   a convenience, not a gate.
2. Rejects any submission where the `website` honeypot field is non-empty.
3. Rejects any submission made less than three seconds after page load.
4. Verifies the Cloudflare Turnstile token.
5. Sends via a transactional provider (Postmark or Resend) over TLS.
6. Redirects to `/thank-you/` on success — a real 303 to a real route, not a
   toast, because Ads needs a conversion page.
7. Never persists child medical data in plain text.

## Verification

- [ ] GTM Preview: load the site, leave the banner alone, confirm **no**
      request to `googletagmanager.com` in the Network tab.
- [ ] Accept, reload, confirm exactly **one** `page_view` in GA4 Realtime.
- [ ] Fire each event by hand and confirm its parameters in GTM Preview.
- [ ] Submit a test enquiry and confirm `/thank-you/` registers the Ads
      conversion.
