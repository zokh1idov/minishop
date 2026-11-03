// Единая обёртка над window.Telegram.WebApp.
// Остальной код НЕ обращается к window.Telegram напрямую.
const real = window.Telegram?.WebApp;

/** true, если приложение реально открыто внутри Telegram (есть подписанный initData). */
export const inTelegram = Boolean(real && real.initData);

/** Live-binding: после ensureTg() содержит либо настоящий WebApp, либо mock для браузера. */
export let tg = real;

export async function ensureTg() {
  if (!inTelegram) {
    const { createMock } = await import('./mock.js');
    tg = createMock();
  }
  return tg;
}

/** Проверка поддержки метода/функции клиентом: atLeast('7.10'). */
export const atLeast = (v) => {
  try { return Boolean(tg?.isVersionAtLeast?.(v)); } catch { return false; }
};

export const user = () => tg?.initDataUnsafe?.user || null;
export const startParam = () => tg?.initDataUnsafe?.start_param || '';

// ---- нативные окна (Promise-обёртки) ----
export const confirmDialog = (message) =>
  new Promise((resolve) => tg.showConfirm(message, (ok) => resolve(Boolean(ok))));

export const alertDialog = (message) =>
  new Promise((resolve) => tg.showAlert(message, () => resolve()));

/** buttons: [{id, type?: 'default'|'ok'|'close'|'cancel'|'destructive', text?}] -> id нажатой кнопки */
export const popup = ({ title, message, buttons }) =>
  new Promise((resolve) => tg.showPopup({ title, message, buttons }, (id) => resolve(id)));

// ---- ссылки ----
export const openTgLink = (url) => tg.openTelegramLink(url);
export const openLink = (url) => tg.openLink(url);
