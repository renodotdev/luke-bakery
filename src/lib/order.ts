import type { PickupRules, Product } from '../data/catalog.ts';

export type BagItem = { productId: string; variantId: string; quantity: number; unitPrice?: number };
export type OrderLine = Required<BagItem> & { name: string; variant: string; leadHours: number };
export type CustomerDetails = { name: string; date: string; time: string; notes: string };
export const MAX_QUANTITY = 99;
// Conservative URL budget; longer messages remain complete via copy-and-paste.
export const MAX_WHATSAPP_URL = 6000;
export const money = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
export function quantityError(value: string): string | null {
  const amount = Number(value);
  return !/^\d+$/.test(value) || !Number.isInteger(amount) || amount < 1 || amount > MAX_QUANTITY ? `Masukkan jumlah bulat antara 1 dan ${MAX_QUANTITY}.` : null;
}

export function reconcileBag(input: unknown, catalog: Product[]): { lines: OrderLine[]; notices: string[] } {
  if (!Array.isArray(input)) return { lines: [], notices: input == null ? [] : ['Tas yang tersimpan tidak dapat dibaca. Silakan pilih produk kembali.'] };
  const lines: OrderLine[] = [], notices = new Set<string>();
  for (const raw of input.slice(0, 1000)) {
    if (!raw || typeof raw !== 'object') { notices.add('Pilihan yang tidak valid telah dihapus.'); continue; }
    const product = catalog.find(p => p.id === raw.productId);
    const variant = product?.variants.find(v => v.id === raw.variantId);
    if (!product || !variant || product.availability === 'unavailable' || product.kind !== 'fixed' || variant.price === null) { notices.add(`${product?.name ?? 'Salah satu pilihan'} tidak dapat dipesan dari tas dan telah dihapus.`); continue; }
    if (!Number.isInteger(raw.quantity) || raw.quantity < 1 || raw.quantity > MAX_QUANTITY) { notices.add(`Jumlah ${product.name} tidak valid dan telah dihapus.`); continue; }
    if (typeof raw.unitPrice === 'number' && raw.unitPrice !== variant.price) notices.add(`Harga ${product.name} diperbarui menjadi ${money(variant.price)} per item. Tinjau kembali pilihan Anda.`);
    const existing = lines.find(p => p.productId === raw.productId && p.variantId === raw.variantId);
    if (existing) {
      if (existing.quantity + raw.quantity > MAX_QUANTITY) notices.add(`Jumlah ${product.name} dibatasi ${MAX_QUANTITY} per varian di website.`);
      existing.quantity = Math.min(MAX_QUANTITY, existing.quantity + raw.quantity);
    } else lines.push({ productId: product.id, variantId: variant.id, quantity: raw.quantity, unitPrice: variant.price, name: product.name, variant: variant.name, leadHours: product.leadHours });
  }
  return { lines, notices: [...notices] };
}

export function totals(lines: OrderLine[], taxBps: number) {
  if (!Number.isInteger(taxBps) || taxBps < 0 || taxBps > 10000) throw new Error('Invalid tax rate');
  const subtotal = lines.reduce((sum, line) => {
    if (!Number.isSafeInteger(line.unitPrice) || line.unitPrice <= 0 || !Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > MAX_QUANTITY) throw new Error('Invalid order line');
    return sum + line.unitPrice * line.quantity;
  }, 0);
  const tax = Math.round(subtotal * taxBps / 10000);
  if (!Number.isSafeInteger(subtotal + tax)) throw new Error('Order total is too large');
  return { subtotal, tax, total: subtotal + tax };
}

