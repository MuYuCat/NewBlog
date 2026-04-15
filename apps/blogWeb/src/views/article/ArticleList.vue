<template>
  <div class="article-hub-container">
    <!-- 左侧筛选栏 -->
    <aside class="sidebar-filters">
      <div class="filter-section">
        <h3 class="section-title">THEMES</h3>
        <ul class="category-list">
          <li :class="{ active: !selectedCategoryId }" @click="selectCategory(null)">
            All Dimensions
          </li>
          <li
            v-for="cat in categories"
            :key="cat.id"
            :class="{ active: selectedCategoryId === cat.id }"
            @click="selectCategory(cat.id)"
          >
            {{ cat.name }}
            <span class="count">{{ cat._count?.articles || 0 }}</span>
          </li>
        </ul>
      </div>

      <div class="filter-section">
        <h3 class="section-title">TIMELINE</h3>
        <!-- 简单的年份/月份过滤逻辑 -->
        <div class="date-picker-placeholder">
          <input type="date" v-model="startDate" @change="fetchArticles" />
          <span class="to">TO</span>
          <input type="date" v-model="endDate" @change="fetchArticles" />
        </div>
      </div>
    </aside>

    <!-- 右侧列表区 -->
    <main class="article-list-main">
      <div v-if="loading" class="loading-state">
        <div v-for="i in 3" :key="i" class="skeleton-item"></div>
      </div>

      <div v-else-if="articles.length === 0" class="empty-state">
        <p>NO MIRRORS FOUND IN THIS DIMENSION.</p>
      </div>

      <div v-else class="article-grid">
        <article
          v-for="article in articles"
          :key="article.id"
          class="article-card"
          @click="goToDetail(article.id)"
        >
          <header class="card-header">
            <div class="meta">
              <span class="date">{{ formatDate(article.createdAt) }}</span>
              <span class="dot">·</span>
              <span class="read-time">{{ estimateReadTime(article.content) }} MIN READ</span>
            </div>
            <h2 class="title">{{ article.title }}</h2>
          </header>
          <p class="summary">{{ article.summary || 'No summary provided.' }}</p>
          <footer class="card-footer">
            <div class="tags">
              <span v-for="cat in article.categories" :key="cat.id" class="category-tag">
                #{{ cat.name }}
              </span>
            </div>
            <div class="stats">
              <span class="clicks">{{ article.clicks }} VIEWS</span>
            </div>
          </footer>
        </article>
      </div>

      <!-- 分页控制 -->
      <div v-if="total > limit" class="pagination">
        <button :disabled="page === 1" @click="changePage(page - 1)">PREV</button>
        <span class="page-info">{{ page }} / {{ Math.ceil(total / limit) }}</span>
        <button :disabled="page >= Math.ceil(total / limit)" @click="changePage(page + 1)">
          NEXT
        </button>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { request } from '../../utils/request';

const props = defineProps<{
  mode: number; // 1: 大众, 2: 心语
}>();

const categories = ref<any[]>([]);
const articles = ref<any[]>([]);
const total = ref(0);
const loading = ref(true);

const page = ref(1);
const limit = ref(10);
const selectedCategoryId = ref<number | null>(null);
const startDate = ref('');
const endDate = ref('');

const fetchCategories = async () => {
  try {
    const res = await request.get('/category');
    // 过滤出对应模式的分类，或者显示全量但标记
    categories.value = res.filter((c: any) => (props.mode === 2 ? c.type === 2 : c.type === 1));
  } catch (e) {
    console.error('Fetch categories failed', e);
  }
};

