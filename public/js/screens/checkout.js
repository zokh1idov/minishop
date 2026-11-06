// Экран 4 — оформление. Пока форма невалидна, MainButton неактивна.
import { api } from '../api.js';
import { cartItems, cartTotal, clearCart } from '../state.js';
import { setMain, setSecondary, mainEnabled, mainBusy } from '../buttons.js';
import { haptic } from '../haptic.js';
import { user, alertDialog } from '../tg.js';
import { secure } from '../storage.js';
import { back, setStack } from '../router.js';
import { esc, money } from '../util.js';

const RULES = {
  name: { test: (v) => v.trim().length >= 2, msg: 'Введите имя (минимум 2 символа)' },
  phone: { test: (v) => v.replace(/\D/g, '').length >= 9, msg: 'Введите корректный телефон' },
  address: { test: (v) => v.trim().length >= 5, msg: 'Укажите адрес доставки' },
};

export function checkout(root) {
  const u = user();
  const values = { name: u?.first_name || '', phone: '', address: '', comment: '' };
  let submitting = false;

  const valid = () => Object.entries(RULES).every(([k, r]) => r.test(values[k]));

  function field(key, label, type, extra = '') {
    return `
      <label class="field">
        <span>${label}</span>
        <input id="f-${key}" name="${key}" type="${type}" value="${esc(values[key])}" ${extra} />
        <small class="err" id="e-${key}"></small>
      </label>`;
  }

  root.innerHTML = `
    <h1 class="pad-h">Оформление</h1>
    <form class="form" novalidate>
      ${field('name', 'Имя', 'text', 'autocomplete="name"')}
      ${field('phone', 'Телефон', 'tel', 'autocomplete="tel" inputmode="tel" placeholder="+998 90 123 45 67"')}
      ${field('address', 'Адрес доставки', 'text', 'autocomplete="street-address"')}
      <label class="field"><span>Комментарий (необязательно)</span><textarea id="f-comment" name="comment" rows="2"></textarea></label>
    </form>
    <div class="total"><span>К оплате</span><b>${money(cartTotal())}</b></div>`;

  async function submit() {
    if (submitting || !valid()) return;
    submitting = true;
    mainEnabled(false);
    mainBusy(true); // индикатор на MainButton во время запроса
    try {
      const { order } = await api.createOrder({
        items: cartItems().map((i) => ({ id: i.product.id, qty: i.qty })),
        ...values,
      });
      secure.set('phone', values.phone); // SecureStorage: запоминаем для автозаполнения
      clearCart();
      haptic.notify('success');
      setStack([['catalog'], ['success', { order }]]);
    } catch (e) {
      haptic.notify('error');
      await alertDialog(e.message || 'Не удалось оформить заказ. Попробуйте ещё раз.');
      submitting = false;
      mainBusy(false);
      mainEnabled(valid());
    }
  }

  setMain({ text: `Заказать · ${money(cartTotal())}`, has_shine_effect: true, is_active: false, onClick: submit });
  setSecondary({ text: 'Отмена', position: 'left', onClick: () => { haptic.impact('light'); back(); } });
  mainEnabled(valid());

  root.addEventListener('input', (e) => {
    const input = e.target;
    if (!(input.name in values)) return;
    values[input.name] = input.value;
    const rule = RULES[input.name];
    if (rule) { // ошибку убираем сразу, как только поле стало корректным
      const err = root.querySelector(`#e-${input.name}`);
      if (rule.test(input.value)) err.textContent = '';
    }
    mainEnabled(valid() && !submitting);
  });

  root.addEventListener('focusout', (e) => {
    const input = e.target;
    const rule = RULES[input.name];
    if (!rule) return;
    const err = root.querySelector(`#e-${input.name}`);
    const bad = !rule.test(input.value);
    err.textContent = bad ? rule.msg : '';
    if (bad) haptic.notify('error');
  });

  // автозаполнение телефона из SecureStorage
  secure.get('phone').then((phone) => {
    if (phone && !values.phone) {
      values.phone = phone;
      root.querySelector('#f-phone').value = phone;
      mainEnabled(valid());
    }
  });
}
