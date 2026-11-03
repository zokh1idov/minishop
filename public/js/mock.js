// Мини-эмуляция Telegram.WebApp для отладки в обычном браузере.
// Подключается автоматически, если приложение открыто вне Telegram.
// На сервере должен быть DEV_BYPASS=1.
export function createMock() {
  const bar = document.createElement('div');
  bar.id = 'mock-bar';
  bar.innerHTML = '<div class="mock-top"></div><div class="mock-bottom"></div>';
  document.body.append(bar);
  const top = bar.querySelector('.mock-top');
  const bottom = bar.querySelector('.mock-bottom');
  document.body.classList.add('has-mock');

  const makeButton = (host, label) => {
    const el = document.createElement('button');
    el.className = 'mock-btn';
    el.hidden = true;
    el.textContent = label;
    host.append(el);
    const cbs = new Set();
    el.onclick = () => cbs.forEach((f) => f());
    const b = {
      text: label, isVisible: false, isActive: true, position: 'left', hasShineEffect: false,
      setParams(p = {}) {
        if (p.text != null) { b.text = p.text; el.textContent = p.text; }
        if (p.is_visible != null) { b.isVisible = p.is_visible; el.hidden = !p.is_visible; }
        if (p.is_active != null) { b.isActive = p.is_active; el.disabled = !p.is_active; }
        if (p.position) { b.position = p.position; el.dataset.pos = p.position; }
        if (p.has_shine_effect != null) el.classList.toggle('shine', !!p.has_shine_effect);
        return b;
      },
      show() { return b.setParams({ is_visible: true }); },
      hide() { return b.setParams({ is_visible: false }); },
      enable() { return b.setParams({ is_active: true }); },
      disable() { return b.setParams({ is_active: false }); },
      showProgress() { el.classList.add('busy'); return b; },
      hideProgress() { el.classList.remove('busy'); return b; },
      onClick(f) { cbs.add(f); return b; },
      offClick(f) { cbs.delete(f); return b; },
    };
    return b;
  };

  const main = makeButton(bottom, 'MainButton');
  const secondary = makeButton(bottom, 'SecondaryButton');
  const back = makeButton(top, '← Назад');
  const settings = makeButton(top, '⚙');
  settings.el = null;

  const store = (area) => ({
    setItem: (k, v, cb) => { localStorage.setItem(`${area}:${k}`, v); cb?.(null, true); },
    getItem: (k, cb) => cb?.(null, localStorage.getItem(`${area}:${k}`)),
    removeItem: (k, cb) => { localStorage.removeItem(`${area}:${k}`); cb?.(null, true); },
  });

  const log = (...a) => console.debug('[mock tg]', ...a);
  const events = {};
  const root = document.documentElement.style;

  return {
    initData: 'dev',
    initDataUnsafe: { user: { id: 1, first_name: 'Dev', username: 'dev' }, start_param: new URLSearchParams(location.search).get('startapp') || '' },
    version: '9.0', platform: 'mock', colorScheme: matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
    themeParams: {}, isExpanded: true, isFullscreen: false, viewportHeight: innerHeight,
    safeAreaInset: { top: 0, bottom: 0, left: 0, right: 0 }, contentSafeAreaInset: { top: 0, bottom: 0, left: 0, right: 0 },
    isVersionAtLeast: () => true,
    ready() {}, expand() {}, close() { log('close'); }, disableVerticalSwipes() {},
    enableClosingConfirmation() { log('closing confirmation ON'); },
    disableClosingConfirmation() { log('closing confirmation OFF'); },
    setHeaderColor() {}, setBackgroundColor() {}, setBottomBarColor() {},
    onEvent(e, f) { (events[e] ||= new Set()).add(f); }, offEvent(e, f) { events[e]?.delete(f); },
    MainButton: main, SecondaryButton: secondary, BackButton: back, SettingsButton: settings,
    HapticFeedback: {
      impactOccurred: (s) => log('impact', s), notificationOccurred: (t) => log('notify', t), selectionChanged: () => log('selection'),
    },
    showPopup: (p, cb) => { const r = prompt(`${p.title || ''}\n${p.message}\n\n${(p.buttons || []).map((b) => b.id).join(' / ')}`); cb?.(r); },
    showConfirm: (m, cb) => cb?.(confirm(m)),
    showAlert: (m, cb) => { alert(m); cb?.(); },
    openTelegramLink: (u) => window.open(u, '_blank'), openLink: (u) => window.open(u, '_blank'),
    requestFullscreen() { this.isFullscreen = true; events.fullscreenChanged?.forEach((f) => f()); },
    exitFullscreen() { this.isFullscreen = false; events.fullscreenChanged?.forEach((f) => f()); },
    addToHomeScreen: () => log('addToHomeScreen'),
    checkHomeScreenStatus: (cb) => cb?.('unknown'),
    CloudStorage: store('cloud'), DeviceStorage: store('device'), SecureStorage: store('secure'),
    _root: root,
  };
}
