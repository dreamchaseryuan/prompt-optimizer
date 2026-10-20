<template>
    <div class="video-image2video-workspace" data-testid="workspace" data-mode="video-image2video">
        <WorkspacePageHero title-key="videoMode.image2video" subtitle-key="nav.videoMode" />
        <div class="workspace-page-tools">
            <WorkspaceUtilityMenu
                :disabled="isOptimizing || isIterating"
                :source="resolveSourceAssetRef(session.origin, session.assetBinding)"
                test-id="video-image2video-workspace-utility-menu"
                @clear="handleClearContent"
            />
        </div>
        <NFlex vertical :style="{ height: '100%', gap: '12px' }">
            <!-- 输入区域（视频描述 + 首帧参考图 + 模板/模型选择 + 优化按钮） -->
            <TestSourceLinkedCard :style="{ flexShrink: 0 }">
                <NSpace vertical :size="16">
                    <!-- 标题区域 -->
                    <NFlex justify="space-between" align="center" :wrap="false">
                        <NText :depth="1" style="font-size: 18px; font-weight: 500">
                            {{ t('videoWorkspace.input.originalPrompt') }}
                        </NText>
                        <NFlex align="center" :size="8">
                            <NButton
                                type="tertiary"
                                size="small"
                                @click="openFullscreen"
                                :title="t('common.expand')"
                                ghost
                                round
                            >
                                <template #icon>
                                    <NIcon>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            stroke-width="2"
                                        >
                                            <path
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                                            />
                                        </svg>
                                    </NIcon>
                                </template>
                            </NButton>
                        </NFlex>
                    </NFlex>

                    <!-- 视频描述输入框 -->
                    <VariableAwareInput
                        v-if="variableInputData"
                        data-testid="video-image2video-input"
                        :model-value="originalPrompt"
                        @update:model-value="handleOriginalPromptInput"
                        :readonly="isOptimizing"
                        :placeholder="t('videoWorkspace.input.originalPromptPlaceholder')"
                        :autosize="{ minRows: 4, maxRows: 12 }"
                        v-bind="variableInputData"
                        clearable
                        show-count
                        @variable-extracted="handleVariableExtracted"
                        @add-missing-variable="handleAddMissingVariable"
                    />
                    <NInput
                        v-else
                        v-model:value="originalPrompt"
                        type="textarea"
                        data-testid="video-image2video-input"
                        :placeholder="t('videoWorkspace.input.originalPromptPlaceholder')"
                        :rows="4"
                        :autosize="{ minRows: 4, maxRows: 12 }"
                        clearable
                        show-count
                        :disabled="isOptimizing"
                    />

                    <!-- 首帧参考图上传区域 -->
                    <NSpace vertical :size="8">
                        <NText :depth="2" style="font-size: 14px; font-weight: 500">
                            {{ t('videoWorkspace.input.selectImage') }}
                        </NText>
                        <NFlex align="center" :size="8">
                            <ReferenceImageUploader
                                v-model="inputImageRef"
                                data-testid="video-image2video-uploader"
                                :disabled="isOptimizing"
                            />
                        </NFlex>
                    </NSpace>

                    <!-- 控制面板 -->
                    <NGrid :cols="24" :x-gap="8" responsive="screen">
                        <!-- 文本模型选择 -->
                        <NGridItem :span="8" :xs="24" :sm="8">
                            <NSpace vertical :size="8">
                                <NFlex align="center" :size="6" :wrap="false">
                                    <NText
                                        :depth="2"
                                        style="font-size: 14px; font-weight: 500; flex-shrink: 0;"
                                    >
                                        {{ t('videoWorkspace.input.textModel') }}
                                    </NText>
                                    <TextModelQuickSwitch
                                        :model-key="selectedTextModelKey"
                                        :options="textModelOptions"
                                        :refresh-models="modelSelection.refreshTextModels"
                                        :disabled="isOptimizing"
                                    />
                                </NFlex>
                                <template v-if="appOpenModelManager">
                                    <SelectWithConfig
                                        data-testid="video-image2video-text-model-select"
                                        v-model="selectedTextModelKey"
                                        :options="textModelOptions"
                                        :getPrimary="OptionAccessors.getPrimary"
                                        :getSecondary="OptionAccessors.getSecondary"
                                        :getValue="OptionAccessors.getValue"
                                        :placeholder="t('imageWorkspace.input.modelPlaceholder')"
                                        size="medium"
                                        :disabled="isOptimizing"
                                        filterable
                                        :show-config-action="true"
                                        :show-empty-config-c-t-a="true"
                                        @focus="handleTextModelSelectFocus"
                                        @config="() => appOpenModelManager && appOpenModelManager('text')"
                                    />
                                </template>
                                <template v-else>
                                    <SelectWithConfig
                                        data-testid="video-image2video-text-model-select"
                                        v-model="selectedTextModelKey"
                                        :options="textModelOptions"
                                        :getPrimary="OptionAccessors.getPrimary"
                                        :getSecondary="OptionAccessors.getSecondary"
                                        :getValue="OptionAccessors.getValue"
                                        :placeholder="t('imageWorkspace.input.modelPlaceholder')"
                                        size="medium"
                                        :disabled="isOptimizing"
                                        filterable
                                        @focus="handleTextModelSelectFocus"
                                    />
                                </template>
                            </NSpace>
                        </NGridItem>

                        <!-- 优化模板选择 -->
                        <NGridItem :span="10" :xs="24" :sm="10">
                            <NSpace vertical :size="8">
                                <NText :depth="2" style="font-size: 14px; font-weight: 500">
                                    {{ t('videoWorkspace.input.optimizeTemplate') }}
                                </NText>
                                <template v-if="services && services.templateManager">
                                    <SelectWithConfig
                                        data-testid="video-image2video-template-select"
                                        v-model="selectedTemplateIdForSelect"
                                        :options="templateOptions"
                                        :getPrimary="OptionAccessors.getPrimary"
                                        :getSecondary="OptionAccessors.getSecondary"
                                        :getValue="OptionAccessors.getValue"
                                        :placeholder="t('imageWorkspace.input.templatePlaceholder')"
                                        size="medium"
                                        :disabled="isOptimizing"
                                        filterable
                                        :show-config-action="true"
                                        :show-empty-config-c-t-a="true"
                                        @focus="handleTemplateSelectFocus"
                                        @config="() => onOpenTemplateManager(templateType)"
                                    />
                                </template>
                                <NText
                                    v-else
                                    depth="3"
                                    style="padding: 0; font-size: 14px"
                                >
                                    {{ t('common.loading') }}
                                </NText>
                            </NSpace>
                        </NGridItem>

                        <!-- 优化按钮 -->
                        <NGridItem :span="6" :xs="24" :sm="6" class="flex items-end justify-end">
                            <NSpace :size="8">
                                <NButton
                                    type="primary"
                                    size="medium"
                                    data-testid="video-image2video-optimize-button"
                                    :loading="isOptimizing"
                                    @click="handleOptimizePrompt"
                                    :disabled="
                                        isOptimizing ||
                                        !originalPrompt.trim() ||
                                        !selectedTextModelKey ||
                                        !selectedTemplate
                                    "
                                >
                                    {{
                                        isOptimizing
                                            ? t('videoWorkspace.input.optimizing')
                                            : t('videoWorkspace.input.optimizePrompt')
                                    }}
                                </NButton>
                            </NSpace>
                        </NGridItem>
                    </NGrid>
                </NSpace>
            </TestSourceLinkedCard>

            <!-- 优化结果区域 -->
            <TestSourceLinkedCard
                :style="{ flex: 1, minHeight: '200px', overflow: 'hidden' }"
                content-style="height: 100%; max-height: 100%; overflow: hidden;"
            >
                <PromptPanelUI
                    v-if="services && services.templateManager"
                    test-id="video-image2video"
                    ref="promptPanelRef"
                    v-model:optimized-prompt="optimizedPrompt"
                    :reasoning="optimizedReasoning"
                    :original-prompt="originalPrompt"
                    :is-optimizing="isOptimizing"
                    :is-iterating="isIterating"
                    v-model:selected-iterate-template="selectedIterateTemplate"
                    :versions="currentVersions"
                    :current-version-id="currentVersionId"
                    :optimization-mode="optimizationMode"
                    :advanced-mode-enabled="advancedModeEnabled"
                    :show-preview="true"
                    iterate-template-type="iterate"
                    @iterate="handleIteratePrompt"
                    @openTemplateManager="onOpenTemplateManager"
                    @switchVersion="handleSwitchVersion"
                    @save-favorite="handleSaveFavorite"
                    @save-local-edit="handleSaveLocalEdit"
                    @apply-patch="handleApplyPatch"
                    @open-preview="handleOpenPromptPreview"
                />
            </TestSourceLinkedCard>

            <!-- 临时变量面板 -->
            <TemporaryVariablesPanel
                :manager="temporaryVariablePanelManager"
                :disabled="isOptimizing"
            />
        </NFlex>

        <!-- 全屏编辑 -->
        <FullscreenDialog
            v-model="isFullscreen"
            :title="t('videoWorkspace.input.originalPrompt')"
        >
            <NInput
                v-model:value="fullscreenValue"
                type="textarea"
                :placeholder="t('videoWorkspace.input.originalPromptPlaceholder')"
                :autosize="false"
                style="height: 100%; min-height: 0;"
                clearable
                show-count
                :disabled="isOptimizing"
            />
        </FullscreenDialog>

        <!-- 本地预览面板 -->
        <PromptPreviewPanel
            v-model:show="showPromptPreview"
            :previewContent="previewContent"
            :missingVariables="missingVariables"
            :hasMissingVariables="hasMissingVariables"
            :variableStats="variableStats"
            :contextMode="previewContextMode"
            :renderPhase="previewRenderPhase"
        />
    </div>
