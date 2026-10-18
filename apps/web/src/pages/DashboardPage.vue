<script setup lang="ts">
import {onMounted,ref} from 'vue';
import type {Page,SurveySummary} from '@survey/shared';
import {currentUser} from '../session';
import {api} from '../api';
import SurveyRows from '../components/SurveyRows.vue';
import UiIcon from '../components/UiIcon.vue';
const items=ref<SurveySummary[]>([]),loading=ref(true),error=ref('');
async function load(){loading.value=true;error.value='';try{items.value=(await api<Page<SurveySummary>>('/surveys?limit=4')).items;}catch(e){error.value=(e as Error).message;}finally{loading.value=false;}}
onMounted(load);
</script>
<template><section class="dashboard"><div class="welcome-band"><div><span class="workspace-label"><span class="status-dot"></span>我的工作空间</span><h1 tabindex="-1">你的问卷工作台</h1><p>{{currentUser?.username}}，欢迎回来。让新的调查从一个好问题开始。</p></div><div class="welcome-route" aria-hidden="true"><span><UiIcon name="edit"/>设计问卷</span><i></i><span><UiIcon name="document"/>收集回答</span><i></i><span><UiIcon name="chart"/>查看结果</span></div></div>
<div class="dashboard-actions"><RouterLink class="dashboard-entry create-entry" to="/surveys/new"><div class="entry-content"><span class="entry-icon"><UiIcon name="plus" :size="24"/></span><h2>创建问卷</h2><p>从空白草稿开始，把想问的问题整理好。</p><span class="entry-link">创建一份问卷 <UiIcon name="arrow" :size="18"/></span></div><div class="entry-paper" aria-hidden="true"><span></span><i></i><i></i><div><b></b><em></em></div><div><b></b><em></em></div><small><UiIcon name="plus" :size="16"/></small></div></RouterLink>
<RouterLink class="dashboard-entry manage-entry" to="/surveys"><span class="entry-icon"><UiIcon name="folder" :size="24"/></span><div><h2>我的问卷</h2><p>继续编辑、管理收集，查看统计与历史答卷。</p><span class="entry-link">进入我的问卷 <UiIcon name="arrow" :size="18"/></span></div></RouterLink></div>
<section class="recent-surveys workspace-panel"><div class="section-heading"><div><h2>最近创建</h2><p>继续处理最近的问卷，所有内容来自你的工作空间。</p></div><RouterLink to="/surveys">查看全部 <UiIcon name="arrow" :size="16"/></RouterLink></div><p v-if="loading" class="loading-row" role="status">正在加载最近问卷…</p><div v-else-if="error" class="error" role="alert">{{error}} <button class="quiet" @click="load">重试</button></div><SurveyRows v-else-if="items.length" :items="items" compact/><div v-else class="recent-empty"><span class="document-tile"><UiIcon name="document" :size="24"/></span><div><h3>还没有问卷</h3><p>创建第一份草稿后，它会出现在这里。</p></div><RouterLink class="button secondary" to="/surveys/new">创建第一份问卷</RouterLink></div></section>
<aside class="dashboard-note"><span class="note-icon"><UiIcon name="layers"/></span><div><strong>先保存，再发布</strong><p>编辑内容需要手动保存。发布后可以分享；暂停收集后，可继续修改并发布新版本。</p></div></aside></section></template>
