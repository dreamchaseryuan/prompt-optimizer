<template>
  <!--
      AppSidebar - 侧边栏应用壳导航

      职责:
      - 品牌区（Logo + 产品名）
      - 工作区分组导航（基础 / 上下文 / 图像，直接落路由）
      - 工具入口（批量优化 / 收藏夹 / 弹窗型管理入口）
      - 底部辅助（主题 / 语言 / GitHub / 关于 / 更新）
  -->
  <aside class="app-sidebar" data-testid="app-sidebar">
    <!-- 品牌 -->
    <div class="sidebar-brand">
      <AppPreviewImage
        :src="logoSrc"
        alt="Logo"
        :width="26"
        :height="26"
        object-fit="cover"
        class="sidebar-logo"
        :show-toolbar="false"
        :preview-disabled="true"
        :fallback-src="fallbackLogoSrc"
      />
      <span class="sidebar-brand-name">{{ t('common.appName') }}</span>
    </div>

    <!-- 工作区分组 -->
    <nav class="sidebar-nav" data-testid="sidebar-workspace-nav">
      <div v-for="section in workspaceSections" :key="section.titleKey" class="nav-section">
        <div class="nav-section-title">{{ t(section.titleKey) }}</div>
        <button
          v-for="item in section.items"
          :key="item.path"
          type="button"
          class="nav-item"
          :class="{ 'nav-item-active': isActivePath(item.path) }"
          :data-testid="`sidebar-nav-${item.path.replace(/\W+/g, '-')}`"
          :aria-current="isActivePath(item.path) ? 'page' : undefined"
          @click="navigate(item.path)"
        >
          <span class="nav-item-icon" aria-hidden="true">{{ item.icon }}</span>
          <span class="nav-item-label">{{ t(item.labelKey) }}</span>
        </button>
      </div>
    </nav>

    <!-- 工具入口 -->
    <div class="nav-section nav-section-tools" data-testid="sidebar-tools">
      <div class="nav-section-title">{{ t('nav.tools') }}</div>
      <button
        v-for="tool in toolItems"
        :key="tool.key"
        type="button"
        class="nav-item"
        :class="{ 'nav-item-active': tool.active, 'nav-item-warning': tool.warn }"
        :data-testid="`sidebar-tool-${tool.key}`"
        :aria-current="tool.active ? 'page' : undefined"
        @click="handleToolClick(tool)"
      >
        <span class="nav-item-icon" aria-hidden="true">{{ tool.icon }}</span>
        <span class="nav-item-label">{{ t(tool.labelKey) }}</span>
        <span v-if="tool.warn" class="nav-item-dot" :title="t('dataManager.backupReminder.tooltip')" />
      </button>
    </div>

    <!-- 底部辅助 -->
    <div class="sidebar-footer">
      <ThemeToggleUI />
      <div class="sidebar-footer-icons">
        <NButton
          quaternary
          circle
          size="small"
          class="footer-icon-button"
          :title="t('updater.viewOnGitHub')"
          data-testid="sidebar-github"
          @click="emit('open-github')"
        >
          <template #icon>
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path
                d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"
              />
            </svg>
          </template>
        </NButton>
        <NPopover v-model:show="showAboutPopover" trigger="click" placement="right-end" :show-arrow="false">
          <template #trigger>
            <NButton
              quaternary
              circle
              size="small"
              class="footer-icon-button"
              :title="t('nav.about')"
              data-testid="sidebar-about"
            >
              <template #icon>
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 10v6" />
                  <path d="M12 7.25h.01" />
                </svg>
              </template>
            </NButton>
          </template>
          <div class="about-panel">
            <div class="about-panel-header">
              <NTag round size="small" class="about-version-tag">{{ appVersion }}</NTag>
            </div>
            <NButton quaternary block class="about-link-button" @click="handleOpenWebsite">
              <span class="about-link-copy">
                <span class="about-link-label">{{ t('about.website') }}</span>
                <span class="about-link-value">{{ t('about.websiteLabel') }}</span>
              </span>
            </NButton>
            <NButton quaternary block class="about-link-button" @click="handleOpenDocs">
              <span class="about-link-copy">
                <span class="about-link-label">{{ t('about.documentation') }}</span>
                <span class="about-link-value">{{ t('about.documentationLabel') }}</span>
              </span>
            </NButton>
          </div>
        </NPopover>
        <LanguageSwitchDropdown />
        <UpdaterIcon />
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { NButton, NPopover, NTag } from 'naive-ui'
import { router as routerInstance } from '../../router'
import ThemeToggleUI from '../ThemeToggleUI.vue'
import LanguageSwitchDropdown from '../LanguageSwitchDropdown.vue'
import UpdaterIcon from '../UpdaterIcon.vue'
import AppPreviewImage from '../media/AppPreviewImage.vue'
import logoImage from '../../assets/logo.png'

