# UI/UX and responsive audit — 18 November 2026

The local website was audited and corrected for reading comfort, heading proportions, touch controls, and the catalog-to-WhatsApp pickup flow. Luke's existing colors, fonts and photography are retained.

## Findings and corrections

| Finding | Evidence before changes | Correction |
| --- | --- | --- |
| Prices and navigation were too small on phones | At 390px, prices were 8.85px, navigation 9.75px, and the introduction 12px | Prices, navigation and supporting copy are now 14px; body paragraphs and form inputs are 16px |
| Headings dominated the reading hierarchy | Mobile page headings were 52.5px beside 12px descriptions and 10.8px form labels | Fluid page/hero headings, 36px mobile form headings, 24–26px product titles, and consistent text-size variables |
| Important controls were difficult to tap | Header navigation was about 27px high; quantity step buttons were 36px wide, and the desktop quantity input was about 39px high | Navigation, quantity controls and icon buttons provide at least 44px targets; primary buttons remain at least 54px high |
| Tablet product cards were crowded | The 768px catalog displayed four narrow cards in a row | Two-column cards through 1100px; product and pickup layouts stack through 900px |
| Narrow pickup fields lacked room | Paired date/time fields shared an already padded phone panel | Date/time fields stack at 480px and below, and in narrow desktop checkout columns |
| Cart wording was inconsistent with the requested terminology | Product button, header, notices and help pages used “tas” | “Tambah ke keranjang”, “Keranjang”, and matching terminology throughout customer-facing text and accessible labels |

The mobile header now uses normal grid flow, avoiding reliance on absolutely positioned navigation. The floating keranjang bar places its total on a second line on small phones and uses a compact single row on tablets. Bottom padding accounts for the bar and safe-area inset. Long content columns can shrink and wrap, and the pickup panel scrolls normally.

## Type scale

Sizes below assume the browser's default 16px text setting. The root uses `100%`, and ordinary reading sizes use `rem` values.

| Role | Current size |
| --- | --- |
| Hero heading | 44–88px, depending on viewport and layout |
| Main page heading | 44–88px |
| Product heading | 40–72px; 44px on phones/tablets |
| Mobile pickup/contact section heading | 36px |
| Product card title | 24–26px |
| Paragraphs, search and form values | 16px |
| Prices, labels, buttons and supporting copy | 14px |
| Eyebrows and editorial captions | 12px |
| Decorative photo indexes and logo lettering | 8–10px; not used for purchase decisions or controls |

## Browser verification

Nine page types were checked: homepage, catalog, priced product, custom inquiry, filled order, contacts, store visit, ordering instructions and privacy.

| Viewport | Coverage |
| --- | --- |
| 320 × 740 | Small phone |
| 360 × 800 | Android-size phone |
| 390 × 844 | Phone |
| 430 × 932 | Large phone |
| 768 × 1024 | Portrait tablet |
| 844 × 390 | Landscape phone |
| 1024 × 768 | Landscape tablet |
| 1280 × 800 | Laptop |
| 1440 × 900 | Desktop |
| 1920 × 1080 | Wide desktop |

The evidence contains 178 layout records:

- 90 page/resolution checks.
- 32 checks at the 480/481, 900/901, 1000/1001 and 1100/1101 breakpoint boundaries.
- 20 empty catalog/order checks.
- 9 checks at 640 × 450, a 200% desktop-zoom-equivalent CSS viewport.
- 15 checks around the tablet keranjang-bar refinement.
- 12 final heading-hierarchy checks.

Assertions confirmed no detected horizontal overflow, no primary buttons/inputs/navigation targets below 44px, and no sampled reading/control text below 14px. Representative screenshots were visually inspected. These measurements do not replace checking every possible overlap or device/browser combination.

The priced flow was exercised through message review. Typing 12 in the Tiramisu quantity input retained keyboard focus and updated the total to Rp4.620.000. Arrow Down changed it to 11 and Rp4.235.000; the demo selection was then restored to 3. Name/date/time fields and the prepared WhatsApp message worked. A custom inquiry kept the priced selection intact. A 600-character multibyte note triggered the long-message fallback at 320px; its longer button label wrapped to a 74px-high target without overflow. No message was sent.

No browser console errors were observed. `npm run validate` passes all 11 tests, reports zero Astro errors/warnings/hints, and builds 65 pages.

## Contrast spot checks

The unchanged palette was checked using WCAG relative-luminance calculations:

| Pair | Ratio |
| --- | --- |
| Cocoa body / ivory | 14.07:1 |
| Muted text / ivory | 5.04:1 |
| Muted text / paper | 4.55:1 |
| Ivory / primary button | 14.07:1 |
| White / WhatsApp button | 6.78:1 |
| Large hero accent / ivory | 4.17:1 |

16px body copy and 44px controls are design targets for this site, not a claim that WCAG mandates those sizes for all text and controls. Reference: [W3C reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html), [target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html), and [text resizing](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html).

## Evidence and limits

- [Mobile home](responsive/after-home-390.jpg)
- [Mobile product and updated button](responsive/after-product-390.jpg)
- [Mobile pickup form](responsive/after-pickup-390.jpg)
- [Tablet catalog](responsive/after-catalog-768.jpg)
- [Tablet product cards](responsive/after-catalog-cards-768.jpg)
- [Desktop home](responsive/after-home-1440.jpg)
- [Main layout measurements](responsive/after.json)

Checks used browser viewport overrides on the local website. Physical iPhone/Android devices, Safari/Firefox, native browser text-only zoom, operating-system font settings and a live Vercel deployment were not tested. Zoom-equivalent reflow is not an actual browser-zoom test or a full accessibility certification. The existing presentation MP4 contains the previous UI and was not regenerated for this audit.
