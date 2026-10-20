<template>
  <NFlex align="center" :wrap="false" :size="12">
    <!-- 快捷操作按钮 -->
    <!-- 工具管理 -->
    <NButton
      size="small"
      type="default"
      @click="$emit('open-tool-manager')"
      :title="$t('contextMode.actions.tools')"
    >
      <template #icon>
        <span :style="{ display: 'inline-flex', alignItems: 'center', marginRight: '4px', verticalAlign: '-3px' }"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg></span>
      </template>
      {{ $t('contextMode.actions.tools') }}
    </NButton>
  </NFlex>
</template>

<script setup lang="ts">
import { NButton, NFlex } from 'naive-ui'

const emit = defineEmits<{
  'open-tool-manager': []
}>()
</script>

<style scoped>
/* 确保按钮组在小屏幕上也能正常显示 */
</style>
