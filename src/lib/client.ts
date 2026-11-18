import { products as initialProducts, categories, store } from '../data/catalog';
import { validateCatalog } from './catalog-validation';
import { earliestPickupDate, detailsError, handoffLink, inquiryMessage, money, orderMessage, quantityError, reconcileBag, totals, type BagItem, type CustomerDetails, type OrderLine } from './order';

const KEY = 'luke-bag-v2';
let catalog = initialProducts;
let bag: OrderLine[] = [];
let storageAvailable = true;
let notice = '';
let toastTimer: ReturnType<typeof setTimeout>;
const compact = (): BagItem[] => bag.map(({ productId, variantId, quantity, unitPrice }) => ({ productId, variantId, quantity, unitPrice }));

function loadBag() {
  try {
    const saved = localStorage.getItem(KEY) ?? localStorage.getItem('luke-bag-v1');
    const result = reconcileBag(saved ? JSON.parse(saved) : [], catalog);
    bag = result.lines;
    if (result.notices.length) notice = result.notices.join(' ');
  } catch {
    storageAvailable = false;
    notice = 'Tas yang tersimpan tidak dapat dibaca atau penyimpanan browser tidak tersedia. Pilihan baru hanya bertahan di halaman ini.';
  }
}
function announce(message: string) {
  const toast = document.querySelector<HTMLElement>('[data-toast]');
  if (!toast) return;
  clearTimeout(toastTimer); toast.textContent = message; toast.hidden = false;
  toastTimer = setTimeout(() => { toast.hidden = true; }, 4500);
}
function invalidateMessage() {
  const preview = document.querySelector<HTMLElement>('[data-message-preview]');
  if (preview) { preview.hidden = true; preview.querySelector<HTMLAnchorElement>('[data-whatsapp-handoff]')?.removeAttribute('href'); }
}
function saveBag(renderRows = true) {
  try { localStorage.setItem(KEY, JSON.stringify(compact())); localStorage.removeItem('luke-bag-v1'); storageAvailable = true; }
  catch { storageAvailable = false; notice = 'Penyimpanan browser tidak tersedia. Pilihan hanya bertahan di halaman ini; izinkan penyimpanan untuk melanjutkan ke tas.'; }
  invalidateMessage(); renderBag(renderRows);
}
function showError(form: HTMLFormElement, text: string | null) {
  const el = form.querySelector<HTMLElement>('[data-form-error]')!;
  el.hidden = !text; el.textContent = text;
  if (text) el.focus();
}
function readDetails(form: HTMLFormElement): CustomerDetails {
  const data = new FormData(form);
  return { name: String(data.get('name') ?? '').trim(), date: String(data.get('date') ?? ''), time: String(data.get('time') ?? ''), notes: String(data.get('notes') ?? '').trim() };
}
function showMessage(message: string) {
  const preview = document.querySelector<HTMLElement>('[data-message-preview]')!;
  const textarea = preview.querySelector<HTMLTextAreaElement>('[data-message]')!;
  const link = preview.querySelector<HTMLAnchorElement>('[data-whatsapp-handoff]')!;
  const handoff = handoffLink(store.whatsapp, message);
  textarea.value = message; textarea.setSelectionRange(0, 0); textarea.scrollTop = 0; link.href = handoff.url;
  preview.querySelector<HTMLElement>('[data-long-message]')!.hidden = !handoff.needsCopy;
  link.textContent = handoff.needsCopy ? 'Buka WhatsApp setelah menyalin pesan ↗' : 'Lanjut ke WhatsApp ↗';
  preview.hidden = false; textarea.focus();
}
function renderBag(renderRows = true) {
  const count = bag.reduce((sum, item) => sum + item.quantity, 0);
  const amounts = totals(bag, store.taxBps);
  document.querySelectorAll('[data-bag-count]').forEach(el => { el.textContent = String(count); });
  document.querySelector('[data-header-bag]')?.setAttribute('aria-label', `Lihat tas pesanan, ${count} item`);
  const mobile = document.querySelector<HTMLElement>('[data-mobile-bag]');
  if (mobile) mobile.hidden = !count || Boolean(document.querySelector('[data-order], [data-inquiry-form]'));
  document.querySelectorAll('[data-bag-total]').forEach(el => { el.textContent = money(amounts.total); });
  const noticeEl = document.querySelector<HTMLElement>('[data-order-update]');
  if (noticeEl) { noticeEl.textContent = notice; noticeEl.hidden = !notice; }
  const sidebar = document.querySelector<HTMLElement>('[data-catalog-bag]');
  if (sidebar) {
    sidebar.hidden = !count;
    const list = sidebar.querySelector<HTMLElement>('[data-bag-summary]')!;
    list.replaceChildren();
    bag.slice(0, 3).forEach(line => { const li = document.createElement('li'); li.textContent = `${line.quantity} × ${line.name} · ${line.variant}`; list.append(li); });
    if (bag.length > 3) { const li = document.createElement('li'); li.textContent = `+ ${bag.length - 3} pilihan lainnya`; list.append(li); }
  }
  const form = document.querySelector<HTMLFormElement>('[data-pickup-form]');
  if (form) {
    const lead = Math.max(0, ...bag.map(line => line.leadHours));
    (form.elements.namedItem('date') as HTMLInputElement).min = earliestPickupDate(lead);
    form.querySelector('[data-lead-help]')!.textContent = `Pilihan Anda memerlukan persiapan minimal ${lead} jam. Untuk stok etalase hari ini, hubungi tim Luke. Waktu pengambilan tetap menunggu konfirmasi.`;
  }
  const empty = document.querySelector<HTMLElement>('[data-empty-bag]');
  const filled = document.querySelector<HTMLElement>('[data-filled-bag]');
  const container = document.querySelector<HTMLElement>('[data-order-lines]');
  if (!empty || !filled || !container) return;
  empty.hidden = count > 0; filled.hidden = !count;
  document.querySelector('[data-subtotal]')!.textContent = money(amounts.subtotal);
  document.querySelector('[data-tax]')!.textContent = money(amounts.tax);
  document.querySelector('[data-total]')!.textContent = money(amounts.total);
  if (!renderRows) {
    container.querySelectorAll<HTMLElement>('.order-line').forEach(row => {
      const line = bag.find(item => item.productId === row.dataset.product && item.variantId === row.dataset.variant);
      if (!line) return;
      row.querySelector('strong')!.textContent = money(line.unitPrice * line.quantity);
      row.querySelector<HTMLButtonElement>('[data-step="1"]')!.disabled = line.quantity >= 99;
    });
    return;
  }
  container.replaceChildren();
  for (const line of bag) {
    const product = catalog.find(p => p.id === line.productId)!;
    const row = document.createElement('article'); row.className = 'order-line'; row.dataset.product = line.productId; row.dataset.variant = line.variantId;
    row.innerHTML = '<div class="order-thumbnail"></div><div class="order-line-info"><h3></h3><p class="line-variant"></p><p class="line-price"></p><strong></strong><div class="line-controls"><button type="button" data-step="-1">−</button><input type="number" min="1" max="99" step="1" inputmode="numeric" data-line-quantity /><button type="button" data-step="1">+</button><button type="button" class="remove-line" data-remove>Hapus</button></div><p class="quantity-error" data-quantity-error hidden></p></div>';
    const image = document.createElement('img'); image.src = product.image ?? '/images/luke-monogram.jpg'; image.alt = product.alt || product.name; image.width = 90; image.height = 112;
    row.querySelector('.order-thumbnail')!.append(image); if (product.imageCutout) row.querySelector('.order-thumbnail')!.classList.add('cutout-photo');
    row.querySelector('h3')!.textContent = line.name; row.querySelector('.line-variant')!.textContent = line.variant;
    row.querySelector('.line-price')!.textContent = `${money(line.unitPrice)} / item`;
    row.querySelector('strong')!.textContent = money(line.unitPrice * line.quantity);
    const quantity = row.querySelector<HTMLInputElement>('[data-line-quantity]')!;
    quantity.value = String(line.quantity);
    quantity.setAttribute('aria-label', `Jumlah ${line.name}, ${line.variant}`);
    const error = row.querySelector<HTMLElement>('[data-quantity-error]')!;
    error.id = `quantity-error-${line.productId}-${line.variantId}`;
    quantity.setAttribute('aria-describedby', error.id);
    row.querySelector('[data-step="-1"]')!.setAttribute('aria-label', `Kurangi jumlah ${line.name}, ${line.variant}`);
    const plus = row.querySelector<HTMLButtonElement>('[data-step="1"]')!; plus.setAttribute('aria-label', `Tambah jumlah ${line.name}, ${line.variant}`); plus.disabled = line.quantity >= 99;
    row.querySelector('[data-remove]')!.setAttribute('aria-label', `Hapus ${line.name}, ${line.variant}`);
    container.append(row);
  }
}
function addProduct(productId: string, variantId: string, quantity: number) {
  if (storageAvailable) loadBag();
  const result = reconcileBag([{ productId, variantId, quantity }], catalog);
  if (!result.lines.length) { announce('Pilihan ini belum dapat ditambahkan. Buka detail produk untuk melanjutkan.'); return; }
  const selected = result.lines[0];
  const existing = bag.find(item => item.productId === productId && item.variantId === variantId);
  if ((existing?.quantity ?? 0) + quantity > 99) { announce('Maksimal 99 per varian di website. Hubungi Luke untuk jumlah lebih besar.'); return; }
  if (existing) existing.quantity += quantity; else bag.push(selected);
  saveBag(); announce(storageAvailable ? `${selected.name} tersimpan di tas pesanan.` : notice);
}
document.querySelectorAll<HTMLFormElement>('[data-add-form]').forEach(form => {
  const product = catalog.find(p => p.id === form.dataset.product)!;
  form.addEventListener('submit', event => { event.preventDefault(); if (!form.reportValidity()) return; const data = new FormData(form); addProduct(product.id, String(data.get('variant')), Number(data.get('quantity'))); });
  form.querySelector<HTMLSelectElement>('[data-variant-select]')?.addEventListener('change', event => {
    const variant = product.variants.find(v => v.id === (event.target as HTMLSelectElement).value);
    if (variant?.price) document.querySelector('[data-product-price]')!.textContent = money(variant.price);
  });
});
document.querySelectorAll<HTMLButtonElement>('[data-quick-add]').forEach(button => button.addEventListener('click', () => { const product = catalog.find(p => p.id === button.dataset.quickAdd)!; addProduct(product.id, product.variants[0].id, 1); }));
document.querySelectorAll<HTMLButtonElement>('[data-photo-src]').forEach(button => button.addEventListener('click', () => {
  const frame = document.querySelector<HTMLElement>('[data-main-photo]')!;
  const image = frame.querySelector<HTMLImageElement>('img')!;
  image.src = button.dataset.photoSrc!; image.alt = button.dataset.photoAlt!;
  frame.classList.toggle('cutout-photo', button.dataset.photoCutout === 'true');
  document.querySelector('[data-photo-caption]')!.textContent = button.dataset.photoLabel!;
  document.querySelectorAll('[data-photo-src]').forEach(el => el.setAttribute('aria-pressed', String(el === button)));
}));

