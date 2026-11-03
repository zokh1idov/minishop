// Точка входа: инициализация Telegram WebApp, тема, safe area, события, навигация.
import { ensureTg, tg, atLeast, startParam, inTelegram } from './tg.js';
import { api } from './api.js';
import { state, loadPersisted, subscribe, cartCount } from './state.js';
import * as router from './router.js';
import { catalog } from './screens/catalog.js';
import { detail } from './screens/detail.js';
import { cart } from './screens/cart.js';
import { checkout } from './screens/checkout.js';
import { success } from './screens/success.js';
import { orders } from './screens/orders.js';
import { settings } from './screens/settings.js';

const root = document.getElementById('app');

// Eruda для отладки на телефоне: открыть приложение с ?debug=1
if (new URLSearchParams(location.search).has('debug')) {
  const s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/npm/eruda';
  s.onload = () => window.eruda?.init();
  document.head.append(s);
}

/** Окраска шапки / фона / нижней панели под тему Telegram. */
function applyChrome() {
  try {
    tg.setHeaderColor?.('secondary_bg_color');
    tg.setBackgroundColor?.('secondary_bg_color');
    if (atLeast('7.10')) tg.setBottomBarColor?.('bottom_bar_bg_color');
  } catch (e) { console.warn('chrome colors:', e); }
  document.documentElement.dataset.scheme = tg.colorScheme || 'light';
}

/** Safe area: переносим значения клиента в наши CSS-переменные. */
function applySafeArea() {
  const s = document.documentElement.style;
  const a = tg.safeAreaInset || {};
  const c = tg.contentSafeAreaInset || {};
  s.setProperty('--safe-top', `${(a.top || 0) + (c.top || 0)}px`);
  s.setProperty('--safe-bottom', `${a.bottom || 0}px`);
  s.setProperty('--safe-left', `${a.left || 0}px`);
  s.setProperty('--safe-right', `${a.right || 0}px`);
}

function showFatal(message) {
  root.innerHTML = `<div class="state big"><div class="state-ico">🔒</div><h1>Не удалось войти</h1><p>${message}</p></div>`;
}

async function main() {
  await ensureTg();

  // ---- 4.1 Инициализация и жизненный цикл ----
  tg.ready();
  tg.expand();
  if (atLeast('7.7')) tg.disableVerticalSwipes(); // свайп вниз не закрывает приложение
  applyChrome();
  applySafeArea();

  tg.onEvent('themeChanged', applyChrome);
  tg.onEvent('safeAreaChanged', applySafeArea);
  tg.onEvent('contentSafeAreaChanged', applySafeArea);
  tg.onEvent('viewportChanged', () => {
    document.documentElement.style.setProperty('--vh', `${tg.viewportStableHeight || innerHeight}px`);
  });

  // ---- 4.4 BackButton / SettingsButton ----
  router.init(root);
  tg.BackButton.onClick(() => { router.back(); });
  if (atLeast('6.10')) {
    tg.SettingsButton.show();
    tg.SettingsButton.onClick(() => { if (router.current() !== 'settings') router.go('settings'); });
  }

  router.register('catalog', catalog);
  router.register('detail', detail);
  router.register('cart', cart);
  router.register('checkout', checkout);
  router.register('success', success);
  router.register('orders', orders);
  router.register('settings', settings);

  // ---- авторизация: сервер проверяет подпись initData ----
  try {
    state.config = { ...state.config, ...(await api.config()) };
    await api.me();
  } catch (e) {
    return showFatal(inTelegram ? 'Данные авторизации не прошли проверку. Закройте и откройте приложение заново.' : 'Откройте приложение из Telegram (или запустите сервер с DEV_BYPASS=1 для отладки в браузере).');
  }

  await loadPersisted();

  // Подтверждение закрытия, пока в корзине есть товары (несохранённые данные)
  const syncClosing = () => (cartCount() > 0 ? tg.enableClosingConfirmation() : tg.disableClosingConfirmation());
  subscribe(syncClosing);
  syncClosing();

  // ---- deep link: t.me/<bot>/<app>?startapp=product_3 | cart | orders ----
  const sp = startParam();
  const stack = [['catalog']];
  if (sp.startsWith('product_')) stack.push(['detail', { id: sp.slice(8) }]);
  else if (sp === 'cart') stack.push(['cart']);
  else if (sp === 'orders') stack.push(['orders']);
  router.setStack(stack);
}

main().catch((e) => { console.error(e); showFatal('Что-то пошло не так. Попробуйте перезапустить приложение.'); });
