/**
 * 侧边栏导航 SVG 线性图标（替代 emoji，设计文档 §2.2）
 *
 * 规格：viewBox 24 / stroke 1.8 / round cap+join / fill none / currentColor，
 * 消费端以 16px 显示（stroke 视觉 ≈1.2px）。
 * 用法：`<span class="nav-item-icon" v-html="navIcon(item.icon)" />`，
 * 值均为本模块静态常量，无用户输入，v-html 安全。
 */

const svg = (body: string): string =>
  `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`

export const navIcons: Record<string, string> = {
  // 工作区：基础模式
  'basic-system': svg('<rect x="3" y="4" width="18" height="13" rx="1.5"/><path d="M8 21h8M12 17v4"/>'),
  'basic-user': svg('<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/><path d="M9 12h6M9 16h4"/>'),
  // 工作区：上下文模式
  'pro-multi': svg('<path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5c-1.5 0-2.9-.36-4.1-1L3 20l1.1-5.2A8.5 8.5 0 1 1 21 11.5z"/>'),
  'pro-variable': svg('<path d="M8 4c-2 0-2.5 1.5-2.5 3S6 10 6 12s-.5 5-2.5 5"/><path d="M16 4c2 0 2.5 1.5 2.5 3S18 10 18 12s.5 5 2.5 5"/><path d="M10 9l4 6M14 9l-4 6"/>'),
  // 工作区：图像模式
  'image-text2image': svg('<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="M3 17l5-4 4 3 4-4 5 5"/>'),
  'image-image2image': svg('<rect x="3" y="3" width="13" height="13" rx="2"/><path d="M14 8h5a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2v-5"/><circle cx="7.5" cy="7.5" r="1.2"/><path d="M3 13l3.5-3 4 3.5"/>'),
  'image-multiimage': svg('<rect x="7" y="3" width="14" height="14" rx="2"/><path d="M17 21H5a2 2 0 0 1-2-2V7"/><circle cx="12" cy="8" r="1.4"/><path d="M7 17l4-3.5 3.5 3 2.5-2 4 2.5"/>'),
  // 工作区：视频模式
  'video-text2video': svg('<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M7 6l2.5 4M12 6l2.5 4M17 6l2.5 4"/><path d="M10.5 11.5v4l3.5-2z"/>'),
  'video-image2video': svg('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M8 5v14M16 5v14M3 10h5M3 14h5M16 10h5M16 14h5"/><path d="M10.5 10.5v3l2.5-1.5z"/>'),
  // 工具
  batch: svg('<path d="M13 2 4.5 13.5H11L9.5 22 19 9.5h-6.5z"/>'),
  favorites: svg('<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1.1 5.8L12 16.9l-5.3 2.7 1.1-5.8-4.3-4.1 5.9-.8z"/>'),
  templates: svg('<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>'),
  history: svg('<path d="M3.5 12a8.5 8.5 0 1 1 2.5 6"/><path d="M3.5 12H3m.5 0l-1 3.5"/><path d="M12 8v4.5l3 1.8"/>'),
  modelManager: svg('<circle cx="12" cy="12" r="3.2"/><path d="M19 12a7 7 0 0 0-.15-1.4l2-1.55-2-3.46-2.35.95a7 7 0 0 0-2.4-1.4L13.7 2h-3.4l-.4 2.14a7 7 0 0 0-2.4 1.4l-2.35-.95-2 3.46 2 1.55a7 7 0 0 0 0 2.8l-2 1.55 2 3.46 2.35-.95a7 7 0 0 0 2.4 1.4l.4 2.14h3.4l.4-2.14a7 7 0 0 0 2.4-1.4l2.35.95 2-3.46-2-1.55A7 7 0 0 0 19 12z"/>'),
  dataManager: svg('<ellipse cx="12" cy="5.5" rx="8" ry="2.8"/><path d="M4 5.5V12c0 1.55 3.58 2.8 8 2.8s8-1.25 8-2.8V5.5"/><path d="M4 12v6.5C4 20.05 7.58 21.3 12 21.3s8-1.25 8-2.8V12"/>'),
  variables: svg('<path d="M9 3L7 21M17 3l-2 18M4 8.5h17M3 15.5h17"/>'),
}

export const navIcon = (name: string): string => navIcons[name] ?? ''
