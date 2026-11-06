// Мини-роутер со стеком экранов. BackButton показывается на всех экранах, кроме первого.
import { tg } from './tg.js';
import { resetButtons } from './buttons.js';

const screens = {};
const stack = [];
let cleanup = null;
let root = null;

export const register = (name, mountFn) => { screens[name] = mountFn; };
export const current = () => stack.at(-1)?.name;

export function init(el) {
  root = el;
}

function render() {
  const { name, params } = stack.at(-1);
  if (cleanup) { try { cleanup(); } catch (e) { console.error(e); } cleanup = null; }
  resetButtons(); // каждый экран сам настраивает свои кнопки
  // Новый контейнер на каждый экран: его обработчики событий исчезают вместе с ним,
  // поэтому старые экраны не реагируют на клики новых.
  const view = document.createElement('div');
  view.className = 'view';
  root.replaceChildren(view);
  window.scrollTo(0, 0);
  cleanup = screens[name](view, params) || null;

  if (stack.length > 1) tg.BackButton.show();
  else tg.BackButton.hide();
}

export function go(name, params = {}) {
  stack.push({ name, params });
  render();
}

/** Заменить весь стек, например [['catalog'], ['success', {order}]] */
export function setStack(list) {
  stack.length = 0;
  list.forEach(([name, params = {}]) => stack.push({ name, params }));
  render();
}

export function back() {
  if (stack.length > 1) { stack.pop(); render(); }
}
