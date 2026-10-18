import { beforeEach, describe, expect, it, vi } from 'vitest'
import { VolcengineArkAdapter } from '../../../src/services/llm/adapters/volcengine-ark-adapter'
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

describe('VolcengineArkAdapter', () => {
  let adapter: VolcengineArkAdapter
  let config: TextModelConfig

  const messages: Message[] = [{ role: 'user', content: 'Hello' }]

  beforeEach(() => {
    adapter = new VolcengineArkAdapter()
    const provider = adapter.getProvider()
    const model = adapter.getModels()[0]

    config = {
      id: 'volcengine-ark',
      name: 'Volcengine Ark',
      enabled: true,
      providerMeta: provider,
      modelMeta: model,
      connectionConfig: {
        apiKey: 'test-ark-key',
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
      }
    }
  })

  it('exposes Volcengine Ark provider metadata', () => {
    const provider = adapter.getProvider()

    expect(provider.id).toBe('volcengine-ark')
    expect(provider.defaultBaseURL).toBe('https://ark.cn-beijing.volces.com/api/v3')
    expect(provider.requiresApiKey).toBe(true)
    expect(provider.supportsDynamicModels).toBe(false)
  })

  it('lists the static Doubao model', () => {
    expect(adapter.getModels().map((model) => model.id)).toEqual([
      'doubao-seed-2-1-pro-260915'
    ])
  })

  it('sends chat requests through the Ark v3 endpoint', async () => {
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
        model: 'doubao-seed-2-1-pro-260915',
        messages: [{ role: 'user', content: 'Hello' }]
      })
    )
  })
})
