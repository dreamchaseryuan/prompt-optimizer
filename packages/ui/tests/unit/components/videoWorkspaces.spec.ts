import { describe, expect, it, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import { setActivePinia } from 'pinia'
import type { AppServices } from '../../../src/types/services'

import { pinia, setPiniaServices } from '../../../src/plugins/pinia'
import { allowConsole } from '../../utils/error-detection'
import { useVideoText2VideoSession } from '../../../src/stores/session/useVideoText2VideoSession'
import { useVideoImage2VideoSession } from '../../../src/stores/session/useVideoImage2VideoSession'
import VideoText2VideoWorkspace from '../../../src/components/video-mode/VideoText2VideoWorkspace.vue'
import VideoImage2VideoWorkspace from '../../../src/components/video-mode/VideoImage2VideoWorkspace.vue'

const toast = {
  success: vi.fn(),
  error: vi.fn(),
  warning: vi.fn(),
  info: vi.fn(),
}

vi.mock('../../../src/composables/ui/useToast', () => ({
  useToast: () => toast,
}))

vi.mock('vue-i18n', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-i18n')>()
  return {
    ...actual,
    useI18n: () => ({
      t: (key: string, params?: Record<string, unknown>) =>
        params && 'count' in params ? `${key}:${params.count}` : key,
    }),
  }
})

// 组件链（useTestVariableManager 等）依赖 naive-ui 的 provider 注入；
// 单测环境没有 NMessageProvider，这里给出空实现
vi.mock('naive-ui', async (importOriginal) => {
  const actual = await importOriginal<typeof import('naive-ui')>()
  const noopMessage = () => ({
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    loading: vi.fn(),
  })
  return {
    ...actual,
    useMessage: noopMessage,
    useDialog: () => ({ warning: vi.fn(), error: vi.fn(), success: vi.fn(), info: vi.fn() }),
    useNotification: () => ({ success: vi.fn(), error: vi.fn(), warning: vi.fn(), info: vi.fn() }),
  }
})

// ---- 重子组件 stubs ----

const promptPanelCaptured: Array<Record<string, unknown>> = []

const PromptPanelStub = defineComponent({
  name: 'PromptPanelUI',
  props: {
    testId: { type: String, default: '' },
    optimizedPrompt: { type: String, default: '' },
    originalPrompt: { type: String, default: '' },
    reasoning: { type: String, default: '' },
    isOptimizing: { type: Boolean, default: false },
    isIterating: { type: Boolean, default: false },
    selectedIterateTemplate: { type: Object, default: null },
    versions: { type: Array, default: () => [] },
    currentVersionId: { type: String, default: '' },
    optimizationMode: { type: String, default: 'user' },
    advancedModeEnabled: { type: Boolean, default: false },
    showPreview: { type: Boolean, default: false },
    iterateTemplateType: { type: String, default: '' },
  },
  emits: [
    'iterate',
    'openTemplateManager',
    'switchVersion',
    'save-favorite',
    'save-local-edit',
    'apply-patch',
    'open-preview',
  ],
  setup(props) {
    promptPanelCaptured.push({ ...props })
    return () => h('div', { 'data-testid': `prompt-panel-${props.testId}` })
  },
})

const ReferenceImageUploaderStub = defineComponent({
  name: 'ReferenceImageUploader',
  props: {
    modelValue: { type: Object, default: null },
    disabled: { type: Boolean, default: false },
  },
  emits: ['update:modelValue', 'change', 'error'],
  setup(props, { attrs }) {
    return () =>
      h('div', {
        ...attrs,
        'data-has-image': props.modelValue ? 'true' : 'false',
      })
  },
})

const simplePassthrough = (name: string, tag = 'div') =>
  defineComponent({
    name,
    setup(_, { slots, attrs }) {
      return () => h(tag, attrs, slots.default?.())
    },
  })

