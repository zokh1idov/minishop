import crypto from 'node:crypto';

/**
 * Проверка подписи Telegram initData (HMAC-SHA256).
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 *
 * @returns {{user: object, auth_date: number, start_param?: string}}
 * @throws {Error} если подпись неверна или данные устарели
 */
export function validateInitData(initData, botToken, maxAgeSec = 3600) {
  if (!initData || typeof initData !== 'string') throw new Error('initData is empty');
  if (!botToken) throw new Error('BOT_TOKEN is not configured');

  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) throw new Error('hash is missing');
  params.delete('hash');

  // data_check_string: пары key=value, отсортированные по ключу, через \n
  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');

  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const calculated = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  const a = Buffer.from(calculated, 'hex');
  const b = Buffer.from(hash, 'hex');
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) throw new Error('bad signature');

  const authDate = Number(params.get('auth_date'));
  if (!authDate) throw new Error('auth_date is missing');
  if (Date.now() / 1000 - authDate > maxAgeSec) throw new Error('initData expired');

  let user;
  try {
    user = JSON.parse(params.get('user'));
  } catch {
    throw new Error('user is missing');
  }
  if (!user?.id) throw new Error('user is missing');

  return { user, auth_date: authDate, start_param: params.get('start_param') || undefined };
}

/** Утилита для тестов: собрать корректно подписанный initData. */
export function signInitData(fields, botToken) {
  const params = new URLSearchParams(fields);
  const dcs = [...params.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');
  const secret = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  params.set('hash', crypto.createHmac('sha256', secret).update(dcs).digest('hex'));
  return params.toString();
}
