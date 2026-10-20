import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Admin => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET')!,
  },
  apiToken: {
    salt: env('API_TOKEN_SALT')!,
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT')!,
    },
  },
  secrets: {
    encryptionKey: env('ENCRYPTION_KEY')!,
  },
  // Preview of drafts on the website, see web/src/pages/preview.astro
  preview: {
    enabled: env.bool('PREVIEW_ENABLED', true),
    config: {
      allowedOrigins: [env('SITE_URL', 'http://localhost')],
      handler(uid, { documentId, status }) {
        const types: Record<string, string> = { 'api::article.article': 'article', 'api::page.page': 'page' };
        const type = types[uid];
        if (!type || !documentId) return null;

        const params = new URLSearchParams({
          type,
          id: documentId,
          status: status ?? 'draft',
          secret: env('PREVIEW_SECRET', ''),
        });
        return `${env('SITE_URL', 'http://localhost')}/preview?${params}`;
      },
    },
  },
  flags: {
    nps: env.bool('FLAG_NPS', false),
    promoteEE: env.bool('FLAG_PROMOTE_EE', false),
    docLinks: env.bool('FLAG_DOC_LINKS', true),
  },
});

export default config;
