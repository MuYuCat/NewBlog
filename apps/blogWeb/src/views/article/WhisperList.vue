<template>
  <div class="whisper-hub-container">
    <header class="whisper-header">
      <h1 class="page-title">喃喃自语</h1>
      <p class="subtitle">Whispers from the digital wilderness.</p>
    </header>

    <div class="whisper-timeline">
      <div v-if="loading" class="loading-state">
        <div v-for="i in 3" :key="i" class="skeleton-whisper"></div>
      </div>

      <div v-else-if="articles.length === 0" class="empty-state">
        <p>THE SILENCE IS DEAFENING.</p>
      </div>

      <div v-else class="whisper-list">
        <div v-for="article in articles" :key="article.id" class="whisper-item">
          <div class="whisper-date">
            <span class="day">{{ getDay(article.createdAt) }}</span>
            <span class="month">{{ getMonth(article.createdAt) }}</span>
          </div>

          <div class="whisper-content-card">
            <div class="whisper-meta" v-if="article.mood || article.location">
              <span v-if="article.mood" class="mood">Mood: {{ article.mood }}</span>
              <span v-if="article.location" class="location">@ {{ article.location }}</span>
            </div>

            <h2 v-if="article.title" class="whisper-title">{{ article.title }}</h2>

            <div class="whisper-body" v-html="article.content"></div>

            <footer class="whisper-footer">
              <div class="tags">
                <span v-for="cat in article.categories" :key="cat.id" class="tag">
                  #{{ cat.name }}
                </span>
              </div>
              <div class="time">{{ formatTime(article.createdAt) }}</div>
            </footer>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="total > limit" class="pagination-simple">
      <button :disabled="page === 1" @click="changePage(page - 1)">Earlier</button>
      <button :disabled="page >= Math.ceil(total / limit)" @click="changePage(page + 1)">
        Later
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { request } from '../../utils/request';

const articles = ref<any[]>([]);
const total = ref(0);
const loading = ref(true);
const page = ref(1);
const limit = ref(10);

const fetchArticles = async () => {
  loading.value = true;
  try {
    const res = await request.get('/article', {
      params: {
        page: page.value,
        limit: limit.value,
        mode: 2, // 强制心语模式
      },
    });
    articles.value = res.items;
    total.value = res.total;
  } catch (e) {
    console.error('Fetch whispers failed', e);
  } finally {
    loading.value = false;
  }
};

const changePage = (p: number) => {
  page.value = p;
  window.scrollTo({ top: 0, behavior: 'smooth' });
  fetchArticles();
};

const getDay = (date: string) => new Date(date).getDate();
const getMonth = (date: string) =>
  new Date(date).toLocaleString('en-US', { month: 'short' }).toUpperCase();
const formatTime = (date: string) =>
  new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

onMounted(() => {
  fetchArticles();
});
</script>

<style scoped lang="scss">
.whisper-hub-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 120px 20px;
  min-height: 100vh;
}

.whisper-header {
  text-align: center;
  margin-bottom: 5rem;
  .page-title {
    font-size: 3rem;
    font-family: 'Cormorant Garamond';
    font-weight: 700;
    margin-bottom: 1rem;
    color: #fff;
  }
  .subtitle {
    font-size: 0.8rem;
    color: var(--text-secondary);
    letter-spacing: 0.3em;
    text-transform: uppercase;
  }
}

.whisper-timeline {
  position: relative;
  &::before {
    content: '';
    position: absolute;
    left: 70px;
    top: 0;
    bottom: 0;
    width: 1px;
    background: linear-gradient(
      to bottom,
      transparent,
      var(--border-color) 10%,
      var(--border-color) 90%,
      transparent
    );
  }
}

.whisper-item {
  display: flex;
  gap: 40px;
  margin-bottom: 6rem;
  position: relative;

  .whisper-date {
    width: 60px;
    flex-shrink: 0;
    text-align: right;
    display: flex;
    flex-direction: column;
    padding-top: 10px;

    .day {
      font-size: 2rem;
      font-weight: 800;
      font-family: 'Cormorant Garamond';
      line-height: 1;
      color: #fff;
    }
    .month {
      font-size: 0.7rem;
      opacity: 0.4;
      letter-spacing: 0.1em;
    }
  }

  .whisper-content-card {
    flex-grow: 1;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid var(--border-color);
    border-radius: 24px;
    padding: 2.5rem;
    backdrop-filter: blur(10px);
    transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);

    &:hover {
      background: rgba(255, 255, 255, 0.04);
      transform: translateY(-5px);
      border-color: rgba(255, 255, 255, 0.2);
    }

    .whisper-meta {
      display: flex;
      gap: 1.5rem;
      font-size: 0.7rem;
      color: var(--text-secondary);
      margin-bottom: 1.5rem;
      opacity: 0.6;
      font-style: italic;
    }

    .whisper-title {
      font-size: 1.4rem;
      margin-bottom: 1.5rem;
      color: #fff;
      font-family: 'Cormorant Garamond';
    }

    .whisper-body {
      font-size: 1.05rem;
      line-height: 1.8;
      color: var(--text-main);
      margin-bottom: 2rem;

      :deep(p) {
        margin-bottom: 1.2rem;
      }
      :deep(img) {
        max-width: 100%;
        border-radius: 12px;
        margin: 1rem 0;
      }
    }

    .whisper-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 1.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.05);

      .tag {
        font-size: 0.7rem;
        color: var(--text-secondary);
        margin-right: 10px;
        opacity: 0.5;
      }
      .time {
        font-size: 0.7rem;
        opacity: 0.3;
      }
    }
  }
}

.pagination-simple {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 4rem;
  button {
    background: transparent;
    border: none;
    color: #fff;
    cursor: pointer;
    font-size: 0.8rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    opacity: 0.4;
    transition: opacity 0.3s;
    &:hover:not(:disabled) {
      opacity: 1;
    }
    &:disabled {
      opacity: 0.1;
      cursor: not-allowed;
    }
  }
}

.skeleton-whisper {
  height: 250px;
  background: rgba(255, 255, 255, 0.02);
  margin-bottom: 40px;
  border-radius: 24px;
}
</style>
