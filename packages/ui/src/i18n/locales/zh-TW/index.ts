import core from './core'
import favorites from './favorites'
import prompt from './prompt'
import models from './models'
import templates from './templates'
import testing from './testing'
import context from './context'
import image from './image'
import errors from './errors'
import batch from './batch'
import video from './video'

const messages = {
  ...core,
  ...favorites,
  ...prompt,
  ...models,
  ...templates,
  ...testing,
  ...context,
  ...image,
  ...errors,
  ...batch,
  ...video,
} as const;

export default messages;
