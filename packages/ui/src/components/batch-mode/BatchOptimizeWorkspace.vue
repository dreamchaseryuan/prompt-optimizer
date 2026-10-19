<template>
    <div class="batch-workspace" data-testid="workspace" data-mode="batch">
        <div class="batch-header">
            <NButton
                size="small"
                quaternary
                @click="returnToWorkspace"
            >
                <template #icon>←</template>
                {{ t('batch.back') }}
            </NButton>
            <NText class="batch-title" :depth="1">{{ t('batch.title') }}</NText>
            <NText depth="3">{{ t('batch.subtitle') }}</NText>
        </div>

        <div class="batch-body">
            <!-- 配置区 -->
            <NCard size="small" class="batch-config" :title="t('batch.configTitle')">
                <NFlex vertical size="small">
                    <NFlex :size="12" align="center" wrap>
                        <NFlex align="center" :size="6">
                            <NText depth="2">{{ t('batch.modeLabel') }}</NText>
                            <NRadioGroup v-model:value="mode" size="small">
                                <NRadioButton value="system">{{ t('batch.mode.system') }}</NRadioButton>
                                <NRadioButton value="user">{{ t('batch.mode.user') }}</NRadioButton>
                            </NRadioGroup>
                        </NFlex>
                    </NFlex>
                    <NFlex :size="12" align="center" wrap>
                        <NFlex vertical :size="4" class="batch-config-field">
                            <NText depth="2">{{ t('batch.templateLabel') }}</NText>
                            <TemplateSelect
                                v-model="selectedTemplate"
                                type="optimize"
                                :optimization-mode="mode"
                            />
                        </NFlex>
                        <NFlex vertical :size="4" class="batch-config-field">
                            <NText depth="2">{{ t('batch.modelLabel') }}</NText>
                            <NSelect
                                v-model:value="selectedModelKey"
                                :options="textModelOptions"
                                size="medium"
                                filterable
                                :placeholder="t('batch.modelPlaceholder')"
                            />
                        </NFlex>
                    </NFlex>
                </NFlex>
            </NCard>

            <!-- 输入区 -->
            <NCard size="small" class="batch-input" :title="t('batch.inputTitle')">
                <NFlex vertical size="small">
                    <NInput
                        v-model:value="rawInput"
                        type="textarea"
                        :rows="8"
                        :placeholder="t('batch.inputPlaceholder')"
                        :disabled="isRunning"
                    />
                    <NFlex justify="space-between" align="center">
                        <NText depth="3">{{ entryCountHint }}</NText>
                        <NFlex :size="8">
                            <NButton
                                size="small"
                                quaternary
                                :disabled="isRunning || entryCount === 0"
                                @click="clearInput"
                            >
                                {{ t('batch.clearInput') }}
                            </NButton>
                            <NButton
                                size="small"
                                quaternary
                                :disabled="entryCount === 0"
                                @click="loadExample"
                            >
                                {{ t('batch.loadExample') }}
                            </NButton>
                        </NFlex>
                    </NFlex>
                </NFlex>
            </NCard>

            <!-- 执行区 -->
            <NFlex :size="12" align="center" wrap>
                <NButton
                    type="primary"
                    :loading="isRunning"
                    :disabled="entryCount === 0 || !selectedTemplate || !selectedModelKey"
                    @click="startBatch"
                >
                    {{ isRunning ? t('batch.running') : t('batch.start') }}
                </NButton>
                <NButton
                    v-if="isRunning"
                    type="warning"
                    ghost
                    @click="stopRequested = true"
                >
                    {{ t('batch.stop') }}
                </NButton>
                <NText depth="3" data-testid="batch-progress">
                    {{ progressText }}
                </NText>
            </NFlex>

            <!-- 结果区 -->
            <NCard
                v-if="items.length > 0"
                size="small"
                class="batch-results"
                :title="t('batch.resultsTitle')"
            >
                <template #header-extra>
                    <NFlex :size="8">
                        <NButton size="tiny" quaternary :disabled="doneCount === 0" @click="copyAll">
                            {{ t('batch.copyAll') }}
                        </NButton>
                        <NButton size="tiny" quaternary :disabled="items.length === 0" @click="exportJson">
                            {{ t('batch.exportJson') }}
                        </NButton>
                        <NButton size="tiny" quaternary :disabled="isRunning" @click="resetItems">
                            {{ t('batch.clearResults') }}
                        </NButton>
                    </NFlex>
                </template>
                <NFlex vertical size="small">
                    <div
                        v-for="(item, index) in items"
                        :key="item.id"
                        class="batch-result-item"
                        :data-status="item.status"
                    >
                        <div
                            class="batch-result-row"
                            @click="toggleExpand(item.id)"
                        >
                            <NText class="batch-result-status">{{ statusIcon(item.status) }}</NText>
                            <NText class="batch-result-index" depth="3">#{{ index + 1 }}</NText>
                            <NText class="batch-result-input" :depth="item.status === 'failed' ? 3 : 1">
                                {{ firstLine(item.input) }}
                            </NText>
                            <NText v-if="item.durationMs > 0" depth="3" class="batch-result-duration">
                                {{ (item.durationMs / 1000).toFixed(1) }}s
                            </NText>
                            <NText depth="3" class="batch-result-expand">
                                {{ expandedIds.has(item.id) ? '▾' : '▸' }}
                            </NText>
                        </div>
                        <div v-if="expandedIds.has(item.id)" class="batch-result-detail">
                            <NText v-if="item.error" type="error" class="batch-result-error">
                                {{ item.error }}
                            </NText>
                            <template v-else-if="item.output">
                                <NFlex justify="flex-end" :size="8" class="batch-result-actions">
                                    <NButton size="tiny" quaternary @click.stop="copyItem(item)">
                                        {{ t('batch.copy') }}
                                    </NButton>
                                </NFlex>
                                <MarkdownRenderer :content="item.output" />
                            </template>
                            <NText v-else depth="3">{{ t('batch.noOutputYet') }}</NText>
                        </div>
                    </div>
                </NFlex>
            </NCard>
            <NText v-else depth="3" class="batch-empty">{{ t('batch.emptyResults') }}</NText>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, inject, ref, watch, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
    NButton,
    NCard,
    NFlex,
    NInput,
    NRadioButton,
    NRadioGroup,
    NSelect,
    NText,
} from 'naive-ui'
import type { Template, OptimizationMode } from '@prompt-optimizer/core'
import type { AppServices } from '../../types/services'
import type { ModelSelectOption } from '../../types/select-options'
import { DataTransformer } from '../../utils/data-transformer'
import { getProviderDisplayName, getTextModelConfigDisplayName } from '../../utils/provider-display'
import { useToast } from '../../composables/ui/useToast'
import TemplateSelect from '../TemplateSelect.vue'
import MarkdownRenderer from '../MarkdownRenderer.vue'
import { normalizeWorkspacePath } from '../../router/workspaceRoutes'