const orderLines = document.querySelector('[data-order-lines]');
function validateQuantity(input: HTMLInputElement, showMessage = false) {
  const error = quantityError(input.value);
  input.setCustomValidity(error ?? '');
  input.setAttribute('aria-invalid', String(Boolean(error)));
  const message = input.closest('.order-line')!.querySelector<HTMLElement>('[data-quantity-error]')!;
  message.textContent = error; message.hidden = !error || !showMessage;
  return error;
}
orderLines?.addEventListener('input', event => {
  const input = event.target as HTMLInputElement;
  if (!input.matches('[data-line-quantity]')) return;
  invalidateMessage();
  if (validateQuantity(input)) return;
  const row = input.closest<HTMLElement>('.order-line')!;
  if (storageAvailable) loadBag();
  const item = bag.find(item => item.productId === row.dataset.product && item.variantId === row.dataset.variant);
  if (!item) { renderBag(); return; }
  item.quantity = Number(input.value);
  // Preserve the input node and caret while updating quantities and totals.
  saveBag(false);
});
orderLines?.addEventListener('change', event => {
  const input = event.target as HTMLInputElement;
  if (!input.matches('[data-line-quantity]')) return;
  if (!validateQuantity(input, true)) input.value = String(Number(input.value));
});
orderLines?.addEventListener('keydown', event => {
  const input = event.target as HTMLInputElement;
  if (!input.matches('[data-line-quantity]') || (event as KeyboardEvent).key !== 'Enter') return;
  event.preventDefault();
  if (validateQuantity(input, true)) input.reportValidity();
  else { input.value = String(Number(input.value)); announce(`Jumlah diperbarui menjadi ${input.value} item.`); }
});

