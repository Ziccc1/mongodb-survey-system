<script setup lang="ts">
import { computed } from 'vue';
import type { Question, Condition, JumpRule } from '@survey/shared';
const props = defineProps<{ question: Question; questions: Question[] }>();
const later = computed(() => props.questions.slice(props.questions.findIndex(q => q.id === props.question.id) + 1));
const choices = computed(() => props.question.options ?? []);
function add() {
  let condition: Condition;
  if (props.question.type === 'single') condition = { op: 'eq', optionId: choices.value[0]?.id ?? `pending_${crypto.randomUUID()}` };
  else if (props.question.type === 'multiple') condition = { op: 'containsAny', optionIds: [choices.value[0]?.id ?? `pending_${crypto.randomUUID()}`] };
  else condition = { op: 'eq', number: '0' };
  props.question.jumpRules.push({ id: crypto.randomUUID(), condition, targetQuestionId: later.value[0]?.id ?? `pending_${crypto.randomUUID()}` });
}
function move(index: number, delta: number) { const rules = props.question.jumpRules; const [rule] = rules.splice(index, 1); rules.splice(index + delta, 0, rule); }
function missing(rule: JumpRule) { return rule.condition.optionIds?.filter(id => !choices.value.some(o => o.id === id)) ?? []; }
</script>
<template><fieldset class="rules"><legend>跳转规则</legend><p class="muted">按从上到下的顺序匹配，首条满足时跳转；未命中时进入下一题。</p>
  <div v-for="(rule, n) in question.jumpRules" :key="rule.id" class="rule-card" data-testid="rule" :data-rule-id="rule.id">
    <div class="question-heading"><strong>规则 {{ n + 1 }}</strong><div class="editor-actions"><button type="button" class="quiet" :aria-label="`规则${n + 1}上移`" :disabled="n === 0" @click="move(n, -1)">上移</button><button type="button" class="quiet" :aria-label="`规则${n + 1}下移`" :disabled="n === question.jumpRules.length - 1" @click="move(n, 1)">下移</button><button type="button" class="quiet danger" @click="question.jumpRules.splice(n, 1)">删除规则</button></div></div>
    <template v-if="question.type === 'single'"><label :for="`condition-${rule.id}`">答案等于</label><select :id="`condition-${rule.id}`" v-model="rule.condition.optionId"><option v-if="!choices.some(o => o.id === rule.condition.optionId)" :value="rule.condition.optionId">已失效的条件选项（请重新选择）</option><option v-for="item in choices" :key="item.id" :value="item.id">{{ item.label }}</option></select></template>
    <template v-else-if="question.type === 'multiple'"><label :for="`condition-${rule.id}`">条件</label><select :id="`condition-${rule.id}`" v-model="rule.condition.op"><option value="containsAny">包含以下任意选项</option><option value="containsAll">包含以下全部选项</option></select>
      <fieldset><legend>条件选项（至少一个）</legend><label v-for="item in choices" :key="item.id" class="check"><input v-model="rule.condition.optionIds" type="checkbox" :value="item.id">{{ item.label }}</label></fieldset>
      <p v-if="missing(rule).length" class="field-error">条件中有已删除的选项，可保存草稿。<button type="button" class="quiet" @click="rule.condition.optionIds = rule.condition.optionIds?.filter(id => choices.some(o => o.id === id))">移除失效选项</button></p>
    </template>
    <template v-else><div class="editor-grid"><div><label :for="`condition-${rule.id}`">比较条件</label><select :id="`condition-${rule.id}`" v-model="rule.condition.op"><option value="eq">等于</option><option value="lt">小于</option><option value="lte">小于等于</option><option value="gt">大于</option><option value="gte">大于等于</option></select></div><div><label :for="`number-${rule.id}`">比较值</label><input :id="`number-${rule.id}`" v-model="rule.condition.number" type="text" inputmode="decimal"></div></div></template>
    <label :for="`target-${rule.id}`">跳转到</label><select :id="`target-${rule.id}`" v-model="rule.targetQuestionId"><option v-if="!later.some(q => q.id === rule.targetQuestionId)" :value="rule.targetQuestionId">尚未选择或目标不再有效（可保存草稿）</option><option v-for="item in later" :key="item.id" :value="item.id">第 {{ questions.findIndex(q => q.id === item.id) + 1 }} 题：{{ item.title }}</option></select>
  </div>
  <button type="button" class="secondary" :disabled="question.jumpRules.length >= 100" @click="add">添加跳转规则</button><small v-if="!later.length">当前没有后续题目；可先保存规则草稿，添加后续题目后再选择目标。</small>
</fieldset></template>
