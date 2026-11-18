import type { APIRoute } from 'astro';
import { products, categories } from '../data/catalog';
import { validateCatalog } from '../lib/catalog-validation';
export const GET: APIRoute = () => {
  validateCatalog(products, categories.map(c => c.id));
  return new Response(JSON.stringify({ products }), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
};
