export interface Config {
  uri: string; dbName: string; jwtSecret: string; cursorSecret: string;
  issuer: string; audience: string; origin: string; secure: boolean; port: number; host: string;
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
  return { uri, dbName, jwtSecret, cursorSecret, issuer: 'project1-survey', audience: 'project1-web', origin, secure: origin.startsWith('https:'), port, host: '127.0.0.1' };
}
