# 模板回归基准（eval-baseline）

用固定基准集跑指定 optimize 模板，输出可直接对比的 JSON 结果与机械一致性指标。用于模板改动前后的回归对比，不替代人工质量评审。

## 前提

```bash
corepack pnpm build:core   # 工具读取 packages/core/dist/index.cjs 的 ALL_TEMPLATES
```

## 1. 离线校验（无需密钥）

```bash
node scripts/eval-baseline/run.mjs --dry-run
# 或指定模板
node scripts/eval-baseline/run.mjs --dry-run --template code-review-optimize
```

产出 `scripts/eval-baseline/out/<timestamp>/payloads-<template>.json`，包含每条基准渲染后的 system/user 消息，可直接核对 JSON 证据包裹是否正确。

## 2. 真实模型跑分

任意 OpenAI 兼容端点（Moonshot / Ark / Hunyuan / Spark / MiMo / DeepSeek 均可）：

```bash
BASELINE_BASE_URL=https://api.moonshot.cn/v1 \
BASELINE_API_KEY=sk-xxx \
BASELINE_MODEL=kimi-k2.6 \
BASELINE_TEMPERATURE=0.7 \
node scripts/eval-baseline/run.mjs --template general-optimize --runs 3
```

参数：
- `--template`：optimize 模板 id（默认 `general-optimize`；可用 `code-review-optimize` / `refactor-suggest-optimize` / `algorithm-explain-optimize` / `error-diagnosis-optimize`）
- `--runs`：每条基准重复次数（默认 1；建议 3 次观察稳定性）
- `--out`：输出目录（默认 `scripts/eval-baseline/out/<timestamp>`）

## 3. 指标说明

每条输出做机械校验（`conformance`）：

| 检查 | 含义 |
|---|---|
| `missing placeholders` | 输入中的 `{{变量}}` 未在输出中保留 |
| `output wrapped in code fence` | 输出被 ``` 包裹（模板明令禁止） |
| `too few markdown headers` | 输出 Markdown 标题少于 2 个（骨架严重缺失） |
| `output too short` | 输出短于 50 字符 |

汇总输出：`conformance=通过数/总数`、平均耗时、失败明细。

## 4. 改动前后对比建议

1. 改动前在旧提交上跑一次，保存 `out/` 目录
2. 改动后跑一次
3. 对比 `conformance` 通过率与平均耗时；输出正文抽 3–5 条人工比对结构差异
4. 若接入真实评审模型，可在此基础上扩展 5 维评分（当前工具只做机械校验，避免引入新的评判提示词）

## 注意

- 基准集 `benchmarks.json` 故意包含 `{{tone}}` / `{{product}}` 占位符，用于验证占位符保护。
- 工具不读取也不打印 API Key；Key 只经环境变量传入。
- 输出目录默认在仓库内，提交前请确认未被 `git add`（建议加入 .gitignore）。
