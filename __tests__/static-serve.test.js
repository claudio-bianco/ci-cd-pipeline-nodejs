import fs from 'fs';
import path from 'path';
import request from 'supertest';

const ROOT = process.cwd();
const TMP_PUB = path.join(ROOT, '.tmp', 'public-test');
const DB_TMP = path.join(ROOT, '.tmp', 'static-db.json');

function clean() {
  try { fs.rmSync(path.join(ROOT, '.tmp'), { recursive: true, force: true }); } catch {}
}

beforeAll(() => {
  clean();
  fs.mkdirSync(TMP_PUB, { recursive: true });
  fs.mkdirSync(path.dirname(DB_TMP), { recursive: true });

  // index.html temporário
  fs.writeFileSync(
    path.join(TMP_PUB, 'index.html'),
    '<!doctype html><title>ok-static</title><h1>STATIC-OK</h1>',
    'utf8'
  );

  // aponta DB e diretório público ANTES do import do app
  process.env.DB_FILE = DB_TMP;
  process.env.PUBLIC_DIR = TMP_PUB;   // <<< chave para não mexer em public/
  process.env.NODE_ENV = 'test';
});

afterAll(() => clean());

test('servir estático: GET / retorna index.html do diretório PUBLIC_DIR', async () => {
  // fura o cache ESM e carrega com as envs acima
  const { default: app3 } = await import(`../server.js?ts=${Date.now()}`);

  const res = await request(app3).get('/');
  expect(res.status).toBe(200);
  expect(res.text).toMatch(/STATIC-OK/);
});