<template>
  <!--
    WorkspacePageHero - 工作区页头（设计文档 §2.3）
    一屏一焦点：分组名作为眉标先于模式名出现，模式名 26px/700 主导视觉。
    纯视觉组件，不含交互与逻辑；标题走既有 i18n 键。
  -->
  <header class="workspace-page-hero">
    <p v-if="subtitleKey" class="workspace-page-hero-eyebrow">{{ t(subtitleKey) }}</p>
    <h1 class="workspace-page-hero-title">{{ t(titleKey) }}</h1>
  </header>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

defineProps<{
  /** 模式名 i18n 键（如 promptOptimizer.systemPrompt） */
  titleKey: string
  /** 分组名 i18n 键（如 nav.basicMode），可省略 */
  subtitleKey?: string
}>()

const { t } = useI18n()
</script>
