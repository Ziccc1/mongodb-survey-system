# 第一阶段测试用例与实际结果

[← 返回项目总 README](../../README.md)

初次整理：2026-10-18；本次结构整理：2026-10-19（Asia/Shanghai）。项目版本：第一阶段1.0.0及相应界面增量。

## 1 测试说明

本文按课程要求组织创建问卷、添加题目、跳转逻辑、校验、提交问卷和统计六类测试，并保留账号、版本等补充测试。原TC01—TC36编号及证据来源保留；子场景编号只用于拆分原有覆盖，不表示新增执行次数。

**本次仅整理文档，没有重新执行业务测试。** 编号步骤根据原用例、现有源码和证据展开，供理解与复现；实际执行结论仅以各项“实际输出”和链接证据为准，不将全部操作写成人工已经逐步完成。原先84项计划不据此全部标为通过。

本次补充的终端输出直接摘自已保存的日志或人工证据，并标明来源；没有完整原始输出的用例保留说明。PASS行是自动脚本的断言日志，不等同于实际HTTP响应体。

- 环境：Windows PowerShell；Node.js 22.17.0、MongoDB 8.3.11、mongosh 2.11.1；真实Edge/Chromium浏览器和本地rs0单节点副本集。当前安装版本以实际锁文件和运行日志为准。
- 人工执行：项目组用户，账号step_test_a/b/c/d；具体组员姓名由提交人填写。人工过程在2026-10-17至18的会话中完成，不虚构各项精确执行时刻。
- 自动执行：已有Node/TypeScript及Playwright测试。本文引用的一组核心运行的UTC时间为2026-10-17 16:15，对应北京时间2026-10-18 00:15；7个模块result.json均exitCode=0/status=passed。
- 证据等级：**A**为原始自动输出及退出码；**M**为用户贴出的真实数据库输出；**F**为用户操作后的口头反馈，没有独立截图/HTTP记录。用例通过不表示所有输入组合和所有部署环境都已覆盖。
- 数据隔离：人工使用业务库project1_app_v2内明确命名的测试问卷；自动测试使用project1_test_*独立库，不能把两套样例混合核对统计。

自动化记录中的HTTP状态表示相应断言通过，不表示每个请求都留存了完整报文。A为自动化原始输出，M为人工数据库摘录，F为口头反馈。只有反馈的人工检查注明证据限制，不扩展为独立截图或逐项API证据。执行人姓名尚待提交人如实填写，不能由AI代填。

### 1.1 人工样例

| 项目 | 实际配置/数据 |
| --- | --- |
| 账号A/B | step_test_a、step_test_b；测试密码不写入公开结果 |
| 后续账号 | step_test_c填写v2；step_test_d用于截止/关闭访问，是否注册以人工实际记录为准 |
| 主问卷 | 分步测试问卷；ID：6ad391d5931e5a6d6cc547f3 |
| v1设置 | 允许匿名，禁止重复，不设初始截止；5题 |
| Q1 | 必答单选“是否参加运动？”：参加/不参加；不参加跳Q4 |
| Q2 | 必答多选“喜欢哪些运动”：篮球/游泳/跑步；最少1最多2；包含全部篮球和游泳跳Q4 |
| Q3 | 可选文本“活动建议”；实际保存为0—10字，不写成早先计划的3—20字 |
| Q4 | 必答数字“年龄”；整数0—120 |
| Q5 | 可选数字“手机号”；整数、无范围，不附加11位或号段规则 |
| 首份v1答卷 | B选择参加、篮球+游泳，Q3被跳过，年龄20，手机号已脱敏；实际4项答案，anonymous=true |
| 第二份v1 | 用户明确说明用A账号额外提交；未贴出其完整答案，不编造其选项和统计 |
| v2 | 修改Q1题干“你是否经常参加运动？”，增加可选第6题“第二版补充意见”；C成功提交一份 |
| 主问卷最终计数 | v1两份、v2一份，累计3、当前1；数据库实数与维护值一致 |
| 重复问卷 | 分步测试-允许重复；v1；允许重复；同账号两次评分2.5、3.5按人工反馈完成；数据库确认累计2、当前2 |

主问卷用户额外提交了A账号答卷，累计从原先预计1变成2有真实原因，不作为计数缺陷，不为凑预期删除数据。详见[人工证据摘录](manual-execution-evidence.md)。

### 1.2 自动化样例与复现前提

自动样例由[测试harness](../../tests/phase1/harness.ts)和各专项脚本生成，使用独立project1_test_*库。先按[README](../../README.md)安装锁定依赖并启动项目专用副本集。不要清空业务库、复用人工答卷或将[人工验收方案](manual-acceptance.md)中的12题预期数据视为已经执行的5题样例。查询MongoDB前选择对应库，数据库核查不改写记录。

## 2 用例索引

