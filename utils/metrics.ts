import client from 'prom-client';

// Use a global variable to prevent reloading issues in development
const globalAny: any = global;

if (!globalAny.registry) {
  const registry = new client.Registry();
  client.collectDefaultMetrics({ register: registry, prefix: 'nextjs_app_' });
  globalAny.registry = registry;
}

const register = globalAny.registry;

export { register };