document.querySelector('[data-order-lines]')?.addEventListener('click', event => {
  const button = (event.target as Element).closest<HTMLButtonElement>('button');
  const row = button?.closest<HTMLElement>('[data-product]'); if (!button || !row) return;
  if (storageAvailable) loadBag();
  const item = bag.find(item => item.productId === row.dataset.product && item.variantId === row.dataset.variant); if (!item) { renderBag(); return; }
  item.quantity = button.hasAttribute('data-remove') ? 0 : Math.min(99, item.quantity + Number(button.dataset.step));
  const removed = item.quantity <= 0; const name = item.name;
  bag = bag.filter(line => line.quantity > 0); saveBag();
  const updated = Array.from(document.querySelectorAll<HTMLElement>('.order-line')).find(el => el.dataset.product === item.productId && el.dataset.variant === item.variantId);
  (updated?.querySelector<HTMLButtonElement>(`[data-step="${button.dataset.step}"]:not(:disabled)`) ?? document.querySelector<HTMLButtonElement>('[data-order-lines] button:not(:disabled)') ?? document.querySelector<HTMLAnchorElement>('[data-empty-bag] a'))?.focus();
  announce(removed ? `${name} dihapus dari tas.` : `${name}: ${item.quantity} item.`);
});

async function refreshCatalog() {
  const response = await fetch('/catalog.json', { cache: 'no-store', signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error('Catalog unavailable');
  const data: unknown = await response.json();
  const next = (data as { products?: unknown })?.products;
  validateCatalog(next, categories.map(c => c.id));
  catalog = next;
}
const pickupForm = document.querySelector<HTMLFormElement>('[data-pickup-form]');
if (pickupForm) {
  pickupForm.addEventListener('input', invalidateMessage);
  pickupForm.addEventListener('submit', async event => {
    event.preventDefault(); invalidateMessage(); if (!pickupForm.reportValidity()) return;
    const invalidQuantity = Array.from(document.querySelectorAll<HTMLInputElement>('[data-line-quantity]')).find(input => validateQuantity(input, true));
    if (invalidQuantity) { invalidQuantity.reportValidity(); return; }
    const button = pickupForm.querySelector<HTMLButtonElement>('[type="submit"]')!; button.disabled = true; button.setAttribute('aria-busy', 'true');
    try {
      let saved: unknown = compact(); await refreshCatalog();
      if (storageAvailable) { try { saved = JSON.parse(localStorage.getItem(KEY) ?? JSON.stringify(saved)); } catch { /* Use this page's selection if browser storage becomes unavailable. */ } }
      const result = reconcileBag(saved, catalog); bag = result.lines;
      notice = result.notices.join(' '); saveBag();
      if (result.notices.length) { showError(pickupForm, 'Katalog diperbarui. Tinjau perubahan pada tas, lalu siapkan pesan kembali.'); return; }
      if (!bag.length) { showError(pickupForm, 'Tambahkan produk ke tas terlebih dahulu.'); return; }
      const details = readDetails(pickupForm);
      const error = detailsError(details, Math.max(...bag.map(p => p.leadHours)), store.pickup); showError(pickupForm, error); if (error) return;
      showMessage(orderMessage(bag, details, store.taxBps));
    } catch { showError(pickupForm, 'Katalog terbaru belum dapat diperiksa. Periksa koneksi lalu coba lagi, atau hubungi Luke langsung melalui WhatsApp.'); }
    finally { button.disabled = false; button.removeAttribute('aria-busy'); }
  });
}
const inquiryForm = document.querySelector<HTMLFormElement>('[data-inquiry-form]');
if (inquiryForm) {
  (inquiryForm.elements.namedItem('date') as HTMLInputElement).min = earliestPickupDate(0);
  inquiryForm.addEventListener('input', invalidateMessage);
  inquiryForm.addEventListener('submit', event => {
    event.preventDefault(); invalidateMessage(); if (!inquiryForm.reportValidity()) return;
    const product = catalog.find(p => p.id === inquiryForm.dataset.product)!; const details = readDetails(inquiryForm);
    const error = detailsError(details, 0, store.pickup); showError(inquiryForm, error); if (error) return;
    showMessage(inquiryMessage(product, details));
  });
}
document.querySelector('[data-copy-message]')?.addEventListener('click', async () => {
  const message = document.querySelector<HTMLTextAreaElement>('[data-message]')!;
  try { await navigator.clipboard.writeText(message.value); announce('Seluruh pesan disalin.'); }
  catch { message.focus(); message.select(); announce('Pilih dan salin seluruh pesan secara manual.'); }
});
document.querySelector('[data-whatsapp-handoff]')?.addEventListener('click', event => {
  const form = pickupForm ?? inquiryForm; if (!form) return;
  const lead = pickupForm ? Math.max(0, ...bag.map(p => p.leadHours)) : 0;
  const error = detailsError(readDetails(form), lead, store.pickup);
  if (error) { event.preventDefault(); invalidateMessage(); showError(form, error); }
});

if (document.querySelector('[data-catalog]')) {
  const filters = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-category-filter]'));
  const search = document.querySelector<HTMLInputElement>('[data-search]')!;
  const normalize = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  let selected = 'semua';
  function applyFilters(updateUrl: 'push' | 'replace' | false = 'push') {
    let count = 0; const term = normalize(search.value.trim());
    filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.categoryFilter === selected)));
    document.querySelectorAll<HTMLElement>('[data-product-card]').forEach(card => { const visible = (selected === 'semua' || card.dataset.category === selected) && normalize(card.dataset.name!).includes(term); card.hidden = !visible; if (visible) count++; });
    document.querySelectorAll<HTMLElement>('[data-catalog-group]').forEach(group => { group.hidden = !group.querySelector('[data-product-card]:not([hidden])'); });
    document.querySelector<HTMLElement>('[data-no-results]')!.hidden = count > 0; document.querySelector('[data-result-count]')!.textContent = `${count} pilihan`;
    if (updateUrl) { const params = new URLSearchParams(); if (selected !== 'semua') params.set('kategori', selected); if (term) params.set('q', search.value.trim()); history[updateUrl === 'replace' ? 'replaceState' : 'pushState'](null, '', `${location.pathname}${params.size ? `?${params}` : ''}`); }
  }
  function restoreFilters() { const params = new URLSearchParams(location.search); selected = filters.some(b => b.dataset.categoryFilter === params.get('kategori')) ? params.get('kategori')! : 'semua'; search.value = params.get('q') ?? ''; applyFilters(false); }
  filters.forEach(button => button.addEventListener('click', () => { selected = button.dataset.categoryFilter!; applyFilters(); }));
  search.addEventListener('input', () => applyFilters('replace'));
  document.querySelector('[data-reset-filter]')?.addEventListener('click', () => { selected = 'semua'; search.value = ''; applyFilters(); search.focus(); });
  window.addEventListener('popstate', restoreFilters); restoreFilters();
}
window.addEventListener('storage', event => {
  if (event.key !== KEY && event.key !== null) return;
  loadBag(); invalidateMessage(); notice = notice || 'Tas diperbarui dari tab lain. Tinjau pilihan Anda sebelum melanjutkan.'; renderBag();
});
window.addEventListener('pageshow', event => { if (event.persisted) { loadBag(); invalidateMessage(); renderBag(); } });
loadBag(); renderBag(); if (notice && !document.querySelector('[data-order]')) announce(notice);
document.querySelectorAll<HTMLElement>('[data-requires-js]').forEach(el => { el.hidden = false; });
