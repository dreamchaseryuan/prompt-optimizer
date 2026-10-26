import { describe, expect, it } from 'vitest'

import { classifyUpdateCheckError } from '../../../src/composables/system/useUpdater'

/**
 * 回归锁：仓库未发布 Release 时，electron-updater 的原始报错
 * （截图中的 406 / Cannot parse releases feed）必须被归因为
 * 「无在线更新源」，而不是当作故障弹红色错误。
 */
describe('classifyUpdateCheckError', () => {
  it('recognises a repository without releases as "no-release-channel"', () => {
    const raw =
      'Update check failed: stable: Cannot parse releases feed: Error: Unable to find latest version on GitHub ' +
      '(https://github.com/dreamchaseryuan/prompt-optimizer/releases/latest), please ensure a production release exists: ' +
      'HttpError: 406 "method: GET url: https://github.com/dreamchaseryuan/prompt-optimizer/releases"'

    expect(classifyUpdateCheckError(raw)).toBe('no-release-channel')
  })

  it('recognises bare 404/406 http errors as "no-release-channel"', () => {
    expect(classifyUpdateCheckError('HttpError: 404 Not Found')).toBe('no-release-channel')
    expect(classifyUpdateCheckError('HttpError: 406 Not Acceptable')).toBe('no-release-channel')
  })

  it('recognises network failures as "offline"', () => {
    expect(classifyUpdateCheckError('getaddrinfo ENOTFOUND github.com')).toBe('offline')
    expect(classifyUpdateCheckError('socket hang up')).toBe('offline')
  })

  it('keeps unknown failures as "other"', () => {
    expect(classifyUpdateCheckError('Signature verification failed')).toBe('other')
    expect(classifyUpdateCheckError(undefined)).toBe('other')
  })

  it('does not misclassify a download-progress style message', () => {
    expect(classifyUpdateCheckError('Downloaded 42% of 100MB')).toBe('other')
  })
})
