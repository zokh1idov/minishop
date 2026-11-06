// Хранилище заказов.
//  - есть DATABASE_URL  → Postgres (Neon / Supabase), данные переживают перезапуски
//  - нет DATABASE_URL   → JSON-файл data/orders.json (локальная разработка)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

let pool = null;

export const mode = () => (pool ? 'postgres' : 'file');

export async function init() {
  if (process.env.DATABASE_URL) {
    const { default: pg } = await import('pg');
    pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 5,
    });
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id         SERIAL PRIMARY KEY,
        user_id    BIGINT NOT NULL,
        items      JSONB NOT NULL,
        total      INTEGER NOT NULL,
        name       TEXT NOT NULL,
        phone      TEXT NOT NULL,
        address    TEXT NOT NULL,
        comment    TEXT NOT NULL DEFAULT '',
        status     TEXT NOT NULL DEFAULT 'new',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS orders_user_idx ON orders (user_id);
    `);
    // номера заказов начинаются с 1001
    await pool.query(`SELECT setval(pg_get_serial_sequence('orders','id'), GREATEST(1000, (SELECT COALESCE(MAX(id),0) FROM orders)))`);
    console.log('[db] Postgres connected');
  } else {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    console.warn('[db] DATABASE_URL не задан: заказы хранятся в data/orders.json (на хостинге без диска они пропадут)');
  }
}

const rowToOrder = (r) => ({
  id: r.id,
  userId: Number(r.user_id),
  items: r.items,
  total: r.total,
  name: r.name,
  phone: r.phone,
  address: r.address,
  comment: r.comment,
  status: r.status,
  createdAt: new Date(r.created_at).toISOString(),
});

// ---------- файл ----------
const readFile = () => {
  try { return JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8')); } catch { return []; }
};
const writeFile = (list) => {
  const tmp = ORDERS_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(list, null, 2));
  fs.renameSync(tmp, ORDERS_FILE);
};

// ---------- публичный API ----------
export async function listOrders(userId) {
  if (pool) {
    const { rows } = await pool.query('SELECT * FROM orders WHERE user_id = $1 ORDER BY id DESC LIMIT 100', [userId]);
    return rows.map(rowToOrder);
  }
  return readFile().filter((o) => o.userId === userId).sort((a, b) => b.id - a.id);
}

/** order: {userId, items, total, name, phone, address, comment} → заказ с id и createdAt */
export async function createOrder(order) {
  if (pool) {
    const { rows } = await pool.query(
      `INSERT INTO orders (user_id, items, total, name, phone, address, comment)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [order.userId, JSON.stringify(order.items), order.total, order.name, order.phone, order.address, order.comment],
    );
    return rowToOrder(rows[0]);
  }
  const list = readFile();
  const saved = { ...order, id: (list.at(-1)?.id || 1000) + 1, createdAt: new Date().toISOString(), status: 'new' };
  list.push(saved);
  writeFile(list);
  return saved;
}
