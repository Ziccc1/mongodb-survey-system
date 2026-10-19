import assert from 'node:assert/strict';
import {existsSync,mkdirSync,writeFileSync} from 'node:fs';
import {chromium,expect} from '@playwright/test';
import type {Question} from '@survey/shared';
import {ObjectId} from 'mongodb';
import {harness} from './harness.js';

const origin='http://127.0.0.1:3115',h=await harness('publicationpage',{},origin);
await h.app.listen({host:'127.0.0.1',port:3115});
const browser=await chromium.launch({headless:true,...(existsSync('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe')?{channel:'msedge'}:{})});
const context=await browser.newContext({viewport:{width:1280,height:800}});
await context.addCookies([{name:'survey_auth',value:h.cookies[0].split('=')[1],url:origin}]);
const page=await context.newPage(),errors:string[]=[],passed:string[]=[];
page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
const directory=`docs/testing/screenshots/publication-page-${Date.now()}`;mkdirSync(directory,{recursive:true});
const pass=(s:string)=>{passed.push(s);console.log(`PASS ${s}`);};
const questions:Question[]=Array.from({length:24},(_,i)=>({id:`q${i+1}`,type:'text',title:`发布流程测试题 ${i+1}`,required:false,validation:{},jumpRules:[]}));
try{
  const survey=await h.draft(questions,{title:'校园学习空间使用调查',allowAnonymous:true,allowRepeat:true});
  const path=`/surveys/${survey.id}`,publication=`${origin}${path}/publication`;
  await page.goto(`${origin}${path}`);
  await expect(page.getByTestId('question')).toHaveCount(24);
  await page.evaluate(()=>window.scrollTo(0,document.body.scrollHeight));
  await page.getByRole('button',{name:'发布问卷',exact:true}).click();
  await page.waitForURL(publication);
  await expect(page.getByRole('heading',{name:'发布成功',exact:true})).toBeVisible();
  const share=page.getByLabel('分享链接',{exact:true});
  await expect(share).toBeInViewport({ratio:1});
  await expect(page.getByRole('button',{name:'复制链接',exact:true})).toBeInViewport({ratio:1});
  assert.equal(await page.evaluate(()=>window.scrollY),0);
  const link=await share.inputValue();assert.equal(link,`${origin}/survey/${survey.publicId}`);
  await page.getByRole('button',{name:'复制链接',exact:true}).click();
  await expect(page.locator('.copy-link + p')).toContainText(/链接已复制|请复制/);
  assert.equal(await h.db.collection('survey_versions').countDocuments({surveyId:new ObjectId(survey.id)}),1);
  await page.screenshot({path:`${directory}/published-1280.png`,fullPage:true});
  pass('long editor publication navigates to success page at scroll top; share input and copy button fit the first 1280x800 viewport');

  await page.reload();
  await expect(page.getByRole('heading',{name:'发布成功',exact:true})).toBeVisible();
  await expect(share).toHaveValue(link);
  assert.equal(await h.db.collection('survey_versions').countDocuments({surveyId:new ObjectId(survey.id)}),1);
  pass('refresh reads actual publication state and preserves link without creating a new version');

  await page.getByRole('button',{name:'暂停收集',exact:true}).click();
  await expect(page.getByRole('heading',{name:'收集已暂停',exact:true})).toBeVisible();
  await page.getByRole('link',{name:'返回编辑页',exact:false}).click();
  await page.waitForURL(`${origin}${path}`);
  await expect(page.getByRole('link',{name:'发布与收集',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'重新发布新版本',exact:true}).click();
  await page.waitForURL(publication);
  await expect(page.getByRole('heading',{name:'发布成功',exact:true})).toBeVisible();
  await expect(share).toHaveValue(link);
  assert.equal(await h.db.collection('survey_versions').countDocuments({surveyId:new ObjectId(survey.id)}),2);
  pass('pause updates actual status; returning to edit and republishing navigates to success with v2 and unchanged share URL');

  await page.getByRole('button',{name:'关闭问卷',exact:true}).click();
  await expect(page.getByRole('heading',{name:'问卷已关闭',exact:true})).toBeVisible();
  await expect(page.getByRole('button',{name:'暂停收集',exact:true})).toHaveCount(0);
  await page.reload();await expect(page.getByRole('heading',{name:'问卷已关闭',exact:true})).toBeVisible();
  pass('closed and refreshed page never shows stale publication success or active collection controls');

  const draft=await h.draft(questions.slice(0,1),{title:'发布重试测试'});
  await page.goto(`${origin}/surveys/${draft.id}`);
  let drop=true;const keys:string[]=[];
  await page.route('**/api/v1/surveys/*/publish',async route=>{
    keys.push(route.request().headers()['publication-key']);const response=await route.fetch();
    if(drop){drop=false;await route.abort('connectionreset');}else await route.fulfill({response});
  });
  await page.getByRole('button',{name:'发布问卷',exact:true}).click();
  await expect(page.getByRole('button',{name:'重试原发布',exact:true})).toBeVisible();
  assert.equal(page.url(),`${origin}/surveys/${draft.id}`);
  await page.getByRole('button',{name:'重试原发布',exact:true}).click();
  await page.waitForURL(`${origin}/surveys/${draft.id}/publication`);
  await expect(page.getByRole('heading',{name:'发布成功',exact:true})).toBeVisible();
  assert.equal(keys.length,2);assert.equal(keys[0],keys[1]);
  assert.equal(await h.db.collection('survey_versions').countDocuments({surveyId:new ObjectId(draft.id)}),1);
  await page.unrouteAll();
  await page.setViewportSize({width:1440,height:900});
  await page.screenshot({path:`${directory}/published-1440.png`,fullPage:true});
  pass('lost publication receipt stays on editor; same-key retry redirects only after confirmation and creates exactly one version');

  const empty=await h.draft([],{title:'未完成草稿'});
  await page.goto(`${origin}/surveys/${empty.id}/publication`);
  await expect(page.getByRole('heading',{name:'问卷尚未发布',exact:true})).toBeVisible();
  await expect(page.getByLabel('分享链接',{exact:true})).toHaveCount(0);
  await page.goto(`${origin}/surveys/${empty.id}`);
  await page.getByRole('button',{name:'发布问卷',exact:true}).click();
  await expect(page.getByRole('alert')).toBeVisible();assert.equal(page.url(),`${origin}/surveys/${empty.id}`);
  assert.equal(await h.db.collection('survey_versions').countDocuments({surveyId:new ObjectId(empty.id)}),0);
  assert.deepEqual(errors,[]);
  pass('unpublished direct access has no fake link; invalid publication remains on editor without success redirect');
  writeFileSync(`${directory}/result.json`,JSON.stringify({status:'passed',database:h.dbName,passed,pageErrors:errors},null,2));
  console.log(`Screenshots and result: ${directory}`);
}finally{await browser.close();await h.close();}
