/**
 * 轻量行级文本 diff（LCS）。
 *
 * 用途：收藏夹提示词版本对比（PromptContentVersion.content 经
 * promptContentToEditableText 投影为纯文本后做行级差异）。
 *
 * 设计约束：
 * - 零依赖、O(n*m) 动态规划；提示词体量通常在数百行内
 * - 超大连乘规模（> MAX_DP_CELLS）退化为「公共前后缀 + 中间整块替换」，
 *   保证正确性（不会漏行）而放弃细粒度对齐
 */

export type DiffLineType = 'equal' | 'add' | 'remove'

export interface DiffLine {
  type: DiffLineType
  text: string
  /** 左侧（旧版）行号，1-based；仅 add 行为 null */
  leftLineNumber: number | null
  /** 右侧（新版）行号，1-based；仅 remove 行为 null */
  rightLineNumber: number | null
}

export interface DiffResult {
  lines: DiffLine[]
  added: number
  removed: number
}

const MAX_DP_CELLS = 1_000_000

export const splitDiffLines = (text: string): string[] =>
  text.replace(/\r\n?/g, '\n').split('\n')

export const diffTextLines = (leftText: string, rightText: string): DiffResult => {
  const left = splitDiffLines(leftText)
  const right = splitDiffLines(rightText)

  const lines =
    left.length * right.length > MAX_DP_CELLS
      ? diffByTrimmingCommonEdges(left, right)
      : diffByLcs(left, right)

  let added = 0
  let removed = 0
  for (const line of lines) {
    if (line.type === 'add') added += 1
    if (line.type === 'remove') removed += 1
  }

  return { lines, added, removed }
}

const diffByLcs = (left: string[], right: string[]): DiffLine[] => {
  const rows = left.length
  const cols = right.length
  // dp[i][j] = LCS length of left[i:] and right[j:]
  const dp: number[][] = Array.from({ length: rows + 1 }, () =>
    new Array<number>(cols + 1).fill(0),
  )

  for (let i = rows - 1; i >= 0; i -= 1) {
    for (let j = cols - 1; j >= 0; j -= 1) {
      dp[i][j] =
        left[i] === right[j]
          ? dp[i + 1][j + 1] + 1
          : Math.max(dp[i + 1][j], dp[i][j + 1])
    }
  }

  const result: DiffLine[] = []
  let i = 0
  let j = 0
  while (i < rows && j < cols) {
    if (left[i] === right[j]) {
      result.push({ type: 'equal', text: left[i], leftLineNumber: i + 1, rightLineNumber: j + 1 })
      i += 1
      j += 1
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      result.push({ type: 'remove', text: left[i], leftLineNumber: i + 1, rightLineNumber: null })
      i += 1
    } else {
      result.push({ type: 'add', text: right[j], leftLineNumber: null, rightLineNumber: j + 1 })
      j += 1
    }
  }
  while (i < rows) {
    result.push({ type: 'remove', text: left[i], leftLineNumber: i + 1, rightLineNumber: null })
    i += 1
  }
  while (j < cols) {
    result.push({ type: 'add', text: right[j], leftLineNumber: null, rightLineNumber: j + 1 })
    j += 1
  }
  return result
}

const diffByTrimmingCommonEdges = (left: string[], right: string[]): DiffLine[] => {
  let prefix = 0
  while (prefix < left.length && prefix < right.length && left[prefix] === right[prefix]) {
    prefix += 1
  }
  let suffix = 0
  while (
    suffix < left.length - prefix &&
    suffix < right.length - prefix &&
    left[left.length - 1 - suffix] === right[right.length - 1 - suffix]
  ) {
    suffix += 1
  }

  const result: DiffLine[] = []
  for (let i = 0; i < prefix; i += 1) {
    result.push({ type: 'equal', text: left[i], leftLineNumber: i + 1, rightLineNumber: i + 1 })
  }
  const leftMiddleEnd = left.length - suffix
  const rightMiddleEnd = right.length - suffix
  for (let i = prefix; i < leftMiddleEnd; i += 1) {
    result.push({ type: 'remove', text: left[i], leftLineNumber: i + 1, rightLineNumber: null })
  }
  for (let j = prefix; j < rightMiddleEnd; j += 1) {
    result.push({ type: 'add', text: right[j], leftLineNumber: null, rightLineNumber: j + 1 })
  }
  for (let k = suffix; k > 0; k -= 1) {
    const leftIndex = left.length - k
    const rightIndex = right.length - k
    result.push({
      type: 'equal',
      text: left[leftIndex],
      leftLineNumber: leftIndex + 1,
      rightLineNumber: rightIndex + 1,
    })
  }
  return result
}
