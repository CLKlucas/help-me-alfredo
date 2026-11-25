import type { Core } from '@strapi/strapi';


interface Papel {
  name: string;
  description: string;
  type: string;
}

interface PapelBanco {
  id: number;
  permissions?: { action: string }[];
}

const PAPEIS: Papel[] = [
  {
    name: 'Consumidor',
    description: 'Usuário consumidor do site.',
    type: 'consumidor',
  },
  {
    name: 'Feirante',
    description: 'Usuário feirante do site.',
    type: 'feirante',
  },
];

const PERMISSOES_AUTENTICADO: string[] = [
  'plugin::users-permissions.auth.changePassword',
  'plugin::users-permissions.auth.logout',
  'plugin::users-permissions.auth.getSessions',
  'plugin::users-permissions.auth.revokeSession',
  'plugin::users-permissions.user.me',
  'api::cadastro.cadastro.me',
  'api::perfil.perfil.find',
  'api::perfil.perfil.update',
  'api::pedido.pedido.find',
];

const PERMISSOES_POR_PAPEL: Record<string, string[]> = {
  Consumidor: PERMISSOES_AUTENTICADO,
  Feirante: [
    ...PERMISSOES_AUTENTICADO,
    'api::perfil.perfil.removerFoto',
    'api::produto.produto.create',
    'api::produto.produto.find',
    'api::produto.produto.delete',
    'api::pedido.pedido.updateStatus',
    'plugin::upload.content-api.upload',
  ],
};

PERMISSOES_POR_PAPEL.Consumidor.push(
  'api::pedido.pedido.create',
  'api::pedido.pedido.updateStatus'
);

async function garantirPapel(
  strapi: Core.Strapi,
  papel: Papel
): Promise<number> {
  const existente: { id: number } | null = await strapi.db
    .query('plugin::users-permissions.role')
    .findOne({ where: { name: papel.name } });

  if (existente) {
    return existente.id;
  }

  const criado: { id: number } = await strapi.db
    .query('plugin::users-permissions.role')
    .create({ data: papel });

  strapi.log.info(`Papel "${papel.name}" criado automaticamente.`);
  return criado.id;
}

async function garantirPermissoes(
  strapi: Core.Strapi,
  roleId: number,
  acoes: string[]
): Promise<void> {
  const papel: PapelBanco | null = await strapi.db
    .query('plugin::users-permissions.role')
    .findOne({ where: { id: roleId }, populate: ['permissions'] });

  const existentes = new Set((papel?.permissions ?? []).map((p) => p.action));
  const faltantes = acoes.filter((acao) => !existentes.has(acao));

  await Promise.all(
    faltantes.map((action) =>
      strapi.db
        .query('plugin::users-permissions.permission')
        .create({ data: { action, role: roleId } })
    )
  );

  if (faltantes.length > 0) {
    strapi.log.info(
      `Papel #${roleId}: ${faltantes.length} permissão(ões) adicionada(s) automaticamente.`
    );
  }
}

async function garantirCadastroHabilitado(strapi: Core.Strapi): Promise<void> {
  const pluginStore = strapi.store({
    type: 'plugin',
    name: 'users-permissions',
  });

  const advanced: unknown = await pluginStore.get({ key: 'advanced' });
  const config = (
    typeof advanced === 'object' && advanced !== null ? advanced : {}
  ) as { allow_register?: boolean };

  if (!config.allow_register) {
    await pluginStore.set({
      key: 'advanced',
      value: { ...config, allow_register: true },
    });
    strapi.log.info('Cadastro público (allow_register) habilitado automaticamente.');
  }
}

export async function setup(strapi: Core.Strapi): Promise<void> {
  await garantirCadastroHabilitado(strapi);

  for (const papel of PAPEIS) {
    const roleId = await garantirPapel(strapi, papel);
    await garantirPermissoes(strapi, roleId, PERMISSOES_POR_PAPEL[papel.name] ?? []);
  }
}
