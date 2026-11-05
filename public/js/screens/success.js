// Экран 5 — заказ оформлен. Main + Secondary (позиция right).
import { setMain, setSecondary } from '../buttons.js';
import { haptic } from '../haptic.js';
import { tg } from '../tg.js';
import { setStack } from '../router.js';
import { money } from '../util.js';

export function success(root, { order }) {
  root.innerHTML = `
    <div class="state big">
      <div class="state-ico">✓</div>
      <h1>Заказ №${order.id} принят</h1>
      <p>Сумма: <b>${money(order.total)}</b></p>
      <p class="hint">Подтверждение пришло в чат с ботом.</p>
    </div>`;

  setMain({ text: 'Продолжить покупки', onClick: () => { haptic.impact('light'); setStack([['catalog']]); } });
  setSecondary({ text: 'Закрыть', position: 'right', onClick: () => { haptic.impact('light'); tg.close(); } });
}
