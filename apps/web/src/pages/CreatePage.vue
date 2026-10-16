<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { codePointLength, SURVEY_TEXT_LIMITS, surveyTextIssues } from '@survey/shared';
import type { Editor } from '@survey/shared';
import { api, RequestError } from '../api';
const router = useRouter(), title = ref(''), description = ref(''), anonymous = ref(false), repeat = ref(false), deadline = ref(''), error = ref(''), busy = ref(false), uncertain = ref(false);
const titleCount = computed(() => codePointLength(title.value.trim()));
const descriptionCount = computed(() => codePointLength(description.value));
const textIssues = computed(() => surveyTextIssues({ title: title.value, description: description.value }));
const titleTooLong = computed(() => titleCount.value > SURVEY_TEXT_LIMITS.title);
const descriptionTooLong = computed(() => descriptionCount.value > SURVEY_TEXT_LIMITS.description);
async function submit() {
  if (busy.value || uncertain.value || textIssues.value.length) return;
  error.value = ''; busy.value = true;
  try {
    const result = await api<Editor>('/surveys', 'POST', { title: title.value, description: description.value, allowAnonymous: anonymous.value, allowRepeat: repeat.value, expiresAt: deadline.value ? new Date(deadline.value).toISOString() : null });
    await router.push(`/surveys/${result.id}`);
  } catch (e) {
    if (e instanceof RequestError && e.status === 401) await router.push('/login');
    else { error.value = (e as Error).message; uncertain.value = !(e instanceof RequestError) || e.status >= 500; }
  } finally { busy.value = false; }
}
</script>
<template><section class="narrow"><RouterLink class="back" to="/surveys">← 返回我的问卷</RouterLink><p class="eyebrow">新建草稿</p><h1 tabindex="-1">创建问卷</h1><p class="muted">先填写基本信息，创建后会保存为未发布草稿。</p>
<div v-if="error" class="error" role="alert">{{ error }}<p v-if="uncertain">创建结果暂时无法确认，请先<RouterLink to="/surveys">查看问卷列表</RouterLink>，避免重复创建。</p></div>
<form class="panel create-form" @submit.prevent="submit"><label for="title">问卷标题 <span class="muted">（必填）</span></label><input id="title" v-model="title" required :aria-invalid="titleTooLong" aria-describedby="title-count title-error" placeholder="例如：校园自习空间使用调查">
<small id="title-count">{{ titleCount }} / {{ SURVEY_TEXT_LIMITS.title }} 个字符（不计首尾空格）</small><p v-if="titleTooLong" id="title-error" class="field-error" role="alert">标题已超出 {{ titleCount - SURVEY_TEXT_LIMITS.title }} 个字符，请缩短后再创建。</p>
<label for="description">问卷说明</label><textarea id="description" v-model="description" rows="4" :aria-invalid="descriptionTooLong" aria-describedby="description-help description-count description-error" placeholder="介绍调查目的，让填写者了解你的问卷。"></textarea>
<small id="description-help">最多 {{ SURVEY_TEXT_LIMITS.description }} 个字符，空格和换行也计入；组合表情可能计为多个字符。</small><small id="description-count">{{ descriptionCount }} / {{ SURVEY_TEXT_LIMITS.description }} 个字符</small>
<p v-if="descriptionTooLong" id="description-error" class="field-error" role="alert">说明已超出 {{ descriptionCount - SURVEY_TEXT_LIMITS.description }} 个字符，请缩短后再创建。</p>
<fieldset><legend>填写设置</legend><label class="check"><input v-model="anonymous" type="checkbox">允许填写者选择匿名</label><label class="check"><input v-model="repeat" type="checkbox">允许同一账号重复填写</label></fieldset>
<label for="deadline">收集截止时间 <span class="muted">（可选，本地时间）</span></label><input id="deadline" v-model="deadline" type="datetime-local"><small>留空表示不设置截止时间；草稿尚未开始收集。</small>
<div class="form-actions"><RouterLink class="button secondary" to="/surveys">取消</RouterLink><button class="primary" :disabled="busy || uncertain || textIssues.length > 0">{{ busy ? '正在保存…' : '创建草稿' }}</button></div></form></section></template>
