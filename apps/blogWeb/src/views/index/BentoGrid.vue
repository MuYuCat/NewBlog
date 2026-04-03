<template>
  <div class="bento-container">
    <div class="bento-grid">
      <!-- 1. 个人简介 (Large) -->
      <div class="bento-card hero-card reveal-on-scroll">
        <div class="card-content">
          <span class="tag">ABOUT ME</span>
          <h2>{{ t('便当格.关于标题') }}</h2>
          <p>{{ t('便当格.关于描述') }}</p>
        </div>
      </div>

      <!-- 2. MBTI (Small) -->
      <a
        href="/article?id=mbti&title=ISTP"
        class="bento-card mbti-card reveal-on-scroll clickable-card"
      >
        <span class="tag">MBTI</span>
        <h3>ISTP</h3>
        <p>鉴赏家</p>
      </a>

      <!-- 3. 技术栈跑马灯 (Wide) -->
      <div class="bento-card tech-card reveal-on-scroll">
        <span class="tag">TECH STACK</span>
        <div class="marquee-container">
          <div class="marquee-content">
            <span>NestJS</span>
            <span>Vue 3</span>
            <span>Astro</span>
            <span>Prisma</span>
            <span>Tailwind</span>
            <span>GSAP</span>
          </div>
        </div>
      </div>

      <!-- 4. 游戏动态 (Medium) -->
      <div class="bento-card game-card reveal-on-scroll">
        <span class="tag">LATEST GAME</span>
        <div class="game-info">
          <h4>艾尔登法环</h4>
          <p>已达成：100%</p>
        </div>
      </div>

      <!-- 5. 最近文档 (Tall) -->
      <div class="bento-card docs-card reveal-on-scroll">
        <span class="tag">RECENT NOTES</span>
        <ul>
          <li>Astro 孤岛架构实践</li>
          <li>Prisma 6 性能调优</li>
          <li>GSAP 动效指南</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useI18n } from '../../hooks/useI18n';

const { t } = useI18n();
gsap.registerPlugin(ScrollTrigger);

onMounted(() => {
  ScrollTrigger.refresh();

  gsap.utils.toArray('.reveal-on-scroll').forEach((el: any) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
      },
    );
  });
});
</script>

<style scoped lang="scss">
.bento-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 120px 20px;
  background: var(--bg);
}

.bento-grid {
  display: grid;
  gap: 24px;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: 220px;
}

.bento-card {
  background: var(--code-bg);
  border: 1px solid var(--border);
  border-radius: 32px;
  padding: 32px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: all 0.5s cubic-bezier(0.25, 1, 0.5, 1);
  overflow: hidden;
  position: relative;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);

  &:hover {
    border-color: var(--accent);
    transform: translateY(-8px);
    box-shadow: var(--shadow);
  }

  .tag {
    font-size: 0.7rem;
    color: var(--text);
    opacity: 0.6;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    font-weight: 600;
  }

  h2 {
    font-size: 2rem;
    margin: 16px 0;
    font-weight: 800;
    line-height: 1.2;
    letter-spacing: -0.02em;
    color: var(--text-h);
  }
  h3 {
    font-size: 3rem;
    margin: 8px 0;
    color: var(--text-h);
    font-weight: 900;
  }
  h4 {
    font-size: 1.4rem;
    margin: 8px 0;
    color: var(--text-h);
    font-weight: 700;
  }
  p {
    color: var(--text);
    opacity: 0.8;
    font-size: 1rem;
    line-height: 1.6;
  }
}

.clickable-card {
  cursor: pointer;
  text-decoration: none;
}

/* 布局定义 */
.hero-card {
  grid-column: span 2;
  grid-row: span 2;
}
.mbti-card {
  grid-column: span 1;
  grid-row: span 1;
  background: linear-gradient(135deg, var(--code-bg) 0%, var(--bg) 100%);
}
.tech-card {
  grid-column: span 2;
  grid-row: span 1;
}
.game-card {
  grid-column: span 1;
  grid-row: span 2;
}
.docs-card {
  grid-column: span 1;
  grid-row: span 2;
}

/* 跑马灯 */
.marquee-container {
  width: 100%;
  margin-top: auto;
  overflow: hidden;
  white-space: nowrap;
  mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
}

.marquee-content {
  display: inline-block;
  animation: marquee 20s linear infinite;

  span {
    padding-right: 48px;
    font-size: 1.4rem;
    font-weight: 800;
    color: #d2d2d7;
    transition: color 0.3s;
    &:hover {
      color: var(--color-text);
    }
  }
}

@keyframes marquee {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}
</style>
