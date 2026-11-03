// Экран 7 — настройки: вибрация, полноэкранный режим, ярлык на главный экран, ссылки.
import { state, updateSettings } from '../state.js';
import { cloud, device, secure } from '../storage.js';
import { setMain } from '../buttons.js';
import { haptic } from '../haptic.js';
import { tg, atLeast, user, openTgLink } from '../tg.js';
import { esc, delegate, avatar, toast } from '../util.js';

export function settings(root) {
  const u = user();
  const canFullscreen = atLeast('8.0') && typeof tg.requestFullscreen === 'function';
  const canHome = atLeast('8.0') && typeof tg.addToHomeScreen === 'function';

  function draw() {
    root.innerHTML = `
      <h1 class="pad-h">Настройки</h1>
      <div class="profile">${avatar(u)}<div><b>${esc([u?.first_name, u?.last_name].filter(Boolean).join(' ') || 'Гость')}</b><div class="hint">${u?.username ? '@' + esc(u.username) : 'id ' + esc(u?.id ?? '—')}</div></div></div>

      <div class="group">
        <label class="switch-row"><span>Вибрация</span><input type="checkbox" data-a="haptic" ${state.settings.haptic ? 'checked' : ''} /><i class="switch"></i></label>
        ${canFullscreen ? `<label class="switch-row"><span>Полноэкранный режим</span><input type="checkbox" data-a="fullscreen" ${tg.isFullscreen ? 'checked' : ''} /><i class="switch"></i></label>` : ''}
      </div>

      <div class="group">
        ${canHome ? '<button class="link-row" data-a="home">Добавить на главный экран</button>' : ''}
        <button class="link-row" data-a="channel">Новости в Telegram</button>
        <button class="link-row" data-a="test">Проверить вибрацию</button>
      </div>

      <p class="hint pad-p">Хранилища: корзина — CloudStorage (${cloud.backend()}), настройки — DeviceStorage (${device.backend()}), телефон — SecureStorage (${secure.backend()}). Версия Bot API клиента: ${esc(tg.version)}.</p>`;
  }

  delegate(root, (a, el) => {
    if (a === 'home') { haptic.impact('light'); tg.addToHomeScreen(); }
    if (a === 'channel') { haptic.impact('light'); openTgLink('https://t.me/telegram'); }
    if (a === 'test') { haptic.impact('heavy'); setTimeout(() => haptic.notify('success'), 250); toast(state.settings.haptic ? 'Вибрация включена' : 'Вибрация выключена'); }
  });

  root.addEventListener('change', (e) => {
    const a = e.target.dataset.a;
    if (a === 'haptic') {
      updateSettings({ haptic: e.target.checked });
      haptic.select(); // сработает только если вибрация осталась включённой
    }
    if (a === 'fullscreen') {
      haptic.select();
      e.target.checked ? tg.requestFullscreen() : tg.exitFullscreen();
    }
  });

  const onFs = () => { const cb = root.querySelector('[data-a=fullscreen]'); if (cb) cb.checked = tg.isFullscreen; };
  tg.onEvent('fullscreenChanged', onFs);

  setMain(null);
  draw();
  return () => tg.offEvent('fullscreenChanged', onFs);
}
