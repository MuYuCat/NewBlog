<template>
  <div class="article-hub-container">
    <!-- 头部标题：对齐 Vault 样式 -->
    <header class="hub-header">
      <h1 class="hub-title">知识智库 / Knowledge</h1>
      <p class="hub-subtitle">深度协议、架构思索与逻辑的边界</p>
    </header>

    <div class="main-layout">
      <!-- 左侧筛选栏 -->
      <aside class="sidebar-filters">
        <div class="filter-glass-card">
          <div class="filter-section">
            <h3 class="section-title">检索引擎</h3>
            <div class="search-box">
              <input
                v-model="search"
                type="text"
                placeholder="搜索智库镜像..."
                @input="debouncedFetch"
              />
            </div>
            <div class="sort-capsule">
              <button :class="{ active: sort === 'latest' }" @click="sort = 'latest'">
                最新发布
              </button>
              <button :class="{ active: sort === 'hottest' }" @click="sort = 'hottest'">
                最热浏览
              </button>
            </div>
          </div>

          <div class="filter-section">
            <h3 class="section-title">主题维度</h3>
            <ul class="category-list">
              <li :class="{ active: !selectedCategoryId }" @click="selectCategory(null)">
                <span class="dot"></span> 全量维度
              </li>
              <li
                v-for="cat in categories"
                :key="cat.id"
                :class="{ active: selectedCategoryId === cat.id }"
                @click="selectCategory(cat.id)"
              >
                <span class="dot"></span> {{ cat.name }}
                <span class="count">{{ cat._count?.articles || 0 }}</span>
              </li>
            </ul>
          </div>

          <div class="filter-section">
            <h3 class="section-title">时空筛选</h3>
            <div class="date-range-control">
              <div class="input-group">
                <label>起始时间</label>
                <input type="date" v-model="startDate" @change="fetchArticles" />
              </div>
              <div class="input-group">
                <label>截止时间</label>
                <input type="date" v-model="endDate" @change="fetchArticles" />
              </div>
            </div>
          </div>
        </div>
      </aside>

      <!-- 右侧内容 -->
      <main class="article-list-main">
        <div v-if="loading" class="loading-state">
          <div v-for="i in 3" :key="i" class="skeleton-item">
            <div class="skeleton-line title"></div>
            <div class="skeleton-line body"></div>
          </div>
        </div>

        <div v-else-if="articles.length === 0" class="empty-state">
          <div class="empty-icon">∅</div>
          <p>当前维度尚未发现内容镜像</p>
        </div>

        <div v-else class="article-stack">
          <article
            v-for="(article, index) in articles"
            :key="article.id"
            class="article-item"
            @click="goToDetail(article.id)"
          >
            <div class="item-meta">
              <span class="index"
                >#{{ String(total - (page - 1) * limit - index).padStart(2, '0') }}</span
              >
              <span class="divider"></span>
              <span class="date">{{ formatDate(article.createdAt) }}</span>
              <span class="reading-time"
                >预计阅读 {{ estimateReadTime(article.content) }} 分钟</span
              >
            </div>

            <h2 class="item-title">{{ article.title }}</h2>
            <p class="item-summary">{{ article.summary || '内容镜像正在静默生成中...' }}</p>

            <footer class="item-footer">
              <div class="tags">
                <span v-for="cat in article.categories" :key="cat.id" class="tag-chip">
                  {{ cat.name }}
                </span>
              </div>
              <div class="interaction">
                <span class="views">{{ article.clicks }} 次浏览</span>
                <div class="arrow">→</div>
              </div>
            </footer>
          </article>
        </div>

        <!-- 分页 -->
        <div v-if="total > limit" class="pagination-elite">
          <button :disabled="page === 1" @click="changePage(page - 1)" class="nav-btn">
            上一页
          </button>
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
            下一页
          </button>
        </div>
      </main>
    </div>
  </div>
</template>

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
const limit = ref(10);
const search = ref('');
const sort = ref<'latest' | 'hottest'>('latest');
const selectedCategoryId = ref<number | null>(null);
const startDate = ref('');
const endDate = ref('');

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
    if (startDate.value) params.startDate = startDate.value;
    if (endDate.value) params.endDate = endDate.value;

    const res = await request('/article', { params });
    articles.value = res.items;
    total.value = res.total;
    nextTick(() => {
      animateItems();
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
  timer = setTimeout(fetchArticles, 500);
};

watch([sort], fetchArticles);

const animateItems = () => {
  gsap.from('.article-item', {
    y: 30,
    opacity: 0,
    duration: 0.8,
    stagger: 0.1,
    ease: 'power3.out',
  });
};

const selectCategory = (id: number | null) => {
  selectedCategoryId.value = id;
  page.value = 1;
  fetchArticles();
};

const changePage = (p: number) => {
  page.value = p;
  window.scrollTo({ top: 0, behavior: 'smooth' });
  fetchArticles();
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
  gsap.from('.filter-glass-card', { x: -30, opacity: 0, duration: 1, ease: 'expo.out' });
});
</script>

<style scoped lang="scss">
.article-hub-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 8rem 40px 100px;
  min-height: 100vh;
}

