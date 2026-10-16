<script setup lang="ts">
import { computed, nextTick, onMounted, onBeforeUnmount, ref } from 'vue';
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router';
import { canonical, newQuestion, normalizeQuestions, validateQuestions, surveyTextIssues } from '@survey/shared';
import type { Editor, CreateSurvey, Question, QuestionType, SaveResult } from '@survey/shared';
import { api, RequestError } from '../api';
import MetadataEditor from '../components/MetadataEditor.vue';
import QuestionCard from '../components/QuestionCard.vue';
const route = useRoute(), router = useRouter(), survey = ref<Editor | null>(null), metadata = ref<CreateSurvey>({ title: '' }), questions = ref<Question[]>([]);
const loading = ref(true), busy = ref(false), error = ref(''), notice = ref(''), blocked = ref(false), remote = ref<Editor | null>(null);
const baselineMetadata = ref(''), baselineQuestions = ref('');
const metadataKey = (input: CreateSurvey) => canonical({ ...input, title: input.title.trim() });
const questionKey = (input: Question[]) => { try { return canonical(normalizeQuestions(input)); } catch { return canonical(input); } };
const metadataDirty = computed(() => metadataKey(metadata.value) !== baselineMetadata.value);
const questionsDirty = computed(() => questionKey(questions.value) !== baselineQuestions.value);
const dirty = computed(() => !!survey.value && (metadataDirty.value || questionsDirty.value));
const checks = computed(() => validateQuestions(questions.value));
const issues = computed(() => questionsDirty.value ? checks.value.validationIssues : survey.value?.validationIssues ?? []);
const editable = computed(() => !!survey.value && ['draft', 'paused'].includes(survey.value.status));
const url = computed(() => `/surveys/${route.params.surveyId}`);
const metaFrom = (data: Editor): CreateSurvey => ({ title: data.draftDefinition.title, description: data.draftDefinition.description, ...data.settings });
function adopt(data: Editor) {
  survey.value = data; metadata.value = structuredClone(metaFrom(data)); questions.value = JSON.parse(JSON.stringify(data.draftDefinition.questions));
  baselineMetadata.value = metadataKey(metadata.value); baselineQuestions.value = questionKey(questions.value); blocked.value = false; remote.value = null;
}
async function load() {
  loading.value = true; error.value = '';
  try { adopt(await api<Editor>(url.value)); }
  catch (e) { if (e instanceof RequestError && e.status === 401) await router.push('/login'); else error.value = (e as Error).message; }
  finally { loading.value = false; }
}
async function inspectRemote() {
  try { remote.value = await api<Editor>(url.value); } catch (e) { error.value = `本地编辑已保留，读取服务器版本失败：${(e as Error).message}`; }
}
async function save(section: 'metadata' | 'questions') {
  if (!survey.value || busy.value || blocked.value) return;
  if (section === 'questions' && checks.value.errors.length) return;
  if (section === 'metadata' && surveyTextIssues(metadata.value).length) return;
  busy.value = true; error.value = ''; notice.value = '';
  try {
    const patch: Record<string, unknown> = { expectedRevision: survey.value.revision };
    const original = metaFrom(survey.value);
    for (const key of ['title', 'description', 'allowAnonymous', 'allowRepeat', 'expiresAt'] as const) {
      const value = key === 'title' ? metadata.value.title.trim() : metadata.value[key];
      if (canonical(value) !== canonical(original[key])) patch[key] = value;
    }
    if (Object.keys(patch).length === 1) patch.expiresAt = metadata.value.expiresAt ?? null;
    const data = await api<SaveResult>(section === 'metadata' ? url.value : `${url.value}/questions`, section === 'metadata' ? 'PATCH' : 'PUT', section === 'metadata' ? patch : { questions: questions.value, expectedRevision: survey.value.revision });
    Object.assign(survey.value, data);
    if (section === 'metadata') { survey.value.draftDefinition.title = metadata.value.title.trim(); survey.value.draftDefinition.description = metadata.value.description ?? ''; survey.value.settings = { allowAnonymous: metadata.value.allowAnonymous ?? false, allowRepeat: metadata.value.allowRepeat ?? false, expiresAt: metadata.value.expiresAt ?? null }; baselineMetadata.value = metadataKey(metadata.value); }
    else { survey.value.draftDefinition.questions = structuredClone(questions.value.map(q => JSON.parse(JSON.stringify(q)))); baselineQuestions.value = questionKey(questions.value); }
    notice.value = section === 'metadata' ? '基本信息已保存。' : '题目已保存，刷新后可以恢复。';
  } catch (e) {
    error.value = (e as Error).message;
    if (e instanceof RequestError && e.status === 401) { /* Keep local content visible instead of navigating away. */ error.value = '登录已失效，本地编辑仍保留。请在另一个标签页重新登录后再保存。'; }
    else if (e instanceof RequestError && ['EDIT_CONFLICT', 'SURVEY_STATE_CONFLICT', 'POLICY_LOCKED'].includes(e.code)) { blocked.value = true; await inspectRemote(); }
    else if (!(e instanceof RequestError) || e.status >= 500) { blocked.value = true; error.value = '保存结果尚未确认，本地编辑已保留。请先核对服务器版本。'; await inspectRemote(); }
  } finally { busy.value = false; }
}
function keepLocal() {
  if (!remote.value) return;
  const data = remote.value;
  survey.value = data; baselineMetadata.value = metadataKey(metaFrom(data)); baselineQuestions.value = questionKey(data.draftDefinition.questions);
  remote.value = null; blocked.value = false; error.value = ''; notice.value = '本地编辑已保留，并采用服务器最新修订号。请确认差异后分别保存，保存题目会整体替换服务器题目。';
}
function useRemote() { if (remote.value && window.confirm('放弃本地未保存的编辑，采用服务器版本？')) { adopt(remote.value); error.value = ''; notice.value = '已采用服务器版本。'; } }
async function add(type: QuestionType) {
  if (questions.value.length >= 100) return;
  const question = newQuestion(type); questions.value.push(question);
  await nextTick(); document.getElementById(`heading-${question.id}`)?.focus();
}
function move(index: number, delta: number) { const [question] = questions.value.splice(index, 1); questions.value.splice(index + delta, 0, question); }
function beforeUnload(event: BeforeUnloadEvent) { if (dirty.value) { event.preventDefault(); event.returnValue = ''; } }
onBeforeRouteLeave(() => !dirty.value || window.confirm('有未保存的编辑，确定离开？'));
onMounted(() => { window.addEventListener('beforeunload', beforeUnload); load(); });
onBeforeUnmount(() => window.removeEventListener('beforeunload', beforeUnload));
</script>
<template><section class="editor-page"><RouterLink class="back" to="/surveys">← 返回我的问卷</RouterLink><p v-if="loading" class="panel" role="status" aria-busy="true">正在读取问卷…</p>
  <p v-if="error" class="error" role="alert">{{ error }} <button v-if="!survey" class="quiet" @click="load">重新加载</button></p>
  <template v-if="survey && !loading"><div class="page-heading"><div><p class="eyebrow">问卷编辑</p><h1 tabindex="-1">{{ survey.draftDefinition.title }}</h1><p class="muted">基本信息和题目分别保存，不会自动保存。</p></div><span class="badge">{{ survey.status === 'draft' ? '未发布草稿' : survey.status === 'paused' ? '已暂停' : survey.status === 'published' ? '收集中' : '已关闭' }}</span></div>
  <p v-if="notice" class="saved" role="status">{{ notice }}</p>
  <section v-if="blocked" class="conflict panel" aria-labelledby="conflict-heading"><h2 id="conflict-heading">先比较服务器版本，本地编辑已保留</h2><p>不会自动覆盖或重试保存。请比较后选择如何继续。</p><template v-if="remote"><p>服务器修订 {{ remote.revision }}；{{ remote.draftDefinition.title }}，共 {{ remote.draftDefinition.questions.length }} 题。</p><details><summary>查看服务器内容</summary><pre>{{ JSON.stringify({ metadata: metaFrom(remote), questions: remote.draftDefinition.questions }, null, 2) }}</pre></details><div class="editor-actions"><button type="button" class="secondary" @click="keepLocal">已比较，保留本地并采用最新修订号</button><button type="button" class="quiet" @click="useRemote">放弃本地并采用服务器版本</button></div></template><button v-else class="secondary" @click="inspectRemote">重新读取服务器版本</button></section>
  <MetadataEditor :model="metadata" :survey="survey" :busy="busy" :blocked="blocked" :dirty="metadataDirty" @save="save('metadata')" />
  <section class="question-section"><h2>题目 <span class="muted">{{ questions.length }} / 100</span></h2><p v-if="!editable" class="muted">当前状态不能编辑题目；暂停后才可修改。本轮未开放暂停操作。</p>
    <div v-if="checks.errors.length" class="error" role="alert"><strong>请先修复配置再保存题目</strong><ul><li v-for="item in checks.errors" :key="`${item.field}-${item.code}`">{{ item.message }}</li></ul></div>
    <div v-if="issues.length" class="definition-issues" aria-live="polite"><h3>草稿待完善</h3><p>以下问题允许保留在草稿中，发布前需要完善。</p><ul><li v-for="item in issues" :key="`${item.field}-${item.code}`">{{ item.message }}</li></ul></div>
    <fieldset class="plain-fieldset" :disabled="busy || !editable"><div class="editor-actions add-questions"><button v-for="item in (['single', 'multiple', 'text', 'number'] as const)" :key="item" type="button" class="secondary" :disabled="questions.length >= 100" @click="add(item)">添加{{ { single: '单选题', multiple: '多选题', text: '文本题', number: '数字题' }[item] }}</button></div>
      <QuestionCard v-for="(question, index) in questions" :key="question.id" :question="question" :index="index" :questions="questions" @move="move(index, $event)" @remove="questions.splice(index, 1)" />
    </fieldset>
    <div class="editor-save-bar"><span class="muted">{{ questionsDirty ? '有未保存的题目修改' : '题目已保存' }} · 修订 {{ survey.revision }}</span><button class="primary" :disabled="busy || blocked || !editable || checks.errors.length > 0" @click="save('questions')">{{ busy ? '保存中…' : '保存题目' }}</button></div>
  </section></template>
</section></template>
