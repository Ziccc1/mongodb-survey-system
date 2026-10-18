import {spawn} from 'node:child_process';
import {networkInterfaces} from 'node:os';
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const ip=Object.values(networkInterfaces()).flat().find(a=>a?.family==='IPv4'&&!a.internal)?.address;
assert.ok(ip,'A non-loopback IPv4 is required for this check');
assert.equal(JSON.parse(readFileSync('apps/web/package.json','utf8')).scripts.dev,'vite');
const origin=`http://${ip}:5181`;
const child=spawn(process.execPath,['../../node_modules/vite/bin/vite.js','--port','5181'],{cwd:'apps/web',env:{...process.env,WEB_HOST:'0.0.0.0',APP_ORIGIN:origin,PUBLIC_APP_URL:origin},stdio:['ignore','pipe','pipe']});
let output='';child.stdout.on('data',s=>output+=s);child.stderr.on('data',s=>output+=s);
try{
 let response;for(let i=0;i<50;i++){try{response=await fetch(`${origin}/app-config.js`);break;}catch{await new Promise(r=>setTimeout(r,100));}}
 assert.ok(response,output);assert.equal(response.status,200);assert.equal(await response.text(),`window.__SURVEY_CONFIG__={"publicAppUrl":"${origin}"};`);
 const health=await fetch(`${origin}/api/v1/health/ready`);assert.equal(health.status,200);assert.equal((await health.json()).data.status,'ready');
 console.log(`PASS Vite starts with WEB_HOST=0.0.0.0; non-loopback ${origin} serves explicit configured URL and same-origin API proxy health. No business writes.`);
 console.log('Second device, firewall reachability and public deployment remain unverified.');
}finally{child.kill();await new Promise(r=>child.once('exit',r));}
