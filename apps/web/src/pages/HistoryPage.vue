<script setup lang="ts">
import {onMounted,ref} from 'vue';
import {useRoute} from 'vue-router';
import type {ResponseDetail,ResponsePage} from '@survey/shared';
import {api} from '../api';
import {useVersions,displayTime} from '../reporting-client';
import VersionPicker from '../components/VersionPicker.vue';
import DefinitionView from '../components/DefinitionView.vue';
const route=useRoute(),id=String(route.params.surveyId),responseId=route.params.responseId?String(route.params.responseId):null,versions=useVersions(id),selected=ref<number|null>(null),list=ref<ResponsePage|null>(null),detail=ref<ResponseDetail|null>(null),busy=ref(true),error=ref('');
async function load(more=false){if(!selected.value)return;busy.value=true;error.value='';try{const data=await api<ResponsePage>(`/surveys/${id}/responses?version=${selected.value}&limit=20${more&&list.value?.nextCursor?`&cursor=${encodeURIComponent(list.value.nextCursor)}`:''}`);if(more&&list.value)data.items=[...list.value.items,...data.items];list.value=data;}catch(e){error.value=(e as Error).message;}finally{busy.value=false;}}
function select(v:number){selected.value=v;list.value=null;load();}
async function init(){busy.value=true;error.value='';try{if(responseId)detail.value=await api<ResponseDetail>(`/surveys/${id}/responses/${responseId}`);else{await versions.load();selected.value=route.query.version?Number(route.query.version):versions.latest.value;if(selected.value)await load();}}catch(e){error.value=(e as Error).message;}finally{busy.value=false;}}
onMounted(init);
</script>
<template><section class="narrow"><RouterLink class="back" :to="responseId?`/surveys/${id}/responses?version=${detail?.publishedVersion??''}`:`/surveys/${id}`">← {{responseId?'返回答卷列表':'返回问卷'}}</RouterLink><h1 tabindex="-1">{{responseId?'历史答卷详情':'历史答卷'}}</h1><p v-if="error" class="error" role="alert">{{error}} <button class="quiet" @click="init">重试</button></p><VersionPicker v-if="!responseId&&versions.items.value.length" :items="versions.items.value" :selected="selected" :more="!!versions.cursor.value" :disabled="busy" @select="select" @more="versions.load(true)" /><p v-if="busy" role="status">正在读取答卷…</p>
<template v-if="detail"><p class="muted">发布 v{{detail.publishedVersion}} · {{detail.anonymous?'匿名答卷':'非匿名答卷'}} · {{displayTime(detail.submittedAt)}}</p><h2>{{detail.definition.title}}</h2><DefinitionView :definition="detail.definition" :answers="detail.answers" /></template>
<template v-else-if="list"><p v-if="!list.items.length&&!busy" class="panel">该版本还没有答卷。</p><ul v-else class="survey-list"><li v-for="item in list.items" :key="item.responseId"><RouterLink class="survey-row" :to="`/surveys/${id}/responses/${item.responseId}`"><span><strong>{{item.anonymous?'匿名答卷':'非匿名答卷'}}</strong><small>v{{item.publishedVersion}} · {{displayTime(item.submittedAt)}}</small></span><span class="row-action">查看详情 →</span></RouterLink></li></ul><button v-if="list.nextCursor" class="secondary more" :disabled="busy" @click="load(true)">加载更多答卷</button></template><p v-else-if="!busy&&!error" class="panel">尚未发布，没有历史答卷。</p></section></template>
