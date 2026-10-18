import { describe, expect, it } from 'vitest'
import { ALL_TEMPLATES } from '../../../src/services/template/default-templates'
import type { Template } from '../../../src/services/template/types'

/**
 * 内置模板领域标记（metadata.domain）门禁。
 *
 * 背景：通用编程领域模板通过 metadata.domain='programming' 在 Web UI
 * 模板下拉中独立成组展示（通用 / 领域 / 用户自定义）。本门禁防止：
 * 1. 新增领域模板漏标 domain —— UI 分组静默失效
 * 2. zh/en 成对模板 domain 不一致 —— 语言切换后模板跳出分组
 * 3. 其他内置模板被误标 domain —— 意外改变既有下拉分组行为
 */

const PROGRAMMING_DOMAIN = 'programming'
const EXPECTED_PROGRAMMING_TEMPLATE_COUNT = 8 // 4 个场景 × zh/en

describe('builtin template domain metadata', () => {
  const templates = Object.values(ALL_TEMPLATES).filter(Boolean) as Template[]

  it('marks every programming domain template with domain=programming', () => {
    const programming = templates.filter(
      template => template.metadata?.domain === PROGRAMMING_DOMAIN
    )
    expect(programming.map(template => template.id).sort()).toEqual(
      [
        'algorithm-explain-optimize',
        'code-review-optimize',
        'error-diagnosis-optimize',
        'refactor-suggest-optimize'
      ].flatMap(id => [id, id])
    )
    expect(programming.length).toBe(EXPECTED_PROGRAMMING_TEMPLATE_COUNT)
  })

  it('keeps zh/en pairs aligned on domain value', () => {
    const byId = new Map<string, Partial<Record<'zh' | 'en', Template>>>()
    for (const template of templates) {
      const language = template.metadata?.language
      if (language !== 'zh' && language !== 'en') continue
      const entry = byId.get(template.id) ?? {}
      entry[language] = template
      byId.set(template.id, entry)
    }

    for (const [id, pair] of byId) {
      const zhDomain = pair.zh?.metadata?.domain
      const enDomain = pair.en?.metadata?.domain
      expect(zhDomain, `template ${id}: zh/en domain mismatch`).toBe(enDomain)
    }
  })

  it('does not allow other builtin templates to carry a domain tag', () => {
    const unexpected = templates.filter(
      template =>
        typeof template.metadata?.domain === 'string' &&
        template.metadata.domain !== PROGRAMMING_DOMAIN
    )
    expect(
      unexpected.map(template => `${template.id}(${template.metadata.domain})`)
    ).toEqual([])
  })
})
