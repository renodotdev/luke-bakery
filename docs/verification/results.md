# Verification record

Date: 14 November 2026. Scope: catalog discovery → product/variant selection → saved bag → fresh catalog check → pickup preferences → prepared WhatsApp request. Custom inquiries use a separate flow. This is a static/client-side website; no order-processing API/database is implied.

## Automated

`npm run validate`: 11 tests pass, Astro type checks pass, static production build succeeds (65 HTML pages).

Generated-page inspection: one H1, canonical link, and JSON-LD on each HTML page; all internal anchor destinations exist in the built output. `robots.txt` defaults to blocking indexing until the public-launch flag is set. Customer fields are initially hidden until JavaScript handlers are attached, preventing accidental native form submissions of personal information.

## Browser observations

| Check | Observed result |
| --- | --- |
| Search “pistachio” in viennoiserie | Croissant family and Pistachioberry Cromboloni returned |
| Unknown search | Zero results, reset restored the catalog |
| Quick-add Pain Au Chocolat | Bag increased by one |
| Plain croissant ×2 plus almond ×1 | Variants remained separate |
| Combined priced bag | Subtotal Rp118,000; tax Rp11,800; total Rp129,800 |
| Prepare pickup message | Correct recipient, products, variants, quantities, amounts, and WIB preference |
| Increase plain croissant quantity | Total updated to Rp154,000; prior message hidden and link removed |
| Long Unicode note | Full text retained; link switched to base chat and copy instructions appeared |
| Restore short note | Encoded-message handoff returned |
| Keyboard quantity edit | Typed values updated totals without losing focus; arrow keys and Enter worked; zero rejected; valid quantity survived reload |
| Hamper inquiry | Quote message generated; priced bag unchanged |
| Official contact directory | Order, service, marketing, purchasing, email, social, menu and platform destinations matched the live link-in-bio page |
| Responsive views | Desktop 1280px and mobile 360px checked for layout/overflow |

The browser inspection stops before sending any message to the bakery. A constructed URL and responsive browser check do not prove delivery or acceptance on a physical phone. Photos are lower resolution than an eventual original-asset photo set; no generated substitutes were used. Further browser checks use a separate localhost origin so they do not modify selections in the user's 127.0.0.1 preview.

## Deployment boundary

Local server responded HTTP 200. On 18 November 2026, the production build was rechecked for Vercel preparation: all 65 generated canonical origins matched `.env.local`, indexing and sitemap used the configured values, and bag/404 pages remained noindex. An isolated configuration check confirmed deployment environment variables override local files. `.env.local` remains Git-ignored. No live Vercel deployment, response-header check or physical-device WhatsApp handoff is implied by these local checks.
