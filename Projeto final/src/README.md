# Feira Digital de Baturité

Projeto da cadeira de Desenvolvimento de Software para Web (S4): uma plataforma para aproximar consumidores, feirantes e pequenos produtores de Baturité.

Este README apresenta a proposta geral, os requisitos, a identidade visual, as tecnologias e a organização do projeto. O planejamento detalhado da área administrativa está em [README-ADMIN.md](README-ADMIN.md). As funcionalidades previstas não devem ser interpretadas como já implementadas.

## Consulta rápida

- [Proposta e requisitos](#proposta-e-requisitos)
- [Identidade visual](#identidade-visual)
- [Perfis e permissões](#perfis-e-permissões)
- [Tecnologias utilizadas](#tecnologias-utilizadas)
- [Como executar o projeto](#como-executar-o-projeto)
- [Estrutura do projeto](#estrutura-do-projeto)
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
| Frontend | HTML, CSS e JavaScript para as páginas e a integração com a API. |
| Interface | Bootstrap 5 para componentes, grid e responsividade. |
| Estilos compartilhados | Sass compila SCSS em css/style.css. Os estilos de cada página continuam em CSS separado. |
| Backend | Strapi 5, executado com Node.js. |
| Contas do site | Plugin Users & Permissions para autenticação e papéis de acesso. |
| Administração do Strapi | Painel nativo, com contas e permissões próprias gerenciadas por RBAC. |
| Arquivos e imagens | Recurso Upload do Strapi. |
| Banco local | SQLite, acessado pelo better-sqlite3. |
| Comunicação | API REST entre o frontend e o backend. |
| Dependências | npm, com package.json maestro na raiz para atalhos do projeto (setup e compilação) e arquivos separados em frontend e backend. |

Essas tecnologias são a base do projeto; sua presença não significa que todas as funcionalidades previstas estejam concluídas.

## Estrutura do projeto

```text
help-me-alfredo/
├── package.json                 # Scripts maestros na raiz (setup, compilar-css, dev)
└── Projeto final/
    ├── src/                     # Frontend
    │   ├── html/
    │   ├── css/
    │   ├── scss/
    │   ├── img/
    │   ├── js/
    │   ├── node_modules/        # Gerado pelo npm; ignorado pelo Git
    │   ├── package.json
    │   ├── README.md
    │   └── README-ADMIN.md      # Planejamento da área administrativa
    └── backend/                 # Strapi
        ├── config/
        ├── src/api/
        ├── .env                # Configuração local; não publicar
        ├── .env.example         # Modelo sem segredos reais
        ├── node_modules/
        └── package.json
```

## Como executar o projeto

Os comandos podem ser executados diretamente a partir da raiz do repositório `help-me-alfredo`:

### 1. Instalação das dependências
Instala as dependências do frontend e do backend em uma única etapa:
```bash
npm run setup
```
*(Para instalar apenas um deles: `npm run setup:frontend` ou `npm run setup:backend`).*

### 2. Compilação de estilos (Sass)
Para iniciar a compilação com atualização automática (`--watch`):
```bash
npm run compilar-css
```

### 3. Servidores locais
- **Frontend:** `npm run dev:frontend` (acesso em `http://localhost:8000/html/inicio.html`).
- **Backend (Strapi):** `npm run dev:backend` (acesso em `http://localhost:1337/admin`).

## Equipe

- Alfredo Borges do Nascimento Neto — Redes de Computadores.
- Francisco Lucas Gomes Almeida — Engenharia de Software.
- Ryan Lopes Braga Brito — Engenharia de Software.
