<template>
  <div class="reference-image-uploader">
    <input
      ref="fileInputRef"
      type="file"
      accept="image/*"
      class="uploader-hidden-input"
      @change="handleFileChange"
    />

    <!-- 已选择首帧：缩略图 + 移除 -->
    <div v-if="modelValue" class="uploader-preview">
      <img
        class="uploader-thumbnail"
        :src="previewSrc"
        :alt="t('videoWorkspace.input.selectImage')"
      />
      <n-button quaternary size="small" @click="handleRemove">
        {{ t('videoWorkspace.input.removeImage') }}
      </n-button>
    </div>

    <!-- 未选择：上传按钮 -->
    <n-button
      v-else
      size="small"
      :loading="isPreparing"
      :disabled="disabled"
      @click="fileInputRef?.click()"
    >
      {{ t('videoWorkspace.input.selectImage') }}
    </n-button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { NButton } from 'naive-ui'
import type { ImageInputRef } from '@prompt-optimizer/core'
import { fileToImageInputRef } from '../../utils/image-compression'
import { useImageInputPreparation } from '../../composables/image/useImageInputPreparation'

defineOptions({ name: 'ReferenceImageUploader' })

const props = withDefaults(
  defineProps<{
    /** 是否禁用上传 */
    disabled?: boolean
  }>(),
  {
    disabled: false,
  },
)

/** 当前首帧（b64 + mimeType）；null 表示未选择 */
const modelValue = defineModel<ImageInputRef | null>({ default: null })

const emit = defineEmits<{
  /** 选择/移除后触发（payload 为 null 表示移除） */
  change: [image: ImageInputRef | null]
  error: [message: string]
}>()

const { t } = useI18n()
const { prepareFiles } = useImageInputPreparation()

const fileInputRef = ref<HTMLInputElement | null>(null)
const isPreparing = ref(false)

const previewSrc = computed(() => {
  const image = modelValue.value
  if (!image?.b64) return ''
  return `data:${image.mimeType || 'image/png'};base64,${image.b64}`
})

const handleFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files ?? [])
  // 允许连续选择同一文件
  input.value = ''
  if (files.length === 0) return

  // 只取第一张（首帧单图契约，见设计 Q2）
  const file = files[0]

  isPreparing.value = true
  try {
    // 复用 image 系压缩链：超限/类型错误时内部已 toast 并返回 null
    const results = await prepareFiles([file])
    if (!results || results.length === 0) return

    const imageRef = await fileToImageInputRef(results[0].file)
    modelValue.value = imageRef
    emit('change', imageRef)
  } catch (error) {
    console.error('[ReferenceImageUploader] Failed to load image:', error)
    emit('error', t('videoWorkspace.upload.loadFailed'))
  } finally {
    isPreparing.value = false
  }
}

const handleRemove = () => {
  modelValue.value = null
  emit('change', null)
}
</script>

<style scoped>
.reference-image-uploader {
  display: inline-flex;
  align-items: center;
}

.uploader-hidden-input {
  display: none;
}

.uploader-preview {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.uploader-thumbnail {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid var(--border-color, #d0d5dd);
}
</style>