const MAX_ENTRIES = 50

type BatchStatus = 'pending' | 'running' | 'done' | 'failed' | 'cancelled'

interface BatchItem {
    id: string
    input: string
    status: BatchStatus
    output: string
    error: string
    durationMs: number
}

const { t } = useI18n()
const toast = useToast()
const router = useRouter()

const services = inject<Ref<AppServices | null>>('services')
if (!services) {
    throw new Error('[BatchOptimizeWorkspace] Services were not injected correctly.')
}

const mode = ref<OptimizationMode>('system')
const selectedTemplate = ref<Template | null>(null)
const selectedModelKey = ref('')
const rawInput = ref('')
const items = ref<BatchItem[]>([])
const expandedIds = ref<Set<string>>(new Set())
const isRunning = ref(false)
const stopRequested = ref(false)

// ---- 模型列表（本地轻量选择，不写入 session） ----
const textModelOptions = ref<ModelSelectOption[]>([])
const refreshModels = async () => {
    const mgr = services.value?.modelManager
    if (!mgr) {
        textModelOptions.value = []
        return
    }
    try {
        const manager = mgr as unknown as { ensureInitialized?: () => Promise<void> }
        if (typeof manager.ensureInitialized === 'function') {
            await manager.ensureInitialized()
        }
        const enabledModels = await mgr.getEnabledModels()
        textModelOptions.value = DataTransformer.modelsToSelectOptions(enabledModels, {
            getProviderName: (model) => getProviderDisplayName(model.providerMeta, t),
            getModelName: (model) => getTextModelConfigDisplayName(model, t)
        })
        const fallback = textModelOptions.value[0]?.value || ''
        if (!selectedModelKey.value && fallback) {
            selectedModelKey.value = fallback
        }
    } catch (error) {
        console.error('[BatchOptimizeWorkspace] refreshModels failed:', error)
        textModelOptions.value = []
    }
}
watch(
    () => services.value?.modelManager,
    () => {
        void refreshModels()
    },
    { immediate: true }
)

