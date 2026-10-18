<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import type { Page, SurveySummary } from '@survey/shared';
import SurveyRows from '../components/SurveyRows.vue';
import UiIcon from '../components/UiIcon.vue';
import { api, RequestError } from '../api';
const router = useRouter(), items = ref<SurveySummary[]>([]), nextCursor = ref<string | null>(null), busy = ref(true), error = ref('');
const format = (value: string) => new Date(value).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
const statusLabels: Record<SurveySummary['status'], string> = { draft: '草稿', published: '收集中', paused: '已暂停', closed: '已关闭' };
async function load(more = false) {
  busy.value = true; error.value = '';
  try { const data = await api<Page<SurveySummary>>(`/surveys${more && nextCursor.value ? `?cursor=${encodeURIComponent(nextCursor.value)}` : ''}`); items.value = more ? [...items.value, ...data.items] : data.items; nextCursor.value = data.nextCursor; }
  catch (e) { if (e instanceof RequestError && e.status === 401) await router.push('/login'); else error.value = (e as Error).message; } finally { busy.value = false; }
}
onMounted(() => load());
</script>
<template><section><div class="page-heading"><div><h1 tabindex="-1">我的问卷</h1><p class="muted">从草稿到收集，集中管理你的每一份问卷。</p></div><RouterLink class="button primary" to="/surveys/new"><UiIcon name="plus" :size="18"/>创建问卷</RouterLink></div>
<div v-if="error" role="alert" class="error">{{ error }} <button class="quiet" @click="load()">重新加载</button></div>
<div v-if="busy && !items.length" class="panel skeleton" role="status" aria-busy="true">正在加载你的问卷…</div>
<div v-else-if="!items.length && !error" class="panel empty"><h2>还没有问卷</h2><p class="muted">为你的第一个调查起个名字，先把草稿保存下来。</p><RouterLink class="button primary" to="/surveys/new">创建第一份问卷</RouterLink></div>
<section v-else class="workspace-panel list-content"><div class="list-toolbar"><h2>全部问卷</h2><span class="muted"><UiIcon name="clock" :size="16"/> 按创建时间排列</span></div><SurveyRows :items="items" /></section>
<button v-if="nextCursor" class="secondary more" :disabled="busy" @click="load(true)">{{ busy ? '加载中…' : '加载更多' }}</button></section></template>
