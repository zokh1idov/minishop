# 🛍 Telegram Mini App — мини-магазин с корзиной

Учебный проект по ТЗ «Telegram Mini App — самостоятельная работа стажёров».
Каталог → карточка товара → корзина → оформление → подтверждение, плюс история заказов и настройки (7 экранов).
Бот присылает пользователю подтверждение заказа в чат.

**Стек:** HTML/CSS/JS (ES-модули, без сборки) · Node.js + Express · JSON-файл для заказов · Bot API.

## Запуск

```bash
npm install
cp .env.example .env        # заполнить BOT_TOKEN, APP_URL, BOT_USERNAME, APP_NAME
npm start                   # http://localhost:3000
```

1. Создайте бота в **@BotFather** (`/newbot`) и вставьте токен в `.env`.
2. Поднимите HTTPS-туннель: `cloudflared tunnel --url http://localhost:3000` (или `ngrok http 3000`), адрес пропишите в `APP_URL`.
3. `npm run setup-bot` — привяжет Mini App к кнопке меню бота и добавит команду `/start`.
4. Для ссылки `t.me/<bot>/<app>`: в @BotFather → `/newapp`, укажите тот же URL; короткое имя впишите в `APP_NAME`, username бота — в `BOT_USERNAME`.
5. (Необязательно) `BOT_POLLING=1` — бот ответит на `/start` кнопкой «Открыть магазин».

### Отладка
- **В обычном браузере** (без Telegram): поставьте `DEV_BYPASS=1` в `.env` — подключится эмуляция `Telegram.WebApp` (`public/js/mock.js`) с панелью кнопок. **В проде `DEV_BYPASS=0`.**
- **На телефоне:** откройте приложение с параметром `?debug=1` — загрузится Eruda.
- Android: Settings → Enable WebView Debug; Telegram Desktop: включите Debug Mode.

### Тесты
`npm test` — проверка валидации `initData` (верная подпись, подделка, чужой токен, устаревший `auth_date`).

## Структура

```
server/
  index.js        Express: API, авторизация, заказы
  validate.js     HMAC-SHA256 проверка initData + auth_date
  bot.js          sendMessage с подтверждением заказа, long polling для /start
  products.json   каталог
public/
  index.html
  css/style.css   тема через --tg-theme-*, safe area
  js/
    tg.js         ЕДИНСТВЕННАЯ обёртка над window.Telegram.WebApp
    buttons.js    Main / Secondary: setParams, offClick, progress
    haptic.js     весь haptic с учётом переключателя «Вибрация»
    storage.js    Cloud / Device / Secure Storage + fallback на localStorage
    state.js      корзина, настройки, каталог
    router.js     стек экранов + BackButton
    api.js, util.js, mock.js, app.js
    screens/      catalog, detail, cart, checkout, success, orders, settings
scripts/setup-bot.js
```

## Использованные методы Telegram WebApp API

| Метод / объект | Где применён |
|---|---|
| `ready()`, `expand()` | `public/js/app.js` |
| `isVersionAtLeast()` | `tg.js` (`atLeast`), `app.js`, `buttons.js`, `storage.js`, `settings.js` |
| `enableClosingConfirmation()` / `disable…` | `app.js` — пока в корзине есть товары |
| `disableVerticalSwipes()` | `app.js` |
| События `themeChanged`, `viewportChanged`, `safeAreaChanged`, `contentSafeAreaChanged` | `app.js` |
| `fullscreenChanged` | `screens/settings.js` |
| **MainButton**: `setParams` (text, is_active, `has_shine_effect`), `show/hide`, `enable/disable`, `showProgress/hideProgress`, `onClick/offClick` | `buttons.js`; тексты по экранам: `catalog.js` («Корзина · N»), `detail.js` («В корзину»), `cart.js` («Оформить заказ»), `checkout.js` («Заказать», неактивна при невалидной форме, progress при запросе), `success.js`, `orders.js` |
| **SecondaryButton**: `setParams` (position), `onClick/offClick` | `buttons.js`; `detail.js` — `left` («Поделиться»), `cart.js` — `bottom` («Очистить корзину»), `checkout.js` — `left` («Отмена»), `success.js` — `right` («Закрыть»). Вместе с Main на экранах detail, cart, checkout, success |
| **BackButton** `show/hide/onClick` | `router.js`, `app.js` |
| **SettingsButton** `show/onClick` | `app.js` → экран `settings.js` |
| **HapticFeedback**: `impactOccurred`, `notificationOccurred`, `selectionChanged` | `haptic.js` (обёртка), вызовы во всех экранах |
| `showConfirm` | `cart.js` — очистка корзины |
| `showAlert` | `checkout.js` — ошибка оформления |
| `showPopup` | обёртка `popup()` в `tg.js` |
| `themeParams` / CSS `--tg-theme-*` | `css/style.css` |
| `setHeaderColor`, `setBackgroundColor`, `setBottomBarColor` | `app.js` (`applyChrome`, повторно при `themeChanged`) |
| `safeAreaInset`, `contentSafeAreaInset` | `app.js` (`applySafeArea`) → `css/style.css` |
| `initDataUnsafe.user` (имя, `photo_url`) — **только для UI** | `catalog.js`, `settings.js`, `checkout.js` |
| `initData` → сервер | `api.js` (заголовок `Authorization: tma …`), проверка в `server/validate.js` |
| **CloudStorage** | `storage.js`, `state.js` — корзина (синхронизируется между устройствами) |
| **DeviceStorage** | `storage.js`, `state.js` — настройки (вибрация) только на этом устройстве |
| **SecureStorage** | `storage.js`, `checkout.js` — телефон для автозаполнения |

