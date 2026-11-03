// Экран 3 — корзина. Main («Оформить заказ») + Secondary («Очистить корзину», позиция bottom).
import { cartItems, cartTotal, setQty, clearCart, subscribe } from '../state.js';
import { setMain, setSecondary } from '../buttons.js';
import { haptic } from '../haptic.js';
import { confirmDialog } from '../tg.js';
import { go, back } from '../router.js';
import { esc, money, delegate } from '../util.js';

export function cart(root) {
  function buttons() {
    if (!cartItems().length) {
      setSecondary(null);
      return setMain({ text: 'В каталог', onClick: () => back() });
    }
    setMain({ text: `Оформить заказ · ${money(cartTotal())}`, has_shine_effect: true, onClick: () => { haptic.impact('medium'); go('checkout'); } });
    setSecondary({
      text: 'Очистить корзину',
      position: 'bottom',
      onClick: async () => {
        haptic.notify('warning');
        // showConfirm — нативное подтверждение опасного действия
        if (await confirmDialog('Удалить все товары из корзины?')) {
          clearCart();
          haptic.notify('success');
        }
      },
    });
  }

  function draw() {
    const items = cartItems();
    if (!items.length) {
      root.innerHTML = '<div class="state"><div class="state-ico">🛒</div><p>Корзина пуста</p><p class="hint">Добавьте что-нибудь из каталога</p></div>';
    } else {
      root.innerHTML = `
        <h1 class="pad-h">Корзина</h1>
        <ul class="list">${items.map(({ product: p, qty }) => `
          <li class="row">
            <div class="mini" style="--c:${esc(p.color)}">${p.emoji}</div>
            <div class="row-main"><div class="row-name">${esc(p.name)}</div><div class="hint">${money(p.price)} × ${qty} = <b>${money(p.price * qty)}</b></div></div>
            <div class="stepper sm">
              <button data-a="minus" data-id="${p.id}" aria-label="Меньше">−</button><b>${qty}</b><button data-a="plus" data-id="${p.id}" aria-label="Больше">+</button>
            </div>
          </li>`).join('')}</ul>
        <div class="total"><span>Итого</span><b>${money(cartTotal())}</b></div>`;
    }
    buttons();
  }

  delegate(root, (a, el) => {
    const id = el.dataset.id;
    const item = cartItems().find((i) => String(i.product.id) === id);
    if (!item) return;
    if (a === 'plus') { setQty(id, item.qty + 1); haptic.select(); }
    if (a === 'minus') {
      setQty(id, item.qty - 1);
      item.qty - 1 <= 0 ? haptic.notify('warning') : haptic.select(); // удаление позиции — предупреждение
    }
  });

  const unsub = subscribe(draw);
  draw();
  return unsub;
}
