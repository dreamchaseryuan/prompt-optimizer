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
  border-bottom: 1px solid var(--n-border-color);
  background: color-mix(in srgb, var(--n-card-color) 78%, transparent);
  backdrop-filter: saturate(1.4) blur(10px);
  -webkit-backdrop-filter: saturate(1.4) blur(10px);
}

.topbar-title {
  display: flex;
  align-items: center;
  min-width: 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--n-text-color-1);
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
