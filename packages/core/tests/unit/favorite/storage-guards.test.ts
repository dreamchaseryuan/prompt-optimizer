import { describe, expect, it } from 'vitest'

import { normalizeFavoriteRecord } from '../../../src/services/favorite/storage-guards'

describe('normalizeFavoriteRecord', () => {
  it('falls back invalid function modes to basic/system', () => {
    const favorite = normalizeFavoriteRecord({
      id: 'fav-invalid-mode',
      title: 'Invalid Mode',
      content: '内容',
      functionMode: 'not-real',
      optimizationMode: 'also-not-real',
    })

    expect(favorite.functionMode).toBe('basic')
    expect(favorite.optimizationMode).toBe('system')
    expect(favorite.imageSubMode).toBeUndefined()
  })

  it('drops conflicting fields and keeps a salvageable image favorite', () => {
    const favorite = normalizeFavoriteRecord({
      id: 'fav-image-conflict',
      title: 'Image Favorite',
      content: '内容',
      functionMode: 'image',
      imageSubMode: 'multiimage',
      optimizationMode: 'system',
    })

    expect(favorite.functionMode).toBe('image')
    expect(favorite.imageSubMode).toBe('multiimage')
    expect(favorite.optimizationMode).toBeUndefined()
  })

  it('normalizes a video favorite and clears conflicting modes', () => {
    const favorite = normalizeFavoriteRecord({
      id: 'fav-video-1',
      title: 'Video Favorite',
      content: '视频提示词',
      functionMode: 'video',
      videoSubMode: 'image2video',
      optimizationMode: 'system',
      imageSubMode: 'text2image',
    })

    expect(favorite.functionMode).toBe('video')
    expect(favorite.videoSubMode).toBe('image2video')
    expect(favorite.optimizationMode).toBeUndefined()
    expect(favorite.imageSubMode).toBeUndefined()
  })

  it('defaults a missing video sub mode to text2video', () => {
    const favorite = normalizeFavoriteRecord({
      id: 'fav-video-2',
      title: 'Video Favorite Default',
      content: '视频提示词',
      functionMode: 'video',
    })

    expect(favorite.functionMode).toBe('video')
    expect(favorite.videoSubMode).toBe('text2video')
    expect(favorite.optimizationMode).toBeUndefined()
    expect(favorite.imageSubMode).toBeUndefined()
  })

  it('keeps legacy basic/image favorites byte-equivalent through round-trip', () => {
    const legacyRecords = [
      {
        id: 'fav-legacy-basic',
        title: 'Basic Favorite',
        content: '基础收藏',
        createdAt: 1000,
        updatedAt: 2000,
        tags: ['a'],
        useCount: 3,
        functionMode: 'basic',
        optimizationMode: 'user',
      },
      {
        id: 'fav-legacy-image',
        title: 'Image Favorite',
        content: '图像收藏',
        createdAt: 3000,
        updatedAt: 4000,
        tags: [],
        useCount: 0,
        functionMode: 'image',
        imageSubMode: 'image2image',
      },
    ]

    for (const record of legacyRecords) {
      const normalized = normalizeFavoriteRecord(record)
      expect(JSON.parse(JSON.stringify(normalized))).toEqual(
        JSON.parse(
          JSON.stringify(
            normalizeFavoriteRecord(JSON.parse(JSON.stringify(normalized))),
          ),
        ),
      )
      expect(normalized.videoSubMode).toBeUndefined()
    }
  })

  it('round-trips a video favorite without degradation', () => {
    const record = {
      id: 'fav-video-rt',
      title: 'Video Round Trip',
      content: '视频收藏',
      createdAt: 5000,
      updatedAt: 6000,
      tags: ['video'],
      useCount: 1,
      functionMode: 'video',
      videoSubMode: 'text2video',
    }

    const normalized = normalizeFavoriteRecord(record)
    const second = normalizeFavoriteRecord(JSON.parse(JSON.stringify(normalized)))

    expect(second).toEqual(normalized)
    expect(second.functionMode).toBe('video')
    expect(second.videoSubMode).toBe('text2video')
  })
})