const fetchArticles = async () => {
  loading.value = true;
  try {
    const params: any = {
      page: page.value,
      limit: limit.value,
      mode: props.mode,
    };
    if (selectedCategoryId.value) params.categoryIds = selectedCategoryId.value;
    if (startDate.value) params.startDate = startDate.value;
    if (endDate.value) params.endDate = endDate.value;

    const res = await request.get('/article', { params });
    articles.value = res.items;
    total.value = res.total;
  } catch (e) {
    console.error('Fetch articles failed', e);
  } finally {
    loading.value = false;
  }
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
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const estimateReadTime = (content: string) => {
  const words = content.replace(/<[^>]*>/g, '').length;
  return Math.max(1, Math.ceil(words / 300));
};

onMounted(() => {
  fetchCategories();
  fetchArticles();
});
</script>

<style scoped lang="scss">
.article-hub-container {
  display: flex;
  gap: 4rem;
  max-width: 1400px;
  margin: 0 auto;
  padding: 120px 40px;
  min-height: 100vh;
}

.sidebar-filters {
  width: 280px;
  flex-shrink: 0;
  position: sticky;
  top: 120px;
  height: fit-content;

  .filter-section {
    margin-bottom: 3rem;

    .section-title {
      font-size: 0.7rem;
      color: var(--text-secondary);
      letter-spacing: 0.2em;
      margin-bottom: 1.5rem;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 0.5rem;
    }

    .category-list {
      list-style: none;
      padding: 0;
      li {
        padding: 12px 0;
        cursor: pointer;
        font-size: 0.95rem;
        color: var(--text-main);
        display: flex;
        justify-content: space-between;
        align-items: center;
        transition: all 0.3s;
        border-bottom: 1px solid transparent;

        .count {
          font-size: 0.75rem;
          opacity: 0.3;
          font-family: 'Cormorant Garamond';
        }

        &:hover,
        &.active {
          color: #fff;
          padding-left: 10px;
        }
        &.active {
          border-bottom-color: var(--text-main);
        }
      }
    }
  }

  .date-picker-placeholder {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    input {
      background: transparent;
      border: 1px solid var(--border-color);
      color: #fff;
      padding: 10px;
      font-size: 0.8rem;
      border-radius: 4px;
      outline: none;
      &::-webkit-calendar-picker-indicator {
        filter: invert(1);
      }
    }
    .to {
      font-size: 0.6rem;
      text-align: center;
      opacity: 0.3;
    }
  }
}

.article-list-main {
  flex-grow: 1;
  max-width: 900px;

  .article-grid {
    display: flex;
    flex-direction: column;
    gap: 4rem;
  }

  .article-card {
    cursor: pointer;
    transition: transform 0.3s;
    &:hover {
      transform: translateX(10px);
    }

    .meta {
      font-size: 0.7rem;
      color: var(--text-secondary);
      margin-bottom: 0.8rem;
      letter-spacing: 0.05em;
      .dot {
        margin: 0 8px;
      }
    }

    .title {
      font-size: 2.2rem;
      font-family: 'Cormorant Garamond';
      font-weight: 700;
      margin-bottom: 1.2rem;
      line-height: 1.2;
      color: #fff;
    }

    .summary {
      font-size: 1rem;
      line-height: 1.8;
      color: var(--text-secondary);
      margin-bottom: 1.5rem;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid var(--border-color);
      padding-top: 1.5rem;

      .category-tag {
        font-size: 0.75rem;
        color: var(--text-main);
        margin-right: 1rem;
        opacity: 0.6;
      }
      .clicks {
        font-size: 0.7rem;
        opacity: 0.3;
        letter-spacing: 0.1em;
      }
    }
  }
}

.loading-state,
.skeleton-item {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  .skeleton-item {
    height: 200px;
    background: rgba(255, 255, 255, 0.02);
    border-radius: 8px;
  }
}

.empty-state {
  text-align: center;
  padding: 100px 0;
  opacity: 0.3;
  letter-spacing: 0.2em;
}

.pagination {
  margin-top: 6rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  button {
    background: transparent;
    border: 1px solid var(--border-color);
    color: #fff;
    padding: 10px 20px;
    cursor: pointer;
    font-size: 0.7rem;
    letter-spacing: 0.1em;
    transition: all 0.3s;
    &:hover:not(:disabled) {
      background: #fff;
      color: #000;
    }
    &:disabled {
      opacity: 0.2;
      cursor: not-allowed;
    }
  }
  .page-info {
    font-size: 0.8rem;
    font-family: 'Cormorant Garamond';
  }
}
</style>
