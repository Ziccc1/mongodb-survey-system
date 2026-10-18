<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import * as echarts from 'echarts/core';
import { BarChart, PieChart } from 'echarts/charts';
import { GridComponent, TooltipComponent } from 'echarts/components';
import { SVGRenderer } from 'echarts/renderers';
import type { QuestionSummary } from '@survey/shared';
import { optionPercentage } from '../statistics-display';

echarts.use([BarChart, PieChart, GridComponent, TooltipComponent, SVGRenderer]);
const props = defineProps<{ row: QuestionSummary }>();
const host = ref<HTMLDivElement>();
const mode = ref<'pie' | 'bar'>(props.row.type === 'single' && (props.row.optionCounts?.length ?? 0) <= 6 ? 'pie' : 'bar');
const height = computed(() => mode.value === 'pie' ? 280 : Math.max(260, (props.row.optionCounts?.length ?? 0) * 38 + 60));
let chart: echarts.ECharts | undefined;
let observer: ResizeObserver | undefined;
function render() {
  if (!host.value) return;
  chart ??= echarts.init(host.value, undefined, { renderer: 'svg' });
  const compact = host.value.clientWidth < 420;
  const options = props.row.optionCounts ?? [];
  const data = options.map(option => ({
    // Internal IDs keep equally labelled options distinct in ECharts.
    name: option.optionId, value: option.count, labelText: option.label,
    percentage: optionPercentage(option.count, props.row.answeredCount),
  }));
  const labels = new Map(options.map(option => [option.optionId, option.label]));
  chart.setOption({
    animation: false,
    textStyle: { fontFamily: 'Microsoft YaHei, system-ui, sans-serif', color: '#263348' },
    tooltip: { trigger: 'item', renderMode: 'richText', confine: true,
      formatter: (params: unknown) => { const d = (params as { data: typeof data[number] }).data; return `${d.labelText}\n${d.value} 次 · ${d.percentage}%`; } },
    ...(mode.value === 'pie' ? {
      series: [{ type: 'pie', radius: ['0%', compact ? '52%' : '64%'], center: ['50%', '50%'], stillShowZeroSum: false,
        label: { position: 'outside', color: '#263348', formatter: (params: { name: string; data: { percentage: number } }) => `${labels.get(params.name)}\n${params.data.percentage}%`, width: compact ? 64 : 100, overflow: 'truncate' },
        data: data.map(d => ({ ...d, ...(compact && d.value === 0 ? { label: { show: false } } : {}) })) }],
    } : {
      grid: { left: 8, right: 56, top: 12, bottom: 34, containLabel: true },
      xAxis: { type: 'value', min: 0, max: 100, interval: compact ? 50 : 20, axisLabel: { formatter: '{value}%', hideOverlap: true }, splitLine: { lineStyle: { color: '#e8edf4' } } },
      yAxis: { type: 'category', inverse: true, data: options.map(option => option.label), axisLabel: { width: 100, overflow: 'truncate' }, axisTick: { show: false }, axisLine: { show: false } },
      series: [{ type: 'bar', barMaxWidth: 24, label: { show: true, position: 'right', formatter: '{c}%', color: '#263348' },
        data: data.map(d => ({ ...d, value: d.percentage, count: d.value })),
        tooltip: { formatter: (params: unknown) => { const d = (params as { data: typeof data[number] & { count: number } }).data; return `${d.labelText}\n${d.count} 次 · ${d.percentage}%`; } } }],
    }),
  }, { notMerge: true });
  chart.resize();
}
onMounted(() => { render(); observer = new ResizeObserver(render); if (host.value) observer.observe(host.value); });
watch([() => props.row, mode], render, { flush: 'post' });
onBeforeUnmount(() => { observer?.disconnect(); chart?.dispose(); });
</script>

<template>
  <div class="choice-chart-section">
    <div v-if="row.type === 'single'" class="chart-controls" role="group" :aria-label="`${row.title}图表类型`">
      <button type="button" class="secondary" :aria-pressed="mode === 'pie'" @click="mode = 'pie'">饼图</button>
      <button type="button" class="secondary" :aria-pressed="mode === 'bar'" @click="mode = 'bar'">柱状图</button>
    </div>
    <p v-else class="muted chart-caption">多选题使用柱状图展示各选项回答率，合计可能超过 100%。</p>
    <div ref="host" class="choice-chart" :data-chart-type="mode" :style="{ height: `${height}px` }" aria-hidden="true"></div>
  </div>
</template>