const { t } = useI18n()

interface Props {
  appVersion: string
  favoritesActive?: boolean
  batchActive?: boolean
  backupReminderDue?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  favoritesActive: false,
  batchActive: false,
  backupReminderDue: false,
})

const emit = defineEmits<{
  'open-batch': []
  'open-favorites': []
  'open-templates': []
  'open-history': []
  'open-model-manager': []
  'open-data-manager': []
  'open-variables': []
  'open-website': []
  'open-docs': []
  'open-github': []
}>()

// ========================
// 品牌
// ========================
const logoSrc = logoImage
const createFallbackSvg = () =>
  `data:image/svg+xml,${encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="8" fill="#4f46e5"/><text x="16" y="21" text-anchor="middle" fill="white" font-family="system-ui" font-size="14" font-weight="bold">A</text></svg>',
  )}`
const fallbackLogoSrc = createFallbackSvg()

// ========================
// 工作区导航（直接落路由）
// ========================
interface NavItem {
  path: string
  labelKey: string
  icon: string
}

interface NavSection {
  titleKey: string
  items: NavItem[]
}

const workspaceSections = computed<NavSection[]>(() => [
  {
    titleKey: 'nav.basicMode',
    items: [
      { path: '/basic/system', labelKey: 'promptOptimizer.systemPrompt', icon: '🖥️' },
      { path: '/basic/user', labelKey: 'promptOptimizer.userPrompt', icon: '📝' },
    ],
  },
  {
    titleKey: 'nav.contextMode',
    items: [
      { path: '/pro/multi', labelKey: 'contextMode.optimizationMode.message', icon: '💬' },
      { path: '/pro/variable', labelKey: 'contextMode.optimizationMode.variable', icon: '🔣' },
    ],
  },
  {
    titleKey: 'nav.imageMode',
    items: [
      { path: '/image/text2image', labelKey: 'imageMode.text2image', icon: '🎨' },
      { path: '/image/image2image', labelKey: 'imageMode.image2image', icon: '🖼️' },
      { path: '/image/multiimage', labelKey: 'imageMode.multiimage', icon: '🗂️' },
    ],
  },
])

const activePath = computed(() => routerInstance.currentRoute.value.path)
const isActivePath = (path: string) => activePath.value === path
const navigate = (path: string) => {
  if (activePath.value !== path) routerInstance.push(path)
}

// ========================
// 工具入口
// ========================
interface ToolItem {
  key: string
  icon: string
  labelKey: string
  emitEvent: 'open-batch' | 'open-favorites' | 'open-templates' | 'open-history' | 'open-model-manager' | 'open-data-manager' | 'open-variables'
  active?: boolean
  warn?: boolean
}

