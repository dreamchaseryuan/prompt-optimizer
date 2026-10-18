import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SparkAdapter } from '../../../src/services/llm/adapters/spark-adapter'
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

describe('SparkAdapter', () => {
  let adapter: SparkAdapter
  let config: TextModelConfig

  const messages: Message[] = [{ role: 'user', content: 'Hello' }]

  beforeEach(() => {
    adapter = new SparkAdapter()
    const provider = adapter.getProvider()
    const model = adapter.getModels()[0]

    config = {
      id: 'spark',
      name: 'iFlytek Spark',
      enabled: true,
      providerMeta: provider,
      modelMeta: model,
      connectionConfig: {
        apiKey: 'test-spark-key',
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

  it('exposes iFlytek Spark provider metadata', () => {
    const provider = adapter.getProvider()

    expect(provider.id).toBe('spark')
    expect(provider.defaultBaseURL).toBe('https://spark-api-open.xf-yun.com/v1')
    expect(provider.requiresApiKey).toBe(true)
    expect(provider.supportsDynamicModels).toBe(false)
  })

  it('lists the static Spark models', () => {
    expect(adapter.getModels().map((model) => model.id)).toEqual([
      'generalv3.5',
      '4.0Ultra',
      'lite'
    ])
  })

  it('sends chat requests through the Spark OpenAI-compatible endpoint', async () => {
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
        model: 'generalv3.5',
        messages: [{ role: 'user', content: 'Hello' }]
      })
    )
  })
})
