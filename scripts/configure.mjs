import { writeFileSync, existsSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
if (existsSync('.env')) { console.log('.env already exists; left unchanged'); }
else {
  writeFileSync('.env', `MONGODB_URI=mongodb://localhost:27018/project1_app_v2?replicaSet=rs0\nMONGODB_DB=project1_app_v2\nAPP_ORIGIN=http://localhost:5173\nPUBLIC_APP_URL=http://localhost:5173\nAPI_HOST=127.0.0.1\nWEB_HOST=localhost\nAPI_PORT=3000\nJWT_SECRET=${randomBytes(48).toString('base64url')}\nCURSOR_SECRET=${randomBytes(48).toString('base64url')}\n`.replaceAll('\\n','\n'), { flag: 'wx' });
  console.log('Created local .env with independent random secrets');
}
