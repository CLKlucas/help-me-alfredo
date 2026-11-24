import type { Context } from 'koa';

interface Arquivo {
  id: number;
  url: string;
  mime?: string;
  alternativeText?: string | null;
}
interface Perfil {
  id: number;
  documentId: string;
  nome?: string;
  nome_da_barraca?: string;
  whatsapp?: string;
  descricao?: string;
  endereco?: string;
  media?: Arquivo[];
}

async function obterPerfil(ctx: Context) {
  const id = (ctx.state as { user?: { id: number } }).user?.id;
  if (!id) { ctx.unauthorized('Entre para acessar seu perfil.'); return null; }

  const usuario = await strapi.db.query('plugin::users-permissions.user').findOne({
    where: { id }, populate: { role: true },
  });
  const papel = usuario?.role?.name;
  if (papel !== 'Feirante' && papel !== 'Consumidor') {
    ctx.forbidden('Perfil não disponível para esta conta.'); return null;
  }
  const tipo: 'feirante' | 'consumidor' = papel === 'Feirante' ? 'feirante' : 'consumidor';
  const uid: 'api::feirante.feirante' | 'api::consumidor.consumidor' = tipo === 'feirante' ? 'api::feirante.feirante' : 'api::consumidor.consumidor';
  const perfil: Perfil | null = await strapi.db.query(uid).findOne({
    where: { users_permissions_user: { id } },
    ...(tipo === 'feirante' ? { populate: { media: true } } : {}),
  });
  if (!perfil) { ctx.notFound('Não foi encontrado um perfil ligado à sua conta.'); return null; }
  return { tipo, uid, perfil, email: usuario.email as string };
}

function resposta(conta: NonNullable<Awaited<ReturnType<typeof obterPerfil>>>) {
  const p = conta.perfil;
  const foto = p.media?.find((arquivo) => arquivo.mime?.startsWith('image/'));
  return {
    tipo: conta.tipo,
    email: conta.email,
    perfil: conta.tipo === 'feirante'
      ? { nome: p.nome, nome_da_barraca: p.nome_da_barraca, descricao: p.descricao, whatsapp: p.whatsapp,
          foto: foto ? { url: foto.url, alternativeText: foto.alternativeText } : null }
      : { nome: p.nome, endereco: p.endereco, whatsapp: p.whatsapp },
  };
}

export default {
  async find(ctx: Context) {
    const conta = await obterPerfil(ctx);
    if (conta) ctx.body = resposta(conta);
  },

  async removerFoto(ctx: Context) {
    const conta = await obterPerfil(ctx);
    if (!conta) return;
    if (conta.tipo !== 'feirante') return ctx.forbidden('Apenas feirantes podem remover a foto da banca.');

    const media = (conta.perfil.media || [])
      .filter((item) => !item.mime?.startsWith('image/'))
      .map((item) => item.id);
    await strapi.documents('api::feirante.feirante').update({
      documentId: conta.perfil.documentId,
      data: { media },
    });
    const atualizada = await obterPerfil(ctx);
    if (atualizada) ctx.body = resposta(atualizada);
  },

  async update(ctx: Context) {
    const conta = await obterPerfil(ctx);
    if (!conta) return;

    const body = (ctx.request.body ?? {}) as Record<string, unknown>;
    const nome = body.nome;
    const whatsapp = body.whatsapp;
    if (typeof nome !== 'string' || !nome.trim() || nome.length > 120) {
      return ctx.badRequest('Informe um nome com até 120 caracteres.');
    }
    if (typeof whatsapp !== 'string') return ctx.badRequest('Informe o WhatsApp com DDD.');
    const telefone = whatsapp.replace(/\D/g, '');
    if (telefone.length < 10 || telefone.length > 15) {
      return ctx.badRequest('Informe um WhatsApp válido, com DDD.');
    }
    const complemento = conta.tipo === 'feirante' ? body.descricao : body.endereco;
    if (complemento !== undefined && typeof complemento !== 'string') {
      return ctx.badRequest('Descrição ou endereço inválido.');
    }
    if (typeof complemento === 'string' && complemento.length > 2000) {
      return ctx.badRequest('Descrição ou endereço deve ter até 2000 caracteres.');
    }
    if (conta.tipo === 'consumidor' && !(complemento as string | undefined)?.trim()) {
      return ctx.badRequest('Informe seu endereço.');
    }

    if (conta.tipo === 'feirante' &&
        (typeof body.nome_da_barraca !== 'string' || !body.nome_da_barraca.trim() || body.nome_da_barraca.length > 120)) {
      return ctx.badRequest('Informe o nome da barraca, com até 120 caracteres.');
    }

    const data: Record<string, unknown> = conta.tipo === 'feirante'
      ? { nome: nome.trim(), nome_da_barraca: (body.nome_da_barraca as string).trim(), whatsapp: telefone, descricao: complemento || '' }
      : { nome: nome.trim(), whatsapp: telefone, endereco: (complemento as string).trim() };

    const files = (ctx.request as unknown as { files?: Record<string, unknown> }).files;
    const foto = files?.foto;
    if (foto) {
      if (conta.tipo !== 'feirante' || Array.isArray(foto)) {
        return ctx.badRequest('Envie uma única foto da banca.');
      }
      const arquivo = foto as { mimetype?: string; size?: number };
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(arquivo.mimetype || '') ||
          !arquivo.size || arquivo.size > 2 * 1024 * 1024) {
        return ctx.badRequest('Use uma foto JPG, PNG ou WebP de até 2 MB.');
      }
      const enviados: Arquivo[] = await strapi.plugin('upload').service('upload').upload({
        data: {}, files: foto,
      });
      data.media = [enviados[0].id, ...(conta.perfil.media || []).map((item) => item.id)];
    }

    await strapi.documents(conta.uid).update({
      documentId: conta.perfil.documentId,
      data,
    });
    const atualizada = await obterPerfil(ctx);
    if (atualizada) ctx.body = resposta(atualizada);
  },
};
