# 🚀 Getting started with Strapi

Strapi comes with a full featured [Command Line Interface](https://docs.strapi.io/dev-docs/cli) (CLI) which lets you scaffold and manage your project in seconds.

### `develop`

Start your Strapi application with autoReload enabled. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-develop)

```
npm run develop
# or
yarn develop
```

### `start`

Start your Strapi application with autoReload disabled. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-start)

```
npm run start
# or
yarn start
```

### `build`

Build your admin panel. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-build)

```
npm run build
# or
yarn build
```

## TypeScript neste projeto

Este backend usa o suporte TypeScript nativo do Strapi 5. As configurações em `config/`, os controllers/routes/services em `src/api` e `src/index.ts` são `.ts`; os antigos `.js` e o `jsconfig.json` foram removidos.

- `npm run develop` compila `tsconfig.json`, gera `dist/` e inicia com autoreload.
- `npm run build` compila o servidor e o painel administrativo.
- `npm run build:server` compila somente o TypeScript do servidor.
- `npm run typecheck` valida os tipos sem gerar arquivos.
- `npm run start` inicia a aplicação já compilada, sem autoreload.

O `tsconfig.json` estende `@strapi/typescript-utils/tsconfigs/server` e usa `rootDir: "."` com `outDir: "dist"`. O arquivo `src/schemas.ts` importa os `schema.json` dos content types para que sejam copiados para `dist`. Em `config/database.ts`, o caminho do SQLite continua resolvido a partir de `process.cwd()` (`.tmp/data.db`), independentemente da compilação.

## ⚙️ Deployment

Strapi gives you many possible deployment options for your project including [Strapi Cloud](https://cloud.strapi.io). Browse the [deployment section of the documentation](https://docs.strapi.io/dev-docs/deployment) to find the best solution for your use case.

```
yarn strapi deploy
```

## 📚 Learn more

- [Resource center](https://strapi.io/resource-center) - Strapi resource center.
- [Strapi documentation](https://docs.strapi.io) - Official Strapi documentation.
- [Strapi tutorials](https://strapi.io/tutorials) - List of tutorials made by the core team and the community.
- [Strapi blog](https://strapi.io/blog) - Official Strapi blog containing articles made by the Strapi team and the community.
- [Changelog](https://strapi.io/changelog) - Find out about the Strapi product updates, new features and general improvements.

Feel free to check out the [Strapi GitHub repository](https://github.com/strapi/strapi). Your feedback and contributions are welcome!

## ✨ Community

- [Discord](https://discord.strapi.io) - Come chat with the Strapi community including the core team.
- [Forum](https://forum.strapi.io/) - Place to discuss, ask questions and find answers, show your Strapi project and get feedback or just talk with other Community members.
- [Awesome Strapi](https://github.com/strapi/awesome-strapi) - A curated list of awesome things related to Strapi.

---

<sub>🤫 Psst! [Strapi is hiring](https://strapi.io/careers).</sub>
