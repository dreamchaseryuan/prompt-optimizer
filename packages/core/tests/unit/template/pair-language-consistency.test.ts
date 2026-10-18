import { describe, expect, it } from 'vitest'

import { ALL_TEMPLATES } from '../../../src/services/template/default-templates'
import type { Template } from '../../../src/services/template/types'

/**
 * 内置模板 _zh/_en 成对一致性静态门禁：
 * 1. 同一 templateType 下中英文模板数量一致
 * 2. 同 id 中英文模板的 Mustache 标签集合一致（变量/条件区块/lambda）
 *
 * Mustache 标签提取规则：
 * - 先剥离 {{=<% %>=}}...<%={{ }}=%> 分隔符切换区间（其中的 {{xxx}} 是写给
 *   LLM 的字面示例，不属于本层变量契约）
 * - 再提取 {{var}}/{{{var}}}/{{#sec}}/{{^sec}}/{{/sec}}/{{& var}} 标签并归一化
 */

const DELIMITER_SWITCH_PATTERN = /\{\{=<%[\s\S]*?<%=\{\{\s*\}\}=%>/g
const TAG_PATTERN = /\{\{\{?\s*([^{}]+?)\s*\}?\}\}/g

type TagSet = Set<string>

const collectTemplateContents = (template: Template): string[] => {
  if (typeof template.content === 'string') {
    return [template.content]
  }
  if (Array.isArray(template.content)) {
    return template.content.map((message) => message.content)
  }
  return []
}

const normalizeTag = (inner: string): string | null => {
  const trimmed = inner.trim()
  if (!trimmed) return null
  // 结构前缀：# section、^ inverted、/ close、& raw、> partial、! comment、= 分隔符
  const structural = trimmed.match(/^([#^/&>=!]?)\s*(.+)$/)
  if (!structural) return null
  const prefix = structural[1]
  const name = structural[2].trim()
  if (!name) return null
  // 注释/分隔符指令不参与契约
  if (prefix === '!' || prefix === '=') return null
  return `${prefix}${name}`
}

const extractMustacheTags = (content: string): TagSet => {
  const tags: TagSet = new Set()
  const stripped = content.replace(DELIMITER_SWITCH_PATTERN, '')
  let match: RegExpExecArray | null
  TAG_PATTERN.lastIndex = 0
  while ((match = TAG_PATTERN.exec(stripped)) !== null) {
    const normalized = normalizeTag(match[1])
    if (normalized) tags.add(normalized)
  }
  return tags
}

const templateTagSet = (template: Template): TagSet => {
  const all: TagSet = new Set()
  for (const content of collectTemplateContents(template)) {
    for (const tag of extractMustacheTags(content)) {
      all.add(tag)
    }
  }
  return all
}

const diffTagSets = (zh: TagSet, en: TagSet): { zhOnly: string[]; enOnly: string[] } => {
  const zhOnly = Array.from(zh).filter((tag) => !en.has(tag)).sort()
  const enOnly = Array.from(en).filter((tag) => !zh.has(tag)).sort()
  return { zhOnly, enOnly }
}

describe('builtin template zh/en pairing consistency', () => {
  const templates = Object.values(ALL_TEMPLATES)

  it('has identical zh/en template counts for every templateType', () => {
    const counts = new Map<string, { zh: number; en: number }>()
    for (const template of templates) {
      const { templateType, language } = template.metadata
      if (language !== 'zh' && language !== 'en') continue
      const entry = counts.get(templateType) ?? { zh: 0, en: 0 }
      entry[language] += 1
      counts.set(templateType, entry)
    }

    const mismatches: string[] = []
    for (const [templateType, { zh, en }] of counts) {
      if (zh !== en) {
        mismatches.push(`${templateType}: zh=${zh} en=${en}`)
      }
    }
    expect(mismatches).toEqual([])
  })

  it('pairs every zh template with an en template', () => {
    // 成对命名约定有两种：
    // 1. 同 id（optimize/user-optimize/iterate/evaluation 系列）
    // 2. en 侧 id 追加 "-en" 后缀（image/context/structured-compare 系列）
    const normalizePairKey = (id: string): string => id.replace(/-en$/, '')

    const byPairKey = new Map<string, { zh?: Template; en?: Template }>()
    for (const template of templates) {
      const { language } = template.metadata
      if (language !== 'zh' && language !== 'en') continue
      const key = normalizePairKey(template.id)
      const entry = byPairKey.get(key) ?? {}
      entry[language] = template
      byPairKey.set(key, entry)
    }

    const unpaired: string[] = []
    for (const [key, { zh, en }] of byPairKey) {
      if ((zh && !en) || (!zh && en)) {
        unpaired.push(`${key}: ${zh ? 'zh-only' : 'en-only'}`)
      }
    }
    expect(unpaired).toEqual([])
  })

  it('keeps the Mustache tag set identical between zh and en of the same id', () => {
    const byId = new Map<string, { zh?: Template; en?: Template }>()
    for (const template of templates) {
      const { language } = template.metadata
      if (language !== 'zh' && language !== 'en') continue
      const entry = byId.get(template.id) ?? {}
      entry[language] = template
      byId.set(template.id, entry)
    }

    const failures: string[] = []
    for (const [id, { zh, en }] of byId) {
      if (!zh || !en) continue
      const { zhOnly, enOnly } = diffTagSets(templateTagSet(zh), templateTagSet(en))
      if (zhOnly.length > 0 || enOnly.length > 0) {
        failures.push(
          `${id}: zh-only tags=[${zhOnly.join(', ')}] en-only tags=[${enOnly.join(', ')}]`,
        )
      }
    }
    expect(failures).toEqual([])
  })
})
