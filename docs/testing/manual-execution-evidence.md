# 分步人工测试证据摘录

[← 返回项目总 README](../../README.md)


整理日期：2026-10-18。来源是本聊天中用户粘贴的真实mongosh输出与明确反馈，**不是本次重新连库执行结果，也不是完整终端记录**。测试密码、cookie不保存；原答卷中的手机号脱敏，不用于公开报告展示真实号码。

## M01 用户持久化

用户查询step_test_a/b，实际返回两份用户文档：

| 用户 | _id | schemaVersion | createdAt类型 |
| --- | --- | --- | --- |
| step_test_a | ObjectId('6ad3914e931e5a6d6cc547f0') | 1 | ISODate |
| step_test_b | ObjectId('6ad39161931e5a6d6cc547f1') | 1 | ISODate |

查询投影passwordHash:0，所以不能从此输出证明密码字段缺失，也不能单凭截图证明哈希算法安全；账号自动化提供另行验证。

## M02 草稿

实际摘录：

```javascript
{
  _id: ObjectId('6ad391d5931e5a6d6cc547f3'),
  ownerId: ObjectId('6ad3914e931e5a6d6cc547f0'),
  title: '分步测试问卷',
  description: '用于验证问卷创建与数据库保存',
  status: 'draft', allowAnonymous: true, allowRepeat: false,
  expiresAt: null, currentPublishedVersion: null,
  submissionCount: 0, questions: []
}
```

## M03 题目

实际保存后definitionVersion=2、revision=1，questions共5项：

| 题号/id | 实际内容 |
| --- | --- |
| Q1 378a963e-2876-49b0-93d7-c8451b54eda9 | single，必答，参加/不参加 |
| Q2 b593b609-20b9-442e-a5e9-b4b3ab804ee0 | multiple，必答，篮球/游泳/跑步，minChoices=1/maxChoices=2 |
| Q3 d1808ab9-347a-421a-af3a-687845f57302 | text，可选，minLength=0/maxLength=10 |
| Q4 5acb267c-a7f3-4092-b28c-a8b6eca91a32 | number，必答，integerOnly=true，min=Decimal128('0')/max=Decimal128('120') |
| Q5 1d51e75b-b936-494b-b47a-171f93796967 | number，可选，integerOnly=true，无范围 |

## M04 规则

实际Q1条件eq、optionId=2ae6cc2e-1d75-4a0c-860b-5e404207c48a（不参加）；Q2条件containsAll，optionIds含篮球28ec8d01-1c9d-4830-8f9d-7b64ab87b94b和游泳d5bf37f8-f9e4-462c-be4a-eca5fb2e3570。两者targetQuestionId均为Q4年龄题ID。

## M05 第一份正式答卷

- _id=6ad3943b931e5a6d6cc547f5；surveyDefinitionVersion=1；schemaVersion=2；anonymous=true；repeatAllowed=false；payloadHashVersion=2。
- 实际答案：Q1参加、Q2篮球与游泳、Q4 Decimal128('20')、Q5 Decimal128类型的手机号（已脱敏）。
- Q3因多选命中跳转未保存，实际4项答案，不把先前建议的“只选篮球、填写建议”当实际输入。
- 提交后问卷published/currentPublishedVersion=1/submissionCount=1/currentVersionSubmissionCount=1。更早的responses=0是预览阶段查询，不是提交后记录。

## M06 用户实际粘贴的三份答卷关联

| 答卷_id | 发布号 | respondentId | submittedAt（UTC） |
| --- | --- | --- | --- |
| 6ad3943b931e5a6d6cc547f5 | 1 | 6ad39161931e5a6d6cc547f1（B） | 2026-10-17T15:28:59.312Z |
| 6ad3959c931e5a6d6cc547f6 | 1 | 6ad3914e931e5a6d6cc547f0（A） | 2026-10-17T15:34:52.358Z |
| 6ad39b4b931e5a6d6cc547f9 | 2 | 6ad39b23931e5a6d6cc547f8（后续账号） | 2026-10-17T15:59:07.876Z |

用户明确解释：“确实是两份，我之前自己用a的账号重新测试了一遍”。因此v1两份不是计数故障。

## M07 人工反馈的证据边界

用户分别反馈统计测试通过、输入边界完成，最后说明都测试完成。跨用户访问最初为“应该都是通过了的”，没有逐接口截图，因此主要采用已有自动权限测试支撑。

最后一次可见计数查询的主问卷状态仍为published。助手提醒关闭后应为closed，随后用户反馈“好了，都测试完了”，没有再次贴出closed查询。因此关闭功能有自动化证据与人工口头确认，但不伪造人工最终数据库截图。

## M08 最终计数一致性（用户原始输出）

```javascript
{
  title: '分步测试问卷',
  status: 'published',
  currentVersion: 2,
  storedTotal: 3,
  actualTotal: 3,
  storedCurrent: 1,
  actualCurrent: 1
}
{
  title: '分步测试-允许重复',
  status: 'published',
  currentVersion: 1,
  storedTotal: 2,
  actualTotal: 2,
  storedCurrent: 2,
  actualCurrent: 2
}
```

对应只读查询：

```javascript
db.surveys.find({title:{$in:['分步测试问卷','分步测试-允许重复']}}).forEach(function(s){
  printjson({
    title:s.title,status:s.status,currentVersion:s.currentPublishedVersion,
    storedTotal:s.submissionCount,
    actualTotal:db.responses.countDocuments({surveyId:s._id}),
    storedCurrent:s.currentVersionSubmissionCount,
    actualCurrent:db.responses.countDocuments({surveyId:s._id,surveyDefinitionVersion:s.currentPublishedVersion})
  });
});
```

此查询在mongosh执行。PowerShell中直接输入db.surveys曾产生语法错误，之后进入mongosh执行成功；前一次shell解析错误不代表数据库故障，也不产生数据库写入。

[← 返回项目总 README](../../README.md)
