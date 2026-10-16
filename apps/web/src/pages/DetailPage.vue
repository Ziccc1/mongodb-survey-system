<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { Editor } from '@survey/shared';
import { api, RequestError } from '../api';
const route = useRoute(), router = useRouter(), survey = ref<Editor | null>(null), busy = ref(true), error = ref('');
const format = (value: string) => new Date(value).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
async function load() {
  busy.value = true; error.value = '';
  try { survey.value = await api<Editor>(`/surveys/${route.params.surveyId}`); }
  catch (e) { if (e instanceof RequestError && e.status === 401) await router.push('/login'); else error.value = (e as Error).message; } finally { busy.value = false; }
}
onMounted(load);
</script>
<template><section class="narrow"><RouterLink class="back" to="/surveys">← 返回我的问卷</RouterLink><p v-if="busy" class="panel" role="status" aria-busy="true">正在读取草稿…</p>
<div v-else-if="error" role="alert" class="error">{{ error }} <button class="quiet" @click="load">重新加载</button></div>
<template v-else-if="survey"><div class="page-heading"><div><p class="eyebrow">问卷详情</p><h1 tabindex="-1">{{ survey.draftDefinition.title }}</h1></div><span class="badge">未发布草稿</span></div>
<p class="saved" role="status">✓ 草稿已保存，刷新页面后仍可查看。</p>
<div class="panel detail"><h2>基本信息</h2><p class="description">{{ survey.draftDefinition.description || '暂未填写问卷说明。' }}</p><dl><div><dt>题目数量</dt><dd>{{ survey.draftDefinition.questions.length }} 道</dd></div><div><dt>匿名选择</dt><dd>{{ survey.settings.allowAnonymous ? '允许' : '不允许' }}</dd></div><div><dt>重复填写</dt><dd>{{ survey.settings.allowRepeat ? '允许' : '不允许' }}</dd></div><div><dt>截止时间</dt><dd>{{ survey.settings.expiresAt ? format(survey.settings.expiresAt) : '未设置' }}</dd></div><div><dt>创建时间</dt><dd>{{ format(survey.createdAt) }}</dd></div></dl></div>
<p class="muted detail-note">当前版本支持保存和查看问卷基本信息。题目编辑与发布将在后续阶段开放。</p></template></section></template>