</template>

<script setup lang="ts">
import WorkspacePageHero from '../workspace/WorkspacePageHero.vue'
import { onMounted, onUnmounted, inject, ref, computed, watch, nextTick, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
    NButton,
    NFlex,
    NGrid,
    NGridItem,
    NIcon,
    NInput,
    NSpace,
    NText,
} from 'naive-ui'
import { v4 as uuidv4 } from 'uuid'

import WorkspaceUtilityMenu from '../common/WorkspaceUtilityMenu.vue'
import TestSourceLinkedCard from '../TestSourceLinkedCard.vue'
import SelectWithConfig from '../SelectWithConfig.vue'
import TextModelQuickSwitch from '../TextModelQuickSwitch.vue'
import PromptPanelUI from '../PromptPanel.vue'
import PromptPreviewPanel from '../PromptPreviewPanel.vue'
import FullscreenDialog from '../FullscreenDialog.vue'
import TemporaryVariablesPanel from '../variable/TemporaryVariablesPanel.vue'
import { VariableAwareInput } from '../variable-extraction'
import ReferenceImageUploader from '../common/ReferenceImageUploader.vue'
import type { ImageInputRef } from '@prompt-optimizer/core'

import { useLocalPromptPreviewPanel } from '../../composables/prompt/useLocalPromptPreviewPanel'
import { OptionAccessors } from '../../utils/data-transformer'
import type { AppServices } from '../../types/services'
import { useFullscreen } from '../../composables/ui/useFullscreen'
import { useToast } from '../../composables/ui/useToast'
import { getI18nErrorMessage } from '../../utils/error'
import { withHistorySourceBindingMetadata } from '../../utils/history-source-binding'
import { resolveSourceAssetRef } from '../../utils/source-asset'
import { useTemporaryVariables } from '../../composables/variable/useTemporaryVariables'
import { useVariableAwareInputBridge } from '../../composables/variable/useVariableAwareInputBridge'
import { useTestVariableManager } from '../../composables/variable/useTestVariableManager'
import type { VariableManagerHooks } from '../../composables/prompt/useVariableManager'
import { useWorkspaceTemplateSelection } from '../../composables/workspaces/useWorkspaceTemplateSelection'
import { useWorkspaceTextModelSelection } from '../../composables/workspaces/useWorkspaceTextModelSelection'
import { useVideoImage2VideoSession } from '../../stores/session/useVideoImage2VideoSession'
import {
    applyPatchOperationsToText,
    type ContextMode,
    type OptimizationMode,
    type OptimizationRequest,
    type PatchOperation,
    type PromptRecordChain,
    type PromptRecordType,
    type Template,
} from '@prompt-optimizer/core'

