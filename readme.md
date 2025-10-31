# 🧩 Node Todos JSON

[![CI/CD Build](https://github.com/claudio-bianco/ci-cd-pipeline-nodejs/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/claudio-bianco/ci-cd-pipeline-nodejs/actions/workflows/ci-cd.yml)
[![Coverage Status](https://img.shields.io/badge/coverage-100%25-brightgreen.svg)](https://github.com/claudio-bianco/ci-cd-pipeline-nodejs/actions)

Aplicação **Node.js + AngularJS** com persistência em **arquivo JSON**, testes unitários com **Jest**, integração e deploy automáticos via **GitHub Actions**, **Docker Hub** e **Heroku**.

---

## 🚀 Funcionalidades

- CRUD completo de *todos* (`/api/todos`)
- Servidor Express leve e simples
- Frontend em AngularJS com Bootstrap
- Persistência local em arquivo JSON (`db.json`)
- Testes unitários com Jest + cobertura 100%
- Pipeline CI/CD completo:
  - Testes + Coverage
  - Build Docker
  - Push no Docker Hub
  - Deploy automático no Heroku

---

## 🧪 Testes e Cobertura

Execute localmente:
```bash
npm ci
npm test
```

## 🧪 Heroku

https://app-nodejs-todos-api-fa19f18dd56e.herokuapp.com/


Mudar o stack do app para container:
```bash
heroku login
heroku stack:set container -a app-nodejs-todos-api
heroku apps:info -a app-nodejs-todos-api   # verifique: Stack: container
```
