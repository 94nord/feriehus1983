// @ts-check
import { defineConfig, envField } from 'astro/config';

import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  site: 'https://feriehus1983.dk',
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
  env: {
    schema: {
      // Strapi on the internal Docker network, e.g. http://cms:1337
      STRAPI_URL: envField.string({ context: 'server', access: 'secret', default: 'http://localhost:1337' }),
      // Read-only API token, created in the Strapi admin
      STRAPI_TOKEN: envField.string({ context: 'server', access: 'secret', optional: true }),
      // Prefix for images; empty behind Caddy, http://localhost:1337 with npm run dev
      MEDIA_URL: envField.string({ context: 'server', access: 'secret', default: '' }),
      // How long Strapi responses are cached; 0 disables the cache (used in tests)
      // Secret Strapi includes when the admin opens a preview
      PREVIEW_SECRET: envField.string({ context: 'server', access: 'secret', optional: true }),
      // The admin origin allowed to frame the preview
      ADMIN_URL: envField.string({ context: 'server', access: 'secret', default: '' }),
      STRAPI_CACHE_SECONDS: envField.number({ context: 'server', access: 'secret', default: 60 }),
    },
  },
});