// ---- 输入解析：空行分隔多条，单条可多行 ----
const entries = computed<string[]>(() =>
    rawInput.value
        .split(/\n\s*\n+/)
        .map((block) => block.trim())
        .filter((block) => block.length > 0)
)
const entryCount = computed(() => entries.value.length)
const entryCountHint = computed(() => {
    const count = t('batch.entryCount', { count: entryCount.value })
    return entryCount.value > MAX_ENTRIES
        ? `${count} · ${t('batch.maxEntriesHint', { max: MAX_ENTRIES })}`
        : count
})

const clearInput = () => {
    rawInput.value = ''
}
const loadExample = () => {
    rawInput.value = [
        t('batch.example.line1'),
        t('batch.example.line2'),
        t('batch.example.line3'),
    ].join('\n\n')
}

// ---- 执行 ----
const doneCount = computed(() => items.value.filter((item) => item.status === 'done').length)
const failedCount = computed(() => items.value.filter((item) => item.status === 'failed').length)
const progressText = computed(() => {
    if (items.value.length === 0) return ''
    return t('batch.summary', {
        done: doneCount.value,
        failed: failedCount.value,
        total: items.value.length,
    })
})

const startBatch = async () => {
    if (isRunning.value) return

    const promptService = services.value?.promptService
    if (!promptService) {
        toast.error(t('toast.error.serviceInit'))
        return
    }
    if (!selectedTemplate.value) {
        toast.error(t('toast.error.noOptimizeTemplate'))
        return
    }
    if (!selectedModelKey.value) {
        toast.error(t('toast.error.noOptimizeModel'))
        return
    }

    const pendingEntries = entries.value.slice(0, MAX_ENTRIES)
    if (pendingEntries.length === 0) {
        toast.warning(t('batch.noEntries'))
        return
    }

    items.value = pendingEntries.map((input, index) => ({
        id: `batch-${Date.now()}-${index}`,
        input,
        status: 'pending',
        output: '',
        error: '',
        durationMs: 0,
    }))
    expandedIds.value = new Set()
    isRunning.value = true
    stopRequested.value = false

    const templateId = selectedTemplate.value.id
    const modelKey = selectedModelKey.value
    const optimizationMode = mode.value

    for (const item of items.value) {
        if (stopRequested.value) {
            item.status = 'cancelled'
            continue
        }
        item.status = 'running'
        const started = Date.now()
        try {
            item.output = await promptService.optimizePrompt({
                optimizationMode,
                targetPrompt: item.input,
                templateId,
                modelKey,
            })
            item.status = 'done'
        } catch (error) {
            item.status = 'failed'
            item.error = error instanceof Error ? error.message : String(error)
        }
        item.durationMs = Date.now() - started
    }

    isRunning.value = false
    const summary = t('batch.doneToast', { done: doneCount.value, failed: failedCount.value })
    if (failedCount.value > 0) {
        toast.warning(summary)
    } else {
        toast.success(summary)
    }
}

