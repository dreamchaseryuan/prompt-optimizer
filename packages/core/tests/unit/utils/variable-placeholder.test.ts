import { describe, expect, it } from 'vitest'

import {
  extractMustachePlaceholders,
  checkPlaceholdersPreserved,
} from '../../../src/utils/variable-placeholder'

describe('extractMustachePlaceholders', () => {
  it('extracts double and triple brace placeholders', () => {
    expect(extractMustachePlaceholders('写一首关于{{topic}}的诗')).toEqual(['topic'])
    expect(extractMustachePlaceholders('写一首关于{{{topic}}}的诗')).toEqual(['topic'])
  })

  it('deduplicates while preserving first occurrence order', () => {
    expect(extractMustachePlaceholders('{{a}} {{b}} {{a}} {{& c}}')).toEqual(['a', 'b', 'c'])
  })

  it('ignores structural tags and comments', () => {
    expect(
      extractMustachePlaceholders('{{#hasFocus}}x{{/hasFocus}}{{^hasFocus}}y{{/hasFocus}}{{!note}}{{>partial}}'),
    ).toEqual([])
  })

  it('ignores literal placeholder examples inside delimiter-switch segments', () => {
    const text = '保留 {{=<% %>=}}{{location_theme}}<%={{ }}=%>} 占位符，同时保留 {{real_var}}'
    expect(extractMustachePlaceholders(text)).toEqual(['real_var'])
  })

  it('handles whitespace and raw-prefix variants', () => {
    expect(extractMustachePlaceholders('{{ topic }} 与 {{& style }}')).toEqual(['topic', 'style'])
  })

  it('returns empty array for empty or undefined-like input', () => {
    expect(extractMustachePlaceholders('')).toEqual([])
    expect(extractMustachePlaceholders(undefined as unknown as string)).toEqual([])
  })
})

describe('checkPlaceholdersPreserved', () => {
  it('passes when every placeholder is preserved verbatim', () => {
    const check = checkPlaceholdersPreserved(
      '写一首关于{{topic}}的{{style}}诗',
      '写一首关于{{topic}}的{{style}}诗，不要解释',
    )
    expect(check.ok).toBe(true)
    expect(check.missing).toEqual([])
    expect(check.altered).toEqual([])
  })

  it('accepts a placeholder name array as source', () => {
    const check = checkPlaceholdersPreserved('输出 {{topic}}', ['topic', 'audience'])
    expect(check.ok).toBe(false)
    expect(check.missing).toEqual(['audience'])
  })

  it('reports missing placeholders when the model fills them with concrete values', () => {
    const check = checkPlaceholdersPreserved(
      '生成一张赛博朋克风格的城市夜景图',
      '生成一张{{style}}风格的{{scene}}图',
    )
    expect(check.ok).toBe(false)
    expect(check.missing).toEqual(['style', 'scene'])
    expect(check.altered).toEqual([])
  })

  it('reports altered placeholders when only whitespace/case differs', () => {
    const check = checkPlaceholdersPreserved('写一首关于{{ Topic }}的诗', '写一首关于{{Topic}}的诗')
    expect(check.ok).toBe(false)
    expect(check.missing).toEqual([])
    expect(check.altered).toEqual(['Topic'])
  })

  it('treats triple-brace output as preserved', () => {
    const check = checkPlaceholdersPreserved('值：{{{topic}}}', '值：{{topic}}')
    expect(check.ok).toBe(true)
  })

  it('passes for outputs without placeholders when source has none', () => {
    expect(checkPlaceholdersPreserved('纯文本输出', '纯文本源').ok).toBe(true)
  })
})
