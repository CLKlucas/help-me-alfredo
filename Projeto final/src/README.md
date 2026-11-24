# Feira Digital de Baturité

Projeto da cadeira de Desenvolvimento de Software para Web: uma plataforma para aproximar consumidores, feirantes e pequenos produtores de Baturité.

Este README apresenta a proposta geral, os requisitos, a identidade visual, as tecnologias e a organização do projeto. O planejamento detalhado da área administrativa está em [README-ADMIN.md](README-ADMIN.md). As funcionalidades previstas não devem ser interpretadas como já implementadas.

## Consulta rápida

- [Proposta e requisitos](#proposta-e-requisitos)
- [Identidade visual](#identidade-visual)
- [Perfis e permissões](#perfis-e-permissões)
- [Tecnologias utilizadas](#tecnologias-utilizadas)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Como executar o projeto](#como-executar-o-projeto)
- [Configuração TypeScript](#configuração-typescript)
- [Scripts disponíveis](#scripts-disponíveis)
- [Configuração automática do Strapi](#configuração-automática-do-strapi)
- [Equipe](#equipe)
- [Planejamento da página do administrador](README-ADMIN.md)

## Proposta e requisitos

Esta proposta define os objetivos e requisitos da Feira Digital. A análise de novos feirantes faz parte do planejamento de controle de acesso.

### Objetivo geral

Desenvolver uma plataforma web funcional para divulgação e comercialização de produtos de feirantes e pequenos produtores locais, permitindo cadastrar e gerenciar produtos, consultar um catálogo público e realizar pedidos ou reservas.

A aplicação deve possuir autenticação, perfis com permissões diferentes, interface responsiva e integração entre frontend e backend Strapi por API REST, com dados persistidos no banco.

### Público e impacto esperado

- Feirantes e pequenos produtores locais, especialmente quem tem pouca presença digital.
- Consumidores interessados em consultar produtos, preços e disponibilidade e combinar pedidos.
- Maior visibilidade para os comerciantes e uma ferramenta centralizada para organizar a divulgação e o atendimento.

### Requisitos para acompanhar a implementação

As caixas estão desmarcadas como roteiro de verificação. Marcar somente depois de testar a funcionalidade completa, incluindo a API e suas permissões.

**Acesso público**

- [ ] Consultar catálogo, produtos e informações públicas dos feirantes.
- [ ] Pesquisar produtos e visualizar preços, fotos e disponibilidade.
- [ ] Manter o catálogo sem dados privados de consumidores ou da análise administrativa.

**Contas e controle de acesso**

- [ ] Cadastrar e autenticar consumidores e candidatos a feirante.
- [ ] Identificar o perfil e limitar as ações no backend.
- [ ] Permitir ao usuário acompanhar a situação de sua candidatura a feirante.

**Consumidor**

- [ ] Fazer pedidos ou reservas.
- [ ] Consultar e gerenciar somente os próprios pedidos ou reservas.

**Feirante aprovado**

- [ ] Gerenciar seu perfil e as informações da banca.
- [ ] Criar, editar e excluir somente os próprios produtos.
- [ ] Adicionar imagens e informar preço, unidade e quantidade/disponibilidade.
- [ ] Gerenciar pedidos ou reservas relacionados aos seus produtos.

**Administrador**

- [ ] Analisar solicitações de novos feirantes e aprovar ou recusar.
- [ ] Gerenciar usuários, feirantes, produtos e informações da plataforma conforme suas permissões.
- [ ] Registrar quem analisou uma solicitação, quando e qual foi a decisão.

**Decisões de escopo**

- A proposta permite pedidos **ou** reservas: definir um fluxo principal antes de implementar os dois.
- Recomenda-se começar com pedido para retirada e pagamento combinado com o feirante. Pagamento online não é uma exigência da proposta.
- Para alimentos, roupas, artesanato e outros itens, prever categorias e unidade de venda; não limitar o catálogo a frutas.
- A representação da prefeitura é uma possibilidade de administração, não uma parceria institucional já confirmada.

### Entidades previstas na proposta

| Entidade | Responsabilidade |
| --- | --- |
| Usuário | Identificação e autenticação. Usar o usuário do Users & Permissions. |
| Perfil/Papel | Permissões de consumidor, feirante e administrador do site. |
| Feirante/Produtor | Dados da banca ou produção e relação com seu usuário. |
| Produto | Nome, descrição, preço, quantidade/disponibilidade e feirante proprietário. |
| Imagem do produto | Fotos, usando a mídia do Strapi e sua relação com o produto. |
| Pedido | Consumidor, situação e itens solicitados. |
| Item do pedido | Produto, quantidade e preço registrado no momento do pedido. |
| Reserva | Somente se esse fluxo for adotado. |

Categoria e dados da análise de feirantes são complementos sugeridos para atender à organização do catálogo e à nova regra de aprovação.

## Identidade visual

As cinco cores principais informadas pela equipe são:

| Cor | Hexadecimal | Uso sugerido |
| --- | --- | --- |
| Azul | `#1D479D` | Links, chamadas e ações gerais, como entrar ou salvar. |
| Azul escuro | `#002680` | Títulos, destaques de texto e estados de interação. |
| Verde | `#088344` | Criar conta, fazer pedido e indicação de aprovação. |
| Amarelo | `#FDCB57` | Avisos, situação pendente e selos de destaque. Usar texto escuro. |
| Turquesa | `#41B9AB` | Detalhes, filtros e informações complementares. Preferir texto escuro quando usado como fundo. |

Branco, cinzas e fundos suaves são cores de apoio. A cor não deve ser a única informação: mostrar também textos como “Pendente”, “Aprovado” e “Recusado”. “Recusado” pode ser apresentado com texto e um botão neutro, sem inventar uma sexta cor principal.

No Bootstrap, o `main.scss` configura `$primary: #1D479D` e `$success: #088344`. O guia de [CSS e cores](css/README.md) explica onde editar e como carregar os estilos.

## Perfis e permissões

São quatro perfis de acesso, incluindo o visitante, que não precisa de uma conta:

| Perfil | Pode fazer | Limites |
| --- | --- | --- |
| Visitante | Ver catálogo e dados públicos, iniciar cadastro/login. | Não cria pedidos nem publica produtos. |
| Consumidor | Consultar produtos e gerenciar seus próprios pedidos. | Não altera produtos ou pedidos de outras pessoas. |
| Feirante aprovado | Gerenciar sua banca, seus produtos e pedidos recebidos. | Não administra outras bancas nem aprova cadastros. |
| Administrador do site | Analisar candidatos e moderar o que estiver autorizado. | Conta criada por um responsável; nunca pelo cadastro público. |

**Candidato a feirante não é um quinto tipo de pessoa:** é um usuário cuja habilitação para vender ainda está pendente. “Estar logado” e “estar aprovado para vender” são condições diferentes.

O fluxo detalhado da análise, a tela e as regras administrativas estão no [README da página do administrador](README-ADMIN.md).

## Tecnologias utilizadas

| Parte | Tecnologias e responsabilidade |
| --- | --- |
| Frontend | HTML e CSS para as páginas; TypeScript para a integração com a API. |
| TypeScript do frontend | Fontes em `src/ts`, compilados para `src/js`; o HTML continua carregando os arquivos gerados em `../js/*.js`. |
| Interface | Bootstrap 5 para componentes, grid e responsividade. |
| Estilos compartilhados | Sass compila SCSS em css/style.css. Os estilos de cada página continuam em CSS separado. |
| Backend | Strapi 5 em TypeScript, executado com Node.js e compilado pelo próprio Strapi para `dist/`. |
| Contas do site | Plugin Users & Permissions para autenticação e papéis de acesso. |
| Administração do Strapi | Painel nativo, com contas e permissões próprias gerenciadas por RBAC. |
| Arquivos e imagens | Recurso Upload do Strapi. |
| Banco local | SQLite, acessado pelo better-sqlite3. |
| Comunicação | API REST entre o frontend e o backend. |
| Dependências | npm, com package.json maestro na raiz para atalhos do projeto (setup, build e typecheck) e arquivos separados em frontend e backend. O TypeScript é uma dependência de desenvolvimento do frontend; o backend usa o suporte nativo do Strapi. |

Essas tecnologias são a base do projeto; sua presença não significa que todas as funcionalidades previstas estejam concluídas.

## Estrutura do projeto

```text
help-me-alfredo/
├── package.json                  # Scripts maestros na raiz (setup, build, typecheck, dev)
└── Projeto final/
    ├── src/                      # Frontend
    │   ├── html/
    │   ├── css/
    │   ├── scss/
    │   ├── img/
    │   ├── ts/                   # Fontes TypeScript (editar aqui)
    │   ├── js/                   # JavaScript gerado pelo build (não editar)
    │   ├── tsconfig.json
    │   ├── node_modules/         # Gerado pelo npm; ignorado pelo Git
    │   ├── package.json
    │   ├── README.md
    │   └── README-ADMIN.md       # Planejamento da área administrativa
    └── backend/                  # Strapi 5 em TypeScript
        ├── config/               # Configurações .ts (admin, database, server, etc.)
        ├── src/
        │   ├── api/              # Controllers, routes e services .ts
        │   ├── types/            # Interfaces compartilhadas
        │   ├── schemas.ts        # Importa os schema.json para o dist
        │   └── index.ts
        ├── dist/                 # Código compilado; gerado e ignorado pelo Git
        ├── tsconfig.json
        ├── .env                  # Configuração local; não publicar
        ├── .env.example          # Modelo sem segredos reais
        ├── node_modules/
        └── package.json
```

## Como executar o projeto

Os comandos podem ser executados diretamente a partir da raiz do repositório `help-me-alfredo`.

### 1. Instalação das dependências

Instala as dependências do frontend e do backend em uma única etapa:

```bash
npm run setup
```

*(Para instalar apenas um deles: `npm run setup:frontend` ou `npm run setup:backend`).*

### 2. Compilação do TypeScript

O código editável do frontend está em `Projeto final/src/ts`. O HTML continua apontando para `../js/*.js`, então é necessário compilar antes de abrir as páginas em um navegador ou servir o projeto pela primeira vez:

```bash
npm run build
```

O comando acima compila frontend e backend. Para compilar apenas uma parte:

```bash
npm run build:frontend
npm run build:backend
```

Para conferir os tipos sem gerar arquivos:

```bash
npm run typecheck
```

Durante o desenvolvimento do frontend, use `npm --prefix "Projeto final/src" run build:watch` em outro terminal para recompilar automaticamente a cada alteração em `ts/`. Não edite os arquivos de `js/`: eles são gerados e ignorados pelo Git.

No backend, `npm run dev:backend` (ou `npm run build:backend`) já compila os `.ts` para `Projeto final/backend/dist`, de onde o Strapi carrega as configurações, as rotas e os content types. A pasta `dist/` é gerada e não deve ser versionada.

### 3. Compilação de estilos (Sass)

Para iniciar a compilação com atualização automática (`--watch`):

```bash
npm run compilar-css
```

### 4. Servidores locais

- **Frontend:** `npm run dev:frontend` (acesso em `http://localhost:8000/html/inicio.html`).
- **Backend (Strapi):** `npm run dev:backend` (acesso em `http://localhost:1337/admin`).

Ordem sugerida na primeira execução: `npm run setup` → `npm run build` → `npm run typecheck` → iniciar os dois servidores em terminais separados. Use Ctrl + C para encerrar cada servidor.

## Configuração automática do Strapi

`Projeto final/backend/src/index.ts` chama `src/bootstrap/setup.ts` sempre que o backend inicia. Ao executar `npm run dev:backend` na raiz do repositório, o script habilita o cadastro público, cria os papéis **Consumidor** e **Feirante** quando faltam e acrescenta as permissões necessárias. Não é preciso executar outro comando para configurar os papéis. O comando `npm run setup` da raiz instala dependências; a configuração do banco acontece ao iniciar o Strapi.

| Acesso | Configuração compartilhada |
| --- | --- |
| Visitante | Cadastro, catálogo de produtos, lista de feirantes e página de cada barraca. Essas rotas usam `auth: false` nos arquivos de rotas. |
| Consumidor e Feirante | Sessão, consulta da própria conta e leitura/edição do próprio perfil. As permissões comuns ficam em `PERMISSOES_AUTENTICADO`. |
| Somente Feirante | Cadastrar, listar e excluir os próprios produtos; enviar arquivos; remover a foto da própria banca. As permissões adicionais ficam em `PERMISSOES_POR_PAPEL.Feirante`. |

As permissões incluídas nas funcionalidades recentes são `api::perfil.perfil.find`, `api::perfil.perfil.update`, `api::perfil.perfil.removerFoto` e `api::produto.produto.delete`. Os controllers conferem a conta autenticada para que cada pessoa altere apenas os próprios dados.

O script adiciona somente o que está faltando: reiniciar não duplica papéis ou permissões, nem apaga registros existentes. Permissões extras configuradas manualmente são preservadas. Ao adicionar novas rotas autenticadas, atualize a lista do papel correspondente neste script e reinicie o backend.

Para compartilhar essas mudanças, inclua no commit o script e os arquivos de rotas, controllers, configurações e schemas alterados. Depois de receber o código atualizado, instalar as dependências e preparar o `.env` local, os colegas iniciam o backend para aplicar as regras ao próprio banco. Usuários, produtos, fotos e a conta administrativa de cada instalação continuam sendo dados locais; o script não os copia entre computadores.

## Configuração TypeScript

### Frontend

- `Projeto final/src/tsconfig.json`: `rootDir: "ts"`, `outDir: "js"`, `target`/`module` ES2020 e `strict: true`.
- Edite somente os arquivos em `Projeto final/src/ts`. Os módulos compilados aparecem em `Projeto final/src/js` com os mesmos nomes.
- Nenhum HTML foi alterado na migração: os scripts já apontavam para `../js/login.js`, `../js/cadastro.js`, `../js/painel-feirante.js` e `../js/catalogo-produtos.js`.
- Interfaces compartilhadas ficam em `ts/types.ts`; requisições e sessão em `ts/api.ts` e `ts/auth.ts`.

### Backend

- `Projeto final/backend/tsconfig.json` estende `@strapi/typescript-utils/tsconfigs/server`, com `rootDir: "."` e `outDir: "dist"`. O Strapi CLI compila e carrega a aplicação a partir de `dist`.
- As configurações em `Projeto final/backend/config` e os controllers/routes/services em `src/api` são `.ts`. Os antigos arquivos `.js` e o `jsconfig.json` foram removidos.
- `src/types/api.ts` concentra as interfaces usadas pelos controllers; foi evitado o uso de `any`.
- `src/schemas.ts` importa os três `schema.json` dos content types. Isso faz o compilador copiá-los para `dist/src/api/.../schema.json`, que é onde o Strapi os procura.
- `config/database.ts` usa `path.resolve(process.cwd(), env('DATABASE_FILENAME', '.tmp/data.db'))` para manter o mesmo caminho do SQLite antes e depois da compilação.
- Rotas, mensagens de erro e permissões foram preservadas: `POST /api/cadastro`, `GET /api/minha-conta`, `POST /api/produtos`, `GET /api/produtos` e `GET /api/catalogo-produtos`.

## Scripts disponíveis

| Onde | Comando | Finalidade |
| --- | --- | --- |
| Raiz | `npm run setup` | Instala dependências do frontend e do backend. |
| Raiz | `npm run build` | Compila TypeScript do frontend e do backend. |
| Raiz | `npm run build:frontend` / `npm run build:backend` | Compila apenas uma das partes. |
| Raiz | `npm run typecheck` | Valida os tipos nas duas partes sem emitir arquivos. |
| Raiz | `npm run compilar-css` | Compila SCSS em `css/style.css` com `--watch`. |
| Raiz | `npm run dev:frontend` / `npm run dev:backend` | Inicia os servidores locais. |
| Frontend | `npm run build` / `npm run build:watch` / `npm run typecheck` | Gera `js/`, recompila em mudanças ou apenas valida tipos. |
| Backend | `npm run build` / `npm run build:server` / `npm run typecheck` | Build completo do Strapi, compilação apenas do servidor ou validação de tipos. |

## Equipe

- Alfredo Borges do Nascimento Neto — Redes de Computadores.
- Francisco Lucas Gomes Almeida — Engenharia de Software.
- Ryan Lopes Braga Brito — Engenharia de Software.

## Feirantes e Meu perfil

A página `html/feirantes.html` consulta `GET /api/catalogo-feirantes` e mostra nome da banca, nome do feirante, descrição, foto e número de contato comercial. O WhatsApp é mostrado somente como texto, sem botão ou link para abrir uma conversa. Só informações públicas são devolvidas pela API; contas bloqueadas não aparecem. A aprovação administrativa continua sendo uma etapa futura.

Ao clicar no nome de uma barraca, abre-se `html/feirante.html?id=IDENTIFICADOR`. Essa página pública apresenta a foto, o nome da barraca, o nome do feirante, a descrição, o WhatsApp e os produtos disponíveis daquela barraca. Visitantes e consumidores podem consultá-la; não é necessário fazer login.

O `id` na URL é o `documentId` da barraca no Strapi. `ts/feirante.ts` lê esse valor com `URLSearchParams` e consulta `GET /api/catalogo-feirantes/:documentId`. O backend filtra os produtos pelo feirante e por `disponivel: true`; produtos de outras bancas não entram na resposta. Nome e contato públicos são devolvidos sem email, senha ou dados de login. Barracas inexistentes ou ligadas a contas bloqueadas retornam 404. Sem produtos, a página mostra uma mensagem; sem identificador ou com erro, oferece o link para voltar aos feirantes.

`ts/card-produto.ts` monta o cartão de produto usado tanto no catálogo geral quanto na página da barraca. O HTML reaproveita a navbar, o rodapé, o Bootstrap e os arquivos `css/destaque.css` e `css/feirantes.css`, sem novo CSS. As classes `row`, `col-12 col-md-4`, `col-12 col-md` e `g-4` organizam foto e informações em colunas nas telas maiores e uma abaixo da outra nas menores. Reinicie o backend para carregar a nova rota.

Depois do login, `ts/nav-conta.ts` troca os links de entrada/cadastro por um ícone de pessoa, com Meu perfil e Sair. O ícone é genérico, não uma foto pessoal. Para contas de feirante, o link **Painel do feirante** aparece à esquerda do ícone e leva diretamente ao painel. O JavaScript usa `insertBefore` para colocar esse link antes do ícone; `me-lg-2` acrescenta espaço à direita do link em telas grandes. A opção Sair fica no menu do perfil, sem outro botão no painel. Nas telas pequenas, essas opções ficam dentro do menu de três barras. O painel usa os mesmos links de navegação e o mesmo rodapé da página de início.

Em `html/perfil.html`, consumidores editam nome, WhatsApp e endereço. Feirantes editam seu nome completo, nome da barraca, descrição, WhatsApp e foto. `GET /api/meu-perfil` carrega os dados e `PUT /api/meu-perfil` os salva. Essas rotas usam a conta autenticada e não aceitam escolher outro proprietário ou alterar o papel.

Nos cadastros antigos, o nome do feirante pode estar vazio: preencha-o em Meu perfil; não usamos o email como nome público. Novos cadastros já guardam o nome informado.

A foto da banca usa a primeira imagem do campo `media` existente. Uma nova foto é colocada primeiro, preservando as mídias anteriores. São aceitos JPG, PNG e WebP até 2 MB. Textos e foto são enviados juntos com FormData; o navegador define automaticamente o Content-Type desse envio.

Para **trocar** a foto em Meu perfil, escolha outra imagem e clique em **Salvar alterações**. Para **remover**, clique em **Remover foto**: a retirada acontece imediatamente, sem salvar ou sobrescrever os outros campos do formulário. O botão só aparece quando existe uma foto atual.

O botão usa `type="button"` para não enviar o formulário e `btn btn-outline-danger` para o contorno vermelho do Bootstrap. O clique chama `DELETE /api/meu-perfil/foto`. O backend usa a conta autenticada e desvincula as imagens apenas da própria banca, impedindo que fotos antigas reapareçam. Outras mídias e os arquivos na biblioteca do Strapi são preservados. Perfil, lista de feirantes e página pública passam a mostrar a banca sem foto. Somente o papel Feirante recebe a permissão; reinicie o backend para carregá-la.

Após criar a conta, a pessoa é direcionada ao login. Ao sair, o frontend solicita o encerramento da sessão no Strapi e limpa a sessão local.

Para aplicar as novas rotas e permissões, reinicie o backend com `npm run dev:backend` na raiz do repositório. Se alterar TypeScript do frontend, gere novamente os arquivos com `npm run build:frontend`. Depois, teste pelo Live Server ou pelo servidor HTTP local.

### Validação do cadastro

O WhatsApp aceita formatação como `(85) 99999-9999` e `+55 85 99999-9999`; os caracteres de formatação são removidos antes do envio. Letras e números fora do intervalo de 10 a 15 dígitos são rejeitados. O navegador valida os campos antes do POST e o backend repete as verificações para requisições diretas à API.

Usuário e perfil são criados na mesma transação do banco: se o perfil falhar, o usuário também não é gravado. Erros locais impedem o envio; erros identificados apenas pelo servidor precisam de uma requisição, mas não devem deixar um cadastro parcial. Registros antigos incompletos não são apagados por essa mudança.

### Rodapé no final da tela

Todas as páginas usam `d-flex flex-column min-vh-100` no `body` e `flex-grow-1` no `main`. O corpo organiza os elementos em coluna e ocupa pelo menos a altura da tela; o conteúdo principal cresce para preencher o espaço livre. Assim, o rodapé fica embaixo nas páginas curtas e acompanha o conteúdo nas longas, sem posição fixa ou CSS adicional.

### Produtos e exclusão no painel

A aba **Produtos** mostra o catálogo geral de produtos disponíveis. Os arquivos continuam se chamando `html/destaque.html` e `css/destaque.css` para preservar os caminhos existentes; o título e os textos visíveis usam Produtos.

No painel do feirante, cada produto tem um botão **Excluir produto**. O navegador pede confirmação com `window.confirm`; cancelar não envia nenhuma requisição. Ao confirmar, `DELETE /api/produtos/:documentId` verifica a conta e busca o produto ligado à própria barraca antes de apagá-lo. Consumidores e visitantes não têm essa permissão. Depois, o frontend recarrega a lista e o total de produtos. A imagem enviada à biblioteca do Strapi é preservada. Reinicie o backend para carregar a rota e adicionar automaticamente a permissão de exclusão ao papel Feirante.

Em **Meu perfil**, a descrição da banca mostra oito linhas (`rows="8"`); o endereço do consumidor continua com quatro. O botão **Salvar alterações** usa `btn btn-outline-primary`: contorno e texto azuis, com o fundo branco do formulário aparecendo por dentro. O atalho duplicado para o painel foi retirado do formulário, pois já existe na navbar.
