import type { Core } from '@strapi/strapi';

const ROLLE_NAVN = 'Bestyrelse';
const SUPER_ADMIN_CODE = 'strapi-super-admin';

// Felter, bestyrelsen kan se og redigere
const FELTER = {
  'api::nyhed.nyhed': ['titel', 'slug', 'uddrag', 'indhold', 'billede'],
  'api::side.side': ['titel', 'slug', 'indhold', 'sortering'],
  'api::link.link': ['titel', 'url', 'beskrivelse', 'sortering'],
} as const;

type Indholdstype = keyof typeof FELTER;

const cm = (handling: string) => `plugin::content-manager.explorer.${handling}`;
const medFelter = (action: string, subject: Indholdstype) => ({
  action,
  subject,
  properties: { fields: [...FELTER[subject]] },
});

/**
 * Bestyrelsens rettigheder. Sættes ved hver opstart, så ændringer i admin
 * nulstilles, og rollen altid er den samme lokalt, i test og i produktion.
 * - Nyheder og sider: opret, læs, ret, publicer/afpublicer (ingen sletning)
 * - Links: opret, læs, ret, slet (links kan ikke afpubliceres)
 * - Mediebibliotek: upload, ret alt-tekst, hent (ingen sletning)
 * - Brugere: invitere og rette brugere med rollen Bestyrelse
 */
const rettigheder = () => [
  ...(['api::nyhed.nyhed', 'api::side.side'] as const).flatMap((subject) => [
    medFelter(cm('create'), subject),
    medFelter(cm('read'), subject),
    medFelter(cm('update'), subject),
    { action: cm('publish'), subject },
  ]),
  medFelter(cm('create'), 'api::link.link'),
  medFelter(cm('read'), 'api::link.link'),
  medFelter(cm('update'), 'api::link.link'),
  { action: cm('delete'), subject: 'api::link.link' },
  { action: 'plugin::upload.read' },
  { action: 'plugin::upload.assets.create' },
  { action: 'plugin::upload.assets.update' },
  { action: 'plugin::upload.assets.download' },
  { action: 'plugin::upload.assets.copy-link' },
  { action: 'admin::users.create' },
  { action: 'admin::users.read' },
  { action: 'admin::users.update' },
  { action: 'admin::roles.read' },
];

async function hentBestyrelsesrolle(strapi: Core.Strapi) {
  return strapi.db.query('admin::role').findOne({ where: { name: ROLLE_NAVN } });
}

const erSuperAdmin = (bruger?: { roles?: { code: string }[] }) =>
  !!bruger?.roles?.some((rolle) => rolle.code === SUPER_ADMIN_CODE);

/**
 * Strapi lader enhver med rettighed til at oprette brugere tildele alle roller,
 * også Super Admin. Brugere, der ikke er Super Admin, må derfor kun tildele
 * rollen Bestyrelse og må ikke rette en Super Admin.
 */
function spaerRolletildeling(strapi: Core.Strapi) {
  strapi.get('controllers').extend('admin::user', (controller: Record<string, (ctx: any) => unknown>) => {
    // Returnerer en fejlbesked, hvis handlingen ikke er tilladt
    async function afvis(ctx: any, maalBrugerId?: string): Promise<string | null> {
      if (erSuperAdmin(ctx.state.user)) return null;

      const bestyrelse = await hentBestyrelsesrolle(strapi);
      const roller: unknown[] = ctx.request.body?.roles ?? [];
      if (roller.some((id) => String(id) !== String(bestyrelse?.id))) {
        return `Du kan kun tildele rollen ${ROLLE_NAVN}`;
      }

      if (maalBrugerId) {
        const maal = await strapi.db.query('admin::user').findOne({ where: { id: maalBrugerId }, populate: ['roles'] });
        if (erSuperAdmin(maal)) return 'Du kan ikke rette en Super Admin';
      }
      return null;
    }

    return {
      ...controller,
      async create(ctx: any) {
        const fejl = await afvis(ctx);
        return fejl ? ctx.forbidden(fejl) : controller.create(ctx);
      },
      async update(ctx: any) {
        const fejl = await afvis(ctx, ctx.params.id);
        return fejl ? ctx.forbidden(fejl) : controller.update(ctx);
      },
    };
  });
}

/**
 * Strapis standardroller Editor og Author bruges ikke. De slettes ved opstart,
 * så kun Super Admin og Bestyrelse findes. En rolle med brugere springes over.
 */
async function fjernStandardroller(strapi: Core.Strapi) {
  const rolleService = strapi.service('admin::role');
  for (const code of ['strapi-editor', 'strapi-author']) {
    const rolle = await strapi.db.query('admin::role').findOne({ where: { code } });
    if (!rolle) continue;

    if ((await rolleService.getUsersCount(rolle.id)) > 0) {
      strapi.log.warn(`Rollen ${rolle.name} har brugere og slettes derfor ikke`);
      continue;
    }
    await rolleService.deleteByIds([rolle.id]);
    strapi.log.info(`Standardrollen ${rolle.name} er slettet`);
  }
}

export default {
  register({ strapi }: { strapi: Core.Strapi }) {
    spaerRolletildeling(strapi);
  },

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    const rolleService = strapi.service('admin::role');
    const rolle =
      (await hentBestyrelsesrolle(strapi)) ??
      (await rolleService.create({ name: ROLLE_NAVN, description: 'Redigerer nyheder, sider og links' }));
    await rolleService.assignPermissions(rolle.id, rettigheder());

    await fjernStandardroller(strapi);
  },
};
