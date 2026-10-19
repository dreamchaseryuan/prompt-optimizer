import { computed, type Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import type { AppServices } from '../../types/services'
import type { VideoSubMode } from '@prompt-optimizer/core'

interface UseVideoSubModeApi {
  videoSubMode: Ref<VideoSubMode>
  setVideoSubMode: (mode: VideoSubMode) => Promise<void>
  switchToText2Video: () => Promise<void>
  switchToImage2Video: () => Promise<void>
  ensureInitialized: () => Promise<void>
}

/**
 * 视频模式的子模式管理（基于 Vue Router）
 *
 * 与 useImageSubMode 同型：
 * - 路由是唯一的真源（/video/text2video | /video/image2video）
 * - 不使用 preference 存储，避免双写不一致
 * - setVideoSubMode 通过路由导航更新子模式
 */
export function useVideoSubMode(services: Ref<AppServices | null>): UseVideoSubModeApi {
  // services 参数保留用于调用方兼容；该 composable 不再持久化任何偏好
  void services

  const route = useRoute()
  const router = useRouter()

  // 从路由参数读取子模式（text2video / image2video）
  const videoSubMode = computed<VideoSubMode>(() => {
    if (route.path.startsWith('/video/image2video')) return 'image2video'
    if (route.path.startsWith('/video/text2video')) return 'text2video'
    return 'text2video'
  })

  const ensureInitialized = async () => {
    // 路由已初始化，无需额外操作
    console.log(`[useVideoSubMode] Current sub-mode (from route): ${videoSubMode.value}`)
  }

  const setVideoSubMode = async (mode: VideoSubMode) => {
    // 通过路由导航更新子模式
    const targetPath = `/video/${mode}`
    if (route.path !== targetPath) {
      await router.push(targetPath)
      console.log(`[useVideoSubMode] Sub-mode switched via route navigation: ${mode}`)
    }
  }

  const switchToText2Video = () => setVideoSubMode('text2video')
  const switchToImage2Video = () => setVideoSubMode('image2video')

  return {
    videoSubMode: videoSubMode as Ref<VideoSubMode>,
    setVideoSubMode,
    switchToText2Video,
    switchToImage2Video,
    ensureInitialized
  }
}