export function jakartaDate(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}
export function earliestPickupDate(leadHours: number, now = new Date()): string { return jakartaDate(new Date(now.getTime() + leadHours * 3600000)); }
function minutes(time: string): number | null {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) return null;
  const [hours, mins] = time.split(':').map(Number);
  return hours * 60 + mins;
}
export function pickupError(date: string, time: string, leadHours: number, rules: PickupRules, now = new Date()): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || minutes(time) === null) return 'Pilih tanggal dan waktu pengambilan yang valid.';
  const pickup = new Date(`${date}T${time}:00+07:00`);
  if (!Number.isFinite(pickup.getTime()) || jakartaDate(pickup) !== date) return 'Tanggal pengambilan tidak valid.';
  if (pickup.getTime() < now.getTime() + leadHours * 3600000 || pickup.getTime() <= now.getTime()) return leadHours > 0 ? `Pilihan Anda memerlukan waktu persiapan minimal ${leadHours} jam. Pilih waktu yang lebih akhir atau hubungi Luke untuk ketersediaan hari ini.` : 'Pilih waktu pengambilan yang akan datang.';
  const window = Object.hasOwn(rules.exceptions, date) ? rules.exceptions[date] : rules;
  if (window === null) return 'Pengambilan tidak tersedia pada tanggal ini. Pilih tanggal lain.';
  const start = minutes(window.opens), end = minutes(window.closes), selected = minutes(time)!;
  if (start === null || end === null || start >= end) return 'Jadwal pengambilan belum tersedia. Hubungi tim Luke.';
  return selected < start || selected >= end ? `Pilih waktu antara ${window.opens} dan sebelum ${window.closes} WIB.` : null;
}
export function detailsError(details: CustomerDetails, leadHours: number, rules: PickupRules, now = new Date()): string | null {
  if (!details.name.trim() || details.name.trim().length > 80 || /[\r\n]/.test(details.name)) return 'Isi nama Anda, maksimal 80 karakter.';
  if (details.notes.length > 600) return 'Catatan maksimal 600 karakter.';
  return pickupError(details.date, details.time, leadHours, rules, now);
}
export function orderMessage(lines: OrderLine[], details: CustomerDetails, taxBps: number): string {
  if (!lines.length) throw new Error('An order needs at least one product');
  const amount = totals(lines, taxBps);
  const date = new Intl.DateTimeFormat('id-ID', { dateStyle: 'long', timeZone: 'Asia/Jakarta' }).format(new Date(`${details.date}T12:00:00+07:00`));
  return [
    '*Permintaan pesanan · Luke Artisan Bakery*', 'Pengambilan: ambil langsung di toko', '', `Nama: ${details.name.trim()}`, `Preferensi pengambilan: ${date}, ${details.time} WIB`, '', '*Rincian pesanan:*',
    ...lines.map((line, i) => `${i + 1}. ${line.name} — ${line.variant}\n   ${line.quantity} × ${money(line.unitPrice)} = ${money(line.unitPrice * line.quantity)}`), '',
    `Subtotal produk: ${money(amount.subtotal)}`, `Pajak sesuai katalog (${taxBps / 100}%): ${money(amount.tax)}`, `*Estimasi total: ${money(amount.total)}*`,
    ...(details.notes.trim() ? ['', `Catatan: ${details.notes.trim()}`] : []), '', 'Mohon konfirmasi ketersediaan, waktu pengambilan, total akhir, dan cara pembayaran. Pesanan menunggu konfirmasi tim Luke. Terima kasih.',
  ].join('\n');
}
export function inquiryMessage(product: Product, details: CustomerDetails): string {
  return ['Halo Luke Artisan Bakery, saya ingin berkonsultasi mengenai:', `*${product.name}*`, '', `Nama: ${details.name.trim()}`, `Preferensi tanggal: ${details.date}`, `Preferensi waktu: ${details.time} WIB`, ...(details.notes.trim() ? ['', `Kebutuhan / catatan: ${details.notes.trim()}`] : []), '', 'Mohon informasi pilihan, ketersediaan, penawaran harga, dan waktu pengambilan di toko. Terima kasih.'].join('\n');
}
export function whatsappUrl(phone: string, message = ''): string {
  if (!/^[1-9]\d{7,14}$/.test(phone)) throw new Error('Invalid WhatsApp number');
  return `https://wa.me/${phone}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
}
export function handoffLink(phone: string, message: string) {
  const full = whatsappUrl(phone, message);
  return { url: full.length <= MAX_WHATSAPP_URL ? full : whatsappUrl(phone), needsCopy: full.length > MAX_WHATSAPP_URL };
}
