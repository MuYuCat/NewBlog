<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import MarkdownIt from 'markdown-it';
import { request } from '../../utils/request';

const props = defineProps<{
  article: any;
}>();

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true,
});

const cardRef = ref<HTMLElement | null>(null);
const isViewed = ref(false);
let viewTimer: any = null;

onMounted(() => {
  if (typeof window === 'undefined' || !cardRef.value) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !isViewed.value) {
          viewTimer = setTimeout(async () => {
            try {
              await request(`/article/${props.article.id}/click`, { method: 'PATCH' });
              isViewed.value = true;
            } catch (e) {
              console.error('曝光上报失败:', e);
            }
          }, 2000);
        } else {
          if (viewTimer) {
            clearTimeout(viewTimer);
            viewTimer = null;
          }
        }
      });
    },
    { threshold: 0.5 },
  );

  observer.observe(cardRef.value);
  onUnmounted(() => {
    observer.disconnect();
    if (viewTimer) clearTimeout(viewTimer);
  });
});

const getDay = (date: string) => new Date(date).getDate();
const getMonth = (date: string) =>
  new Date(date).toLocaleString('en-US', { month: 'short' }).toUpperCase();
</script>

<template>
  <div ref="cardRef" class="whisper-card-glass">
    <div class="card-glow"></div>

    <!-- 日期浮层 (参考 Vault 的极简感) -->
    <div class="card-date-badge">
      <span class="day">{{ getDay(article.createdAt) }}</span>
      <span class="month">{{ getMonth(article.createdAt) }}</span>
    </div>

    <div class="card-body">
      <!-- 头部：心情与位置 -->
      <div class="card-meta-top" v-if="article.mood || article.location">
        <span v-if="article.mood" class="mood-tag">{{ article.mood }}</span>
        <span v-if="article.location" class="location-tag">
          <svg viewBox="0 0 24 24" class="icon">
            <path
              d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
            />
          </svg>
          {{ article.location }}
        </span>
      </div>

      <h3 v-if="article.title" class="whisper-title">{{ article.title }}</h3>

      <!-- 正文全显 -->
      <div class="whisper-content markdown-body" v-html="md.render(article.content)"></div>

      <!-- 底部：维度与统计 -->
      <div class="card-footer">
        <div class="categories">
          <span v-for="cat in article.categories" :key="cat.id" class="mini-tag">
            {{ cat.name }}
          </span>
        </div>
        <div class="stats">
          <span class="views">
            <svg viewBox="0 0 24 24" class="icon">
              <path
                d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
              />
            </svg>
            {{ article.clicks + (isViewed ? 1 : 0) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.whisper-card-glass {
  position: relative;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 28px;
  overflow: hidden;
  transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
  cursor: default;

  &:hover {
    transform: translateY(-8px);
    border-color: var(--accent);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);

    .card-glow {
      opacity: 1;
    }
    .card-date-badge {
      background: var(--accent);
      color: #fff;
    }
  }
}

.card-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at top right, rgba(var(--accent-rgb), 0.05), transparent);
  opacity: 0;
  transition: opacity 0.5s ease;
  pointer-events: none;
}

.card-date-badge {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  width: 50px;
  height: 50px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--code-bg);
  border-radius: 14px;
  transition: all 0.3s ease;
  z-index: 2;

  .day {
    font-family: var(--heading);
    font-size: 1.4rem;
    font-weight: 700;
    line-height: 1;
  }
  .month {
    font-family: var(--mono);
    font-size: 0.6rem;
    opacity: 0.5;
  }
}

.card-body {
  padding: 2.5rem;
  padding-top: 3.5rem;
}

.card-meta-top {
  display: flex;
  gap: 12px;
  margin-bottom: 1.5rem;
  font-family: var(--mono);
  font-size: 0.75rem;

  .mood-tag {
    color: var(--accent);
    font-weight: 600;
    &::before {
      content: '#';
    }
  }

  .location-tag {
    display: flex;
    align-items: center;
    gap: 4px;
    opacity: 0.4;
    .icon {
      width: 12px;
      height: 12px;
      fill: currentColor;
    }
  }
}

.whisper-title {
  font-family: var(--heading);
  font-size: 1.8rem;
  color: var(--text-h);
  line-height: 1.3;
  margin-bottom: 1.5rem;
  padding-right: 4rem; // 为日期留空
}

.whisper-content {
  font-size: 1.05rem;
  line-height: 1.8;
  color: var(--text);
  margin-bottom: 2rem;

  :deep(p) {
    margin-bottom: 1.2rem;
    &:last-child {
      margin-bottom: 0;
    }
  }
  :deep(img) {
    max-width: 100%;
    border-radius: 16px;
    margin: 1rem 0;
  }
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border);

  .categories {
    display: flex;
    gap: 8px;
    .mini-tag {
      font-size: 0.7rem;
      color: var(--text);
      opacity: 0.4;
      background: var(--code-bg);
      padding: 2px 10px;
      border-radius: 4px;
      &::before {
        content: '#';
      }
    }
  }

  .stats {
    font-family: var(--mono);
    font-size: 0.75rem; // 稍微调大一点点以增加可读性
    opacity: 0.3;

    .views {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .icon {
      width: 14px;
      height: 14px;
      fill: currentColor;
      // 光学修正：图标通常重心偏上，稍微下移一点实现视觉对齐
      transform: translateY(0.5px);
    }
  }
}

:global(.dark) {
  .whisper-card-glass {
    background: rgba(255, 255, 255, 0.02);
    backdrop-filter: blur(20px);
  }
  .card-date-badge {
    background: rgba(255, 255, 255, 0.05);
  }
}
</style>
