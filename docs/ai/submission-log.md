# AI 使用日志

[返回项目总 README](../../README.md) · [记录规范](README.md) · [原始历史日志](usage-log.md) · [补充提示词原文](submission-prompts.md)

整理日期：2026-10-19（Asia/Shanghai）。覆盖本项目已核实的需求讨论、设计、实现、测试、界面改进和提交材料整理。前期16条按历史日志重新编排，后续按当前项目两个Codex窗口的实际用户消息、源码和既有记录补记。

## 阅读说明

- 每条统一说明工具、Prompt、Result/代码位置、是否修改、修改内容与执行者；验证作为简短佐证。
- 主要AI工具为Codex桌面应用；具体模型版本未从界面核实。PowerShell、Python、MongoDB、npm、Node、Playwright、ECharts等是辅助执行或开发工具，不全部称为AI工具。
- 记录中“用户”指提出要求、作出决策并试用的项目成员；未确认姓名，不代填其他组员贡献。代码与测试脚本主要由AI生成，AI执行修复与组员亲自改源码分别记录。
- 短提示词保留原文并补上下文；长提示词注明节选并链接全文。附件只保存任务消息，未保存全部AI往返和工具输出，不冒称完整聊天导出。部分长Prompt由另一个AI窗口协助组织后由用户提交。
- 文件链接指向提交时的可核查源码/文档。文件已迭代，不等于保留了每次初稿的完整代码快照；未保存的逐行修改不补造。下面写明的前后变化以真实记录为依据。
- 日期为原任务日期；补记另标2026-10-19。测试结论来自对应日期的已有输出，仅代表当时范围，不冒称本次重新运行。

## 任务索引