const mountOptions = (services: AppServices | null) => ({
  props: {},
  global: {
    plugins: [pinia],
    provide: {
      services: ref(services),
    },
    stubs: {
      // NButton 渲染为可点击的透传节点：jsdom 下 disabled 原生按钮会吞掉 click，
      // 单测需要让 @click 处理器可被触发（disabled 拦截由 handler 内部逻辑覆盖）
      NButton: simplePassthrough('NButton', 'div'),
      NFlex: true,
      NGrid: true,
      NGridItem: true,
      NIcon: true,
      NInput: true,
      NSpace: true,
      NText: true,
      PromptPanelUI: PromptPanelStub,
      ReferenceImageUploader: ReferenceImageUploaderStub,
      WorkspaceUtilityMenu: simplePassthrough('WorkspaceUtilityMenu'),
      TestSourceLinkedCard: simplePassthrough('TestSourceLinkedCard'),
      SelectWithConfig: simplePassthrough('SelectWithConfig'),
      TextModelQuickSwitch: simplePassthrough('TextModelQuickSwitch'),
      FullscreenDialog: simplePassthrough('FullscreenDialog'),
      PromptPreviewPanel: simplePassthrough('PromptPreviewPanel'),
      TemporaryVariablesPanel: simplePassthrough('TemporaryVariablesPanel'),
      VariableAwareInput: simplePassthrough('VariableAwareInput', 'textarea'),
    },
  },
})

const findOptimizeButton = (wrapper: ReturnType<typeof mount>, testId: string) =>
  wrapper.find(`[data-testid="${testId}"]`)

const createPreferenceServiceMock = () => ({
  get: vi.fn().mockResolvedValue(null),
  set: vi.fn().mockResolvedValue(undefined),
  delete: vi.fn().mockResolvedValue(undefined),
})

const createImageStorageServiceMock = () => ({
  getMetadata: vi.fn().mockResolvedValue(null),
  getImage: vi.fn().mockResolvedValue(null),
  saveImage: vi.fn().mockResolvedValue(undefined),
  deleteImages: vi.fn().mockResolvedValue(undefined),
  listAllMetadata: vi.fn().mockResolvedValue([]),
})

// pinia 为全局单例，测试间必须重置会话状态并注入 preferenceService mock，
// 避免 updateTextModel/updateTemplate 触发 saveSession 时产生无服务报错
const resetVideoSessions = () => {
  setActivePinia(pinia)
  setPiniaServices({
    preferenceService: createPreferenceServiceMock(),
    imageStorageService: createImageStorageServiceMock(),
  } as unknown as AppServices)
  useVideoText2VideoSession().reset()
  useVideoImage2VideoSession().reset()
}