// 国际化
const { t } = useI18n()

// Toast
const toast = useToast()

// 服务注入
const services = inject<Ref<AppServices | null>>('services', ref(null))

// 变量系统（全局变量 + 临时变量）
const variableManager = inject<VariableManagerHooks | null>('variableManager', null)
const tempVarsManager = useTemporaryVariables()

const {
    variableInputData,
    predefinedVariableValues: purePredefinedVariables,
    handleVariableExtracted,
    handleAddMissingVariable,
} = useVariableAwareInputBridge({
    enabled: computed(() => true),
    isReady: computed(() => variableManager?.isReady.value ?? false),
    globalVariables: computed(() => variableManager?.customVariables.value || {}),
    temporaryVariables: tempVarsManager.temporaryVariables,
    allVariables: computed(() => variableManager?.allVariables.value || {}),
    saveGlobalVariable: (name, value) => variableManager?.addVariable(name, value),
    saveTemporaryVariable: (name, value) => tempVarsManager.setVariable(name, value),
    logPrefix: 'VideoImage2VideoWorkspace',
})

const temporaryVariablePanelManager = useTestVariableManager({
    globalVariables: computed(() => variableManager?.customVariables.value || {}),
    predefinedVariables: purePredefinedVariables,
    temporaryVariables: computed(() => tempVarsManager.temporaryVariables.value),
    onVariableChange: (name, value) => {
        tempVarsManager.setVariable(name, value)
    },
    onVariableRemove: (name) => {
        tempVarsManager.deleteVariable(name)
    },
    onVariablesClear: () => {
        tempVarsManager.clearAll()
    },
    onSaveToGlobal: (name, value) => {
        if (!variableManager || !variableManager.isReady.value) {
            throw new Error('variable manager not ready')
        }
        variableManager.addVariable(name, value)
    },
})

