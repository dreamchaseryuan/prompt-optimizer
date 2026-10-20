<template>
  <!-- MainLayout - 侧边栏应用壳：侧边导航 + 细顶栏 + 全宽内容 -->
  <ToastUI>
    <div class="app-shell">
      <slot name="sidebar"></slot>
      <div class="app-body">
        <header class="app-topbar">
          <div class="topbar-title">
            <slot name="title"></slot>
          </div>
          <div class="topbar-actions">
            <slot name="actions"></slot>
          </div>
        </header>
        <main class="app-content">
          <div class="app-content-inner">
            <slot name="main"></slot>
          </div>
        </main>
      </div>
      <slot name="modals"></slot>
    </div>
  </ToastUI>
</template>

<script setup lang="ts">
import ToastUI from './Toast.vue'
</script>

<style>
.app-shell {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  overflow: hidden;
  background: var(--n-body-color);
}

/* 首挂载入场编排（设计文档 §2.1）：sidebar 0ms → body(topbar+content) 50ms，
 * 300ms ease-out-expo，仅 CSS animation 天然只跑一次；
 * prefers-reduced-motion 下由 tokens.css 全局归零 */
@keyframes ds-shell-enter {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.app-shell > * {
  animation: ds-shell-enter var(--ds-dur-slow, 300ms) var(--ds-ease-out-expo, cubic-bezier(0.16, 1, 0.3, 1)) backwards;
}

.app-shell > *:nth-child(1) { animation-delay: 0ms; }
.app-shell > *:nth-child(2) { animation-delay: var(--ds-stagger, 50ms); }
.app-shell > *:nth-child(3) { animation-delay: calc(var(--ds-stagger, 50ms) * 2); }

/* 工作区路由切换（设计文档 §3）：fade + 位移，300ms ease-out-expo */
.ds-page-enter-active {
  transition:
    opacity var(--ds-dur-slow, 300ms) var(--ds-ease-out-expo, cubic-bezier(0.16, 1, 0.3, 1)),
    transform var(--ds-dur-slow, 300ms) var(--ds-ease-out-expo, cubic-bezier(0.16, 1, 0.3, 1));
}

.ds-page-leave-active {
  transition:
    opacity var(--ds-dur-fast, 150ms) var(--ds-ease-out-quart, cubic-bezier(0.25, 1, 0.5, 1)),
    transform var(--ds-dur-fast, 150ms) var(--ds-ease-out-quart, cubic-bezier(0.25, 1, 0.5, 1));
}

.ds-page-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.ds-page-leave-to {
  opacity: 0;
  transform: translateY(-2px);
}

.app-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.app-topbar {
  flex-shrink: 0;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 0 20px;
  /* 实色仪表条：不做玻璃（设计文档 §2.1），层级靠色阶与细边线 */
  background: var(--ds-bg-shell, var(--n-card-color));
  border-bottom: 1px solid var(--ds-divider, var(--n-border-color));
}

.topbar-title {
  display: flex;
  align-items: center;
  min-width: 0;
  font-size: 13px;
  font-weight: 600;
  /* 顶栏是仪表不是 hero：降级为次级文字色 */
  color: var(--ds-fg-1, var(--n-text-color-2));
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.app-content {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.app-content-inner {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 18px clamp(16px, 2vw, 36px) 32px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.app-content-inner > * {
  flex: 1;
  min-height: 0;
}

.custom-select {
  -webkit-appearance: none !important;
  -moz-appearance: none !important;
  appearance: none !important;
  background-image: none !important;
}

.custom-select::-ms-expand {
  display: none;
}
</style>
