import type { TextModel, TextProvider } from '../types'
import { OpenAIAdapter } from './openai-adapter'

interface ModelOverride {
  id: string
  name: string
  description: string
  capabilities?: Partial<TextModel['capabilities']>
}

const MOONSHOT_STATIC_MODELS: ModelOverride[] = [
  {
    id: 'kimi-k3',
    name: 'Kimi K3',
    description: 'Moonshot flagship model with 1M-token context for long-horizon coding, knowledge work, and deep reasoning',
    capabilities: {
      supportsTools: true,
      supportsReasoning: true,
      maxContextLength: 1000000
    }
  },
  {
    id: 'kimi-k2.7-code',
    name: 'Kimi K2.7 Code',
    description: 'Coding-focused model with 256K context, reliable long-context instruction following',
    capabilities: {
      supportsTools: true,
      supportsReasoning: true,
      maxContextLength: 262144
    }
  },
  {
    id: 'kimi-k2.7-code-highspeed',
    name: 'Kimi K2.7 Code Highspeed',
    description: 'High-speed variant of K2.7 Code for code generation and programming agents',
    capabilities: {
      supportsTools: true,
      supportsReasoning: true,
      maxContextLength: 262144
    }
  },
  {
    id: 'kimi-k2.6',
    name: 'Kimi K2.6',
    description: 'General-purpose model with 256K context, vision input, and toggleable thinking mode',
    capabilities: {
      supportsTools: true,
      supportsReasoning: true,
      maxContextLength: 262144
    }
  }
]

export class MoonshotAdapter extends OpenAIAdapter {
  public getProvider(): TextProvider {
    return {
      id: 'moonshot',
      name: 'Moonshot AI (Kimi)',
      description: 'Moonshot Kimi OpenAI-compatible models',
      requiresApiKey: true,
      defaultBaseURL: 'https://api.moonshot.cn/v1',
      supportsDynamicModels: true,
      apiKeyUrl: 'https://platform.moonshot.cn/console/api-keys',
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
    return MOONSHOT_STATIC_MODELS.map((definition) => {
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
