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
  // Forhåndsvisning af kladder på hjemmesiden, se web/src/pages/preview.astro
  preview: {
    enabled: env.bool('PREVIEW_ENABLED', true),
    config: {
      allowedOrigins: [env('SITE_URL', 'http://localhost')],
      handler(uid, { documentId, status }) {
        const typer: Record<string, string> = { 'api::nyhed.nyhed': 'nyhed', 'api::side.side': 'side' };
        const type = typer[uid];
        if (!type || !documentId) return null;

        const params = new URLSearchParams({
          type,
          id: documentId,
          status: status ?? 'draft',
          hemmelighed: env('PREVIEW_SECRET', ''),
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
