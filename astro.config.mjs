// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    define: {
      'import.meta.env.STRAPI_URL': JSON.stringify(process.env.STRAPI_URL || 'http://localhost:1337'),
      'import.meta.env.STRAPI_TOKEN': JSON.stringify(process.env.STRAPI_TOKEN || ''),
    }
  }
});