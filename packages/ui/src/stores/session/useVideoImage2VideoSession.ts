/**
 * Video-Image2Video Session Store
 *
 * 管理 Video 模式下 Image2Video 子模式的会话状态
 * = VideoText2VideoSession + 首帧参考图（inputImageB64/Id/Mime）
 * 首帧图管线完全复用 image2image session 的输入图方案：
 * - 持久化时以 computeStableImageId 落 ImageStorageService，快照只存 assetId
 * - 恢复时从存储服务按 ID 加载 base64
 * - GC 挂 scheduleImageStorageGc（imageStorageMaintenance 收集 video-image2video 快照引用）
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getPiniaServices } from '../../plugins/pinia'
import { isValidVariableName, sanitizeVariableRecord } from '../../types/variable'
import type {
  IImageStorageService,
  PromptAssetBinding,
  PromptSessionOrigin,
} from '@prompt-optimizer/core'
import { createSessionAssetBindingState } from './sessionAssetBinding'
import { SESSION_STORAGE_KEYS } from './sessionKeys'
import {
  computeStableImageId,
  queueImageStorageMaintenance,
  scheduleImageStorageGc,
} from './imageStorageMaintenance'

export interface VideoImage2VideoSessionState {
  originalPrompt: string
  optimizedPrompt: string
  reasoning: string
  chainId: string
  versionId: string

  /** 临时变量（子模式隔离 + 持久化） */
  temporaryVariables: Record<string, string>

  /** 首帧参考图（运行时 base64；持久化仅存 assetId） */
  inputImageB64: string | null
  inputImageId: string | null
  inputImageMime: string

  selectedTextModelKey: string
  selectedTemplateId: string | null
  selectedIterateTemplateId: string | null

  lastActiveAt: number
  assetBinding?: PromptAssetBinding
  origin?: PromptSessionOrigin
}

const createDefaultState = (): VideoImage2VideoSessionState => ({
  originalPrompt: '',
  optimizedPrompt: '',
  reasoning: '',
  chainId: '',
  versionId: '',
  temporaryVariables: {},
  inputImageB64: null,
  inputImageId: null,
  inputImageMime: '',
  selectedTextModelKey: '',
  selectedTemplateId: null,
  selectedIterateTemplateId: null,
  lastActiveAt: Date.now(),
  assetBinding: undefined,
  origin: undefined,
})

const SESSION_KEY = SESSION_STORAGE_KEYS['video-image2video']

