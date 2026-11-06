// Обёртка над тремя хранилищами Telegram с fallback на localStorage.
//
//  cloud  — CloudStorage  (Bot API 6.9+): синхронизируется между устройствами → корзина
//  device — DeviceStorage (Bot API 9.0+): только это устройство → локальные настройки
//  secure — SecureStorage (Bot API 9.0+): защищённое хранилище → телефон для автозаполнения
import { tg, atLeast } from './tg.js';

const AREAS = { cloud: 'CloudStorage', device: 'DeviceStorage', secure: 'SecureStorage' };

function make(name, minVersion) {
  const native = () => (atLeast(minVersion) ? tg?.[AREAS[name]] || null : null);
  const ls = (k) => `shop:${name}:${k}`;

  return {
    get(key) {
      const a = native();
      if (!a) return Promise.resolve(localStorage.getItem(ls(key)));
      return new Promise((resolve) => a.getItem(key, (err, value) => resolve(err ? null : value || null)));
    },
    set(key, value) {
      const a = native();
      if (!a) {
        try { localStorage.setItem(ls(key), value); } catch { /* квота/приватный режим */ }
        return Promise.resolve(true);
      }
      return new Promise((resolve) => a.setItem(key, value, (err, ok) => resolve(!err && ok !== false)));
    },
    remove(key) {
      const a = native();
      if (!a) { localStorage.removeItem(ls(key)); return Promise.resolve(true); }
      return new Promise((resolve) => a.removeItem(key, (err) => resolve(!err)));
    },
    /** Откуда реально читаем/пишем — показывается на экране настроек. */
    backend() { return native() ? 'Telegram' : 'localStorage'; },
  };
}

export const cloud = make('cloud', '6.9');
export const device = make('device', '9.0');
export const secure = make('secure', '9.0');
