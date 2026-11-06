// Звуки интерфейса без аудиофайлов: короткие тона через Web Audio API.
// Играют на каждое действие (через haptic.js) и выключаются переключателем «Звуки» в настройках.
//
// Браузер разрешает звук только после касания пользователя, поэтому контекст создаётся
// при первом касании экрана. Если на iPhone включён беззвучный режим, звука не будет.
import { state } from './state.js';

let ctx = null;

function audio() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx ||= new AC();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

// Разблокировка при первом касании (дальше слушатели не нужны, но дёшевы и безвредны)
['pointerdown', 'touchstart', 'click', 'keydown'].forEach((ev) =>
  document.addEventListener(ev, () => audio(), { capture: true, passive: true }),
);

/** Один тон: частота, длительность (с), тип волны, громкость, задержка (с), конечная частота (скольжение). */
function tone(freq, dur, type = 'sine', vol = 0.12, delay = 0, endFreq = null) {
  const c = audio();
  if (!c) return;
  const t0 = c.currentTime + delay;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, t0 + dur);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.008); // короткая атака, без щелчка
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

const enabled = () => state.settings.sound !== false;
const play = (fn) => { if (enabled()) fn(); };

export const sound = {
  /** Обычное нажатие кнопки / карточки */
  tap: (strength = 'light') => play(() => {
    const f = { light: 520, soft: 460, medium: 400, heavy: 320, rigid: 560 }[strength] || 520;
    tone(f, 0.07, 'sine', 0.13);
    tone(f * 1.5, 0.05, 'triangle', 0.05, 0.01);
  }),
  /** Выбор: вкладка, переключатель, + и − */
  select: () => play(() => tone(760, 0.05, 'sine', 0.1)),
  /** Товар добавлен в корзину / заказ оформлен */
  success: () => play(() => {
    tone(523, 0.12, 'sine', 0.13);
    tone(659, 0.12, 'sine', 0.13, 0.09);
    tone(784, 0.2, 'sine', 0.14, 0.18);
  }),
  /** Предупреждение: удаление, очистка */
  warning: () => play(() => {
    tone(330, 0.1, 'triangle', 0.14);
    tone(247, 0.16, 'triangle', 0.14, 0.09);
  }),
  /** Ошибка */
  error: () => play(() => {
    tone(190, 0.14, 'square', 0.07);
    tone(150, 0.2, 'square', 0.07, 0.13);
  }),
  /** Для проверки в настройках */
  demo: () => {
    if (!enabled()) return;
    sound.tap('medium');
    setTimeout(sound.success, 220);
  },
};