.hub-header {
  text-align: center;
  margin-bottom: 6rem;
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

.main-layout {
  display: flex;
  gap: 4rem;
}

.sidebar-filters {
  width: 280px;
  flex-shrink: 0;
  position: sticky;
  top: 8rem;
  height: fit-content;

  .filter-glass-card {
    background: rgba(var(--bg-rgb, 255, 255, 255), 0.03);
    backdrop-filter: blur(20px);
    border: 1px solid var(--border);
    border-radius: 32px;
    padding: 2rem;
    box-shadow: var(--shadow);
  }

  .filter-section {
    margin-bottom: 3rem;
    &:last-child {
      margin-bottom: 0;
    }

    .section-title {
      font-size: 0.65rem;
      color: var(--text);
      opacity: 0.4;
      letter-spacing: 0.25em;
      margin-bottom: 1.5rem;
      text-transform: uppercase;
      font-weight: 600;
    }

    .search-box {
      margin-bottom: 1rem;
      input {
        width: 100%;
        background: rgba(var(--text-h-rgb, 0, 0, 0), 0.03);
        border: 1px solid var(--border);
        color: var(--text-h);
        padding: 10px 14px;
        font-size: 0.8rem;
        border-radius: 12px;
        outline: none;
        &:focus {
          border-color: var(--accent);
        }
      }
    }

    .sort-capsule {
      display: flex;
      background: rgba(var(--text-h-rgb, 0, 0, 0), 0.03);
      padding: 4px;
      border-radius: 100px;
      button {
        flex: 1;
        background: transparent;
        border: none;
        font-size: 0.75rem;
        padding: 6px 0;
        border-radius: 100px;
        cursor: pointer;
        color: var(--text);
        transition: all 0.3s;
        &.active {
          background: var(--accent);
          color: var(--bg);
        }
      }
    }

    .category-list {
      list-style: none;
      padding: 0;
      li {
        padding: 10px 0;
        cursor: pointer;
        font-size: 0.9rem;
        color: var(--text);
        display: flex;
        align-items: center;
        transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
        .dot {
          width: 4px;
          height: 4px;
          background: var(--accent);
          border-radius: 50%;
          margin-right: 12px;
          opacity: 0;
          transform: scale(0);
          transition: all 0.4s;
        }
        .count {
          margin-left: auto;
          font-size: 0.7rem;
          opacity: 0.3;
          font-family: var(--mono);
        }
        &:hover,
        &.active {
          color: var(--accent);
          padding-left: 4px;
          .dot {
            opacity: 1;
            transform: scale(1);
          }
        }
      }
    }
  }

  .date-range-control {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    .input-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
      label {
        font-size: 0.6rem;
        opacity: 0.3;
        font-weight: 700;
      }
      input {
        background: rgba(var(--text-h-rgb, 0, 0, 0), 0.03);
        border: 1px solid var(--border);
        color: var(--text-h);
        padding: 10px;
        font-size: 0.8rem;
        border-radius: 10px;
        outline: none;
      }
    }
  }
}

.article-list-main {
  flex-grow: 1;
  max-width: 860px;
  .article-stack {
    display: flex;
    flex-direction: column;
    gap: 6rem;
  }
  .article-item {
    cursor: pointer;
    padding-bottom: 4rem;
    border-bottom: 1px solid var(--border);
    transition: all 0.5s;
    &:hover {
      .item-title {
        color: var(--accent);
      }
      .interaction .arrow {
        transform: translateX(8px);
      }
    }
    .item-meta {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 0.75rem;
      color: var(--text);
      opacity: 0.5;
      margin-bottom: 1.5rem;
      font-family: var(--mono);
      text-transform: uppercase;
      .index {
        font-weight: 700;
        color: var(--accent);
        opacity: 1;
      }
      .divider {
        width: 30px;
        height: 1px;
        background: var(--border);
      }
    }
    .item-title {
      font-size: 3.2rem;
      line-height: 1.1;
      margin-bottom: 2rem;
      transition: color 0.4s;
      font-family: var(--heading);
    }
    .item-summary {
      font-size: 1.1rem;
      line-height: 1.8;
      color: var(--text);
      opacity: 0.8;
      margin-bottom: 2.5rem;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .item-footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      .tags {
        display: flex;
        gap: 8px;
        .tag-chip {
          font-size: 0.65rem;
          color: var(--text);
          padding: 6px 14px;
          border: 1px solid var(--border);
          border-radius: 100px;
          text-transform: uppercase;
        }
      }
      .interaction {
        display: flex;
        align-items: center;
        gap: 1.5rem;
        .views {
          font-size: 0.7rem;
          font-family: var(--mono);
          opacity: 0.3;
        }
        .arrow {
          font-size: 1.5rem;
          opacity: 0.6;
          transition: transform 0.4s;
        }
      }
    }
  }
}

.pagination-elite {
  margin-top: 8rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  .nav-btn {
    background: transparent;
    border: 1px solid var(--border);
    color: var(--text-h);
    padding: 12px 32px;
    border-radius: 100px;
    cursor: pointer;
    font-size: 0.75rem;
    font-weight: 600;
    transition: all 0.4s;
    &:hover:not(:disabled) {
      background: var(--accent);
      color: var(--bg);
    }
    &:disabled {
      opacity: 0.2;
    }
  }
  .page-indicator {
    font-family: var(--heading);
    font-size: 1.5rem;
    .current {
      font-weight: 700;
      color: var(--accent);
    }
    .sep {
      opacity: 0.2;
    }
    .total {
      opacity: 0.4;
    }
  }
}

.loading-state {
  display: flex;
  flex-direction: column;
  gap: 6rem;
  .skeleton-item {
    padding-bottom: 4rem;
    border-bottom: 1px solid var(--border);
    .skeleton-line {
      background: var(--border);
      border-radius: 4px;
      &.title {
        height: 4rem;
        width: 80%;
        margin-bottom: 2rem;
      }
      &.body {
        height: 1.5rem;
        width: 100%;
      }
    }
  }
}
.empty-state {
  text-align: center;
  padding: 120px 0;
  .empty-icon {
    font-size: 4rem;
    opacity: 0.1;
  }
  p {
    font-size: 0.8rem;
    opacity: 0.3;
    letter-spacing: 0.2em;
  }
}
</style>