| 类别 | 原用例编号 | 内容 |
| --- | --- | --- |
| 创建问卷测试 | [TC06](#tc06) | 课程必测 |
| 添加题目测试 | [TC07](#tc07) | 课程必测 |
| 跳转逻辑测试 | [TC09](#tc09)、[TC10](#tc10)、[TC11](#tc11)、[TC12](#tc12) | 课程必测 |
| 校验测试 | [TC08](#tc08)、[TC13](#tc13)、[TC14](#tc14)、[TC15](#tc15)、[TC16](#tc16) | 课程必测 |
| 提交问卷测试 | [TC19](#tc19)、[TC20](#tc20)、[TC21](#tc21)、[TC22](#tc22)、[TC23](#tc23)、[TC24](#tc24)、[TC25](#tc25)、[TC26](#tc26) | 课程必测 |
| 统计测试 | [TC30](#tc30)、[TC31](#tc31)、[TC32](#tc32)、[TC33](#tc33)、[TC34](#tc34) | 课程必测 |
| 补充测试 | [TC01](#tc01)、[TC02](#tc02)、[TC03](#tc03)、[TC04](#tc04)、[TC05](#tc05)、[TC17](#tc17)、[TC18](#tc18)、[TC27](#tc27)、[TC28](#tc28)、[TC29](#tc29)、[TC35](#tc35)、[TC36](#tc36) | 账号权限、预览、发布版本、分页与工程回归 |

所有用例统一记录需求、方式、前置、输入、编号步骤、预期输出、实际输出、结果及证据。相同主题跨章节只引用用例编号；日期及执行命令见第10节原始记录。

## 3 创建问卷测试

<a id="tc06"></a>

### TC06 创建问卷草稿并检查保存结果

- **对应需求**：R03。
- **测试方式**：手工页面操作、MongoDB核查及自动回归。
- **前置条件**：账号step_test_a已注册，可正常登录；自动回归使用独立样例。
- **测试输入**：标题/说明，匿名true、重复false、截止null。

**测试步骤**

1. 以step_test_a登录，进入创建问卷页面。
2. 填写标题“分步测试问卷”、说明“用于验证问卷创建与数据库保存”，设置允许匿名、禁止重复、不设截止时间并创建。
3. 查看问卷列表和详情；刷新后检查数据恢复，此流程以已有自动回归为依据。
4. 查询surveys中的对应文档，检查ownerId、status、questions、currentPublishedVersion及submissionCount。

**预期输出**

一个归A所有的草稿，空题目/零答卷/发布指针null。

**实际输出**

用户输出ownerId与A一致，status=draft，questions=[]，submissionCount=0。

**已保存的人工mongosh输出摘录**（直接引用既有证据，非本次重新查询）：

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

来源：[人工证据M02](manual-execution-evidence.md)。保留原记录字段和值，不补写当时未留存的终端提示符或其他字段。

**测试结果**

通过；M02、A08。本项结论来自已归档记录，本次未重新执行。

**执行证据**

[A08](#a08)、[M02](manual-execution-evidence.md#m02-草稿)、[regression.ts](../../tests/phase1/regression.ts)。证据代号含义及执行时间见第10节。

## 4 添加题目测试

<a id="tc07"></a>

### TC07 添加四种题型并保存恢复

- **对应需求**：R06—R09。
- **测试方式**：手工页面操作、MongoDB核查及自动化编辑回归。
- **前置条件**：拥有可编辑草稿；人工采用第1节的5题样例。
- **测试输入**：人工5题及选项、必答、validation。

**测试步骤**

1. 打开草稿，依次添加单选、多选、文本和两道数字题。
2. 配置选项、必答、多选1—2项、文本0—10字、年龄整数0—120及可选整数号码题。
3. 手动保存题目，记录已有题目和选项ID。
4. 刷新页面检查恢复；由编辑回归检查保存恢复及稳定ID。
5. 查询questions，核对5道题及validation；对照M03中的definitionVersion=2、revision=1。

**预期输出**

设置完整恢复，ID稳定，题目嵌入问卷。

**实际输出**

用户贴出5题、选项ID、minChoices=1/maxChoices=2、文本0—10；编辑修订2/CAS修订1。

**已保存的人工题目核查记录**（这是既有证据中的整理表，不是完整mongosh原始输出）：

题目

实际保存后definitionVersion=2、revision=1，questions共5项：

| 题号/id | 实际内容 |
| --- | --- |
| Q1 378a963e-2876-49b0-93d7-c8451b54eda9 | single，必答，参加/不参加 |
| Q2 b593b609-20b9-442e-a5e9-b4b3ab804ee0 | multiple，必答，篮球/游泳/跑步，minChoices=1/maxChoices=2 |
| Q3 d1808ab9-347a-421a-af3a-687845f57302 | text，可选，minLength=0/maxLength=10 |
| Q4 5acb267c-a7f3-4092-b28c-a8b6eca91a32 | number，必答，integerOnly=true，min=Decimal128('0')/max=Decimal128('120') |
| Q5 1d51e75b-b936-494b-b47a-171f93796967 | number，可选，integerOnly=true，无范围 |

来源：[人工证据M03](manual-execution-evidence.md#m03-题目)。没有留存完整原始题目文档，不将表格重新拼成JSON冒充终端结果。

**测试结果**

通过；M03、A08。本项结论来自已归档记录，本次未重新执行。

**执行证据**

[A08](#a08)、[M03](manual-execution-evidence.md#m03-题目)、[regression.ts](../../tests/phase1/regression.ts)。证据代号含义及执行时间见第10节。

## 5 跳转逻辑测试

<a id="tc09"></a>

### TC09 单选条件跳转与跳过必答

- **对应需求**：R10。
- **测试方式**：人工规则核查、试用反馈及自动化逻辑测试。
- **前置条件**：单选题和后续目标题目已定义。
- **测试输入**：Q1不参加。

**测试步骤**

1. 人工样例保存“不参加→Q4年龄”的规则，核对目标稳定ID。
2. 模拟选择不参加，检查路径跳过Q2、Q3。
3. 按flow.ts的独立单选fixture执行路径断言，检查跳过的必答题不产生必答错误。

**预期输出**

跳过Q2/Q3，必答Q2不阻止。

**实际输出**

规则目标正确引用年龄ID；用户反馈预览通过，自动单选跳转断言通过。

**已有自动测试终端输出节选**（测试脚本打印的断言结果，不是HTTP响应体或MongoDB原始文档）：

```text
PASS text Unicode limits, choice boundaries, single jumps and illegal options
```

来源：[output.log](runs/2026-10-17T16-15-11-414Z-flow/output.log)。该段只证明日志所列检查通过，具体输入和断言见本用例引用的测试源码。

**测试结果**

通过；M04、F、A02。本项结论来自已归档记录，本次未重新执行。

**执行证据**

[A02](#a02)、[M04](manual-execution-evidence.md#m04-规则)、[人工反馈边界](manual-execution-evidence.md#m07-人工反馈的证据边界)、[flow.ts](../../tests/phase1/flow.ts)。证据代号含义及执行时间见第10节。

<a id="tc10"></a>

### TC10 多选条件、重叠命中与优先级

- **对应需求**：R11。
- **测试方式**：人工规则和答卷核查、自动化逻辑及API测试。
- **前置条件**：人工规则和自动fixture分别使用，不能合并为同一次人工操作。
- **测试输入**：篮球+游泳；自动a+b同时命中两规则。

子场景预期与证据：TC10-a进入Q4且无Q3答案（M04/M05）；TC10-b两种规则顺序分别产生multi→phone→text和multi→text（A02）；TC10-c正式保存m、n两项答案（A05）。三个样例独立，不把自动规则换序写成人工已执行。

**测试步骤**

1. TC10-a：人工样例将Q2配置为同时包含篮球、游泳时跳Q4；选择两项，查看M04及M05，确认Q3答案未保存。
2. TC10-b：flow.ts中的multi题先配置containsAny[b]→phone，再配置containsAll[a,b]→text；输入a、b及合法号码，断言路径为multi、phone、text。
3. TC10-b：交换两条规则顺序，沿用相同输入，断言路径变为multi、text。
4. TC10-c：edges.ts另建多规则问卷实际提交a、b及数字0，检查成功和持久化答案只含m、n。

**预期输出**

第一条匹配生效，跳到目标。

**实际输出**

人工规则正确且正式答卷中Q3缺省；自动换规则顺序得到不同预期路径。

**已有自动测试终端输出节选**（测试脚本打印的断言结果，不是HTTP响应体或MongoDB原始文档）：

```text
PASS both multiple rules match: first rule wins and skipped mandatory is not checked
PASS changing priority changes the path deterministically
```

来源：[output.log](runs/2026-10-17T16-15-11-414Z-flow/output.log)。该段只证明日志所列检查通过，具体输入和断言见本用例引用的测试源码。

**已有自动测试终端输出节选**（测试脚本打印的断言结果，不是HTTP响应体或MongoDB原始文档）：

```text
PASS actual submitted multi-rule overlap uses first matching rule and accepts numeric zero
```

来源：[output.log](runs/2026-10-17T16-15-15-032Z-edges/output.log)。该段只证明日志所列检查通过，具体输入和断言见本用例引用的测试源码。

**测试结果**

通过；M04/M05、A02/A05。本项结论来自已归档记录，本次未重新执行。

**执行证据**

[A02](#a02)、[A05](#a05)、[M04](manual-execution-evidence.md#m04-规则)、[M05](manual-execution-evidence.md#m05-第一份正式答卷)、[flow.ts](../../tests/phase1/flow.ts)、[edges.ts](../../tests/phase1/edges.ts)。证据代号含义及执行时间见第10节。

<a id="tc11"></a>

### TC11 数字条件跳转与零值

- **对应需求**：R12。
- **测试方式**：自动化逻辑、边界API和浏览器测试。
- **前置条件**：使用各脚本中已配置数字规则的独立样例。
- **测试输入**：自动数字0、阈值比较及手机号题路径。

**测试步骤**

1. 在flow.ts中向phone题提供数字0，检查eq 0规则通向text。
2. 对照edges.ts提交多选重叠样例中的数字0，检查不被视为未答。
3. 按浏览器专项中的数字条件和分页步骤检查展示路径；阈值与其他小数输入以对应源码fixture为准，不混用人工年龄问卷。

**预期输出**

数字条件决定目标，0有效。

**实际输出**

自动路径、实际提交及分页浏览器数字跳转通过。

**已有自动测试终端输出节选**（测试脚本打印的断言结果，不是HTTP响应体或MongoDB原始文档）：

```text
PASS actual submitted multi-rule overlap uses first matching rule and accepts numeric zero
```

来源：[output.log](runs/2026-10-17T16-15-15-032Z-edges/output.log)。该段只证明日志所列检查通过，具体输入和断言见本用例引用的测试源码。

**测试结果**

通过；A02/A05/A07。本项结论来自已归档记录，本次未重新执行。

**执行证据**

[A02](#a02)、[A05](#a05)、[A07](#a07)、[flow.ts](../../tests/phase1/flow.ts)。证据代号含义及执行时间见第10节。

<a id="tc12"></a>

### TC12 返回改答与失效分支清理

- **对应需求**：R13。
- **测试方式**：自动化共享逻辑和浏览器测试。
- **前置条件**：已有可切换分支的回答状态。
- **测试输入**：合法分支后改为跳过；再改回。

**测试步骤**

1. 在flow.ts中先回答multi=a、required=旧答、phone=0，保留原分支答案。
2. 将multi改为b并调用分支清理，检查required答案被移除。
3. 再改回a，检查重新可达的required产生REQUIRED错误。
4. 浏览器专项返回上一页改答，检查仍有效答案保留、失效答案清理及路径缩短后无空白页。

**预期输出**

清理失效分支，重新经过的必答重检，其他答案保留。

**实际输出**

自动纯函数与真实分页浏览器分别验证清理、重检、页面缩减不空白。

**已有自动测试终端输出节选**（测试脚本打印的断言结果，不是HTTP响应体或MongoDB原始文档）：

```text
PASS returning to change answers deletes invalid branch values and rechecks newly reachable required questions
```

来源：[output.log](runs/2026-10-17T16-15-11-414Z-flow/output.log)。该段只证明日志所列检查通过，具体输入和断言见本用例引用的测试源码。

**测试结果**

通过；A02/A07。本项结论来自已归档记录，本次未重新执行。

**执行证据**

[A02](#a02)、[A07](#a07)、[flow.ts](../../tests/phase1/flow.ts)。证据代号含义及执行时间见第10节。

## 6 校验测试

<a id="tc08"></a>

### TC08 数字配置与答案的BSON类型

- **对应需求**：R09。
- **测试方式**：MongoDB人工核查及自动化提交测试。
- **前置条件**：数字题边界配置已保存；正式答案测试使用已发布的独立问卷。
- **测试输入**：年龄0—120；年龄20；合成手机号13800138000。

**测试步骤**

1. 查询年龄题的min、max字段，检查Decimal128类型。
2. 查看人工年龄20的答案类型。
3. 自动样例实际提交13800138000并查询responses，检查精确值和BSON类型。
4. 确认没有存为普通字符串或32位整数；人工真实号码继续脱敏。

**预期输出**

Decimal128，不存字符串或32位截断。

**实际输出**

人工年龄边界及答案为Decimal128；自动实际提交并断言合成手机号精确Decimal128。

**已有自动测试终端输出节选**（测试脚本打印的断言结果，不是HTTP响应体或MongoDB原始文档）：

```text
PASS phone exact Decimal128 13800138000, fraction/letters rejected, mandatory empty rejected, optional empty accepted, ordinary decimals kept
```

来源：[output.log](runs/2026-10-17T16-15-11-638Z-submit/output.log)。该段只证明日志所列检查通过，具体输入和断言见本用例引用的测试源码。

**测试结果**

通过；M03/M05、A03。本项结论来自已归档记录，本次未重新执行。

**执行证据**

[A03](#a03)、[M03](manual-execution-evidence.md#m03-题目)、[M05](manual-execution-evidence.md#m05-第一份正式答卷)、[submit.ts](../../tests/phase1/submit.ts)。证据代号含义及执行时间见第10节。

<a id="tc13"></a>

### TC13 多选数量限制

- **对应需求**：R07。
- **测试方式**：人工边界反馈及自动化API测试。
- **前置条件**：人工多选限制1—2项；自动edges样例要求恰好2项。
- **测试输入**：人工篮球等；自动A/B/C。

**测试步骤**

1. TC13-a：人工样例分别选择0、1、2、3项，检查必答及数量边界；此部分结果来源为人工反馈。
2. TC13-b：自动样例使用minChoices=maxChoices=2，保持其他题合法，提交a+b，检查201。
3. TC13-b：分别改为a和a+b+c，以新的提交key请求，检查422且包含CHOICE_COUNT。
4. 通过共享逻辑测试另检查必答多选空数组产生REQUIRED。

**预期输出**

必答空、超限、少选拒绝，边界通过。

**实际输出**

用户反馈边界完成；自动恰好2项正常提交，1/3项422 CHOICE_COUNT断言通过。

**已有自动测试终端输出节选**（测试脚本打印的断言结果，不是HTTP响应体或MongoDB原始文档）：

```text
PASS four-type over/under/required/option rejection and anonymous-policy enforcement
```

来源：[output.log](runs/2026-10-17T16-15-15-032Z-edges/output.log)。该段只证明日志所列检查通过，具体输入和断言见本用例引用的测试源码。

**测试结果**

通过；F、A05。本项结论来自已归档记录，本次未重新执行。

**执行证据**

[A05](#a05)、[人工反馈边界](manual-execution-evidence.md#m07-人工反馈的证据边界)、[edges.ts](../../tests/phase1/edges.ts)、[edges.ts](../../tests/phase1/edges.ts)。证据代号含义及执行时间见第10节。

<a id="tc14"></a>

### TC14 文本长度与Unicode计数

- **对应需求**：R08。
- **测试方式**：人工边界反馈及自动化API测试。
- **前置条件**：人工文本最多10码点；自动edges样例要求2—3码点。
- **测试输入**：人工10/11字；自动2—3码点用😀汉、😀汉a、汉、汉字太长。

**测试步骤**

1. TC14-a：人工样例分别输入10字、11字，检查边界和超限提示；此部分依据人工反馈。
2. TC14-b：自动样例分别提交😀汉、😀汉a，保持其他题合法，检查2、3码点边界被接受。
3. TC14-b：分别提交汉和汉字太长，检查422及TEXT_LENGTH，确认表情按码点计数。

**预期输出**

边界通过，越界TEXT_LENGTH，码点口径一致。

**实际输出**

人工反馈完成；自动边界提交成功、1/4码点拒绝。

**已有自动测试终端输出节选**（测试脚本打印的断言结果，不是HTTP响应体或MongoDB原始文档）：

```text
PASS inclusive Unicode text and exact decimal lower/upper answer boundaries
PASS four-type over/under/required/option rejection and anonymous-policy enforcement
```

来源：[output.log](runs/2026-10-17T16-15-15-032Z-edges/output.log)。该段只证明日志所列检查通过，具体输入和断言见本用例引用的测试源码。

**测试结果**

通过；F、A05。本项结论来自已归档记录，本次未重新执行。

**执行证据**

[A05](#a05)、[人工反馈边界](manual-execution-evidence.md#m07-人工反馈的证据边界)、[edges.ts](../../tests/phase1/edges.ts)。证据代号含义及执行时间见第10节。

<a id="tc15"></a>

### TC15 数字范围、整数和普通小数边界

- **对应需求**：R09。
- **测试方式**：人工边界反馈及自动化API测试。
- **前置条件**：人工年龄为整数0—120；自动小数题范围1.25—2.75。
- **测试输入**：人工-1/0/120/121/20.5；自动1.25/2.75及1.249/2.751。

**测试步骤**

1. TC15-a：人工年龄依次检查-1、0、120、121、20.5；合法边界通过，越界及小数拒绝，结果依据人工反馈。
2. TC15-b：自动样例保持其他题合法，分别提交1.25和2.75，检查成功。
3. TC15-b：分别提交1.249和2.751，检查422及NUMBER_RANGE，确认未通过四舍五入或截断变为合法。

**预期输出**

整数/范围约束生效；允许的小数不被截断。

**实际输出**

人工反馈完成；自动合法上下界成功、越界422 NUMBER_RANGE。

**已有自动测试终端输出节选**（测试脚本打印的断言结果，不是HTTP响应体或MongoDB原始文档）：

```text
PASS inclusive Unicode text and exact decimal lower/upper answer boundaries
PASS four-type over/under/required/option rejection and anonymous-policy enforcement
```

来源：[output.log](runs/2026-10-17T16-15-15-032Z-edges/output.log)。该段只证明日志所列检查通过，具体输入和断言见本用例引用的测试源码。

**测试结果**

通过；F、A05。本项结论来自已归档记录，本次未重新执行。

**执行证据**

[A05](#a05)、[人工反馈边界](manual-execution-evidence.md#m07-人工反馈的证据边界)、[edges.ts](../../tests/phase1/edges.ts)。证据代号含义及执行时间见第10节。

<a id="tc16"></a>

### TC16 整数号码与可选空值

- **对应需求**：R09。
- **测试方式**：自动化逻辑、提交、历史API及浏览器测试。
- **前置条件**：号码题启用integerOnly，另备可选号码题和允许小数的普通数字题。
- **测试输入**：13800138000、13800138000.5、abc、空值。

**测试步骤**

1. TC16-a：提交13800138000，检查成功、Decimal128精确存储及历史DTO和页面精确显示。
2. TC16-b：分别输入13800138000.5和abc，检查拒绝。
3. TC16-c：必答号码留空检查REQUIRED；可选号码留空检查通过。
4. TC16-d：普通数字题允许小数时输入1.25，检查通过，避免全部数字被限制为整数。

**预期输出**

正常号码精确保存；小数/字母拒绝；空值按required处理。

**实际输出**

自动提交、存储、历史DTO和浏览器检查通过，普通数字1.25仍允许。

**已有自动测试终端输出节选**（测试脚本打印的断言结果，不是HTTP响应体或MongoDB原始文档）：

```text
PASS phone exact Decimal128 13800138000, fraction/letters rejected, mandatory empty rejected, optional empty accepted, ordinary decimals kept
```

来源：[output.log](runs/2026-10-17T16-15-11-638Z-submit/output.log)。该段只证明日志所列检查通过，具体输入和断言见本用例引用的测试源码。

**测试结果**

通过；A02/A03/A04/A07。本项结论来自已归档记录，本次未重新执行。

**执行证据**

[A02](#a02)、[A03](#a03)、[A04](#a04)、[A07](#a07)、[submit.ts](../../tests/phase1/submit.ts)。证据代号含义及执行时间见第10节。

## 7 提交问卷测试

<a id="tc19"></a>

### TC19 正式提交与有效答案保存

- **对应需求**：R14。
- **测试方式**：人工页面操作和数据库核查、自动化API及浏览器测试。
- **前置条件**：主问卷v1已发布，B未提交；自动测试采用独立合成数据。
- **测试输入**：参加、篮球+游泳、年龄20、合成/人工号码。

**测试步骤**

1. B经分享链接登录，选择参加、篮球+游泳、年龄20，选择匿名并填写号码。
2. 确认Q3因规则跳过后提交，记录回执。
3. 查询responses，核对发布号1、anonymous及答案题目ID。
4. 核对有效答案共4项且无Q3；号码原值不写入公开文档。
5. 自动专项使用合成号码，另检查数据库持久化和成功回执。

**预期输出**

每次成功提交独立答卷，引用v1，仅保留有效非空答案。

**实际输出**

用户贴出v1匿名答卷、4项答案，Q3因跳转未存；自动闭环保存通过。

**已保存的人工答卷核查记录**（既有证据摘要，非完整原始响应；号码保持脱敏）：

第一份正式答卷

- _id=6ad3943b931e5a6d6cc547f5；surveyDefinitionVersion=1；schemaVersion=2；anonymous=true；repeatAllowed=false；payloadHashVersion=2。
- 实际答案：Q1参加、Q2篮球与游泳、Q4 Decimal128('20')、Q5 Decimal128类型的手机号（已脱敏）。
- Q3因多选命中跳转未保存，实际4项答案，不把先前建议的“只选篮球、填写建议”当实际输入。
- 提交后问卷published/currentPublishedVersion=1/submissionCount=1/currentVersionSubmissionCount=1。更早的responses=0是预览阶段查询，不是提交后记录。

来源：[人工证据M05](manual-execution-evidence.md#m05-第一份正式答卷)。该记录支持版本、有效答案及计数检查，不补造完整答卷JSON。

**已有自动测试终端输出节选**（测试脚本打印的断言结果，不是HTTP响应体或MongoDB原始文档）：

```text
PASS configured runtime/publication share origin; public asset whitelist; real paged submit plus dropped response/same-key retry yields one exact Decimal128 response
```

来源：[output.log](runs/2026-10-17T16-15-18-162Z-browser/output.log)。该段只证明日志所列检查通过，具体输入和断言见本用例引用的测试源码。

**测试结果**

通过；M05、A03/A07。本项结论来自已归档记录，本次未重新执行。

**执行证据**

[A03](#a03)、[A07](#a07)、[M05](manual-execution-evidence.md#m05-第一份正式答卷)、[submit.ts](../../tests/phase1/submit.ts)。证据代号含义及执行时间见第10节。

<a id="tc20"></a>

### TC20 匿名输出白名单及匿名策略

- **对应需求**：R16。
- **测试方式**：人工标记核查及自动化管理API测试。
- **前置条件**：已存在匿名答卷，另备不允许匿名的独立问卷。
- **测试输入**：anonymous=true；内部账号由认证决定。

**测试步骤**

1. TC20-a：读取管理答卷、统计和历史响应，检查不含respondentId、username、requestId、payloadHash等内部字段。
2. TC20-a：在数据库内部核查匿名标记和账号关联，区分内部保存与对外泄露。
3. TC20-b：对不允许匿名的问卷发送anonymous=true，检查ANONYMOUS_NOT_ALLOWED。

**预期输出**

创建者接口无账号/request/hash；数据库可内部关联。

**实际输出**

匿名白名单和伪造匿名拒绝断言通过；人工匿名标记为true。DB内部查询不等于身份泄露。

**已有自动测试终端输出节选**（测试脚本打印的断言结果，不是HTTP响应体或MongoDB原始文档）：

```text
PASS text/number raw pagination, signed query-bound cursors and anonymous whitelist
```

来源：[output.log](runs/2026-10-17T16-15-13-328Z-statistics/output.log)。该段只证明日志所列检查通过，具体输入和断言见本用例引用的测试源码。

**已有自动测试终端输出节选**（测试脚本打印的断言结果，不是HTTP响应体或MongoDB原始文档）：

```text
PASS four-type over/under/required/option rejection and anonymous-policy enforcement
```

来源：[output.log](runs/2026-10-17T16-15-15-032Z-edges/output.log)。该段只证明日志所列检查通过，具体输入和断言见本用例引用的测试源码。

**测试结果**

通过；M05、A04/A05。本项结论来自已归档记录，本次未重新执行。

**执行证据**

[A04](#a04)、[A05](#a05)、[M05](manual-execution-evidence.md#m05-第一份正式答卷)、[statistics.ts](../../tests/phase1/statistics.ts)。证据代号含义及执行时间见第10节。

<a id="tc21"></a>

### TC21 问卷级禁止重复填写

- **对应需求**：R17/R29。
- **测试方式**：人工再次提交反馈及自动化提交测试。
- **前置条件**：问卷allowRepeat=false，同一账号已有成功答卷。
- **测试输入**：同账号、新操作key、不同发布版本。

**测试步骤**

1. 使用该账号和新的提交key再次提交，检查拒绝。
2. 暂停修改并发布v2，再以同账号、新key提交，检查不能通过换版本绕过限制。
3. 核对responses和计数没有新增；不同版本及请求数据以submit.ts为准，人工反馈不替代完整跨版网络证据。

**预期输出**

按整份问卷限一次，不能换版本绕过。

**实际输出**

用户反馈再次提交拒绝；版本方案人工继续完成；自动防重与旧版资格检查通过。

**已有自动测试终端输出节选**（测试脚本打印的断言结果，不是HTTP响应体或MongoDB原始文档）：

```text
PASS concurrent repeat-forbidden submissions: one answer, one count, other denied
```

来源：[output.log](runs/2026-10-17T16-15-11-638Z-submit/output.log)。该段只证明日志所列检查通过，具体输入和断言见本用例引用的测试源码。

注意：上述节选直接说明同账号并发防重；不能单凭这一行额外推导跨版本重复策略的每个HTTP响应，其他覆盖仍以原用例和完整脚本为准。

**测试结果**

通过；F、A03。本项结论来自已归档记录，本次未重新执行。

**执行证据**

[A03](#a03)、[人工反馈边界](manual-execution-evidence.md#m07-人工反馈的证据边界)、[submit.ts](../../tests/phase1/submit.ts)。证据代号含义及执行时间见第10节。

<a id="tc22"></a>

### TC22 允许重复时主动再次填写

- **对应需求**：R17。
- **测试方式**：人工操作反馈、数据库核查及自动化提交测试。
- **前置条件**：独立问卷允许重复填写，使用同一账号。
- **测试输入**：评分2.5、3.5，不同提交key。

**测试步骤**

1. 使用新提交key提交评分2.5。
2. 主动再次填写，使用另一个key提交评分3.5。
3. 查询实际答卷份数及维护计数，检查均为2；均值数学预期为3，但M08只证明计数，不能单凭它证明均值页面。
4. 自动提交样例另验证允许重复策略，不与网络重试混同。

**预期输出**

两份答卷，累计/当前各2；均值3（若展示）。

**实际输出**

用户反馈完成，最终数据库actual/stored均2；不把网络重试计作主动重复。

**测试结果**

通过；F、M08、A03/A05。本项结论来自已归档记录，本次未重新执行。

**执行证据**

[A03](#a03)、[A05](#a05)、[M08](manual-execution-evidence.md#m08-最终计数一致性用户原始输出)、[人工反馈边界](manual-execution-evidence.md#m07-人工反馈的证据边界)、[submit.ts](../../tests/phase1/submit.ts)。证据代号含义及执行时间见第10节。

<a id="tc23"></a>

### TC23 并发防重与独立用户写入

- **对应需求**：R15/R17。
- **测试方式**：自动化并发API及浏览器测试。
- **前置条件**：分别准备禁重复、允许重复问卷，记录各自初始计数。
- **测试输入**：禁重复同账号新key；允许重复时同key并发。

子场景预期与证据：TC23-a仅新增一份答卷（A03）；TC23-b两个响应共用回执且只写一次（A05）；TC23-c角色内容独立（A07），没有据此证明真实多设备同时提交。

**测试步骤**

1. TC23-a：禁重复问卷由同一账号以不同新key并发请求，等待两者完成，核对只新增一份。
2. TC23-b：允许重复问卷对同一个新key及同body并发请求；edges.ts断言状态为200、201且receiptId相同。
3. TC23-c：浏览器使用两个独立角色完成填写，检查内容互不覆盖；该结果不等同于两台真实设备并发或生产压测。

**预期输出**

不覆盖；禁重复只一份；同key只一份回执/计数。

**实际输出**

自动同账号并发防重及允许重复的同key并发断言通过；浏览器两个独立角色闭环通过。

**已有自动测试终端输出节选**（测试脚本打印的断言结果，不是HTTP响应体或MongoDB原始文档）：

```text
PASS concurrent repeat-forbidden submissions: one answer, one count, other denied
```

来源：[output.log](runs/2026-10-17T16-15-11-638Z-submit/output.log)。该段只证明日志所列检查通过，具体输入和断言见本用例引用的测试源码。

**已有自动测试终端输出节选**（测试脚本打印的断言结果，不是HTTP响应体或MongoDB原始文档）：

```text
PASS fresh concurrent same-key submissions under allowRepeat=true share one receipt
```

来源：[output.log](runs/2026-10-17T16-15-15-032Z-edges/output.log)。该段只证明日志所列检查通过，具体输入和断言见本用例引用的测试源码。

**测试结果**

通过；A03/A05/A07；不等同于生产负载测试。本项结论来自已归档记录，本次未重新执行。

**执行证据**

[A03](#a03)、[A05](#a05)、[A07](#a07)、[edges.ts](../../tests/phase1/edges.ts)、[edges.ts](../../tests/phase1/edges.ts)。证据代号含义及执行时间见第10节。

<a id="tc24"></a>

### TC24 响应丢失重试及同key异内容

- **对应需求**：R14/R28。
- **测试方式**：自动化API和真实浏览器测试。
- **前置条件**：保留一次合法请求的完整body与提交key。
- **测试输入**：原key/原body；同key不同body。

**测试步骤**

1. TC24-a：由浏览器代理在服务器提交成功后丢弃响应，使页面未收到回执。
2. TC24-a：在原页沿用同key和原内容重试，检查返回原回执，数据库仅一份答卷及一次计数。
3. TC24-b：自动API改动原body但沿用同key，检查409冲突且无新增。

**预期输出**

原回执200、无新增；不同内容409。

**实际输出**

自动API及真实浏览器主动丢响应后重试，数据库仅一份答卷/计数。

**已有自动测试终端输出节选**（测试脚本打印的断言结果，不是HTTP响应体或MongoDB原始文档）：

```text
PASS discarded receipt/network retry semantics and same-key content conflict; no extra counter
```

来源：[output.log](runs/2026-10-17T16-15-11-638Z-submit/output.log)。该段只证明日志所列检查通过，具体输入和断言见本用例引用的测试源码。

**测试结果**

通过；A03/A07。本项结论来自已归档记录，本次未重新执行。

**执行证据**

[A03](#a03)、[A07](#a07)、[submit.ts](../../tests/phase1/submit.ts)。证据代号含义及执行时间见第10节。

<a id="tc25"></a>

### TC25 暂停、关闭和截止后的提交资格

- **对应需求**：R05/R28。
- **测试方式**：自动化提交与浏览器测试，人工反馈辅助。
- **前置条件**：各独立样例已保存一份成功请求的key和原body；截止使用脚本可控设置。
- **测试输入**：新key与旧成功key。

TC25-a、b、c分别检查暂停、关闭、截止；每个场景的预期均为新请求拒绝、旧成功请求返回原结果、计数不变。自动执行依据A03/A07；人工最终关闭状态缺独立截图，只保留反馈。

**测试步骤**

1. TC25-a：暂停后以新key提交，检查拒绝；重放旧成功请求，检查原回执。
2. TC25-b：关闭后分别发送新提交和旧成功请求，检查拒新且允许原结果重放。
3. TC25-c：将截止设为已到期，按服务器时间检查新提交被拒，原成功请求仍可重放。
4. 分别核对答卷和计数未重复增加；人工关闭缺最终截图，不补造closed查询。

**预期输出**

新提交拒绝；已成功请求仍返回原回执。

**实际输出**

人工最后口头确认截止/关闭完成；自动各状态与截止拒新、旧请求重放通过。

**已有自动测试终端输出节选**（测试脚本打印的断言结果，不是HTTP响应体或MongoDB原始文档）：

```text
PASS paused/old-version/closed new requests denied; successful old request always replays
PASS cutoff uses server time and no answer is saved
```

来源：[output.log](runs/2026-10-17T16-15-11-638Z-submit/output.log)。该段只证明日志所列检查通过，具体输入和断言见本用例引用的测试源码。

**测试结果**

通过（自动为主）；F、A03/A07。末次可见人工查询仍为published，之后关闭只有口头确认。本项结论来自已归档记录，本次未重新执行。

**执行证据**

[A03](#a03)、[A07](#a07)、[人工反馈边界](manual-execution-evidence.md#m07-人工反馈的证据边界)、[submit.ts](../../tests/phase1/submit.ts)。证据代号含义及执行时间见第10节。

<a id="tc26"></a>

### TC26 发布与提交事务失败回滚

- **对应需求**：R23/R14。
- **测试方式**：独立测试库中的真实MongoDB事务测试。
- **前置条件**：使用支持事务的副本集及测试注入点，禁止对业务库注入故障。
- **测试输入**：独立库真实事务、受控抛错。

TC26-a验证发布快照与指针共同回滚（A01）；TC26-b验证答卷与两项计数共同回滚（A03）。

**测试步骤**

1. TC26-a：记录发布前状态，在插入快照后的事务步骤注入受控异常。
2. TC26-a：事务结束后检查没有新增孤立快照，指针和计数保持原状态。
3. TC26-b：记录答卷与两个计数，在答卷插入后的事务步骤注入受控异常。
4. TC26-b：检查答卷、累计计数和当前版本计数共同回滚；不能仅以抛错作为通过依据。

**预期输出**

无孤立快照/悬空指针；答卷与两个计数全回滚。

**实际输出**

自动真实事务回滚断言通过，非mock数据库。

**已有自动测试终端输出节选**（测试脚本打印的断言结果，不是HTTP响应体或MongoDB原始文档）：

```text
PASS real transaction rollback after inserted snapshot leaves no orphan or pointer
```

来源：[output.log](runs/2026-10-17T16-15-09-829Z-publish/output.log)。该段只证明日志所列检查通过，具体输入和断言见本用例引用的测试源码。

**已有自动测试终端输出节选**（测试脚本打印的断言结果，不是HTTP响应体或MongoDB原始文档）：

```text
PASS controlled real transaction failure rolls back inserted response and both counters
```

来源：[output.log](runs/2026-10-17T16-15-11-638Z-submit/output.log)。该段只证明日志所列检查通过，具体输入和断言见本用例引用的测试源码。

**测试结果**

通过；A01/A03。本项结论来自已归档记录，本次未重新执行。

**执行证据**

[A01](#a01)、[A03](#a03)、[publish.ts](../../tests/phase1/publish.ts)、[submit.ts](../../tests/phase1/submit.ts)。证据代号含义及执行时间见第10节。

## 8 统计测试

<a id="tc30"></a>

### TC30 固定答卷的单选、多选统计

- **对应需求**：R18/R19/R21。
- **测试方式**：自动化API及手算核对，人工统计反馈辅助。
- **前置条件**：使用statistics.ts四题fixture，允许重复，已发布v1；完整输入见本用例数据表。
- **测试输入**：自动单选2/1/0；多选2/2/0，有效3份。

固定输入来自[statistics.ts](../../tests/phase1/statistics.ts)：单选s选项yes/no/zero，多选m选项a/b/c，文本t和数字n均可选；无跳转、允许匿名和重复。每行使用不同提交key，同一测试账号提交。

| 答卷 | 单选s | 多选m | 文本t | 数字n |
| --- | --- | --- | --- | --- |
| 1 | yes | a、b | 第一条 | 0 |
| 2 | yes | b | 第二条 | 10 |
| 3 | no | a | 未回答 | 未回答 |

这组数据仅属于独立自动测试，不对应人工主问卷。TC31沿用此输入。

**测试步骤**

1. 先读取空问卷统计，确认所有选项存在且次数为0。
2. 以三个不同提交key依次提交本用例表中的三份答卷。
3. 读取整卷统计，核对单选2/1/0、多选2/2/0及多选answeredCount=3。
4. 按单题查询方式核对选择统计；单题/整卷对应覆盖需结合链接脚本与记录，不用人工未知答案反推样本。
5. 手算多选总选择4次，回答3份；每个选项占比的数学预期为2/3、2/3、0。图表显示精度另见statistics-charts.md，不把本API断言当作显示格式检查。

**预期输出**

选择次数准确、0次保留；多选总次数可大于份数。

**实际输出**

手算断言通过；人工统计反馈通过，未臆造人工第二份答卷的具体选项。

**已有自动测试终端输出节选**（测试脚本打印的断言结果，不是HTTP响应体或MongoDB原始文档）：

```text
PASS hand-calculated 3 answers: single 2/1/0, multi 2/2/0, text 2, number mean (0+10)/2=5
```

来源：[output.log](runs/2026-10-17T16-15-13-328Z-statistics/output.log)。该段只证明日志所列检查通过，具体输入和断言见本用例引用的测试源码。

对应统计模块的历史执行结果文件：

```json
{
  "name": "statistics",
  "start": "2026-10-17T16:15:13.330Z",
  "finished": "2026-10-17T16:15:14.974Z",
  "command": [
    "node",
    "--env-file=.env",
    "--import",
    "tsx",
    "tests/phase1/statistics.ts"
  ],
  "exitCode": 0,
  "status": "passed"
}
```

来源：[result.json](runs/2026-10-17T16-15-13-328Z-statistics/result.json)。这是整次模块执行的退出状态，不是统计接口响应。

**测试结果**

通过；F、A04。本项结论来自已归档记录，本次未重新执行。

**执行证据**

[A04](#a04)、[人工反馈边界](manual-execution-evidence.md#m07-人工反馈的证据边界)、[statistics.ts](../../tests/phase1/statistics.ts)。证据代号含义及执行时间见第10节。

<a id="tc31"></a>

### TC31 文本内容查询与数字平均值

- **对应需求**：R20。
- **测试方式**：自动化API及手算核对。
- **前置条件**：沿用TC30的固定三份答卷。
- **测试输入**：数字0、10；第一条/第二条文本。

**测试步骤**

1. 读取文本题统计，检查有效回答2份。
2. 分页读取文本填写内容，核对第一条、第二条及游标。
3. 读取数字统计，检查有效数字为0、10，answeredCount=2。
4. 计算(0+10)/2=5并与average字符串5比较，第三份未回答不按0计入。

**预期输出**

均值(0+10)/2=5，未答不按0；文本可查。

**实际输出**

answeredCount、average=5及分页原文断言通过。

**已有自动测试终端输出节选**（测试脚本打印的断言结果，不是HTTP响应体或MongoDB原始文档）：

```text
PASS hand-calculated 3 answers: single 2/1/0, multi 2/2/0, text 2, number mean (0+10)/2=5
PASS text/number raw pagination, signed query-bound cursors and anonymous whitelist
```

来源：[output.log](runs/2026-10-17T16-15-13-328Z-statistics/output.log)。该段只证明日志所列检查通过，具体输入和断言见本用例引用的测试源码。

**测试结果**

通过；A04。本项结论来自已归档记录，本次未重新执行。

**执行证据**

[A04](#a04)、[statistics.ts](../../tests/phase1/statistics.ts)。证据代号含义及执行时间见第10节。

<a id="tc32"></a>

### TC32 空数据与数字零的统计

- **对应需求**：R20/R21。
- **测试方式**：自动化API测试。
- **前置条件**：statistics.ts按阶段查询，不能把三个状态混为一次请求。
- **测试输入**：空数组、缺省答案、number=0。

**测试步骤**

1. TC32-a：v1尚无答卷时读取统计，检查计数0、选项全0、数字average=null。
2. TC32-b：重新发布v2后只提交单选、不提供数字，检查数字单题均值为null。
3. TC32-c：在v2再提交一份数字0的答案，检查均值字符串0；累计/当前/所选计数为5/2/2。

**预期输出**

空选项0；平均null；只有0时均值0。

**实际输出**

自动三种情形全部通过。

**已有自动测试终端输出节选**（测试脚本打印的断言结果，不是HTTP响应体或MongoDB原始文档）：

```text
PASS no-response statistics retain question/zero-option rows and null average
PASS no effective numeric answer yields null; zero-only numeric answer yields 0; cumulative/current/selected counts 5/2/2
```

来源：[output.log](runs/2026-10-17T16-15-13-328Z-statistics/output.log)。该段只证明日志所列检查通过，具体输入和断言见本用例引用的测试源码。

**测试结果**

通过；A04。本项结论来自已归档记录，本次未重新执行。

**执行证据**

[A04](#a04)、[statistics.ts](../../tests/phase1/statistics.ts)。证据代号含义及执行时间见第10节。

<a id="tc33"></a>

### TC33 历史及填写内容的分页隔离

- **对应需求**：R21/R25/R26。
- **测试方式**：自动化API分页测试。
- **前置条件**：pagination.ts准备多份独立样例，使用合法创建者会话。
- **测试输入**：limit/cursor及显式version。

**测试步骤**

1. 按脚本limit分页读取历史答卷、文本及数字内容，循环收集直到nextCursor为空。
2. 检查ID不重不漏，内容与该版本fixture一致。
3. 将游标用于另一版本、题目或不符合原查询范围的请求，检查拒绝。
4. 检查每页响应白名单及权限，不能因分页返回内部身份字段。

**预期输出**

不重不漏；范围错误拒绝；身份字段不泄露。

**实际输出**

自动真实多页查询和跨版本游标拒绝通过。

**已有自动测试终端输出节选**（测试脚本打印的断言结果，不是HTTP响应体或MongoDB原始文档）：

```text
PASS actual multi-page history, text contents and numeric strings (including zero) have no duplicates or identity fields
PASS pinned historical pagination survives republish; cross-version cursor reuse is rejected
```

来源：[output.log](runs/2026-10-17T16-15-16-611Z-pagination/output.log)。该段只证明日志所列检查通过，具体输入和断言见本用例引用的测试源码。

**测试结果**

通过；A06。本项结论来自已归档记录，本次未重新执行。

**执行证据**

[A06](#a06)、[pagination.ts](../../tests/phase1/pagination.ts)。证据代号含义及执行时间见第10节。

<a id="tc34"></a>

### TC34 累计及分版本计数一致性

- **对应需求**：R27。
- **测试方式**：人工MongoDB查询。
- **前置条件**：保留人工主问卷和允许重复问卷，已完成实际提交。
- **测试输入**：两份人工问卷。

**测试步骤**

1. 分别按surveyId执行countDocuments，得到实际累计答卷数。
2. 按surveyId及当前发布号查询实际当前版本答卷数。
3. 读取surveys的累计和当前计数字段并比较。
4. 核对主问卷累计3/当前1、允许重复问卷2/2，并对照M06检查v1、v2关联。

**预期输出**

维护计数等于countDocuments实数；分版本正确。

**实际输出**

主问卷3=3、当前1=1；重复问卷2=2、当前2=2；旧记录分别引用v1/v2。

**已保存的人工mongosh输出摘录**（直接引用既有证据，非本次重新查询）：

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

来源：[人工证据M08](manual-execution-evidence.md)。保留原记录字段和值，不补写当时未留存的终端提示符或其他字段。

**测试结果**

通过；M06/M08。本项结论来自已归档记录，本次未重新执行。

**执行证据**

[M06](manual-execution-evidence.md#m06-用户实际粘贴的三份答卷关联)、[M08](manual-execution-evidence.md#m08-最终计数一致性用户原始输出)。证据代号含义及执行时间见第10节。

## 9 补充测试

<a id="tc01"></a>

### TC01 注册账号与用户持久化

- **对应需求**：R01。
- **测试方式**：手工操作、数据库核查及自动化账号回归。
- **前置条件**：数据库和账号接口可用，使用两个尚未注册的测试用户名。
- **测试输入**：两个不同用户名和合法测试密码。

**测试步骤**

1. 分别注册账号A、B，使用合法测试密码。
2. 查询users集合，投影排除passwordHash，检查两个用户的ID、注册时间和结构版本。
3. 对照账号回归中的注册断言，确认两个账号相互独立。

**预期输出**

两个独立用户，ObjectId及Date正确。

**实际输出**

用户贴出两个用户文档，ID不同、schemaVersion=1、日期存在；查询主动隐藏passwordHash。

**测试结果**

通过；M01、A08。本项结论来自已归档记录，本次未重新执行。

**执行证据**

[A08](#a08)、[M01](manual-execution-evidence.md#m01-用户持久化)、[regression.ts](../../tests/phase1/regression.ts)。证据代号含义及执行时间见第10节。

<a id="tc02"></a>

### TC02 重复用户名注册

- **对应需求**：R01。
- **测试方式**：手工反馈及自动化API回归。
- **前置条件**：测试用户名已注册。
- **测试输入**：同名、大小写/首尾空格及规范化变体。

**测试步骤**

1. 再次使用完全相同的用户名注册。
2. 按账号回归fixture分别使用大小写、首尾空格及规范化变体注册。
3. 检查响应及用户记录，确认没有创建规范化后同名的第二个账号。

**预期输出**

不产生第二个账号，重名被拒。

**实际输出**

用户反馈完成；自动账号回归验证规范化重名409。

**测试结果**

通过；F、A08。本项结论来自已归档记录，本次未重新执行。

**执行证据**

[A08](#a08)、[人工反馈边界](manual-execution-evidence.md#m07-人工反馈的证据边界)、[regression.ts](../../tests/phase1/regression.ts)。证据代号含义及执行时间见第10节。

<a id="tc03"></a>

### TC03 登录凭据检查

- **对应需求**：R01。
- **测试方式**：手工反馈及自动化API回归。
- **前置条件**：已注册测试账号，保留正确凭据。
- **测试输入**：错误和正确凭据。

**测试步骤**

1. 使用已注册用户名和错误密码登录。
2. 使用不存在的用户名登录。
3. 使用正确用户名和密码登录，分别检查拒绝结果和成功会话。

**预期输出**

错误被拒，正确进入系统。

**实际输出**

人工反馈完成；自动回归检查凭据错误与正确登录。

**测试结果**

通过；F、A08。本项结论来自已归档记录，本次未重新执行。

**执行证据**

[A08](#a08)、[人工反馈边界](manual-execution-evidence.md#m07-人工反馈的证据边界)、[regression.ts](../../tests/phase1/regression.ts)。证据代号含义及执行时间见第10节。

<a id="tc04"></a>

### TC04 会话恢复与退出

- **对应需求**：R01/R02。
- **测试方式**：手工反馈、自动化API及浏览器回归。
- **前置条件**：已登录并能打开自己的问卷页面。
- **测试输入**：有效会话、退出后无cookie。

**测试步骤**

1. 刷新受保护页面并读取当前用户，检查登录状态恢复。
2. 执行退出。
3. 再次读取当前用户及访问受保护页面，检查要求登录且不能继续管理问卷。

**预期输出**

刷新恢复；退出后要求登录。

**实际输出**

人工反馈完成；登录退出浏览器与当前用户回归通过。

**测试结果**

通过；F、A08。本项结论来自已归档记录，本次未重新执行。

**执行证据**

[A08](#a08)、[人工反馈边界](manual-execution-evidence.md#m07-人工反馈的证据边界)、[regression.ts](../../tests/phase1/regression.ts)。证据代号含义及执行时间见第10节。

<a id="tc05"></a>

### TC05 跨用户管理访问限制

- **对应需求**：R02。
- **测试方式**：自动化API与编辑回归，人工反馈辅助。
- **前置条件**：A拥有测试问卷，B为另一个登录账号。
- **测试输入**：非owner账号及A的资源ID。

**测试步骤**

1. 记录A问卷的编辑、统计及历史访问地址。
2. 切换到B，访问相应管理接口；另按编辑回归直接发送PATCH、PUT请求。
3. 检查拒绝响应及A问卷内容，确认不能读写；人工模糊反馈不作为逐接口执行证据。

**预期输出**

管理内容不可读写；接口拒绝，原数据不变。

**实际输出**

人工最初表述“应该通过”，作为辅助反馈；自动统计权限及编辑回归实际验证404/隔离。

**测试结果**

通过（以自动证据为主）；A04、A08；人工反馈待独立截图复核。本项结论来自已归档记录，本次未重新执行。

**执行证据**

[A04](#a04)、[A08](#a08)、[regression.ts](../../tests/phase1/regression.ts)。证据代号含义及执行时间见第10节。

<a id="tc17"></a>

### TC17 创建者浏览与模拟预览

- **对应需求**：R14（预览边界）。
- **测试方式**：自动化浏览器测试。
- **前置条件**：拥有11题问卷，记录预览前答卷和计数。
- **测试输入**：空答浏览；模拟非法/合法回答。

**测试步骤**

1. 进入默认浏览预览，不回答直接翻页，检查10+1题展示。
2. 切换模拟填写，使用非法回答检查错误定位，再完成合法模拟。
3. 对比预览前后的responses和问卷计数，确认没有正式写入。

**预期输出**

10+1分页；浏览无需回答；预览不保存responses或计数。

**实际输出**

新版浏览器实际验证分页、错误定位、无预览写入。

**已有自动测试终端输出节选**（测试脚本打印的断言结果，不是HTTP响应体或MongoDB原始文档）：

```text
PASS 11-question browse without answers; simulation page validation focuses original Q4; 10+1 pagination and back navigation retain answers; no preview writes
```

来源：[output.log](runs/2026-10-17T16-15-18-162Z-browser/output.log)。该段只证明日志所列检查通过，具体输入和断言见本用例引用的测试源码。

**测试结果**

通过；A07。本项结论来自已归档记录，本次未重新执行。

**执行证据**

[A07](#a07)、[redesign.ts](../../tests/phase1/redesign.ts)。证据代号含义及执行时间见第10节。

<a id="tc18"></a>

### TC18 发布问卷与分享登录

- **对应需求**：R04。
- **测试方式**：人工数据库核查、自动化发布及浏览器测试。
- **前置条件**：问卷定义合法且已保存，创建者已登录。
- **测试输入**：已保存定义、发布前提、Publication-Key。

**测试步骤**

1. 读取最新revision及编辑修订，生成新的Publication-Key并发布。
2. 检查v1快照、状态及当前指针；记录分享地址。
3. 未登录打开分享地址，检查要求登录；登录后检查返回原问卷。
4. 重复同一发布请求的验证由发布专项完成，确认不重复创建版本。

**预期输出**

v1快照和指针生成；填写须登录并返回目标链接。

**实际输出**

自动发布201、同URL；真实浏览器登录返回填写；人工输出published/v1。

**已有自动测试终端输出节选**（测试脚本打印的断言结果，不是HTTP响应体或MongoDB原始文档）：

```text
PASS transaction publishes v1 and returns same survey share URL
PASS publication retry replay and changed-key-content conflict
```

来源：[output.log](runs/2026-10-17T16-15-09-829Z-publish/output.log)。该段只证明日志所列检查通过，具体输入和断言见本用例引用的测试源码。

**测试结果**

通过；M05、A01/A07。本项结论来自已归档记录，本次未重新执行。

**执行证据**

[A01](#a01)、[A07](#a07)、[M05](manual-execution-evidence.md#m05-第一份正式答卷)、[publish.ts](../../tests/phase1/publish.ts)。证据代号含义及执行时间见第10节。

<a id="tc27"></a>

### TC27 暂停修改后同链接重新发布

- **对应需求**：R22/R23/R24。
- **测试方式**：人工版本与计数核查、自动化发布及浏览器测试。
- **前置条件**：v1已有答卷，保留ID、publicId、URL和快照。
- **测试输入**：修改题干/选项、保留surveyId/publicId。

**测试步骤**

1. 暂停问卷并修改题目；人工主问卷修改Q1题干并新增可选第6题。
2. 保存编辑内容，检查没有产生新的发布快照。
3. 正式发布v2，核对surveyId、publicId和分享链接未改变。
4. 查询旧快照及旧答卷，检查v1保留；人工结果为v1两份、v2一份，自动样例独立核对。

**预期输出**

保存不生快照，重发新版本；原ID链接与旧答卷保留。

**实际输出**

自动验证v1快照/URL不变；人工出现v1两份、v2一份。

**已有自动测试终端输出节选**（测试脚本打印的断言结果，不是HTTP响应体或MongoDB原始文档）：

```text
PASS pause/edit/republish retains v1 and same ID/link; editing creates no snapshot
```

来源：[output.log](runs/2026-10-17T16-15-09-829Z-publish/output.log)。该段只证明日志所列检查通过，具体输入和断言见本用例引用的测试源码。

**测试结果**

通过；M06、A01/A07。本项结论来自已归档记录，本次未重新执行。

**执行证据**

[A01](#a01)、[A07](#a07)、[M06](manual-execution-evidence.md#m06-用户实际粘贴的三份答卷关联)、[publish.ts](../../tests/phase1/publish.ts)。证据代号含义及执行时间见第10节。

<a id="tc28"></a>

### TC28 分版本统计与历史定义

- **对应需求**：R25/R26。
- **测试方式**：人工版本反馈及自动化统计、浏览器测试。
- **前置条件**：统计fixture中v1三份；暂停修改“是”标签为“新版选项”后发布v2。
- **测试输入**：同题ID在v2改标签。

**测试步骤**

1. 不传version读取统计，检查默认v2且初始所选及当前计数为0、累计为3。
2. 指定version=1，检查三份答卷及旧标签“是”。
3. 读取v1答卷详情，检查定义仍是v1且数字0未丢失。
4. 浏览器切换版本确认结果分离，不将人工主问卷2+1计数用于此fixture。

**预期输出**

旧答卷按旧标签解释；不跨版本合并。

**实际输出**

自动旧选项标签保留，v2默认空态/新增计数分离；人工反馈版本测试完成。

**已有自动测试终端输出节选**（测试脚本打印的断言结果，不是HTTP响应体或MongoDB原始文档）：

```text
PASS v2 default/empty vs v1 history remain separate and old option labels/zero preserved
```

来源：[output.log](runs/2026-10-17T16-15-13-328Z-statistics/output.log)。该段只证明日志所列检查通过，具体输入和断言见本用例引用的测试源码。

**测试结果**

通过；F、A04/A07。本项结论来自已归档记录，本次未重新执行。

**执行证据**

[A04](#a04)、[A07](#a07)、[人工反馈边界](manual-execution-evidence.md#m07-人工反馈的证据边界)、[statistics.ts](../../tests/phase1/statistics.ts)。证据代号含义及执行时间见第10节。

<a id="tc29"></a>

### TC29 旧版本拒新与成功请求重放

- **对应需求**：R28。
- **测试方式**：自动化提交及浏览器测试。
- **前置条件**：保留v1未提交页面及一份v1已成功请求，随后发布v2。
- **测试输入**：旧发布号/新key、旧成功key。

**测试步骤**

1. 旧页面以新key提交v1内容，检查409及重新加载提示。
2. 沿用旧成功key和原body重放，检查200原回执且仍关联v1。
3. 查询答卷和计数，确认两个步骤均未产生错误新增。

**预期输出**

旧版新请求409并重载提示；旧成功请求仍200。

**实际输出**

提交及浏览器专项断言通过。

**已有自动测试终端输出节选**（测试脚本打印的断言结果，不是HTTP响应体或MongoDB原始文档）：

```text
PASS paused/old-version/closed new requests denied; successful old request always replays
```

来源：[output.log](runs/2026-10-17T16-15-11-638Z-submit/output.log)。该段只证明日志所列检查通过，具体输入和断言见本用例引用的测试源码。

**测试结果**

通过；A03/A07。本项结论来自已归档记录，本次未重新执行。

**执行证据**

[A03](#a03)、[A07](#a07)、[submit.ts](../../tests/phase1/submit.ts)。证据代号含义及执行时间见第10节。

<a id="tc35"></a>

### TC35 底部添加与动态分页交互

- **对应需求**：当前分页交互。
- **测试方式**：自动化浏览器测试。
- **前置条件**：使用redesign.ts的独立11题及跳转样例。
- **测试输入**：11题、跳转后10题、改答缩短路径。

**测试步骤**

1. 连续从底部添加到11题，检查新题出现、聚焦和保存恢复。
2. 浏览及填写检查10+1分页，返回上一页确认有效答案保留。
3. 分别触发同页、跨页及多选跳转，检查不意外自动翻页、原题号稳定。
4. 返回改答缩短路径，检查失效答案清理、错误定位、页码调整且无空白页。

**预期输出**

10+1/10分页正确；不会突然自动翻页；没有空白页/漏校验。

**实际输出**

所引用的浏览器记录通过，原题号、有效答案保留、错误定位正常。

**已有自动测试终端输出节选**（测试脚本打印的断言结果，不是HTTP响应体或MongoDB原始文档）：

```text
PASS register/login defaults to dashboard; both real entries work; 11 bottom additions focus title and preserve stable IDs/content after save/refresh
PASS same-page jump produces exact 10-question single page; multi first-match and continued checking never advance; branch cleanup retains valid values; cross-page skip removes required errors and preserves original numbering
PASS page reduction after back/change clamps to nonempty first page
```

来源：[output.log](runs/2026-10-17T16-15-18-162Z-browser/output.log)。该段只证明日志所列检查通过，具体输入和断言见本用例引用的测试源码。

**测试结果**

通过；A07。本项结论来自已归档记录，本次未重新执行。

**执行证据**

[A07](#a07)、[redesign.ts](../../tests/phase1/redesign.ts)。证据代号含义及执行时间见第10节。

<a id="tc36"></a>

### TC36 类型、构建及原有功能回归

- **对应需求**：工程可运行。
- **测试方式**：已归档的工程命令及自动回归。
- **前置条件**：安装锁定依赖，配置独立测试库和本地副本集。
- **测试输入**：锁定依赖、本地副本集和现有源码。

**测试步骤**

1. 按归档记录执行npm.cmd run typecheck和npm.cmd run build，保留输出与退出码。
2. 执行原账号、编辑、字符计数及登录退出回归。
3. 检查记录中typecheckExit、buildExit为0且回归通过；本次只整理历史结果，不再次运行业务测试。

**预期输出**

编译成功、关联回归成功。

**实际输出**

typecheck/build退出码0；回归日志结尾明确通过。

**测试结果**

通过；A08/A09。仅对记录时源码成立，不保证之后任意改动。本项结论来自已归档记录，本次未重新执行。

**执行证据**

[A08](#a08)、[A09](#a09)、[regression.ts](../../tests/phase1/regression.ts)。证据代号含义及执行时间见第10节。

## 10 执行证据与复现方式

以下保留原来使用的证据编号和历史运行，不将这些记录称为当前代码的最新测试。A01—A07对应2026-10-17 UTC运行；A08和A09日期见各自文件。后续核对记录另见[作业核对清单](../assignment-checklist.md)，不以新记录静默覆盖旧证据。

| 代号 | 实际运行记录 | 结果 |
| --- | --- | --- |
| <a id="a01"></a>A01 发布 | [步骤输出](runs/2026-10-17T16-15-09-829Z-publish/output.log)、[退出码](runs/2026-10-17T16-15-09-829Z-publish/result.json) | passed / exitCode 0 |
| <a id="a02"></a>A02 校验与路径 | [步骤输出](runs/2026-10-17T16-15-11-414Z-flow/output.log)、[退出码](runs/2026-10-17T16-15-11-414Z-flow/result.json) | passed / exitCode 0 |
| <a id="a03"></a>A03 提交 | [步骤输出](runs/2026-10-17T16-15-11-638Z-submit/output.log)、[退出码](runs/2026-10-17T16-15-11-638Z-submit/result.json) | passed / exitCode 0 |
| <a id="a04"></a>A04 统计/历史 | [步骤输出](runs/2026-10-17T16-15-13-328Z-statistics/output.log)、[退出码](runs/2026-10-17T16-15-13-328Z-statistics/result.json) | passed / exitCode 0 |
| <a id="a05"></a>A05 边界/并发 | [步骤输出](runs/2026-10-17T16-15-15-032Z-edges/output.log)、[退出码](runs/2026-10-17T16-15-15-032Z-edges/result.json) | passed / exitCode 0 |
| <a id="a06"></a>A06 分页 | [步骤输出](runs/2026-10-17T16-15-16-611Z-pagination/output.log)、[退出码](runs/2026-10-17T16-15-16-611Z-pagination/result.json) | passed / exitCode 0 |
| <a id="a07"></a>A07 分页浏览器（所引用记录） | [步骤输出](runs/2026-10-17T16-15-18-162Z-browser/output.log)、[退出码](runs/2026-10-17T16-15-18-162Z-browser/result.json)、[实际截图](screenshots/redesign-1792253720163/) | passed / exitCode 0 |
| <a id="a08"></a>A08 原功能回归 | [步骤输出](runs/2026-10-17T14-49-31-165Z-regression/output.log)、[退出码](runs/2026-10-17T14-49-31-165Z-regression/result.json) | passed / exitCode 0；历史记录，不冒充本次命令执行 |
| <a id="a09"></a>A09 桌面构建（所引用记录） | [结果](runs/2026-10-17T22-48-44-desktop-build/result.json) | typecheckExit=0、buildExit=0 |

输入与自动步骤详情见对应源码：tests/phase1/publish.ts、flow.ts、submit.ts、statistics.ts、edges.ts、pagination.ts、browser.ts及其调用的redesign.ts；回归入口tests/phase1/regression.ts。自动化数据均为合成样例，运行后保留独立测试库。

复现核心命令（PowerShell，先按README启动MongoDB）：

```powershell
Set-Location -LiteralPath 'D:\大三\数据库\project1'
npm.cmd run test:phase1
```

人工MongoDB核查命令见[证据摘录](manual-execution-evidence.md)和[分步/完整验收方案](manual-acceptance.md)。`db...`在mongosh执行，不在PowerShell直接执行。

## 11 未执行内容及验证范围

- R01—R05：TC01—TC06、TC18、TC25。
- R06—R13：TC07—TC16，四题型、最少/最多/恰好、多种跳转、顺序及错误提示。
- R14—R17：TC17、TC19—TC26，预览不保存与正式保存区分，匿名、多用户、防重和幂等。
- R18—R21：TC28、TC30—TC33，整卷/单题、内容、均值和零回答；选择统计以已确认答卷口径呈现，不将份数当去重人数。
- R22—R29及项目承诺：TC21、TC25—TC29、TC33—TC35，暂停修改、不可变版本、旧请求与历史统计。

不能据此宣称通过的内容：第二台真实设备/防火墙路径和公网部署、生产压力与多节点容灾、完整无障碍认证、数据库级快照insert-only角色、未知旧库/legacy迁移、自动保存和断点恢复。自动浏览器日志仅验证本机网卡HTTP配置及错误Origin被拒，没有证明第二台电脑可访问。

人工关闭的最终状态截图、完整人工HTTP响应和具体组员姓名尚需提交人按实际补充；已有自动化关闭证据可作为功能依据。未重新执行整份84项计划或inspect-acceptance脚本，不将不匹配本轮分步数据的全套样例审计冒充通过。

本文件保留36个原用例组；子场景不是新增的独立执行统计。自动化通过、人工数据库核查和人工反馈分别说明，不把预期结果当成实际结果。人工姓名、缺失截图等只能由实际执行者据实补充。

提交时保留本文件、[人工证据](manual-execution-evidence.md)、第10节链接的日志/result.json及必要截图。报告第七章可以概述结果并引用本文件，无须重复全文；附件必须能够实际访问。若单独导出本文件为Word/PDF，应保留编号步骤、输入、预期/实际输出、结果和证据入口。

[← 返回项目总 README](../../README.md)