const resetItems = () => {
    if (isRunning.value) return
    items.value = []
    expandedIds.value = new Set()
}

// ---- 结果交互 ----
const toggleExpand = (id: string) => {
    const next = new Set(expandedIds.value)
    if (next.has(id)) {
        next.delete(id)
    } else {
        next.add(id)
    }
    expandedIds.value = next
}
const firstLine = (text: string) => {
    const line = text.split('\n')[0] ?? ''
    return line.length > 80 ? `${line.slice(0, 80)}…` : line
}
const statusIcon = (status: BatchStatus): string => {
    switch (status) {
        case 'done': return '✅'
        case 'failed': return '❌'
        case 'running': return '🔄'
        case 'cancelled': return '⏹'
        default: return '⏳'
    }
}

const copyText = async (text: string) => {
    try {
        await navigator.clipboard.writeText(text)
        toast.success(t('batch.copied'))
    } catch {
        toast.error(t('batch.copyFailed'))
    }
}
const copyItem = (item: BatchItem) => {
    void copyText(item.output)
}
const copyAll = () => {
    const sections = items.value
        .filter((item) => item.status === 'done')
        .map((item, index) => `## ${index + 1}. ${firstLine(item.input)}\n\n${item.output}`)
    void copyText(sections.join('\n\n---\n\n'))
}
const exportJson = () => {
    const payload = {
        generatedAt: new Date().toISOString(),
        mode: mode.value,
        templateId: selectedTemplate.value?.id ?? '',
        modelKey: selectedModelKey.value,
        items: items.value.map((item) => ({
            input: item.input,
            status: item.status,
            output: item.output,
            error: item.error || undefined,
            durationMs: item.durationMs,
        })),
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `batch-optimize-${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(url)
}

// ---- 返回 ----
const returnToWorkspace = () => {
    const from = normalizeWorkspacePath(router.currentRoute.value.query.from)
    void router.push(from ?? '/basic/system')
}
</script>

<style scoped>
.batch-workspace {
    display: flex;
    flex-direction: column;
    gap: 12px;
    height: 100%;
    overflow: auto;
    padding: 12px 16px 24px;
}
.batch-header {
    display: flex;
    align-items: center;
    gap: 12px;
}
.batch-title {
    font-size: 18px;
    font-weight: 600;
}
.batch-body {
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-width: 960px;
    width: 100%;
}
.batch-config-field {
    min-width: 280px;
    flex: 1 1 280px;
}
.batch-result-item {
    border: 1px solid var(--n-border-color, rgba(128, 128, 128, 0.25));
    border-radius: 6px;
    overflow: hidden;
}
.batch-result-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    cursor: pointer;
    user-select: none;
}
.batch-result-row:hover {
    background: rgba(128, 128, 128, 0.08);
}
.batch-result-status {
    flex-shrink: 0;
}
.batch-result-index {
    flex-shrink: 0;
    font-variant-numeric: tabular-nums;
}
.batch-result-input {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.batch-result-duration {
    flex-shrink: 0;
    font-variant-numeric: tabular-nums;
}
.batch-result-expand {
    flex-shrink: 0;
}
.batch-result-detail {
    padding: 4px 12px 12px;
    border-top: 1px dashed rgba(128, 128, 128, 0.25);
    max-height: 420px;
    overflow: auto;
}
.batch-result-error {
    white-space: pre-wrap;
    word-break: break-word;
}
.batch-result-actions {
    margin-top: 4px;
}
.batch-empty {
    display: block;
    text-align: center;
    padding: 24px 0;
}
</style>
