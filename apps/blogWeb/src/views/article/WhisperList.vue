<template>
  <div class="whisper-hub-container">
    <!-- 头部标题：对齐 Vault 样式 -->
    <header class="whisper-hero">
      <div class="hero-content">
        <h1 class="page-title">喃喃自语 / Whispers</h1>
        <div class="hero-divider"></div>
        <p class="subtitle">A digital collection of silence, thoughts, and fleeting moments.</p>
      </div>
    </header>

    <!-- 筛选与排序 -->
    <div class="whisper-controls">
      <div class="search-capsule">
        <input v-model="search" type="text" placeholder="搜索意识碎片..." @input="debouncedFetch" />
      </div>
      <div class="sort-options">
        <button :class="{ active: sort === 'latest' }" @click="sort = 'latest'">最新发布</button>
        <button :class="{ active: sort === 'hottest' }" @click="sort = 'hottest'">最热共鸣</button>
      </div>
    </div>

    <!-- 瀑布流布局 -->
    <div class="whisper-masonry-wrapper">
      <div v-if="loading" class="loading-waterfall">
        <div v-for="i in 3" :key="i" class="column">
          <div
            v-for="j in 2"
            :key="j"
            class="skeleton-whisper"
            :style="{ height: [200, 300][j % 2] + 'px' }"
          ></div>
        </div>
      </div>

      <div v-else-if="articles.length === 0" class="empty-state">
        <p>万籁俱寂，尚未发现任何碎语。</p>
      </div>

      <div v-else class="whisper-masonry">
        <div v-for="(column, colIndex) in masonryColumns" :key="colIndex" class="whisper-column">
          <div
            v-for="article in column"
            :key="article.id"
            class="whisper-card"
            @click="goToDetail(article.id)"
          >
            <div class="card-date">
              <span class="day">{{ getDay(article.createdAt) }}</span>
              <span class="month">{{ getMonth(article.createdAt) }}</span>
            </div>

            <div class="card-body">
              <div class="meta-row" v-if="article.mood || article.location">
                <span v-if="article.mood" class="mood-tag">#{{ article.mood }}</span>
                <span v-if="article.location" class="location-tag">@{{ article.location }}</span>
              </div>
              <h2 v-if="article.title" class="whisper-title">{{ article.title }}</h2>
              <div class="whisper-text" v-html="truncateContent(article.content)"></div>
            </div>

            <footer class="card-footer">
              <div class="tags">
                <span v-for="cat in article.categories" :key="cat.id" class="cat-dot">{{
                  cat.name
                }}</span>
              </div>
              <div class="interaction">
                <span class="views">{{ article.clicks }} 次浏览</span>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="total > limit" class="pagination-simple">
      <button :disabled="page === 1" @click="changePage(page - 1)" class="nav-arrow">← 往昔</button>
      <div class="page-current">{{ page }}</div>
      <button
        :disabled="page >= Math.ceil(total / limit)"
        @click="changePage(page + 1)"
        class="nav-arrow"
      >
        今朝 →
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick, watch } from 'vue';
import { request } from '../../utils/request';
import gsap from 'gsap';

const articles = ref<any[]>([]);
const total = ref(0);
const loading = ref(true);
const page = ref(1);
const limit = ref(15);
const search = ref('');
const sort = ref<'latest' | 'hottest'>('latest');

const masonryColumns = computed(() => {
  const cols: any[][] = [[], [], []];
  articles.value.forEach((article, index) => {
    cols[index % 3].push(article);
  });
  return cols;
});

const fetchArticles = async () => {
  loading.value = true;
  try {
    const res = await request('/article', {
      params: {
        page: page.value,
        limit: limit.value,
        mode: 2, // 强制心语模式
        sort: sort.value,
        search: search.value,
      },
    });
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
  timer = setTimeout(fetchArticles, 500);
};

watch([sort], fetchArticles);

const animateCards = () => {
  gsap.from('.whisper-card', { y: 40, opacity: 0, duration: 1, stagger: 0.1, ease: 'power4.out' });
};

const changePage = (p: number) => {
  page.value = p;
  window.scrollTo({ top: 0, behavior: 'smooth' });
  fetchArticles();
};

const goToDetail = (id: number) => {
  window.location.href = `/post?id=${id}`;
};
const getDay = (date: string) => new Date(date).getDate();
const getMonth = (date: string) =>
  new Date(date).toLocaleString('en-US', { month: 'short' }).toUpperCase();
const truncateContent = (content: string) => {
  const text = content?.replace(/<[^>]*>/g, '') || '';
  return text.length > 150 ? text.slice(0, 150) + '...' : text;
};

onMounted(() => {
  fetchArticles();
  gsap.from('.hero-content', { y: -20, opacity: 0, duration: 1.2, ease: 'expo.out' });
});
</script>

<style scoped lang="scss">
.whisper-hub-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 8rem 40px 100px;
  min-height: 100vh;
}

