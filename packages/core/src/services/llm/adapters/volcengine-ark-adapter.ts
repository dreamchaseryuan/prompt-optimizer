import type { TextModel, TextProvider } from '../types'
import { OpenAIAdapter } from './openai-adapter'

interface ModelOverride {
  id: string
  name: string
  description: string
  capabilities?: Partial<TextModel['capabilities']>
}

const ARK_STATIC_MODELS: ModelOverride[] = [
  {
    id: 'doubao-seed-2-1-pro-260915',
    name: 'Doubao Seed 2.1 Pro',
    description: 'Volcengine Ark flagship model. The model field also accepts a custom inference endpoint ID',
    capabilities: {
      supportsTools: true,
      supportsReasoning: true
    }
  }
]

export class VolcengineArkAdapter extends OpenAIAdapter {
  public getProvider(): TextProvider {
    return {
      id: 'volcengine-ark',
      name: 'Volcengine Ark (Doubao)',
      description: 'Volcengine Ark OpenAI-compatible models. Use a preset model ID or a custom endpoint ID as the model field',
      requiresApiKey: true,
      defaultBaseURL: 'https://ark.cn-beijing.volces.com/api/v3',
      supportsDynamicModels: false,
      apiKeyUrl: 'https://console.volcengine.com/ark',
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
    return ARK_STATIC_MODELS.map((definition) => {
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
