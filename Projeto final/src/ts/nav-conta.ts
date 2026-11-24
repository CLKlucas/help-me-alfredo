import { obterMinhaConta, obterUsuario, sair } from './auth.js';

const nav = document.querySelector('nav');
const usuario = obterUsuario();
if (nav && usuario && sessionStorage.getItem('jwt')) {
  for (const destino of ['login.html', 'cadastro.html']) {
    const item = nav.querySelector(`a[href="${destino}"]`)?.closest('li');
    if (item) item.hidden = true;
  }
  const lista = nav.querySelector('.navbar-nav:last-child');
  const item = document.createElement('li');
  item.className = 'nav-item dropdown';
  item.innerHTML = `
    <button class="btn btn-outline-primary dropdown-toggle" type="button"
      data-bs-toggle="dropdown" aria-expanded="false" aria-label="Abrir menu da conta">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="1.8" aria-hidden="true" focusable="false">
        <circle cx="12" cy="7" r="4"/>
        <path d="M4 22v-3a8 8 0 0 1 16 0v3"/>
      </svg>
    </button>
    <ul class="dropdown-menu dropdown-menu-end">
      <li><a class="dropdown-item" href="perfil.html">Meu perfil</a></li>
      <li><button class="dropdown-item" type="button">Sair</button></li>
    </ul>`;
  item.querySelector('.dropdown-item[type="button"]')?.addEventListener('click', sair);
  lista?.appendChild(item);

  obterMinhaConta().then((conta) => {
    if (conta.tipo !== 'feirante') return;
    const itemPainel = document.createElement('li');
    itemPainel.className = 'nav-item';
    const link = document.createElement('a');
    link.className = 'nav-link me-lg-2';
    link.href = 'painel-feirante.html';
    link.textContent = 'Painel do feirante';
    if (window.location.pathname.endsWith('/painel-feirante.html')) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
    itemPainel.appendChild(link);
    lista?.insertBefore(itemPainel, item);
  }).catch((erro) => {
    console.error('Não foi possível verificar o acesso ao painel:', erro);
  });
}
