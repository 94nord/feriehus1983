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
      // Strapi på det interne Docker-netværk, fx http://cms:1337
      STRAPI_URL: envField.string({ context: 'server', access: 'secret', default: 'http://localhost:1337' }),
      // API-token med kun læseadgang, oprettes i Strapi-admin
      STRAPI_TOKEN: envField.string({ context: 'server', access: 'secret', optional: true }),
      // Prefix til billeder; tom bag Caddy, http://localhost:1337 ved npm run dev
      MEDIA_URL: envField.string({ context: 'server', access: 'secret', default: '' }),
      // Hvor længe svar fra Strapi caches; 0 slår cachen fra (bruges i tests)
      // Nøgle, som Strapi sender med, når admin åbner en forhåndsvisning
      PREVIEW_SECRET: envField.string({ context: 'server', access: 'secret', optional: true }),
      // Admin-domænet, som må vise forhåndsvisningen i en ramme
      ADMIN_URL: envField.string({ context: 'server', access: 'secret', default: '' }),
      STRAPI_CACHE_SECONDS: envField.number({ context: 'server', access: 'secret', default: 60 }),
    },
  },
});
