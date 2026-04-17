<script setup lang="ts">
import { ref, onMounted, watch, computed, nextTick } from 'vue';
import { request } from '../../utils/request';
import gsap from 'gsap';

interface Tag {
  id: number;
  name: string;
  color?: string;
}

interface Bookmark {
  id: number;
  url: string;
  title: string;
  description?: string;
  coverUrl?: string;
  clicks: number;
  createdAt: string;
  tags: Tag[];
}

const bookmarks = ref<Bookmark[]>([]);
const tags = ref<Tag[]>([]);
const search = ref('');
const selectedTagIds = ref<number[]>([]);
const sort = ref<'latest' | 'hottest'>('latest');
const isLoading = ref(true);

// 获取资源列表
const fetchBookmarks = async () => {
  isLoading.value = true;
  try {
    const data = await request<Bookmark[]>('/vault/bookmarks', {
      params: {
        search: search.value,
        tagIds: selectedTagIds.value.join(','),
        sort: sort.value,
      },
    } as any);
    bookmarks.value = data;
    // 数据加载后触发动画
    nextTick(() => {
      animateCards();
    });
  } catch (error) {
    console.error('Failed to fetch bookmarks:', error);
  } finally {
    isLoading.value = false;
  }
};

// 获取所有标签
const fetchTags = async () => {
  try {
    const data = await request<Tag[]>('/vault/tags');
    tags.value = data;
  } catch (error) {
    console.error('Failed to fetch tags:', error);
  }
};

// 记录点击
const handleCardClick = async (bookmark: Bookmark) => {
  try {
    await request(`/vault/bookmarks/${bookmark.id}/click`, { method: 'PATCH' });
  } catch (e) {
    // 忽略点击记录失败
  }
};

// 动画逻辑
const animateCards = () => {
  gsap.from('.vault-card', {
    y: 30,
    opacity: 0,
    duration: 0.8,
    stagger: 0.1,
    ease: 'power3.out',
    overwrite: true,
  });
};

const toggleTag = (tagId: number) => {
  const index = selectedTagIds.value.indexOf(tagId);
  if (index > -1) {
    selectedTagIds.value.splice(index, 1);
  } else {
    selectedTagIds.value.push(tagId);
  }
};

// 监听筛选变化
watch(
  [search, selectedTagIds, sort],
  () => {
    fetchBookmarks();
  },
  { deep: true },
);

onMounted(() => {
  fetchTags();
  fetchBookmarks();
});

// 格式化日期
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// 提取域名
const getDomain = (url: string) => {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch (e) {
    return 'link';
  }
};

// 获取首字母
const getFirstLetter = (url: string) => {
  const domain = getDomain(url);
  return domain.charAt(0).toUpperCase();
};

// 根据字符串生成高奢黑白灰阶渐变
const getPlaceholderStyle = (str: string) => {
  const colors = [
    ['#f9fafb', '#f3f4f6'], // Slate 50 -> 100
    ['#f3f4f6', '#e5e7eb'], // Slate 100 -> 200
    ['#e5e7eb', '#d1d5db'], // Slate 200 -> 300
    ['#f8f9fa', '#e9ecef'], // Gray 50 -> 100
    ['#ffffff', '#f1f1f1'], // Pure White -> Off White
    ['#e9ecef', '#dee2e6'], // Gray 100 -> 200
  ];
  // 简单的 hash
  const hash = str.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = Math.abs(hash) % colors.length;
  const [c1, c2] = colors[index];
  return {
    background: `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`,
  };
};
</script>

