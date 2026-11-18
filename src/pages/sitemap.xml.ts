import type { APIRoute } from 'astro';
import { products } from '../data/catalog';
export const GET: APIRoute = ({ site }) => {
  const routes = ['/', '/katalog/', '/kunjungi/', '/hubungi/', '/cara-pesan/', '/privasi/', ...products.map(p => `/produk/${p.id}/`)];
  const urls = routes.map(path => `<url><loc>${new URL(path, site).href}</loc></url>`).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
