import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { products, categories, store, type Product } from '../src/data/catalog.ts';
import { validateCatalog } from '../src/lib/catalog-validation.ts';
import { detailsError, earliestPickupDate, handoffLink, inquiryMessage, jakartaDate, orderMessage, pickupError, quantityError, reconcileBag, totals, whatsappUrl } from '../src/lib/order.ts';

const catalog: Product[] = [{ ...products[0], id: 'cake', variants: [{ id: 'small', name: 'Small', price: 120000 }, { id: 'large', name: 'Large', price: 240000 }] }];
const selection = [{ productId: 'cake', variantId: 'small', quantity: 2 }, { productId: 'cake', variantId: 'large', quantity: 1 }];
const now = new Date('2026-11-14T16:00:00Z');
const details = { name: 'Reno & family', date: '2026-11-20', time: '10:00', notes: 'Happy birthday!\nTanpa lilin. 🍰' };

test('the complete catalog is valid and every referenced photo exists', () => {
  validateCatalog(products, categories.map(c => c.id));
  assert.ok(products.length > 40);
  for (const product of products) {
    if (product.image) assert.ok(existsSync(new URL(`../public${product.image}`, import.meta.url)), product.image);
    for (const photo of product.gallery ?? []) assert.ok(existsSync(new URL(`../public${photo.src}`, import.meta.url)), photo.src);
  }
  assert.equal(products.find(p => p.id === 'croissant')!.variants[0].price, 22000);
  assert.equal(products.find(p => p.id === 'sourdough')!.leadHours, 48);
  assert.equal(store.taxBps, 1000);
});

test('catalog validation rejects broken identities, prices, categories and quote modes', () => {
  const invalid = (patch: Partial<Product>) => [{ ...catalog[0], ...patch }];
  const cats = categories.map(c => c.id);
  assert.throws(() => validateCatalog([...products, products[0]], cats));
  assert.throws(() => validateCatalog(invalid({ variants: [{ id: 'small', name: 'Small', price: null }] }), cats));
  assert.throws(() => validateCatalog(invalid({ variants: [{ id: 'small', name: 'Small', price: -1 }] }), cats));
  assert.throws(() => validateCatalog(invalid({ kind: 'inquiry' }), cats));
  assert.throws(() => validateCatalog(invalid({ image: '/images/../private.png' }), cats));
  assert.throws(() => validateCatalog(invalid({ category: 'unknown' }), cats));
});

test('saved selections are sanitized, identical variants merge, and different variants stay separate', () => {
  const result = reconcileBag([...selection, { productId: 'cake', variantId: 'small', quantity: 1 }, { productId: 'missing', variantId: 'x', quantity: 1 }, { productId: 'cake', variantId: 'small', quantity: -1 }, { productId: 'cake', variantId: 'small', quantity: '3' }, null], catalog);
  assert.equal(result.lines.length, 2);
  assert.equal(result.lines[0].quantity, 3);
  assert.ok(result.notices.length);
  assert.equal(reconcileBag('bad', catalog).lines.length, 0);
  assert.equal(reconcileBag(null, catalog).notices.length, 0);
  assert.equal(reconcileBag([{ productId: 'cake', variantId: 'small', quantity: 0.5 }], catalog).lines.length, 0);
});

test('published price changes and sold-out items require customer review', () => {
  const changed = reconcileBag([{ ...selection[0], unitPrice: 110000 }], catalog);
  assert.equal(changed.lines[0].unitPrice, 120000);
  assert.match(changed.notices[0], /Harga.*diperbarui/);
  const unavailable = reconcileBag(selection, [{ ...catalog[0], availability: 'unavailable' }]);
  assert.equal(unavailable.lines.length, 0);
  assert.ok(unavailable.notices.length);
  const bounded = reconcileBag([{ ...selection[0], quantity: 99 }, selection[0]], catalog);
  assert.equal(bounded.lines[0].quantity, 99);
  assert.match(bounded.notices[0], /dibatasi/);
});

