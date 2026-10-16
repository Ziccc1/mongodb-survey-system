<script setup lang="ts">
import { computed } from 'vue';
import { codePointLength, SURVEY_TEXT_LIMITS, surveyTextIssues } from '@survey/shared';
import type { CreateSurvey, Editor } from '@survey/shared';
const props = defineProps<{ model: CreateSurvey; survey: Editor; busy: boolean; blocked: boolean; dirty: boolean }>();
defineEmits<{ save: [] }>();
const textIssues = computed(() => surveyTextIssues(props.model));
const titleCount = computed(() => codePointLength(props.model.title.trim()));
const descriptionCount = computed(() => codePointLength(props.model.description ?? ''));
const definitionEditable = computed(() => ['draft', 'paused'].includes(props.survey.status));
const policyEditable = computed(() => props.survey.status === 'draft' && props.survey.firstPublishedAt === null && props.survey.currentPublishedVersion === null);
function localDate(iso?: string | null) { if (!iso) return ''; const d = new Date(iso), pad = (n: number) => String(n).padStart(2, '0'); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`; }
function dateChanged(event: Event) { const value = (event.target as HTMLInputElement).value; props.model.expiresAt = value ? new Date(value).toISOString() : null; }
</script>
<template><form class="panel metadata-form" @submit.prevent="$emit('save')"><h2>基本信息</h2><fieldset class="plain-fieldset" :disabled="busy"><fieldset class="plain-fieldset" :disabled="!definitionEditable"><label for="edit-title">问卷标题</label><input id="edit-title" v-model="model.title" :aria-invalid="!model.title.trim() || titleCount > SURVEY_TEXT_LIMITS.title" aria-describedby="edit-title-count"><small id="edit-title-count">{{ titleCount }} / {{ SURVEY_TEXT_LIMITS.title }} 个字符（不计首尾空格）</small>
  <label for="edit-description">问卷说明</label><textarea id="edit-description" v-model="model.description" rows="4" :aria-invalid="descriptionCount > SURVEY_TEXT_LIMITS.description" aria-describedby="edit-description-count edit-description-error"></textarea><small id="edit-description-count">{{ descriptionCount }} / {{ SURVEY_TEXT_LIMITS.description }} 个字符，空格和换行计入。</small><p v-if="descriptionCount > SURVEY_TEXT_LIMITS.description" id="edit-description-error" class="field-error" role="alert">说明已超出 {{ descriptionCount - SURVEY_TEXT_LIMITS.description }} 个字符，请缩短后再保存。</p>
  <ul v-if="textIssues.some(i => i.field === '/title')" class="field-error"><li v-for="issue in textIssues.filter(i => i.field === '/title')" :key="issue.field">{{ issue.message }}</li></ul></fieldset>
  <fieldset :disabled="!policyEditable"><legend>填写设置</legend><label class="check"><input v-model="model.allowAnonymous" type="checkbox">允许填写者选择匿名</label><label class="check"><input v-model="model.allowRepeat" type="checkbox">允许同一账号重复填写</label></fieldset><small v-if="!policyEditable">首次发布后匿名与重复填写策略保持锁定。</small>
  <label for="edit-expires">收集截止时间（本地时间）</label><input id="edit-expires" type="datetime-local" :value="localDate(model.expiresAt)" @input="dateChanged"><small>清空可取消截止；调整截止时间不会重新开放已关闭问卷。</small></fieldset>
  <div class="form-actions"><span class="muted">{{ dirty ? '有未保存的基本信息' : '基本信息已保存' }}</span><button class="primary" :disabled="busy || blocked || textIssues.length > 0">保存基本信息</button></div></form></template>
