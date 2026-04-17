<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { request } from '../../utils/request';
import WhisperCard from './WhisperCard.vue';
import gsap from 'gsap';

const categories = ref<any[]>([]);
const articles = ref<any[]>([]);
const total = ref(0);
const loading = ref(true);
const loadingMore = ref(false);
const page = ref(1);
const limit = ref(12);
const search = ref('');
const sort = ref<'latest' | 'hottest'>('latest');
const selectedCategoryId = ref<number | null>(null);
const hasMore = ref(true);

const showBackToTop = ref(false);
const sentinelRef = ref<HTMLElement | null>(null);

const fetchCategories = async () => {
  try {
    const res = await request('/category');
    categories.value = res.filter((c: any) => c.type === 2); // 仅限心语分类
  } catch (e) {
    console.error(e);
  }
};

const fetchArticles = async (isLoadMore = false) => {
  if (isLoadMore) {
    loadingMore.value = true;
  } else {
    loading.value = true;
    articles.value = [];
    page.value = 1;
  }

  try {
    const params: any = {
      page: page.value,
      limit: limit.value,
      mode: 2,
      sort: sort.value,
      search: search.value,
    };
    if (selectedCategoryId.value) params.categoryIds = [selectedCategoryId.value];

    const res = await request('/article', { params });

    if (isLoadMore) {
      articles.value = [...articles.value, ...res.items];
    } else {
      articles.value = res.items;
    }

    total.value = res.total;
    hasMore.value = articles.value.length < total.value;

    nextTick(() => {
      const selector = isLoadMore
        ? '.whisper-card-item:nth-last-child(-n+' + res.items.length + ')'
        : '.whisper-card-item';
      gsap.from(selector, {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
      });
    });
  } catch (e) {
    console.error('[心语] 获取数据失败:', e);
  } finally {
    loading.value = false;
    loadingMore.value = false;
  }
};

const toggleCategory = (id: number | null) => {
  selectedCategoryId.value = selectedCategoryId.value === id ? null : id;
  fetchArticles();
};

let scrollObserver: IntersectionObserver | null = null;
const initInfiniteScroll = () => {
  if (!sentinelRef.value) return;
  scrollObserver = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting && !loading.value && !loadingMore.value && hasMore.value) {
        page.value++;
        fetchArticles(true);
      }
    },
    { threshold: 0.1 },
  );
  scrollObserver.observe(sentinelRef.value);
};

const handleScroll = () => {
  showBackToTop.value = window.scrollY > 800;
};

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

let timer: any = null;
const debouncedFetch = () => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    fetchArticles();
  }, 500);
};

watch([sort], () => {
  fetchArticles();
});

onMounted(() => {
  fetchCategories();
  fetchArticles();
  initInfiniteScroll();
  window.addEventListener('scroll', handleScroll, { passive: true });
  gsap.from('.hub-header', { y: 20, opacity: 0, duration: 1, ease: 'power3.out' });
});

onUnmounted(() => {
  if (scrollObserver) scrollObserver.disconnect();
  window.removeEventListener('scroll', handleScroll);
});
</script>

<template>
  <div class="whisper-hub-container">
    <!-- 头部样式 (参考 ArticleList) -->
    <header class="hub-header">
      <h1 class="hub-title">喃喃自语 / Whispers</h1>
      <p class="hub-subtitle">记录意识碎片，捕捉思想间的静默</p>
    </header>

    <!-- 操控台 (参考 ArticleList) -->
    <div class="filter-wrapper">
      <div class="search-bar">
        <div class="search-input-group">
          <input
            v-model="search"
            type="text"
            placeholder="检索往昔记忆、碎语或协议..."
            class="luxury-input"
            @input="debouncedFetch"
          />
        </div>

        <div class="sort-options">
          <button :class="['sort-btn', { active: sort === 'latest' }]" @click="sort = 'latest'">
            最新时刻
          </button>
          <button :class="['sort-btn', { active: sort === 'hottest' }]" @click="sort = 'hottest'">
            共鸣最高
          </button>
        </div>
      </div>

      <div class="tags-cloud">
        <button
          :class="['tag-chip', { active: selectedCategoryId === null }]"
          @click="toggleCategory(null)"
        >
          全量维度
        </button>
        <button
          v-for="cat in categories"
          :key="cat.id"
          :class="['tag-chip', { active: selectedCategoryId === cat.id }]"
          @click="toggleCategory(cat.id)"
        >
          {{ cat.name }}
        </button>
      </div>
    </div>

    <!-- 瀑布流容器 -->
    <main class="whisper-main">
      <div v-if="loading && page === 1" class="loading-grid">
        <div
          v-for="i in 6"
          :key="i"
          class="skeleton-card"
          :style="{ height: 200 + (i % 3) * 100 + 'px' }"
        ></div>
      </div>

      <div v-else-if="articles.length === 0" class="pixel-empty-state">
        <p class="empty-text">此间寂静，尚无只言片语</p>
      </div>

      <div v-else class="whisper-waterfall">
        <div v-for="article in articles" :key="article.id" class="whisper-card-item">
          <WhisperCard :article="article" />
        </div>
      </div>

      <div ref="sentinelRef" class="load-more-sentinel">
        <div v-if="loadingMore" class="loading-spinner">
          <div class="dot"></div>
          <div class="dot"></div>
          <div class="dot"></div>
        </div>
        <p v-else-if="!hasMore && articles.length > 0" class="no-more-text">
          - 所有的回响都已落地 -
        </p>
      </div>
    </main>

    <Transition name="fade-slide">
      <button v-show="showBackToTop" class="back-to-top" @click="scrollToTop" title="返回顶部">
        <svg viewBox="0 0 24 24" class="arrow-icon">
          <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z" />
        </svg>
      </button>
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
.whisper-hub-container {
  padding: 6rem 2rem 8rem;
  width: 1200px;
  max-width: 100%;
  margin: 0 auto;
  min-height: 100vh;
}

