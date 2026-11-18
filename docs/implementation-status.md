# Implementation status — 14 November 2026

## Implemented

- Premium responsive Astro/TypeScript website using Luke's wordmark, ivory/cocoa/coral palette, locally served fonts and brand photography.
- 57 product families across cakes/desserts, viennoiserie, bread, tarte/choux, celebrations and gifting; priced variants from the officially linked pastry menu.
- 65 generated HTML pages, plus fresh-catalog JSON, sitemap, and configurable robots output.
- Search across product/variant names, accent-insensitive matching, category links, empty states, and browser-history restoration.
- Product details, live variant prices, quantity selection, quick-add for simple products, a thumbnail gallery where source photos are available, related products, and consultation links.
- Saved bag with separate variants, quantity changes/removal, desktop catalog summary, mobile bag bar, integer-IDR subtotals, published 10% tax, and estimated totals.
- Direct keyboard quantity entry on product pages and in the bag, with live totals, retained input focus, Enter/arrow-key support, validation, and persistence.
- Fresh catalog validation before message preparation; stale prices/unavailable items require review and invalid saved selections are explained.
- Pickup name, preferred date/time, notes, WIB validation, 24/48-hour preparation rules, opening-hour checks, and support for confirmed date exceptions.
- Independent custom/mix-cake/hamper inquiries without misleading priced subtotals.
- Working encoded WhatsApp links, readable message review, full-message copy, and an oversized-URL fallback. Input/bag changes invalidate old links. The bag stays intact after opening WhatsApp.
- Canonical/social metadata, Bakery/product/breadcrumb data, 404, ordering FAQ, privacy information, source provenance, and developer maintenance instructions.
- Business contact page, official tagline/Cengli Group attribution, email and social channels, full-menu link, and GoFood/GrabFood links taken from Luke's current link-in-bio page.

## Verification

Eleven focused tests pass for catalog boundaries/assets, bag reconciliation, price changes, unavailable products, integer totals/tax, quote separation, message encoding, large-message fallback, pickup rules/exceptions, customer input validation, and keyboard quantity boundaries.

Astro checks report zero errors/warnings/hints. Static build succeeds. Generated HTML was scanned for one primary heading, canonical/structured metadata, and broken internal links; no issues were found.

Browser checks covered:

- Product/variant search and no-results reset.
- Quick-add and separate plain/almond croissant variants.
- A priced request with Rp118,000 subtotal, Rp11,800 tax, and Rp129,800 estimated total.
- Correct `wa.me/62895403825017` recipient and complete encoded message.
- Quantity changes update totals and remove the prepared stale link.
- A 600-character Unicode note retains its complete message via the copy-and-open fallback.
- A hamper consultation does not change the priced shopping bag.
- Desktop and mobile layouts, source photography, pickup fields, and message review.

No real order message was sent, and no bakery profile was edited. Physical iPhone/Android/Instagram-app handoff and real-user Core Web Vitals remain unmeasured.

## Deployment

On 18 November 2026, deployment preparation targets Vercel. The project includes Astro static build settings, trailing-slash routing, cache/referrer headers and a Node 24 pin. The configuration loads `.env.local` for local builds and gives deployment-provided variables precedence. Local environment files, video assets and unused hosting metadata are excluded from uploads.

Set the two public environment variables in Vercel separately. A live Vercel build, response headers, routing and physical-device WhatsApp handoff remain to be checked after deployment.
