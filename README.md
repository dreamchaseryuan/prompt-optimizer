# Always200 Prompt

<div align="center">

English | [中文](README.zh-CN.md)

[![License](https://img.shields.io/badge/license-AGPL--3.0-blue.svg)](LICENSE)

[Website](https://always200.com) | [Online Optimizer](https://prompt.always200.com) | [Prompt Garden](https://garden.always200.com) | [Docs](https://docs.always200.com)

</div>

## Introduction

Always200 Prompt is a personal AI prompt optimization workbench: write, optimize, test, evaluate, and save prompts as reusable assets. It supports web, desktop, Chrome extension, and Docker deployment, with fully client-side processing.

Highlights:

- **Prompt optimization & iteration** — one-click optimization with multi-round iteration, version tracking, and diff comparison between versions
- **Templates** — built-in general templates plus a programming domain suite (code review / refactoring / algorithm explanation / error diagnosis), with grouped selection and user template overrides
- **Batch optimization** — optimize up to 50 prompts in one run, with per-item status and JSON export
- **Favorites & sharing** — favorite library with categories, version history, HTML/PNG share packages
- **Multi-model** — OpenAI / Gemini / DeepSeek / Zhipu / Moonshot / Volcengine Ark / Hunyuan / Spark / Xiaomi MiMo and any OpenAI-compatible endpoint; client-side key storage
- **Testing & evaluation** — side-by-side A/B testing with structured evaluation
- **Variables & context** — smart variable extraction/placeholder guards, conversation-context-aware optimization
- **MCP server** — expose optimization capabilities to AI tools

## Quick Start

```bash
# Requirements: Node.js >= 20, pnpm (via corepack)
corepack enable
pnpm install
pnpm dev        # start web app
pnpm build      # build all packages
```

See [docs/developer/development.md](docs/developer/development.md) for the full development guide, and [docs/user/](docs/user/) for deployment guides (Vercel / Cloudflare / Docker / MCP).

For fork-specific features and deltas, see [README-FORK.md](README-FORK.md).

## License & Attribution

This project is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**. See [LICENSE](LICENSE) for the full license text.

It is based on [Prompt Optimizer](https://github.com/linshenkx/prompt-optimizer) by **linshenkx** (Copyright (C) 2025 linshenkx), modified and rebranded as Always200 Prompt.

Under the AGPL-3.0:

- You may use, modify, and redistribute this software, including commercially
- You must retain the original copyright notices and the AGPL-3.0 license text
- If you distribute modified versions or run them as a network service, you must make the corresponding source code available under AGPL-3.0

Modifications Copyright (C) 2026 Always200.
