import { jest } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import request from 'supertest';

const TMP_DIR = '.tmp';
const BAD_DB = path.join(TMP_DIR, 'invalid-db.json');

let errSpy;

beforeAll(() => {
  try { fs.rmSync(TMP_DIR, { recursive: true, force: true }); } catch {}
  fs.mkdirSync(TMP_DIR, { recursive: true });
  fs.writeFileSync(BAD_DB, '{ invalid json', 'utf8');

  // define envs ANTES do import
  process.env.DB_FILE = BAD_DB;
  process.env.NODE_ENV = 'test';

  // espiona e silencia console.error
  errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  if (errSpy?.mockRestore) errSpy.mockRestore();
  try { fs.rmSync(TMP_DIR, { recursive: true, force: true }); } catch {}
});

test('loadDB trata JSON inválido e API continua respondendo', async () => {
  // força reimport do app em ESM
  const { default: app2 } = await import(`../server.js?ts=${Date.now()}`);

  const res = await request(app2).get('/api/todos');
  expect(res.status).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);

  // valida que o log foi emitido
  expect(errSpy).toHaveBeenCalled();
  const joined = errSpy.mock.calls.map(args => args.join(' ')).join('\n');
  expect(joined).toMatch(/Falha ao ler db\.json/i);
});
