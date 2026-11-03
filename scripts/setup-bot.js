// Привязывает Mini App к кнопке меню бота и ставит команду /start.
// Запуск: npm run setup-bot   (нужны BOT_TOKEN и APP_URL в .env)
import 'dotenv/config';

const { BOT_TOKEN, APP_URL } = process.env;
if (!BOT_TOKEN || !APP_URL) {
  console.error('Заполните BOT_TOKEN и APP_URL в .env');
  process.exit(1);
}

const call = async (method, body) => {
  const r = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const j = await r.json();
  console.log(method, j.ok ? 'OK' : `FAIL: ${j.description}`);
};

await call('setChatMenuButton', {
  menu_button: { type: 'web_app', text: 'Магазин', web_app: { url: APP_URL } },
});
await call('setMyCommands', { commands: [{ command: 'start', description: 'Открыть магазин' }] });
