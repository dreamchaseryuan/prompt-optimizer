import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'

const i18nMap: Record<string, string> = {
  'nav.templates': 'Templates',
  'nav.history': 'History',
  'nav.modelManager': 'Model Manager',
  'nav.favorites': 'Favorite Library',
  'nav.dataManager': 'Data Manager',
  'nav.variableManager': 'Variable Manager',
  'nav.more': 'More Tools',
  'nav.about': 'About',
  'updater.viewOnGitHub': 'View on GitHub',
  'about.title': 'Prompt Optimizer',
  'about.website': 'Website',
  'about.websiteLabel': 'always200.com',
  'about.documentation': 'Docs',
  'about.documentationLabel': 'docs.always200.com',
  'dataManager.backupReminder.tooltip':
    'No data export in over 10 days. Export a local copy.',
}

const translate = (key: string) => i18nMap[key] ?? key

vi.mock('vue-i18n', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-i18n')>()
  return {
    ...actual,
    useI18n: () => ({
      t: translate,
    }),
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
    NBadge: defineComponent({
      name: 'NBadge',
      props: ['show'],
      setup(props, { slots }) {
        return () => h('span', { class: 'n-badge-stub', 'data-show': String(Boolean(props.show)) }, slots.default?.())
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
    NText: defineComponent({
      name: 'NText',
      setup(_, { slots }) {
        return () => h('span', { class: 'n-text-stub' }, slots.default?.())
      },
    }),
  }
})

import AppHeaderActions from '../../../src/components/app-layout/AppHeaderActions.vue'

const actionButtonStub = defineComponent({
  name: 'ActionButtonUI',
  props: ['text', 'type'],
  emits: ['click'],
  setup(props, { emit, attrs }) {
    return () =>
      h(
        'button',
        {
          ...attrs,
          class: attrs.class,
          'data-type': props.type,
          onClick: () => emit('click'),
        },
        props.text,
      )
  },
})

const baseStubs = {
  ThemeToggleUI: true,
  LanguageSwitchDropdown: true,
  UpdaterIcon: true,
  ActionButtonUI: actionButtonStub,
}

describe('AppHeaderActions about menu layout hooks', () => {
  it('renders the about popover with naive-themed panel content', () => {
    const wrapper = mount(AppHeaderActions, {
      props: {
        appVersion: 'v2.7.0',
      },
      global: {
        renderStubDefaultSlot: true,
        mocks: { $t: translate },
        stubs: {
          ThemeToggleUI: true,
          LanguageSwitchDropdown: true,
          UpdaterIcon: true,
          ActionButtonUI: true,
        },
      },
    })

    expect(wrapper.find('.about-flyout').exists()).toBe(false)
    expect(wrapper.findAll('.about-chip')).toHaveLength(0)
    expect(wrapper.find('.about-panel').exists()).toBe(true)
    expect(wrapper.find('.about-version-tag').text()).toContain('v2.7.0')
    expect(wrapper.findAll('.about-link-button')).toHaveLength(2)
    expect(wrapper.text()).toContain('always200.com')
    expect(wrapper.text()).toContain('docs.always200.com')
  })

  it('separates the favorites page destination from modal tools and marks it active', async () => {
    const wrapper = mount(AppHeaderActions, {
      props: {
        appVersion: 'v2.7.0',
        favoritesActive: true,
      },
      global: {
        mocks: { $t: translate },
        stubs: baseStubs,
      },
    })

    const pageGroup = wrapper.find('[data-testid="header-page-destinations"]')
    const moreMenu = wrapper.find('[data-testid="header-modal-actions"]')

    expect(pageGroup.exists()).toBe(true)
    expect(moreMenu.exists()).toBe(true)
    expect(pageGroup.text()).toContain('Favorite Library')
    expect(moreMenu.text()).not.toContain('Favorite Library')
    expect(moreMenu.text()).toContain('Templates')
    expect(moreMenu.text()).toContain('History')
    expect(moreMenu.text()).toContain('Model Manager')

    const favoritesAction = pageGroup.find('[data-testid="header-favorites-page-action"]')
    expect(favoritesAction.attributes('data-type')).toBe('primary')
    expect(favoritesAction.attributes('aria-current')).toBe('page')
    expect(favoritesAction.attributes('title')).toBe('favorites.page.title')

    await favoritesAction.trigger('click')

    expect(wrapper.emitted('open-favorites')).toHaveLength(1)
  })

  it('marks the data manager menu item when an existing backup is stale', async () => {
    const wrapper = mount(AppHeaderActions, {
      props: {
        appVersion: 'v2.7.0',
        backupReminderDue: true,
      },
      global: {
        mocks: { $t: translate },
        stubs: baseStubs,
      },
    })

    const dataManagerItem = wrapper
      .findAll('[data-testid="header-modal-actions"] button')
      .find((button) => button.text().includes('Data Manager'))

    expect(wrapper.find('.n-badge-stub[data-show="true"]').exists()).toBe(true)
    expect(dataManagerItem?.classes()).toContain('more-tools-item-warning')
    expect(dataManagerItem?.find('.more-tools-item-dot').attributes('title')).toBe(
      'No data export in over 10 days. Export a local copy.',
    )

    await dataManagerItem!.trigger('click')

    expect(wrapper.emitted('open-data-manager')).toHaveLength(1)
    expect(wrapper.emitted('open-templates')).toBeUndefined()
  })

  it('emits each management entry from the more-tools menu', async () => {
    const wrapper = mount(AppHeaderActions, {
      props: {
        appVersion: 'v2.7.0',
      },
      global: {
        mocks: { $t: translate },
        stubs: baseStubs,
      },
    })

    const menu = wrapper.find('[data-testid="header-modal-actions"]')
    const entries: Array<[string, string]> = [
      ['more-tools-templates', 'open-templates'],
      ['more-tools-history', 'open-history'],
      ['more-tools-model-manager', 'open-model-manager'],
      ['more-tools-variables', 'open-variables'],
    ]

    for (const [testId, event] of entries) {
      const item = menu.find(`[data-testid="${testId}"]`)
      expect(item.exists()).toBe(true)
      await item.trigger('click')
      expect(wrapper.emitted(event)).toHaveLength(1)
    }
  })
})
