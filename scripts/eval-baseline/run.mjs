#!/usr/bin/env node
/**
 * 模板回归基准工具（可 dry-run）
 *
 * 目的：用固定基准集跑指定 optimize 模板，产出可对比的输出与机械一致性指标。
 * 不依赖项目运行环境（Web/Desktop），只依赖 core 构建产物与 OpenAI 兼容 API。
 *
 * 用法：
 *   node scripts/eval-baseline/run.mjs --dry-run
 *   BASELINE_BASE_URL=https://api.moonshot.cn/v1 \
 *   BASELINE_API_KEY=sk-xxx BASELINE_MODEL=kimi-k2.6 \
 *   node scripts/eval-baseline/run.mjs --template general-optimize --runs 3
 *
 * 前提：先在仓库根执行 `corepack pnpm build:core`（读取 dist/index.cjs 的 ALL_TEMPLATES）。
 */

import { readFile, mkdir, writeFile, stat, readdir } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import mustache from 'mustache'

const require = createRequire(import.meta.url)
const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(__dirname, '../..')

const args = process.argv.slice(2)
const getArg = (name, fallback) => {
  const index = args.indexOf(`--${name}`)
  return index >= 0 && args[index + 1] && !args[index + 1].startsWith('--') ? args[index + 1] : fallback
}
const hasFlag = (name) => args.includes(`--${name}`)

const templateId = getArg('template', 'general-optimize')
const runs = Number.parseInt(getArg('runs', '1'), 10)
const dryRun = hasFlag('dry-run')
const outDir = resolve(repoRoot, getArg('out', `scripts/eval-baseline/out/${new Date().toISOString().replace(/[:.]/g, '-')}`))

const baseURL = process.env.BASELINE_BASE_URL || ''
const apiKey = process.env.BASELINE_API_KEY || ''
const model = process.env.BASELINE_MODEL || ''
const temperature = Number.parseFloat(process.env.BASELINE_TEMPERATURE || '0.7')

function loadTemplates() {
  const { ALL_TEMPLATES } = require(resolve(repoRoot, 'packages/core/dist/index.cjs'))
  return Object.values(ALL_TEMPLATES || {}).filter(Boolean)
}

async function newestMtime(dir) {
  let newest = 0
  const files = await readdir(dir, { recursive: true })
  for (const file of files) {
    if (!file.endsWith('.ts')) continue
    const stats = await stat(resolve(dir, file)).catch(() => null)
    if (stats && stats.mtimeMs > newest) newest = stats.mtimeMs
  }
  return newest
}

async function warnIfDistStale() {
  const distFile = resolve(repoRoot, 'packages/core/dist/index.cjs')
  const distStats = await stat(distFile).catch(() => null)
  if (!distStats) {
    throw new Error('packages/core/dist/index.cjs not found. Run `corepack pnpm build:core` first.')
  }
  const srcDir = resolve(repoRoot, 'packages/core/src/services/template/default-templates')
  const srcMtime = await newestMtime(srcDir).catch(() => 0)
  if (srcMtime > distStats.mtimeMs) {
    console.warn('[eval-baseline] warning: core dist is older than template sources. Run `corepack pnpm build:core` before trusting results.')
  }
}

function renderTemplate(template, originalPrompt) {
  const view = {
    originalPrompt,
    helpers: {
      // 与 core processor 的 toJson lambda 等价：把原始文本 JSON.stringify
      toJson() {
        return (text, render) => JSON.stringify(render(text))
      }
    }
  }
  const messages = Array.isArray(template.content)
    ? template.content.map((message) => ({ role: message.role, content: mustache.render(message.content, view) }))
    : [{ role: 'user', content: mustache.render(String(template.content), view) }]
  return messages
}

function extractPlaceholders(text) {
  const names = new Set()
  const pattern = /\{\{\s*\{?\s*([A-Za-z0-9_.]+)\s*\}?\s*\}\}/g
  let match
  while ((match = pattern.exec(text)) !== null) {
    names.add(match[1])
  }
  return names
}

