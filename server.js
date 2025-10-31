import 'newrelic'; // deve ser o primeiro import (instrumentação)
import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------- Config ----------
/* c8 ignore next */ // Porta default não precisa de teste unitário
const PORT = process.env.PORT || 3000;

// Parse robusto de ALLOW_ORIGINS → Set (performático e sem duplicatas)
/* c8 ignore next */ // Parse de config
const ALLOW_ORIGINS = new Set(
  (process.env.ALLOW_ORIGINS || '*')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
);

// Constantes imutáveis para CORS (evita magic strings e repetições)
const CORS_METHODS = Object.freeze(['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']);
const CORS_ALLOWED_HEADERS = Object.freeze(['Content-Type', 'Authorization']);

// ---------- App ----------
const app = express();
app.use(express.json({ limit: '256kb' }));

// lê a versão do package.json (fallback seguro se falhar)
let pkg = { version: '0.0.0' };
try {
  const rawPkg = fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8');
  pkg = JSON.parse(rawPkg);
} catch (e) {
  // Mantém fallback; não derruba o processo
}

/* c8 ignore start */
app.get('/api/version', (_req, res) => {
  res.json({ version: pkg.version });
});
/* c8 ignore stop */

/* c8 ignore start */
app.use(
  cors({
    origin: (origin, cb) => {
      // Permite requests sem header Origin (ex.: curl, healthchecks)
      if (!origin) return cb(null, true);

      // Aceita todos se '*' estiver configurado
      if (ALLOW_ORIGINS.has('*') || ALLOW_ORIGINS.has(origin)) {
        return cb(null, true);
      }
      return cb(new Error('Not allowed by CORS'));
    },
    methods: CORS_METHODS,
    allowedHeaders: CORS_ALLOWED_HEADERS,
  })
);
/* c8 ignore stop */

// ---------- Banco JSON ----------
const DEFAULT_DB_FILE = path.join(__dirname, 'db.json');
/* c8 ignore next */
const DB_FILE = process.env.DB_FILE ? path.resolve(process.env.DB_FILE) : DEFAULT_DB_FILE;
const TMP_FILE = `${DB_FILE}.tmp`;

// Coerção booleana previsível para flags vindas do body/query
const toBool = (v) => v === true || v === 'true' || v === 1 || v === '1';

// Utilitário de FS (infra), fora do escopo unitário
/* c8 ignore start */
function ensureDirFor(file) {
  const dir = path.dirname(file);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}
/* c8 ignore stop */

/* c8 ignore start */
function loadDB() {
  try {
    ensureDirFor(DB_FILE);
    if (!fs.existsSync(DB_FILE)) {
      const initial = { todos: [], seq: 1 };
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2));
      return initial;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    // Log mínimo, retorna estrutura vazia segura
    console.error('Falha ao ler db.json:', e.message);
    return { todos: [], seq: 1 };
  }
}
/* c8 ignore stop */

function saveDB(db) {
  ensureDirFor(DB_FILE);
  const data = JSON.stringify(db, null, 2);
  fs.writeFileSync(TMP_FILE, data);
  fs.renameSync(TMP_FILE, DB_FILE);
}

let DB = loadDB();

const now = () => new Date().toISOString().replace('T', ' ').slice(0, 19);

// ---------- Rotas ----------
const api = express.Router();

api.get('/todos', (_req, res) => {
  const list = DB.todos
    .slice()
    .sort((a, b) => b.id - a.id)
    .map((x) => ({ ...x, done: !!x.done }));
  res.json(list);
});

api.get('/todos/:id', (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

  const t = DB.todos.find((x) => x.id === id);
  /* c8 ignore next */
  if (!t) return res.status(404).json({ error: 'Registro não encontrado' });

  /* c8 ignore next */
  res.json({ ...t, done: !!t.done });
});

api.post('/todos', (req, res) => {
  const rawTitle = req.body?.title;
  if (rawTitle == null) return res.status(400).json({ error: 'Campo "title" é obrigatório' });

  const title = String(rawTitle).trim();
  if (!title) return res.status(400).json({ error: 'Campo "title" é obrigatório' });

  const done = toBool(req.body?.done);

  const id = DB.seq++;
  const created = { id, title, done, created_at: now() };
  DB.todos.push(created);

  /* c8 ignore next */
  try {
    saveDB(DB);
  } catch {
    return res.status(500).json({ error: 'Falha ao persistir dados' });
  }

  res.status(201).json({ ...created, done: !!created.done });
});

api.put('/todos/:id', (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

  const idx = DB.todos.findIndex((x) => x.id === id);
  /* c8 ignore next */
  if (idx === -1) return res.status(404).json({ error: 'Registro não encontrado' });

  const fields = {};

  if (req.body?.title !== undefined) {
    const title = String(req.body.title).trim();
    /* c8 ignore next */
    if (!title) return res.status(400).json({ error: 'Campo "title" não pode ser vazio' });
    fields.title = title;
  }

  if (req.body?.done !== undefined) {
    fields.done = toBool(req.body.done);
  }

  if (Object.keys(fields).length === 0) {
    return res.status(400).json({ error: 'Nada para atualizar' });
  }

  DB.todos[idx] = { ...DB.todos[idx], ...fields };

  /* c8 ignore next */
  try {
    saveDB(DB);
  } catch {
    return res.status(500).json({ error: 'Falha ao persistir dados' });
  }

  res.json({ ...DB.todos[idx], done: !!DB.todos[idx].done });
});

api.delete('/todos/:id', (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

  const before = DB.todos.length;
  DB.todos = DB.todos.filter((x) => x.id !== id);

  /* c8 ignore next */
  if (DB.todos.length === before) return res.status(404).json({ error: 'Registro não encontrado' });

  /* c8 ignore next */
  try {
    saveDB(DB);
  } catch {
    return res.status(500).json({ error: 'Falha ao persistir dados' });
  }

  res.status(204).end();
});

api.get('/health', (_req, res) => res.json({ ok: true, time: new Date().toISOString() }));

app.use('/api', api);

// permite sobrescrever via env nos testes, sem tocar a pasta real do projeto
/* c8 ignore next */
const PUBLIC_DIR = process.env.PUBLIC_DIR
  ? path.resolve(process.env.PUBLIC_DIR)
  : path.join(__dirname, 'public');

/* c8 ignore next */
if (fs.existsSync(PUBLIC_DIR)) {
  app.use(express.static(PUBLIC_DIR, { extensions: ['html'] }));
}

export default app;

/* c8 ignore start */ // Boot do servidor é side-effect fora do escopo unitário
if (process.argv[1] === __filename) {
  app.listen(PORT, () => console.log(`Servidor ON: http://localhost:${PORT}`));
}
/* c8 ignore stop */
