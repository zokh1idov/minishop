// Экран 2 — карточка товара. Main («В корзину») + Secondary («Поделиться», позиция left).
import { state, product, setQty } from '../state.js';
import { setMain, setSecondary } from '../buttons.js';
import { haptic } from '../haptic.js';
import { openTgLink } from '../tg.js';
import { back } from '../router.js';
import { esc, money, delegate, toast, visual } from '../util.js';

export function detail(root, { id }) {
  const p = product(id);
  if (!p) {
    root.innerHTML = '<div class="state"><div class="state-ico">🔍</div><p>Товар не найден</p></div>';
    return;
  }
  let qty = state.cart[p.id] || 1;
  const inCart = Boolean(state.cart[p.id]);

  const shareLink = () => {
    const { botUsername, appName } = state.config;
    return botUsername && appName ? `https://t.me/${botUsername}/${appName}?startapp=product_${p.id}` : '';
  };

  function buttons() {
    setMain({
      text: `${inCart ? 'Обновить' : 'В корзину'} · ${money(p.price * qty)}`,
      onClick: () => {
        setQty(p.id, qty);
        haptic.notify('success');
        toast(inCart ? 'Корзина обновлена' : 'Добавлено в корзину');
        back();
      },
    });
    // Поделиться — через openTelegramLink; нужен deep link t.me/<bot>/<app>?startapp=...
    if (shareLink()) {
      setSecondary({
        text: 'Поделиться',
        position: 'left',
        onClick: () => {
          haptic.impact('soft');
          const url = `https://t.me/share/url?url=${encodeURIComponent(shareLink())}&text=${encodeURIComponent(`${p.emoji} ${p.name} — ${money(p.price)}`)}`;
          openTgLink(url);
        },
      });
    }
  }

  function draw() {
    root.innerHTML = `
      <div class="hero">${visual(p)}</div>
      <div class="pad" style="padding-top:22px">
        <h1>${esc(p.name)}</h1>
        <div class="price-big">${money(p.price)}</div>
        <p class="desc">${esc(p.description)}</p>
        <div class="stepper-row">
          <span>Количество</span>
          <div class="stepper">
            <button data-a="minus" aria-label="Меньше" ${qty <= 1 ? 'disabled' : ''}>−</button>
            <b>${qty}</b>
            <button data-a="plus" aria-label="Больше" ${qty >= 20 ? 'disabled' : ''}>+</button>
          </div>
        </div>
      </div>`;
    buttons();
  }

  delegate(root, (a) => {
    if (a === 'minus' && qty > 1) { qty--; haptic.select(); draw(); }
    if (a === 'plus' && qty < 20) { qty++; haptic.select(); draw(); }
  });
  draw();
}
