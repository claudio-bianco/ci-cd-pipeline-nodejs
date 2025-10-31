# ---- Base: Node LTS leve ----
FROM node:20-alpine
WORKDIR /app

# Copia pacotes e instala apenas dependências de produção
COPY package*.json ./
RUN npm ci --omit=dev

# Copia o restante do código
COPY . .

# Define variáveis padrão
ENV NODE_ENV=production \
    DB_FILE=/app/db.json \
    PUBLIC_DIR=/app/public \
    ALLOW_ORIGINS=* \
    NEW_RELIC_APP_NAME=app-nodejs-todos-api \
    NEW_RELIC_DISTRIBUTED_TRACING_ENABLED=true \
    NEW_RELIC_APPLICATION_LOGGING_FORWARDING_ENABLED=true

# Expõe a porta padrão do servidor
EXPOSE 3000

# Healthcheck opcional
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health >/dev/null || exit 1

CMD ["node", "server.js"]
