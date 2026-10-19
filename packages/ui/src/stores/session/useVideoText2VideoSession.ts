/**
 * Video-Text2Video Session Store
 *
 * 管理 Video 模式下 Text2Video 子模式的会话状态
 * - 视频描述（原始提示词）与优化结果
 * - 模型/模板选择、临时变量、历史链坐标
 * 精简形态：无图像测试区 / 评估面板（与 image 工作区不同，视频输出为纯文本）
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getPiniaServices } from '../../plugins/pinia'
import { isValidVariableName, sanitizeVariableRecord } from '../../types/variable'
import type { PromptAssetBinding, PromptSessionOrigin } from '@prompt-optimizer/core'
import { createSessionAssetBindingState } from './sessionAssetBinding'
import { SESSION_STORAGE_KEYS } from './sessionKeys'

export interface VideoText2VideoSessionState {
  originalPrompt: string
  optimizedPrompt: string
  reasoning: string
  chainId: string
  versionId: string

  /** 临时变量（子模式隔离 + 持久化） */
  temporaryVariables: Record<string, string>

  selectedTextModelKey: string
  selectedTemplateId: string | null
  selectedIterateTemplateId: string | null

  lastActiveAt: number
  assetBinding?: PromptAssetBinding
  origin?: PromptSessionOrigin
}

const createDefaultState = (): VideoText2VideoSessionState => ({
  originalPrompt: '',
  optimizedPrompt: '',
  reasoning: '',
  chainId: '',
  versionId: '',
  temporaryVariables: {},
  selectedTextModelKey: '',
  selectedTemplateId: null,
  selectedIterateTemplateId: null,
  lastActiveAt: Date.now(),
  assetBinding: undefined,
  origin: undefined,
})

const SESSION_KEY = SESSION_STORAGE_KEYS['video-text2video']

export const useVideoText2VideoSession = defineStore('videoText2VideoSession', () => {
  const originalPrompt = ref('')
  const optimizedPrompt = ref('')
  const reasoning = ref('')
  const chainId = ref('')
  const versionId = ref('')
  const temporaryVariables = ref<Record<string, string>>({})
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
        console.error('[VideoText2VideoSession] Failed to auto-save asset binding:', error)
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

  const updateTextModel = (modelKey: string) => {
    if (selectedTextModelKey.value === modelKey) return
    selectedTextModelKey.value = modelKey
    lastActiveAt.value = Date.now()
    saveSession().catch(error => {
      console.error('[VideoText2VideoSession] Failed to auto-save session:', error)
    })
  }

  const updateTemplate = (templateId: string | null) => {
    if (selectedTemplateId.value === templateId) return
    selectedTemplateId.value = templateId
    lastActiveAt.value = Date.now()
    saveSession().catch(error => {
      console.error('[VideoText2VideoSession] Failed to auto-save session:', error)
    })
  }

  const updateIterateTemplate = (templateId: string | null) => {
    if (selectedIterateTemplateId.value === templateId) return
    selectedIterateTemplateId.value = templateId
    lastActiveAt.value = Date.now()
    saveSession().catch(error => {
      console.error('[VideoText2VideoSession] Failed to auto-save session:', error)
    })
  }

  // 临时变量（持久化到 session）
  const setTemporaryVariable = (name: string, value: string) => {
    if (!isValidVariableName(name)) {
      console.warn('[VideoText2VideoSession] Ignoring invalid temporary variable name:', name)
      return
    }
    temporaryVariables.value[name] = value
    lastActiveAt.value = Date.now()
    saveSession().catch(error => {
      console.error('[VideoText2VideoSession] Failed to auto-save temporary variables:', error)
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
      console.error('[VideoText2VideoSession] Failed to auto-save temporary variables:', error)
    })
  }

  const clearTemporaryVariables = () => {
    temporaryVariables.value = {}
    lastActiveAt.value = Date.now()
    saveSession().catch(error => {
      console.error('[VideoText2VideoSession] Failed to auto-save temporary variables:', error)
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
    assetBindingState.clearAssetBindingWithoutPersist()
    lastActiveAt.value = Date.now()
    if (options.persist !== false) {
      void saveSession().catch((error) => {
        console.error('[VideoText2VideoSession] Failed to persist cleared content:', error)
      })
    }
  }

  const saveSession = async () => {
    const $services = getPiniaServices()
    if (!$services?.preferenceService) {
      throw new Error('[VideoText2VideoSession] PreferenceService is unavailable; cannot save session')
    }

    const snapshot = {
      originalPrompt: originalPrompt.value,
      optimizedPrompt: optimizedPrompt.value,
      reasoning: reasoning.value,
      chainId: chainId.value,
      versionId: versionId.value,
      temporaryVariables: sanitizeVariableRecord(temporaryVariables.value),
      selectedTextModelKey: selectedTextModelKey.value,
      selectedTemplateId: selectedTemplateId.value,
      selectedIterateTemplateId: selectedIterateTemplateId.value,
      lastActiveAt: lastActiveAt.value,
      ...assetBindingState.persistedAssetBinding(),
    }

    await $services.preferenceService.set(SESSION_KEY, snapshot)
  }

  const restoreSession = async () => {
    const $services = getPiniaServices()
    if (!$services?.preferenceService) {
      throw new Error('[VideoText2VideoSession] PreferenceService is unavailable; cannot restore session')
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
    selectedTextModelKey,
    selectedTemplateId,
    selectedIterateTemplateId,
    lastActiveAt,
    assetBinding: assetBindingState.assetBinding,
    origin: assetBindingState.origin,

    updatePrompt,
    updateOptimizedResult,
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

export type VideoText2VideoSessionApi = ReturnType<typeof useVideoText2VideoSession>
