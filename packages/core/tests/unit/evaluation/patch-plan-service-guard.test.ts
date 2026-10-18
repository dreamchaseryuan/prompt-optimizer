import { describe, expect, it } from 'vitest'

import { EvaluationService } from '../../../src/services/evaluation/service'
import type {
  PromptOnlyEvaluationRequest,
  ResultEvaluationRequest,
} from '../../../src/services/evaluation/types'
import type {
  ILLMService,
  LLMResponse,
  Message,
  ModelOption,
  StreamHandlers,
  ToolDefinition,
} from '../../../src/services/llm/types'
import type { IModelManager, TextModelConfig } from '../../../src/services/model/types'
import { TemplateManager } from '../../../src/services/template/manager'
import { MemoryStorageProvider } from '../../../src/services/storage/memoryStorageProvider'
import type {
  BuiltinTemplateLanguage,
  ITemplateLanguageService,
} from '../../../src/services/template/languageService'
import { applyPatchOperationsToText } from '../../../src/utils/patch-plan'

/**
 * patchPlan 空匹配守卫（服务层走查）：
 * - LLM 返回的 patchPlan 中 oldText 无法在当前工作区提示词中精确匹配时，
 *   应用补丁必须返回 skipped 且不改动原文（utils/patch-plan 守卫）
 * - 可精确匹配的 oldText 正常应用
 */

class StubTemplateLanguageService implements ITemplateLanguageService {
  private lang: BuiltinTemplateLanguage

  constructor(lang: BuiltinTemplateLanguage) {
    this.lang = lang
  }

  async initialize() {}
  async getCurrentLanguage() {
    return this.lang
  }
  async setLanguage(language: BuiltinTemplateLanguage) {
    this.lang = language
  }
  async toggleLanguage() {
    this.lang = this.lang === 'zh-CN' ? 'en-US' : 'zh-CN'
    return this.lang
  }
  async isValidLanguage(language: string) {
    return language === 'zh-CN' || language === 'en-US'
  }
  async getSupportedLanguages() {
    return ['zh-CN', 'en-US'] as BuiltinTemplateLanguage[]
  }
  getLanguageDisplayName(language: BuiltinTemplateLanguage) {
    return language
  }
  isInitialized() {
    return true
  }
}

class StubModelManager implements IModelManager {
  constructor(private models: Record<string, TextModelConfig>) {}

  async ensureInitialized(): Promise<void> {}
  async isInitialized(): Promise<boolean> {
    return true
  }
  async getAllModels(): Promise<TextModelConfig[]> {
    return Object.values(this.models)
  }
  async getModel(key: string): Promise<TextModelConfig | undefined> {
    return this.models[key]
  }
  async addModel(key: string, config: TextModelConfig): Promise<void> {
    this.models[key] = config
  }
  async updateModel(key: string, config: Partial<TextModelConfig>): Promise<void> {
    const current = this.models[key]
    if (!current) return
    this.models[key] = { ...current, ...config }
  }
  async deleteModel(key: string): Promise<void> {
    delete this.models[key]
  }
  async enableModel(key: string): Promise<void> {
    const current = this.models[key]
    if (current) {
      this.models[key] = { ...current, enabled: true }
    }
  }
  async disableModel(key: string): Promise<void> {
    const current = this.models[key]
    if (current) {
      this.models[key] = { ...current, enabled: false }
    }
  }
  async getEnabledModels(): Promise<TextModelConfig[]> {
    return Object.values(this.models).filter((m) => m.enabled)
  }
  async exportData(): Promise<any> {
    return []
  }
  async importData(_data: any): Promise<void> {}
  async getDataType(): Promise<string> {
    return 'models'
  }
  async validateData(_data: any): Promise<boolean> {
    return true
  }
}

const WORKSPACE_PROMPT = '你是写作助手。请保留 {{style}} 占位符，并用中文回答。'
const MATCHING_OLD_TEXT = '请保留 {{style}} 占位符'
const UNMATCHED_OLD_TEXT = '这句话并不存在于当前工作区提示词中'

class PatchPlanLLM implements ILLMService {
  public lastMessages: Message[] = []

  async sendMessage(messages: Message[], _provider: string): Promise<string> {
    this.lastMessages = messages
    return JSON.stringify({
      score: {
        overall: 75,
        dimensions: [{ key: 'overall', label: 'Overall', score: 75 }],
      },
      improvements: ['收紧输出约束'],
      patchPlan: [
        {
          op: 'replace',
          oldText: MATCHING_OLD_TEXT,
          newText: '必须逐字保留 {{style}} 占位符',
          instruction: '强化占位符保留要求',
        },
        {
          op: 'replace',
          oldText: UNMATCHED_OLD_TEXT,
          newText: '不应生效的内容',
          instruction: '模型杜撰的片段，必须被空匹配守卫拦截',
        },
      ],
      summary: 'ok',
    })
  }

  async sendMessageStructured(messages: Message[], provider: string): Promise<LLMResponse> {
    return { content: await this.sendMessage(messages, provider) }
  }

  async sendMessageStream(
    _messages: Message[],
    _provider: string,
    callbacks: StreamHandlers
  ): Promise<void> {
    callbacks.onError(new Error('PatchPlanLLM.sendMessageStream is not used in this test'))
  }

