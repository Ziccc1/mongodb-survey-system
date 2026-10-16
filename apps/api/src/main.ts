import { loadConfig } from './config.js';
import { buildApp } from './app.js';
const config = loadConfig();
const app = await buildApp(config);
for (const signal of ['SIGINT', 'SIGTERM'] as const) process.on(signal, async () => { await app.close(); process.exit(0); });
try { await app.listen({ host: config.host, port: config.port }); } catch (error) { app.log.error({ message: (error as Error).message }, 'Startup failed'); await app.close(); process.exit(1); }
