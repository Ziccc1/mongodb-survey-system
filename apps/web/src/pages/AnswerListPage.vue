<script setup lang="ts">
import {onMounted,ref} from 'vue';
import {useRoute} from 'vue-router';
import type {AnswerPage,Answer} from '@survey/shared';
import {api} from '../api';
import {displayTime} from '../reporting-client';
const route=useRoute(),id=String(route.params.surveyId),qid=String(route.params.questionId),data=ref<AnswerPage|null>(null),busy=ref(true),error=ref('');
function value(answer:Answer){return answer.type==='text'?answer.text:answer.type==='number'?answer.number:'';}
async function load(more=false){busy.value=true;error.value='';try{const version=data.value?.selectedVersion??route.query.version;const result=await api<AnswerPage>(`/surveys/${id}/questions/${qid}/answers?limit=20${version?`&version=${version}`:''}${more&&data.value?.nextCursor?`&cursor=${encodeURIComponent(data.value.nextCursor)}`:''}`);if(more&&data.value)result.items=[...data.value.items,...result.items];data.value=result;}catch(e){error.value=(e as Error).message;}finally{busy.value=false;}}
onMounted(()=>load());
</script>
<template><section class="narrow"><RouterLink class="back" :to="`/surveys/${id}/statistics?version=${data?.selectedVersion??route.query.version??''}`">← 返回统计</RouterLink><h1 tabindex="-1">{{data?.question.title??'回答内容'}}</h1><p v-if="data" class="muted">所选发布 v{{data.selectedVersion}}，仅列出有效回答。</p><p v-if="error" class="error" role="alert">{{error}} <button class="quiet" @click="load()">重试</button></p><p v-if="busy" role="status">正在读取回答…</p><template v-if="data"><p v-if="!data.items.length&&!busy" class="panel">该版本暂无有效回答。</p><article v-for="item in data.items" :key="item.responseId" class="panel raw-answer"><p class="muted">{{item.anonymous?'匿名答卷':'非匿名答卷'}} · {{displayTime(item.submittedAt)}}</p><p class="answer-value">{{value(item.answer)}}</p><RouterLink :to="`/surveys/${id}/responses/${item.responseId}`">查看完整历史答卷</RouterLink></article><button v-if="data.nextCursor" class="secondary more" :disabled="busy" @click="load(true)">加载更多回答</button></template></section></template>