.whisper-hero {
  text-align: center;
  margin-bottom: 4rem;
  .page-title {
    font-size: 3.5rem;
    font-family: var(--heading);
    color: var(--text-h);
    margin-bottom: 1rem;
    font-weight: 500;
  }
  .hero-divider {
    width: 60px;
    height: 1px;
    background: var(--accent);
    margin: 0 auto 2rem;
    opacity: 0.2;
  }
  .subtitle {
    font-size: 0.75rem;
    color: var(--text);
    opacity: 0.5;
    letter-spacing: 0.3em;
    text-transform: uppercase;
  }
}

.whisper-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 6rem;
  .search-capsule {
    width: 100%;
    max-width: 600px;
    input {
      width: 100%;
      background: var(--accent-bg);
      border: 1px solid var(--accent-border);
      color: var(--text-h);
      padding: 14px 24px;
      border-radius: 100px;
      outline: none;
      font-size: 0.9rem;
      backdrop-filter: blur(10px);
      &:focus {
        border-color: var(--accent);
      }
    }
  }
  .sort-options {
    display: flex;
    gap: 1rem;
    button {
      background: transparent;
      border: 1px solid var(--border);
      color: var(--text);
      padding: 8px 20px;
      border-radius: 50px;
      cursor: pointer;
      font-size: 0.8rem;
      transition: all 0.3s;
      &.active {
        background: var(--accent);
        color: var(--bg);
        border-color: var(--accent);
        box-shadow: var(--shadow);
      }
    }
  }
}

.whisper-masonry {
  display: flex;
  gap: 2.5rem;
  align-items: flex-start;
  .whisper-column {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2.5rem;
  }
}

.whisper-card {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 28px;
  padding: 2.5rem;
  cursor: pointer;
  transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
  position: relative;
  overflow: hidden;
  &:hover {
    border-color: var(--accent);
    transform: translateY(-8px);
    box-shadow: var(--shadow);
  }
  .card-date {
    position: absolute;
    top: 2rem;
    right: 2.5rem;
    text-align: right;
    .day {
      font-size: 2.4rem;
      font-family: var(--heading);
      font-weight: 700;
      line-height: 1;
      color: var(--accent);
    }
    .month {
      font-size: 0.65rem;
      opacity: 0.4;
      letter-spacing: 0.15em;
    }
  }
  .card-body {
    padding-top: 1rem;
    .meta-row {
      display: flex;
      gap: 12px;
      font-size: 0.7rem;
      margin-bottom: 1.5rem;
      font-family: var(--mono);
      opacity: 0.4;
      font-style: italic;
    }
    .whisper-title {
      font-size: 1.3rem;
      margin-bottom: 1.2rem;
      color: var(--text-h);
      font-family: var(--heading);
      line-height: 1.4;
      padding-right: 4rem;
    }
    .whisper-text {
      font-size: 0.95rem;
      line-height: 1.9;
      color: var(--text);
      opacity: 0.8;
    }
  }
  .card-footer {
    margin-top: 2.5rem;
    padding-top: 1.5rem;
    border-top: 1px dashed var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;
    .tags {
      display: flex;
      gap: 12px;
      .cat-dot {
        font-size: 0.65rem;
        color: var(--accent);
        opacity: 0.5;
        display: flex;
        align-items: center;
        &::before {
          content: '';
          width: 4px;
          height: 4px;
          background: currentColor;
          border-radius: 50%;
          margin-right: 6px;
        }
      }
    }
    .interaction .views {
      font-size: 0.65rem;
      opacity: 0.25;
      font-family: var(--mono);
    }
  }
}

.pagination-simple {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 3rem;
  margin-top: 8rem;
  .nav-arrow {
    background: transparent;
    border: none;
    color: var(--text-h);
    cursor: pointer;
    font-size: 0.75rem;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    opacity: 0.4;
    transition: 0.3s;
    &:hover:not(:disabled) {
      opacity: 1;
      color: var(--accent);
    }
  }
  .page-current {
    font-size: 1.8rem;
    font-family: var(--heading);
    font-weight: 700;
    color: var(--accent);
  }
}

.loading-waterfall {
  display: flex;
  gap: 2.5rem;
  .column {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2.5rem;
  }
  .skeleton-whisper {
    background: var(--border);
    border-radius: 28px;
  }
}
.empty-state {
  text-align: center;
  padding: 120px 0;
  p {
    font-size: 0.8rem;
    opacity: 0.3;
    letter-spacing: 0.2em;
  }
}
</style>