const handleOriginalPromptInput = (value: string) => {
    originalPrompt.value = value
}

// Session store（单一真源）
const session = useVideoImage2VideoSession()

// 服务引用
const historyManager = computed(() => services.value?.historyManager)
const promptService = computed(() => services.value?.promptService)

// 过程态（本地，不持久化）
const isOptimizing = ref(false)
const isIterating = ref(false)

// 历史管理专用 ref（不写入 session store）
const currentChainId = ref('')
const currentVersions = ref<PromptRecordChain['versions']>([])
const currentVersionId = ref('')

// 字段级访问器（从 session state）
const originalPrompt = computed<string>({
    get: () => session.originalPrompt || '',
    set: (value) => session.updatePrompt(value || ''),
})

const optimizedPrompt = computed<string>({
    get: () => session.optimizedPrompt || '',
    set: (value) => {
        session.updateOptimizedResult({
            optimizedPrompt: value || '',
            reasoning: session.reasoning || '',
            chainId: session.chainId || '',
            versionId: session.versionId || '',
        })
    },
})

const optimizedReasoning = computed<string>({
    get: () => session.reasoning || '',
    set: (value) => {
        session.updateOptimizedResult({
            optimizedPrompt: session.optimizedPrompt || '',
            reasoning: value || '',
            chainId: session.chainId || '',
            versionId: session.versionId || '',
        })
    },
})

// Text 模型选择（自动刷新 + 兜底写回 session store）
const modelSelection = useWorkspaceTextModelSelection(services, session)
const selectedTextModelKey = modelSelection.selectedTextModelKey
const textModelOptions = modelSelection.textModelOptions

// 模板选择：优化用 image2videoOptimize；无视频专用迭代模板，按设计 Q1 回退通用 iterate
const templateSelection = useWorkspaceTemplateSelection(
    services,
    session,
    'image2videoOptimize',
    'iterate',
)

const selectedTemplate = templateSelection.selectedTemplate
const templateOptions = templateSelection.templateOptions

// 模板 SelectWithConfig 选中绑定（仅当 id 存在于选项列表时显示）
const selectedTemplateIdForSelect = computed<string>({
    get() {
        const id = templateSelection.selectedTemplateId.value || ''
        if (!id) return ''
        const existsInList = (templateOptions.value || []).some((opt) => opt.value === id)
        return existsInList ? id : ''
    },
    set(id: string) {
        templateSelection.selectedTemplateId.value = id || ''
    },
})

// 固定模板类型
const templateType = 'image2videoOptimize' as const

// 视频模式统一使用 user 模式
const optimizationMode = 'user' as OptimizationMode
const advancedModeEnabled = false

// PromptPanel 需要 Template 对象的 v-model；用 wrapper 同步写回 iterateTemplateId
const selectedIterateTemplate = computed<Template | null>({
    get: () => templateSelection.selectedIterateTemplate.value,
    set: (template) => {
        templateSelection.selectedIterateTemplateId.value = template?.id ?? ''
        templateSelection.selectedIterateTemplate.value = template ?? null
    },
})

// ========================
// 首帧参考图（复用 ReferenceImageUploader）
// ========================
const inputImageRef = computed<ImageInputRef | null>({
    get: () => {
        if (!session.inputImageB64) return null
        return {
            b64: session.inputImageB64,
            mimeType: session.inputImageMime || 'image/png',
        }
    },
    set: (value) => {
        // 新上传会覆盖旧首帧（并清空旧 assetId，保存时重新落存储）
        session.updateInputImage(value?.b64 ?? null, value?.mimeType ?? '')
        queueSessionSave()
    },
})

// ========================
// 本地保存（串行化，避免竞态）
// ========================
let sessionSaveChain: Promise<void> = Promise.resolve()
const queueSessionSave = () => {
    sessionSaveChain = sessionSaveChain
        .then(() => session.saveSession())
        .catch((e) => {
            console.error('[VideoImage2VideoWorkspace] Failed to persist video session:', e)
        })
    return sessionSaveChain
}

