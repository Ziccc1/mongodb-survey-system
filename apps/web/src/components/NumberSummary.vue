<script setup lang="ts">
import { ref } from 'vue';
import { decimalValue } from '@survey/shared';
import { defaultShowAverage } from '../statistics-display';
const props = defineProps<{ title: string; average: string | null | undefined }>();
const showAverage = ref(defaultShowAverage(props.title));
function formatAverage(value: string) { return decimalValue(value)?.toDecimalPlaces(2).toString() ?? value; }
</script>

<template>
  <label class="check numeric-stat-toggle"><input v-model="showAverage" type="checkbox">显示平均值</label>
  <p v-if="showAverage" class="average">平均值：<strong :title="average ?? undefined">{{ average == null ? '暂无有效数字答案' : formatAverage(average) }}</strong></p>
  <p v-else class="muted numeric-stat-note">仅查看填写内容，不展示平均值。</p>
  <p class="muted numeric-stat-note">手机号、电话类题目默认隐藏均值；开关仅影响本次查看。均值最多显示两位小数，原始回答保持不变。</p>
</template>
