# Guia de CSS e Cores do site

README com CSS, imports e cores no projeto. Se for criar uma página nova ou alterar estilos, dê lida antes pra não quebrar o layout nem a identidade visual.

---

## Como importar o CSS no HTML

Arquivo principal compilado chamado **`style.css`**. Ele já vem com:

- O **Bootstrap completo** embutido;
- As **cores oficiais de Baturité** configuradas;
- O **navbar** e o **footer** prontos.

Sempre que for criar uma página nova no `src/html/`, o seu `<head>` **TEM QUE** ser assim:

```html
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Nome da Página | Feira Digital</title>

  <!-- 1º: SEMPRE importa o style.css primeiro (a base de tudo) -->
  <link rel="stylesheet" href="../css/style.css" />

  <!-- 2º: Se a página tiver estilos próprios, importa depois dele -->
  <link rel="stylesheet" href="../css/sua-pagina.css" />
</head>
```

> ⚠️ **ATENÇÃO:** Não tente importar `bootstrap.min.css` direto de `node_modules` no HTML. O `style.css` já tem o Bootstrap todo mastigado dentro dele. Menos arquivo solto, menos chance de dar erro 404.

E no final da página, antes de fechar o `</body>`, não esquecer o script do Bootstrap com o caminho certo

```html
    <!-- Script do Bootstrap pro menu hambúrguer e modals funcionarem -->

    <script src="../../node_modules/bootstrap/dist/js/bootstrap.bundle.min.js"></script>
  </body>
</html>
```

---

## 2. Como usar as cores

| Cor                 | Código Hex | Onde usar?                                                                                                                                        | Onde NÃO usar?                                                                                                                      |
| :------------------ | :--------: | :------------------------------------------------------------------------------------------------------------------------------------------------ | :---------------------------------------------------------------------------------------------------------------------------------- |
| **Azul Escuro**     | `#002680`  | **Títulos principais (`h1`, `h2`) e nomes de produtos.** Passa seriedade e autoridade institucional com contraste máximo (12.5:1).                | Não use em fundo escuro nem em textos longos de parágrafo.                                                                          |
| **Azul mais claro** | `#1D479D`  | **Subtítulos/chamadas em caixa alta, links, e botões do sistema** (ex: botão "Entrar", "Salvar").                                                 | Não coloque parágrafos inteiros em azul (fica cansativo de ler).                                                                    |
| **Verde**           | `#088344`  | **Botões de conversão/compra** ("Fazer pedido", "Criar conta"), preços e selos de "Disponível". Representa a serra, a agricultura e a feira viva. | Não use em links de texto comuns nem no fundo da página toda.                                                                       |
| **Neutro Escuro**   | `#334155`  | **Texto normal de parágrafos (`p`), labels de formulário e descrições.** É o padrão de leitura confortável.                                       | Não troque por azul ou verde em blocos de texto.                                                                                    |
| **Amarelo**         | `#FDCB57`  | **Apenas selos de destaque/promoção** ("Oferta", "Destaque da semana").                                                                           | ⚠️ **CUIDADO:** NUNCA use texto branco em cima do amarelo (contraste quase zero). Use sempre texto escuro (`#452E00` ou `#1A1A1A`)! |
| **Turquesa**        | `#41B9AB`  | **Tags e filtros de categorias** ("Hortaliças", "Cafés da Serra"). Use com fundo suave (`#E8F7F5`) e texto em tom mais escuro (`#136C63`).        | Não use como cor de texto puro sobre fundo branco.                                                                                  |
| **Fundo Suave**     | `#F0F4FA`  | **Seções alternadas** (tipo seções zebra na landing page).                                                                                        | —                                                                                                                                   |
| **Bordas**          | `#E2E8F0`  | **Linhas divisórias e bordas de cards.** É uma borda limpa e sutil que não pesa visualmente.                                                      | Evite bordas verdes ou azuis grossas cortando a tela.                                                                               |

---

## 3. Como mexer no Sass e compilar o CSS

Se você precisar alterar estilos globais (como mudar a cor padrão de algo no navbar, footer ou variáveis do Bootstrap):

1. **NUNCA altere o arquivo `src/css/style.css` na mão.** Ele é gerado automaticamente. Qualquer alteração direta nele vai sumir assim que alguém compilar o Sass!
2. Vá até a pasta `src/scss/` e edite os arquivos correspondentes:
   - `_navbar.scss`: barra de navegação;
   - `_footer.scss`: rodapé;
   - `main.scss`: configurações globais e importações.
3. Para compilar, abra o terminal na pasta `Projeto final/src` (ou use a raiz com npm) e rode:

   ```bash
   npm run compilar-css
   ```

   Ele vai rodar o Sass e atualizar o `src/css/style.css` sozinho.

---

## 4. O que NÃO fazer

1. **Não coloque `text-align: center;` no `footer` ou no `body`:** O Bootstrap trabalha com colunas (`col-md-3`). Se você força o alinhamento centralizado na tag pai, destrói o alinhamento das colunas.
2. **Não crie CSS pro que o Bootstrap já faz:** Se você só precisa de espaçamento, margem ou centralização, use classes como `py-4`, `mb-3`, `text-center`, `d-flex`, etc.
3. **Cuidado com os caminhos relativos:**
   - De um arquivo em `src/html/` para `src/css/`: use `../css/nome.css`
   - De um arquivo em `src/html/` para `Projeto final/node_modules/`: use `../../node_modules/...`
