import { describe, expect, it } from 'vitest'
import { diffTextLines, splitDiffLines } from '../../../src/utils/text-diff'

describe('text-diff', () => {
  it('splits CRLF and CR into LF lines', () => {
    expect(splitDiffLines('a\r\nb\rc')).toEqual(['a', 'b', 'c'])
  })

  it('returns all equal lines for identical text', () => {
    const result = diffTextLines('line 1\nline 2', 'line 1\nline 2')
    expect(result.added).toBe(0)
    expect(result.removed).toBe(0)
    expect(result.lines.every((line) => line.type === 'equal')).toBe(true)
    expect(result.lines.map((line) => [line.leftLineNumber, line.rightLineNumber])).toEqual([
      [1, 1],
      [2, 2],
    ])
  })

  it('detects a single added line', () => {
    const result = diffTextLines('a\nc', 'a\nb\nc')
    expect(result.added).toBe(1)
    expect(result.removed).toBe(0)
    const added = result.lines.find((line) => line.type === 'add')
    expect(added).toMatchObject({ text: 'b', leftLineNumber: null, rightLineNumber: 2 })
    expect(result.lines.map((line) => line.text)).toEqual(['a', 'b', 'c'])
  })

  it('detects a modified line as remove + add', () => {
    const result = diffTextLines('keep\nold value\nkeep2', 'keep\nnew value\nkeep2')
    expect(result.added).toBe(1)
    expect(result.removed).toBe(1)
    const remove = result.lines.find((line) => line.type === 'remove')
    const add = result.lines.find((line) => line.type === 'add')
    expect(remove).toMatchObject({ text: 'old value', leftLineNumber: 2, rightLineNumber: null })
    expect(add).toMatchObject({ text: 'new value', leftLineNumber: null, rightLineNumber: 2 })
  })

  it('keeps stable line numbers across mixed edits', () => {
    const left = ['# Role', 'a', 'b', 'c']
    const right = ['# Role', 'b', 'c', 'd']
    const result = diffTextLines(left.join('\n'), right.join('\n'))
    expect(result.removed).toBe(1)
    expect(result.added).toBe(1)
    // 所有 equal 行的双侧行号必须一致偏移正确
    for (const line of result.lines) {
      if (line.type === 'remove') expect(line.rightLineNumber).toBeNull()
      if (line.type === 'add') expect(line.leftLineNumber).toBeNull()
      if (line.type === 'equal') {
        expect(line.leftLineNumber).not.toBeNull()
        expect(line.rightLineNumber).not.toBeNull()
      }
    }
  })

  it('handles empty input', () => {
    const result = diffTextLines('', '')
    expect(result.lines).toEqual([{ type: 'equal', text: '', leftLineNumber: 1, rightLineNumber: 1 }])
    expect(result.added).toBe(0)
    expect(result.removed).toBe(0)
  })

  it('falls back to edge-trimming for very large inputs', () => {
    const sharedPrefix = Array.from({ length: 1100 }, (_, index) => `p${index}`)
    const left = [...sharedPrefix, 'left-only']
    const right = [...sharedPrefix, 'right-only']
    const result = diffTextLines(left.join('\n'), right.join('\n'))
    expect(result.removed).toBe(1)
    expect(result.added).toBe(1)
    expect(result.lines[0]).toMatchObject({ type: 'equal', text: 'p0', leftLineNumber: 1, rightLineNumber: 1 })
    const lastEqual = result.lines[result.lines.length - 1]
    expect(lastEqual.type).toBe('add')
  })
})
