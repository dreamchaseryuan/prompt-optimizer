/**
 * {{variable}} 占位符守卫
 *
 * 优化/迭代链路要求原始提示词中的 Mustache 风格占位符（如 {{topic}}、{{{var}}}）
 * 在输出中被逐字保留。本模块提供：
 * 1. 从源文本提取占位符集合
 * 2. 校验输出文本是否保留了全部占位符（缺失 / 被改写）
 *
 * 设计为纯函数，不依赖任何服务，便于门禁测试与运行时接入复用。
 */

/** 占位符校验结果 */
export interface PlaceholderCheckResult {
  /** 是否全部保留 */
  ok: boolean
  /** 源文本中存在、但输出中完全缺失的占位符 */
  missing: string[]
  /** 输出中存在形似变体（仅空白/大小写差异）但未逐字保留的占位符 */
  altered: string[]
}

/**
 * 判断一段 Mustache 标签是否为结构标签（section/注释/部分/分隔符切换等），
 * 这些标签不构成运行时变量占位符。
 */
function isStructuralTag(inner: string): boolean {
  const trimmed = inner.trim()
  if (!trimmed) return true
  // 结构前缀：# section、^ inverted、/ close、! comment、> partial、& raw、
  // 以及 {{=<% %>=}} 之类的分隔符切换指令
  return /^[#^/><!|=]/.test(trimmed)
}

/**
 * 从文本中提取变量占位符名称集合（去重，保留首次出现的书写形式）。
 *
 * 支持双花括号与三花括号：
 * - {{name}}、{{{name}}}、{{& name}}
 * - 忽略结构标签：{{#x}}、{{/x}}、{{^x}}、{{!c}}、{{>p}}、{{=<% %>=}}
 * - 忽略 Mustache 分隔符切换区间内的内容（{{=<% %>=}}...<%={{ }}=%>），
 *   该区间是模板作者写给 LLM 的字面示例，不是本层变量。
 */
export function extractMustachePlaceholders(text: string): string[] {
  if (!text) return []

  const result: string[] = []
  const seen = new Set<string>()

  // 去掉分隔符切换区间，避免把示例占位符当成本层变量
  const stripped = text.replace(
    /\{\{=<%[\s\S]*?<%=\{\{\s*\}\}=%>/g,
    '',
  )

  const tagPattern = /\{\{\{?\s*([^{}]+?)\s*\}?\}\}/g
  let match: RegExpExecArray | null
  while ((match = tagPattern.exec(stripped)) !== null) {
    const inner = match[1]
    if (isStructuralTag(inner)) continue
    // {{& name}} 中的 & 是"不转义"前缀，变量名是 name
    const name = inner.replace(/^&\s*/, '').trim()
    if (!name) continue
    if (seen.has(name)) continue
    seen.add(name)
    result.push(name)
  }

  return result
}

/**
 * 归一化占位符名，用于"被改写"检测（仅空白/大小写差异视为变体）。
 */
function normalizePlaceholderName(name: string): string {
  return name.replace(/\s+/g, '').toLowerCase()
}

/**
 * 校验输出文本是否逐字保留了期望的占位符。
 *
 * @param outputText 优化/迭代结果文本
 * @param expectedPlaceholders 期望保留的占位符名称数组；
 *        也可直接传原始提示词文本，会自动提取其中的占位符
 */
export function checkPlaceholdersPreserved(
  outputText: string,
  expectedPlaceholders: string[] | string,
): PlaceholderCheckResult {
  const expected = Array.isArray(expectedPlaceholders)
    ? expectedPlaceholders
    : extractMustachePlaceholders(expectedPlaceholders)

  const output = outputText || ''
  const outputNames = new Set(extractMustachePlaceholders(output))
  const outputNormalized = new Set(
    Array.from(outputNames).map(normalizePlaceholderName),
  )

  const missing: string[] = []
  const altered: string[] = []

  for (const name of expected) {
    if (output.includes(`{{${name}}}`) || output.includes(`{{{${name}}}}`)) {
      continue
    }
    const normalized = normalizePlaceholderName(name)
    if (outputNormalized.has(normalized)) {
      altered.push(name)
    } else {
      missing.push(name)
    }
  }

  return {
    ok: missing.length === 0 && altered.length === 0,
    missing,
    altered,
  }
}
