import type { Core } from '@strapi/strapi';

// The board only needs images and PDF
const allowedMediaTypes = ['image/*', 'application/pdf'];

const deniedTypes = [
  'image/svg+xml',
  'application/vnd.microsoft.portable-executable',
  'application/x-msdownload',
  'application/x-msdos-program',
  'application/x-executable',
  'application/x-dosexec',
  'application/x-sh',
  'text/x-shellscript',
  'application/x-mach-binary',
];

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Plugin => ({
  'users-permissions': {
    config: {
      jwtManagement: 'refresh',
      sessions: {
        httpOnly: true,
      },
    },
  },
  upload: {
    config: {
      // Max 10 MB per file
      sizeLimit: 10 * 1024 * 1024,
      // Sizes generated on upload (thumbnail is always generated); xlarge is the largest the site uses
      breakpoints: {
        xlarge: 1600,
        large: 1000,
        medium: 750,
        small: 500,
      },
      security: {
        allowedTypes: allowedMediaTypes,
        deniedTypes,
      },
    },
  },
});

export default config;
