import type { TextModel, TextProvider } from '../types'
import { OpenAIAdapter } from './openai-adapter'

interface ModelOverride {
  id: string
  name: string
  description: string
  capabilities?: Partial<TextModel['capabilities']>
}

const HUNYUAN_STATIC_MODELS: ModelOverride[] = [
  {
    id: 'hunyuan-turbos-latest',
    name: 'Hunyuan TurboS Latest',
    description: 'Tencent Hunyuan TurboS, the recommended general-purpose model on the OpenAI-compatible endpoint',
    capabilities: {
      supportsTools: true,
      supportsReasoning: true,
      maxContextLength: 32768
    }
  },
  {
    id: 'hunyuan-turbo',
    name: 'Hunyuan Turbo',
    description: 'Tencent Hunyuan Turbo general-purpose model retained for compatibility',
    capabilities: {
      supportsTools: true,
      supportsReasoning: true,
      maxContextLength: 32768
    }
  }
]

export class HunyuanAdapter extends OpenAIAdapter {
  public getProvider(): TextProvider {
    return {
      id: 'hunyuan',
      name: 'Tencent Hunyuan',
      description: 'Tencent Hunyuan OpenAI-compatible models. New model capabilities are migrating to TokenHub',
      requiresApiKey: true,
      defaultBaseURL: 'https://api.hunyuan.cloud.tencent.com/v1',
      supportsDynamicModels: false,
      apiKeyUrl: 'https://console.cloud.tencent.com/hunyuan/api-key',
      connectionSchema: {
        required: ['apiKey'],
        optional: ['baseURL'],
        fieldTypes: {
          apiKey: 'string',
          baseURL: 'string'
        }
      }
    }
  }

  public getModels(): TextModel[] {
    return HUNYUAN_STATIC_MODELS.map((definition) => {
      const baseModel = this.buildDefaultModel(definition.id)

      return {
        ...baseModel,
        name: definition.name,
        description: definition.description,
        capabilities: {
          ...baseModel.capabilities,
          ...(definition.capabilities ?? {})
        }
      }
    })
  }
}