<template>
  <div class="vault-container">
    <!-- Header Section -->
    <header class="vault-header">
      <h1 class="vault-title">资源宝库 / Vault</h1>
      <p class="vault-subtitle">收藏灵感、工具与跨领域的知识片段</p>
    </header>

    <!-- Filter Bar -->
    <div class="filter-wrapper">
      <div class="search-bar">
        <div class="search-input-group">
          <input
            v-model="search"
            type="text"
            placeholder="搜索资源、描述或链接..."
            class="luxury-input"
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
          v-for="tag in tags"
          :key="tag.id"
          :class="['tag-chip', { active: selectedTagIds.includes(tag.id) }]"
          @click="toggleTag(tag.id)"
        >
          # {{ tag.name }}
        </button>
      </div>
    </div>

    <!-- Bento Grid Content -->
    <div v-if="!isLoading" class="bento-grid">
      <a
        v-for="(item, index) in bookmarks"
        :key="item.id"
        :href="item.url"
        target="_blank"
        class="vault-card"
        :class="{ 'card-wide': index % 5 === 0 }"
        @click="handleCardClick(item)"
      >
        <div class="card-glass">
          <!-- 宽卡片的左侧封面 -->
          <div v-if="index % 5 === 0" class="card-side-cover">
            <img v-if="item.coverUrl" :src="item.coverUrl" :alt="item.title" loading="lazy" />
            <div v-else class="cover-placeholder" :style="getPlaceholderStyle(item.url)">
              <span class="monogram">{{ getFirstLetter(item.url) }}</span>
            </div>
          </div>

          <!-- 主内容区 -->
          <div class="card-main-content">
            <div class="card-body-top">
              <div class="card-meta-header">
                <span class="source-badge">{{ getDomain(item.url) }}</span>
              </div>

              <h2 class="card-title">{{ item.title }}</h2>
              <p class="card-desc">{{ item.description || '探索更多细节...' }}</p>
            </div>

            <div class="card-body-bottom">
              <div class="card-tags-list">
                <span v-for="tag in item.tags.slice(0, 2)" :key="tag.id" class="mini-tag">
                  {{ tag.name }}
                </span>
                <span v-if="item.tags.length > 2" class="tag-more"
                  >+{{ item.tags.length - 2 }}</span
                >
              </div>

              <div class="card-footer">
                <span class="card-date">{{ formatDate(item.createdAt) }}</span>
                <span class="card-clicks">
                  <svg viewBox="0 0 24 24" class="icon">
                    <path
                      d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
                    />
                  </svg>
                  {{ item.clicks }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </a>
    </div>

    <!-- Loading State -->
    <div v-else class="vault-loading">
      <div class="skeleton-grid">
        <div v-for="i in 8" :key="i" class="skeleton-card"></div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!isLoading && bookmarks.length === 0" class="vault-empty">
      <p>未找到相关资源，尝试换个关键词？</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.vault-container {
  padding: 6rem 2rem 4rem;
  width: 1200px;
  max-width: 100%;
  margin: 0 auto;
  min-height: 100vh;
}

.vault-header {
  text-align: center;
  margin-bottom: 4rem;

  .vault-title {
    font-size: 3.5rem;
    font-family: var(--heading);
    color: var(--text-h);
    margin-bottom: 1rem;
    font-weight: 500;
  }

  .vault-subtitle {
    font-size: 1.1rem;
    color: var(--text);
    letter-spacing: 0.1em;
    opacity: 0.8;
  }
}

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
  background: var(--accent-bg);
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
        opacity: 0.5;
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
    padding: 0.3rem 0.8rem;
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

/* Bento Grid */
.bento-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: 280px;
  gap: 1.5rem;
}

.vault-card {
  grid-column: span 1;
  grid-row: span 1;
  text-decoration: none;
  border-radius: 32px;
  overflow: hidden;
  transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);

  &.card-wide {
    grid-column: span 2;
    grid-row: span 1;
  }

  &:hover {
    transform: translateY(-8px);
    .card-glass {
      background: var(--accent-bg);
      border-color: var(--accent-border);
      box-shadow: 0 40px 80px rgba(0, 0, 0, 0.15);
    }
    .card-side-cover img {
      transform: scale(1.1);
    }
    .source-badge {
      background: var(--accent);
      color: #fff;
    }
  }
}

.card-glass {
  height: 100%;
  background: var(--bg);
  border: 1px solid var(--border);
  display: flex;
  position: relative;
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
}

/* 侧边封面（宽卡片专用） */
.card-side-cover {
  width: 35%;
  height: 100%;
  flex-shrink: 0;
  overflow: hidden;
  border-right: 1px solid var(--border);
  position: relative;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 1s;
  }

  .cover-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.4), transparent);
    }

    .monogram {
      font-family: var(--heading);
      font-size: 5rem;
      font-weight: 300;
      color: var(--text-h);
      opacity: 0.15;
      letter-spacing: -0.05em;
      user-select: none;
      filter: blur(0.5px);
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.05);
    }
  }
}

.card-main-content {
  flex-grow: 1;
  padding: 1.8rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0; /* 关键：防止 Flex 溢出 */
}

.card-meta-header {
  margin-bottom: 0.8rem;
}

.source-badge {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 4px 10px;
  background: var(--code-bg);
  color: var(--text);
  border-radius: 4px;
}

.card-title {
  font-family: var(--heading);
  font-size: 1.5rem;
  line-height: 1.2;
  color: var(--text-h);
  margin-bottom: 0.6rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-desc {
  font-size: 0.95rem;
  color: var(--text);
  line-height: 1.6;
  opacity: 0.8;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-tags-list {
  display: flex;
  gap: 0.4rem;
  margin-bottom: 1rem;
  flex-wrap: nowrap; /* 强制不换行，确保整洁 */
  overflow: hidden;

  .mini-tag {
    font-size: 0.7rem;
    color: var(--accent);
    padding: 2px 0;
    font-weight: 500;
    &::before {
      content: '#';
      opacity: 0.5;
    }
  }

  .tag-more {
    font-size: 0.65rem;
    color: var(--text);
    opacity: 0.5;
    padding-top: 2px;
  }
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  color: var(--text);
  opacity: 0.6;
  border-top: 1px solid var(--border);
  padding-top: 1rem;
  margin-top: auto; /* 关键：将页脚推至底部 */

  .card-clicks {
    display: flex;
    align-items: center;
    gap: 4px;
    .icon {
      width: 14px;
      height: 14px;
      fill: currentColor;
    }
  }
}

/* Loading Skeleton */
.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
}
.skeleton-card {
  height: 200px;
  background: var(--border);
  border-radius: 24px;
  animation: pulse 1.5s infinite ease-in-out;
}
@keyframes pulse {
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 0.3;
  }
  100% {
    opacity: 0.6;
  }
}

.vault-empty {
  text-align: center;
  padding: 4rem;
  color: var(--text);
  font-style: italic;
}

@media (max-width: 1024px) {
  .bento-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
