## Instalar e rodar

```bash
cd node-todos-json
npm install
npm run start
# ou em dev:
npm run dev
```

API local: `http://localhost:3000`

* * *

## cURL para testar

```bash
# Listar
curl -i http://localhost:3000/api/todos
# Criar
curl -i -X POST http://localhost:3000/api/todos -H "Content-Type: application/json" -d '{"title":"Item via curl","done":false}'
# Buscar
curl -i http://localhost:3000/api/todos/1
# Atualizar
curl -i -X PUT http://localhost:3000/api/todos/1 -H "Content-Type: application/json" -d '{"title":"Atualizado","done":true}'
# Excluir
curl -i -X DELETE http://localhost:3000/api/todos/1
```

* * *

## Rodar testes unitários

```bash
npx jest --clearCache

npm test

npx jest --showConfig
```


xdg-open coverage/lcov-report/server.js.html



| Ação                       | Comando            |
| -------------------------- | ------------------ |
| Executar servidor          | `npm start`        |
| Ambiente dev com reload    | `npm run dev`      |
| Rodar testes               | `npm test`         |
| Rodar testes com cobertura | `npm run coverage` |


## Comandos

```bash
# buildar e subir o container
docker compose up -d --build

# checar logs
docker compose logs -f

# testar API
curl -s http://localhost:3000/api/health
```

## Se quiser reiniciar a API “zerada”

```bash
docker compose down -v && docker compose up -d --build

docker compose build --no-cache
docker compose up -d
```