export const useVideoImage2VideoSession = defineStore('videoImage2VideoSession', () => {
  const originalPrompt = ref('')
  const optimizedPrompt = ref('')
  const reasoning = ref('')
  const chainId = ref('')
  const versionId = ref('')
  const temporaryVariables = ref<Record<string, string>>({})
  const inputImageB64 = ref<string | null>(null)
  const inputImageId = ref<string | null>(null)
  const inputImageMime = ref('')
  const selectedTextModelKey = ref('')
  const selectedTemplateId = ref<string | null>(null)
  const selectedIterateTemplateId = ref<string | null>(null)
  const lastActiveAt = ref(Date.now())
  const assetBindingState = createSessionAssetBindingState(
    () => {
      lastActiveAt.value = Date.now()
    },
    () => {
      void saveSession().catch((error) => {
        console.error('[VideoImage2VideoSession] Failed to auto-save asset binding:', error)
      })
    },
  )

  const updatePrompt = (prompt: string) => {
    if (originalPrompt.value === prompt) return
    originalPrompt.value = prompt
    lastActiveAt.value = Date.now()
  }

  const updateOptimizedResult = (payload: {
    optimizedPrompt: string
    reasoning?: string
    chainId: string
    versionId: string
  }) => {
    const nextOptimizedPrompt = payload.optimizedPrompt
    const nextReasoning = payload.reasoning || ''
    const nextChainId = payload.chainId
    const nextVersionId = payload.versionId

    if (!nextChainId && !nextVersionId) {
      assetBindingState.clearAssetBindingWithoutPersist()
    }

    const changed =
      optimizedPrompt.value !== nextOptimizedPrompt ||
      reasoning.value !== nextReasoning ||
      chainId.value !== nextChainId ||
      versionId.value !== nextVersionId

    if (!changed) return

    optimizedPrompt.value = nextOptimizedPrompt
    reasoning.value = nextReasoning
    chainId.value = nextChainId
    versionId.value = nextVersionId
    lastActiveAt.value = Date.now()
  }

  const updateInputImage = (b64: string | null, mimeType: string = '', imageId?: string) => {
    inputImageB64.value = b64
    inputImageId.value = imageId || null
    inputImageMime.value = mimeType
    lastActiveAt.value = Date.now()
  }

  const updateTextModel = (modelKey: string) => {
    if (selectedTextModelKey.value === modelKey) return
    selectedTextModelKey.value = modelKey
    lastActiveAt.value = Date.now()
    saveSession().catch(error => {
      console.error('[VideoImage2VideoSession] Failed to auto-save session:', error)
    })
  }

  const updateTemplate = (templateId: string | null) => {
    if (selectedTemplateId.value === templateId) return
    selectedTemplateId.value = templateId
    lastActiveAt.value = Date.now()
    saveSession().catch(error => {
      console.error('[VideoImage2VideoSession] Failed to auto-save session:', error)
    })
  }

  const updateIterateTemplate = (templateId: string | null) => {
    if (selectedIterateTemplateId.value === templateId) return
    selectedIterateTemplateId.value = templateId
    lastActiveAt.value = Date.now()
    saveSession().catch(error => {
      console.error('[VideoImage2VideoSession] Failed to auto-save session:', error)
    })
  }

  // 临时变量（持久化到 session）
  const setTemporaryVariable = (name: string, value: string) => {
    if (!isValidVariableName(name)) {
      console.warn('[VideoImage2VideoSession] Ignoring invalid temporary variable name:', name)
      return
    }
    temporaryVariables.value[name] = value
    lastActiveAt.value = Date.now()
    saveSession().catch(error => {
      console.error('[VideoImage2VideoSession] Failed to auto-save temporary variables:', error)
    })
  }

  const getTemporaryVariable = (name: string): string | undefined => {
    return Object.prototype.hasOwnProperty.call(temporaryVariables.value, name)
      ? temporaryVariables.value[name]
      : undefined
  }

  const deleteTemporaryVariable = (name: string) => {
    if (!Object.prototype.hasOwnProperty.call(temporaryVariables.value, name)) return
    delete temporaryVariables.value[name]
    lastActiveAt.value = Date.now()
    saveSession().catch(error => {
      console.error('[VideoImage2VideoSession] Failed to auto-save temporary variables:', error)
    })
  }

  const clearTemporaryVariables = () => {
    temporaryVariables.value = {}
    lastActiveAt.value = Date.now()
    saveSession().catch(error => {
      console.error('[VideoImage2VideoSession] Failed to auto-save temporary variables:', error)
    })
  }

  const reset = () => {
    const defaultState = createDefaultState()
    originalPrompt.value = defaultState.originalPrompt
    optimizedPrompt.value = defaultState.optimizedPrompt
    reasoning.value = defaultState.reasoning
    chainId.value = defaultState.chainId
    versionId.value = defaultState.versionId
    temporaryVariables.value = defaultState.temporaryVariables
    inputImageB64.value = defaultState.inputImageB64
    inputImageId.value = defaultState.inputImageId
    inputImageMime.value = defaultState.inputImageMime
    selectedTextModelKey.value = defaultState.selectedTextModelKey
    selectedTemplateId.value = defaultState.selectedTemplateId
    selectedIterateTemplateId.value = defaultState.selectedIterateTemplateId
    assetBindingState.resetAssetBinding()
    lastActiveAt.value = defaultState.lastActiveAt
  }

  const clearContent = (options: { persist?: boolean } = {}) => {
    const defaultState = createDefaultState()
    originalPrompt.value = defaultState.originalPrompt
    optimizedPrompt.value = defaultState.optimizedPrompt
    reasoning.value = defaultState.reasoning
    chainId.value = defaultState.chainId
    versionId.value = defaultState.versionId
    temporaryVariables.value = defaultState.temporaryVariables
    inputImageB64.value = defaultState.inputImageB64
    inputImageId.value = defaultState.inputImageId
    inputImageMime.value = defaultState.inputImageMime
    assetBindingState.clearAssetBindingWithoutPersist()
    lastActiveAt.value = Date.now()
    if (options.persist !== false) {
      void saveSession().catch((error) => {
        console.error('[VideoImage2VideoSession] Failed to persist cleared content:', error)
      })
    }
  }

  /**
   * 保存首帧图到存储服务（与 image2image session 相同的稳定 ID 方案）
   */
  const saveInputImage = async (
    b64: string,
    mimeType: string,
    storageService: IImageStorageService,
  ): Promise<string> => {
    const normalizedMime = mimeType || 'image/png'
    const imageId = await computeStableImageId(b64, normalizedMime)

    const existing = await storageService.getMetadata(imageId)
    if (!existing) {
      await storageService.saveImage({
        metadata: {
          id: imageId,
          mimeType: normalizedMime,
          sizeBytes: Math.floor(b64.length * 0.75),
          createdAt: Date.now(),
          accessedAt: Date.now(),
          source: 'uploaded',
        },
        data: b64,
      })
    }

    return imageId
  }

  const saveSession = async () => {
    return await queueImageStorageMaintenance(async () => {
      const $services = getPiniaServices()
      if (!$services?.preferenceService) {
        throw new Error('[VideoImage2VideoSession] PreferenceService is unavailable; cannot save session')
      }
      if (!$services?.imageStorageService) {
        throw new Error('[VideoImage2VideoSession] ImageStorageService is unavailable; cannot save session')
      }

      // 持久化前把首帧 base64 落到 ImageStorageService（快照只存 assetId）
      let inputImageIdToSave = inputImageId.value
      if (inputImageB64.value && !inputImageId.value) {
        inputImageIdToSave = await saveInputImage(
          inputImageB64.value,
          inputImageMime.value,
          $services.imageStorageService,
        )
        // 只更新 ID，保留 base64 在运行时 ref 中（避免界面图像消失）
        inputImageId.value = inputImageIdToSave
      }

      const snapshot = {
        originalPrompt: originalPrompt.value,
        optimizedPrompt: optimizedPrompt.value,
        reasoning: reasoning.value,
        chainId: chainId.value,
        versionId: versionId.value,
        temporaryVariables: sanitizeVariableRecord(temporaryVariables.value),
        inputImageId: inputImageIdToSave,
        inputImageB64: null,
        inputImageMime: inputImageMime.value,
        selectedTextModelKey: selectedTextModelKey.value,
        selectedTemplateId: selectedTemplateId.value,
        selectedIterateTemplateId: selectedIterateTemplateId.value,
        lastActiveAt: lastActiveAt.value,
        ...assetBindingState.persistedAssetBinding(),
      }

      await $services.preferenceService.set(SESSION_KEY, snapshot)
      scheduleImageStorageGc($services.preferenceService, $services.imageStorageService)
    })
  }

  const restoreSession = async () => {
    const $services = getPiniaServices()
    if (!$services?.preferenceService) {
      throw new Error('[VideoImage2VideoSession] PreferenceService is unavailable; cannot restore session')
    }
    if (!$services?.imageStorageService) {
      throw new Error('[VideoImage2VideoSession] ImageStorageService is unavailable; cannot restore session')
    }

    try {
      const saved = await $services.preferenceService.get<unknown>(SESSION_KEY, null)

      if (saved) {
        const parsed =
          typeof saved === 'string'
            ? (JSON.parse(saved) as Record<string, unknown>)
            : (saved as Record<string, unknown>)

        const defaultState = createDefaultState()

        originalPrompt.value = typeof parsed.originalPrompt === 'string' ? parsed.originalPrompt : ''
        optimizedPrompt.value = typeof parsed.optimizedPrompt === 'string' ? parsed.optimizedPrompt : ''
        reasoning.value = typeof parsed.reasoning === 'string' ? parsed.reasoning : ''
        chainId.value = typeof parsed.chainId === 'string' ? parsed.chainId : ''
        versionId.value = typeof parsed.versionId === 'string' ? parsed.versionId : ''
        temporaryVariables.value = sanitizeVariableRecord(parsed.temporaryVariables)

        // 首帧图：优先按 assetId 从存储服务加载；缺失时回退快照内嵌 base64（若有）
        let inputImageB64Loaded: string | null = null
        if (typeof parsed.inputImageId === 'string' && parsed.inputImageId) {
          try {
            const fullImageData = await $services.imageStorageService.getImage(parsed.inputImageId)
            if (fullImageData) {
              inputImageB64Loaded = fullImageData.data
            } else {
              console.warn(`[VideoImage2VideoSession] Input image ${parsed.inputImageId} was not found`)
            }
          } catch (error) {
            console.error(`[VideoImage2VideoSession] Failed to load input image ${parsed.inputImageId}:`, error)
          }
        }
        if (!inputImageB64Loaded) {
          inputImageB64Loaded = typeof parsed.inputImageB64 === 'string' ? parsed.inputImageB64 : null
        }

        inputImageB64.value = inputImageB64Loaded
        inputImageId.value = typeof parsed.inputImageId === 'string' ? parsed.inputImageId : null
        inputImageMime.value = typeof parsed.inputImageMime === 'string' ? parsed.inputImageMime : ''

        selectedTextModelKey.value = typeof parsed.selectedTextModelKey === 'string' ? parsed.selectedTextModelKey : ''
        selectedTemplateId.value = typeof parsed.selectedTemplateId === 'string' ? parsed.selectedTemplateId : null
        selectedIterateTemplateId.value = typeof parsed.selectedIterateTemplateId === 'string' ? parsed.selectedIterateTemplateId : null
        assetBindingState.restoreAssetBinding(parsed)
        lastActiveAt.value = Date.now()
      }
      // else: 没有保存的会话，使用默认状态
    } catch (error) {
      reset()
      throw error
    }
  }

  return {
    originalPrompt,
    optimizedPrompt,
    reasoning,
    chainId,
    versionId,
    temporaryVariables,
    inputImageB64,
    inputImageId,
    inputImageMime,
    selectedTextModelKey,
    selectedTemplateId,
    selectedIterateTemplateId,
    lastActiveAt,
    assetBinding: assetBindingState.assetBinding,
    origin: assetBindingState.origin,

    updatePrompt,
    updateOptimizedResult,
    updateInputImage,
    updateTextModel,
    updateTemplate,
    updateIterateTemplate,

    setTemporaryVariable,
    getTemporaryVariable,
    deleteTemporaryVariable,
    clearTemporaryVariables,

    clearContent,
    updateAssetBinding: assetBindingState.updateAssetBinding,
    clearAssetBinding: assetBindingState.clearAssetBinding,
    reset,

    saveSession,
    restoreSession,
  }
})

export type VideoImage2VideoSessionApi = ReturnType<typeof useVideoImage2VideoSession>
