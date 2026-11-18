# Feira Digital de Baturité

Projeto da cadeira de Desenvolvimento de Software para Web (S4).

O site é uma feira digital voltada para os feirantes e moradores de Baturité.

## Como rodar o projeto na sua máquina

<<<<<<< Updated upstream:Projeto final/src/README.md
Os comandos abaixo partem da raiz do repositório `help-me-alfredo`.

Se você acabou de clonar o repositório ou vai mexer no código pela primeira vez, precisa ter o Node instalado no seu PC. Depois disso, segue o passo a passo:
=======
Precisa ter o **Node.js** (com npm) instalado. Para o servidor local, precisa também do **Python 3** — ou pode usar o Live Server do editor.
>>>>>>> Stashed changes:README.md

1. Abra o terminal na raiz do repositório e entre na pasta do projeto:
   ```bash
   cd projeto-final
   ```

2. Instale as dependências (Bootstrap e Sass):
   ```bash
   npm install
   ```

3. Inicie o compilador do Sass (só necessário se for mexer em arquivos `.scss`):
   ```bash
   npm run compilar-css
   ```
   Deixe esse terminal aberto enquanto estiver editando. Toda vez que você salvar um `.scss`, ele atualiza `src/css/style.css` sozinho. Para mudar o visual de `inicio.html`, edite direto `src/css/inicio.css` — não precisa compilar nada.

<<<<<<< Updated upstream:Projeto final/src/README.md
   Para apenas abrir as páginas depois da instalação, não é necessário manter o Sass rodando: o CSS compilado já está no projeto. O compilador só precisa rodar quando você alterar os arquivos SCSS.

4. Para ver o site funcionando, abra o arquivo `html/inicio.html` no seu navegador (ou use o Live Server do seu editor).

## Onde mexer no código

- **Páginas (HTML):** ficam dentro de `html/`.
- **Imagens:** ficam em `img/`.
- **Estilos (CSS/SCSS):** ficam dentro de `scss/`.
  - `_navbar.scss`: estilos da barra de navegação.
  - `_footer.scss`: estilos do rodapé.
  - `main.scss`: arquivo que junta o Bootstrap com os estilos acima.

> **Atenção:** não edite o arquivo `css/style.css` diretamente. Ele é gerado de forma automática pelo Sass. Se você mexer nele, sua alteração vai ser sobrescrita na próxima vez que alguém salvar um arquivo `.scss`. Sempre edite dentro de `scss/`.
4. Em outro terminal, ainda dentro de `projeto-final`, suba o servidor local:
   ```bash
   python3 -m http.server 8000
   ```

5. Abra no navegador:
   - Início: `http://localhost:8000/src/html/inicio.html`
   - Outras páginas: `http://localhost:8000/src/html/login.html`, `sobre.html`, etc.

   > Sirva a pasta `projeto-final` (raiz do projeto), não a pasta `src`: o menu usa o caminho `../../node_modules/bootstrap/...`, que só funciona a partir da raiz. Para encerrar o servidor, aperte `Ctrl + C`.

   Se preferir, use o **Live Server** do VS Code: abra a pasta `projeto-final`, clique com o botão direito em `src/html/inicio.html` e escolha "Open with Live Server".

## Onde mexer no código

- **Páginas (HTML):** ficam dentro de `src/html/`.
- **Imagens:** ficam em `src/img/`.
- **Estilos (CSS):** ficam dentro de `src/css/`, um arquivo por parte do site.
  - `inicio.css`: cores, fundos e seções da página inicial — edite as cores direto no arquivo.
  - `navbar.css`: barra de navegação.
  - `footer.css`: rodapé.
  - `login.css` e `cadastro.css`: páginas de login e cadastro.
  - `style.css`: gerado pelo Sass; não edite direto.
- **Estilos (SCSS):** ficam em `src/scss/` (`main.scss`, `_navbar.scss`, `_footer.scss`) e geram `style.css`.

> Cada HTML carrega seus CSS no `<head>`. `inicio.html` usa Bootstrap + `navbar.css` + `footer.css` + `inicio.css`; as outras páginas usam Bootstrap + `navbar.css` (mais `login.css` ou `cadastro.css` quando aplicável). O `style.css` gerado pelo Sass não está sendo usado pelas páginas neste momento.

> **Atenção:** não edite `src/css/style.css` diretamente. Ele é gerado automaticamente e qualquer mudança nele é sobrescrita na próxima compilação.

## Integrantes

- Alfredo Borges do Nascimento Neto
- Francisco Lucas Gomes Almeida
- Ryan Lopes Braga Brito