describe('VideoText2VideoWorkspace', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    promptPanelCaptured.length = 0
    resetVideoSessions()
    // useTemporaryVariables → useSessionManager 在测试环境无 readers 注入，告警可忽略
    allowConsole(/\[SessionManager\]/)
  })

  it('renders input and optimize button', async () => {
    const wrapper = mount(VideoText2VideoWorkspace, mountOptions(null))
    await flushPromises()

    expect(wrapper.find('[data-testid="video-text2video-input"]').exists()).toBe(true)
    expect(findOptimizeButton(wrapper, 'video-text2video-optimize-button').exists()).toBe(true)
    expect(wrapper.find('[data-mode="video-text2video"]').exists()).toBe(true)
    wrapper.unmount()
  })

  it('blocks optimize without prompt service and does not call prompt service', async () => {
    const optimizeStream = vi.fn()
    const services = {
      historyManager: { createNewChain: vi.fn() },
      modelManager: {
        getEnabledModels: vi.fn().mockResolvedValue([
          { id: 'model-a', name: 'Model A', providerMeta: { id: 'p', name: 'Provider' } },
        ]),
      },
      templateManager: {
        listTemplatesByType: vi.fn().mockResolvedValue([
          { id: 'tpl-a', name: 'T', content: 'x', metadata: { templateType: 'text2videoOptimize' } },
        ]),
      },
    } as unknown as AppServices

    const wrapper = mount(VideoText2VideoWorkspace, mountOptions(services))
    await flushPromises()

    const session = useVideoText2VideoSession()
    session.updatePrompt('一只猫在草地上奔跑')
    await flushPromises()

    // 模板/模型由 composable 自动兜底选中，此时按钮可用但 promptService 缺失
    await findOptimizeButton(wrapper, 'video-text2video-optimize-button').trigger('click')
    await flushPromises()

    expect(toast.error).toHaveBeenCalledWith('toast.error.serviceInit')
    expect(optimizeStream).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('streams optimization and forwards templateType to PromptPanel', async () => {
    const optimizeStream = vi.fn(
      (_request: unknown, handlers: { onToken: (t: string) => void; onComplete: () => Promise<void> }) => {
        handlers.onToken('视频提示词')
        return Promise.resolve(handlers.onComplete())
      },
    )
    const createNewChain = vi.fn().mockResolvedValue({
      chainId: 'chain-1',
      versions: [{ id: 'v1', version: 1, optimizedPrompt: '视频提示词' }],
      currentRecord: { id: 'v1' },
    })

    const services = {
      preferenceService: createPreferenceServiceMock(),
      promptService: { optimizePromptStream: optimizeStream },
      historyManager: { createNewChain },
      modelManager: {
        getEnabledModels: vi.fn().mockResolvedValue([
          { id: 'model-a', name: 'Model A', providerMeta: { id: 'p', name: 'Provider' } },
        ]),
      },
      templateManager: {
        listTemplatesByType: vi.fn().mockResolvedValue([
          { id: 'tpl-a', name: 'T', content: 'x', metadata: { templateType: 'text2videoOptimize' } },
        ]),
      },
    } as unknown as AppServices

    const wrapper = mount(VideoText2VideoWorkspace, mountOptions(services))
    await flushPromises()

    const session = useVideoText2VideoSession()
    session.updatePrompt('一只猫在草地上奔跑')
    await flushPromises()

    // 模板/模型已由 composable 自动兜底（tpl-a / model-a），按钮可用
    expect(session.selectedTemplateId).toBe('tpl-a')
    expect(session.selectedTextModelKey).toBe('model-a')

    await findOptimizeButton(wrapper, 'video-text2video-optimize-button').trigger('click')
    await flushPromises()

    expect(optimizeStream).toHaveBeenCalledTimes(1)
    const [request] = optimizeStream.mock.calls[0]
    expect(request).toMatchObject({
      optimizationMode: 'user',
      targetPrompt: '一只猫在草地上奔跑',
      templateId: 'tpl-a',
      modelKey: 'model-a',
    })
    expect(request.inputImages).toBeUndefined()
    expect(session.optimizedPrompt).toBe('视频提示词')
    expect(session.chainId).toBe('chain-1')
    expect(createNewChain).toHaveBeenCalledTimes(1)
    expect(createNewChain.mock.calls[0][0]).toMatchObject({
      type: 'text2videoOptimize',
    })
    expect(createNewChain.mock.calls[0][0].metadata).toMatchObject({
      functionMode: 'video',
      videoSubMode: 'text2video',
    })

    // PromptPanel 收到视频 testId 与通用迭代模板类型（设计 Q1）
    const panel = promptPanelCaptured.find((p) => p.testId === 'video-text2video')
    expect(panel).toBeTruthy()
    expect(panel?.iterateTemplateType).toBe('iterate')
    wrapper.unmount()
  })

  it('restores from video-workspace-restore event', async () => {
    const wrapper = mount(VideoText2VideoWorkspace, mountOptions(null))
    await flushPromises()

    window.dispatchEvent(
      new CustomEvent('video-workspace-restore', {
        detail: {
          videoMode: 'text2video',
          originalPrompt: '原始描述',
          optimizedPrompt: '优化结果',
          chainId: 'chain-9',
          versions: [
            { id: 'v9', version: 1, originalPrompt: '原始描述', optimizedPrompt: '优化结果' },
          ],
          currentVersionId: 'v9',
        },
      }),
    )
    await nextTick()
    await flushPromises()

    const session = useVideoText2VideoSession()
    expect(session.originalPrompt).toBe('原始描述')
    expect(session.optimizedPrompt).toBe('优化结果')
    expect(session.chainId).toBe('chain-9')
    expect(session.versionId).toBe('v9')
    wrapper.unmount()
  })

  it('ignores restore events for other video sub modes', async () => {
    const wrapper = mount(VideoText2VideoWorkspace, mountOptions(null))
    await flushPromises()

    window.dispatchEvent(
      new CustomEvent('video-workspace-restore', {
        detail: {
          videoMode: 'image2video',
          originalPrompt: '不应回填',
          optimizedPrompt: '不应回填',
        },
      }),
    )
    await nextTick()

    const session = useVideoText2VideoSession()
    expect(session.originalPrompt).toBe('')
    wrapper.unmount()
  })
})

