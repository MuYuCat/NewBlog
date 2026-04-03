<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from '../../hooks/useI18n';

const { t } = useI18n();

const initHero = () => {
  const reveals = document.querySelectorAll('.section-full .reveal');
  reveals.forEach((el) => {
    el.classList.remove('active');
    // @ts-ignore
    void el.offsetWidth;
    el.classList.add('active');
  });
};

onMounted(() => {
  initHero();
  // 监听 Astro 导航以重新触发动画
  document.addEventListener('astro:page-load', initHero);
});
</script>

<template>
  <section class="section-full">
    <div class="content reveal">
      <a href="/about" class="hero-link">
        <h1 class="hero-title">NewBlog</h1>
      </a>
      <p class="hero-subtitle">{{ t('首屏.副标题') }}</p>
      <div class="scroll-indicator">
        <span>{{ t('首屏.滚动提示') }}</span>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.section-full {
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  background: radial-gradient(circle at center, var(--bg) 0%, var(--bg-dim, #f5f5f7) 100%);
  position: relative;
  transition: background 0.3s;
}

:global(.dark) .section-full {
  --bg-dim: #000000;
}

.hero-link {
  text-decoration: none;
  display: inline-block;
  transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1);

  &:hover {
    transform: scale(1.02);
  }
}

.hero-title {
  font-size: clamp(4rem, 15vh, 12rem);
  font-weight: 900;
  margin: 0;
  letter-spacing: -0.05em;
  background: linear-gradient(to bottom, var(--text-h) 0%, #86868b 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  transition: filter 0.3s ease;
}

.hero-link:hover .hero-title {
  filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.05));
}

.hero-subtitle {
  font-size: clamp(1.2rem, 3vh, 2rem);
  font-weight: 400;
  letter-spacing: 0.5em;
  margin-top: -1vh;
  color: #86868b;
  text-transform: uppercase;
}

.scroll-indicator {
  position: absolute;
  bottom: 5vh;
  font-size: 0.8rem;
  color: #c7c7cc;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  animation: bounce 2s infinite;
}

.reveal {
  opacity: 0;
  transform: translateY(30px);
  transition: all 1s cubic-bezier(0.25, 1, 0.5, 1);

  &.active {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounce {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}
</style>
