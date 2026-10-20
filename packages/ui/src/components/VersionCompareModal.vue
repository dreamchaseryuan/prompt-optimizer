<template>
  <NModal
    :show="show"
    @update:show="$emit('update:show', $event)"
  >
    <NCard
      class="version-compare-modal"
      :title="t('favorites.version.compareTitle')"
      :bordered="false"
      size="small"
      role="dialog"
      aria-modal="true"
    >
      <template #header-extra>
        <NTag
          v-if="hasDiff"
          size="small"
          :bordered="false"
          data-testid="version-compare-stats"
        >
          <NText type="success">+{{ diff.added }}</NText>
          <NText depth="3"> / </NText>
          <NText type="error">-{{ diff.removed }}</NText>
        </NTag>
      </template>

      <div class="version-compare-modal__selectors">
        <label class="version-compare-modal__selector">
          <NText depth="3">{{ t('favorites.version.compareLeft') }}</NText>
          <NSelect
            v-model:value="leftVersionId"
            size="small"
            :options="versionOptions"
            data-testid="version-compare-left"
          />
        </label>
        <label class="version-compare-modal__selector">
          <NText depth="3">{{ t('favorites.version.compareRight') }}</NText>
          <NSelect
            v-model:value="rightVersionId"
            size="small"
            :options="versionOptions"
            data-testid="version-compare-right"
          />
        </label>
      </div>

      <div
        v-if="hasDiff"
        class="version-compare-modal__diff"
        data-testid="version-compare-diff"
      >
        <div
          v-for="(line, index) in diff.lines"
          :key="index"
          class="version-compare-modal__line"
          :class="`is-${line.type}`"
          :data-line-type="line.type"
        >
          <span class="version-compare-modal__gutter">
            {{ line.leftLineNumber ?? '' }}
          </span>
          <span class="version-compare-modal__gutter">
            {{ line.rightLineNumber ?? '' }}
          </span>
          <span class="version-compare-modal__marker">
            {{ line.type === 'add' ? '+' : line.type === 'remove' ? '-' : ' ' }}
          </span>
          <span class="version-compare-modal__text">{{ line.text }}</span>
        </div>
      </div>
      <NEmpty
        v-else
        :description="t('favorites.version.compareNoDiff')"
        data-testid="version-compare-empty"
      />

      <template #footer>
        <div class="version-compare-modal__footer">
          <NButton @click="$emit('update:show', false)">
            {{ t('favorites.version.compareClose') }}
          </NButton>
        </div>
      </template>
    </NCard>
  </NModal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { NButton, NCard, NEmpty, NModal, NSelect, NTag, NText } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import type { PromptAsset, PromptContentVersion } from '@prompt-optimizer/core'

import {
  promptContentToEditableText,
  sortPromptAssetVersionsForDisplay,
} from '../utils/favorite-prompt-versions'
import { diffTextLines } from '../utils/text-diff'

const props = defineProps<{
  show: boolean
  promptAsset: PromptAsset | null
  /** 打开时默认的左侧（基准）版本；缺省取次新版本 */
  initialLeftVersionId?: string
}>()

defineEmits<{
  'update:show': [show: boolean]
}>()

const { t } = useI18n()

const versions = computed<PromptContentVersion[]>(() =>
  props.promptAsset ? sortPromptAssetVersionsForDisplay(props.promptAsset.versions) : [],
)

const versionOptions = computed(() =>
  versions.value.map((version) => ({
    label: t('favorites.version.itemLabel', { version: version.version }),
    value: version.id,
  })),
)

const leftVersionId = ref('')
const rightVersionId = ref('')

const pickDefaultIds = () => {
  const list = versions.value
  if (list.length === 0) return { left: '', right: '' }
  const currentId = props.promptAsset?.currentVersionId || list[0].id
  const right = currentId
  const fallbackLeft =
    list.find((version) => version.id !== right)?.id
    || props.initialLeftVersionId
    || right
  const left =
    props.initialLeftVersionId && props.initialLeftVersionId !== right
      ? props.initialLeftVersionId
      : fallbackLeft
  return { left, right }
}

watch(
  () => [props.show, props.promptAsset, props.initialLeftVersionId] as const,
  ([show]) => {
    if (!show) return
    const defaults = pickDefaultIds()
    leftVersionId.value = defaults.left
    rightVersionId.value = defaults.right
  },
  { immediate: true },
)

const leftVersion = computed(() =>
  versions.value.find((version) => version.id === leftVersionId.value) ?? null,
)
const rightVersion = computed(() =>
  versions.value.find((version) => version.id === rightVersionId.value) ?? null,
)

const diff = computed(() => {
  if (!leftVersion.value || !rightVersion.value) {
    return { lines: [], added: 0, removed: 0 }
  }
  return diffTextLines(
    promptContentToEditableText(leftVersion.value.content),
    promptContentToEditableText(rightVersion.value.content),
  )
})

const hasDiff = computed(() => diff.value.lines.some((line) => line.type !== 'equal'))
</script>

<style scoped>
.version-compare-modal {
  width: min(920px, calc(100vw - 32px));
}

.version-compare-modal__selectors {
  display: flex;
  gap: 12px;
  margin-bottom: 10px;
}

.version-compare-modal__selector {
  display: flex;
  flex: 1;
  min-width: 0;
  flex-direction: column;
  gap: 4px;
}

.version-compare-modal__diff {
  max-height: 56vh;
  overflow: auto;
  border: 1px solid color-mix(in srgb, var(--n-border-color) 72%, transparent);
  border-radius: 8px;
  background: var(--n-color);
  font-family: var(--ds-font-family-mono);
  font-size: 12px;
  line-height: 1.6;
}

.version-compare-modal__line {
  display: flex;
  min-width: 0;
  white-space: pre;
}

.version-compare-modal__line.is-add {
  background: rgba(46, 160, 67, 0.14);
}

.version-compare-modal__line.is-remove {
  background: rgba(248, 81, 73, 0.14);
}

.version-compare-modal__gutter {
  flex: 0 0 44px;
  border-right: 1px solid color-mix(in srgb, var(--n-border-color) 55%, transparent);
  color: var(--n-text-color-3);
  padding: 0 8px;
  text-align: right;
  user-select: none;
}

.version-compare-modal__marker {
  flex: 0 0 18px;
  color: var(--n-text-color-3);
  text-align: center;
  user-select: none;
}

.version-compare-modal__line.is-add .version-compare-modal__marker {
  color: #1a7f37;
}

.version-compare-modal__line.is-remove .version-compare-modal__marker {
  color: #cf222e;
}

.version-compare-modal__text {
  flex: 1;
  min-width: 0;
  overflow-x: auto;
  padding-right: 12px;
}

.version-compare-modal__footer {
  display: flex;
  justify-content: flex-end;
}
</style>
