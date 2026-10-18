import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { chromium, expect } from '@playwright/test';
import type { Answer, Question } from '@survey/shared';
import { optionPercentage, defaultShowAverage } from '../../apps/web/src/statistics-display.js';
import { harness } from './harness.js';

assert.equal(optionPercentage(2, 3), 66.7);
assert.equal(optionPercentage(0, 0), 0);
assert.equal(defaultShowAverage('测试手机号'), false);
assert.equal(defaultShowAverage('联系电话'), false);
assert.equal(defaultShowAverage('每周运动小时'), true);
const origin = 'http://127.0.0.1:3108';
const h = await harness('statscharts', {}, origin);
const questions: Question[] = [
  { id: 'single', type: 'single', title: '你是否参加运动？', required: false, options: [{ id: 'yes', label: '参加' }, { id: 'no', label: '不参加' }, { id: 'none', label: '暂未决定' }], jumpRules: [] },
  { id: 'multi', type: 'multiple', title: '你喜欢哪些运动？', required: false, options: [{ id: 'basketball', label: '篮球' }, { id: 'swim', label: '游泳' }, { id: 'run', label: '跑步' }], validation: {}, jumpRules: [] },
  { id: 'phone', type: 'number', title: '测试手机号', required: false, validation: { integerOnly: true }, jumpRules: [] },
  { id: 'hours', type: 'number', title: '每周运动小时', required: false, validation: { integerOnly: false }, jumpRules: [] },
];
let browser: Awaited<ReturnType<typeof chromium.launch>> | undefined;
const results: string[] = [];
const pass = (message: string) => { results.push(message); console.log(`PASS ${message}`); };
const directory = `docs/testing/screenshots/statistics-charts-${Date.now()}`;
mkdirSync(directory, { recursive: true });
try {
  const s = await h.draft(questions, { title: '校园运动统计图表验证', allowAnonymous: true, allowRepeat: true });
  assert.equal((await h.publish(s.id)).statusCode, 201);
  const rows: Answer[][] = [
    [{ questionId: 'single', type: 'single', optionId: 'yes' }, { questionId: 'multi', type: 'multiple', optionIds: ['basketball', 'swim'] }, { questionId: 'phone', type: 'number', number: '13800138000' }, { questionId: 'hours', type: 'number', number: '2.5' }],
    [{ questionId: 'single', type: 'single', optionId: 'yes' }, { questionId: 'multi', type: 'multiple', optionIds: ['swim'] }, { questionId: 'hours', type: 'number', number: '1.5' }],
    [{ questionId: 'single', type: 'single', optionId: 'no' }, { questionId: 'multi', type: 'multiple', optionIds: ['basketball'] }, { questionId: 'hours', type: 'number', number: '0' }],
    [],
  ];
  for (const answers of rows) {
    const r = await h.request('POST', `/public/surveys/${s.publicId}/responses`, { publishedVersion: 1, anonymous: true, answers }, 0, { 'idempotency-key': randomUUID() });
    assert.equal(r.statusCode, 201, r.body);
  }
  const statistics = (await h.request('GET', `/surveys/${s.id}/statistics`)).json().data;
  assert.equal(statistics.selectedVersionResponseCount, 4);
  assert.equal(statistics.questionSummaries[0].answeredCount, 3);
  assert.deepEqual(statistics.questionSummaries[1].optionCounts.map((o: { count: number }) => o.count), [2, 2, 0]);
  pass('fixed answers preserve exact API counts; unanswered fourth response excluded from per-question denominator');
  await h.app.listen({ host: '127.0.0.1', port: 3108 });
  const channel = existsSync('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe') ? 'msedge' : undefined;
  browser = await chromium.launch({ headless: true, ...(channel ? { channel } : {}) });
  const context = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
  await context.addCookies([{ name: 'survey_auth', value: h.cookies[0].slice('survey_auth='.length), url: origin }]);
  const page = await context.newPage(); const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`${origin}/surveys/${s.id}/statistics`);
  const single = page.locator('[data-question-id="single"]');
  const multi = page.locator('[data-question-id="multi"]');
  const phone = page.locator('[data-question-id="phone"]');
  const hours = page.locator('[data-question-id="hours"]');
  await expect(single.locator('.choice-chart svg')).toBeVisible();
  await expect(single.locator('.choice-chart svg')).toContainText('66.7%');
  await expect(single.getByRole('row', { name: '参加 2 66.7%', exact: true })).toBeVisible();
  await expect(single.getByRole('row', { name: '不参加 1 33.3%', exact: true })).toBeVisible();
  await expect(single.getByRole('row', { name: '暂未决定 0 0%', exact: true })).toBeVisible();
  await expect(multi.getByRole('row', { name: '篮球 2 66.7%', exact: true })).toBeVisible();
  await expect(multi.getByRole('row', { name: '游泳 2 66.7%', exact: true })).toBeVisible();
  await expect(multi.getByText('多选题使用柱状图展示各选项回答率，合计可能超过 100%。', { exact: true })).toBeVisible();
  await expect(multi.locator('.choice-chart')).toHaveAttribute('data-chart-type', 'bar');
  pass('single 66.7/33.3/0 and multi 66.7/66.7/0; multi uses bars with explicit denominator');
  await expect(single.getByRole('button', { name: '饼图', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await single.getByRole('button', { name: '柱状图', exact: true }).click();
  await expect(single.locator('.choice-chart')).toHaveAttribute('data-chart-type', 'bar');
  await expect(single.locator('.choice-chart svg')).toBeVisible();
  await expect(single.locator('.choice-chart svg')).toContainText('66.7%');
  await single.getByRole('button', { name: '饼图', exact: true }).click();
  await expect(single.locator('.choice-chart')).toHaveAttribute('data-chart-type', 'pie');
  await expect(phone.getByRole('checkbox', { name: '显示平均值', exact: true })).not.toBeChecked();
  await expect(phone.locator('.average')).toHaveCount(0);
  await phone.getByRole('checkbox', { name: '显示平均值', exact: true }).check();
  await expect(phone.locator('.average')).toContainText('13800138000');
  await phone.getByRole('checkbox', { name: '显示平均值', exact: true }).uncheck();
  await expect(hours.locator('.average')).toContainText('1.33');
  pass('single chart switching, phone mean hidden by default with manual override, ordinary mean rounded to 1.33');
  await page.screenshot({ path: `${directory}/desktop.png`, fullPage: true });
  await page.setViewportSize({ width: 320, height: 900 });
  await expect(single.locator('.choice-chart svg')).toBeVisible();
  await expect(single.locator('.choice-chart svg')).toContainText('66.7%');
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  await page.screenshot({ path: `${directory}/mobile.png`, fullPage: true });
  await single.getByRole('link', { name: '单题统计', exact: true }).click();
  await expect(page.getByRole('heading', { name: '单题统计', exact: true })).toBeVisible();
  await expect(single.locator('.choice-chart svg')).toBeVisible();
  await expect(single.locator('.choice-chart svg')).toContainText('66.7%');
  await expect(single.getByRole('row', { name: '参加 2 66.7%', exact: true })).toBeVisible();
  pass('320px responsive chart and identical single-question statistics');
  await h.state(s.id, 'pause'); assert.equal((await h.publish(s.id)).statusCode, 201);
  await page.goto(`${origin}/surveys/${s.id}/statistics`);
  await expect(page.getByTestId('selected-count')).toHaveText('0 份');
  await expect(page.locator('.chart-empty')).toHaveCount(2);
  await expect(page.locator('.choice-chart')).toHaveCount(0);
  await expect(hours.locator('.average')).toContainText('暂无有效数字答案');
  await expect(phone.locator('.average')).toHaveCount(0);
  await page.getByLabel('发布版本', { exact: true }).selectOption('1');
  await expect(page.getByTestId('selected-count')).toHaveText('4 份');
  await expect(single.locator('.choice-chart svg')).toBeVisible();
  await expect(single.locator('.choice-chart svg')).toContainText('66.7%');
  await expect(single.getByRole('row', { name: '参加 2 66.7%', exact: true })).toBeVisible();
  await expect(phone.locator('.average')).toHaveCount(0);
  assert.deepEqual(errors, []);
  pass('empty latest version has no misleading chart; historical version restores counts/charts with no page errors');
  writeFileSync(`${directory}/result.json`, JSON.stringify({ status: 'passed', database: h.dbName, results, pageErrors: errors }, null, 2));
  console.log(`Evidence: ${directory}`);
} finally { await browser?.close(); await h.close(); }
