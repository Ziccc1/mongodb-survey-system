import assert from 'node:assert/strict';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { chromium, expect } from '@playwright/test';
import { ObjectId, Decimal128 } from 'mongodb';
import type { Question } from '@survey/shared';
import { harness } from './harness.js';

const baseline = process.argv.includes('--baseline');
const origin = 'http://127.0.0.1:3107';
const h = await harness('fillreview', {}, origin);
const questions: Question[] = [
  { id: 'q1', type: 'single', title: '你是否参加运动？', required: true, options: [{ id: 'yes', label: '参加' }, { id: 'no', label: '不参加' }], jumpRules: [{ id: 'r1', condition: { op: 'eq', optionId: 'no' }, targetQuestionId: 'q4' }] },
  { id: 'q2', type: 'multiple', title: '你喜欢哪些运动？', required: true, options: [{ id: 'basketball', label: '篮球' }, { id: 'swim', label: '游泳' }, { id: 'run', label: '跑步' }, { id: 'badminton', label: '羽毛球' }], validation: { minChoices: 2, maxChoices: 3 }, jumpRules: [{ id: 'all', condition: { op: 'containsAll', optionIds: ['basketball', 'swim'] }, targetQuestionId: 'q4' }, { id: 'any', condition: { op: 'containsAny', optionIds: ['basketball'] }, targetQuestionId: 'q3' }] },
  { id: 'q3', type: 'text', title: '你对运动设施有什么建议？', required: true, validation: { minLength: 5, maxLength: 20 }, jumpRules: [] },
  { id: 'q4', type: 'number', title: '你每周运动多少小时？', required: true, validation: { min: '0', max: '30', integerOnly: false }, jumpRules: [{ id: 'zero', condition: { op: 'eq', number: '0' }, targetQuestionId: 'q6' }] },
  { id: 'q5', type: 'number', title: '你的年龄？', required: true, validation: { min: '0', max: '120', integerOnly: true }, jumpRules: [] },
  { id: 'q6', type: 'number', title: '测试手机号', required: true, validation: { integerOnly: true }, jumpRules: [] },
  { id: 'q7', type: 'text', title: '其他意见', required: false, validation: { minLength: 3, maxLength: 20 }, jumpRules: [] },
];
const directory = `.local/evidence/fill-review-${Date.now()}${baseline ? '-baseline' : ''}`;
mkdirSync(directory, { recursive: true });
let browser: Awaited<ReturnType<typeof chromium.launch>> | undefined;
const results: string[] = [];
const pass = (message: string) => { results.push(message); console.log(message); };
try {
  const s = await h.draft(questions, { title: '运动问卷专项回归', allowAnonymous: true, allowRepeat: true });
  const published = await h.publish(s.id); assert.equal(published.statusCode, 201, published.body);
  await h.app.listen({ host: '127.0.0.1', port: 3107 });
  const channel = existsSync('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe') ? 'msedge' : undefined;
  browser = await chromium.launch({ headless: true, ...(channel ? { channel } : {}) });
  const context = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
  await context.addCookies([{ name: 'survey_auth', value: h.cookies[0].slice('survey_auth='.length), url: origin }]);
  const page = await context.newPage(); const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message)); page.on('dialog', dialog => dialog.accept());
  await page.goto(`${origin}/surveys`);
  const row = page.locator('.survey-row').filter({ hasText: '运动问卷专项回归' });
  if (baseline) pass(`BASELINE published-list-label: ${await row.locator('.badge').innerText()}`);
  else { await expect(row.locator('.badge')).toHaveText('收集中'); pass('PASS published list shows 收集中'); }
  await page.goto(`${origin}/surveys/${s.id}/preview`);
  await page.getByRole('button', { name: '下一题', exact: true }).click();
  if (baseline) {
    await expect(page.locator('.field-error')).toContainText('请回答这道必答题');
    pass('BASELINE creator preview requires answer to advance');
  } else {
    await expect(page.getByRole('group', { name: /你喜欢哪些运动/ })).toBeVisible();
    await page.getByRole('button', { name: '下一题', exact: true }).click();
    await expect(page.getByLabel('你对运动设施有什么建议？', { exact: true })).toBeVisible();
    pass('PASS default preview browses required questions without answers');
    await page.getByRole('radio', { name: '模拟填写', exact: true }).check();
  }
  await page.getByRole('radio', { name: '参加', exact: true }).check();
  await page.getByRole('button', { name: '下一题', exact: true }).click();
  await page.getByRole('checkbox', { name: '篮球', exact: true }).check();
  await page.getByRole('checkbox', { name: '游泳', exact: true }).check();
  await page.getByRole('button', { name: '下一题', exact: true }).click();
  await expect(page.getByLabel('你每周运动多少小时？', { exact: true })).toBeVisible();
  pass(`${baseline ? 'BASELINE' : 'PASS'} basketball+swim opens Q4; heading: ${await page.locator('#fill-step').innerText()}`);
  if (!baseline) await expect(page.locator('#fill-step')).toContainText('第 4 题');
  await page.screenshot({ path: `${directory}/multi-jump.png`, fullPage: true });
  if (!baseline) {
    await page.getByRole('button', { name: '上一题', exact: true }).click();
    await page.getByRole('checkbox', { name: '游泳', exact: true }).uncheck();
    await page.getByRole('checkbox', { name: '跑步', exact: true }).check();
    await page.getByRole('button', { name: '下一题', exact: true }).click();
    await expect(page.getByLabel('你对运动设施有什么建议？', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: '下一题', exact: true }).click();
    await expect(page.locator('.field-error')).toContainText('请回答这道必答题');
    pass('PASS basketball+run goes to Q3, simulated filling retains required validation');
    await page.getByRole('radio', { name: '逐题浏览', exact: true }).check();
    for (let n = 0; n < 6; n++) await page.getByRole('button', { name: '下一题', exact: true }).click();
    await page.getByRole('button', { name: '检查答案', exact: true }).click();
    await page.getByRole('button', { name: '完成预览', exact: true }).click();
    await expect(page.getByRole('heading', { name: '预览完成', exact: true })).toBeVisible();
    assert.equal(await h.db.collection('responses').countDocuments({ surveyId: new ObjectId(s.id) }), 0);
    pass('PASS empty preview can finish and creates no responses');
    await page.goto(`${origin}/survey/${s.publicId}`);
    await page.getByRole('button', { name: '下一题', exact: true }).click();
    await expect(page.locator('.field-error')).toContainText('请回答这道必答题');
    await page.getByRole('radio', { name: '不参加', exact: true }).check();
    await page.getByRole('button', { name: '下一题', exact: true }).click();
    await page.getByLabel('你每周运动多少小时？', { exact: true }).fill('0');
    await page.getByRole('button', { name: '下一题', exact: true }).click();
    const phone = page.getByLabel('测试手机号', { exact: true });
    for (const [value, expected] of [['13800138000.5', '请输入整数'], ['abc', '请输入有效数字']] as const) {
      await phone.fill(value); await page.getByRole('button', { name: '下一题', exact: true }).click();
      await expect(page.locator('.field-error')).toContainText(expected);
    }
    await phone.fill('13800138000'); await page.getByRole('button', { name: '下一题', exact: true }).click();
    await page.getByRole('button', { name: '检查答案', exact: true }).click();
    await expect(page.getByRole('heading', { name: '6. 测试手机号', exact: true })).toBeVisible();
    await page.getByRole('button', { name: '确认提交', exact: true }).click();
    await expect(page.getByRole('heading', { name: '提交成功', exact: true })).toBeVisible();
    const record = await h.db.collection('responses').findOne({ surveyId: new ObjectId(s.id) });
    const saved = record!.answers.find((answer: { questionId: string }) => answer.questionId === 'q6');
    assert.ok(saved.number instanceof Decimal128); assert.equal(saved.number.toString(), '13800138000');
    pass('PASS actual filling validates required answers, zero jump, fractional/letter phone and exact Decimal128 save');
    await h.state(s.id, 'pause'); await page.goto(`${origin}/surveys`);
    await expect(row.locator('.badge')).toHaveText('已暂停');
    await h.state(s.id, 'close'); await page.reload(); await expect(row.locator('.badge')).toHaveText('已关闭');
    const draft = await h.draft(questions, { title: '未发布状态检查' }); await page.reload();
    await expect(page.locator('.survey-row').filter({ hasText: '未发布状态检查' }).locator('.badge')).toHaveText('草稿');
    assert.ok(draft.id); pass('PASS paused, closed and draft list labels');
    await page.setViewportSize({ width: 320, height: 900 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.screenshot({ path: `${directory}/list-mobile.png`, fullPage: true });
  }
  assert.deepEqual(errors, []);
  writeFileSync(`${directory}/result.json`, JSON.stringify({ status: 'passed', baseline, database: h.dbName, results, pageErrors: errors }, null, 2));
  console.log(`Evidence: ${directory}`);
} finally { await browser?.close(); await h.close(); }
