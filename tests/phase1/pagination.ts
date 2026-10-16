import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import type {Question} from '@survey/shared';
import {harness} from './harness.js';
const h=await harness('pagination');
const questions:Question[]=[{id:'text',type:'text',title:'文本内容',required:true,validation:{},jumpRules:[]},{id:'number',type:'number',title:'数字内容',required:true,validation:{integerOnly:false},jumpRules:[]}];
try{
 const s=await h.draft(questions,{allowRepeat:true,allowAnonymous:true});await h.publish(s.id);const user=await h.user();
 for(let n=0;n<3;n++){const r=await h.request('POST',`/public/surveys/${s.publicId}/responses`,{publishedVersion:1,anonymous:true,answers:[{questionId:'text',type:'text',text:`内容${n}`},{questionId:'number',type:'number',number:String(n)}]},user,{'idempotency-key':randomUUID()});assert.equal(r.statusCode,201,r.body);}
 for(const path of [`/surveys/${s.id}/responses`,`/surveys/${s.id}/questions/text/answers`,`/surveys/${s.id}/questions/number/answers`]){
   let cursor:string|null=null;const items:{responseId:string;answer?:{type:string;text?:string;number?:string}}[]=[];
   do{const r=await h.request('GET',`${path}?version=1&limit=1${cursor?`&cursor=${encodeURIComponent(cursor)}`:''}`);assert.equal(r.statusCode,200,r.body);const data=r.json().data;assert.ok(!/(respondentId|requestId|payloadHash|username)/.test(r.body));items.push(...data.items);cursor=data.nextCursor;}while(cursor);
   assert.equal(items.length,3);assert.equal(new Set(items.map(i=>i.responseId)).size,3);
   if(path.includes('/number/'))assert.deepEqual(items.map(i=>i.answer!.number),['2','1','0']);
   if(path.includes('/text/'))assert.deepEqual(items.map(i=>i.answer!.text),['内容2','内容1','内容0']);
 }
 console.log('PASS actual multi-page history, text contents and numeric strings (including zero) have no duplicates or identity fields');
 const first=await h.request('GET',`/surveys/${s.id}/questions/number/answers?version=1&limit=1`),cursor=first.json().data.nextCursor;await h.state(s.id,'pause');await h.publish(s.id);
 let r=await h.request('GET',`/surveys/${s.id}/questions/number/answers?version=2&cursor=${encodeURIComponent(cursor)}`);assert.equal(r.json().error.code,'INVALID_CURSOR');r=await h.request('GET',`/surveys/${s.id}/questions/number/answers?version=1&limit=1&cursor=${encodeURIComponent(cursor)}`);assert.equal(r.statusCode,200);assert.equal(r.json().data.items[0].answer.number,'1');assert.equal(r.json().data.latestPublishedVersion,2);console.log('PASS pinned historical pagination survives republish; cross-version cursor reuse is rejected');
 console.log('PAGINATION MODULE PASSED');
}finally{await h.close();}
