<script setup lang="ts">
import {ref} from 'vue';
import type {Editor,PublishCommand,PublishReceipt} from '@survey/shared';
import {api,RequestError} from '../api';
const props=defineProps<{survey:Editor;dirty:boolean}>();
const emit=defineEmits<{changed:[];locked:[value:boolean]}>();
const origin=window.location.origin;
const busy=ref(false),error=ref(''),pending=ref<{key:string;body:PublishCommand}|null>(null);
async function publish(){
  if(busy.value||props.dirty)return;busy.value=true;error.value='';emit('locked',true);
  pending.value??={key:crypto.randomUUID(),body:{expectedRevision:props.survey.revision,expectedDraftDefinitionVersion:props.survey.draftDefinitionRevision}};
  try{await api<PublishReceipt>(`/surveys/${props.survey.id}/publish`,'POST',pending.value.body,{'Publication-Key':pending.value.key});pending.value=null;emit('changed');}
  catch(e){error.value=(e as Error).message;if(e instanceof RequestError&&e.status<500)pending.value=null;}
  finally{busy.value=false;emit('locked',!!pending.value);}
}
async function state(action:'pause'|'close'){
  if(props.dirty||busy.value||pending.value)return;
  if(action==='close'&&!window.confirm('关闭后不能重新开放。确定关闭问卷？'))return;
  busy.value=true;error.value='';emit('locked',true);
  try{await api(`/surveys/${props.survey.id}/${action}`,'POST',{expectedRevision:props.survey.revision});emit('changed');}
  catch(e){error.value=`${(e as Error).message}。请先刷新核对状态，不要重复操作。`;}
  finally{busy.value=false;emit('locked',false);}
}
</script>
<template><section class="panel publication-panel"><h2>发布与收集</h2><p v-if="dirty" class="muted">请先保存基本信息和题目，再预览或管理发布。</p><p v-if="error" role="alert" class="error">{{error}}</p><p v-if="pending&&!busy" role="status">发布结果尚未确认。请重试同一次发布，不会重复生成版本。</p>
<div class="editor-actions"><button v-if="pending||['draft','paused'].includes(survey.status)" class="primary" :disabled="busy||dirty" @click="publish">{{pending?'重试原发布':survey.currentPublishedVersion===null?'发布问卷':'重新发布新版本'}}</button><button v-if="survey.status==='published'" class="secondary" :disabled="busy||dirty||!!pending" @click="state('pause')">暂停收集</button><button v-if="['published','paused'].includes(survey.status)" class="quiet danger" :disabled="busy||dirty||!!pending" @click="state('close')">关闭问卷</button><RouterLink v-if="!dirty&&!pending" class="button secondary" :to="`/surveys/${survey.id}/preview`">预览问卷</RouterLink></div>
<template v-if="survey.currentPublishedVersion!==null"><p class="muted">当前发布 v{{survey.currentPublishedVersion}} · 累计 {{survey.cumulativeResponseCount}} 份 · 当前版本 {{survey.currentVersionResponseCount}} 份</p><label :for="`share-${survey.id}`">分享链接</label><input :id="`share-${survey.id}`" readonly :value="`${origin}/survey/${survey.publicId}`"><div class="editor-actions"><RouterLink :to="`/survey/${survey.publicId}`">打开填写页</RouterLink><RouterLink :to="`/surveys/${survey.id}/versions`">历史版本</RouterLink><RouterLink :to="`/surveys/${survey.id}/statistics`">查看统计</RouterLink><RouterLink :to="`/surveys/${survey.id}/responses`">历史答卷</RouterLink></div></template></section></template>
