import { beforeEach, describe, expect, it, vi } from 'vitest'
import { XiaomiMimoAdapter } from '../../../src/services/llm/adapters/xiaomi-mimo-adapter'
import type { Message, TextModelConfig } from '../../../src/services/llm/types'

let mockOpenAIInstance: any

vi.mock('openai', () => {
  return {
    default: class MockOpenAI {
      constructor() {
        return mockOpenAIInstance
      }
    }
  }
})

describe('XiaomiMimoAdapter', () => {
  let adapter: XiaomiMimoAdapter
  let config: TextModelConfig

  const messages: Message[] = [{ role: 'user', content: 'Hello' }]

  beforeEach(() => {
    adapter = new XiaomiMimoAdapter()
    const provider = adapter.getProvider()
    const model = adapter.getModels()[0]

    config = {
      id: 'xiaomi-mimo',
      name: 'Xiaomi MiMo',
      enabled: true,
      providerMeta: provider,
      modelMeta: model,
      connectionConfig: {
        apiKey: 'test-mimo-key',
        baseURL: provider.defaultBaseURL
      },
      paramOverrides: {
        ...(model.defaultParameterValues || {})
      }
    }

    mockOpenAIInstance = {
      chat: {
        completions: {
          create: vi.fn()
        }
      },
      models: {
        list: vi.fn()
      }
    }
  })

  it('exposes Xiaomi MiMo provider metadata', () => {
    const provider = adapter.getProvider()

    expect(provider.id).toBe('xiaomi-mimo')
    expect(provider.defaultBaseURL).toBe('https://api.xiaomimimo.com/v1')
    expect(provider.requiresApiKey).toBe(true)
    expect(provider.supportsDynamicModels).toBe(true)
  })

  it('lists the static MiMo v2.6 models', () => {
    expect(adapter.getModels().map((model) => model.id)).toEqual([
      'mimo-v2.6-pro',
      'mimo-v2.6-pro-ultraspeed',
      'mimo-v2.6-flash'
    ])
    expect(adapter.getModels()[0].capabilities.maxContextLength).toBe(1000000)
  })

  it('sends chat requests through the OpenAI-compatible endpoint', async () => {
    mockOpenAIInstance.chat.completions.create.mockResolvedValue({
      choices: [
        {
          message: { content: 'ok' },
          finish_reason: 'stop'
        }
      ]
    })

    await adapter.sendMessage(messages, config)

    expect(mockOpenAIInstance.chat.completions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'mimo-v2.6-pro',
        messages: [{ role: 'user', content: 'Hello' }]
      })
    )
  })

  it('builds dynamic models from the models endpoint', async () => {
    mockOpenAIInstance.models.list.mockResolvedValue({
      data: [
        { id: 'mimo-v2.6-pro', object: 'model', owned_by: 'xiaomi' },
        { id: 'mimo-v2.6-flash', object: 'model', owned_by: 'xiaomi' }
      ]
    })

    const models = await adapter.getModelsAsync(config)

    expect(models.map((model) => model.id)).toEqual(['mimo-v2.6-flash', 'mimo-v2.6-pro'])
  })
})
