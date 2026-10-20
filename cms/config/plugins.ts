import type { Core } from '@strapi/strapi';

// Bestyrelsen skal kun bruge billeder og PDF
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
      // Max 10 MB pr. fil
      sizeLimit: 10 * 1024 * 1024,
      // Størrelser der laves ved upload (thumbnail laves altid); xlarge er den største, siden bruger
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
