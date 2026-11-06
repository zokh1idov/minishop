// Тонкая обёртка над Bot API. Токен читается только на сервере.
const api = (method, body) => {
  const token = process.env.BOT_TOKEN;
  if (!token) return Promise.reject(new Error('BOT_TOKEN is not configured'));
  return fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then(async (r) => {
    const json = await r.json().catch(() => ({}));
    if (!json.ok) throw new Error(json.description || `Bot API ${method} failed`);
    return json.result;
  });
};

export const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function openShopMarkup() {
  const url = process.env.APP_URL;
  if (!url) return undefined;
  return { inline_keyboard: [[{ text: '🛍 Открыть магазин', web_app: { url } }]] };
}

/** Подтверждение заказа пользователю в чат с ботом. */
export function sendOrderConfirmation(order, currencyFmt) {
  const lines = order.items.map((i) => `• ${esc(i.name)} × ${i.qty} — ${currencyFmt(i.price * i.qty)}`);
  const text = [
    `✅ <b>Заказ №${order.id} принят</b>`,
    '',
    ...lines,
    '',
    `<b>Итого: ${currencyFmt(order.total)}</b>`,
    `📍 ${esc(order.address)}`,
    `📞 ${esc(order.phone)}`,
    '',
    'Мы свяжемся с вами для подтверждения.',
  ].join('\n');
  return api('sendMessage', {
    chat_id: order.userId,
    text,
    parse_mode: 'HTML',
    reply_markup: openShopMarkup(),
  });
}

/** Простой long polling: отвечает на /start кнопкой запуска Mini App. */
export async function startPolling() {
  let offset = 0;
  console.log('[bot] long polling started');
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const updates = await api('getUpdates', { offset, timeout: 25, allowed_updates: ['message'] });
      for (const u of updates) {
        offset = u.update_id + 1;
        const msg = u.message;
        if (msg?.text?.startsWith('/start')) {
          await api('sendMessage', {
            chat_id: msg.chat.id,
            text: 'Привет! Это мини-магазин. Нажмите кнопку, чтобы открыть каталог 👇',
            reply_markup: openShopMarkup(),
          });
        }
      }
    } catch (e) {
      console.error('[bot] polling error:', e.message);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
}
