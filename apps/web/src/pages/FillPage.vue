<script setup lang="ts">
import {computed,nextTick,onMounted,onBeforeUnmount,ref} from 'vue';
import {useRoute,onBeforeRouteLeave} from 'vue-router';
import {evaluateAnswers,cleanBranchAnswers,validateQuestions} from '@survey/shared';
import type {Definition,FillDefinition,Editor,Answer,SubmitCommand,SubmitReceipt} from '@survey/shared';
import {api,RequestError} from '../api';
import QuestionInput from '../components/QuestionInput.vue';
import DefinitionView from '../components/DefinitionView.vue';
const route=useRoute(),preview=computed(()=>!!route.meta.preview),definition=ref<Definition|null>(null),published=ref<FillDefinition|null>(null),answers=ref<Answer[]>([]),anonymous=ref(false),loading=ref(true),busy=ref(false),error=ref(''),index=ref(0),review=ref(false),done=ref(false),receipt=ref<SubmitReceipt|null>(null),touched=ref(new Set<string>()),reloadRequired=ref(false);
const pending=ref<{key:string;body:SubmitCommand}|null>(null);
const evaluation=computed(()=>evaluateAnswers(definition.value?.questions??[],answers.value));
const question=computed(()=>evaluation.value.path[Math.min(index.value,Math.max(evaluation.value.path.length-1,0))]);
const currentErrors=computed(()=>question.value&&touched.value.has(question.value.id)?evaluation.value.errors.filter(e=>e.questionId===question.value.id):[]);
const previewIssues=computed(()=>preview.value&&definition.value?[...validateQuestions(definition.value.questions).errors,...validateQuestions(definition.value.questions).validationIssues]:[]);
const unavailableMessages:Record<string,string>={SURVEY_CLOSED:'问卷已关闭',SURVEY_PAUSED:'问卷已暂停收集',SURVEY_EXPIRED:'已到收集截止时间',ALREADY_SUBMITTED:'当前账号已提交过这份问卷'};
const unavailableMessage=computed(()=>unavailableMessages[published.value?.unavailableReason??'']??'当前不能提交');
async function load(){loading.value=true;error.value='';try{if(preview.value){const s=await api<Editor>(`/surveys/${route.params.surveyId}`);definition.value=s.draftDefinition;}else{const p=await api<FillDefinition>(`/public/surveys/${route.params.publicId}`);published.value=p;definition.value={title:p.title,description:p.description,questions:p.questions};anonymous.value=p.allowAnonymous;}answers.value=[];touched.value=new Set();review.value=false;done.value=false;receipt.value=null;pending.value=null;index.value=0;reloadRequired.value=false;}catch(e){error.value=(e as Error).message;}finally{loading.value=false;}}
function change(answer:Answer|undefined){if(!question.value)return;const id=question.value.id;const values=answers.value.filter(a=>a.questionId!==id);if(answer)values.push(answer);answers.value=cleanBranchAnswers(definition.value!.questions,values);touched.value=new Set([...touched.value,id]);}
async function focus(){await nextTick();document.getElementById('fill-step')?.focus();}
function next(){if(!question.value)return;touched.value=new Set([...touched.value,question.value.id]);if(evaluation.value.errors.some(e=>e.questionId===question.value.id))return;if(index.value>=evaluation.value.path.length-1)review.value=true;else index.value++;focus();}
function previous(){if(review.value){review.value=false;index.value=Math.max(evaluation.value.path.length-1,0);}else index.value=Math.max(index.value-1,0);focus();}
async function submit(){
  if(busy.value)return;
  if(!pending.value&&evaluation.value.errors.length){const first=evaluation.value.errors[0];touched.value=new Set(evaluation.value.path.map(q=>q.id));index.value=Math.max(evaluation.value.path.findIndex(q=>q.id===first.questionId),0);review.value=false;return;}
  if(preview.value){done.value=true;return;}
  if(!published.value)return;
  pending.value??={key:crypto.randomUUID(),body:JSON.parse(JSON.stringify({publishedVersion:published.value.publishedVersion,anonymous:anonymous.value,answers:evaluation.value.answers}))};
  busy.value=true;error.value='';
  try{receipt.value=await api<SubmitReceipt>(`/public/surveys/${route.params.publicId}/responses`,'POST',pending.value.body,{'Idempotency-Key':pending.value.key});pending.value=null;done.value=true;}
  catch(e){error.value=(e as Error).message;if(e instanceof RequestError&&e.status<500){pending.value=null;if(e.code==='SURVEY_VERSION_CHANGED')reloadRequired.value=true;}else error.value='提交结果尚未确认。请使用下方按钮重试原提交，不要重新填写或另开一次提交。';}
  finally{busy.value=false;}
}
function leaving(){return !done.value&&(!!pending.value||answers.value.length>0);}
function beforeUnload(event:BeforeUnloadEvent){if(leaving()){event.preventDefault();event.returnValue='';}}
onBeforeRouteLeave(()=>!leaving()||window.confirm(pending.value?'提交结果尚未确认，离开会丢失原请求的重试信息。确定离开？':'答卷尚未提交，离开会丢失本次填写。确定离开？'));
onMounted(()=>{window.addEventListener('beforeunload',beforeUnload);load();});
onBeforeUnmount(()=>window.removeEventListener('beforeunload',beforeUnload));
</script>
<template><section class="narrow fill-page"><RouterLink v-if="preview" class="back" :to="`/surveys/${route.params.surveyId}`">← 返回编辑</RouterLink><p v-if="loading" class="panel" role="status">正在加载问卷…</p><p v-if="error" class="error" role="alert">{{error}} <button v-if="!definition" class="quiet" @click="load">重试加载</button></p>
<template v-if="definition&&!loading"><p class="eyebrow">{{preview?'创建者预览 · 不保存答卷':`发布版本 v${published?.publishedVersion}`}}</p><h1 tabindex="-1">{{definition.title}}</h1><p class="description">{{definition.description}}</p>
<div v-if="done" class="panel submission-result" role="status"><h2>{{preview?'预览完成':'提交成功'}}</h2><p v-if="preview">本次预览没有保存正式答卷，也没有计入统计。</p><template v-else-if="receipt"><p>你的答卷已保存。版本 v{{receipt.publishedVersion}}</p><p>回执：<span class="receipt-id">{{receipt.receiptId}}</span></p><p>{{new Date(receipt.submittedAt).toLocaleString('zh-CN')}}</p></template><button v-if="preview||published?.allowRepeat" class="secondary" @click="load">{{preview?'重新预览':'再次填写'}}</button><RouterLink class="button quiet" to="/surveys">返回我的问卷</RouterLink></div>
<template v-else><p v-if="previewIssues.length" class="definition-issues">草稿有 {{previewIssues.length}} 项待完善配置，预览采用当前可用的顺序。</p><div v-if="!preview&&!published?.canSubmit&&!pending" class="panel" role="status"><h2>{{unavailableMessage}}</h2><p>当前问卷暂不能接收新的答卷。</p><button class="secondary" @click="load">重新检查状态</button></div>
<template v-else><div v-if="!definition.questions.length" class="panel">草稿尚无题目，请返回编辑。</div><template v-else-if="!review&&question"><div class="panel"><h2 id="fill-step" tabindex="-1">第 {{index+1}} / {{evaluation.path.length}} 步</h2><QuestionInput :question="question" :answer="answers.find(a=>a.questionId===question.id)" :errors="currentErrors" :disabled="busy||!!pending" @change="change" /><div class="form-actions"><button class="secondary" :disabled="index===0||busy||!!pending" @click="previous">上一题</button><button class="primary" :disabled="busy||!!pending" @click="next">{{index===evaluation.path.length-1?'检查答案':'下一题'}}</button></div></div></template>
<div v-else-if="review" class="review"><h2 id="fill-step" tabindex="-1">确认最终答案</h2><DefinitionView :definition="{...definition,questions:evaluation.path}" :answers="evaluation.answers" /><label v-if="!preview&&published?.allowAnonymous" class="check"><input v-model="anonymous" type="checkbox" :disabled="busy||!!pending">匿名提交</label><p v-if="!preview&&published?.allowAnonymous" class="muted">匿名仅隐藏账号关联；请勿在答案中填写不希望展示的姓名等信息。</p><div class="form-actions"><button class="secondary" :disabled="busy||!!pending" @click="previous">返回改答</button><button class="primary" :disabled="busy||reloadRequired" @click="submit">{{busy?'正在提交…':pending?'重试原提交':preview?'完成预览':'确认提交'}}</button></div></div>
<button v-if="reloadRequired" class="secondary" @click="load">重新加载当前版本</button></template></template></template></section></template>
