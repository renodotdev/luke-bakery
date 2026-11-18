import type { Product } from '../data/catalog.ts';

export function validateCatalog(catalog: unknown, categoryIds: string[]): asserts catalog is Product[] {
  if (!Array.isArray(catalog) || !catalog.length || catalog.length > 500) throw new Error('Catalog must contain 1–500 products.');
  const ids = new Set<string>();
  for (const p of catalog) {
    if (!p || typeof p !== 'object' || typeof p.id !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.id) || ids.has(p.id)) throw new Error('Product IDs must be unique URL-safe slugs.');
    ids.add(p.id);
    if (typeof p.name !== 'string' || !p.name.trim() || p.name.length > 150 || !categoryIds.includes(p.category)) throw new Error(`Invalid product: ${p.id}`);
    if (!['fixed', 'inquiry'].includes(p.kind) || !['available', 'preorder', 'unavailable'].includes(p.availability)) throw new Error(`Invalid ordering mode: ${p.id}`);
    if (!Number.isInteger(p.leadHours) || p.leadHours < 0 || p.leadHours > 8760) throw new Error(`Invalid lead time: ${p.id}`);
    if (typeof p.description !== 'string' || !p.description.trim() || typeof p.eyebrow !== 'string' || typeof p.alt !== 'string') throw new Error(`Invalid copy: ${p.id}`);
    if (p.image !== null && (typeof p.image !== 'string' || !/^\/images\/[\w./-]+$/.test(p.image) || p.image.includes('..') || !p.alt.trim())) throw new Error(`Invalid image: ${p.id}`);
    if (p.gallery !== undefined && (!Array.isArray(p.gallery) || p.gallery.length > 10 || p.gallery.some((photo: { src?: unknown; alt?: unknown; label?: unknown }) => !photo || typeof photo.src !== 'string' || !/^\/images\/[\w./-]+$/.test(photo.src) || photo.src.includes('..') || typeof photo.alt !== 'string' || !photo.alt.trim() || typeof photo.label !== 'string' || !photo.label.trim()))) throw new Error(`Invalid gallery: ${p.id}`);
    if (!Array.isArray(p.variants) || !p.variants.length || p.variants.length > 50) throw new Error(`Missing variants: ${p.id}`);
    const variants = new Set<string>();
    for (const v of p.variants) {
      if (!v || typeof v.id !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v.id) || variants.has(v.id) || typeof v.name !== 'string' || !v.name.trim()) throw new Error(`Invalid variant: ${p.id}`);
      variants.add(v.id);
      if (p.kind === 'fixed' ? !Number.isSafeInteger(v.price) || v.price <= 0 || v.price > 100000000 : v.price !== null) throw new Error(`Invalid IDR price: ${p.id}/${v.id}`);
    }
  }
}