### Что для чего хранилище
- **CloudStorage** — то, что должно «ехать» за пользователем между устройствами: корзина.
- **DeviceStorage** — локальные предпочтения конкретного устройства: вибрация.
- **SecureStorage** — чувствительные данные: номер телефона. Токен бота и прочие секреты на клиенте **не хранятся никогда**.
- На клиентах старше нужной версии автоматически используется `localStorage`.

### Дополнительные функции (раздел 5, взято 4)
| Функция | Файл |
|---|---|
| `openTelegramLink` — «Поделиться» товаром и открытие канала | `screens/detail.js`, `screens/settings.js` |
| `startParam` / deep link `t.me/<bot>/<app>?startapp=product_3` (также `cart`, `orders`) | `app.js`, `detail.js` |
| `requestFullscreen` / `exitFullscreen` | `screens/settings.js` |
| `addToHomeScreen` | `screens/settings.js` |

## Дизайн
Тёмный премиум с красным акцентом: чёрный с красным подтоном, у каждого товара «витринный» красный свет, шрифт Manrope (обычный, но аккуратный) везде, заголовки и цены жирнее. Светлая тема (холодный белый + тот же красный) включается автоматически по `tg.colorScheme`; при `themeChanged` перекрашиваются шапка, фон, нижняя панель, MainButton и SecondaryButton (`public/js/app.js`, `public/js/buttons.js`). Все цвета лежат в переменных в начале `public/css/style.css`.

### Полный экран и аккаунт
На телефонах (Android/iOS, Bot API 8.0+) магазин сам открывается на весь экран через `requestFullscreen()` (`public/js/app.js`); отступы под кнопки Telegram берутся из `safeAreaInset` и `contentSafeAreaInset`. Выключить режим можно в «Настройках». Справа вверху показаны аватарка и имя из `initDataUnsafe.user` (только для отображения, авторизация идёт через проверку `initData` на сервере); нажатие открывает профиль и настройки.

### Картинки товаров
Сейчас у каждого товара своя иллюстрация (`public/js/art.js`, поле `art` в `server/products.json`). Чтобы поставить настоящее фото, положите файл в `public/img/` и добавьте товару поле `"image": "img/hoodie.jpg"`: оно имеет приоритет над рисунком. Лучше всего подходят фото на тёмном или прозрачном фоне, пропорции 4:5.

## Безопасность
- Подпись `initData` проверяется на сервере: `HMAC_SHA256(key = HMAC_SHA256("WebAppData", BOT_TOKEN), data_check_string)`; сравнение через `timingSafeEqual`; `auth_date` не старше `INIT_DATA_MAX_AGE` (по умолчанию 1 час).
- Все `/api/*` (кроме `/config` и `/health`) требуют валидный `initData`; заказы привязаны к проверенному `user.id`.
- **Цены берутся только с сервера** — сумма заказа не зависит от клиента.
- `BOT_TOKEN` только в `.env` на сервере (`.env` в `.gitignore`).

## Состояния экранов
Каталог и «Мои заказы» имеют состояния **загрузка** (скелетоны), **ошибка** (кнопка «Повторить»), **пусто**; корзина — пустое состояние.

## Чек-лист из раздела 10
- [x] Инициализация: ready, expand, проверка версии, closing confirmation
- [x] MainButton: текст, состояния, progress, снятие обработчиков
- [x] SecondaryButton: позиции left/right/bottom, совместно с Main
- [x] BackButton и SettingsButton
- [x] HapticFeedback: все 3 метода, отключение в настройках
- [x] Popup / Confirm / Alert
- [x] Тема, цвета шапки, safe area
- [x] Валидация initData на сервере
- [x] Хранилища (Cloud / Device / Secure)
- [x] Дополнительные функции (4 шт.)
- [ ] Проверка на 2+ реальных платформах, скриншоты светлой/тёмной темы — **выполняется вручную**
- [ ] Ссылка на бота / Mini App — после деплоя

## Заметки
- Подтверждение заказа отправляется через `sendMessage` (`server/bot.js`). `answerWebAppQuery` работает только при запуске из inline-режима, поэтому не используется.
- Заказ сохраняется до отправки сообщения ботом: если бот недоступен, заказ не теряется (в ответе `botNotified: false`).
- Пользователь должен хотя бы раз нажать `/start` у бота, иначе Telegram не даст боту написать первым.