const toolItems = computed<ToolItem[]>(() => [
  { key: 'batch', icon: '⚡', labelKey: 'nav.batch', emitEvent: 'open-batch', active: props.batchActive },
  { key: 'favorites', icon: '⭐', labelKey: 'nav.favorites', emitEvent: 'open-favorites', active: props.favoritesActive },
  { key: 'templates', icon: '🗂️', labelKey: 'nav.templates', emitEvent: 'open-templates' },
  { key: 'history', icon: '📜', labelKey: 'nav.history', emitEvent: 'open-history' },
  { key: 'modelManager', icon: '⚙️', labelKey: 'nav.modelManager', emitEvent: 'open-model-manager' },
  { key: 'dataManager', icon: '💾', labelKey: 'nav.dataManager', emitEvent: 'open-data-manager', warn: props.backupReminderDue },
  { key: 'variables', icon: '🔢', labelKey: 'nav.variableManager', emitEvent: 'open-variables' },
])

const handleToolClick = (item: ToolItem) => {
  switch (item.emitEvent) {
    case 'open-batch':
      emit('open-batch')
      break
    case 'open-favorites':
      emit('open-favorites')
      break
    case 'open-templates':
      emit('open-templates')
      break
    case 'open-history':
      emit('open-history')
      break
    case 'open-model-manager':
      emit('open-model-manager')
      break
    case 'open-data-manager':
      emit('open-data-manager')
      break
    case 'open-variables':
      emit('open-variables')
      break
  }
}

// ========================
// 关于
// ========================
const showAboutPopover = ref(false)

const handleOpenWebsite = () => {
  showAboutPopover.value = false
  emit('open-website')
}

const handleOpenDocs = () => {
  showAboutPopover.value = false
  emit('open-docs')
}
</script>

<style scoped>
.app-sidebar {
  display: flex;
  flex-direction: column;
  width: 232px;
  height: 100%;
  flex-shrink: 0;
  background: var(--n-card-color);
  border-right: 1px solid var(--n-border-color);
  overflow: hidden;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px 12px;
  flex-shrink: 0;
}

.sidebar-logo {
  border-radius: 7px;
  flex-shrink: 0;
}

.sidebar-brand-name {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--n-text-color-1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-nav {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 4px 10px 8px;
}

.nav-section {
  margin-bottom: 14px;
}

.nav-section-title {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--n-text-color-3);
  padding: 4px 8px 6px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 9px;
  width: 100%;
  height: 34px;
  padding: 0 9px;
  margin: 1px 0;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--n-text-color-2);
  font: inherit;
  font-size: 13px;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.12s ease, color 0.12s ease;
}

.nav-item:hover {
  background: var(--n-hover-color);
  color: var(--n-text-color-1);
}

.nav-item:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--n-primary-color) 30%, transparent);
}

.nav-item-active {
  background: color-mix(in srgb, var(--n-primary-color) 10%, transparent);
  color: var(--n-primary-color);
  font-weight: 600;
}

.nav-item-active:hover {
  background: color-mix(in srgb, var(--n-primary-color) 14%, transparent);
  color: var(--n-primary-color);
}

.nav-item-icon {
  font-size: 14px;
  line-height: 1;
  flex-shrink: 0;
  opacity: 0.9;
}

.nav-item-label {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-item-warning .nav-item-label {
  color: var(--n-warning-color, #d97706);
}

.nav-item-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--n-warning-color, #d97706);
  flex-shrink: 0;
}

.nav-section-tools {
  padding: 0 10px 8px;
  border-top: 1px solid var(--n-divider-color);
  padding-top: 12px;
  margin-bottom: 0;
}

.sidebar-footer {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 12px;
  border-top: 1px solid var(--n-divider-color);
}

.sidebar-footer-icons {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.footer-icon-button {
  width: 28px;
  height: 28px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.about-panel {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 220px;
  max-width: 260px;
}

.about-panel-header {
  display: flex;
  justify-content: flex-end;
}

.about-link-button {
  width: 100%;
  justify-content: space-between;
  gap: 12px;
}

.about-link-copy {
  display: inline-flex;
  align-items: baseline;
  gap: 8px;
  min-width: 0;
  text-align: left;
}

.about-link-label {
  flex-shrink: 0;
  font-size: 11px;
  color: var(--n-text-color-3);
}

.about-link-value {
  min-width: 0;
  font-size: 12px;
  font-weight: 600;
  color: var(--n-text-color-2);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
