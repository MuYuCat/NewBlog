<script setup lang="ts">
// Poetry.vue - 100vh 精英随笔版
import { useI18n } from '../../hooks/useI18n';
const { t } = useI18n();
</script>

<template>
  <section class="poetry-section">
    <div class="poetry-content">
      <div class="quote-mark start">“</div>
      <p class="essay-text">
        在流浪与顿悟的间隙，我捞起了一些细碎的意义。原来，这里是我在繁杂世间，唯一能踏实安坐的避风港。很高兴，我们能在这里相遇。
      </p>
      <div class="quote-mark end">”</div>

      <div class="poetry-footer">
        <span class="en-footer">Life is but once, just like every fleeting chance.</span>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.poetry-section {
  height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--bg);
  position: relative;
  padding: 0 10vw;
  box-sizing: border-box;
}

.poetry-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 1000px;
  position: relative;
}

.quote-mark {
  font-family: var(--heading);
  font-size: 4rem;
  color: var(--accent);
  opacity: 0.2;
  line-height: 1;

  &.start {
    align-self: flex-start;
    margin-bottom: -1rem;
  }
  &.end {
    align-self: flex-end;
    margin-top: -1rem;
  }
}

.essay-text {
  font-family: 'Noto Serif SC', serif;
  // 使用响应式字号，确保 100vh 下的视觉冲击力
  font-size: clamp(1.8rem, 4vw, 3rem);
  font-weight: 400;
  line-height: 1.6;
  color: var(--text-h);
  letter-spacing: 0.1em;
  margin: 0;
  word-break: keep-all;
}

.poetry-footer {
  margin-top: 6rem;
  opacity: 0.4;

  .en-footer {
    font-family: 'Cormorant Garamond', serif;
    font-style: italic;
    font-size: 1.5rem;
    letter-spacing: 0.2em;
    border-top: 1px solid var(--border);
    padding-top: 1.5rem;
    font-weight: 800;
  }
}

@media (max-width: 768px) {
  .essay-text {
    font-size: 1.5rem;
  }
  .quote-mark {
    font-size: 3rem;
  }
}
</style>
