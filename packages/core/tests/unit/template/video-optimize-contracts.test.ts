import { describe, expect, it } from 'vitest'

import { TemplateProcessor, type TemplateContext } from '../../../src/services/template/processor'
import type { Template } from '../../../src/services/template/types'
import { template as videoGeneralZh } from '../../../src/services/template/default-templates/video-optimize/text2video/general-video-optimize'
import { template as videoGeneralEn } from '../../../src/services/template/default-templates/video-optimize/text2video/general-video-optimize_en'
import { template as videoImageZh } from '../../../src/services/template/default-templates/video-optimize/image2video/general-video-image-optimize'
import { template as videoImageEn } from '../../../src/services/template/default-templates/video-optimize/image2video/general-video-image-optimize_en'

/**
 * 视频模板（text2video / image2video）渲染合同：
 * 1. 内置变量渲染后无 {{originalPrompt}} / {{helpers...}} 残留
 * 2. 用户输入中的双花括号占位符（如 {{tone}}）逐字保留
 * 3. 输出指令为 Markdown 且至少 3 个二级标题、结尾代码围栏约定存在
 * 4. image2video 声明首帧参考图语义，图片清单经 toJson/原文注入且无 b64 泄漏
 */

const countH2 = (text: string): number => (text.match(/^##\s+\S+/gm) || []).length

const renderCombined = (template: Template, context: TemplateContext) => {
  const messages = TemplateProcessor.processTemplate(template, context)
  return {
    messages,
    combined: messages.map((message) => message.content).join('\n'),
  }
}

const TEXT2VIDEO_CONTEXT: TemplateContext = {
  originalPrompt: '一只橘猫在窗台上伸懒腰，整体 {{tone}} 色调',
}

const IMAGE2VIDEO_CONTEXT: TemplateContext = {
  originalPrompt: '让画面中的云海缓缓流动，整体 {{tone}} 色调',
  hasInputImages: true,
  inputImageCount: 1,
  inputImagesJson: '[{"index":1,"label":"图1","mimeType":"image/png"}]',
}

describe('video optimize template contracts', () => {
  it.each([
    ['video-general-optimize-zh', videoGeneralZh],
    ['video-general-optimize-en', videoGeneralEn],
  ])('renders text2video template %s without unreplaced builtin placeholders', (_label, template) => {
    const { messages, combined } = renderCombined(template, TEXT2VIDEO_CONTEXT)

    expect(messages).toHaveLength(2)
    expect(messages[0].role).toBe('system')
    expect(messages[1].role).toBe('user')

    expect(combined).not.toContain('{{originalPrompt}}')
    expect(combined).not.toContain('{{helpers')
    expect(combined).not.toContain('{{=<% %>=}}')
    // 用户输入中的占位符必须逐字保留（供后续变量注入）
    expect(combined).toContain('{{tone}}')
  })

  it.each([
    ['video-general-optimize-zh', videoGeneralZh],
    ['video-general-optimize-en', videoGeneralEn],
  ])('keeps the markdown structure contract for %s', (_label, template) => {
    const { messages, combined } = renderCombined(template, TEXT2VIDEO_CONTEXT)

    expect(countH2(combined)).toBeGreaterThanOrEqual(3)
    expect(combined).toContain('```')
    // JSON 证据包裹：originalPrompt 作为 JSON 字段注入
    expect(messages.find((message) => message.role === 'user')?.content).toContain('"originalPrompt"')
  })

  it.each([
    ['video-image-optimize-zh', videoImageZh],
    ['video-image-optimize-en', videoImageEn],
  ])('renders image2video template %s without unreplaced builtin placeholders', (_label, template) => {
    const { combined } = renderCombined(template, IMAGE2VIDEO_CONTEXT)

    expect(combined).not.toContain('{{originalPrompt}}')
    expect(combined).not.toContain('{{inputImageCount}}')
    expect(combined).not.toContain('{{inputImagesJson}}')
    expect(combined).not.toContain('{{hasInputImages}}')
    expect(combined).not.toContain('{{=<% %>=}}')
    expect(combined).toContain('{{tone}}')
  })

  it.each([
    ['video-image-optimize-zh', videoImageZh, '图1', '首帧'],
    ['video-image-optimize-en', videoImageEn, 'Image 1', 'first frame'],
  ])('declares attached first-frame image semantics for %s', (_label, template, imageLabel, firstFrameTerm) => {
    const { combined } = renderCombined(template, IMAGE2VIDEO_CONTEXT)

    expect(countH2(combined)).toBeGreaterThanOrEqual(3)
    expect(combined).toContain('```')
    // 图片清单以原文注入且无 base64 泄漏（对照 image 系模板合同）
    expect(combined).toContain('image/png')
    expect(combined).toContain(imageLabel)
    expect(combined.toLowerCase()).toContain(firstFrameTerm)
    expect(combined).not.toContain('"b64"')
  })

  it('hides the attached-image block for image2video when no images are provided', () => {
    const { combined } = renderCombined(videoImageZh, {
      originalPrompt: '让画面中的云海缓缓流动',
    })

    expect(combined).not.toContain('image/png')
    expect(combined).toContain('未附带首帧参考图')
  })
})
