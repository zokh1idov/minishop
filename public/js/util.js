import { state } from './state.js';
import { art } from './art.js';

export const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const money = (n) =>
  new Intl.NumberFormat('ru-RU', { style: 'currency', currency: state.config.currency || 'USD', maximumFractionDigits: 0 }).format(n);

export const dateTime = (iso) =>
  new Date(iso).toLocaleString('ru-RU', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

let toastTimer;
export function toast(text) {
  const el = document.getElementById('toast');
  el.textContent = text;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 1800);
}

/** Делегирование кликов: root.on('[data-a]', handler) */
export function delegate(root, handler) {
  root.addEventListener('click', (e) => {
    const el = e.target.closest('[data-a]');
    if (el && root.contains(el)) handler(el.dataset.a, el, e);
  });
}

export const avatar = (u) =>
  u?.photo_url
    ? `<img class="avatar" src="${esc(u.photo_url)}" alt="" referrerpolicy="no-referrer">`
    : `<span class="avatar avatar-ph">${esc((u?.first_name || '?')[0].toUpperCase())}</span>`;

/** Картинка товара: фото (поле image) → рисунок (поле art) → эмодзи. */
export const visual = (p) =>
  p.image
    ? `<img class="pic" src="${esc(p.image)}" alt="" loading="lazy">`
    : art(p.art) || `<span class="emo">${esc(p.emoji)}</span>`;
