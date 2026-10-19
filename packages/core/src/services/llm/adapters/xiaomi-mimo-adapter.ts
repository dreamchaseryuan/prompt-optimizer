import type {
  TextModel,
  TextProvider
} from '../types'
import { OpenAIAdapter } from './openai-adapter'

interface ModelOverride {
  id: string
  name: string
  description: string
  capabilities?: Partial<TextModel['capabilities']>
}

const XIAOMI_MIMO_STATIC_MODELS: ModelOverride[] = [
  {
    id: 'mimo-v2.6-pro',
    name: 'MiMo-V2.6-Pro',
    description: 'Xiaomi MiMo flagship trillion-parameter reasoning model with full-modality support for complex projects and long-horizon tasks',
    capabilities: {
      supportsTools: true,
      supportsReasoning: true,
      maxContextLength: 1000000
    }
  },
  {
    id: 'mimo-v2.6-pro-ultraspeed',
    name: 'MiMo-V2.6-Pro Ultraspeed',
    description: 'MiMo-V2.6-Pro performance with up to 20x faster output for latency-sensitive production scenarios',
    capabilities: {
      supportsTools: true,
      supportsReasoning: true,
      maxContextLength: 1000000
    }
  },
  {
    id: 'mimo-v2.6-flash',
    name: 'MiMo-V2.6-Flash',
    description: 'Cost-efficient high-intelligence reasoning model balancing performance, speed, and cost for high-frequency workloads',
    capabilities: {
      supportsTools: true,
      supportsReasoning: true
    }
  }
]

export class XiaomiMimoAdapter extends OpenAIAdapter {
  public getProvider(): TextProvider {
    return {
      id: 'xiaomi-mimo',
      name: 'Xiaomi MiMo',
      description: 'Xiaomi MiMo pay-as-you-go models via OpenAI-compatible API',
      requiresApiKey: true,
      defaultBaseURL: 'https://api.xiaomimimo.com/v1',
      supportsDynamicModels: true,
      apiKeyUrl: 'https://platform.xiaomimimo.com',
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
    return XIAOMI_MIMO_STATIC_MODELS.map((definition) => {
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

  protected getRequestStyle(): 'chat_completions' {
    return 'chat_completions'
  }
}