function checkOutput(inputPrompt, output) {
  const problems = []
  const expected = extractPlaceholders(inputPrompt)
  const missing = [...expected].filter((name) => !new RegExp(`\\{\\{\\s*${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\}\\}`).test(output))
  if (missing.length) problems.push(`missing placeholders: ${missing.join(', ')}`)
  if (/^\s*```/.test(output)) problems.push('output wrapped in code fence')
  const headerCount = (output.match(/^#{1,3}\s+\S+/gm) || []).length
  if (headerCount < 2) problems.push(`too few markdown headers (${headerCount})`)
  if (output.trim().length < 50) problems.push('output too short')
  return { ok: problems.length === 0, problems, headerCount }
}

async function callModel(messages) {
  const url = `${baseURL.replace(/\/$/, '')}/chat/completions`
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({ model, messages, temperature })
  })
  if (!response.ok) {
    const body = await response.text()
    throw new Error(`HTTP ${response.status}: ${body.slice(0, 500)}`)
  }
  const data = await response.json()
  return data?.choices?.[0]?.message?.content ?? ''
}

async function main() {
  await warnIfDistStale()
  const templates = loadTemplates()
  const template = templates.find((item) => item.id === templateId)
  if (!template) {
    throw new Error(`template not found: ${templateId}. Available optimize ids: ${templates.filter((t) => t.metadata?.templateType === 'optimize').map((t) => t.id).join(', ')}`)
  }

  const benchmarkFile = JSON.parse(await readFile(resolve(__dirname, 'benchmarks.json'), 'utf8'))
  const benchmarks = benchmarkFile.benchmarks || []
  await mkdir(outDir, { recursive: true })

  if (dryRun) {
    const payloads = benchmarks.map((benchmark) => ({
      id: benchmark.id,
      messages: renderTemplate(template, benchmark.prompt)
    }))
    const file = resolve(outDir, `payloads-${templateId}.json`)
    await writeFile(file, `${JSON.stringify(payloads, null, 2)}\n`, 'utf8')
    const sample = payloads[0]?.messages?.map((m) => `${m.role}: ${m.content.length} chars`).join(', ')
    console.log(`[dry-run] template=${templateId} benchmarks=${payloads.length} file=${file}`)
    console.log(`[dry-run] sample=${payloads[0]?.id} -> ${sample}`)
    return
  }

  if (!baseURL || !apiKey || !model) {
    throw new Error('live mode requires BASELINE_BASE_URL / BASELINE_API_KEY / BASELINE_MODEL')
  }

  const results = []
  for (const benchmark of benchmarks) {
    for (let run = 1; run <= runs; run += 1) {
      const messages = renderTemplate(template, benchmark.prompt)
      const started = Date.now()
      let output = ''
      let error = ''
      try {
        output = await callModel(messages)
      } catch (e) {
        error = e instanceof Error ? e.message : String(e)
      }
      const check = output ? checkOutput(benchmark.prompt, output) : { ok: false, problems: ['no output'], headerCount: 0 }
      results.push({
        benchmarkId: benchmark.id,
        language: benchmark.language,
        category: benchmark.category,
        run,
        durationMs: Date.now() - started,
        error,
        conformance: check,
        output
      })
      process.stdout.write('.')
    }
  }
  process.stdout.write('\n')

  const file = resolve(outDir, `results-${templateId}.json`)
  await writeFile(file, `${JSON.stringify({ templateId, model, runs, results }, null, 2)}\n`, 'utf8')

  const okCount = results.filter((item) => item.conformance.ok).length
  const failed = results.filter((item) => !item.conformance.ok)
  const durations = results.map((item) => item.durationMs)
  console.log(`[baseline] template=${templateId} model=${model} cases=${results.length} conformance=${okCount}/${results.length} avgMs=${Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)}`)
  for (const item of failed.slice(0, 10)) {
    console.log(`  - ${item.benchmarkId}#${item.run}: ${item.conformance.problems.join('; ')}${item.error ? ` | ${item.error}` : ''}`)
  }
  console.log(`[baseline] results written to ${file}`)
  console.log('[baseline] 对比方式：改动前后各跑一次，比较 conformance 通过率、平均耗时与输出 diff（人工抽样）')
}

main().catch((error) => {
  console.error(`[eval-baseline] ${error instanceof Error ? error.message : String(error)}`)
  process.exit(1)
})
