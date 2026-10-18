import type { TextModel, TextProvider } from '../types'
import { OpenAIAdapter } from './openai-adapter'

interface ModelOverride {
  id: string
  name: string
  description: string
  capabilities?: Partial<TextModel['capabilities']>
}

const SPARK_STATIC_MODELS: ModelOverride[] = [
  {
    id: 'generalv3.5',
    name: 'Spark Pro (generalv3.5)',
    description: 'iFlytek Spark Pro model for general dialogue and question answering',
    capabilities: {
      supportsTools: true,
      supportsReasoning: true,
      maxContextLength: 8192
    }
  },
  {
    id: '4.0Ultra',
    name: 'Spark 4.0 Ultra',
    description: 'iFlytek Spark 4.0 Ultra flagship model for complex reasoning and structured extraction',
    capabilities: {
      supportsTools: true,
      supportsReasoning: true,
      maxContextLength: 32768
    }
  },
  {
    id: 'lite',
    name: 'Spark Lite',
    description: 'iFlytek Spark Lite lightweight model with a free tier',
    capabilities: {
      supportsTools: true,
      supportsReasoning: false,
      maxContextLength: 8192
    }
  }
]

export class SparkAdapter extends OpenAIAdapter {
  public getProvider(): TextProvider {
    return {
      id: 'spark',
      name: 'iFlytek Spark',
      description: 'iFlytek Spark OpenAI-compatible models. X1 reasoning models require the v2 base URL',
      requiresApiKey: true,
      defaultBaseURL: 'https://spark-api-open.xf-yun.com/v1',
      supportsDynamicModels: false,
      apiKeyUrl: 'https://console.xfyun.cn/services/bmx1',
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
    return SPARK_STATIC_MODELS.map((definition) => {
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
