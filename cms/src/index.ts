import type { Core } from '@strapi/strapi';

// The role name is shown in the admin, so it stays Danish
const BOARD_ROLE_NAME = 'Bestyrelse';
const SUPER_ADMIN_CODE = 'strapi-super-admin';

// Fields the board can see and edit, with the Danish labels shown in the admin
const CONTENT_TYPES = {
  'api::article.article': {
    mainField: 'title',
    labels: { title: 'Titel', slug: 'Slug', excerpt: 'Uddrag', body: 'Indhold', image: 'Billede' },
  },
  'api::page.page': {
    mainField: 'title',
    labels: { title: 'Titel', slug: 'Slug', body: 'Indhold', sortOrder: 'Sortering' },
  },
  'api::link.link': {
    mainField: 'title',
    labels: { title: 'Titel', url: 'URL', description: 'Beskrivelse', sortOrder: 'Sortering' },
  },
} as const;

type ContentTypeUid = keyof typeof CONTENT_TYPES;

const cm = (action: string) => `plugin::content-manager.explorer.${action}`;
const withFields = (action: string, subject: ContentTypeUid) => ({
  action,
  subject,
  properties: { fields: Object.keys(CONTENT_TYPES[subject].labels) },
});

/**
 * The board's permissions. Applied on every startup, so changes made in the admin
 * are reset and the role is identical locally, in tests and in production.
 * - Articles, pages and links: create, read, update and delete everything,
 *   not only their own; articles and pages can also be published/unpublished
 * - Media library: upload, edit alt text, download (no delete)
 * - Users: invite and edit users with the board role
 */
