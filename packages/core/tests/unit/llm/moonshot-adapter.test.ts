import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MoonshotAdapter } from '../../../src/services/llm/adapters/moonshot-adapter'
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

describe('MoonshotAdapter', () => {
  let adapter: MoonshotAdapter
  let config: TextModelConfig

  const messages: Message[] = [{ role: 'user', content: 'Hello' }]

  beforeEach(() => {
    adapter = new MoonshotAdapter()
    const provider = adapter.getProvider()
    const model = adapter.getModels()[0]

    config = {
      id: 'moonshot',
      name: 'Moonshot AI',
      enabled: true,
      providerMeta: provider,
      modelMeta: model,
      connectionConfig: {
        apiKey: 'test-moonshot-key',
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

  it('exposes Moonshot provider metadata', () => {
    const provider = adapter.getProvider()

    expect(provider.id).toBe('moonshot')
    expect(provider.defaultBaseURL).toBe('https://api.moonshot.cn/v1')
    expect(provider.requiresApiKey).toBe(true)
    expect(provider.supportsDynamicModels).toBe(true)
  })

  it('lists the static Kimi models', () => {
    expect(adapter.getModels().map((model) => model.id)).toEqual([
      'kimi-k3',
      'kimi-k2.7-code',
      'kimi-k2.7-code-highspeed',
      'kimi-k2.6'
    ])
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
        model: 'kimi-k3',
        messages: [{ role: 'user', content: 'Hello' }]
      })
    )
  })

  it('builds dynamic models from the models endpoint', async () => {
    mockOpenAIInstance.models.list.mockResolvedValue({
      data: [
        { id: 'kimi-k3', object: 'model', owned_by: 'moonshot' },
        { id: 'kimi-k2.6', object: 'model', owned_by: 'moonshot' }
      ]
    })

    const models = await adapter.getModelsAsync(config)

    expect(models.map((model) => model.id)).toEqual(['kimi-k2.6', 'kimi-k3'])
  })
})