const saveSessionAfterHistoryCommit = async (reason: string) => {
    try {
        await session.saveSession()
    } catch (e) {
        console.error(`[VideoImage2VideoWorkspace] Failed to persist video session after ${reason}:`, e)
        toast.warning(t('toast.warning.saveHistoryFailed'))
    }
}

// ========================
// 注入 App 层统一接口
// ========================
type TemplateEntryType =
    | 'optimize'
    | 'userOptimize'
    | 'iterate'
    | 'contextIterate'
    | 'text2imageOptimize'
    | 'image2imageOptimize'
    | 'imageIterate'
    | 'text2videoOptimize'
    | 'image2videoOptimize'

const appOpenTemplateManager = inject<((type?: TemplateEntryType) => void) | null>(
    'openTemplateManager',
    null,
)
const appOpenModelManager = inject<((tab?: 'text' | 'image' | 'function') => void) | null>(
    'openModelManager',
    null,
)
const appHandleSaveFavorite = inject<
    ((data: { content: string; originalContent?: string }) => void) | null
>('handleSaveFavorite', null)

// 视频工作区直接透传模板类型
const onOpenTemplateManager = (type: TemplateEntryType) => {
    appOpenTemplateManager?.(type)
}

// 全屏编辑：编辑 originalPrompt
const { isFullscreen, fullscreenValue, openFullscreen } = useFullscreen(
    computed(() => originalPrompt.value),
    (value) => {
        originalPrompt.value = value
    },
)

// ========================
// 子模式本地提示词预览（不经过 PromptOptimizerApp）
// ========================
const previewContextMode = computed<ContextMode>(() => 'user')

const previewVariables = computed<Record<string, string>>(() => {
    const current = (optimizedPrompt.value || '').trim()
    return {
        ...(variableManager?.customVariables.value || {}),
        ...(tempVarsManager.temporaryVariables.value || {}),
        ...(purePredefinedVariables.value || {}),
        originalPrompt: (originalPrompt.value || '').trim(),
        lastOptimizedPrompt: (optimizedPrompt.value || '').trim(),
        currentPrompt: current,
        userQuestion: current,
    }
})

const {
    show: showPromptPreview,
    renderPhase: previewRenderPhase,
    previewContent,
    missingVariables,
    hasMissingVariables,
    variableStats,
    open: openPromptPreview,
} = useLocalPromptPreviewPanel(previewVariables, previewContextMode)

const handleOpenPromptPreview = () => {
    openPromptPreview(optimizedPrompt.value || '', { renderPhase: 'test' })
}

// ========================
// 历史链 / 优化 / 迭代
// ========================
// 创建历史记录（并同步 chain/version 到 session store）
const createHistoryRecord = async () => {
    if (!selectedTemplate.value || !historyManager.value) return

    try {
        const recordData = {
            id: uuidv4(),
            originalPrompt: originalPrompt.value,
            optimizedPrompt: optimizedPrompt.value,
            type: 'image2videoOptimize' as PromptRecordType,
            modelKey: selectedTextModelKey.value,
            templateId: selectedTemplate.value.id,
            timestamp: Date.now(),
            metadata: withHistorySourceBindingMetadata({
                optimizationMode: 'user' as OptimizationMode,
                functionMode: 'video',
                videoSubMode: 'image2video',
                hasInputImage: !!session.inputImageB64,
            }, session),
        }

        const newRecord = await historyManager.value.createNewChain(recordData)
        currentChainId.value = newRecord.chainId
        currentVersions.value = newRecord.versions
        currentVersionId.value = newRecord.currentRecord.id

        session.updateOptimizedResult({
            optimizedPrompt: optimizedPrompt.value,
            reasoning: optimizedReasoning.value,
            chainId: newRecord.chainId,
            versionId: newRecord.currentRecord.id,
        })
        await saveSessionAfterHistoryCommit('optimization commit')

        window.dispatchEvent(new CustomEvent('prompt-optimizer:history-refresh'))
    } catch (e) {
        console.error('[VideoImage2VideoWorkspace] Failed to create history record:', e)
        toast.warning(t('toast.error.optimizeCompleteButHistoryFailed'))
    }
}

