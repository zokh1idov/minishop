// Экран 1 — каталог. Состояния: загрузка / ошибка / пусто / список.
import { api } from '../api.js';
import { state, subscribe, setProducts, cartCount, cartTotal } from '../state.js';
import { setMain } from '../buttons.js';
import { haptic } from '../haptic.js';
import { user } from '../tg.js';
import { go } from '../router.js';
import { esc, money, delegate, visual } from '../util.js';

export function catalog(root) {
  let category = 'all';
  let status = state.products.length ? 'ok' : 'loading';
  let alive = true;

  const categories = () => ['all', ...new Set(state.products.map((p) => p.category))];

  const ICON_ORDERS = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h10a1 1 0 0 1 1 1v17l-3-2-3 2-3-2-3 2V4a1 1 0 0 1 1-1z"/><path d="M9 8h6M9 12h6"/></svg>';
  const ICON_CART = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l-1 12H6L5 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>';

  function header() {
    const u = user();
    return `
      <header class="top">
        <div>
          <div class="brand">Minishop</div>
          <div class="greeting">Здравствуйте, <b>${esc(u?.first_name || 'гость')}</b></div>
        </div>
        <div class="top-actions">
          <button class="icon-btn" data-a="orders" aria-label="Мои заказы">${ICON_ORDERS}</button>
          <button class="icon-btn" data-a="cart" aria-label="Корзина">${ICON_CART}${cartCount() ? `<i class="badge">${cartCount()}</i>` : ''}</button>
        </div>
      </header>`;
  }

  function body() {
    if (status === 'loading')
      return `<div class="grid">${Array.from({ length: 6 }, () => '<div class="card skeleton"></div>').join('')}</div>`;
    if (status === 'error')
      return `<div class="state"><div class="state-ico">⚠️</div><p>Не удалось загрузить каталог</p><button class="btn" data-a="retry">Повторить</button></div>`;
    const list = state.products.filter((p) => category === 'all' || p.category === category);
    if (!list.length)
      return `<div class="state"><div class="state-ico">🫙</div><p>В этой категории пока пусто</p><button class="btn" data-a="chip" data-c="all">Показать всё</button></div>`;
    return `<div class="grid">${list.map((p) => `
      <button class="card" data-a="open" data-id="${p.id}">
        <div class="thumb">${visual(p)}</div>
        <div class="card-name">${esc(p.name)}</div>
        <div class="card-price">${money(p.price)}</div>
      </button>`).join('')}</div>`;
  }

  function draw() {
    if (!alive) return;
    root.innerHTML = `
      ${header()}
      ${status === 'ok' ? `<div class="chips">${categories().map((c) => `<button class="chip ${c === category ? 'on' : ''}" data-a="chip" data-c="${esc(c)}">${c === 'all' ? 'Все' : esc(c)}</button>`).join('')}</div>` : ''}
      ${body()}`;
  }

  function syncMain() {
    const n = cartCount();
    if (!n) return setMain(null);
    setMain({ text: `Корзина · ${n} · ${money(cartTotal())}`, onClick: () => { haptic.impact('light'); go('cart'); } });
  }

  async function load() {
    status = 'loading'; draw();
    try {
      setProducts(await api.products());
      status = 'ok';
    } catch (e) {
      status = 'error';
      haptic.notify('error');
    }
    draw(); syncMain();
  }

  delegate(root, (a, el) => {
    if (a === 'open') { haptic.impact('light'); go('detail', { id: el.dataset.id }); }
    if (a === 'chip') { haptic.select(); category = el.dataset.c; draw(); }
    if (a === 'cart') { haptic.impact('light'); go('cart'); }
    if (a === 'orders') { haptic.impact('light'); go('orders'); }
    if (a === 'retry') { haptic.impact('medium'); load(); }
  });

  const unsub = subscribe(() => { if (status === 'ok') { draw(); } syncMain(); });
  draw(); syncMain();
  if (status !== 'ok') load();

  return () => { alive = false; unsub(); };
}
