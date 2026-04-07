<script setup lang="ts">
// Placeholder.vue - 通用功能开发中占位
interface Props {
  phase?: string;
  release?: string;
}
defineProps<Props>();
</script>

<template>
  <section class="placeholder-section">
    <div class="content-wrapper">
      <div class="status-badge">{{ phase || 'Phase 01' }}</div>
      <h2 class="main-title">功能正在开发中</h2>
      <p class="sub-title">敬请期待 · Under Development</p>

      <div class="decoration-line"></div>

      <div class="info-grid">
        <div class="info-item">
          <span class="label">Status</span>
          <span class="value">Building...</span>
        </div>
        <div class="info-item">
          <span class="label">Release</span>
          <span class="value">{{ release || 'Spring 2026' }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.placeholder-section {
  min-height: 80vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--bg);
  position: relative;
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 600px;
}

.status-badge {
  font-family: var(--sans);
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--accent);
  background: var(--accent-bg);
  padding: 4px 12px;
  border-radius: 20px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  margin-bottom: 2rem;
}

.main-title {
  font-family: 'Noto Serif SC', serif;
  font-size: 2.5rem;
  font-weight: 300;
  color: var(--text-h);
  letter-spacing: 0.2em;
  margin: 0 0 1rem 0;
}

.sub-title {
  font-family: 'Cormorant Garamond', serif;
  font-style: italic;
  font-size: 1.2rem;
  color: var(--text);
  opacity: 0.6;
  letter-spacing: 0.1em;
  margin: 0;
}

.decoration-line {
  width: 1px;
  height: 60px;
  background: linear-gradient(to bottom, var(--accent), transparent);
  margin: 3rem 0;
  opacity: 0.5;
}

.info-grid {
  display: flex;
  gap: 4rem;
  margin-top: 1rem;

  .info-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    .label {
      font-size: 0.65rem;
      text-transform: uppercase;
      letter-spacing: 0.2em;
      color: var(--text);
      opacity: 0.4;
    }

    .value {
      font-family: var(--heading);
      font-size: 1rem;
      color: var(--text-h);
      font-style: italic;
    }
  }
}

@media (max-width: 768px) {
  .main-title {
    font-size: 1.8rem;
  }
  .info-grid {
    gap: 2rem;
  }
}
</style>
