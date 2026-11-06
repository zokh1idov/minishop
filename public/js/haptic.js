// Тактильный отклик + звук. Все действия в приложении идут через этот модуль, поэтому
// переключатель «Вибрация» отключает вибрацию, а переключатель «Звуки» отключает звук.
import { tg } from './tg.js';
import { state } from './state.js';
import { sound } from './sound.js';

const on = () => state.settings.haptic && tg?.HapticFeedback;

export const haptic = {
  /** Физическое нажатие: light | medium | heavy | rigid | soft */
  impact: (style = 'light') => { sound.tap(style); on()?.impactOccurred(style); },
  /** Итог операции: success | warning | error */
  notify: (type) => {
    (sound[type] || sound.tap)();
    on()?.notificationOccurred(type);
  },
  /** Смена выбора: вкладка, чип, переключатель */
  select: () => { sound.select(); on()?.selectionChanged(); },
};
