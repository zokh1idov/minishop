// Экран 6 — история заказов. Состояния: загрузка / ошибка / пусто / список.
import { api } from '../api.js';
import { setMain } from '../buttons.js';
import { haptic } from '../haptic.js';
import { back } from '../router.js';
import { esc, money, dateTime, delegate } from '../util.js';

export function orders(root) {
  let alive = true;

  const view = (html) => { if (alive) root.innerHTML = `<h1 class="pad-h">Мои заказы</h1>${html}`; };

  async function load() {
    view('<ul class="list">' + '<li class="row skeleton tall"></li>'.repeat(3) + '</ul>');
    setMain(null);
    try {
      const list = await api.orders();
      if (!list.length) {
        view('<div class="state"><div class="state-ico">📭</div><p>Заказов пока нет</p></div>');
        return setMain({ text: 'В каталог', onClick: () => back() });
      }
      view(`<ul class="list">${list.map((o) => `
        <li class="order">
          <div class="order-head"><b>Заказ №${o.id}</b><span class="hint">${dateTime(o.createdAt)}</span></div>
          <div class="hint">${o.items.map((i) => `${esc(i.name)} × ${i.qty}`).join(', ')}</div>
          <div class="order-foot"><span class="pill">${o.status === 'new' ? 'Новый' : esc(o.status)}</span><b>${money(o.total)}</b></div>
        </li>`).join('')}</ul>`);
    } catch {
      haptic.notify('error');
      view('<div class="state"><div class="state-ico">⚠️</div><p>Не удалось загрузить заказы</p><button class="btn" data-a="retry">Повторить</button></div>');
    }
  }

  delegate(root, (a) => { if (a === 'retry') { haptic.impact('medium'); load(); } });
  load();
  return () => { alive = false; };
}