// 优化提示词（流式写入 session store）
const handleOptimizePrompt = async () => {
    if (!originalPrompt.value.trim() || isOptimizing.value) return
    if (!session.inputImageB64) {
        toast.error(t('videoMode.uploadRequired'))
        return
    }
    if (!selectedTemplate.value) {
        toast.error(t('toast.error.noOptimizeTemplate'))
        return
    }
    if (!selectedTextModelKey.value) {
        toast.error(t('toast.error.noOptimizeModel'))
        return
    }
    if (!promptService.value) {
        toast.error(t('toast.error.serviceInit'))
        return
    }

    isOptimizing.value = true
    session.optimizedPrompt = ''
    session.reasoning = ''

    await nextTick()

    try {
        // 图生视频：首帧放入 inputImages（模板变量 hasInputImages/inputImageCount/inputImagesJson 生效）
        const request: OptimizationRequest = {
            optimizationMode: 'user',
            targetPrompt: originalPrompt.value,
            templateId: selectedTemplate.value.id,
            modelKey: selectedTextModelKey.value,
            inputImages: [
                {
                    b64: session.inputImageB64,
                    mimeType: session.inputImageMime || 'image/png',
                },
            ],
        }

        await promptService.value.optimizePromptStream(request, {
            onToken: token => {
                session.optimizedPrompt += token
            },
            onReasoningToken: token => {
                session.reasoning += token
            },
            onComplete: async () => {
                await createHistoryRecord()
                toast.success(t('toast.success.optimizeSuccess'))
            },
            onError: (error: Error) => {
                throw error
            },
        })
    } catch (error) {
        toast.error(getI18nErrorMessage(error, t('toast.error.optimizeFailed')))
    } finally {
        isOptimizing.value = false
    }
}

// 迭代优化（流式写入 session store；无视频专用迭代模板，回退通用 iterate）
const handleIteratePrompt = async (payload: {
    originalPrompt: string
    optimizedPrompt: string
    iterateInput: string
}) => {
    if (!selectedIterateTemplate.value || !promptService.value) {
        console.error('[VideoImage2VideoWorkspace] Missing iterate dependencies')
        return
    }

    isIterating.value = true
    const previousOptimizedPrompt = optimizedPrompt.value

    session.optimizedPrompt = ''
    session.reasoning = ''

    try {
        await promptService.value.iteratePromptStream(
            payload.originalPrompt,
            payload.optimizedPrompt,
            payload.iterateInput,
            selectedTextModelKey.value,
            {
                onToken: token => {
                    session.optimizedPrompt += token
                },
                onReasoningToken: token => {
                    session.reasoning += token
                },
                onComplete: async () => {
                    try {
                        if (historyManager.value && currentChainId.value) {
                            const updatedChain = await historyManager.value.addIteration({
                                chainId: currentChainId.value,
                                originalPrompt: payload.originalPrompt,
                                optimizedPrompt: optimizedPrompt.value,
                                iterationNote: payload.iterateInput,
                                modelKey: selectedTextModelKey.value,
                                templateId: selectedIterateTemplate.value!.id,
                                metadata: withHistorySourceBindingMetadata(undefined, session),
                            })
                            currentVersions.value = updatedChain.versions
                            currentVersionId.value = updatedChain.currentRecord.id
                            session.updateOptimizedResult({
                                optimizedPrompt: optimizedPrompt.value,
                                reasoning: optimizedReasoning.value,
                                chainId: updatedChain.chainId,
                                versionId: updatedChain.currentRecord.id,
                            })
                            await saveSessionAfterHistoryCommit('iteration commit')
                            window.dispatchEvent(new CustomEvent('prompt-optimizer:history-refresh'))
                        } else {
                            await createHistoryRecord()
                        }
                        toast.success(t('toast.success.iterateComplete'))
                    } catch (e) {
                        console.error('[VideoImage2VideoWorkspace] Failed to persist iteration:', e)
                        toast.warning(t('toast.error.iterateCompleteButHistoryFailed'))
                    }
                },
                onError: (error: Error) => {
                    throw error
                },
            },
            selectedIterateTemplate.value.id,
        )
    } catch (error) {
        toast.error(getI18nErrorMessage(error, t('toast.error.iterateFailed')))
        optimizedPrompt.value = previousOptimizedPrompt
    } finally {
        isIterating.value = false
    }
}

// 切换版本（仅影响当前 UI 展示）
const handleSwitchVersion = async (version: PromptRecordChain['versions'][number]) => {
    optimizedPrompt.value = version.optimizedPrompt
    currentVersionId.value = version.id
    session.updateOptimizedResult({
        optimizedPrompt: version.optimizedPrompt || '',
        reasoning: optimizedReasoning.value || '',
        chainId: currentChainId.value || session.chainId || '',
        versionId: version.id || '',
    })
    await nextTick()
}

