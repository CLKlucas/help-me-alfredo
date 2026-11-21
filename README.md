# Feira Digital de Baturité

Projeto da cadeira de Desenvolvimento de Software para Web (S4).

Uma plataforma web para valorizar e aproximar os produtores, feirantes e a comunidade de Baturité–CE.

## Como rodar o projeto na sua máquina

Para rodar o projeto, certifique-se de ter o **Node.js** instalado. 

Agora você pode rodar os comandos diretamente da **raiz do repositório**, sem precisar ficar entrando de pasta em pasta:

### 1. Instalar as dependências (Frontend e Backend)
Rode na raiz para instalar as dependências de todo o projeto de uma vez só:
```bash
npm run setup
```
*(Ou se quiser instalar só o frontend: `npm run setup:frontend`).*

### 2. Compilar o CSS (Sass)
Para iniciar o compilador do Sass em modo de observação (`--watch`):
```bash
npm run compilar-css
```
Deixe esse terminal aberto enquanto edita os estilos. Ele vai atualizar o `src/css/style.css` automaticamente toda vez que você salvar um arquivo `.scss`.

### 3. Rodar os servidores locais

- **Frontend:**
  ```bash
  npm run dev:frontend
  ```
  Acesse `http://localhost:8000/html/inicio.html` no navegador.

- **Backend (Strapi):**
  ```bash
  npm run dev:backend
  ```
  Acesse o painel do Strapi em `http://localhost:1337/admin`.

---

## Onde mexer no código

- **Páginas (HTML):** ficam em `Projeto final/src/html/`.
- **Imagens:** ficam em `Projeto final/src/img/`.
- **Estilos (SCSS):** ficam em `Projeto final/src/scss/`.
  - `_navbar.scss`: barra de navegação.
  - `_footer.scss`: rodapé.
  - `main.scss`: arquivo mestre que junta Bootstrap + componentes.
  - > **Atenção:** não edite `src/css/style.css` diretamente. Ele é gerado automaticamente pelo Sass.
- **Backend (Strapi):** fica em `Projeto final/backend/`.

Para detalhes completos dos requisitos e da área administrativa, consulte:
- [Documentação Detalhada do Frontend](Projeto%20final/src/README.md)
- [Planejamento da Página do Administrador](Projeto%20final/src/README-ADMIN.md)

---

## Integrantes

- Alfredo Borges do Nascimento Neto — Redes de Computadores
- Francisco Lucas Gomes Almeida — Engenharia de Software
- Ryan Lopes Braga Brito — Engenharia de Software
