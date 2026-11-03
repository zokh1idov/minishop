// Тактильный отклик. Все вызовы идут через этот модуль, поэтому
// переключатель «Вибрация» в настройках отключает haptic во всём приложении.
import { tg } from './tg.js';
import { state } from './state.js';

const on = () => state.settings.haptic && tg?.HapticFeedback;

export const haptic = {
  /** Физическое нажатие: light | medium | heavy | rigid | soft */
  impact: (style = 'light') => on()?.impactOccurred(style),
  /** Итог операции: success | warning | error */
  notify: (type) => on()?.notificationOccurred(type),
  /** Смена выбора: вкладка, чип, переключатель */
  select: () => on()?.selectionChanged(),
};
