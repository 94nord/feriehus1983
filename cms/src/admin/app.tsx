import type { StrapiApp } from '@strapi/strapi/admin';
import logo from './extensions/logo.svg';

// Danish as the default language. Runs before the admin starts; a user who has
// chosen another language in their profile keeps it.
try {
  if (!localStorage.getItem('strapi-admin-language')) {
    localStorage.setItem('strapi-admin-language', 'da');
  }
} catch {
  // localStorage is unavailable; Strapi falls back to English
}

// Petrol from DESIGN.md, converted to hex
const petrolTheme = {
  primary100: '#e3eff2',
  primary200: '#bcd6dd',
  primary500: '#3a6a77',
  primary600: '#1f4b57',
  primary700: '#093641',
  buttonPrimary500: '#3a6a77',
  buttonPrimary600: '#1f4b57',
};

// Password reset is blocked (no email); a Super Admin sets a new password.
// The texts are shown to users and stay Danish.
const texts = {
  'Auth.form.welcome.title': 'Velkommen',
  'Auth.form.welcome.subtitle': 'Log ind for at redigere Feriehusforeningen af 1983',
  'Auth.link.forgot-password': 'Glemt adgangskode?',
  'Auth.form.button.password-recovery': 'Kontakt foreningens tekniske ansvarlige for at få en ny adgangskode',
  'Auth.link.ready': 'Tilbage til login',
  'app.components.LeftMenu.navbrand.title': 'Feriehusforeningen af 1983',
  'app.components.LeftMenu.navbrand.workplace': 'Redigering',
};

export default {
  config: {
    locales: ['da'],
    auth: { logo },
    menu: { logo },
    head: { favicon: logo },
    theme: {
      light: { colors: petrolTheme },
      dark: { colors: petrolTheme },
    },
    translations: { da: texts, en: texts },
    tutorials: false,
    notifications: { releases: false },
  },
  bootstrap(app: StrapiApp) {
    // The board only needs text, headings, lists, links and images in the editor
    const contentManager = app.getPlugin('content-manager') as unknown as {
      apis: { addRichTextBlocks: (fn: (blocks: Record<string, unknown>) => Record<string, unknown>) => void };
    };
    contentManager.apis.addRichTextBlocks(({ quote, code, ...blocks }) => blocks);
  },
};
