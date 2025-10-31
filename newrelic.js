'use strict';

/**
 * Configuração New Relic (Node Agent)
 * Documentação das envs: https://docs.newrelic.com/docs/apm/agents/nodejs-agent/installation-configuration/nodejs-agent-configuration/
 */
exports.config = {
  app_name: [process.env.NEW_RELIC_APP_NAME || 'app-nodejs-todos-api'],
  license_key: process.env.NEW_RELIC_LICENSE_KEY || '',
  distributed_tracing: { enabled: process.env.NEW_RELIC_DISTRIBUTED_TRACING_ENABLED === 'true' || true },

  logging: {
    level: process.env.NEW_RELIC_LOG_LEVEL || 'info',
  },

  application_logging: {
    forwarding: { enabled: process.env.NEW_RELIC_APPLICATION_LOGGING_FORWARDING_ENABLED === 'true' || true },
    enabled: true
  },

  allow_all_headers: true,

  rules: {
    // ignora healthcheck para não sujar métricas de latência
    ignore: [/^\/api\/health$/]
  },

  // Região EU (opcional): defina via env NEW_RELIC_HOST="eu01.nr-data.net"
  // host: process.env.NEW_RELIC_HOST || 'collector.newrelic.com',
};