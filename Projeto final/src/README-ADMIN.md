# Página do administrador — Feira Digital de Baturité

Documento de planejamento da área administrativa e da aprovação de feirantes. Reúne a tela, o fluxo de análise, os dados necessários, as regras do backend, exemplos de rotas, a situação atual e os próximos passos.

A proposta geral, a paleta completa, as tecnologias e a organização das pastas estão no [README principal](README.md). Este documento não significa que a funcionalidade já esteja implementada.

## Consulta rápida

- [Contas administrativas e autenticação](#contas-administrativas-e-autenticação)
- [Aprovação de feirantes](#aprovação-de-feirantes)
- [Como pensar a página do administrador](#como-pensar-a-página-do-administrador)
- [Exemplos de rotas futuras](#exemplos-de-rotas-futuras)
- [Situação atual e próximos passos](#situação-atual-e-próximos-passos)
- [Como executar localmente](#como-executar-localmente-para-desenvolver-a-área-administrativa)

## Objetivo da área

Dar ao responsável da plataforma, que poderá ser um representante da prefeitura, uma maneira de verificar candidaturas e aprovar ou recusar a habilitação para vender. A parceria com a prefeitura e o procedimento de verificação precisam ser definidos pela equipe.

O cadastro público não cria administradores. O responsável precisa de uma conta administrativa provisionada por alguém autorizado. O candidato pode acompanhar sua situação, mas não pode alterar o resultado da análise.

## Contas administrativas e autenticação

- **Painel Strapi (`/admin`):** tem contas administrativas próprias e permissões gerenciadas pelo RBAC.
- **Página `admin.html` do site:** se adotada, deve usar uma conta de usuário da aplicação, por exemplo com o papel `Administrador do site`, e uma API que autorize suas ações. Essa conta é gerenciada pelo Users & Permissions.

Os dois sistemas de contas são separados. Não colocar um token administrativo do Strapi no JavaScript do site. Um papel chamado Administrador no Users & Permissions não cria automaticamente acesso ao painel nativo.

Referências: [Users & Permissions](https://docs.strapi.io/cms/features/users-permissions) e [RBAC do painel administrativo](https://docs.strapi.io/cms/features/rbac).

## Aprovação de feirantes

Esta é uma **proposta de implementação**, não um fluxo já disponível.

### Caminho sugerido

1. A pessoa preenche os dados da conta e da banca.
2. O backend cria a candidatura com situação `pendente`, sem liberar publicação de produtos.
3. O responsável confere a existência da banca por um procedimento definido pela equipe: por exemplo, conferir cadastro municipal, localização ou contato presencial. A lista da tela, sozinha, não comprova que a pessoa é feirante.
4. O administrador abre os detalhes e aprova ou recusa, registrando a decisão.
5. Se aprovado, o backend libera o papel/permissões de feirante e a área de vendas.
6. Se recusado, a pessoa continua sem habilitação para vender e pode visualizar um motivo adequado ou instruções de correção.

**Sugestão para simplificar:** permitir login ao candidato para acompanhar sua análise, mas liberar vendas apenas após aprovação. Se a equipe preferir impedir qualquer login antes de aprovar, essa regra também precisa ser aplicada no backend; esconder a página não basta.

### Situações da candidatura

| Situação | Significado | Pode publicar? |
| --- | --- | --- |
| `pendente` | Aguardando análise do responsável. | Não. |
| `aprovado` | Habilitado para vender. | Sim, apenas na própria banca. |
| `recusado` | Solicitação não aprovada; pode haver orientação para correção. | Não. |
| `suspenso` | Habilitação retirada depois de uma aprovação. Opcional para uma segunda etapa. | Não. |

Uma correção/reapresentação deve voltar para `pendente`, não transformar a própria conta em aprovada.

### Dados mínimos para guardar

Para o primeiro modelo, adicionar ao perfil do feirante:

| Campo sugerido | Tipo/uso |
| --- | --- |
| `situacao` | Enumeração com valor inicial `pendente`, definido pelo servidor. |
| `solicitadoEm` | Data da solicitação. |
| `analisadoEm` | Data da decisão. |
| `analisadoPor` | Relação com o responsável que analisou. |
| `motivoDecisao` | Orientação de recusa ou observação adequada para o candidato. |

Não permitir ao candidato editar `situacao`, `analisadoEm` ou `analisadoPor`. Caso a equipe precise de histórico de várias tentativas e decisões, criar uma entidade `Solicitação de feirante` em vez de sobrescrever a última análise. Observações internas devem ficar separadas de mensagens exibidas ao candidato.

### Regras que o backend precisa garantir

- O formulário público nunca escolhe papel de administrador nem envia uma aprovação válida.
- Toda solicitação nova começa pendente; receber `situacao: aprovado` do navegador não deve mudar isso.
- Somente o administrador autorizado altera a análise. O servidor identifica quem decidiu pela autenticação, não por um ID enviado pelo formulário.
- Um feirante só cria/edita produtos se estiver aprovado e for o proprietário dos registros.
- Rotas genéricas de atualização de perfil não podem permitir autoaprovação.
- O catálogo público deve mostrar produtos de feirantes habilitados; suspensão precisa ser respeitada também nas consultas e nos pedidos novos.
- O backend confere a permissão nas requisições, mesmo se alguém abrir `admin.html` diretamente ou usar uma sessão anterior à suspensão.
- Confirmar e-mail (`confirmed`) não é confirmar que alguém é feirante. São verificações diferentes.

## Como pensar a página do administrador

Para economizar trabalho, a primeira versão pode fazer a análise pelo painel nativo do Strapi, depois que os campos e as restrições forem implementados. Se a entrega exigir uma página própria, este é o escopo inicial sugerido para `html/admin.html`:

| Parte da tela | Conteúdo |
| --- | --- |
| Cabeçalho | Identificação do responsável e ação Sair. |
| Resumo | Quantidades de solicitações pendentes, aprovadas e recusadas. |
| Filtros | Nome da banca e situação. |
| Lista | Nome do solicitante, banca, data da solicitação, situação e botão Ver detalhes. |
| Detalhes | Dados necessários para conferir a banca e contato. |
| Decisão | Botões Aprovar e Recusar, com campo de motivo; pedir motivo na recusa. |
| Retorno | Mensagem de sucesso/erro e atualização da lista. |

No login, o backend identifica o papel e o frontend direciona a pessoa para sua área. O redirecionamento é conveniência; quem protege os dados é a API. Se usar o painel nativo, o responsável entra diretamente em `/admin` com sua conta administrativa própria.

### Exemplos de rotas futuras

Os nomes abaixo são uma sugestão de contrato para uma página própria; **ainda não existem no backend atual**.

| Método e rota | Acesso |
| --- | --- |
| `GET /api/minha-solicitacao` | O candidato consulta somente sua análise. |
| `GET /api/solicitacoes-feirante` | Administrador lista e filtra as solicitações. |
| `POST /api/solicitacoes-feirante/:documentId/aprovar` | Administrador aprova e habilita a venda. |
| `POST /api/solicitacoes-feirante/:documentId/recusar` | Administrador recusa e registra o motivo. |

Essas rotas, se construídas para o site, usam a autenticação e o papel do Users & Permissions. A mudança de situação e de permissões precisa ser coerente: não liberar a venda caso uma parte da aprovação falhe.

## Situação atual e próximos passos

Conferido no código em 21/11/2026, sem consultar contas, configurações de papéis ou dados privados no banco:

- Há páginas HTML, CSS, Bootstrap e Sass no frontend.
- O backend usa Strapi 5 em TypeScript e SQLite; existem os tipos Feirante e Consumidor.
- A rota `POST /api/cadastro` cria o usuário e seu perfil. Na implementação atual, quem escolhe feirante recebe diretamente o papel `Feirante`.
- O cadastro atual usa `confirmed: true` e não possui uma etapa de aprovação da existência da banca.
- O schema de Feirante ainda não contém os campos de análise sugeridos neste README.
- `html/admin.html` é somente um esqueleto vazio; a área administrativa própria ainda precisa ser construída e protegida.
- As fontes do frontend ficam em `src/ts` e são compiladas para `src/js`; a integração dos formulários com a API, o tratamento dos erros e os redirecionamentos já estão implementados. Não editar os arquivos gerados em `js`.
- O esqueleto de admin precisa carregar `../css/style.css`. Os scripts da página devem respeitar a localização de node_modules em src.

Ordem sugerida:

1. Conectar e testar cadastro e login.
2. Adicionar situação de candidatura e ajustar a rota para não liberar vendas imediatamente.
3. Configurar os papéis e proteger as rotas, incluindo restrição por proprietário.
4. Testar aprovação e recusa no painel Strapi ou na API.
5. Construir a página administrativa própria, se necessária, sobre o fluxo já testado.
6. Integrar as restrições de aprovação ao catálogo e às ações de venda. Os demais requisitos gerais estão no [README principal](README.md#proposta-e-requisitos).

Casos mínimos de teste: visitante não aprova ninguém; consumidor não lista candidatos; candidato não publica nem se autoaprova; feirante aprovado não altera banca alheia; administrador aprova/recusa; candidato recebe o retorno; suspensão bloqueia novas ações de venda. Tratar cadastro duplicado e erro de criação de perfil sem deixar conta inconsistente.

## Como executar localmente para desenvolver a área administrativa

Use Node compatível com o `engines` do package.json do backend; o projeto atual declara versões 22 a 26. As duas aplicações possuem dependências separadas.

### Frontend

Na raiz do repositório `help-me-alfredo`:

```bash
cd "Projeto final/src"
npm ci
python3 -m http.server 8000 --bind 127.0.0.1
```

Abra `http://localhost:8000/html/inicio.html`. Outra opção é usar Live Server com `src` como pasta servida. O servidor do frontend serve somente `src`, sem expor a pasta backend e seu .env.

Para alterar CSS de página, como `css/inicio.css`, basta salvar e atualizar o navegador. Para alterações em SCSS, abra outro terminal em `Projeto final/src` e execute:

```bash
npm run compilar-css
```

Isso gera `css/style.css` a partir de `scss/main.scss`, incluindo Bootstrap, navbar e footer. Não editar o arquivo gerado diretamente. Cada HTML deve carregar style.css e seu CSS de página, quando houver. Veja [o guia de CSS](css/README.md).

### Backend

Em outro terminal, partindo da raiz do repositório:

```bash
cd "Projeto final/backend"
npm ci
npm run develop
```

Na primeira configuração, preparar `.env` a partir do `.env.example` e preencher os segredos locais antes de iniciar; não usar os valores demonstrativos como segredos. Em instalações novas, conferir as aprovações de scripts de dependências necessárias, como better-sqlite3, conforme a versão do npm. Não liberar tudo nem executar `npm audit fix --force` indiscriminadamente.

Abra `http://localhost:1337/admin` e crie o primeiro administrador se o banco estiver vazio. O SQLite local normalmente fica em `.tmp/data.db`. Baixar o código não transfere as contas, permissões e conteúdo do banco de outro integrante; registrar também as etapas de configuração manual e, futuramente, dados de exemplo.

Para encerrar um servidor, use Ctrl + C no terminal correspondente. Nenhuma hospedagem paga é necessária para executar localmente.

## Identidade visual da tela

Usar a mesma identidade visual do site, descrita no [README principal](README.md#identidade-visual). Mostrar o nome da situação junto à cor: Pendente (amarelo), Aprovado (verde) e Recusado (texto explícito, podendo usar aparência neutra). Os estilos não definem autorização: apenas o backend pode permitir uma aprovação.
