export interface Config {
  uri: string; dbName: string; jwtSecret: string; cursorSecret: string;
  issuer: string; audience: string; origin: string; publicAppUrl?: string; secure: boolean; port: number; host: string;
}
export function loadConfig(): Config {
  const required = (key: string) => { const value = process.env[key]; if (!value) throw new Error(`Missing ${key}; run npm run configure`); return value; };
  const uri = required('MONGODB_URI'); const dbName = required('MONGODB_DB');
  const parsed = new URL(uri);
  if (!['localhost', '127.0.0.1'].includes(parsed.hostname) || !/^project1_(app_v2|test_[a-zA-Z0-9_]+)$/.test(dbName) || decodeURIComponent(parsed.pathname.slice(1)) !== dbName || parsed.searchParams.get('replicaSet') !== 'rs0') throw new Error('Use a dedicated local project1 database on rs0; unknown databases require reviewed migration');
  const jwtSecret = required('JWT_SECRET'), cursorSecret = required('CURSOR_SECRET');
  if (jwtSecret.length < 48 || cursorSecret.length < 48 || jwtSecret === cursorSecret) throw new Error('Independent strong JWT/CURSOR secrets required');
  const origin = required('APP_ORIGIN'); if (new URL(origin).origin !== origin) throw new Error('APP_ORIGIN must be an origin');
  const port = Number(process.env.API_PORT ?? 3000); if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('Invalid API_PORT');
  const publicAppUrl = process.env.PUBLIC_APP_URL ?? origin;
  if (new URL(publicAppUrl).origin !== publicAppUrl || !/^https?:/.test(publicAppUrl) || publicAppUrl !== origin) throw new Error('PUBLIC_APP_URL must equal APP_ORIGIN (one exact same-origin deployment)');
  const host = process.env.API_HOST ?? '127.0.0.1';
  if (!['127.0.0.1','0.0.0.0','::1'].includes(host)) throw new Error('Invalid API_HOST');
  return { uri, dbName, jwtSecret, cursorSecret, issuer: 'project1-survey', audience: 'project1-web', origin, publicAppUrl, secure: origin.startsWith('https:'), port, host };
}
