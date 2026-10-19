# README-FORK

本仓库是 [linshenkx/prompt-optimizer](https://github.com/linshenkx/prompt-optimizer) 的个人自用 Fork（上游基线：`develop` 分支 `1e1f94c0`，2026-10-13，桌面版 v2.11.11）。

除上游能力外，本 Fork 增加了提示词健壮性加固、通用编程领域模板、四家国内模型适配器、模板回归基准工具，以及批量优化与收藏夹版本对比两个前端功能。本文件只记录差异，上游完整文档见 `README.md` / `README.zh-CN.md`。

## 与上游的差异

### 1. 模板与评估链路加固（M2）

- `general-optimize` / `output-format-optimize`（zh/en）：升级为 system+user 数组模板，原始提示词经 `{{#helpers.toJson}}` JSON 证据包裹，补充任务边界声明（优化提示词文本本身而非执行任务）与防注入声明，输出格式骨架逐字保留。
- `variable-extraction` / `variable-value-generation`（zh/en）：`promptContent` 改走 toJson，修复 Mustache HTML 转义把原文引号变成 `&quot;` 的问题；列表字段改三花括号避免转义。
- 新增 `packages/core/src/utils/variable-placeholder.ts` 占位符守卫：优化/迭代输出侧检查 `{{variable}}` 是否丢失或被改写，缺失时 `console.warn`（不阻断）。
- 修复两处 zh/en 漂移：`analytical-optimize_en` 重写对齐 zh 结构；`context-iterate` zh 补齐 `{{^conversationContext}}` / `{{^toolsContext}}` 兜底块。

### 2. 通用编程领域模板（M3）

目录：`packages/core/src/services/template/default-templates/optimize/programming/`，zh/en 成对，`templateType: 'optimize'`：

| templateId | 场景 | 输出骨架 |
|---|---|---|
| `code-review-optimize` | 代码审查 | 审查范围 → P0-P3 严重度 → 逐条问题五要素 → 放行结论 |
| `refactor-suggest-optimize` | 重构建议 | 现状诊断 → 目标与约束 → 分步计划 → 风险回滚 → 验收标准 |
| `algorithm-explain-optimize` | 算法讲解 | 直觉 → 逐步推演 → 复杂度 → 边界反例 → 可运行示例 |
| `error-diagnosis-optimize` | 报错解读 | 错误分类 → 根因假设 → 最小验证 → 修复方案 → 预防建议 |

用法：核心服务的优化请求支持 `templateId` 字段（默认 `general-optimize`），传入上表 id 即可选用，例如：

```ts
await promptService.optimizePrompt({
  originalPrompt: '帮我看看这段 C 代码有没有问题',
  templateId: 'code-review-optimize'
})
```

> Web UI 无需额外配置：系统提示词工作区的模板选择器按 `templateType='optimize'` 自动列出全部内置模板，新领域模板直接可选。

### 3. 新增模型适配器（M4）

均继承 `OpenAIAdapter`，注册于 `packages/core/src/services/llm/adapters/registry.ts`：

| provider id | 名称 | 默认 Base URL | 静态模型 |
|---|---|---|---|
| `moonshot` | Moonshot AI (Kimi) | `https://api.moonshot.cn/v1` | kimi-k3、kimi-k2.7-code、kimi-k2.7-code-highspeed、kimi-k2.6 |
| `volcengine-ark` | Volcengine Ark (Doubao) | `https://ark.cn-beijing.volces.com/api/v3` | doubao-seed-2-1-pro-260915（model 字段也支持自建 Endpoint ID） |
| `hunyuan` | Tencent Hunyuan | `https://api.hunyuan.cloud.tencent.com/v1` | hunyuan-turbos-latest、hunyuan-turbo |
| `spark` | iFlytek Spark | `https://spark-api-open.xf-yun.com/v1` | generalv3.5、4.0Ultra、lite（X1 系列需把 Base URL 改为 `/v2`） |

鉴权均为 `Authorization: Bearer <API Key>`，密钥只保存在本地（Web 端 localStorage / 桌面端本地文件），不经中间服务器。

环境变量初始化（Web / MCP / Desktop 通用）：

```bash
VITE_MOONSHOT_API_KEY=sk-...      # moonshot
VITE_ARK_API_KEY=...               # volcengine-ark（也接受 VITE_VOLCENGINE_ARK_API_KEY）
VITE_HUNYUAN_API_KEY=...           # hunyuan
VITE_SPARK_API_KEY=...             # spark
```

### 4. 前端增强（M7 / M8）

**模板选择器分组**

- `TemplateMetadata` 新增可选 `domain` 字段；通用编程四模板标记 `domain='programming'`
- 模板下拉在存在领域模板时按「通用 / 编程领域 / 用户自定义」分组展示（NSelect group）；其余模板类型保持原扁平列表行为
- 新领域接入方式：模板 metadata 加 `domain: '<name>'` + 三语 locale 补 `template.groupDomain.<name>`（`packages/ui/src/i18n/locales/*/templates.ts`）

**批量优化（`/#/batch`）**

- 头部「⚡ 批量优化」入口（页面型目的地，与收藏夹同级，不占工作区子模式）
- 输入解析：空行分隔多条提示词，单条可多行；单批上限 50 条
- 顺序执行所选 optimize 模板与模型，支持停止（当前条完成后生效）
- 结果：逐条状态/耗时、展开 Markdown 渲染、单条复制、复制全部、导出 JSON
- 说明：批量结果不写入优化历史（MVP 取舍），需要留存请用「导出 JSON」

**版本对比（收藏夹）**

- 版本列表每行新增「对比」按钮（≥2 个版本时显示）
- 弹窗内双版本自由切换（默认「次新版本 vs 当前版本」），零依赖 LCS 行级 diff：双侧行号、`+/-` 标记、红绿高亮、增删统计、相同内容空态
- 多消息数组模板经文本投影后同样可比（图片提示词版本一致适用）

### 5. 模板回归基准工具（M5 / M6）

- 目录：`scripts/eval-baseline/`，方法见该目录 `README.md`
- 12 条固定基准（覆盖中英/长短/占位符场景），`--dry-run` 离线校验渲染与证据包裹，`--live` 跑任意 OpenAI 兼容端点
- 机械一致性校验：占位符保留、代码块包裹、Markdown 标题数、最小长度；输出 `out/<timestamp>/results-<template>.json`（已 gitignore）
- 典型用法：

```bash
corepack pnpm build:core
BASELINE_BASE_URL=https://api.deepseek.com/v1 \
BASELINE_API_KEY=sk-xxx \
BASELINE_MODEL=deepseek-chat \
node scripts/eval-baseline/run.mjs --template general-optimize --runs 3
```

## 开发环境

- **Node ^24**（`.npmrc` 开启 `engine-strict=true`，Node 22 会被拒绝）
- **pnpm 10.6.1**（`packageManager` 锁定，用 corepack，不要全局安装）
- 全局 pnpm 会遮蔽 corepack 版本。推荐一次性修复：

```bash
corepack enable --install-directory ~/.corepack-shims
```

之后每个 shell：

```bash
export PATH="$HOME/.corepack-shims:/c/Program Files/nodejs:$PATH"
export COREPACK_ENABLE_DOWNLOAD_PROMPT=0
```

- Electron 二进制下载建议挂镜像：`export ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/"`

## 门禁命令

```bash
corepack pnpm test:gate:core        # 静态门禁（渲染快照/契约/占位符/zh-en 成对）
corepack pnpm -F @prompt-optimizer/core test:unit   # 全量单测
corepack pnpm typecheck:core
corepack pnpm check:no-chinese-runtime
corepack pnpm check:locale
corepack pnpm build:core
```

## 同步上游

```bash
git fetch upstream
git merge upstream/develop    # 或 rebase
```

冲突高发文件：`packages/core/src/services/template/default-templates/index.ts`（模板注册表）、`registry.ts`（适配器注册表）。合并后重跑 `test:gate:core`。

## 许可

上游为 **AGPL-3.0**，本 Fork 延续该许可。对外提供网络服务须公开源码；自用不受影响。
