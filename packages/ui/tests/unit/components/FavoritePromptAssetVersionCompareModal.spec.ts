import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

import type { PromptAsset, PromptContentVersion } from '@prompt-optimizer/core'

import FavoritePromptAssetVersionCompareModal from '../../../src/components/favorites/FavoritePromptAssetVersionCompareModal.vue'

vi.mock('vue-i18n', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-i18n')>()
  return {
    ...actual,
    useI18n: () => ({
      t: (key: string, params?: Record<string, unknown>) => {
        const messages: Record<string, string> = {
          'favorites.version.compare': 'Compare',
          'favorites.version.compareTitle': 'Compare versions',
          'favorites.version.compareLeft': 'Baseline (left)',
          'favorites.version.compareRight': 'Target (right)',
          'favorites.version.compareNoDiff': 'The two versions are identical',
          'favorites.version.compareClose': 'Close',
          'favorites.version.itemLabel': `v${params?.version ?? ''}`,
        }
        return messages[key] ?? key
      },
    }),
  }
})

const naiveStubs = {
  NModal: { template: '<div v-if="show"><slot /></div>', props: ['show'] },
  NCard: { template: '<div><slot name="header-extra" /><slot /><slot name="footer" /></div>' },
  NSelect: { template: '<select />', props: ['value', 'options'] },
  NTag: { template: '<span><slot /></span>' },
  NText: { template: '<span><slot /></span>' },
  NEmpty: { template: '<div class="stub-empty" />', props: ['description'] },
  NButton: { template: '<button><slot /></button>' },
}

const makeVersion = (
  id: string,
  version: number,
  text: string,
  createdAt: number,
): PromptContentVersion =>
  ({
    id,
    version,
    createdAt,
    content: { kind: 'text', text },
  }) as unknown as PromptContentVersion

const makeAsset = (versions: PromptContentVersion[], currentVersionId: string): PromptAsset =>
  ({
    currentVersionId,
    versions,
  }) as unknown as PromptAsset

const mountModal = (asset: PromptAsset, initialLeftVersionId?: string) =>
  mount(FavoritePromptAssetVersionCompareModal, {
    props: {
      show: true,
      promptAsset: asset,
      initialLeftVersionId,
    },
    global: {
      stubs: naiveStubs,
    },
  })

describe('FavoritePromptAssetVersionCompareModal', () => {
  it('renders added and removed lines with stats', () => {
    const versions = [
      makeVersion('v1', 1, 'line one\nold value\nline three', 1),
      makeVersion('v2', 2, 'line one\nnew value\nline three', 2),
    ]
    const wrapper = mountModal(makeAsset(versions, 'v2'), 'v1')

    const removed = wrapper.findAll('[data-line-type="remove"]')
    const added = wrapper.findAll('[data-line-type="add"]')
    expect(removed).toHaveLength(1)
    expect(added).toHaveLength(1)
    expect(removed[0].text()).toContain('old value')
    expect(added[0].text()).toContain('new value')
    expect(wrapper.get('[data-testid="favorite-prompt-asset-version-compare-stats"]').text()).toContain('+1')
    expect(wrapper.get('[data-testid="favorite-prompt-asset-version-compare-stats"]').text()).toContain('-1')
  })

  it('shows the empty state when versions are identical', () => {
    const versions = [
      makeVersion('v1', 1, 'same content', 1),
      makeVersion('v2', 2, 'same content', 2),
    ]
    const wrapper = mountModal(makeAsset(versions, 'v2'), 'v1')

    expect(wrapper.find('[data-testid="favorite-prompt-asset-version-compare-diff"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="favorite-prompt-asset-version-compare-empty"]').exists()).toBe(true)
  })

  it('defaults to the newest non-current version against the current one', () => {
    const versions = [
      makeVersion('v1', 1, 'first draft', 1),
      makeVersion('v2', 2, 'second draft', 2),
      makeVersion('v3', 3, 'current draft', 3),
    ]
    const wrapper = mountModal(makeAsset(versions, 'v3'))

    const diff = wrapper.get('[data-testid="favorite-prompt-asset-version-compare-diff"]')
    expect(diff.text()).toContain('current draft')
    expect(diff.text()).toContain('second draft')
  })
})
