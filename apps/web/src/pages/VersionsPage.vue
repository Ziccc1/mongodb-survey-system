<script setup lang="ts">
import {onMounted,ref} from 'vue';
import {useRoute} from 'vue-router';
import type {VersionDetail} from '@survey/shared';
import {api} from '../api';
import {useVersions,displayTime} from '../reporting-client';
import VersionPicker from '../components/VersionPicker.vue';
import DefinitionView from '../components/DefinitionView.vue';
const route=useRoute(),id=String(route.params.surveyId),versions=useVersions(id),selected=ref<number|null>(null),detail=ref<VersionDetail|null>(null),busy=ref(true),error=ref('');
async function select(v:number){selected.value=v;busy.value=true;error.value='';try{detail.value=await api<VersionDetail>(`/surveys/${id}/versions/${v}`);}catch(e){error.value=(e as Error).message;detail.value=null;}finally{busy.value=false;}}
async function init(){busy.value=true;try{await versions.load();const v=route.query.version?Number(route.query.version):versions.latest.value;if(v)await select(v);}catch(e){error.value=(e as Error).message;}finally{busy.value=false;}}
onMounted(init);
</script>
<template><section class="narrow"><RouterLink class="back" :to="`/surveys/${id}`">← 返回编辑</RouterLink><h1 tabindex="-1">历史发布版本</h1><p class="muted">每次正式发布保存一份独立定义，查看历史不会切换当前发布版本。</p><p v-if="error" class="error" role="alert">{{error}} <button class="quiet" @click="init">重试</button></p><VersionPicker v-if="versions.items.value.length" :items="versions.items.value" :selected="selected" :more="!!versions.cursor.value" :disabled="busy" @select="select" @more="versions.load(true)" /><p v-if="busy" role="status">正在读取发布定义…</p><p v-else-if="!versions.items.value.length&&!error" class="panel">尚未发布，没有历史版本。</p><template v-if="detail"><div class="page-heading"><div><h2>v{{detail.publishedVersion}} · {{detail.definition.title}}</h2><p class="muted">发布于 {{displayTime(detail.publishedAt)}}</p></div><RouterLink :to="`/surveys/${id}/statistics?version=${detail.publishedVersion}`">查看该版统计</RouterLink></div><DefinitionView :definition="detail.definition" /></template></section></template>
