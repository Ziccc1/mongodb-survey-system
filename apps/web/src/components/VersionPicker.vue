<script setup lang="ts">
import type {VersionSummary} from '@survey/shared';
defineProps<{items:VersionSummary[];selected:number|null;more:boolean;disabled:boolean}>();
defineEmits<{select:[version:number];more:[]}>();
</script>
<template><div class="version-picker"><label for="version-select">发布版本</label><select id="version-select" :value="selected" :disabled="disabled" @change="$emit('select',Number(($event.target as HTMLSelectElement).value))"><option v-if="selected&&!items.some(v=>v.publishedVersion===selected)" :value="selected">v{{selected}}（历史版本）</option><option v-for="v in items" :key="v.publishedVersion" :value="v.publishedVersion">v{{v.publishedVersion}} · {{v.title}}</option></select><button v-if="more" class="quiet" :disabled="disabled" @click="$emit('more')">加载更多版本</button></div></template>
