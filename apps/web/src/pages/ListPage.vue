<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import type { Page, SurveySummary } from '@survey/shared';
import { api, RequestError } from '../api';
const router = useRouter(), items = ref<SurveySummary[]>([]), nextCursor = ref<string | null>(null), busy = ref(true), error = ref('');
const format = (value: string) => new Date(value).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
async function load(more = false) {
  busy.value = true; error.value = '';
  try { const data = await api<Page<SurveySummary>>(`/surveys${more && nextCursor.value ? `?cursor=${encodeURIComponent(nextCursor.value)}` : ''}`); items.value = more ? [...items.value, ...data.items] : data.items; nextCursor.value = data.nextCursor; }
  catch (e) { if (e instanceof RequestError && e.status === 401) await router.push('/login'); else error.value = (e as Error).message; } finally { busy.value = false; }
}
onMounted(() => load());
</script>
<template><section><div class="page-heading"><div><p class="eyebrow">你的工作空间</p><h1 tabindex="-1">我的问卷</h1><p class="muted">保存每一个调查想法。</p></div><RouterLink class="button primary" to="/surveys/new">＋ 创建问卷</RouterLink></div>
<div v-if="error" role="alert" class="error">{{ error }} <button class="quiet" @click="load()">重新加载</button></div>
<div v-if="busy && !items.length" class="panel skeleton" role="status" aria-busy="true">正在加载你的问卷…</div>
<div v-else-if="!items.length && !error" class="panel empty"><span class="empty-symbol" aria-hidden="true">▤</span><h2>还没有问卷</h2><p class="muted">为你的第一个调查起个名字，先把草稿保存下来。</p><RouterLink class="button primary" to="/surveys/new">创建第一份问卷</RouterLink></div>
<ul v-else class="survey-list"><li v-for="item in items" :key="item.id"><RouterLink :to="`/surveys/${item.id}`" class="survey-row"><span><span class="badge">草稿</span><strong>{{ item.title }}</strong><small>创建于 {{ format(item.createdAt) }}</small></span><span class="row-action">查看详情 <span aria-hidden="true">→</span></span></RouterLink></li></ul>
<button v-if="nextCursor" class="secondary more" :disabled="busy" @click="load(true)">{{ busy ? '加载中…' : '加载更多' }}</button></section></template>
