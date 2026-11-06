// Управление нативными кнопками Telegram.
// Главное правило: onClick-обработчик ВСЕГДА снимается через offClick при смене
// экрана / параметров, иначе клики дублируются.
import { tg, atLeast } from './tg.js';

let mainHandler = null;
let secondaryHandler = null;

const isLight = () => tg.colorScheme === 'light';

/** Фирменные цвета кнопок (красный акцент); Secondary подстраивается под тему. */
const mainColors = () => (isLight() ? { color: '#c4122a', text_color: '#ffffff' } : { color: '#d9202f', text_color: '#ffffff' });
const secondaryColors = () => (isLight() ? { color: '#eceaea', text_color: '#1b1013' } : { color: '#211519', text_color: '#f6eeef' });

/**
 * MainButton. setMain(null) — скрыть и снять обработчик.
 * opts: { text, onClick, color?, text_color?, is_active?, has_shine_effect? }
 */
export function setMain(opts) {
  const b = tg.MainButton;
  if (mainHandler) { b.offClick(mainHandler); mainHandler = null; }
  b.hideProgress();
  if (!opts) { b.hide(); return; }
  const { onClick, ...params } = opts;
  if (!atLeast('7.10')) delete params.has_shine_effect; // Bot API 7.10+
  b.setParams({ is_visible: true, is_active: true, ...mainColors(), ...params });
  if (onClick) { mainHandler = onClick; b.onClick(onClick); }
}

export const mainEnabled = (on) => (on ? tg.MainButton.enable() : tg.MainButton.disable());
export const mainBusy = (busy) => (busy ? tg.MainButton.showProgress(false) : tg.MainButton.hideProgress());

/**
 * SecondaryButton (Bot API 7.10+). На старых клиентах тихо не показывается.
 * opts: { text, onClick, position: 'left'|'right'|'top'|'bottom' }
 */
export function setSecondary(opts) {
  if (!atLeast('7.10') || !tg.SecondaryButton) return;
  const b = tg.SecondaryButton;
  if (secondaryHandler) { b.offClick(secondaryHandler); secondaryHandler = null; }
  b.hideProgress();
  if (!opts) { b.hide(); return; }
  const { onClick, ...params } = opts;
  b.setParams({ is_visible: true, is_active: true, ...secondaryColors(), ...params });
  if (onClick) { secondaryHandler = onClick; b.onClick(onClick); }
}

export const hasSecondary = () => atLeast('7.10') && Boolean(tg.SecondaryButton);

export function resetButtons() {
  setMain(null);
  setSecondary(null);
}
