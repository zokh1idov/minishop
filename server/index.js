import 'dotenv/config';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateInitData } from './validate.js';
import { sendOrderConfirmation, startPolling } from './bot.js';
import * as db from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const PORT = Number(process.env.PORT) || 3000;
const CURRENCY = process.env.CURRENCY || 'USD';
const MAX_AGE = Number(process.env.INIT_DATA_MAX_AGE) || 3600;
const DEV_BYPASS = process.env.DEV_BYPASS === '1';

const products = JSON.parse(fs.readFileSync(path.join(__dirname, 'products.json'), 'utf8'));
const byId = new Map(products.map((p) => [String(p.id), p]));
const money = (n) => new Intl.NumberFormat('ru-RU', { style: 'currency', currency: CURRENCY, maximumFractionDigits: 0 }).format(n);

// Express 4 не ловит ошибки async-обработчиков сам — оборачиваем.
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// ---------- авторизация ----------
function auth(req, res, next) {
  const header = req.get('Authorization') || '';
  const [scheme, ...rest] = header.split(' ');
  const initData = rest.join(' ');
  if (scheme !== 'tma' || !initData) return res.status(401).json({ error: 'Нет данных авторизации' });

  // Только для локальной отладки в браузере. В проде DEV_BYPASS должен быть 0.
  if (DEV_BYPASS && initData === 'dev') {
    req.user = { id: 1, first_name: 'Dev', username: 'dev' };
    return next();
  }
  try {
    req.user = validateInitData(initData, process.env.BOT_TOKEN, MAX_AGE).user;
    next();
  } catch (e) {
    console.warn('[auth] rejected:', e.message);
    res.status(401).json({ error: 'Неверные или устаревшие данные Telegram' });
  }
}

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '20kb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Публичная конфигурация (без секретов)
app.get('/api/config', (_req, res) =>
  res.json({
    currency: CURRENCY,
    botUsername: process.env.BOT_USERNAME || '',
    appName: process.env.APP_NAME || '',
    devBypass: DEV_BYPASS,
  }),
);

app.get('/api/products', auth, (_req, res) => res.json(products));

// Возвращает пользователя из ПРОВЕРЕННОГО initData
app.get('/api/me', auth, (req, res) => res.json({ user: req.user }));

app.get('/api/orders', auth, wrap(async (req, res) => {
  res.json(await db.listOrders(req.user.id));
}));

app.post('/api/orders', auth, wrap(async (req, res) => {
  const { items, name, phone, address, comment } = req.body || {};
  const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

  const cleanName = str(name, 80);
  const cleanPhone = str(phone, 30);
  const cleanAddr = str(address, 200);
  if (cleanName.length < 2) return res.status(400).json({ error: 'Укажите имя' });
  if (cleanPhone.replace(/\D/g, '').length < 9) return res.status(400).json({ error: 'Некорректный телефон' });
  if (cleanAddr.length < 5) return res.status(400).json({ error: 'Укажите адрес доставки' });
  if (!Array.isArray(items) || items.length === 0 || items.length > 50)
    return res.status(400).json({ error: 'Корзина пуста' });

  // Цены берём ТОЛЬКО с сервера — клиенту не доверяем
  const lines = [];
  for (const it of items) {
    const p = byId.get(String(it?.id));
    const qty = Number(it?.qty);
    if (!p || !Number.isInteger(qty) || qty < 1 || qty > 20)
      return res.status(400).json({ error: 'Некорректный товар в корзине' });
    lines.push({ id: p.id, name: p.name, qty, price: p.price });
  }
  const total = lines.reduce((s, l) => s + l.price * l.qty, 0);

  const order = await db.createOrder({
    userId: req.user.id,
    items: lines,
    total,
    name: cleanName,
    phone: cleanPhone,
    address: cleanAddr,
    comment: str(comment, 300),
  });

  // Подтверждение от бота. Заказ уже сохранён, поэтому сбой бота не валит запрос.
  let botNotified = false;
  try {
    await sendOrderConfirmation(order, money);
    botNotified = true;
  } catch (e) {
    console.warn('[bot] confirmation failed:', e.message);
  }
  res.status(201).json({ order, botNotified });
}));

app.use(express.static(path.join(ROOT, 'public')));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

await db.init();

app.listen(PORT, () => {
  console.log(`Shop server: http://localhost:${PORT} (orders: ${db.mode()})`);
  if (!process.env.BOT_TOKEN) console.warn('⚠ BOT_TOKEN не задан: проверка initData и бот не работают');
  if (DEV_BYPASS) console.warn('⚠ DEV_BYPASS=1: авторизация без Telegram включена (только для разработки!)');
  if (process.env.BOT_POLLING === '1' && process.env.BOT_TOKEN) startPolling();
});
