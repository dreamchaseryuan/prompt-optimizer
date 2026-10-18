import { describe, expect, it } from 'vitest'

import {
  analysisJsonContractEn,
  analysisJsonContractZh,
  compareJsonContractEn,
  compareJsonContractZh,
  resultJsonContractEn,
  resultJsonContractZh,
} from '../../../src/services/template/default-templates/evaluation/builders'
import { ALL_TEMPLATES } from '../../../src/services/template/default-templates'

/**
 * 评估 Output Contract 结构门禁：
 * 1. 六份 JSON 契约（analysis/result/compare × zh/en）维度 key、取值范围、
 *    patchPlan/op 字段声明齐全
 * 2. 工厂生成的 16 个内置评估模板 system 侧都内嵌了契约文本与"只输出合法 JSON"纪律
 * 3. analysis（prompt-only/iterate）模板保留 patchPlan 空匹配守卫规则
 */

const DESIGN_DIMENSION_KEYS = [
  'goalClarity',
  'instructionCompleteness',
  'structuralExecutability',
  'ambiguityControl',
  'robustness',
]

const EXECUTION_DIMENSION_KEYS = [
  'goalAchievement',
  'outputQuality',
  'constraintCompliance',
  'promptEffectiveness',
]

const COMPARE_DIMENSION_KEYS = [
  'goalAchievementRobustness',
  'outputQualityCeiling',
  'promptPatternQuality',
  'crossSnapshotRobustness',
  'workspaceTransferability',
]

const stripJsonFence = (contract: string): string =>
  contract.replace(/^```json\s*/, '').replace(/\s*```$/, '')

const assertDimensionKeys = (contract: string, expectedKeys: string[]) => {
  const keyMatches = contract.match(/"key":\s*"([a-zA-Z]+)"/g) ?? []
  const keys = keyMatches.map((item) => item.match(/"key":\s*"([a-zA-Z]+)"/)![1])
  expect(keys).toEqual(expectedKeys)
}

describe('evaluation output contract guardrails', () => {
  it('analysis contract declares 5 design dimensions with 0-100 ranges and patchPlan op', () => {
    for (const contract of [analysisJsonContractZh, analysisJsonContractEn]) {
      expect(contract).toMatch(/^```json\n[\s\S]+\n```$/)
      assertDimensionKeys(stripJsonFence(contract), DESIGN_DIMENSION_KEYS)
      expect((contract.match(/<0-100>/g) ?? []).length).toBeGreaterThanOrEqual(6)
      expect(contract).toContain('"op"')
      expect(contract).toContain('"oldText"')
      expect(contract).toContain('"newText"')
      expect(contract).toContain('"patchPlan"')
      expect(contract).toContain('"improvements"')
      expect(contract).toContain('"summary"')
    }
  })

  it('result contract declares 4 execution dimensions', () => {
    for (const contract of [resultJsonContractZh, resultJsonContractEn]) {
      assertDimensionKeys(stripJsonFence(contract), EXECUTION_DIMENSION_KEYS)
      expect(contract).not.toContain('"patchPlan"')
    }
  })

  it('compare contract declares 5 compare dimensions and stop-signal enums', () => {
    for (const contract of [compareJsonContractZh, compareJsonContractEn]) {
      assertDimensionKeys(stripJsonFence(contract), COMPARE_DIMENSION_KEYS)
      expect(contract).toContain('"compareMode": "generic | structured"')
      expect(contract).toContain('target | baseline | reference | referenceBaseline | replica | auxiliary')
      expect(contract).toContain('"targetVsBaseline": "improved | flat | regressed"')
      expect(contract).toContain('"targetVsReferenceGap": "none | minor | major"')
      expect(contract).toContain('"improvementHeadroom": "none | low | medium | high"')
      expect(contract).toContain('"overfitRisk": "low | medium | high"')
      expect(contract).toContain('"stopRecommendation": "continue | stop | review"')
    }
  })

  it('embeds the output contract and JSON-only discipline in every analysis/result/compare evaluation template', () => {
    // 只覆盖产出评估 JSON 的三类模板（analysis/result/compare）。
    // evaluation-rewrite-* 只输出重写后的提示词文本、evaluation-structured-compare-*
    // 有独立契约（pair-judge/synthesis），不属于本门禁范围。
    const evaluationTemplates = Object.values(ALL_TEMPLATES).filter(
      (template) =>
        template.metadata.templateType === 'evaluation'
        && template.isBuiltin
        && !template.id.startsWith('evaluation-rewrite')
        && !template.id.startsWith('evaluation-structured-compare'),
    )
    // basic/pro × system/user × prompt-only/iterate/result/compare = 16，另有图像评估模板
    expect(evaluationTemplates.length).toBeGreaterThanOrEqual(16)

    const failures: string[] = []
    for (const template of evaluationTemplates) {
      if (!Array.isArray(template.content)) {
        failures.push(`${template.id}: content is not a message array`)
        continue
      }
      const system = template.content.find((message) => message.role === 'system')?.content ?? ''
      const isEn = template.metadata.language === 'en'
      const jsonOnlyPattern = isEn ? /Return valid JSON only/ : /只输出合法 JSON/
      const contractMarker = isEn ? '```json' : '```json'

      if (!jsonOnlyPattern.test(system)) {
        failures.push(`${template.id}: missing JSON-only discipline`)
      }
      if (!system.includes(contractMarker)) {
        failures.push(`${template.id}: missing json-fenced output contract`)
      }
      if (!/0-100/.test(system)) {
        failures.push(`${template.id}: missing 0-100 score range declaration`)
      }
    }
    expect(failures).toEqual([])
  })

  it('keeps the patchPlan empty-match guard rule in analysis templates (zh/en)', () => {
    const analysisTemplates = Object.values(ALL_TEMPLATES).filter(
      (template) =>
        template.metadata.templateType === 'evaluation'
        && (template.id.includes('prompt-only') || template.id.includes('prompt-iterate'))
        && template.isBuiltin,
    )
    expect(analysisTemplates.length).toBeGreaterThanOrEqual(8)

    const failures: string[] = []
    for (const template of analysisTemplates) {
      const system = Array.isArray(template.content)
        ? template.content.find((message) => message.role === 'system')?.content ?? ''
        : ''
      // 守卫规则：oldText 必须能精确匹配真实文本，无法映射时 patchPlan 返回 []。
      // 不同模板族的等价表述：matched exactly / exact local edit /
      // real non-empty text；精确匹配 / 精确落点 / 真实存在的非空文本 / 真实片段。
      const exactRulePattern =
        /matched exactly|exact local edit|real non-empty text|精确匹配|精确落点|真实存在的非空文本|真实片段/i
      const emptyFallbackPattern = /patchPlan must be \[\]|patchPlan 必须返回 \[\]/
      if (!exactRulePattern.test(system)) {
        failures.push(`${template.id}: missing exact-match rule for patchPlan`)
      }
      if (!emptyFallbackPattern.test(system)) {
        failures.push(`${template.id}: missing patchPlan empty fallback rule`)
      }
    }
    expect(failures).toEqual([])
  })
})
