import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';

const { PUBLIC_SITE_URL } = loadEnv(process.env.NODE_ENV || 'production', process.cwd(), 'PUBLIC_');

export default defineConfig({
  site: PUBLIC_SITE_URL || 'https://luke-artisan-bakery-reno.renodotdev.chatgpt.site',
  output: 'static', trailingSlash: 'always', devToolbar: { enabled: false },
});
