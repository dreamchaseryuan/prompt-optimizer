<template>
  <NDropdown
    :options="dropdownOptions"
    @select="handleThemeSelect"
    placement="bottom-end"
    trigger="click"
  >
    <NButton 
      quaternary 
      size="small"
      class="flex items-center justify-center gap-1"
    >
      <template #icon>
        <component :is="currentThemeIcon" />
      </template>
      <span class="text-sm max-md:hidden truncate">{{ currentThemeLabel }}</span>
    </NButton>
  </NDropdown>
</template>
  
<script setup lang="ts">
import { computed, h } from 'vue'

import { useI18n } from 'vue-i18n'
import { NButton, NDropdown, type DropdownOption } from 'naive-ui'
import { useNaiveTheme } from '../composables/ui/useNaiveTheme'

const { t } = useI18n()

// 使用新的主题系统
const {
  themeId,
  changeTheme
} = useNaiveTheme()

// 主题下拉只展示 light/dark/auto（legacy 主题已收敛映射，见 naive-theme.ts）
const THEME_OPTIONS = ['auto', 'light', 'dark'] as const

// 创建主题 SVG 图标
const createThemeIcon = (themeId: string, isColored: boolean = false) => {
  const baseClass = 'w-4 h-4'

  switch (themeId) {
    case 'auto':
      return h('svg', {
        class: `${baseClass}`,
        style: isColored ? 'color: #9d5fb8;' : undefined,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        'stroke-width': '1.8',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
      }, [
        h('rect', { x: '3', y: '4', width: '18', height: '13', rx: '1.5' }),
        h('path', { d: 'M8 21h8M12 17v4' })
      ])

    case 'light':
      return h('svg', {
        class: `${baseClass}`,
        style: isColored ? 'color: #dfa243;' : undefined,
        viewBox: '0 0 24 24',
        fill: 'currentColor'
      }, [
        h('path', {
          d: 'M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z'
        })
      ])

    case 'dark':
      return h('svg', {
        class: `${baseClass}`,
        style: isColored ? 'color: #9d5fb8;' : undefined,
        viewBox: '0 0 24 24',
        fill: 'currentColor'
      }, [
        h('path', {
          'fill-rule': 'evenodd',
          d: 'M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z',
          'clip-rule': 'evenodd'
        })
      ])

    default:
      return null
  }
}

// 当前主题的图标
const currentThemeIcon = computed(() => createThemeIcon(themeId.value, true))

// 当前主题的标签（使用国际化）
const currentThemeLabel = computed(() => {
  return t(`theme.${themeId.value}`)
})

// 为Naive UI Dropdown创建选项
const dropdownOptions = computed<DropdownOption[]>(() => {
  return THEME_OPTIONS.map(id => ({
    key: id,
    label: t(`theme.${id}`),
    icon: () => createThemeIcon(id, true)
  }))
})

// 处理主题选择
const handleThemeSelect = (key: string) => {
  changeTheme(key)
}
</script>