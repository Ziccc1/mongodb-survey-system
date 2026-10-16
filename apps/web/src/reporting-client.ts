import {ref} from 'vue';
import type {VersionPage,VersionSummary} from '@survey/shared';
import {api} from './api';
export function useVersions(surveyId:string){const items=ref<VersionSummary[]>([]),latest=ref<number|null>(null),cursor=ref<string|null>(null);async function load(more=false){const data=await api<VersionPage>(`/surveys/${surveyId}/versions?limit=100${more&&cursor.value?`&cursor=${encodeURIComponent(cursor.value)}`:''}`);items.value=more?[...items.value,...data.items]:data.items;latest.value=data.latestPublishedVersion;cursor.value=data.nextCursor;}return {items,latest,cursor,load};}
export const displayTime=(value:string|null)=>value?new Date(value).toLocaleString('zh-CN',{timeZone:'Asia/Shanghai'}):'时间未知';
