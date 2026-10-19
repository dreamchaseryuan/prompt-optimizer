export type NormalizedFavoriteFunctionMode = 'basic' | 'context' | 'image' | 'video'

export const normalizeFavoriteFunctionMode = (mode: unknown): NormalizedFavoriteFunctionMode => {
  if (mode === 'image') return 'image'
  if (mode === 'video') return 'video'
  if (mode === 'context' || mode === 'pro') return 'context'
  return 'basic'
}
