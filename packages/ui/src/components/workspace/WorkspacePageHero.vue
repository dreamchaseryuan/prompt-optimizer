<template>
  <!--
    WorkspacePageHero - 工作区页头（设计文档 §2.3）
    一屏一焦点：模式名 19px/700 主导视觉，副行为模式分组名。
    纯视觉组件，不含交互与逻辑；标题走既有 i18n 键。
  -->
  <header class="workspace-page-hero">
    <h1 class="workspace-page-hero-title">{{ t(titleKey) }}</h1>
    <p v-if="subtitleKey" class="workspace-page-hero-sub">{{ t(subtitleKey) }}</p>
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
