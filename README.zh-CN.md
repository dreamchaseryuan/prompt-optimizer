# Always200 Prompt

<div align="center">

[English](README.md) | 中文

[![License](https://img.shields.io/badge/license-AGPL--3.0-blue.svg)](LICENSE)

[官网](https://always200.com) | [在线优化器](https://prompt.always200.com) | [Prompt Garden](https://garden.always200.com) | [文档站](https://docs.always200.com)

</div>

## 项目简介

Always200 Prompt 是一款个人 AI 提示词优化工作台：编写、优化、测试、评估提示词，并沉淀为可复用的提示词资产。支持 Web、桌面端、Chrome 扩展与 Docker 部署，纯客户端处理。

核心能力：

- **提示词优化与迭代** —— 一键优化、多轮迭代改进、版本回溯、版本间 diff 对比
- **模板体系** —— 内置通用模板 + 编程领域套件（代码审查 / 重构建议 / 算法讲解 / 报错解读），支持分组选择与用户模板覆盖
- **批量优化** —— 单批最多 50 条逐条优化，逐条状态跟踪与 JSON 导出
- **收藏与分享** —— 收藏夹分类、版本历史、HTML/PNG 分享包
- **多模型支持** —— OpenAI / Gemini / DeepSeek / 智谱 / Moonshot / 火山方舟 / 混元 / 星火 / 小米 MiMo 及任意 OpenAI 兼容端点，密钥仅存本地
- **测试与评估** —— A/B 对照测试与结构化评估
- **变量与上下文** —— 智能变量提取、占位符保护、对话上下文感知优化
- **MCP 服务** —— 将优化能力开放给 AI 工具调用

## 快速开始

```bash
# 环境要求：Node.js >= 20，pnpm（经 corepack）
corepack enable
pnpm install
pnpm dev        # 启动 Web 应用
pnpm build      # 构建全部包
```

完整开发指南见 [docs/developer/development.md](docs/developer/development.md)，部署指南（Vercel / Cloudflare / Docker / MCP）见 [docs/user/](docs/user/)。

Fork 相对上游的功能差异见 [README-FORK.md](README-FORK.md)。

## 许可证与来源声明

本项目采用 **GNU Affero General Public License v3.0（AGPL-3.0）** 授权，完整许可文本见 [LICENSE](LICENSE)。

本项目基于 **linshenkx** 的 [Prompt Optimizer](https://github.com/linshenkx/prompt-optimizer)（Copyright (C) 2025 linshenkx）修改并重新命名为 Always200 Prompt。

依据 AGPL-3.0：

- 你可以自由使用、修改、再分发本软件（包括商用）
- 必须保留原版权声明与 AGPL-3.0 许可文本
- 若分发修改版本或以网络服务方式提供，必须以 AGPL-3.0 开源对应源代码

修改部分 Copyright (C) 2026 Always200。