// 保存本地编辑
const handleSaveLocalEdit = async (payload: { note?: string }) => {
    if (!historyManager.value) {
        toast.error(t('toast.error.historyUnavailable'))
        return
    }

    const newPrompt = optimizedPrompt.value || ''
    if (!newPrompt.trim()) return

    try {
        const chainId = currentChainId.value || session.chainId || ''
        const currentRecord = currentVersions.value.find((v) => v.id === currentVersionId.value)

        const modelKey = currentRecord?.modelKey || selectedTextModelKey.value || 'local-edit'
        const templateId =
            currentRecord?.templateId ||
            selectedIterateTemplate.value?.id ||
            selectedTemplate.value?.id ||
            'local-edit'

        const chain = chainId
            ? await historyManager.value.addIteration({
                  chainId,
                  originalPrompt: originalPrompt.value,
                  optimizedPrompt: newPrompt,
                  modelKey,
                  templateId,
                  iterationNote: payload.note,
                  metadata: withHistorySourceBindingMetadata({
                      optimizationMode: 'user' as OptimizationMode,
                      functionMode: 'video',
                      localEdit: true,
                      localEditSource: 'manual',
                      hasInputImage: !!session.inputImageB64,
                  }, session),
              })
            : await historyManager.value.createNewChain({
                  id: uuidv4(),
                  originalPrompt: originalPrompt.value,
                  optimizedPrompt: newPrompt,
                  type: 'image2videoOptimize' as PromptRecordType,
                  modelKey,
                  templateId,
                  timestamp: Date.now(),
                  metadata: withHistorySourceBindingMetadata({
                      optimizationMode: 'user' as OptimizationMode,
                      functionMode: 'video',
                      localEdit: true,
                      localEditSource: 'manual',
                      hasInputImage: !!session.inputImageB64,
                  }, session),
              })

        currentChainId.value = chain.chainId
        currentVersions.value = chain.versions
        currentVersionId.value = chain.currentRecord.id

        session.updateOptimizedResult({
            optimizedPrompt: newPrompt,
            reasoning: '',
            chainId: chain.chainId,
            versionId: chain.currentRecord.id,
        })
        await saveSessionAfterHistoryCommit('local edit commit')

        window.dispatchEvent(new CustomEvent('prompt-optimizer:history-refresh'))
        toast.success(t('toast.success.localEditSaved'))
    } catch (e) {
        console.error('[VideoImage2VideoWorkspace] Failed to save local edit:', e)
        toast.warning(t('toast.warning.saveHistoryFailed'))
    }
}

const handleApplyPatch = (payload: { operation: PatchOperation }) => {
    if (!payload.operation) return
    const current = optimizedPrompt.value || ''
    const result = applyPatchOperationsToText(current, payload.operation)
    if (!result.ok) {
        toast.warning(t('toast.warning.patchApplyFailed'))
        return
    }
    optimizedPrompt.value = result.text
    toast.success(t('evaluation.diagnose.applyFix'))
}

// PromptPanel 引用，用于在语言切换后刷新迭代模板选择
const promptPanelRef = ref<InstanceType<typeof PromptPanelUI> | null>(null)

// 处理收藏保存请求 - 调用 App 提供的统一接口
const handleSaveFavorite = (data: {
    content: string
    originalContent?: string
}) => {
    if (appHandleSaveFavorite) {
        appHandleSaveFavorite(data)
    } else {
        console.warn('[VideoImage2VideoWorkspace] handleSaveFavorite not available from App.vue')
    }
}

const handleClearContent = () => {
    currentChainId.value = ''
    currentVersions.value = []
    currentVersionId.value = ''
    session.clearContent()
}

watch(
    () => [session.chainId, session.versionId, session.optimizedPrompt] as const,
    ([chainId, versionId, optimized]) => {
        if (chainId || versionId || optimized) return
        currentChainId.value = ''
        currentVersions.value = []
        currentVersionId.value = ''
    },
)

// ========================
// 历史恢复（video-workspace-restore 事件）
// ========================
type VideoWorkspaceRestoreDetail = {
    originalPrompt?: unknown
    optimizedPrompt?: unknown
    metadata?: unknown
    chainId?: unknown
    versions?: unknown
    currentVersionId?: unknown
    videoMode?: unknown
    templateId?: unknown
}

