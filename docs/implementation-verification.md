# 0.1.0 账号与草稿实现记录

日期：2026-10-16。本轮从设计进入实际实现；以下仅记录当前范围。原有计划、历史12项Schema检查和旧AI日志不改写。

## 已实现范围

- npm workspaces：Vue 3 + Router、Fastify 5、MongoDB 7原生驱动、TypeScript与共享DTO/固定请求schema；直接依赖及间接依赖已锁定。
- A01—A04：注册（不自动登录）、登录、当前账号、退出。异步scrypt盐哈希、2小时JWT HttpOnly cookie、Origin及自定义头CSRF检查；DTO不回传密码哈希或令牌。
- Q01—Q03：自己的问卷列表（签名游标）、创建、未发布草稿详情。身份、ID、公用标识、版本及计数默认值由后端构造。字段沿用validationIssues；空草稿返回NO_QUESTIONS提示。
- Z01/Z02：进程存活、四集合验证器/索引与可写rs0检查；就绪探针不主动修复数据库。
- 注册、登录、问卷列表、创建和只读详情页面；加载、空态、错误、网络结果不确定时先查列表、刷新会话恢复、退出拦截。无未开放功能按钮。
- 项目专用本地rs0及全新project1_app_v2；四集合严格验证器、既有和新增索引。保留三个旧脚本，不修改未知旧库。新入口为npm run db:init。

## 实际验证

| 检查 | 实际结果 | 边界 |
| --- | --- | --- |
| npm run typecheck | 通过 | shared、API、Vue；不代表全部未来模块 |
| npm run build | 通过 | 生成共享声明、API JS、Vue静态资源 |
| npm run test:integration | 13子检查通过；node:test另计父用例，共14项、0失败 | 真实独立测试库，保留数据 |
| npm run test:e2e | 通过，真实无界面Edge | 注册→登录→创建→详情→刷新→列表→刷新→退出→保护路由；另测错误密码 |
| 页面检查 | 320/768/1024/1440无横向溢出、无pageerror；截图已查看，键盘可聚焦 | 不冒充完整WCAG或屏幕阅读器认证 |
| 依赖公告核查 | 修复static插件公告后0项 | 初次安装发现1项，升级到10.1.6后消除；未使用强制自动升级 |

集成检查涵盖注册输出白名单及不自动登录、规范化重名、错误密码/账号统一错误、cookie属性、读取当前账号、CSRF/伪造字段/重复JSON键/重复query/错误方法、未登录、默认草稿与不创建发布快照、签名分页与篡改、跨用户详情404/列表隔离/游标隔离、后端关闭重建后数据仍存在、真实事务回滚探针、退出和未知旧库初始化拒绝。修改接口未实现，访问PATCH返回405；不是已实现修改功能的越权测试。

需求映射：R01/T01账号、R02/T02自己的问卷与权限、R03/T03创建与查看；T35仅覆盖基础账号/草稿隔离，历史发布/答卷/统计部分未执行。T04发布与T22—T35版本专项保持计划状态。

实际库名、执行UTC时间、依赖版本和保留文件hash见[本轮证据](ai/evidence/AI-013-runtime-check.json)。本机北京时间已为2026-10-16，证据中的UTC仍为2026-10-15，属于同一时刻的时区差异。测试账号和草稿保留在project1_test_*库，业务库不导入测试数据；截图为测试样本。

## 当前约束与后续工作

本版只产生从未发布、questions=[]的草稿。Editor的未发布提示适用于这一边界；后续实现Q04/Q05及发布时，必须按契约比较草稿与快照，不能把当前固定true/NO_QUESTIONS逻辑扩用到已发布数据。

survey_versions与responses已建验证器/索引但保持空集合，未实现发布、提交和统计；版本集合目前只接受新publication形状。legacyMigration形状、旧hash兼容、未知旧库迁移、快照只插角色以及版本业务事务仍待后续审查落实，初始化不承担迁移职责。真实事务回滚探针只证明单节点环境支持事务，不能替代发布/提交事务验收。

下一步在现有账号和草稿工程上实现题目编辑，随后正式发布和不可变快照，再实现填写/跳转、事务提交及分版本统计；各阶段按契约增加针对性测试。匿名、重复策略、版本号和历史保留规则不变。当前没有服务器端JWT撤销和刷新令牌，退出仅清cookie；本地无认证MongoDB仅供回环环境运行。

实现引用的官方资料：[Vite运行要求](https://v8.vite.dev/guide/)、[Fastify固定结构验证](https://fastify.dev/docs/latest/Reference/Validation-and-Serialization/)、[MongoDB驱动兼容](https://www.mongodb.com/docs/drivers/compatibility/?driver-language=javascript&javascript-driver-framework=nodejs)。具体版本以锁文件和实际构建为依据。


## 2026-10-16 字符计数修复（AI-014）

前后端共用Unicode码点计数及标题200/说明2000限额；标题按trim后计数，说明原文包含空格和换行。前端移除UTF-16 maxlength，显示当前计数、超出数量、关联输入框的错误状态并禁止超限提交；不截断粘贴内容。后端仍为400 INVALID_REQUEST，通过details.field及TOO_LONG返回具体位置，消息明确指出限额。

本轮类型检查、构建和tests/character-limits.ts专项检查通过，覆盖汉字、emoji、换行混合文本的2000/2001边界，原文保留、无效提交不发请求、修正后可保存及绕过前端的API拒绝。独立测试库保留；未重跑无关旧套件，原记录不改写。复现命令：`node --env-file=.env --import tsx tests/character-limits.ts`（先构建并保持专用副本集运行）。[本轮证据](ai/evidence/AI-014-character-limits.json)。


## 2026-10-16 题目编辑增量（AI-015）

现已实现Q04/Q05及四题型/规则编辑，上述0.1.0“固定空草稿、修改405、题目编辑待实现”等描述为当时实现边界，不再代表最新功能。字符计数修正继续保留；当前范围及11组真实专项结果见[编辑验证](editor-verification.md)。发布、填写、提交、统计、迁移仍未实现；旧证据不改写。
