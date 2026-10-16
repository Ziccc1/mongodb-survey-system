# MongoDB 问卷系统 · 第一阶段 1.0.0

项目目录：`D:\大三\数据库\project1`。已在原有账号、草稿、题目编辑和字符计数修正上完成核心闭环；数据持久保存在MongoDB，保留已有数据，不执行未知旧库迁移。

支持：注册登录、创建编辑、四题型及跳转、发布/暂停/关闭、不可变发布版本、登录分享填写、创建者预览、匿名/防重复/幂等事务提交、分版本统计、历史答卷与原文分页。复制问卷、自动保存、断点恢复、跨版本合并及去重人数不实现，页面不显示这些按钮。

## 启动

本机已验证：Node.js 22.17.0、npm 10.9.2、MongoDB 8.3.11；要求Node 22.12+的22.x和npm10，mongod.exe在PATH。依赖精确固定并提交package-lock.json。

首次/恢复工程，在PowerShell执行：

```powershell
Set-Location -LiteralPath 'D:\大三\数据库\project1'
npm.cmd ci
npm.cmd run configure
npm.cmd run db:start
npm.cmd run db:init
npm.cmd run build
```

`configure`不会覆盖已有.env；新配置生成独立随机JWT/CURSOR密钥。`db:start`使用现有项目专用`.local/mongodb-rs0-v2`，localhost:27018、rs0；已运行时检查归属，不删除数据或重配未知实例。`db:init`仅创建缺失集合/索引或验证一致性，不执行collMod、删库或未知迁移。不要用历史database/init-schema.js初始化新版。

两个终端分别执行：

```powershell
npm.cmd run dev:api
```

```powershell
npm.cmd run dev:web
```

访问 **http://localhost:5173**。注册后登录，从“我的问卷”开始。开发时APP_ORIGIN保持`http://localhost:5173`，不要改用127.0.0.1页面地址；Vite代理/api到127.0.0.1:3000，写请求按Origin及X-CSRF-Guard验证。

构建后同源运行：将.env的APP_ORIGIN改为`http://localhost:3000`，运行`npm.cmd start`并访问该地址；切回开发时恢复5173并重启API。不要同时占用同一端口。

本轮交付时已后台启动本地服务，可直接访问；进程信息在`.local/app-processes.json`。前台运行的服务可Ctrl+C停止；不要终止来源不明的node/mongod进程，或通过删除数据库目录解决端口问题。

## 使用顺序

1. 创建问卷，分别“保存基本信息”和“保存题目”。说明最多2000个Unicode码点，输入处显示计数/超限；题干/选项也使用共享规则。
2. 添加单选、多选、文本、数字题；配置必答、选项/数量、文本长度、数字范围和整数。题目和规则上下移动控制顺序，稳定ID在保存刷新后保留。
3. 配置单选、多选、数字跳转，选择后续目标。失效引用可保留草稿，发布前须修复；预览只读取已保存草稿，不保存答卷、不计统计。
4. “发布问卷”后获得分享链接；填写者必须登录，可按策略选择匿名。返回改答会清理失效分支；仅最终路径检查必答。数字以字符串传输，手机号按整数数值处理，不添加11位或号段规则。
5. “确认提交”后显示回执。若结果未知，留在原页面点击“重试原提交”，沿用原key/版本/内容；不要刷新或另发一次。页面会提示离开风险；没有跨刷新断点恢复。
6. 发布后需“暂停收集”才能编辑定义；“重新发布新版本”沿用ID/链接，旧快照和答卷保留。普通保存不生成发布版本。关闭后不提供重新开放操作。
7. 从问卷页进入统计、历史版本或历史答卷。默认最新发布版，可切换历史版；累计、当前发布版、所选版份数分别展示，不混合题目结果、不统计去重人数。

发布/提交结果未知时保留原操作key；编辑revision冲突保留本地并提供服务器内容比较，不自动覆盖。首次发布后匿名/重复策略保持锁定。禁止重复按整份问卷跨版本执行。

## 配置与本地权限边界

.env：MONGODB_URI/MONGODB_DB固定专用库project1_app_v2、rs0；APP_ORIGIN；API_PORT；独立JWT_SECRET/CURSOR_SECRET。客户端不接触数据库连接或密钥，账号密码使用scrypt哈希和HttpOnly JWT cookie；退出清cookie，尚无服务端令牌撤销。

**当前MongoDB仅绑定回环地址，未启用数据库认证。** 仓储只暴露快照find/list/insert，API没有修改/删除历史快照入口；`scripts/app-role.mongosh.js`提供find/insert角色模板，但尚未启用或验收数据库级权限，不能阻止有直接数据库权限的人改库。启用认证时需独立管理员初始化和应用账号分权；当前配置不作为公网部署方案。

## 测试与证据

```powershell
npm.cmd run typecheck
npm.cmd run build
npm.cmd run test:phase1
npm.cmd run test:regression
```

test:phase1按模块运行发布、路径、提交、统计、边界、分页和真实浏览器；test:regression覆盖原账号/编辑/字符计数/登录退出。测试使用全新project1_test_*库并保留，不污染业务库。Playwright优先本机Edge；无Edge时安装Chromium：`npx.cmd playwright install chromium`。

每次模块运行都在`docs/testing/runs/<时间>-<模块>/`保存实际stdout/stderr及退出码；失败输出也保留。[测试记录](docs/testing/phase1-results.md)给出本轮实际通过范围，[截图](docs/testing/screenshots/)为独立测试数据，不是业务数据。

## 交付入口

- [项目报告](docs/project-report.md)：完成范围、核心实现、验证与限制。
- [接口契约](docs/api.md)：唯一详细HTTP协议；23个核心接口已实现，可选复制返回501。
- [总体设计](docs/system-design.md)、[数据库设计](docs/database-design.md)、[正式决策](docs/decisions.md)、[需求](docs/requirements.md)。
- [第一阶段实际测试](docs/testing/phase1-results.md)、[原编辑增量记录](docs/editor-verification.md)（历史记录保留）。
- 原作业、database旧脚本、迁移清单及所有docs/ai记录保留。本轮按用户要求不新增/修改AI使用日志。

源码目录沿用apps/api、apps/web、packages/shared；新核心服务在apps/api/src/core，共享答案/路径在packages/shared/src/answers.ts。四集合结构不变，旧字段和旧数据不删除。后续演化使用增量迁移，不删库重建。

本地Git基线：b8bbb07；完成版本标签：`phase1-v1.0.0`。只保存本地，不推送远程。
