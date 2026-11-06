// Глобальное состояние: корзина (CloudStorage), настройки (DeviceStorage), каталог, конфиг.
import { cloud, device } from './storage.js';

export const state = {
  cart: {}, // { [productId]: qty }
  settings: { haptic: true, fullscreen: true, sound: true },
  products: [],
  config: { currency: 'USD', botUsername: '', appName: '' },
};

const listeners = new Set();
export const subscribe = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };
const emit = () => listeners.forEach((fn) => fn());

export async function loadPersisted() {
  const [cart, settings] = await Promise.all([cloud.get('cart'), device.get('settings')]);
  try { state.cart = JSON.parse(cart) || {}; } catch { state.cart = {}; }
  try { Object.assign(state.settings, JSON.parse(settings) || {}); } catch { /* defaults */ }
  emit();
}

let saveTimer;
const persistCart = () => {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => cloud.set('cart', JSON.stringify(state.cart)), 300);
};

export function setQty(id, qty) {
  if (qty <= 0) delete state.cart[id];
  else state.cart[id] = Math.min(qty, 20);
  persistCart();
  emit();
}

export function clearCart() {
  state.cart = {};
  persistCart();
  emit();
}

export function setProducts(list) {
  state.products = list;
  // убрать из корзины товары, которых больше нет в каталоге
  let changed = false;
  for (const id of Object.keys(state.cart)) {
    if (!list.some((p) => String(p.id) === id)) { delete state.cart[id]; changed = true; }
  }
  if (changed) persistCart();
}

export function updateSettings(patch) {
  Object.assign(state.settings, patch);
  device.set('settings', JSON.stringify(state.settings));
  emit();
}

export const product = (id) => state.products.find((p) => String(p.id) === String(id));
export const cartItems = () =>
  Object.entries(state.cart)
    .map(([id, qty]) => ({ product: product(id), qty }))
    .filter((i) => i.product);
export const cartCount = () => cartItems().reduce((s, i) => s + i.qty, 0);
export const cartTotal = () => cartItems().reduce((s, i) => s + i.product.price * i.qty, 0);