const boardPermissions = () => [
  ...(['api::article.article', 'api::page.page'] as const).flatMap((subject) => [
    withFields(cm('create'), subject),
    withFields(cm('read'), subject),
    withFields(cm('update'), subject),
    { action: cm('publish'), subject },
    { action: cm('delete'), subject },
  ]),
  withFields(cm('create'), 'api::link.link'),
  withFields(cm('read'), 'api::link.link'),
  withFields(cm('update'), 'api::link.link'),
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

async function findBoardRole(strapi: Core.Strapi) {
  return strapi.db.query('admin::role').findOne({ where: { name: BOARD_ROLE_NAME } });
}

const isSuperAdmin = (user?: { roles?: { code: string }[] }) =>
  !!user?.roles?.some((role) => role.code === SUPER_ADMIN_CODE);

async function isSuperAdminUser(strapi: Core.Strapi, id: string) {
  const user = await strapi.db.query('admin::user').findOne({ where: { id }, populate: ['roles'] });
  return isSuperAdmin(user);
}

/**
 * Limits what users who are not Super Admin can do with admin users and roles:
 * - Strapi lets anyone allowed to create users assign any role, including
 *   Super Admin. They may only assign the board role.
 * - Super Admins are hidden: they are not listed, cannot be opened and cannot be edited.
 * - The Super Admin role is hidden from the role list and cannot be opened.
 */
function restrictUserManagement(strapi: Core.Strapi) {
  const controllers = strapi.get('controllers');
  type Controller = Record<string, (ctx: any) => unknown>;

  controllers.extend('admin::user', (controller: Controller) => {
    // Returns an error message (shown in the admin, so Danish) if the action is not allowed
    async function reject(ctx: any, targetUserId?: string): Promise<string | null> {
      if (isSuperAdmin(ctx.state.user)) return null;

      const boardRole = await findBoardRole(strapi);
      const roles: unknown[] = ctx.request.body?.roles ?? [];
      if (roles.some((id) => String(id) !== String(boardRole?.id))) {
        return `Du kan kun tildele rollen ${BOARD_ROLE_NAME}`;
      }

      if (targetUserId && (await isSuperAdminUser(strapi, targetUserId))) {
        return 'Du kan ikke rette en Super Admin';
      }
      return null;
    }

    return {
      ...controller,
      async find(ctx: any) {
        await controller.find(ctx);
        if (isSuperAdmin(ctx.state.user)) return;

        const { results, pagination } = ctx.body.data;
        const visible = results.filter((user: { roles?: { code: string }[] }) => !isSuperAdmin(user));
        ctx.body.data = {
          results: visible,
          pagination: { ...pagination, total: pagination.total - (results.length - visible.length) },
        };
      },
      async findOne(ctx: any) {
        if (!isSuperAdmin(ctx.state.user) && (await isSuperAdminUser(strapi, ctx.params.id))) {
          return ctx.notFound('User does not exist');
        }
        return controller.findOne(ctx);
      },
      async create(ctx: any) {
        const error = await reject(ctx);
        return error ? ctx.forbidden(error) : controller.create(ctx);
      },
      async update(ctx: any) {
        const error = await reject(ctx, ctx.params.id);
        return error ? ctx.forbidden(error) : controller.update(ctx);
      },
    };
  });

  controllers.extend('admin::role', (controller: Controller) => {
    const isSuperAdminRole = async (id: string) => {
      const role = await strapi.db.query('admin::role').findOne({ where: { id } });
      return role?.code === SUPER_ADMIN_CODE;
    };
    const hiddenFor = async (ctx: any) =>
      !isSuperAdmin(ctx.state.user) && (await isSuperAdminRole(ctx.params.id));

    return {
      ...controller,
      async findAll(ctx: any) {
        await controller.findAll(ctx);
        if (isSuperAdmin(ctx.state.user)) return;
        ctx.body.data = ctx.body.data.filter((role: { code: string }) => role.code !== SUPER_ADMIN_CODE);
      },
      async findOne(ctx: any) {
        return (await hiddenFor(ctx)) ? ctx.notFound('Role does not exist') : controller.findOne(ctx);
      },
      async getPermissions(ctx: any) {
        return (await hiddenFor(ctx)) ? ctx.notFound('Role does not exist') : controller.getPermissions(ctx);
      },
    };
  });
}

/**
 * Strapi's default roles Editor and Author are not used. They are deleted on
 * startup so only Super Admin and the board role exist. A role with users is skipped.
 */
async function removeDefaultRoles(strapi: Core.Strapi) {
  const roleService = strapi.service('admin::role');
  for (const code of ['strapi-editor', 'strapi-author']) {
    const role = await strapi.db.query('admin::role').findOne({ where: { code } });
    if (!role) continue;

    if ((await roleService.getUsersCount(role.id)) > 0) {
      strapi.log.warn(`Role ${role.name} has users and is not deleted`);
      continue;
    }
    await roleService.deleteByIds([role.id]);
    strapi.log.info(`Default role ${role.name} deleted`);
  }
}

/**
 * Field names are English in code; the board sees Danish labels in the admin.
 */
async function applyDanishLabels(strapi: Core.Strapi) {
  const contentTypes = strapi.plugin('content-manager').service('content-types');

  for (const [uid, { mainField, labels }] of Object.entries(CONTENT_TYPES)) {
    const configuration = await contentTypes.findConfiguration({ uid });
    for (const [field, label] of Object.entries(labels)) {
      const metadata = configuration.metadatas?.[field];
      if (!metadata) continue;
      metadata.edit = { ...metadata.edit, label };
      metadata.list = { ...metadata.list, label };
    }
    configuration.settings = { ...configuration.settings, mainField };

    await contentTypes.updateConfiguration(
      { uid },
      { settings: configuration.settings, metadatas: configuration.metadatas, layouts: configuration.layouts },
    );
  }
}

export default {
  register({ strapi }: { strapi: Core.Strapi }) {
    restrictUserManagement(strapi);
  },

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    const roleService = strapi.service('admin::role');
    const boardRole =
      (await findBoardRole(strapi)) ??
      (await roleService.create({ name: BOARD_ROLE_NAME, description: 'Redigerer nyheder, sider og links' }));
    await roleService.assignPermissions(boardRole.id, boardPermissions());

    await removeDefaultRoles(strapi);
    await applyDanishLabels(strapi);
  },
};
