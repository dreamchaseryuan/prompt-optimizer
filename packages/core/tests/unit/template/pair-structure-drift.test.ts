import { describe, expect, it } from 'vitest'
import { ALL_TEMPLATES } from '../../../src/services/template/default-templates'
import type { Template } from '../../../src/services/template/types'

/**
 * zh/en 内置模板「结构一致性」门禁。
 *
 * 与 pair-language-consistency.test.ts 互补：
 * - 后者校验 Mustache 标签集合一致（模板变量层）
 * - 本门禁校验文档结构：## 小节数必须相等，列表条目数容差 2（模板文案层）
 *
 * 背景：2026-10 审计发现 user-prompt-basic 英文版缺少 Goals 小节、
 * 列表风格不一致，仅靠标签门禁无法发现。此用例用于防止同类退化。
 *
 * 长度比不做断言：中英文字符密度天然不同（英文约为中文的 2–2.8 倍）。
 */

type StructureStats = {
  sections: number
  bullets: number
  numbered: number
}

const LIST_TOLERANCE = 2

function statsOf(content: Template['content']): StructureStats {
  const text = Array.isArray(content)
    ? content.map((message) => (typeof message?.content === 'string' ? message.content : '')).join('\n')
    : String(content ?? '')

  return {
    sections: (text.match(/^#{2,3}\s+\S+/gm) || []).length,
    bullets: (text.match(/^\s*[-*]\s+\S+/gm) || []).length,
    numbered: (text.match(/^\s*\d+\.\s+\S+/gm) || []).length
  }
}

describe('zh/en builtin template structural parity', () => {
  const templates = Object.values(ALL_TEMPLATES).filter(Boolean) as Template[]
  const byId = new Map<string, Partial<Record<'zh' | 'en', Template>>>()

  for (const template of templates) {
    if (!template.id) continue
    const language = template.metadata?.language
    if (language !== 'zh' && language !== 'en') continue
    const entry = byId.get(template.id) ?? {}
    entry[language] = template
    byId.set(template.id, entry)
  }

  const pairs = [...byId.entries()].filter(
    (entry): entry is [string, { zh: Template; en: Template }] =>
      Boolean(entry[1].zh && entry[1].en)
  )

  it('covers every bilingual builtin template pair', () => {
    expect(pairs.length).toBeGreaterThanOrEqual(40)
  })

  it('keeps section and list-item structure aligned between zh and en', () => {
    const issues: string[] = []

    for (const [id, pair] of pairs) {
      const zh = statsOf(pair.zh.content)
      const en = statsOf(pair.en.content)

      if (zh.sections !== en.sections) {
        issues.push(`${id}: section count zh=${zh.sections} en=${en.sections}`)
      }
      if (Math.abs(zh.bullets - en.bullets) > LIST_TOLERANCE) {
        issues.push(`${id}: bullet count zh=${zh.bullets} en=${en.bullets}`)
      }
      if (Math.abs(zh.numbered - en.numbered) > LIST_TOLERANCE) {
        issues.push(`${id}: numbered count zh=${zh.numbered} en=${en.numbered}`)
      }
    }

    expect(issues).toEqual([])
  })
})
