<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { gsap } from 'gsap';
import { useI18n } from '../../hooks/useI18n';

const { t } = useI18n();
const heroContainer = ref<HTMLElement | null>(null);

const initHeroAnimation = () => {
  if (!heroContainer.value) return;

  // 极简方案：由下至上缓慢淡入
  gsap.fromTo(
    '.content',
    { opacity: 0, y: 30 },
    { opacity: 1, y: 0, duration: 2.5, ease: 'power2.out' },
  );
};

onMounted(() => {
  initHeroAnimation();
  document.addEventListener('astro:page-load', initHeroAnimation);
});
</script>

<template>
  <section class="section-full" ref="heroContainer">
    <div class="content">
      <div class="title-group">
        <h1 class="hero-title italic">流浪, 顿悟,</h1>
        <h1 class="hero-title">于喧嚣之外寻一片净土。</h1>
      </div>

      <div class="meta-group">
        <div class="hero-subtitle">MuYuCat</div>
        <div class="social-links">
          <!-- GitHub -->
          <a
            href="https://github.com/MuYuCat"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.28 1.15-.28 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"
              ></path>
              <path d="M9 18c-4.51 2-5-2-7-2"></path>
            </svg>
          </a>
          <!-- Telegram -->
          <a
            href="https://t.me/muyucat"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Telegram"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </a>
          <!-- WeChat -->
          <!-- <a href="/about" target="_blank" rel="noopener noreferrer" aria-label="WeChat">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path><path d="M13 8H7"></path><path d="M17 12H7"></path></svg>
          </a> -->
          <!-- Email -->
          <a href="mailto:1280773395@qq.com?subject=来自博客的联系" aria-label="Email">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect width="20" height="16" x="2" y="4" rx="2"></rect>
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
            </svg>
          </a>
        </div>
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
  background-color: var(--bg);
  position: relative;
  overflow: hidden;
}

.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3rem;
  opacity: 0; // 初始隐藏，交给脚本淡入
}

.title-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.hero-title {
  font-family: var(--heading);
  font-size: clamp(2.5rem, 8vw, 5.5rem);
  font-weight: 400;
  margin: 0;
  line-height: 1.1;
  letter-spacing: -0.01em;
  color: var(--text-h);

  &.italic {
    font-style: italic;
    opacity: 0.9;
    margin-bottom: 1rem;
  }
}

.meta-group {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-top: 1rem;
}

.hero-subtitle {
  font-family: var(--heading);
  font-size: 1.5rem;
  font-weight: 400;
  font-style: italic;
  color: var(--text-h);
  opacity: 0.8;
  letter-spacing: 0.05em;
}

.social-links {
  display: flex;
  gap: 1.5rem;
  padding-left: 2rem;
  border-left: 1px solid var(--border);

  a {
    color: var(--text-h);
    opacity: 0.4;
    transition: all 0.5s cubic-bezier(0.2, 1, 0.3, 1);

    &:hover {
      opacity: 1;
      transform: translateY(-2px);
      color: var(--accent);
    }

    svg {
      width: 18px;
      height: 18px;
    }
  }
}

.scroll-indicator {
  position: absolute;
  bottom: 4rem;
  font-size: 0.65rem;
  font-family: var(--sans);
  color: #86868b;
  text-transform: uppercase;
  letter-spacing: 0.4em;
  opacity: 0.4;
  animation: fadePulse 3s infinite ease-in-out;
}

@keyframes fadePulse {
  0%,
  100% {
    opacity: 0.2;
    transform: translateY(0);
  }
  50% {
    opacity: 0.5;
    transform: translateY(-5px);
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 3rem;
  }
  .meta-group {
    flex-direction: column;
    gap: 1.5rem;
    .social-links {
      padding-left: 0;
      border-left: none;
    }
  }
}
</style>