describe('VideoImage2VideoWorkspace', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    promptPanelCaptured.length = 0
    resetVideoSessions()
    allowConsole(/\[SessionManager\]/)
  })

  it('renders uploader and blocks optimize without first frame', async () => {
    const optimizeStream = vi.fn()
    const services = {
      promptService: { optimizePromptStream: optimizeStream },
      historyManager: { createNewChain: vi.fn() },
      modelManager: {
        getEnabledModels: vi.fn().mockResolvedValue([
          { id: 'model-b', name: 'Model B', providerMeta: { id: 'p', name: 'Provider' } },
        ]),
      },
      templateManager: {
        listTemplatesByType: vi.fn().mockResolvedValue([
          { id: 'tpl-b', name: 'T2', content: 'x', metadata: { templateType: 'image2videoOptimize' } },
        ]),
      },
    } as unknown as AppServices

    const wrapper = mount(VideoImage2VideoWorkspace, mountOptions(services))
    await flushPromises()

    expect(wrapper.find('[data-testid="video-image2video-uploader"]').exists()).toBe(true)

    const session = useVideoImage2VideoSession()
    session.updatePrompt('镜头缓缓推进')
    await flushPromises()

    // 模板/模型已兜底选中、按钮可用，但未上传首帧 → handler 拦截
    await findOptimizeButton(wrapper, 'video-image2video-optimize-button').trigger('click')
    await flushPromises()

    expect(toast.error).toHaveBeenCalledWith('videoMode.uploadRequired')
    expect(optimizeStream).not.toHaveBeenCalled()
    expect(session.inputImageB64).toBeNull()
    wrapper.unmount()
  })

  it('sends inputImages once a first frame is present', async () => {
    const optimizeStream = vi.fn(
      (_request: unknown, handlers: { onToken: (t: string) => void; onComplete: () => Promise<void> }) => {
        handlers.onToken('图生视频提示词')
        return Promise.resolve(handlers.onComplete())
      },
    )
    const createNewChain = vi.fn().mockResolvedValue({
      chainId: 'chain-2',
      versions: [],
      currentRecord: { id: 'v1' },
    })

    const services = {
      preferenceService: createPreferenceServiceMock(),
      promptService: { optimizePromptStream: optimizeStream },
      historyManager: { createNewChain },
      modelManager: { getEnabledModels: vi.fn().mockResolvedValue([]) },
      templateManager: {
        listTemplatesByType: vi.fn().mockResolvedValue([
          { id: 'tpl-b', name: 'T2', content: 'x', metadata: { templateType: 'image2videoOptimize' } },
        ]),
      },
      imageStorageService: {
        getMetadata: vi.fn().mockResolvedValue(null),
        saveImage: vi.fn().mockResolvedValue(undefined),
      },
    } as unknown as AppServices

    const wrapper = mount(VideoImage2VideoWorkspace, mountOptions(services))
    await flushPromises()

    const session = useVideoImage2VideoSession()
    session.updatePrompt('镜头缓缓推进')
    session.updateTextModel('model-b')
    session.updateInputImage('aGVsbG8=', 'image/png')
    session.updateTemplate('tpl-b')
    await flushPromises()

    expect(session.inputImageB64).toBe('aGVsbG8=')
    expect(session.inputImageMime).toBe('image/png')

    await findOptimizeButton(wrapper, 'video-image2video-optimize-button').trigger('click')
    await flushPromises()

    expect(optimizeStream).toHaveBeenCalledTimes(1)
    const [request] = optimizeStream.mock.calls[0]
    expect(request.inputImages).toEqual([{ b64: 'aGVsbG8=', mimeType: 'image/png' }])
    expect(session.optimizedPrompt).toBe('图生视频提示词')
    expect(createNewChain.mock.calls[0][0]).toMatchObject({
      type: 'image2videoOptimize',
    })
    expect(createNewChain.mock.calls[0][0].metadata).toMatchObject({
      functionMode: 'video',
      videoSubMode: 'image2video',
      hasInputImage: true,
    })

    const panel = promptPanelCaptured.find((p) => p.testId === 'video-image2video')
    expect(panel).toBeTruthy()
    expect(panel?.iterateTemplateType).toBe('iterate')
    wrapper.unmount()
  })

  it('restores from video-workspace-restore event for image2video only', async () => {
    const wrapper = mount(VideoImage2VideoWorkspace, mountOptions(null))
    await flushPromises()

    window.dispatchEvent(
      new CustomEvent('video-workspace-restore', {
        detail: {
          videoMode: 'text2video',
          originalPrompt: '不应回填到图生视频',
        },
      }),
    )
    await nextTick()

    const session = useVideoImage2VideoSession()
    expect(session.originalPrompt).toBe('')

    window.dispatchEvent(
      new CustomEvent('video-workspace-restore', {
        detail: {
          videoMode: 'image2video',
          originalPrompt: '图生视频描述',
          optimizedPrompt: '图生视频结果',
          chainId: 'chain-8',
          versions: [],
          currentVersionId: '',
        },
      }),
    )
    await nextTick()
    await flushPromises()

    expect(session.originalPrompt).toBe('图生视频描述')
    expect(session.optimizedPrompt).toBe('图生视频结果')
    expect(session.chainId).toBe('chain-8')
    wrapper.unmount()
  })
})
