<script setup lang="ts">
import { codePointLength, QUESTION_LABELS } from '@survey/shared';
import type { Question, Validation } from '@survey/shared';
import RuleEditor from './RuleEditor.vue';
const props = defineProps<{ question: Question; index: number; questions: Question[] }>();
defineEmits<{ move: [delta: number]; remove: [] }>();
function limit(key: keyof Validation, event: Event, decimal = false) {
  const value = (event.target as HTMLInputElement).value;
  const validation = props.question.validation ??= {};
  if (value === '') delete validation[key];
  else (validation as Record<string, unknown>)[key] = decimal ? value : Number(value);
}
function option() { props.question.options!.push({ id: crypto.randomUUID(), label: `选项${props.question.options!.length + 1}` }); }
</script>
<template><article class="question-card panel" data-testid="question" :data-question-id="question.id">
  <div class="question-heading"><h3 :id="`heading-${question.id}`" tabindex="-1">{{ index + 1 }}. {{ QUESTION_LABELS[question.type] }}</h3><div class="editor-actions">
    <button type="button" class="quiet" :aria-label="`第${index + 1}题上移`" :disabled="index === 0" @click="$emit('move', -1)">上移</button>
    <button type="button" class="quiet" :aria-label="`第${index + 1}题下移`" :disabled="index === questions.length - 1" @click="$emit('move', 1)">下移</button>
    <button type="button" class="quiet danger" :aria-label="`删除第${index + 1}题`" @click="$emit('remove')">删除题目</button>
  </div></div>
  <label :for="`title-${question.id}`">题干</label><textarea :id="`title-${question.id}`" v-model="question.title" rows="2" :aria-describedby="`title-count-${question.id}`" :aria-invalid="!question.title.trim() || codePointLength(question.title) > 500"></textarea>
  <small :id="`title-count-${question.id}`">{{ codePointLength(question.title) }} / 500 个字符</small>
  <label class="check"><input v-model="question.required" type="checkbox">必答</label>
  <fieldset v-if="question.options"><legend>选项</legend><div v-for="(item, n) in question.options" :key="item.id" class="option-row" :data-option-id="item.id">
    <div><label :for="`option-${item.id}`">选项 {{ n + 1 }}</label><input :id="`option-${item.id}`" v-model="item.label" :aria-invalid="!item.label.trim() || codePointLength(item.label) > 200"><small>{{ codePointLength(item.label) }} / 200 个字符</small></div>
    <button type="button" class="quiet danger" :aria-label="`删除选项${n + 1}`" :disabled="question.options.length <= 2" @click="question.options.splice(n, 1)">删除</button>
  </div><button type="button" class="secondary" :disabled="question.options.length >= 100" @click="option">添加选项</button><small>需要2—100个选项；删除选项后，相关跳转条件会提示待完善。</small></fieldset>
  <fieldset v-if="question.type === 'multiple'"><legend>选择数量</legend><div class="editor-grid"><div><label :for="`minChoices-${question.id}`">最少选择</label><input :id="`minChoices-${question.id}`" type="number" min="0" max="100" step="1" :value="question.validation?.minChoices ?? ''" @input="limit('minChoices', $event)"></div><div><label :for="`maxChoices-${question.id}`">最多选择</label><input :id="`maxChoices-${question.id}`" type="number" min="0" max="100" step="1" :value="question.validation?.maxChoices ?? ''" @input="limit('maxChoices', $event)"></div></div><small>留空使用默认限制；两项填相同值表示恰好选择该数量。</small></fieldset>
  <fieldset v-if="question.type === 'text'"><legend>文本长度</legend><div class="editor-grid"><div><label :for="`minLength-${question.id}`">最少字符</label><input :id="`minLength-${question.id}`" type="number" min="0" max="10000" step="1" :value="question.validation?.minLength ?? ''" @input="limit('minLength', $event)"></div><div><label :for="`maxLength-${question.id}`">最多字符</label><input :id="`maxLength-${question.id}`" type="number" min="0" max="10000" step="1" :value="question.validation?.maxLength ?? ''" @input="limit('maxLength', $event)"></div></div><small>按Unicode码点计数；留空分别使用0和10000。</small></fieldset>
  <fieldset v-if="question.type === 'number'"><legend>数字范围</legend><div class="editor-grid"><div><label :for="`min-${question.id}`">数字下限</label><input :id="`min-${question.id}`" type="text" inputmode="decimal" :value="question.validation?.min ?? ''" @input="limit('min', $event, true)"></div><div><label :for="`max-${question.id}`">数字上限</label><input :id="`max-${question.id}`" type="text" inputmode="decimal" :value="question.validation?.max ?? ''" @input="limit('max', $event, true)"></div></div><label v-if="question.validation" class="check"><input v-model="question.validation.integerOnly" type="checkbox">只允许整数</label><small>留空表示不限制该边界；支持小数和科学计数法，保留十进制精度。</small></fieldset>
  <RuleEditor v-if="question.type !== 'text'" :question="question" :questions="questions" />
</article></template>
