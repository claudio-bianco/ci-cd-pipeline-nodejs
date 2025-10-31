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

## cURL para testar

```bash
# Listar
curl -i https://app-nodejs-todos-api-fa19f18dd56e.herokuapp.com/api/todos
# Criar
curl -i -X POST https://app-nodejs-todos-api-fa19f18dd56e.herokuapp.com/api/todos -H "Content-Type: application/json" -d '{"title":"Item via curl","done":false}'
# Buscar
curl -i https://app-nodejs-todos-api-fa19f18dd56e.herokuapp.com/api/todos/1
# Atualizar
curl -i -X PUT https://app-nodejs-todos-api-fa19f18dd56e.herokuapp.com/api/todos/1 -H "Content-Type: application/json" -d '{"title":"Atualizado","done":true}'
# Excluir
curl -i -X DELETE https://app-nodejs-todos-api-fa19f18dd56e.herokuapp.com/api/todos/1
# testar API
curl -s https://app-nodejs-todos-api-fa19f18dd56e.herokuapp.com/api/health
```


## cURL em laço

```bash
for i in $(seq 1 500); do
  echo "Requisição $i"
  curl -s -o /dev/null -w "%{http_code}\n" https://app-nodejs-todos-api-fa19f18dd56e.herokuapp.com/api/health
  sleep 0.5  # aguarda 0.5s entre as requisições
done
```

```bash
for i in $(seq 1 500); do
  echo "Requisição $i"
  curl -s -o /dev/null -w "%{http_code}\n" https://app-nodejs-web-f71ea7759970.herokuapp.com/api/todos
  sleep 0.5  # aguarda 0.5s entre as requisições
done
```

```bash
for i in $(seq 1 50); do
  echo "Requisição $i"
  curl -s -o /dev/null -w "%{http_code}\n" \
  -X POST https://app-nodejs-todos-api-fa19f18dd56e.herokuapp.com/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"Item via curl","done":false}'
  sleep 0.5  # aguarda 0.5s entre as requisições
done
```

## cURL em laço

-P50 → executa até 50 requisições simultâneas.
-n1 → envia uma chamada por linha.
Ideal para testes de stress simples.

```bash
seq 1 500 | xargs -n1 -P50 -I{} curl -s -o /dev/null https://app-nodejs-todos-api-fa19f18dd56e.herokuapp.com/api/health
```