test('integer rupiah totals include the configured 10% tax and reject invalid line amounts', () => {
  const bag = reconcileBag(selection, catalog).lines;
  assert.deepEqual(totals(bag, 1000), { subtotal: 480000, tax: 48000, total: 528000 });
  assert.deepEqual(totals([], 1000), { subtotal: 0, tax: 0, total: 0 });
  assert.throws(() => totals([{ ...bag[0], unitPrice: -1 }], 1000));
  assert.throws(() => totals(bag, -1));
});

test('custom inquiries cannot enter the priced shopping bag', () => {
  const quote = products.find(p => p.id === 'hampers-gifts')!;
  assert.equal(reconcileBag([{ productId: quote.id, variantId: quote.variants[0].id, quantity: 1 }], products).lines.length, 0);
  const message = inquiryMessage(quote, details);
  assert.match(message, /Hampers & Gifts/);
  assert.match(message, /penawaran harga/);
  assert.doesNotMatch(message, /Rp\s*0\b/);
});

test('WhatsApp messages preserve variants, totals, Unicode and notes through URL encoding', () => {
  const bag = reconcileBag(selection, catalog).lines;
  const message = orderMessage(bag, details, 1000);
  assert.match(message, /Small/); assert.match(message, /Large/); assert.match(message, /528[.]000/);
  assert.match(message, /10%/); assert.match(message, /20 November 2026/); assert.match(message, /🍰/);
  const url = new URL(whatsappUrl(store.whatsapp, message));
  assert.equal(url.hostname, 'wa.me'); assert.equal(url.pathname, `/${store.whatsapp}`); assert.equal(url.searchParams.get('text'), message);
  assert.throws(() => whatsappUrl('+6289', message)); assert.throws(() => orderMessage([], details, 1000));
});

test('large orders retain their complete message and use the copy-and-open fallback', () => {
  assert.equal(handoffLink(store.whatsapp, 'Halo').needsCopy, false);
  const long = handoffLink(store.whatsapp, '🍰'.repeat(2000));
  assert.equal(long.needsCopy, true); assert.equal(long.url, `https://wa.me/${store.whatsapp}`);
});

test('pickup dates enforce WIB, lead times, operating hours and date exceptions', () => {
  assert.equal(jakartaDate(new Date('2026-11-14T18:00:00Z')), '2026-11-15');
  assert.equal(earliestPickupDate(48, now), '2026-11-16');
  assert.ok(pickupError('2026-11-14', '20:00', 0, store.pickup, now));
  assert.ok(pickupError('2026-02-30', '10:00', 0, store.pickup, now));
  assert.ok(pickupError('2026-11-20', '24:00', 0, store.pickup, now));
  assert.ok(pickupError('2026-11-15', '10:00', 24, store.pickup, now));
  assert.ok(pickupError('2026-11-20', '06:59', 24, store.pickup, now));
  assert.ok(pickupError('2026-11-20', '22:00', 24, store.pickup, now));
  assert.equal(pickupError('2026-11-20', '07:00', 24, store.pickup, now), null);
  assert.equal(pickupError('2026-11-20', '21:59', 24, store.pickup, now), null);
  assert.ok(pickupError('2026-11-20', '10:00', 24, { ...store.pickup, exceptions: { '2026-11-20': null } }, now));
  assert.ok(pickupError('2026-11-20', '10:00', 24, { ...store.pickup, exceptions: { '2026-11-20': { opens: '12:00', closes: '17:00' } } }, now));
  assert.equal(pickupError('2026-11-20', '12:00', 24, { ...store.pickup, exceptions: { '2026-11-20': { opens: '12:00', closes: '17:00' } } }, now), null);
});

test('customer detail boundaries prevent blank, multiline and oversized names or notes', () => {
  assert.equal(detailsError(details, 24, store.pickup, now), null);
  assert.ok(detailsError({ ...details, name: ' ' }, 24, store.pickup, now));
  assert.ok(detailsError({ ...details, name: 'A\nName' }, 24, store.pickup, now));
  assert.ok(detailsError({ ...details, notes: 'x'.repeat(601) }, 24, store.pickup, now));
});

test('keyboard quantities accept whole amounts and reject incomplete or out-of-range edits', () => {
  for (const value of ['1', '12', '99', '01']) assert.equal(quantityError(value), null);
  for (const value of ['', '0', '-1', '100', '1.5', '1e1', 'abc']) assert.ok(quantityError(value), value);
});