  async sendMessageStreamWithTools(
    _messages: Message[],
    _provider: string,
    _tools: ToolDefinition[],
    callbacks: StreamHandlers
  ): Promise<void> {
    callbacks.onError(new Error('PatchPlanLLM.sendMessageStreamWithTools is not used in this test'))
  }

  async testConnection(_provider: string): Promise<void> {
    throw new Error('PatchPlanLLM.testConnection is not used in this test')
  }

  async fetchModelList(_provider: string, _customConfig?: any): Promise<ModelOption[]> {
    return []
  }
}

class DegradedParseLLM implements ILLMService {
  async sendMessage(_messages: Message[], _provider: string): Promise<string> {
    return '综合评分：85\n整体结构尚可，但约束仍可更明确。'
  }

  async sendMessageStructured(messages: Message[], provider: string): Promise<LLMResponse> {
    return { content: await this.sendMessage(messages, provider) }
  }

  async sendMessageStream(
    _messages: Message[],
    _provider: string,
    callbacks: StreamHandlers
  ): Promise<void> {
    callbacks.onError(new Error('DegradedParseLLM.sendMessageStream is not used in this test'))
  }

  async sendMessageStreamWithTools(
    _messages: Message[],
    _provider: string,
    _tools: ToolDefinition[],
    callbacks: StreamHandlers
  ): Promise<void> {
    callbacks.onError(new Error('DegradedParseLLM.sendMessageStreamWithTools is not used in this test'))
  }

  async testConnection(_provider: string): Promise<void> {
    throw new Error('DegradedParseLLM.testConnection is not used in this test')
  }

  async fetchModelList(_provider: string, _customConfig?: any): Promise<ModelOption[]> {
    return []
  }
}

const createService = (llmInstance: ILLMService = new PatchPlanLLM()) => {
  const modelKey = 'test-model'
  const templateManager = new TemplateManager(
    new MemoryStorageProvider(),
    new StubTemplateLanguageService('zh-CN')
  )
  const modelManager = new StubModelManager({
    [modelKey]: {
      id: modelKey,
      name: 'Test Model',
      enabled: true,
      providerMeta: {
        id: 'test',
        name: 'Test',
        requiresApiKey: false,
        defaultBaseURL: 'https://example.com',
        supportsDynamicModels: false,
      },
      modelMeta: {
        id: modelKey,
        name: 'Test Model',
        providerId: 'test',
        capabilities: { supportsTools: false },
        parameterDefinitions: [],
      },
      connectionConfig: {},
      paramOverrides: {},
    },
  })
  const llm = llmInstance

  return {
    llm,
    modelKey,
    service: new EvaluationService(llm, modelManager, templateManager),
  }
}

describe('patchPlan empty-match guard through the evaluation service', () => {
  it('keeps normalized patchPlan ops and the apply-time guard skips unmatched oldText', async () => {
    const { modelKey, service } = createService()

    const request: ResultEvaluationRequest = {
      type: 'result',
      evaluationModelKey: modelKey,
      mode: { functionMode: 'basic', subMode: 'system' },
      target: {
        workspacePrompt: WORKSPACE_PROMPT,
      },
      testCase: {
        id: 'tc-patch-1',
        label: '补丁守卫用例',
        input: {
          kind: 'text',
          label: '测试输入',
          content: '写一篇短文',
        },
      },
      snapshot: {
        id: 'snap-patch-1',
        label: 'A',
        testCaseId: 'tc-patch-1',
        promptRef: { kind: 'workspace' },
        promptText: WORKSPACE_PROMPT,
        output: '这是一段执行输出。',
      },
    }

    const result = await service.evaluate(request)

    // 服务层 normalize 后 patchPlan 保留两条（上限 3 条内）
    expect(result.patchPlan).toHaveLength(2)
    expect(result.patchPlan[0].oldText).toBe(MATCHING_OLD_TEXT)
    expect(result.patchPlan[1].oldText).toBe(UNMATCHED_OLD_TEXT)

    // 空匹配守卫：可精确匹配的 oldText 正常应用
    const applied = applyPatchOperationsToText(WORKSPACE_PROMPT, result.patchPlan[0])
    expect(applied.ok).toBe(true)
    expect(applied.report.status).toBe('applied')
    expect(applied.text).toContain('必须逐字保留 {{style}} 占位符')
    expect(applied.text).toContain('并用中文回答。')

    // 杜撰的 oldText 无法精确匹配：skipped 且原文不变
    const skipped = applyPatchOperationsToText(WORKSPACE_PROMPT, result.patchPlan[1])
    expect(skipped.ok).toBe(false)
    expect(skipped.report.status).toBe('skipped')
    expect(skipped.text).toBe(WORKSPACE_PROMPT)
  })
})

describe('degraded parse marker', () => {
  it('marks metadata.degradedParse when JSON parsing falls back to text parsing', async () => {
    const { modelKey, service } = createService(new DegradedParseLLM())

    const request: PromptOnlyEvaluationRequest = {
      type: 'prompt-only',
      evaluationModelKey: modelKey,
      mode: { functionMode: 'basic', subMode: 'system' },
      target: {
        workspacePrompt: WORKSPACE_PROMPT,
      },
    }

    const result = await service.evaluate(request)

    expect(result.metadata?.degradedParse).toBe(true)
    expect(result.score.overall).toBe(85)
  })
})
