import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {ObjectId} from 'mongodb';
import {canonical} from '@survey/shared';
import {harness,simpleQuestions} from './harness.js';
let fail=false;const h=await harness('publish',{afterSnapshotInsert:()=>{if(fail)throw Error('Controlled failure after real snapshot insert');}});
try{
  const s=await h.draft(simpleQuestions),body={expectedRevision:s.revision,expectedDraftDefinitionVersion:s.draftDefinitionRevision},key=randomUUID();
  let r=await h.request('POST',`/surveys/${s.id}/publish`,body,0,{'publication-key':key});assert.equal(r.statusCode,201,r.body);assert.equal(r.json().data.publishedVersion,1);const link=r.json().data.shareUrl;console.log('PASS transaction publishes v1 and returns same survey share URL');
  r=await h.request('POST',`/surveys/${s.id}/publish`,body,0,{'publication-key':key});assert.equal(r.statusCode,200);assert.equal(r.json().data.replayed,true);assert.equal(await h.db.collection('survey_versions').countDocuments(),1);
  r=await h.request('POST',`/surveys/${s.id}/publish`,{...body,expectedRevision:body.expectedRevision+1},0,{'publication-key':key});assert.equal(r.json().error.code,'PUBLICATION_IDEMPOTENCY_CONFLICT');console.log('PASS publication retry replay and changed-key-content conflict');
  const original=canonical((await h.request('GET',`/surveys/${s.id}/versions/1`)).json().data);
  await h.state(s.id,'pause');let current=await h.get(s.id);const edited=structuredClone(simpleQuestions);edited[0].options![0].label='新的是';
  r=await h.request('PUT',`/surveys/${s.id}/questions`,{expectedRevision:current.revision,questions:edited});assert.equal(r.statusCode,200);assert.equal(await h.db.collection('survey_versions').countDocuments(),1);
  r=await h.publish(s.id);assert.equal(r.statusCode,201,r.body);assert.equal(r.json().data.publishedVersion,2);assert.equal(r.json().data.shareUrl,link);assert.equal(canonical((await h.request('GET',`/surveys/${s.id}/versions/1`)).json().data),original);console.log('PASS pause/edit/republish retains v1 and same ID/link; editing creates no snapshot');
  const list=await h.request('GET',`/surveys/${s.id}/versions?limit=1`);assert.equal(list.json().data.items[0].publishedVersion,2);const cursor=list.json().data.nextCursor;assert.ok(cursor);assert.equal((await h.request('GET',`/surveys/${s.id}/versions?limit=1&cursor=${encodeURIComponent(cursor)}`)).json().data.items[0].publishedVersion,1);
  const other=await h.user();assert.equal((await h.request('GET',`/surveys/${s.id}/versions`,undefined,other)).statusCode,404);assert.equal((await h.request('POST',`/surveys/${s.id}/pause`,{expectedRevision:(await h.get(s.id)).revision},other)).statusCode,404);console.log('PASS historical pagination and creator isolation');
  await h.state(s.id,'close');r=await h.request('POST',`/surveys/${s.id}/publish`,body,0,{'publication-key':key});assert.equal(r.statusCode,200);assert.equal(r.json().data.revision,body.expectedRevision+1);assert.equal((await h.get(s.id)).status,'closed');
  assert.equal((await h.publish(s.id)).statusCode,409);console.log('PASS closed state and old publish receipt replay do not reopen collection');
  const rollback=await h.draft(simpleQuestions);fail=true;r=await h.publish(rollback.id);fail=false;assert.equal(r.statusCode,500);const preserved=await h.get(rollback.id);assert.equal(preserved.status,'draft');assert.equal(preserved.currentPublishedVersion,null);assert.equal(preserved.revision,rollback.revision);assert.equal(await h.db.collection('survey_versions').countDocuments({surveyId:new ObjectId(rollback.id)}),0);console.log('PASS real transaction rollback after inserted snapshot leaves no orphan or pointer');
  const invalid=await h.draft([]);r=await h.publish(invalid.id);assert.equal(r.statusCode,422);console.log('PASS invalid empty draft cannot publish');
  console.log('PUBLICATION MODULE PASSED');
}finally{await h.close();}
