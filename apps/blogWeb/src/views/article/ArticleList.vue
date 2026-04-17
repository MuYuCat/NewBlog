<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue';
import { request } from '../../utils/request';
import gsap from 'gsap';

const props = defineProps<{
  mode: number; // 1: 大众, 2: 心语
}>();

const categories = ref<any[]>([]);
const articles = ref<any[]>([]);
const total = ref(0);
const loading = ref(true);

const page = ref(1);
const limit = ref(10); // 单列布局，一页10篇最为合适
const search = ref('');
const sort = ref<'latest' | 'hottest'>('latest');
const selectedCategoryId = ref<number | null>(null);

const fetchCategories = async () => {
  try {
    const res = await request('/category');
    categories.value = res.filter((c: any) => (props.mode === 2 ? c.type === 2 : c.type === 1));
  } catch (e) {
    console.error(e);
  }
};

const fetchArticles = async () => {
  loading.value = true;
  try {
    const params: any = {
      page: page.value,
      limit: limit.value,
      mode: props.mode,
      sort: sort.value,
      search: search.value,
    };
    if (selectedCategoryId.value) params.categoryIds = selectedCategoryId.value;

    const res = await request('/article', { params });
    articles.value = res.items;
    total.value = res.total;
    nextTick(() => {
      animateCards();
    });
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

let timer: any = null;
const debouncedFetch = () => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    page.value = 1;
    fetchArticles();
  }, 500);
};

const toggleCategory = (id: number | null) => {
  selectedCategoryId.value = selectedCategoryId.value === id ? null : id;
  page.value = 1;
  fetchArticles();
};

const changePage = (p: number) => {
  page.value = p;
  window.scrollTo({ top: 0, behavior: 'smooth' });
  fetchArticles();
};

watch([sort], () => {
  page.value = 1;
  fetchArticles();
});

const animateCards = () => {
  gsap.from('.article-card', {
    y: 30,
    opacity: 0,
    duration: 0.8,
    stagger: 0.1,
    ease: 'power3.out',
    overwrite: true,
  });
};

const goToDetail = (id: number) => {
  window.location.href = `/post?id=${id}`;
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const estimateReadTime = (content: string) => {
  const words = content?.replace(/<[^>]*>/g, '').length || 0;
  return Math.max(1, Math.ceil(words / 400));
};

onMounted(() => {
  fetchCategories();
  fetchArticles();
});
</script>

<template>
  <div class="article-hub-container">
    <header class="hub-header">
      <h1 class="hub-title">知识智库 / Article</h1>
      <p class="hub-subtitle">深度协议、架构思索与逻辑的边界</p>
    </header>

    <div class="filter-wrapper">
      <div class="search-bar">
        <div class="search-input-group">
          <input
            v-model="search"
            type="text"
            placeholder="搜索智库镜像、关键词或协议..."
            class="luxury-input"
            @input="debouncedFetch"
          />
        </div>

        <div class="sort-options">
          <button :class="['sort-btn', { active: sort === 'latest' }]" @click="sort = 'latest'">
            最新发布
          </button>
          <button :class="['sort-btn', { active: sort === 'hottest' }]" @click="sort = 'hottest'">
            最热浏览
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

    <div v-if="!loading && articles.length > 0" class="article-list-flow">
      <article
        v-for="(item, index) in articles"
        :key="item.id"
        class="article-card"
        @click="goToDetail(item.id)"
      >
        <div class="card-glass">
          <div class="card-header">
            <div class="meta-left">
              <span class="index-number"
                >#{{ String((page - 1) * limit + index + 1).padStart(2, '0') }}</span
              >
              <span class="separator">/</span>
              <span class="publish-date">{{ formatDate(item.createdAt) }}</span>
            </div>
            <div class="meta-right">
              <span class="read-time">{{ estimateReadTime(item.content) }} 分钟阅读</span>
            </div>
          </div>

          <div class="card-body">
            <h2 class="card-title">{{ item.title }}</h2>
            <p class="card-desc">{{ item.summary || '镜像数据同步中，摘要静默生成...' }}</p>
          </div>

          <div class="card-footer">
            <div class="card-tags-list" v-if="item.categories && item.categories.length">
              <span v-for="cat in item.categories.slice(0, 4)" :key="cat.id" class="mini-tag">
                {{ cat.name }}
              </span>
            </div>
            <div v-else class="card-tags-list empty-tags"></div>

            <div class="card-interaction">
              <span class="card-clicks">
                <svg viewBox="0 0 24 24" class="icon">
                  <path
                    d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
                  />
                </svg>
                {{ item.clicks || 0 }} 浏览
              </span>
            </div>
          </div>
        </div>
      </article>
    </div>

    <div v-else-if="loading" class="article-list-flow">
      <div v-for="i in 4" :key="i" class="skeleton-card"></div>
    </div>

    <div v-else class="pixel-empty-state">
      <div class="pixel-muyu-wrapper">
        <svg
          class="pixel-muyu"
          viewBox="0 0 16 16"
          xmlns="http://www.w3.org/2000/svg"
          shape-rendering="crispEdges"
        >
          <rect x="3" y="3" width="2" height="2" fill="currentColor" />
          <rect x="11" y="3" width="2" height="2" fill="currentColor" />
          <rect x="4" y="5" width="8" height="1" fill="currentColor" />
          <rect x="2" y="6" width="12" height="6" fill="currentColor" />
          <rect x="4" y="12" width="8" height="1" fill="currentColor" />
          <rect x="4" y="8" width="2" height="2" fill="var(--bg)" />
          <rect x="10" y="8" width="2" height="2" fill="var(--bg)" />
          <rect x="6" y="10" width="4" height="1" fill="var(--bg)" />
        </svg>
      </div>
      <p class="empty-text">当前维度尚未发现内容镜像</p>
    </div>

    <div v-if="total > limit" class="pagination-wrapper">
      <div class="pagination-glass">
        <button :disabled="page === 1" @click="changePage(page - 1)" class="nav-btn">往昔</button>
        <div class="page-indicator">
          <span class="current">{{ page }}</span>
          <span class="sep">/</span>
          <span class="total">{{ Math.ceil(total / limit) }}</span>
        </div>
        <button
          :disabled="page >= Math.ceil(total / limit)"
          @click="changePage(page + 1)"
          class="nav-btn"
        >
          今朝
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.article-hub-container {
  padding: 6rem 2rem 8rem;
  /* 将容器宽度收窄至1000px，确保全行卡片的文字排版不会过长导致视觉疲劳 */
  width: 1000px;
  max-width: 100%;
  margin: 0 auto;
  min-height: 100vh;
}

/* 头部样式 */
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

/* 操控台 */
.filter-wrapper {
  margin-bottom: 3rem;
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
    display: flex;
    align-items: center;
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

/* 单列文章流排版 */
.article-list-flow {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.article-card {
  text-decoration: none;
  border-radius: 28px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);

  &:hover {
    transform: translateY(-4px);
    .card-glass {
      background: var(--accent-bg);
      border-color: var(--accent-border);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
    }
    .card-title {
      color: var(--accent);
    }
    .index-number {
      opacity: 0.8;
    }
  }
}

.card-glass {
  background: var(--bg);
  border: 1px solid var(--border);
  padding: 2.5rem 3rem;
  display: flex;
  flex-direction: column;
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
}

/* 卡片内部结构 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: var(--mono);
  font-size: 0.85rem;
  color: var(--text);
  margin-bottom: 1.2rem;

  .meta-left {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    .index-number {
      color: var(--accent);
      font-weight: 600;
      opacity: 0.4;
      font-size: 1rem;
      transition: opacity 0.3s;
    }
    .separator {
      opacity: 0.3;
    }
    .publish-date {
      opacity: 0.6;
    }
  }

  .meta-right {
    opacity: 0.5;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
}

.card-body {
  margin-bottom: 2rem;

  .card-title {
    font-family: var(--heading);
    font-size: 2.2rem;
    line-height: 1.3;
    color: var(--text-h);
    margin-bottom: 1rem;
    transition: color 0.3s;
  }

  .card-desc {
    font-size: 1.05rem;
    line-height: 1.8;
    color: var(--text);
    opacity: 0.75;
    /* 两行省略核心代码 */
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    /* 限制最大宽度，防止文字拉得过长，营造留白美感 */
    max-width: 85%;
  }
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid var(--border);
  padding-top: 1.5rem;

  .card-tags-list {
    display: flex;
    gap: 0.8rem;

    .mini-tag {
      font-size: 0.8rem;
      color: var(--text-h);
      background: var(--code-bg);
      padding: 4px 12px;
      border-radius: 6px;
      font-family: var(--mono);
      transition: background 0.3s;
    }
  }

  .card-interaction {
    .card-clicks {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.85rem;
      color: var(--text);
      opacity: 0.5;
      font-family: var(--mono);

      .icon {
        width: 16px;
        height: 16px;
        fill: currentColor;
      }
    }
  }
}