/* 头部与控制台样式 (复用 ArticleList 基因) */
.hub-header {
  text-align: center;
  margin-bottom: 4rem;
  .hub-title {
    font-size: 3.5rem;
    font-family: var(--heading);
    color: var(--text-h);
    margin-bottom: 1rem;
    font-weight: 500;
  }
  .hub-subtitle {
    font-size: 1.1rem;
    color: var(--text);
    letter-spacing: 0.1em;
    opacity: 0.8;
  }
}

.filter-wrapper {
  margin-bottom: 5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  align-items: center;
  position: sticky;
  top: 5rem;
  z-index: 10;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(var(--bg-rgb, 255, 255, 255), 0.8);
  backdrop-filter: blur(20px);
  padding: 0.8rem 1.5rem;
  border-radius: 100px;
  border: 1px solid var(--accent-border);
  width: 100%;
  max-width: 800px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);

  .search-input-group {
    flex: 1;
    input {
      width: 100%;
      background: transparent;
      border: none;
      outline: none;
      color: var(--text-h);
      font-size: 1rem;
      padding: 0.2rem 0;
      &::placeholder {
        color: var(--text);
        opacity: 0.4;
      }
    }
  }

  .sort-options {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    border-left: 1px solid var(--border);
    padding-left: 1rem;
    .sort-btn {
      background: transparent;
      border: none;
      font-size: 0.9rem;
      padding: 0.4rem 0.8rem;
      border-radius: 50px;
      cursor: pointer;
      color: var(--text);
      transition: all 0.3s;
      &.active {
        background: var(--bg);
        color: var(--accent);
        box-shadow: var(--shadow);
      }
    }
  }
}

.tags-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  justify-content: center;
  max-width: 800px;
  .tag-chip {
    padding: 0.3rem 1rem;
    border-radius: 50px;
    border: 1px solid var(--border);
    background: var(--bg);
    color: var(--text);
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
    &:hover {
      border-color: var(--accent);
      color: var(--accent);
      transform: translateY(-2px);
    }
    &.active {
      background: var(--accent);
      color: #fff;
      border-color: var(--accent);
    }
  }
}

/* 瀑布流布局 */
.whisper-waterfall {
  columns: 3;
  column-gap: 2rem;
  @media (max-width: 1100px) {
    columns: 2;
  }
  @media (max-width: 768px) {
    columns: 1;
  }
}

.whisper-card-item {
  display: inline-block;
  width: 100%;
  margin-bottom: 2rem;
}

.load-more-sentinel {
  margin-top: 4rem;
  padding: 40px 0;
  text-align: center;
  .loading-spinner {
    display: flex;
    justify-content: center;
    gap: 8px;
    .dot {
      width: 8px;
      height: 8px;
      background: var(--accent);
      border-radius: 50%;
      animation: pulse 1.5s infinite ease-in-out;
      &:nth-child(2) {
        animation-delay: 0.2s;
      }
      &:nth-child(3) {
        animation-delay: 0.4s;
      }
    }
  }
  .no-more-text {
    font-family: var(--body);
    font-size: 0.8rem;
    color: var(--text);
    opacity: 0.2;
    letter-spacing: 0.2em;
  }
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(0.6);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
}

.back-to-top {
  position: fixed;
  right: 50px;
  bottom: 50px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--code-bg);
  border: 1px solid var(--border);
  backdrop-filter: blur(20px);
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  z-index: 100;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  &:hover {
    transform: translateY(-5px) scale(1.1);
    border-color: var(--accent);
    .arrow-icon {
      fill: var(--accent);
    }
  }
  .arrow-icon {
    width: 28px;
    height: 28px;
    fill: var(--text-h);
    transition: fill 0.3s;
  }
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s ease;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.skeleton-card {
  background: var(--border);
  border-radius: 28px;
  margin-bottom: 2rem;
  display: inline-block;
  width: 100%;
  opacity: 0.5;
}
.pixel-empty-state {
  text-align: center;
  padding: 8rem 0;
  opacity: 0.5;
}
</style>
