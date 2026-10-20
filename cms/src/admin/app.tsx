import logo from './extensions/logo.svg';

// Dansk som standardsprog. Køres før admin starter; en bruger, der har valgt
// et andet sprog under sin profil, beholder det.
try {
  if (!localStorage.getItem('strapi-admin-language')) {
    localStorage.setItem('strapi-admin-language', 'da');
  }
} catch {
  // localStorage er ikke tilgængelig; Strapi falder tilbage til engelsk
}

// Klitrose fra DESIGN.md, omregnet til hex
const klitrose = {
  primary100: '#fdeaf4',
  primary200: '#f6c8e1',
  primary500: '#af4a88',
  primary600: '#932c6e',
  primary700: '#6f1c52',
  buttonPrimary500: '#af4a88',
  buttonPrimary600: '#932c6e',
};

// Glemt adgangskode er spærret (ingen e-mail); en Super Admin sætter ny adgangskode
const tekster = {
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
    // Dansk er tilgængeligt i admin; hver bruger vælger sprog under sin profil
    locales: ['da'],
    auth: { logo },
    menu: { logo },
    head: { favicon: logo },
    theme: {
      light: { colors: klitrose },
      dark: { colors: klitrose },
    },
    translations: { da: tekster, en: tekster },
    tutorials: false,
    notifications: { releases: false },
  },
  bootstrap() {},
};
