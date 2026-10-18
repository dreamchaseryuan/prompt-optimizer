import { beforeEach, describe, expect, it, vi } from 'vitest'
import { HunyuanAdapter } from '../../../src/services/llm/adapters/hunyuan-adapter'
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

describe('HunyuanAdapter', () => {
  let adapter: HunyuanAdapter
  let config: TextModelConfig

  const messages: Message[] = [{ role: 'user', content: 'Hello' }]

  beforeEach(() => {
    adapter = new HunyuanAdapter()
    const provider = adapter.getProvider()
    const model = adapter.getModels()[0]

    config = {
      id: 'hunyuan',
      name: 'Tencent Hunyuan',
      enabled: true,
      providerMeta: provider,
      modelMeta: model,
      connectionConfig: {
        apiKey: 'test-hunyuan-key',
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

  it('exposes Tencent Hunyuan provider metadata', () => {
    const provider = adapter.getProvider()

    expect(provider.id).toBe('hunyuan')
    expect(provider.defaultBaseURL).toBe('https://api.hunyuan.cloud.tencent.com/v1')
    expect(provider.requiresApiKey).toBe(true)
    expect(provider.supportsDynamicModels).toBe(false)
  })

  it('lists the static Hunyuan models', () => {
    expect(adapter.getModels().map((model) => model.id)).toEqual([
      'hunyuan-turbos-latest',
      'hunyuan-turbo'
    ])
  })

  it('sends chat requests through the Hunyuan OpenAI-compatible endpoint', async () => {
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
        model: 'hunyuan-turbos-latest',
        messages: [{ role: 'user', content: 'Hello' }]
      })
    )
  })
})
