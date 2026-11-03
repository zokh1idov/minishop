import test from 'node:test';
import assert from 'node:assert/strict';
import { validateInitData, signInitData } from './validate.js';

const TOKEN = '123456:TEST-TOKEN';
const now = () => Math.floor(Date.now() / 1000);
const user = JSON.stringify({ id: 42, first_name: 'Ali' });

test('валидный initData проходит', () => {
  const init = signInitData({ user, auth_date: String(now()), query_id: 'AAA' }, TOKEN);
  const res = validateInitData(init, TOKEN);
  assert.equal(res.user.id, 42);
});

test('подделка поля ломает подпись', () => {
  const init = signInitData({ user, auth_date: String(now()) }, TOKEN);
  const forged = init.replace('Ali', 'Eve');
  assert.throws(() => validateInitData(forged, TOKEN), /bad signature/);
});

test('чужой токен бота — отказ', () => {
  const init = signInitData({ user, auth_date: String(now()) }, 'other:token');
  assert.throws(() => validateInitData(init, TOKEN), /bad signature/);
});

test('устаревший auth_date — отказ', () => {
  const init = signInitData({ user, auth_date: String(now() - 7200) }, TOKEN);
  assert.throws(() => validateInitData(init, TOKEN, 3600), /expired/);
});

test('пустые данные — отказ', () => {
  assert.throws(() => validateInitData('', TOKEN));
  assert.throws(() => validateInitData('user=1', TOKEN), /hash/);
});
