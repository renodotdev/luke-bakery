# Luke Artisan Bakery

A complete Astro/TypeScript catalog with **57 product families**, published variant prices, a persistent shopping bag, tax estimates, pickup preferences, custom-order inquiries, and WhatsApp handoff. Orders are requests for **store pickup** and require confirmation by the bakery. There are no customer accounts, website payments, delivery checkout, or staff CMS.

## Run locally

Use Node 24 (`.nvmrc` and `package.json`).

```sh
nvm use
npm ci
npm run dev
```

Open the Local URL printed by Astro (normally `http://127.0.0.1:4321`). Astro 7 runs its development server in the background; stop it with `npx astro dev stop`.

## Verify and build

```sh
npm run validate
```

This runs eleven focused tests, Astro type checks, and a static production build. The build produces **65 HTML pages** plus `catalog.json`, `robots.txt`, `sitemap.xml`, fonts, and images in `dist/`.

`npm run preview` serves the built output. No application secrets or backend credentials are required.

## Catalog maintenance

Edit `src/data/catalog.ts`; see [the maintenance guide](docs/maintenance.md) for examples.

- Prices are positive integer rupiah and exclude the published 10% tax. `store.taxBps` is the tax rate in basis points (`1000` = 10%).
- A `fixed` product has priced variants and can enter the bag. An `inquiry` product has null prices and a separate consultation flow.
- Availability is manually maintained: `available`, `preorder`, or `unavailable`. The site does not reserve stock.
- Pre-orders use the public menu's one-day preparation guidance; sourdough uses two days. A direct contact link covers inquiries about same-day display stock.
- The browser stores product IDs, variant IDs, quantities, and last-seen prices. It does not persist customer names, notes, or pickup details.
- Quantities can be typed directly on product pages and in the bag. Bag inputs preserve keyboard focus/caret while totals update, support arrow keys and Enter, and reject incomplete/out-of-range values before preparing a message.
- Before preparing a priced message, the client fetches `catalog.json` without browser caching. Changed prices, removed variants, and unavailable products require a review before another message can be prepared.
- Messages include variant/quantity details, subtotal, tax, estimated total, pickup preference, and notes. Customers must press Send in WhatsApp. The bag is never cleared just because the link was opened.
- Oversized encoded URLs fall back to copying the complete message and opening the base business chat.

Prices and menu rules come from Luke's [officially linked pastry menu](https://drive.google.com/file/d/1R-aJGA89MF1FQD4YXoH9yqAGw4an3doa/view), checked 14 November 2026. See [source provenance](docs/catalog-sources.md). The bakery confirms current availability, final price, payment instructions, and pickup time in WhatsApp.

The `/hubungi/` page carries the business contacts and links from the [official link-in-bio](https://msha.ke/lukeartisanbakery): orders/reservations, customer service, marketing, purchasing, email, Instagram, TikTok, full menu, GoFood, and GrabFood. Website checkout stays pickup-only and uses the order number, while other departments have their own clearly labeled links.

## Domain and search indexing

Copy `.env.example` to `.env.local` when configuring the final domain locally. `PUBLIC_SITE_URL` controls the canonical origin. `PUBLIC_INDEXABLE=false` keeps the site out of search for private review. For an intended public launch, set it to `true` and rebuild; the generated robots file will permit public content and reference the sitemap. The bag and 404 pages stay noindex. Environment variables supplied by the deployment platform take precedence over local files.

The layout includes canonical links, social-sharing metadata, Bakery data, priced product offers, and product breadcrumbs. Fonts and photos are served locally. No analytics or Instagram-feed scripts are installed.

Static hosting must serve clean directory URLs and `404.html`. `vercel.json` supplies the Vercel routing, cache and referrer settings, including revalidation of `catalog.json`. `public/_headers` retains equivalent headers for hosts that support that file format.

## Vercel deployment

Import this repository with its root directory set to the project root. The framework is Astro, the build command is `npm run build`, and the output directory is `dist`. Node 24 is pinned in `package.json`; no server adapter or database is needed.

Set `PUBLIC_SITE_URL` to the intended HTTPS origin in Vercel's project environment variables. Set `PUBLIC_INDEXABLE=true` for the public production site and `false` for previews, then rebuild. Local `.env.local` values are ignored by Git and excluded from Vercel uploads, so configure the variables in Vercel separately.

`.vercelignore` excludes local environment files, presentation videos, documentation and unused hosting metadata from CLI uploads. After deployment, verify page routes, the 404 response, response headers and mobile WhatsApp handoff. A successful local build does not confirm a live Vercel deployment.

## Verification and limits

See [implementation status](docs/implementation-status.md) and [verification evidence](docs/verification/results.md). Browser tests covered priced checkout, separate variants, custom inquiries, long-message fallback, and responsive layouts. No test order was sent to the bakery. Physical iPhone/Android/Instagram-app handoff and real-user Core Web Vitals require device/traffic verification beyond the local browser.

## Presentation video

The presentation walkthrough remains local under `videos/`; it is not required for the website build or included in the deployment commit.
