# MongoDB Schema 验证记录

执行日期：2026-10-15。环境：本机 MongoDB 8.3.11、mongosh 2.11.1，独立测试端口 27271，历史测试数据目录为 `C:\Users\37905\Documents\ChatGPT\数据管理系统\.local\schema-check`，已通过 .gitignore 排除。测试实例完成后已停止，未连接或修改现有业务数据库。后续正式项目目录改为 `D:\大三\数据库\project1`，临时数据库文件不随设计文件迁移，本记录保留原执行事实。

验证脚本：database/verify-schema.js。最终测试库：survey_schema_check_20261015212022，样例保留在本地供核查。

## 测试步骤

在空的 survey_schema_check_ 前缀测试库运行脚本，脚本加载初始化与示例文件，插入正常数据，再尝试违规写入，检查错误码与聚合结果。

| 检查 | 输入或操作 | 预期与实际结果 |
| --- | --- | --- |
| 正常文档 | 插入两个用户、完整问卷、一份答卷 | 成功，通过 |
| 重复初始化 | 再执行初始化脚本 | 验证器一致，数据保留，通过 |
| 用户名唯一 | 新 _id，重复 usernameKey | 错误码 11000，通过 |
| 禁止重复填写 | 同问卷同账号、新请求 ID，repeatAllowed=false | 错误码 11000，通过 |
| 允许重复填写 | repeatAllowed=true，不同 requestId | 两份答卷均保存，通过 |
| 请求去重 | 允许重复但复用同 requestId | 错误码 11000，通过 |
| 策略快照必填 | 删除 repeatAllowed 字段 | 验证错误码 121，通过 |
| 数字类型 | 数字答案写字符串 "17" | 验证错误码 121，通过 |
| 多选去重 | 同一答案重复 swim 选项 | 验证错误码 121，通过 |
| 答案形状 | number 类型却提供 text 字段 | 验证错误码 121，通过 |
| 数字聚合 | 对样例年龄 Decimal128("17") 求平均 | count=1，average=17，通过 |
| 内部匿名关联 | 读取匿名测试答卷 | 内部 respondentId 存在，通过 |

最终 12 项通过。完整最终运行输出：

```text
Schema and indexes ready in survey_schema_check_20261015212022. No sample data inserted.
PASS: valid fixtures accepted
Schema and indexes ready in survey_schema_check_20261015212022. No sample data inserted.
PASS: initialization can run twice
PASS: normalized username unique
PASS: single submission partial unique index
PASS: repeat-enabled accepts distinct requests
PASS: request retries cannot create duplicates
PASS: repeat policy snapshot required
PASS: numeric string rejected
PASS: duplicate multiple-choice option rejected
PASS: answer type and payload must agree
PASS: decimal average uses stored answers
PASS: anonymous fixture retains internal identity
Verification complete: 12 checks. Fixtures retained in survey_schema_check_20261015212022.
```

## 发现的问题及修正

初次本地连接被沙箱以 EACCES 拒绝，获得提权批准后继续连接独立测试实例。第一次数据库执行发现 MongoDB 不接受 `$jsonSchema.required` 为空数组；已修正对象 schema 构造函数：没有必填属性时省略 required，再创建全新测试库重跑通过。失败测试库没有删除。

## 验证边界

这些是数据库 schema、索引与样例聚合测试。未实现或测试：完整注册登录、权限过滤、匿名接口输出、题型业务限制、跳转执行、状态迁移、并发事务、网络重试响应、截止边界。索引的重复写入测试为顺序执行，不冒充并发压力测试。样例直接插入用于结构验证，未走未来后端事务，因此没有同步问卷计数和结构锁定，不能作为业务状态一致性的证据。
