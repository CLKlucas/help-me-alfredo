# Feira Digital de Baturité

Projeto da cadeira de Desenvolvimento de Software para Web (S4).

O site é uma feira digital voltada para os feirantes e moradores de Baturité.

## Como rodar o projeto na sua máquina

Se você acabou de clonar o repositório ou vai mexer no código pela primeira vez, precisa ter o Node instalado no seu PC. Depois disso, segue o passo a passo:

1. Abra o terminal e entre na pasta do projeto:
   ```bash
   cd "Projeto final"
   ```

2. Instale as dependências (Bootstrap e Sass):
   ```bash
   npm install
   ```

3. Inicie o compilador do Sass:
   ```bash
   npm run compilar-css
   ```
   Deixe esse terminal aberto enquanto estiver editando. Toda vez que você salvar uma mudança nos arquivos `.scss`, ele vai atualizar o CSS final sozinho.

4. Para ver o site funcionando, abra o arquivo `src/html/inicio.html` no seu navegador (ou use o Live Server do seu editor).

## Onde mexer no código

- **Páginas (HTML):** ficam dentro de `src/html/`.
- **Imagens:** ficam em `src/img/`.
- **Estilos (CSS/SCSS):** ficam dentro de `src/scss/`.
  - `_navbar.scss`: estilos da barra de navegação.
  - `_footer.scss`: estilos do rodapé.
  - `main.scss`: arquivo que junta o Bootstrap com os estilos acima.

> **Atenção:** não edite o arquivo `src/css/style.css` diretamente. Ele é gerado de forma automática pelo Sass. Se você mexer nele, sua alteração vai ser sobrescrita na próxima vez que alguém salvar um arquivo `.scss`. Sempre edite dentro de `src/scss/`.

## Integrantes

- Alfredo Borges do Nascimento Neto
- Francisco Lucas Gomes Almeida
- Ryan Lopes Braga Brito
