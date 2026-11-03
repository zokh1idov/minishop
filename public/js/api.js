// Клиент нашего API. initData уходит в заголовке — сервер проверяет подпись.
import { tg } from './tg.js';

async function request(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `tma ${tg.initData}`,
      ...options.headers,
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `Ошибка ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return data;
}

export const api = {
  config: () => fetch('/api/config').then((r) => r.json()),
  me: () => request('/me'),
  products: () => request('/products'),
  orders: () => request('/orders'),
  createOrder: (payload) => request('/orders', { method: 'POST', body: JSON.stringify(payload) }),
};