const handleRestoreHistory = async (event: Event) => {
    if (!(event instanceof CustomEvent)) {
        return
    }

    const detail = event.detail as VideoWorkspaceRestoreDetail
    if (detail?.videoMode !== 'image2video') return

    const versions = Array.isArray(detail.versions)
        ? (detail.versions as PromptRecordChain['versions'])
        : []

    const requestedVersionId =
        typeof detail.currentVersionId === 'string' ? detail.currentVersionId : ''
    const record =
        (requestedVersionId &&
            versions.find((v) => v.id === requestedVersionId)) ||
        versions[versions.length - 1] ||
        null

    const original =
        (record?.originalPrompt && record.originalPrompt) ||
        (typeof detail.originalPrompt === 'string' ? detail.originalPrompt : '')
    const optimized =
        (record?.optimizedPrompt && record.optimizedPrompt) ||
        (typeof detail.optimizedPrompt === 'string' ? detail.optimizedPrompt : '')

    // 1) 恢复本地历史 refs（PromptPanel versions 列表）
    currentChainId.value = typeof detail.chainId === 'string' ? detail.chainId : ''
    currentVersions.value = versions
    currentVersionId.value = record?.id || requestedVersionId || ''

    // 2) 恢复 session store（字段单一真源；首帧图不在历史链 payload 内，
    //    保留当前 session 中的首帧——其按 assetId 的持久化/恢复由 session store 负责）
    originalPrompt.value = original
    session.updateOptimizedResult({
        optimizedPrompt: optimized,
        reasoning: '',
        chainId: currentChainId.value || session.chainId || '',
        versionId: currentVersionId.value || session.versionId || '',
    })

    if (record?.modelKey) {
        session.updateTextModel(record.modelKey)
    }

    if (record?.templateId) {
        session.updateTemplate(record.templateId)
    } else if (typeof detail.templateId === 'string') {
        session.updateTemplate(detail.templateId)
    }

    await queueSessionSave()
}

type VideoRestoreFavoriteDetail = {
    content: string
}

const handleRestoreFavorite = async (event: Event) => {
    if (!(event instanceof CustomEvent)) {
        return
    }
    const { content } = event.detail as VideoRestoreFavoriteDetail
    originalPrompt.value = content
}

// 在组件创建时立即注册恢复事件监听器（收藏/历史回填可能早于 onMounted）
if (typeof window !== 'undefined') {
    window.addEventListener(
        'video-workspace-restore-favorite',
        handleRestoreFavorite as EventListener,
    )
    window.addEventListener(
        'video-workspace-restore',
        handleRestoreHistory as EventListener,
    )
}

// ========================
// 初始化与生命周期
// ========================
const initialize = async () => {
    try {
        await modelSelection.refreshTextModels()
        await templateSelection.refreshOptimizeTemplates()
        await templateSelection.refreshIterateTemplates()
    } catch (e) {
        console.error('[VideoImage2VideoWorkspace] Failed to initialize:', e)
    }
}

const refreshIterateHandler = async () => {
    await templateSelection.refreshIterateTemplates()
    promptPanelRef.value?.refreshIterateTemplateSelect?.()
}

const refreshTextModelsHandler = async () => {
    try {
        await modelSelection.refreshTextModels()
    } catch (e) {
        console.warn('[VideoImage2VideoWorkspace] Failed to refresh text models after manager close:', e)
    }
}

const refreshTemplatesHandler = async () => {
    try {
        await templateSelection.refreshOptimizeTemplates()
        await templateSelection.refreshIterateTemplates()
        await nextTick()
        promptPanelRef.value?.refreshIterateTemplateSelect?.()
    } catch (e) {
        console.warn('[VideoImage2VideoWorkspace] Failed to refresh template list after manager close:', e)
    }
}

const handleTemplateSelectFocus = async () => {
    await refreshTemplatesHandler()
}

const handleTextModelSelectFocus = async () => {
    await refreshTextModelsHandler()
}

onMounted(async () => {
    try {
        await initialize()
    } catch (error) {
        console.error('[VideoImage2VideoWorkspace] Initialization failed:', error)
    }

    if (typeof window !== 'undefined') {
        window.addEventListener('video-workspace-refresh-iterate-select', refreshIterateHandler)
        window.addEventListener('video-workspace-refresh-text-models', refreshTextModelsHandler)
        window.addEventListener('video-workspace-refresh-templates', refreshTemplatesHandler)
    }

    await templateSelection.refreshOptimizeTemplates()
    await templateSelection.refreshIterateTemplates()
})

onUnmounted(() => {
    if (typeof window !== 'undefined') {
        window.removeEventListener('video-workspace-refresh-iterate-select', refreshIterateHandler)
        window.removeEventListener('video-workspace-refresh-text-models', refreshTextModelsHandler)
        window.removeEventListener('video-workspace-refresh-templates', refreshTemplatesHandler)
        window.removeEventListener(
            'video-workspace-restore-favorite',
            handleRestoreFavorite as EventListener,
        )
        window.removeEventListener(
            'video-workspace-restore',
            handleRestoreHistory as EventListener,
        )
    }
})
</script>

<style scoped>
.video-image2video-workspace {
    width: 100%;
    height: 100%;
    position: relative;
    flex: 1;
    min-height: 0;
    overflow: visible;
    padding-bottom: 8px;
}

.workspace-page-tools {
    display: contents;
}
</style>
