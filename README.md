# MongoDB 问卷工作台

正式目录：`D:\大三\数据库\project1`。当前版本 **0.1.0 + 题目编辑增量**，已具备可实际操作的前后端及 MongoDB 持久化。

已完成账号、问卷列表/创建、Q04基本信息修改与Q05整体题目保存。可编辑单选、多选、文本、数字题的选项/约束，以及单选、多选、数字题的跳转规则。未登录不能管理；他人的读取和修改统一404。发布/暂停、正式填写、答卷和统计仍未开放，不显示对应按钮；不自动保存。

## 首次启动（Windows PowerShell）

依赖：Node.js **22.12+ 的22.x**、npm **10.x**；`mongod.exe` 在 PATH。本轮实际环境 Node 22.17.0、npm 10.9.2、MongoDB 8.3.11。无需关系数据库、Docker或额外问卷平台。

```powershell
Set-Location -LiteralPath 'D:\大三\数据库\project1'
npm.cmd ci
npm.cmd run configure
npm.cmd run db:start
npm.cmd run db:init
npm.cmd run build
```

`configure` 仅在不存在时创建 `.env`，生成独立随机 JWT/CURSOR 密钥；已有配置不覆盖。不要把 `.env` 提交或发给他人。仓库含 `.env.example` 说明字段，示例值不可以作为真实密钥使用。

`db:start` 启动隐藏的项目专用 MongoDB：localhost:27018、rs0、`.local/mongodb-rs0-v2`；等待可写 primary。数据和日志持久保留，脚本通过本地标记及进程命令检查实例归属，端口属于未知实例或数据目录来源不明时拒绝操作。重复启动只检查现有专用实例，不重复配置副本集。本地仅绑定回环地址；此配置用于课程本地运行。

`db:init` 初始化 `.env` 指定的 **project1_app_v2** 四集合与索引，支持重复执行；验证器/索引不匹配或发现未知集合时停止，**不执行 collMod、不删库、不迁移未知旧库、不插样例**。历史 `database/init-schema.js` / `examples.js` / `verify-schema.js` 保留，属于旧三集合设计，不用于本版启动。

## 日常开发

分别打开两个终端，在项目根目录执行：

```powershell
npm.cmd run dev:api
```

```powershell
npm.cmd run dev:web
```

访问 **http://localhost:5173**，自行注册，然后登录。创建一份问卷后会进入详情，可返回列表并刷新核对持久化。注册不会自动登录。业务库初始为空，没有内置账号或通用密码；测试账号仅存在独立测试库中。

默认 API 监听127.0.0.1:3000；Vite 将 `/api` 同源代理给 API。使用 `localhost:5173`，不要换成 `127.0.0.1:5173`，以免与 APP_ORIGIN 不一致导致写请求403。所有写请求均校验 Origin 和 X-CSRF-Guard，前端自动附加后者。

停止前后端：在各自终端按 Ctrl+C；MongoDB 保持运行，数据不删除。无需重启数据库即可再次启动前后端。检查数据库日志：`.local/mongodb-rs0-v2/mongod.log`。不应手工删除数据目录来解决启动错误。

## 编辑题目

登录后从“我的问卷”打开一份问卷，即进入编辑页。基本信息与题目分别点击“保存基本信息”“保存题目”，刷新后从MongoDB恢复。说明的2000字符计数和就地超限提示继续保留，题干/选项也沿用Unicode码点计数。

点击“添加单选题/多选题/文本题/数字题”，编辑题干、必答与选项/范围；用上移、下移或删除调整题序。多选的最少/最多相同表示恰好选N个，留空取消该项约束。数字范围和跳转比较值按字符串处理，支持精确小数与科学计数法。

选择题和数字题可添加规则、配置条件及后续目标；规则顺序就是优先级。删除题目/选项或移动后，失效引用会出现在“草稿待完善”中，允许先保存草稿，稍后再修复。未选择目标的规则保存为稳定的待完善引用，不创建假题目。文本题不提供跳转。

