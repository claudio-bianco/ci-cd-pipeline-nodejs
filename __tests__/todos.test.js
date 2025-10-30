import request from 'supertest';
import fs from 'fs';
import path from 'path';
import app from '../server.js';

const TMP_DIR = path.dirname(process.env.DB_FILE);
function clean(dir = TMP_DIR) {
  try { fs.rmSync(dir, { recursive: true, force: true }); } catch {}
}
beforeAll(() => clean());
afterEach(() => clean());

describe('API /api/todos', () => {
  test('GET /api/health deve responder ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  test('GET /api/todos vazio retorna []', async () => {
    const res = await request(app).get('/api/todos');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  test('POST cria item e GET lista contém o item', async () => {
    const create = await request(app)
      .post('/api/todos')
      .send({ title: 'Primeiro item', done: false })
      .set('Content-Type', 'application/json');
    expect([200,201]).toContain(create.status);
    const id = create.body.id;

    const list = await request(app).get('/api/todos');
    expect(list.status).toBe(200);
    expect(list.body.some(t => t.id === id)).toBe(true);
  });

  test('GET /api/todos/:id retorna 404 se não existir', async () => {
    const res = await request(app).get('/api/todos/9999');
    expect(res.status).toBe(404);
    expect(res.body.error).toBeDefined();
  });

  test('POST /api/todos sem title retorna 400', async () => {
    const res = await request(app)
      .post('/api/todos')
      .send({ done: false })
      .set('Content-Type','application/json');
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/title/i);
  });

  test('PUT atualiza title e done', async () => {
    const create = await request(app)
      .post('/api/todos')
      .send({ title: 'Atualizar', done: false })
      .set('Content-Type','application/json');
    const id = create.body.id;

    const upd = await request(app)
      .put(`/api/todos/${id}`)
      .send({ title: 'Atualizado', done: true })
      .set('Content-Type','application/json');

    expect(upd.status).toBe(200);
    expect(upd.body).toMatchObject({ id, title: 'Atualizado', done: true });
  });

  test('PUT sem campos retorna 400', async () => {
    const create = await request(app)
      .post('/api/todos')
      .send({ title: 'Nada para atualizar', done: false })
      .set('Content-Type','application/json');
    const id = create.body.id;

    const upd = await request(app)
      .put(`/api/todos/${id}`)
      .send({})
      .set('Content-Type','application/json');

    expect(upd.status).toBe(400);
    expect(upd.body.error).toMatch(/Nada para atualizar/i);
  });

  test('DELETE remove item e GET por id retorna 404', async () => {
    const create = await request(app)
      .post('/api/todos')
      .send({ title: 'Excluir', done: false })
      .set('Content-Type','application/json');
    const id = create.body.id;

    const del = await request(app).delete(`/api/todos/${id}`);
    expect([200,204]).toContain(del.status);

    const get = await request(app).get(`/api/todos/${id}`);
    expect(get.status).toBe(404);
  });

});
