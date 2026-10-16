import { randomBytes, scrypt, timingSafeEqual, createHmac } from 'node:crypto';
import { promisify } from 'node:util';
import { SignJWT, jwtVerify } from 'jose';
import type { Config } from './config.js';
const derive = promisify(scrypt);
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const hash = await derive(password, salt, 64) as Buffer;
  return `scrypt$16384$8$1$${salt}$${hash.toString('hex')}`;
}
export async function verifyPassword(password: string, encoded: string) {
  const parts = encoded.split('$');
  if (parts.length !== 6 || parts.slice(0, 4).join('$') !== 'scrypt$16384$8$1') return false;
  const actual = await derive(password, parts[4], 64) as Buffer;
  const expected = Buffer.from(parts[5], 'hex');
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
export async function signAuth(id: string, config: Config) {
  return new SignJWT({}).setProtectedHeader({ alg: 'HS256' }).setSubject(id).setIssuer(config.issuer).setAudience(config.audience).setIssuedAt().setExpirationTime('2h').sign(new TextEncoder().encode(config.jwtSecret));
}
export async function readAuth(token: string, config: Config) {
  return (await jwtVerify(token, new TextEncoder().encode(config.jwtSecret), { algorithms: ['HS256'], issuer: config.issuer, audience: config.audience })).payload.sub;
}
export function encodeCursor(owner: string, point: { id: string; createdAt: string }, secret: string) {
  const payload = Buffer.from(JSON.stringify({ endpoint: '/surveys', owner, ...point })).toString('base64url');
  return `${payload}.${createHmac('sha256', secret).update(payload).digest('base64url')}`;
}
export function decodeCursor(value: string, owner: string, secret: string): { id: string; createdAt: string } {
  const [payload, signature, extra] = value.split('.');
  if (!payload || !signature || extra !== undefined) throw new Error('Invalid cursor');
  const expected = createHmac('sha256', secret).update(payload).digest();
  const actual = Buffer.from(signature, 'base64url');
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) throw new Error('Invalid cursor');
  const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString());
  if (parsed.owner !== owner || parsed.endpoint !== '/surveys' || !/^[0-9a-f]{24}$/.test(parsed.id) || new Date(parsed.createdAt).toISOString() !== parsed.createdAt) throw new Error('Invalid cursor');
  return parsed;
}
// JSON.parse alone accepts repeated object keys. Walk its token stream after syntax validation.
export function parseUniqueJson(source: string): unknown {
  const parsed: unknown = JSON.parse(source);
  const tokens = source.match(/"(?:\\.|[^"\\])*"|-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?|true|false|null|[{}\[\]:,]/g) ?? [];
  let i = 0;
  function value(): void {
    const token = tokens[i++];
    if (token === '{') {
      const keys = new Set<string>();
      while (tokens[i] !== '}') {
        const key = JSON.parse(tokens[i++]) as string;
        if (keys.has(key)) throw new Error('Duplicate JSON key'); keys.add(key);
        i++; value(); if (tokens[i] !== ',') break; i++;
      }
      i++;
    } else if (token === '[') { while (tokens[i] !== ']') { value(); if (tokens[i] !== ',') break; i++; } i++; }
  }
  value(); return parsed;
}