/* 骨架屏 */
.skeleton-card {
  height: 240px;
  background: var(--border);
  border-radius: 28px;
  animation: pulse 1.5s infinite ease-in-out;
}
@keyframes pulse {
  0% {
    opacity: 0.5;
  }
  50% {
    opacity: 0.2;
  }
  100% {
    opacity: 0.5;
  }
}

/* 像素风空状态 */
.pixel-empty-state {
  text-align: center;
  padding: 8rem 0;
  .pixel-muyu-wrapper {
    width: 72px;
    height: 72px;
    margin: 0 auto 2rem;
    color: var(--accent);
    opacity: 0.3;
  }
  .empty-text {
    font-family: var(--heading);
    font-size: 1.3rem;
    color: var(--text-h);
    opacity: 0.6;
    letter-spacing: 0.1em;
  }
}

/* 质感分页 */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 5rem;
}

.pagination-glass {
  display: flex;
  align-items: center;
  gap: 2.5rem;
  background: rgba(var(--bg-rgb, 255, 255, 255), 0.6);
  backdrop-filter: blur(20px);
  padding: 1rem 2.5rem;
  border-radius: 100px;
  border: 1px solid var(--accent-border);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);

  .nav-btn {
    background: transparent;
    border: none;
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--text-h);
    cursor: pointer;
    transition: all 0.3s;
    &:hover:not(:disabled) {
      color: var(--accent);
    }
    &:disabled {
      opacity: 0.2;
      cursor: not-allowed;
    }
  }

  .page-indicator {
    font-family: var(--mono);
    font-size: 1.1rem;
    display: flex;
    align-items: center;
    gap: 0.6rem;
    .current {
      font-weight: 700;
      color: var(--accent);
    }
    .sep,
    .total {
      color: var(--text);
      opacity: 0.5;
    }
  }
}

@media (max-width: 768px) {
  .article-hub-container {
    padding: 5rem 1.5rem 6rem;
  }
  .search-bar {
    flex-direction: column;
    align-items: stretch;
    border-radius: 20px;
    .sort-options {
      border-left: none;
      border-top: 1px solid var(--border);
      padding-left: 0;
      padding-top: 0.8rem;
      margin-top: 0.5rem;
      justify-content: center;
    }
  }
  .card-glass {
    padding: 1.8rem;
  }
  .card-body .card-title {
    font-size: 1.6rem;
  }
  .card-body .card-desc {
    max-width: 100%;
  }
}
</style>
