# Catalog and operations maintenance

## Change a product

Edit `src/data/catalog.ts`. Keep the product and variant IDs stable; saved bags refer to them. Rename display names without renaming IDs. Prices are integer rupiah before tax, never formatted strings.

```ts
{
  id: 'saltbread',
  name: 'Saltbread',
  category: 'bread',
  eyebrow: 'From the Luke collection',
  description: 'Approved product copy.',
  image: '/images/saltbread.webp',
  alt: 'Accurate description of the product photo',
  variants: [{ id: 'standard', name: 'Sesuai katalog', price: 18000 }],
  kind: 'fixed',
  availability: 'preorder',
  leadHours: 24,
}
```

The values in this example illustrate the schema; replace copy/photo only with approved assets. For entries in the compact `menuItems` arrays, change the corresponding tuple instead of adding a duplicate product.

Set `availability: 'unavailable'` to stop new additions. Unavailable products are also removed from saved bags during reconciliation, with a customer-facing explanation. Changing a published price updates estimates and requires customers with an older stored price to review their bag.

Customers may type bag quantities directly, use keyboard arrow keys/Enter, or use −/+. Valid quantities update stored selections and totals without rebuilding the active input. An incomplete or invalid edit blocks message preparation; the last valid saved quantity is retained until corrected. The website's per-variant limit is 99; larger requests can go directly to the bakery.

An inquiry uses `kind: 'inquiry'` and variants with `price: null`. It gets a consultation form and never enters the priced bag. Keep variable-price hampers/custom designs as inquiries; do not use a zero-priced placeholder.

Set `featured: true` only for products selected for the homepage. No claim of bestseller status is made. Product photos are optional; compact catalog rows work without an invented photo. Product detail pages use a branded placeholder when a photo is absent.

Optional `gallery` entries supply additional images and thumbnail labels. `imageCutout` / gallery `cutout` display transparent product photos against the parchment background. Maintain useful alt text.

## Pickup hours and exceptions

`store.pickup.opens` and `.closes` define the normal allowed request window in WIB. The end is exclusive: with `closes: '22:00'`, a request must be before 22:00. `leadHours` is applied against the current instant, not rounded down to a calendar day.

Add a confirmed exception when needed:

```ts
pickup: {
  opens: '07:00',
  closes: '22:00',
  exceptions: {
    '2026-12-25': null, // Example only: closed, if the bakery confirms it.
    '2026-12-31': { opens: '09:00', closes: '17:00' }, // Example only.
  },
}
```

No holiday exceptions are assumed in the current data. Keep the visible trading-hours text and field limits aligned if normal hours change; all pickup preferences remain subject to staff confirmation. Configuration changes take effect in newly loaded pages after rebuilding/publishing.

## Contact and platform links

`store.contacts` defines the four public business routes from the official link-in-bio page. Keep `orders` aligned with `store.whatsapp`; the other departments are not checkout recipients. Update `store.email`, `.instagram`, `.tiktok`, `.gofood`, `.grabfood`, and `.fullMenuUrl` only against current official references. Links on `/hubungi/`, the footer, and visit page reuse this configuration. External platform links do not add delivery checkout to this website.

## Publish an update

1. Obtain the bakery's current names, variant prices, availability, and operating rules.
2. Change the structured catalog or store settings and approved image files.
3. Run `npm run validate`; invalid slugs, categories, variants, prices, or image references fail validation.
4. Review the affected product in the local browser, add it to the bag, and inspect the prepared WhatsApp message. Check the subtotal, 10% tax or configured rate, and pickup rules.
5. Current scope is local-only, as chosen by the user on 14 November 2026. Review through the local server. Only if the user later requests publishing, use the existing hosting project and domain.
6. Inspect the published product and `catalog.json` from the same release. Preserve the previous deployment version for rollback.

The release contains no application database or online order/payment records to migrate. To roll back, redeploy the previous saved static version. Saved bags will reconcile against the restored catalog on the next visit/message preparation.

## Operational expectations

The bakery must own the WhatsApp inbox and handle availability, final totals, payment instructions, and pickup acceptance. A link click is not an accepted order. Occasional developer updates suit the chosen maintenance model; if availability changes many times daily, agree a faster update workflow before presenting it as live stock.
