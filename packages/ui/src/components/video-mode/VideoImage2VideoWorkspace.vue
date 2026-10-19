<template>
  <div class="video-workspace-placeholder">
    <div class="placeholder-card">
      <div class="placeholder-icon">🎞️</div>
      <h2>{{ t('videoMode.image2video') }}</h2>
      <p>{{ t('videoMode.image2videoDescription') }}</p>
      <p class="placeholder-note">{{ t('videoWorkspace.placeholderNote') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<style scoped>
.video-workspace-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 24px;
}

.placeholder-card {
  text-align: center;
  padding: 40px 56px;
  border-radius: 12px;
  border: 1px dashed var(--border-color, #d0d5dd);
  background: var(--bg-secondary, #f9fafb);
}

.placeholder-icon {
  font-size: 40px;
  margin-bottom: 12px;
}

.placeholder-note {
  margin-top: 12px;
  font-size: 12px;
  opacity: 0.65;
}
</style>
