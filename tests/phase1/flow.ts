import assert from 'node:assert/strict';
import {evaluateAnswers,cleanBranchAnswers,answerIssues,validateQuestions} from '@survey/shared';
import type {Question,Answer} from '@survey/shared';
const questions:Question[]=[
  {id:'multi',type:'multiple',title:'同时命中',required:true,options:[{id:'a',label:'A'},{id:'b',label:'B'}],validation:{minChoices:1,maxChoices:2},jumpRules:[{id:'any',condition:{op:'containsAny',optionIds:['b']},targetQuestionId:'phone'},{id:'all',condition:{op:'containsAll',optionIds:['a','b']},targetQuestionId:'text'}]},
  {id:'required',type:'text',title:'可能跳过的必答',required:true,validation:{minLength:2,maxLength:3},jumpRules:[]},
  {id:'phone',type:'number',title:'手机号',required:true,validation:{integerOnly:true},jumpRules:[{id:'zero',condition:{op:'eq',number:'0'},targetQuestionId:'text'}]},
  {id:'text',type:'text',title:'建议',required:false,validation:{maxLength:3},jumpRules:[]},
];
assert.deepEqual(validateQuestions(questions).errors,[]);
let input:Answer[]=[{questionId:'multi',type:'multiple',optionIds:['b','a']},{questionId:'phone',type:'number',number:'13800138000'}];
let result=evaluateAnswers(questions,input);assert.deepEqual(result.path.map(q=>q.id),['multi','phone','text']);assert.deepEqual(result.errors,[]);assert.deepEqual(result.answers[0],{questionId:'multi',type:'multiple',optionIds:['a','b']});console.log('PASS both multiple rules match: first rule wins and skipped mandatory is not checked');
const reversed=structuredClone(questions);reversed[0].jumpRules.reverse();assert.deepEqual(evaluateAnswers(reversed,input).path.map(q=>q.id),['multi','text']);console.log('PASS changing priority changes the path deterministically');
input=[{questionId:'multi',type:'multiple',optionIds:['a']},{questionId:'required',type:'text',text:'旧答'},{questionId:'phone',type:'number',number:'0'}];input[0]={questionId:'multi',type:'multiple',optionIds:['b']};input=cleanBranchAnswers(questions,input);assert.ok(!input.some(a=>a.questionId==='required'));input[0]={questionId:'multi',type:'multiple',optionIds:['a']};assert.ok(evaluateAnswers(questions,input).errors.some(e=>e.questionId==='required'&&e.reason==='REQUIRED'));console.log('PASS returning to change answers deletes invalid branch values and rechecks newly reachable required questions');
for(const [number,valid] of [['13800138000',true],['13800138000.5',false],['abc',false],['0',true]] as const){const issues=answerIssues(questions[2],{questionId:'phone',type:'number',number});assert.equal(issues.length===0,valid);}
assert.equal(answerIssues(questions[2],undefined)[0].reason,'REQUIRED');const optional={...questions[2],required:false};assert.deepEqual(answerIssues(optional,undefined),[]);const decimal={...optional,validation:{integerOnly:false,min:'0',max:'2'}};assert.deepEqual(answerIssues(decimal,{questionId:'phone',type:'number',number:'1.25'}),[]);console.log('PASS phone 13800138000 exact integer, fractional/letters rejected, required/optional empty and ordinary decimal allowed');
assert.deepEqual(answerIssues(questions[1],{questionId:'required',type:'text',text:'😀汉'}),[]);assert.equal(answerIssues(questions[1],{questionId:'required',type:'text',text:'1234'})[0].reason,'TEXT_LENGTH');assert.equal(answerIssues(questions[0],{questionId:'multi',type:'multiple',optionIds:[]})[0].reason,'REQUIRED');
const single:Question={id:'single',type:'single',title:'单选',required:true,options:[{id:'yes',label:'是'},{id:'no',label:'否'}],jumpRules:[{id:'s1',condition:{op:'eq',optionId:'yes'},targetQuestionId:'text'}]};assert.deepEqual(evaluateAnswers([single,...questions.slice(1)],[{questionId:'single',type:'single',optionId:'yes'}]).path.map(q=>q.id),['single','text']);
assert.ok(evaluateAnswers([single,...questions.slice(1)],[{questionId:'single',type:'single',optionId:'bad'}]).errors.some(e=>e.reason==='INVALID_OPTION'));console.log('PASS text Unicode limits, choice boundaries, single jumps and illegal options');
console.log('FILL/PATH MODULE PASSED');
