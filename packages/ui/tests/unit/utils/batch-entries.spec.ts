import { describe, expect, it } from 'vitest'
import { MAX_BATCH_ENTRIES, parseBatchEntries } from '../../../src/utils/batch-entries'

describe('batch-entries', () => {
  it('splits entries by blank lines', () => {
    expect(parseBatchEntries('first\n\nsecond')).toEqual(['first', 'second'])
  })

  it('keeps multi-line prompts intact', () => {
    expect(parseBatchEntries('line a\nline b\n\nline c\nline d')).toEqual([
      'line a\nline b',
      'line c\nline d',
    ])
  })

  it('trims whitespace and drops empty entries', () => {
    expect(parseBatchEntries('  first  \n\n\n\n   \n\n  second  ')).toEqual(['first', 'second'])
  })

  it('caps entries at the configured maximum', () => {
    const raw = Array.from({ length: MAX_BATCH_ENTRIES + 5 }, (_, index) => `p${index}`).join('\n\n')
    const entries = parseBatchEntries(raw)
    expect(entries).toHaveLength(MAX_BATCH_ENTRIES)
    expect(entries[MAX_BATCH_ENTRIES - 1]).toBe(`p${MAX_BATCH_ENTRIES - 1}`)
  })

  it('respects a custom maximum', () => {
    expect(parseBatchEntries('a\n\nb\n\nc', 2)).toEqual(['a', 'b'])
  })

  it('returns an empty array for blank input', () => {
    expect(parseBatchEntries('')).toEqual([])
    expect(parseBatchEntries('   \n\n  ')).toEqual([])
  })
})