| 编号        | 任务                                 | 原记录/来源                             |
| ----------- | ------------------------------------ | --------------------------------------- |
| [L01](#l01) | 作业需求分析与任务拆解               | AI-001                                  |
| [L02](#l02) | 需求文档与日志规范                   | AI-002                                  |
| [L03](#l03) | 讨论 MongoDB 集合划分                | AI-003                                  |
| [L04](#l04) | 澄清并确认第一批业务规则             | AI-004                                  |
| [L05](#l05) | 调研问卷平台并修订规则               | AI-005                                  |
| [L06](#l06) | 确认第一阶段规则基线                 | AI-006                                  |
| [L07](#l07) | 生成并验证初版 MongoDB Schema        | AI-007                                  |
| [L08](#l08) | 统一项目目录                         | AI-008                                  |
| [L09](#l09) | 总体设计与技术栈                     | AI-009                                  |
| [L10](#l10) | 改为暂停编辑与不可变发布版本         | AI-010                                  |
| [L11](#l11) | 独立整理 API 契约                    | AI-011                                  |
| [L12](#l12) | 统一 validationIssues 字段           | AI-012                                  |
| [L13](#l13) | 实现账号、认证与问卷草稿             | AI-013                                  |
| [L14](#l14) | 修正字符计数和输入超限提示           | AI-014                                  |
| [L15](#l15) | 实现题目编辑、约束和修订冲突处理     | AI-015                                  |
| [L16](#l16) | 根据试用修正预览、原题号和状态标签   | AI-016                                  |
| [L17](#l17) | 补记：发布、填写、提交与统计核心闭环 | 本聊天原任务P01；阶段报告和原始测试记录 |
| [L18](#l18) | 补记：均值展示、占比和 ECharts       | 项目核查窗口P02及专项记录               |
| [L19](#l19) | 补记：分页填写、底部添加与分享配置   | 本聊天P03及运行记录                     |
| [L20](#l20) | 补记：桌面工作台与编辑器视觉精修     | 本聊天P04及桌面测试记录                 |
| [L21](#l21) | 补记：分步人工验收及提交用例         | 项目核查窗口P05—P07与人工证据           |
| [L22](#l22) | 补记：发布成功页与分享首屏可见       | 项目核查窗口P18及页面专项记录           |

## 分项记录

<a id="l01"></a>

### L01 作业需求分析与任务拆解

日期：2026-10-15。来源：AI-001。

**使用工具：** AI 工具：Codex 桌面应用。。

**Prompt：**

> 这个是我们第一次大作业的作业要求，请你仔细阅读，然后理解需求，将任务拆解成具体步骤，同时需要特别注意的是这个作业需要记录我们的ai使用情况，我们需要按照指定格式完成ai使用说明的记录。

**Result／得到的代码：** 得到功能、评分关注点、开发步骤及 AI 记录建议；本轮未生成业务代码。

**是否修改：** 无业务代码可修改；后续将分析结果整理为文档。

**修改了什么、由谁修改：** 用户同意继续整理需求；需求文档由 AI 在下一任务生成。不能把这一轮解释计为已实现系统。

**验证及证据：** 历史记录说明已解析教师文档，未执行系统功能测试。

<a id="l02"></a>

### L02 需求文档与日志规范

日期：2026-10-15。来源：AI-002。

**使用工具：** AI 工具：Codex 桌面应用。

**Prompt：**

同意上一轮整理的需求清单和设计约定。

**Result／得到的代码：** 得到 [requirements.md](../requirements.md)、[decisions.md](../decisions.md)、[README.md](README.md)；产物为文档，无业务代码。

**是否修改：** 是，AI 在整理中补充文档。

**修改了什么、由谁修改：** AI 补入重复填写时“人数”和“答卷次数”的口径歧义，用户在后面会逐项确认业务规则。

**验证及证据：** 对照作业要求整理；需求编号和测试编号当时只是计划。

<a id="l03"></a>

### L03 讨论 MongoDB 集合划分

日期：2026-10-15。来源：AI-003。

**使用工具：** AI 工具：Codex 桌面应用。

**Prompt：**

“确定schema，先设计一下数据库有什么表格以及相应的存储的字段有什么”。

**Result／得到的代码：** 得到 users、surveys、responses 三集合初稿及题目嵌入、答卷独立存储的解释；仅方案，没有生成代码文件。

**是否修改：** 本轮未记录文件修改；后续方案继续演化。

**修改了什么、由谁修改：** 用户提出需要先设计 Schema；AI 给出初稿，不能据此写为用户已逐字段确认。后续增加发布版本集合，见L10。

**验证及证据：** 未运行数据库或系统测试。

<a id="l04"></a>

### L04 澄清并确认第一批业务规则

日期：2026-10-15。来源：AI-004。

**使用工具：** AI 工具：Codex 桌面应用。

**Prompt：**

> D01确认，D02确认，D03没懂，D04没懂，D05没懂，D06没懂，D07确认，D08成功提交一定被保存，草稿自动保存和断点恢复先不作为一定要实现的（如果实现不困难可以实现），D09没懂，D10没懂，D11没懂，D12没懂。

> 用户确定了认可的设计事项，要求AI给出对于不明确的设计的详细解释以进一步验证和确认设计的合理性。

**Result／得到的代码：** 得到需求歧义解释和修订后的 [requirements.md](../requirements.md)、[decisions.md](../decisions.md)；没有业务代码。

**是否修改：** 是，修改了需求与决策文档。

**修改了什么、由谁修改：** 用户确认部分规则，明确“成功提交一定保存”，自动保存和断点恢复暂列可选；AI 按反馈更新状态并解释其余规则。

**验证及证据：** 核对文档与反馈对应，不等于功能已实现。

<a id="l05"></a>

### L05 调研问卷平台并修订规则

日期：2026-10-15。来源：AI-005。

**使用工具：** AI 工具：Codex 桌面应用。辅助工具：网页检索与读取。

**Prompt：**

> D03确认，D04详细解释涉及到多个选项的多个跳转规则，因为跳转的规则应该是单选的题目跳转逻辑更为正常，D05应该是都是前题跳转到后题，D06你可以上网搜索一下问卷星、谷歌表单等问卷系统对于这部分是如何实现的，D07先按照整数设计，D10确认，D11先看下其他问卷平台是怎么处理的，D12确认，D01允许内部关联

**Result／得到的代码：** 得到平台资料、跳转和空值处理建议，以及 [platform-research.md](../platform-research.md)；没有业务代码。

**是否修改：** 是，修改规则记录。

**修改了什么、由谁修改：** 用户明确向后跳转、允许内部账号关联等行为；AI 核对多选跳转要求及整数限制语义，保留尚未确认项，避免把编号口误覆盖为其他规则。

**验证及证据：** 历史记录为官方网页资料查阅，未登录第三方平台实测。

<a id="l06"></a>

### L06 确认第一阶段规则基线

日期：2026-10-15。来源：AI-006。

**使用工具：** AI 工具：Codex 桌面应用。

**Prompt：**

确认上一轮多选首条命中、发布后修改及可选题校验方案。

**Result／得到的代码：** 得到明确的需求与决策基线，更新 [decisions.md](../decisions.md)、[requirements.md](../requirements.md)；没有业务代码。

**是否修改：** 是，文档由待确认改为已确认；后续有正式规则变更。

**修改了什么、由谁修改：** 人工负责作出采纳决定，AI 更新文档。这里的早期发布后修改策略后来被用户新决定替换，见L10，不作为最终规则。

**验证及证据：** 仅文档状态更新，未执行系统功能测试。

<a id="l07"></a>

### L07 生成并验证初版 MongoDB Schema

日期：2026-10-15。来源：AI-007。

**使用工具：** AI 工具：Codex 桌面应用。辅助工具：MongoDB 官方资料、mongod、mongosh。

**Prompt：**

“请帮我设计符合上述功能需求的MongoDB schema”。

**Result／得到的代码：** 得到三集合字段、验证器、索引和样例脚本：[init-schema.js](../../database/init-schema.js)、[examples.js](../../database/examples.js)、[verify-schema.js](../../database/verify-schema.js)、[database-design.md](../database-design.md)。这些是初版历史产物，当前四集合初始化见L13。

**是否修改：** 是，AI 根据真实数据库报错修正代码。

**修改了什么、由谁修改：** 初版验证器生成空 required 数组，MongoDB 拒绝创建集合。人工审查时发现，AI 改为没有必填项时省略 required 属性，再在新测试库验证。

**验证及证据：** 历史 [schema-verification.md](../schema-verification.md) 记录12项 Schema、索引及聚合检查通过；当时未验证完整业务事务。

<a id="l08"></a>

### L08 统一项目目录

日期：2026-10-15。来源：AI-008。

**使用工具：** AI 工具：Codex 桌面应用。

**Prompt：**

“我需要你把所有的设计的东西和内容都放在D:\大三\数据库\project1，这个文件夹下，这个项目也都在这里进行开发”。

**Result／得到的代码：** 整理项目文件到用户指定的 D:\大三\数据库\project1；不新增业务功能代码。

**是否修改：** 是，调整文件组织位置。

**修改了什么、由谁修改：** 用户指定正式目录；AI 进行复制、同名检查与完整性核对，保留原作业与历史文件，不把迁移目录当作业务实现。

**验证及证据：** 执行状态以历史日志及项目 migration-manifest.json 为依据，本轮不重新迁移或测试。

<a id="l09"></a>

### L09 总体设计与技术栈

日期：2026-10-15。来源：AI-009。

**使用工具：** AI 工具：Codex 桌面应用。辅助工具：文档解析、PowerShell、Python静态检查与技术资料核对。

**Prompt：**

原文节选：“请为 D:\大三\数据库\project1 建立统一的系统总体设计文档，建议路径为 docs/system-design.md，并在 README.md 中增加入口。”完整提示词见 [AI-009-user-prompt.md](conversations/AI-009-user-prompt.md)。

**Result／得到的代码：** 得到 [system-design.md](../system-design.md)：Vue/TypeScript/Vite、Fastify、MongoDB原生驱动、共享校验、认证和模块职责方案；本轮没有业务代码。

**是否修改：** 是，建立总体设计并整合文档入口。

**修改了什么、由谁修改：** AI 在既有需求与Schema上提出普通技术方案，用户明确文档范围和统计边界；未记录用户逐项独立设计框架或手工实现。

**验证及证据：** 文档链接、示例与一致性静态检查，见 [AI-009-design-check.json](evidence/AI-009-design-check.json)；当时不运行接口。

<a id="l10"></a>

### L10 改为暂停编辑与不可变发布版本

日期：2026-10-15。来源：AI-010。

**使用工具：** AI 工具：Codex 桌面应用。辅助工具：PowerShell、Python、MongoDB资料核对。

**Prompt：**

原文节选：“问卷暂停收集后，即使已有答卷，也允许修改题目、选项、校验和跳转规则。”用户另要求沿用同一问卷ID和链接、保留旧答卷、分版统计。完整八项决定见 [AI-010-user-prompt.md](conversations/AI-010-user-prompt.md)。

**Result／得到的代码：** 得到 survey_versions 独立集合及编辑区/当前指针/历史快照分工，形成 [versioning-change-plan.md](../versioning-change-plan.md)、[database-design.md](../database-design.md)、[test-plan.md](../test-plan.md)；当时只有设计，无业务代码。

**是否修改：** 是，替换旧的结构锁定方案。

**修改了什么、由谁修改：** 变更由用户正式提出：暂停后可改、同链接重发、历史保留、分版统计、复制降为可选。AI 负责快照、发布幂等和迁移设计，普通草稿保存不生成发布版本。

**验证及证据：** 见 [AI-010-design-check.json](evidence/AI-010-design-check.json)；这些是设计静态检查，不是新版数据库和接口测试。

<a id="l11"></a>

### L11 独立整理 API 契约

日期：2026-10-16。来源：AI-011。

**使用工具：** AI 工具：Codex 桌面应用。辅助工具：PowerShell、Python文档检查。

**Prompt：**

原文节选：“请将现有 API 设计独立整理为 docs/api.md，作为前后端共同遵循的接口契约。本轮只做设计文档，不实现业务代码。”全文见 [AI-011-user-prompt.md](conversations/AI-011-user-prompt.md)。

**Result／得到的代码：** 得到 [api.md](../api.md)：认证、ID/时间/数字字符串、DTO、错误、分页、版本和幂等约定，以及创建到重发的示例。此轮没有接口实现代码。

**是否修改：** 是，整理并补足接口覆盖。

**修改了什么、由谁修改：** AI 将总体设计的详细接口移入独立契约，保留概览；补充历史答卷列表以发现详情ID。用户提出契约目标，字段限额与错误细节由 AI 确定。

**验证及证据：** 见 [AI-011-api-check.json](evidence/AI-011-api-check.json)。后来发现的命名遗漏见L12。

<a id="l12"></a>

### L12 统一 validationIssues 字段

日期：2026-10-16。来源：AI-012。

**使用工具：** AI 工具：Codex 桌面应用。辅助工具：PowerShell文本搜索与精确替换。

**Prompt：**

“我刚刚阅读之后发现题目编辑部分有的地方叫 validationIssues，有的地方叫 definitionIssues，是不是应该统一？”

**Result／得到的代码：** 得到修正的 [api.md](../api.md)；没有新增业务代码。

**是否修改：** 是，AI 根据用户指出的文档问题修改。

**修改了什么、由谁修改：** 将页面覆盖说明中一处 definitionIssues 改为 validationIssues；元素类型名 DefinitionIssue 保留。这属于用户阅读发现问题、AI执行替换。

**验证及证据：** 历史全文搜索和命名核对通过，未执行接口测试。

<a id="l13"></a>

### L13 实现账号、认证与问卷草稿

日期：2026-10-16。来源：AI-013。

**使用工具：** AI 工具：Codex 桌面应用。辅助工具：npm、TypeScript、MongoDB副本集、node:test、Playwright/Edge；界面实现使用 frontend-ui-engineering 技能。

**Prompt：**

原文节选：“开发第一版可以实际操作的系统，不要只搭空工程。”要求注册、登录、当前用户、退出、创建草稿和自己的列表/详情；全文见 [AI-013-user-prompt.md](conversations/AI-013-user-prompt.md)。

**Result／得到的代码：** 得到可运行的前后端工程。[app.ts](../../apps/api/src/app.ts)、[security.ts](../../apps/api/src/security.ts) 实现账号、会话及归属检查；[schema.ts](../../apps/api/src/database/schema.ts)、[initialize.ts](../../apps/api/src/database/initialize.ts) 实现四集合验证器/索引与初始化；[AuthPage.vue](../../apps/web/src/pages/AuthPage.vue)、[CreatePage.vue](../../apps/web/src/pages/CreatePage.vue)、[ListPage.vue](../../apps/web/src/pages/ListPage.vue) 提供对应页面。

**是否修改：** 是，AI 在类型检查、依赖检查及实际运行中修复。

**修改了什么、由谁修改：** 收窄 Fastify 错误对象类型，调整静态服务插件依赖；浏览器下载停滞后改用本机 Edge。用户确定范围和验收目标，AI 编写与修复代码。

**验证及证据：** 历史类型/构建、14个含父用例的集成检查及浏览器流程通过，见 [AI-013-runtime-check.json](evidence/AI-013-runtime-check.json)。

<a id="l14"></a>

### L14 修正字符计数和输入超限提示

日期：2026-10-16。来源：AI-014。

**使用工具：** AI 工具：Codex 桌面应用。辅助工具：TypeScript/Vite、Playwright/Edge、MongoDB。

**Prompt：**

“问卷说明提示最多 2000 字，但前端允许输入更多，提交后才报通用错误。能否统一前后端的字符计数，并在输入位置明确提示超限？”

**Result／得到的代码：** 得到共享 [index.ts](../../packages/shared/src/index.ts) 中 codePointLength、SURVEY_TEXT_LIMITS、surveyTextIssues；[CreatePage.vue](../../apps/web/src/pages/CreatePage.vue)、[app.ts](../../apps/api/src/app.ts)、[character-limits.ts](../../tests/character-limits.ts) 对齐前后端并验证边界。

**是否修改：** 是，AI 根据用户实际试用反馈修改。

**修改了什么、由谁修改：** 从不一致的输入限制改为 Unicode 码点计数，移除按UTF-16计数的原生maxlength；显示超出数量、保留原文并阻止超限提交，后端返回字段级原因。未更改2000字说明限额。

**验证及证据：** 汉字、emoji及换行2000/2001边界、绕过前端与修正后提交均验证，见 [AI-014-character-limits.json](evidence/AI-014-character-limits.json)。

<a id="l15"></a>

### L15 实现题目编辑、约束和修订冲突处理

日期：2026-10-16。来源：AI-015。

**使用工具：** AI 工具：Codex 桌面应用。辅助工具：MongoDB、decimal.js、TypeScript/Vite、Playwright/Edge；沿用前端技能。

**Prompt：**

原文节选：“请在现有第一版系统上实现题目编辑，沿用最新 API 契约和数据库设计。”全文见 [AI-015-user-prompt.md](conversations/AI-015-user-prompt.md)。

**Result／得到的代码：** 得到 [survey-editing.ts](../../apps/api/src/survey-editing.ts)、[question-codec.ts](../../apps/api/src/question-codec.ts)、[questions.ts](../../packages/shared/src/questions.ts) 的Q04/Q05、校验与Decimal128转换；[EditorPage.vue](../../apps/web/src/pages/EditorPage.vue)、[QuestionCard.vue](../../apps/web/src/components/QuestionCard.vue)、[RuleEditor.vue](../../apps/web/src/components/RuleEditor.vue)、[MetadataEditor.vue](../../apps/web/src/components/MetadataEditor.vue) 实现四题型、稳定ID、规则优先级和冲突界面；[editor.ts](../../tests/editor.ts) 验证。

**是否修改：** 是，在既有工程上增量实现并修订测试。

**修改了什么、由谁修改：** AI 保留字符计数修复，区分硬错误与可暂存的失效引用；无实际变化不增号，过期revision冲突时保留本地内容，禁止静默覆盖。原有未实现编辑断言随能力更新，历史执行记录保留。

**验证及证据：** 11组编辑专项、真实浏览器冲突与类型/构建通过，见 [AI-015-editor-check.json](evidence/AI-015-editor-check.json)。

<a id="l16"></a>

### L16 根据试用修正预览、原题号和状态标签

日期：2026-10-16。来源：AI-016。

**使用工具：** AI 工具：Codex 桌面应用。辅助工具：PowerShell、MongoDB、TypeScript/Vite、Playwright/Edge；历史记录包含界面检查技能。

**Prompt：**

原文节选：“创建者预览的时候点击下一题应该可以之间切换进行预览而不是要选择？……我的问卷发布之后在我的问卷部分这里还是显示草稿而不是已发布或者收集中”。全文及补记授权见 [AI-016-user-prompt.md](conversations/AI-016-user-prompt.md)。

**Result／得到的代码：** 得到 [FillPage.vue](../../apps/web/src/pages/FillPage.vue)、[ListPage.vue](../../apps/web/src/pages/ListPage.vue)、[DefinitionView.vue](../../apps/web/src/components/DefinitionView.vue)、[fill-review.ts](../../tests/phase1/fill-review.ts) 的预览模式、状态与原题号修正。

**是否修改：** 是，AI 根据用户反馈修改展示和预览行为。

**修改了什么、由谁修改：** 预览分为不受必答阻挡的浏览与执行校验/跳转的模拟；列表不再写死草稿。篮球+游泳实际已跳转，原路径步骤被误认为题号，因此修复编号表达，没有把它写成多选算法错误。后续分页设计见L19。

**验证及证据：** 七组专项与当时浏览器回归见 [AI-016-fill-review-result.json](evidence/AI-016-fill-review-result.json)、[fill-preview-review.md](../testing/fill-preview-review.md)。完整核心实现发生在本条之前，补记编号L17不表示事件更晚。

<a id="l17"></a>

### L17 补记：发布、填写、提交与统计核心闭环

日期：2026-10-16；补记：2026-10-19。来源：本聊天原任务P01；阶段报告和原始测试记录。

**使用工具：** AI 工具：Codex 桌面应用。辅助工具：npm/TypeScript、MongoDB真实事务、node:test及断言、Playwright/Edge。

**Prompt：**

原文节选：“请在 D:\大三\数据库\project1 现有工程上，完成剩余核心功能，形成可以实际使用的第一阶段版本，并实际测试。”全文见 [提示词 P01](submission-prompts.md#p01)。

**Result／得到的代码：** 得到 [publication.ts](../../apps/api/src/core/publication.ts)、[versions.ts](../../apps/api/src/core/versions.ts) 的发布事务、版本仓储与重放；[answers.ts](../../packages/shared/src/answers.ts)、[submission.ts](../../apps/api/src/core/submission.ts) 的路径、校验、防重及答卷/计数事务；[reporting.ts](../../apps/api/src/core/reporting.ts) 的分版本统计与匿名输出；[VersionsPage.vue](../../apps/web/src/pages/VersionsPage.vue)、[HistoryPage.vue](../../apps/web/src/pages/HistoryPage.vue)、[AnswerListPage.vue](../../apps/web/src/pages/AnswerListPage.vue) 等页面及 [submit.ts](../../tests/phase1/submit.ts) 等测试。

**是否修改：** 是，AI 在现有账号、草稿和编辑代码上增量实现。

**修改了什么、由谁修改：** 接通不可变快照和同链接重发，答案关联版本；返回改答清理失效分支，最终路径必答；成功key重试返回原回执；数字用字符串传输并转Decimal128。用户明确行为、测试和手机号边界，AI实现并验证。此处按最终产物记录，不臆造未保存初稿的逐行diff。

**验证及证据：** 历史发布、路径、提交、统计、并发/边界、分页、浏览器及回归通过，见 [phase1-results.md](../testing/phase1-results.md)、[phase1-results.json](../testing/phase1-results.json)；不是本次重新执行。

<a id="l18"></a>

### L18 补记：均值展示、占比和 ECharts

日期：2026-10-17；补记：2026-10-19。来源：项目核查窗口P02及专项记录。

**使用工具：** AI 工具：Codex 桌面应用。辅助工具：ECharts、TypeScript/Vite、Playwright/Edge、MongoDB独立测试库。

**Prompt：**

原文：“我觉得如果是手机号就没有必要给出平均值了，以及我想是不是我们可以给出每个选项的占比统计，同时加入echarts图表支持不一样的展示效果，但是也不需要太复杂，主要是选择题的饼图、柱状图这种”。见 [提示词 P02](submission-prompts.md#p02)。

**Result／得到的代码：** 得到 [ChoiceChart.vue](../../apps/web/src/components/ChoiceChart.vue)、[NumberSummary.vue](../../apps/web/src/components/NumberSummary.vue)、[statistics-display.ts](../../apps/web/src/statistics-display.ts)、[statistics-charts.ts](../../tests/phase1/statistics-charts.ts)：选择题图表、回答占比、均值展示开关及测试。

**是否修改：** 是，AI 根据展示需求和截图检查修改。

**修改了什么、由谁修改：** 号码类标题默认隐藏均值、可手动显示，普通数字均值保留；多选分母为本题有效回答份数，不是整卷份数。早期窄屏标签曾调整，后续L19统一默认配色与百分比精度。不能将“我觉得可以去除均值”这一讨论写成已删除均值。

**验证及证据：** 见 [statistics-charts.md](../testing/statistics-charts.md)；归档可核查图表运行见 [result.json](../testing/runs/2026-10-18T08-30-51-462Z-charts/result.json)。不依赖未随项目交付的.local截图作为唯一证据。

<a id="l19"></a>

### L19 补记：分页填写、底部添加与分享配置

日期：2026-10-17；补记：2026-10-19。来源：本聊天P03及运行记录。

**使用工具：** AI 工具：Codex 桌面应用。辅助工具：TypeScript/Vite、ECharts、Playwright/Edge、MongoDB独立库和网卡HTTP检查。

**Prompt：**

原文节选：“请根据以下需求，对 project1 现有系统进行前端改版和填写体验调整。”包含每页最多10题、分支清理、默认图表色及明确公开访问地址。全文见 [提示词 P03](submission-prompts.md#p03)。

**Result／得到的代码：** 得到 [DashboardPage.vue](../../apps/web/src/pages/DashboardPage.vue)、[FillPage.vue](../../apps/web/src/pages/FillPage.vue)、[EditorPage.vue](../../apps/web/src/pages/EditorPage.vue) 的工作台、分页和底部添加；[public-config.ts](../../apps/web/src/public-config.ts)、[vite.config.ts](../../apps/web/vite.config.ts)、[config.ts](../../apps/api/src/config.ts) 及app-config资产的公开根地址配置；[redesign.ts](../../tests/phase1/redesign.ts) 的浏览器闭环验证。

**是否修改：** 是，AI 根据用户交互要求重组已有前端。

**修改了什么、由谁修改：** 逐题切换改为每页最多10道动态有效题；原题号保留、错误定位、页码夹紧；新增题目后聚焦题干，保留手动保存和冲突；图表取消手动色板并统一占比；分享不再按浏览器地址猜测。核查时还修正npm启动脚本覆盖WEB_HOST的问题。

**验证及证据：** 类型/构建、分页与跳转、丢响应重试、图表和相关回归见 [frontend-redesign.md](../testing/frontend-redesign.md)；本机非回环与Vite代理验证不等于第二台设备或公网验证。

<a id="l20"></a>

### L20 补记：桌面工作台与编辑器视觉精修

日期：2026-10-17；补记：2026-10-19。来源：本聊天P04及桌面测试记录。

**使用工具：** AI 工具：Codex 桌面应用。辅助工具：前端界面规范、Vue/CSS/SVG、TypeScript/Vite、Playwright/Edge、MongoDB测试库。

**Prompt：**

原文节选：“这次改版的重点是解决‘过于简洁，显得简陋’，不是继续删减元素或只更换颜色。”完整视觉目标见 [提示词 P04](submission-prompts.md#p04)。

**Result／得到的代码：** 得到 [desktop.css](../../apps/web/src/desktop.css)、[UiIcon.vue](../../apps/web/src/components/UiIcon.vue)、[SurveyRows.vue](../../apps/web/src/components/SurveyRows.vue)；首页真实最近创建列表，登录问卷结构示意，编辑器目录/编辑/保存发布分栏，填写和报告层级；[desktop.ts](../../tests/phase1/desktop.ts) 与六页截图。

**是否修改：** 是，AI 根据用户对前次视觉结果的反馈修改。

**修改了什么、由谁修改：** 从空白入口和长表单改为有主次的桌面构图；保留底部添加与所有业务行为。截图测试曾因构建后静态资源路由未刷新而超时，AI修正测试服务重启流程；修正暂停fixture后再拍正式填写图，不把失败尝试记为通过。

**验证及证据：** 同一独立数据集的前后截图、目录聚焦/添加保存、真实最近问卷与相关回归见 [desktop-polish.md](../testing/desktop-polish.md)、[desktop-comparison.html](../testing/desktop-comparison.html)。

<a id="l21"></a>

### L21 补记：分步人工验收及提交用例

日期：2026-10-17—2026-10-18；补记：2026-10-19。来源：项目核查窗口P05—P07与人工证据。

**使用工具：** AI 工具：Codex 桌面应用。辅助工具：用户操作浏览器与mongosh；AI用文本分析、Node测试输出核对及文档整理。

**Prompt：**

原文节选：“给我一个完整的测试流程，包括几个用户，问卷题目设计等等……查看一下mongodb是不是存储了我们保存的这些数据，并且是按照正确的格式进行组织的”；后反馈“我感觉这样测试有点多，可不可以一部分一部分来”。见 [提示词 P05](submission-prompts.md#p05)、[提示词 P06](submission-prompts.md#p06)；提交用例请求见 [提示词 P07](submission-prompts.md#p07)。

**Result／得到的代码：** 得到 [manual-acceptance.md](../testing/manual-acceptance.md)、[submission-test-cases.md](../testing/submission-test-cases.md)、[manual-execution-evidence.md](../testing/manual-execution-evidence.md) 的计划、36项提交用例和实际证据；辅助核查脚本见 [inspect-acceptance.mongosh.js](../../database/inspect-acceptance.mongosh.js)。本项主要产物为验收材料，不新增业务接口。

**是否修改：** 是，AI 按用户反馈调整节奏和证据结论。

**修改了什么、由谁修改：** 把一次84项计划改为分模块指导。用户实际操作页面并粘贴mongosh结果，AI解释与整理；额外A账号提交造成v1两份是实际操作结果，不是计数故障；PowerShell执行mongosh语句的报错属于环境用法，不能记为数据库业务错误。个人号码不写入提交版。

**验证及证据：** 36项用例逐项标出自动断言、人工查询和反馈边界。v1两份/v2一份与维护计数相符，见人工摘录。

<a id="l22"></a>

### L22 补记：发布成功页与分享首屏可见

日期：2026-10-19；同日补记。来源：项目核查窗口P18及页面专项记录。

**使用工具：** AI 工具：Codex 桌面应用；具体模型版本未核实，不推测。辅助工具：Vue、前端技能、TypeScript/Vite、Playwright/Edge、MongoDB独立库。

**Prompt：**

原文：“发布之后应该更新到新的页面就是发布成功，然后发布与收集那个包含链接的那个部分应该在这里显示出来，目前是发布之后需要一直下滑才可以看到链接的那个部分，我觉得不是很方便。这个部分调整一下”。见 [提示词 P18](submission-prompts.md#p18)。

**Result／得到的代码：** 得到 [PublicationPage.vue](../../apps/web/src/pages/PublicationPage.vue)、发布完成事件和路由；[PublicationPanel.vue](../../apps/web/src/components/PublicationPanel.vue)、[EditorPage.vue](../../apps/web/src/pages/EditorPage.vue)、[router.ts](../../apps/web/src/router.ts)、[publication-page.ts](../../tests/phase1/publication-page.ts) 接通首屏链接与验证。

**是否修改：** 是，AI 根据用户试用反馈调整发布成功后的导航。

**修改了什么、由谁修改：** 确认发布回执后才跳转到独立页面；刷新读取真实状态，保留暂停/关闭/统计入口；丢回执留在编辑页重试原key，不创建重复快照。没有改变发布事务、版本模型或数据库。

**验证及证据：** 6组专项与完整浏览器回归通过，见 [publication-page.md](../testing/publication-page.md) 和 [result.json](../testing/runs/2026-10-19T01-19-34-714Z-publicationpage/result.json)；该源码变更不因本轮整理而声称已推送。

## 主要设计演变

| 早期产物                                    | 调整依据                                 | 最终采用行为                                                            |
| ------------------------------------------- | ---------------------------------------- | ----------------------------------------------------------------------- |
| users/surveys/responses三集合、结构锁定方案 | 用户正式提出保留链接和历史答卷的修改流程 | 新增survey_versions；草稿保存与正式发布分离，暂停可编辑，历史按快照解释 |
| 单题单步填写与创建者受必答阻挡的预览        | 用户试用、原题号混淆、希望整份问卷呈现   | 浏览/模拟两种预览，每页最多10道有效题，原题号、路径重算和失效答案清理   |
| 说明超长后才收到通用错误                    | 用户发现输入提示不一致                   | 前后端统一Unicode码点，在输入处提示超限并保留文本供修改                 |
| 图表手动蓝绿色与饼图自身百分比精度          | 用户要求默认色彩并核对占比一致           | 默认系列配色；图表、提示和表格共用至多一位小数的本题回答率              |
| 发布成功后停留长编辑页寻找链接              | 用户提出分享操作不方便                   | 确认成功后进入独立发布与收集页，首屏提供链接与复制                      |

## AI 与人工工作的区分

AI承担需求整理、技术方案、主要源码、测试脚本、运行排查及文稿生成。用户承担需求解释与取舍、正式业务规则变更、阅读和界面试用、反馈问题、执行分步人工测试并提供数据库输出。现有核查范围没有足够依据把某段源码记为组员直接手写；不能将“要求AI改了什么”写成“我亲自改了那段代码”。

典型人工判断包括：同链接暂停修改/重发、统计按发布版区分、成功提交必须保存、可选功能暂缓、预览不应阻挡浏览、分页每页10题，以及桌面工作台与发布分享的交互目标。具体快照字段、索引、事务、代码和CSS实现由AI提出并落实；部分Prompt措辞也是AI协助整理。

已实际发现的AI输出问题有：空required数组、文档字段命名不一致、创建者预览目的考虑不足、列表状态写死、输入超限反馈不明确、图表百分比精度不一及静态构建截图测试路由未刷新。篮球/游泳的怀疑经核查为编号显示混淆，不夸写为跳转算法错误。历史缺陷与现在已经修复的结果分开记录。

## 当前范围及真实性边界

当前阶段核心创建、编辑、发布版本、填写跳转、提交、历史与分版本统计已有实现及相应测试证据。本文不据此宣称任何输入与环境均无问题。自动保存、跨刷新恢复、复制问卷、去重人数及跨版本合并不作为已实现；“人数”按答卷份数统计的解释边界保持说明，不声称教师已认可去重能力。

数据库级只插权限/认证、未知旧库迁移、真实第二台设备、防火墙、公网与生产负载未完成验收。历史无Git提交/未推送的叙述是相应任务时状态；本次日志整理未执行新的提交或推送。

正式提交前由项目成员核对姓名、实际贡献及最终Word报告。该人工签核不由AI代写成“已通过”。已有源码和证据支持的部分已如实填写，未核实内容不补造成事实。

## 当前源码摘录（便于对应 Result）

以下摘自2026-10-19核对的当前文件，不是历史初稿的逐字留档，完整实现以文件为准。

### 字符计数

[index.ts](../../packages/shared/src/index.ts)：

```typescript
export const codePointLength = (text: string) => [...text].length;
```

### 清理失效分支

[answers.ts](../../packages/shared/src/answers.ts)：

```typescript
export function cleanBranchAnswers(
  questions: Question[],
  input: Answer[],
): Answer[] {
  const ids = new Set(evaluateAnswers(questions, input).path.map((q) => q.id));
  return input.filter((a) => ids.has(a.questionId));
}
```

### 数字答案转为 Decimal128

[submission.ts](../../apps/api/src/core/submission.ts)：

```typescript
export const storedAnswers = (answers: Answer[]) =>
  answers.map((a) =>
    a.type === "number" ? { ...a, number: Decimal128.fromString(a.number) } : a,
  );
```

[返回项目总 README](../../README.md) · [补充提示词原文](submission-prompts.md)
