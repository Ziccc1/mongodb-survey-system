import type {FastifyInstance} from 'fastify';
import type {Db,MongoClient,ClientSession,Document} from 'mongodb';
import type {QuestionSummary,Answer,VersionContext} from '@survey/shared';
import type {Config} from '../config.js';
import {ApiError,invalid} from '../errors.js';
import {own,positive,id,pageParams,readCursor,signCursor,timePoint} from './common.js';
import type {Auth} from './common.js';
import {requireVersion,definitionOf} from './versions.js';
import {referencedVersion,responseAnswers} from './submission.js';
import type {ResponseDocument} from './submission.js';
import {transactionOptions} from './publication.js';
export function safeAnswer(a:Answer):Answer{switch(a.type){case'single':return {questionId:a.questionId,type:a.type,optionId:a.optionId};case'multiple':return {questionId:a.questionId,type:a.type,optionIds:[...a.optionIds]};case'text':return {questionId:a.questionId,type:a.type,text:a.text};case'number':return {questionId:a.questionId,type:a.type,number:a.number};}}
export function registerReporting(app:FastifyInstance,db:Db,client:MongoClient,auth:Auth,config:Config){
  const responses=db.collection<ResponseDocument>('responses');
  const read=<T>(fn:(session:ClientSession)=>Promise<T>)=>client.withSession(session=>session.withTransaction(()=>fn(session),transactionOptions));
  async function context(surveyId:string,ownerId:ReturnType<typeof id>,url:string,session:ClientSession){
    const survey=await own(db,surveyId,ownerId,session);if(survey.currentPublishedVersion===null)throw new ApiError(409,'NO_PUBLISHED_VERSION','问卷尚无可查看的发布版本');
    const query=new URL(url,'http://localhost').searchParams,version=query.has('version')?positive(query.get('version')!):survey.currentPublishedVersion;
    const snapshot=version===survey.currentPublishedVersion?await referencedVersion(db,survey._id,version,session):await requireVersion(db,survey._id,version,session);
    const filter={surveyId:survey._id,surveyDefinitionVersion:version},definition=definitionOf(snapshot);
    const info:VersionContext={surveyId:survey._id.toHexString(),selectedVersion:version,latestPublishedVersion:survey.currentPublishedVersion,cumulativeResponseCount:survey.submissionCount,currentVersionResponseCount:survey.currentVersionSubmissionCount,selectedVersionResponseCount:await responses.countDocuments(filter,{session}),generatedAt:new Date().toISOString()};
    return {survey,definition,filter,info};
  }
  for(const single of [false,true])app.get<{Params:{surveyId:string;questionId?:string}}>(single?'/api/v1/surveys/:surveyId/questions/:questionId/statistics':'/api/v1/surveys/:surveyId/statistics',async request=>{
    const user=await auth(request);return read(async session=>{
      const ctx=await context(request.params.surveyId,user._id,request.url,session);
      const selected=single?ctx.definition.questions.filter(q=>q.id===request.params.questionId):ctx.definition.questions;
      if(single&&!selected.length)throw new ApiError(404,'QUESTION_NOT_FOUND','所选版本中不存在该题');
      const groups=await responses.aggregate([{$match:ctx.filter},{$unwind:'$answers'},{$group:{_id:'$answers.questionId',answeredCount:{$sum:1},average:{$avg:{$cond:[{$eq:['$answers.type','number']},'$answers.number',null]}}}}],{session}).toArray();
      const optionGroups=await responses.aggregate([{$match:ctx.filter},{$unwind:'$answers'},{$match:{'answers.type':{$in:['single','multiple']}}},{$project:{questionId:'$answers.questionId',ids:{$cond:[{$eq:['$answers.type','single']},['$answers.optionId'],'$answers.optionIds']}}},{$unwind:'$ids'},{$group:{_id:{questionId:'$questionId',optionId:'$ids'},count:{$sum:1}}}],{session}).toArray();
      const summaries:QuestionSummary[]=selected.map(q=>{const group=groups.find(g=>g._id===q.id);return {questionId:q.id,type:q.type,title:q.title,answeredCount:group?.answeredCount??0,...(q.options?{optionCounts:q.options.map(o=>({optionId:o.id,label:o.label,count:optionGroups.find(g=>g._id.questionId===q.id&&g._id.optionId===o.id)?.count??0}))}:{}),...(q.type==='number'?{average:group?.average?.toString()??null}:{})};});
      return {data:{...ctx.info,...(single?{questionSummary:summaries[0]}:{questionSummaries:summaries})}};
    });
  });
  app.get<{Params:{surveyId:string}}>('/api/v1/surveys/:surveyId/responses',async request=>{
    const user=await auth(request),p=pageParams(request.url);if(p.cursor&&!p.version)throw new ApiError(400,'INVALID_CURSOR','后续页必须显式指定版本');
    return read(async session=>{
      const ctx=await context(request.params.surveyId,user._id,request.url,session),scope={endpoint:'responses',owner:user._id.toHexString(),surveyId:ctx.info.surveyId,version:ctx.info.selectedVersion};
      let filter:Document={...ctx.filter};if(p.cursor){const point=timePoint(readCursor(p.cursor,scope,config.cursorSecret));filter={...filter,$or:[{submittedAt:{$lt:point.time}},{submittedAt:point.time,_id:{$lt:point._id}}]};}
      const all=await responses.find(filter,{session}).sort({submittedAt:-1,_id:-1}).limit(p.limit+1).toArray(),rows=all.slice(0,p.limit),last=rows.at(-1);
      return {data:{surveyId:ctx.info.surveyId,selectedVersion:ctx.info.selectedVersion,latestPublishedVersion:ctx.info.latestPublishedVersion,items:rows.map(r=>({responseId:r._id.toHexString(),publishedVersion:r.surveyDefinitionVersion,anonymous:r.anonymous,submittedAt:r.submittedAt.toISOString()})),nextCursor:all.length>p.limit&&last?signCursor(scope,{time:last.submittedAt.toISOString(),id:last._id.toHexString()},config.cursorSecret):null}};
    });
  });
  app.get<{Params:{surveyId:string;responseId:string}}>('/api/v1/surveys/:surveyId/responses/:responseId',async request=>{
    const user=await auth(request);return read(async session=>{
      const survey=await own(db,request.params.surveyId,user._id,session),r=await responses.findOne({_id:id(request.params.responseId),surveyId:survey._id},{session});if(!r)throw new ApiError(404,'NOT_FOUND','答卷不存在或不可访问');
      const snapshot=await referencedVersion(db,r.surveyId,r.surveyDefinitionVersion,session);
      return {data:{surveyId:survey._id.toHexString(),responseId:r._id.toHexString(),publishedVersion:r.surveyDefinitionVersion,anonymous:r.anonymous,submittedAt:r.submittedAt.toISOString(),definition:definitionOf(snapshot),answers:responseAnswers(r).map(safeAnswer)}};
    });
  });
  app.get<{Params:{surveyId:string;questionId:string}}>('/api/v1/surveys/:surveyId/questions/:questionId/answers',async request=>{
    const user=await auth(request),p=pageParams(request.url);if(p.cursor&&!p.version)throw new ApiError(400,'INVALID_CURSOR','后续页必须显式指定版本');
    return read(async session=>{
      const ctx=await context(request.params.surveyId,user._id,request.url,session),q=ctx.definition.questions.find(q=>q.id===request.params.questionId);if(!q)throw new ApiError(404,'QUESTION_NOT_FOUND','所选版本中不存在该题');
      if(!['text','number'].includes(q.type))throw new ApiError(422,'UNSUPPORTED_QUESTION_TYPE','选择题请查看选项统计');
      const scope={endpoint:'answers',owner:user._id.toHexString(),surveyId:ctx.info.surveyId,version:ctx.info.selectedVersion,questionId:q.id};let filter:Document={...ctx.filter,'answers.questionId':q.id};
      if(p.cursor){const point=timePoint(readCursor(p.cursor,scope,config.cursorSecret));filter={...filter,$or:[{submittedAt:{$lt:point.time}},{submittedAt:point.time,_id:{$lt:point._id}}]};}
      const all=await responses.find(filter,{session}).sort({submittedAt:-1,_id:-1}).limit(p.limit+1).toArray(),rows=all.slice(0,p.limit),last=rows.at(-1);
      return {data:{...ctx.info,question:{id:q.id,type:q.type,title:q.title},items:rows.map(r=>({responseId:r._id.toHexString(),anonymous:r.anonymous,submittedAt:r.submittedAt.toISOString(),answer:safeAnswer(responseAnswers(r).find(a=>a.questionId===q.id)!)})),nextCursor:all.length>p.limit&&last?signCursor(scope,{time:last.submittedAt.toISOString(),id:last._id.toHexString()},config.cursorSecret):null}};
    });
  });
}
