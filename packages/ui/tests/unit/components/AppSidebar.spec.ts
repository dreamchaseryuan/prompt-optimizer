import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'

const { currentRoute, push } = vi.hoisted(() => ({
  currentRoute: { value: { path: '/basic/system' } },
  push: vi.fn(),
}))

vi.mock('../../../src/router', () => ({
  router: {
    currentRoute,
    push,
  },
}))

const i18nMap: Record<string, string> = {
  'common.appName': 'Always200 Prompt',
  'nav.basicMode': 'Basic',
  'nav.contextMode': 'Context',
  'nav.imageMode': 'Image',
  'nav.tools': 'Tools',
  'nav.batch': 'Batch Optimize',
  'nav.favorites': 'Favorites',
  'nav.templates': 'Templates',
  'nav.history': 'History',
  'nav.modelManager': 'Model Manager',
  'nav.dataManager': 'Data Manager',
  'nav.variableManager': 'Variable Manager',
  'nav.about': 'About',
  'promptOptimizer.systemPrompt': 'System Prompt',
  'promptOptimizer.userPrompt': 'User Prompt',
  'contextMode.optimizationMode.message': 'Message',
  'contextMode.optimizationMode.variable': 'Variable',
  'imageMode.text2image': 'Text2Image',
  'imageMode.image2image': 'Image2Image',
  'imageMode.multiimage': 'MultiImage',
  'updater.viewOnGitHub': 'View on GitHub',
  'about.website': 'Website',
  'about.websiteLabel': 'always200.com',
  'about.documentation': 'Docs',
  'about.documentationLabel': 'docs.always200.com',
  'dataManager.backupReminder.tooltip': 'Backup reminder',
}

const translate = (key: string) => i18nMap[key] ?? key

vi.mock('vue-i18n', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-i18n')>()
  return {
    ...actual,
    useI18n: () => ({ t: translate }),
  }
})

vi.mock('naive-ui', async (importOriginal) => {
  const actual = await importOriginal<typeof import('naive-ui')>()
  return {
    ...actual,
    NButton: defineComponent({
      name: 'NButton',
      setup(_, { slots, attrs }) {
        return () => h('button', attrs, slots.default?.())
      },
    }),
    NPopover: defineComponent({
      name: 'NPopover',
      setup(_, { slots }) {
        return () =>
          h('div', { class: 'n-popover-stub' }, [
            h('div', { class: 'n-popover-trigger' }, slots.trigger?.()),
            h('div', { class: 'n-popover-content' }, slots.default?.()),
          ])
      },
    }),
    NTag: defineComponent({
      name: 'NTag',
      setup(_, { slots, attrs }) {
        return () => h('span', { class: 'n-tag-stub', ...attrs }, slots.default?.())
      },
    }),
  }
})

import AppSidebar from '../../../src/components/app-layout/AppSidebar.vue'

const mountSidebar = (props: Record<string, unknown> = {}) =>
  mount(AppSidebar, {
    props: {
      appVersion: 'v3.0.0',
      ...props,
    },
    global: {
      mocks: { $t: translate },
      stubs: {
        ThemeToggleUI: true,
        LanguageSwitchDropdown: true,
        UpdaterIcon: true,
        AppPreviewImage: true,
      },
    },
  })

describe('AppSidebar', () => {
  it('renders workspace navigation with active route marked', () => {
    const wrapper = mountSidebar()

    expect(wrapper.find('[data-testid="app-sidebar"]').exists()).toBe(true)
    expect(wrapper.find('.sidebar-brand-name').text()).toBe('Always200 Prompt')
    expect(wrapper.text()).toContain('System Prompt')
    expect(wrapper.text()).toContain('Text2Image')
    expect(wrapper.text()).toContain('Tools')

    const active = wrapper.find('[data-testid="sidebar-nav--basic-system"]')
    expect(active.classes()).toContain('nav-item-active')
    expect(active.attributes('aria-current')).toBe('page')
  })

  it('navigates workspace routes via router.push', async () => {
    const wrapper = mountSidebar()
    push.mockClear()
    currentRoute.value = { path: '/basic/system' }

    await wrapper.find('[data-testid="sidebar-nav--basic-user"]').trigger('click')
    expect(push).toHaveBeenCalledWith('/basic/user')

    // 已激活路由不再重复 push
    await wrapper.find('[data-testid="sidebar-nav--basic-system"]').trigger('click')
    expect(push).toHaveBeenCalledTimes(1)
  })

  it('emits tool events and marks active tools', async () => {
    const wrapper = mountSidebar({ favoritesActive: true, backupReminderDue: true })

    const favorites = wrapper.find('[data-testid="sidebar-tool-favorites"]')
    expect(favorites.classes()).toContain('nav-item-active')
    await favorites.trigger('click')
    expect(wrapper.emitted('open-favorites')).toHaveLength(1)

    const dataManager = wrapper.find('[data-testid="sidebar-tool-dataManager"]')
    expect(dataManager.classes()).toContain('nav-item-warning')
    await dataManager.trigger('click')
    expect(wrapper.emitted('open-data-manager')).toHaveLength(1)

    await wrapper.find('[data-testid="sidebar-tool-history"]').trigger('click')
    expect(wrapper.emitted('open-history')).toHaveLength(1)

    await wrapper.find('[data-testid="sidebar-github"]').trigger('click')
    expect(wrapper.emitted('open-github')).toHaveLength(1)
  })

  it('collapses to icon rail and persists the choice', async () => {
    localStorage.removeItem('ui.sidebarCollapsed')
    const wrapper = mountSidebar()

    const aside = wrapper.find('[data-testid="app-sidebar"]')
    expect(aside.classes()).not.toContain('app-sidebar-collapsed')
    expect(wrapper.find('.sidebar-brand-name').exists()).toBe(true)
    expect(wrapper.find('.nav-section-title').exists()).toBe(true)

    await wrapper.find('[data-testid="sidebar-collapse"]').trigger('click')

    expect(aside.classes()).toContain('app-sidebar-collapsed')
    expect(wrapper.find('.sidebar-brand-name').exists()).toBe(false)
    expect(wrapper.find('.nav-section-title').exists()).toBe(false)
    expect(aside.find('[data-testid="sidebar-tool-batch"]').attributes('title')).toBe('Batch Optimize')
    expect(localStorage.getItem('ui.sidebarCollapsed')).toBe('1')

    await wrapper.find('[data-testid="sidebar-collapse"]').trigger('click')
    expect(aside.classes()).not.toContain('app-sidebar-collapsed')
    expect(localStorage.getItem('ui.sidebarCollapsed')).toBe('0')

    localStorage.removeItem('ui.sidebarCollapsed')
  })
})