上下界颠倒、数量超过选项数、空题干/选项等必须修复才能保存。发生revision冲突时，本地内容保留，页面显示服务器内容供比较；可明确选择保留本地并采用最新修订号后手动保存，或确认放弃本地。前者再次保存题目会整体替换服务器题目，系统不自动合并、重试或覆盖。

编辑专项：`npm.cmd run test:editor`。该命令在新project1_test_editor_*库运行真实API与浏览器检查，不接触业务库；完整范围见[编辑验证记录](docs/editor-verification.md)。原版本化计划不因编辑完成而自动通过。

## 构建后的同源运行

保持数据库已运行，将 `.env` 的 `APP_ORIGIN` 改为 `http://localhost:3000`，再执行：

```powershell
npm.cmd run build
npm.cmd start
```

访问 http://localhost:3000；后端提供构建页面和 API，支持详情页直接刷新。切回 Vite 开发时将 APP_ORIGIN 恢复为 `http://localhost:5173` 并重启 API。端口、数据库名和 URI 需配套；本版本主动限制为本地专用库，不接受未知业务库直连。

## 检查与测试

```powershell
npm.cmd run typecheck
npm.cmd run build
npm.cmd run test:integration
npm.cmd run test:e2e
```

`npm test` 等同本轮集成测试；测试均使用新的 `project1_test_*` 库，**不复用业务库、不清理历史测试数据**。集成测试覆盖13项有意义的子检查；浏览器测试验证注册到退出及刷新持久化。本机优先使用已安装 Edge；无 Edge 的机器可运行 `npx.cmd playwright install chromium`。可通过 PLAYWRIGHT_CHANNEL 指定已安装浏览器。

测试摘要与截图在 `.local/evidence/`；每次运行生成独立测试库，最新摘要会更新，正式本轮证据另存于 [验证记录](docs/implementation-verification.md) 及 `docs/ai/evidence/AI-013-runtime-check.json`。版本化 T22—T35 仍为未来计划，不能用本轮基础测试替代。原AI-013记录的405属于当时未实现修改接口的历史结果；当前Q04/Q05已实现，编辑专项验证他人PATCH/PUT返回404。旧集成测试源码同步修订对应断言，本轮未重复运行旧账号全套测试。

## 工程结构

```text
apps/api/src/       Fastify应用、认证、DTO、四集合验证器与初始化
apps/web/src/       Vue页面、路由、会话和同源API访问
packages/shared/   本轮DTO、固定请求schema和基础规范化函数
scripts/           配置、专用副本集与数据库初始化
tests/             独立数据库集成、真实浏览器流程
database/          原始旧脚本，保留用于历史复核
docs/              需求、决策、设计、接口与AI记录
.local/            本地MongoDB数据、进程日志及测试输出（不提交）
```

直接依赖已精确固定，间接依赖由 `package-lock.json` 锁定；使用 npm ci 复现，不用删除锁文件解决依赖问题。没有引入 ODM、关系数据库或现成问卷框架。

## 设计与记录入口

- [系统总体设计](docs/system-design.md)、[API契约](docs/api.md)、[数据库设计](docs/database-design.md)。
- [初版实现记录](docs/implementation-verification.md)、[当前编辑增量与验证](docs/editor-verification.md)。
- [需求](docs/requirements.md)、[正式决策](docs/decisions.md)、[版本变更计划](docs/versioning-change-plan.md)、[测试计划](docs/test-plan.md)。
- [AI使用方法](docs/ai/README.md)、[真实AI日志](docs/ai/usage-log.md)。
- 原始 `大作业一.docx`、`docx_extract/`、旧 [Schema验证](docs/schema-verification.md) 和 `migration-manifest.json` 保留；历史迁移清单是当时快照，不代表当前新增文件清单。

所有业务数据使用 MongoDB。后续在现有工程中增加版本化能力并审查增量迁移；不删库重建，也不把当前空的 survey_versions 集合当作发布功能已完成。
