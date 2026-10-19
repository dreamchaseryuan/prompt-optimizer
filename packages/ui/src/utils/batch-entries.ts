/**
 * 批量优化输入解析。
 *
 * 约定：条目之间用空行分隔，单条提示词可跨多行（真实提示词常为多行）。
 * 解析结果做 trim、丢弃空条目，并按上限截断。
 */

export const MAX_BATCH_ENTRIES = 50

export const parseBatchEntries = (
  raw: string,
  maxEntries: number = MAX_BATCH_ENTRIES,
): string[] =>
  raw
    .split(/\n\s*\n+/)
    .map((block) => block.trim())
    .filter((block) => block.length > 0)
    .slice(0, maxEntries)
