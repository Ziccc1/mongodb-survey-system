import type {ClientSession,Db} from 'mongodb';
import type {ObjectId} from 'mongodb';
import {canonical,normalizeQuestions,validateQuestions} from '@survey/shared';
import type {Definition,VersionDetail} from '@survey/shared';
import {fromBson} from '../question-codec.js';
import {ApiError} from '../errors.js';
import {hash} from './common.js';
export interface VersionDocument {_id?:ObjectId;schemaVersion:1;surveyId:ObjectId;version:number;sourceDefinitionVersion:number;definition:unknown;policySnapshot:{allowAnonymous:boolean;allowRepeat:boolean};definitionHash:string;publishedAt:Date;publishedBy:ObjectId;publicationRequestId:string;publicationRequestHash:string;origin:{kind:'publication'}}
// Intentionally exposes find/list/insert only. No version update, replace or delete operation.
export function versionRepository(db:Db){
  const collection=db.collection<VersionDocument>('survey_versions');
  return {
    find:(surveyId:ObjectId,version:number,session?:ClientSession)=>collection.findOne({surveyId,version},{session}),
    byRequest:(surveyId:ObjectId,publicationRequestId:string,session?:ClientSession)=>collection.findOne({surveyId,publicationRequestId},{session}),
    list:(surveyId:ObjectId,before:number|undefined,limit:number,session?:ClientSession)=>collection.find({surveyId,...(before?{version:{$lt:before}}:{})},{session}).sort({version:-1}).limit(limit).toArray(),
    insert:(document:VersionDocument,session:ClientSession)=>collection.insertOne(document,{session}),
  };
}
export function definitionOf(version:VersionDocument):Definition{
  try{
    const definition=fromBson(version.definition) as Definition;
    const checked=validateQuestions(definition.questions);
    if(checked.errors.length||checked.validationIssues.length||!definition.title.trim())throw Error();
    const normalized={...definition,questions:normalizeQuestions(definition.questions)};
    if(hash({definition:normalized,policy:version.policySnapshot})!==version.definitionHash)throw Error();
    return normalized;
  }catch{throw new ApiError(503,'VERSION_DEFINITION_UNAVAILABLE','历史发布定义损坏或待恢复');}
}
export async function requireVersion(db:Db,surveyId:ObjectId,version:number,session?:ClientSession){const stored=await versionRepository(db).find(surveyId,version,session);if(!stored)throw new ApiError(404,'VERSION_NOT_FOUND','所选发布版本不存在');definitionOf(stored);return stored;}
export function versionDto(v:VersionDocument):VersionDetail{return {surveyId:v.surveyId.toHexString(),publishedVersion:v.version,sourceDraftDefinitionRevision:v.sourceDefinitionVersion,definition:definitionOf(v),policy:{...v.policySnapshot},publishedAt:v.publishedAt.toISOString(),legacy:false};}
