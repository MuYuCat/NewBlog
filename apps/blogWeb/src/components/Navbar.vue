<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { getPinia } from '../store/index';
import { useNavStore } from '../store/nav';
import { useI18n } from '../hooks/useI18n';

const navItems = ref<any[]>([]);
const currentPath = ref('');
const isMoreMenuOpen = ref(false);
const { t } = useI18n();

/**
 * 映射后端/Store返回的中文名称到词库 Key
 */
const getNavName = (name: string) => {
  const keyMap: Record<string, string> = {
    首页: '导航.首页',
    游戏轨迹: '导航.游戏轨迹',
    知识智库: '导航.知识智库',
    资源宝库: '导航.资源宝库',
    更多: '导航.更多',
    归档: '导航.归档',
  };

  const key = keyMap[name];
  // 显式映射，如果不在映射表里，则尝试直接翻译或原样返回
  if (key) return t(key);

  return t(`导航.${name}`);
};

const updatePath = () => {
  currentPath.value = window.location.pathname;
};

onMounted(async () => {
  updatePath();
  document.addEventListener('astro:after-swap', updatePath);

  try {
    const pinia = getPinia();
    const navStore = useNavStore(pinia);

    await navStore.fetchNavData();
    navItems.value = navStore.navItems;
  } catch (err) {
    console.error('[Navbar] Store initialization failed:', err);
  }
});

onUnmounted(() => {
  document.removeEventListener('astro:after-swap', updatePath);
});
</script>

<template>
  <nav class="navbar">
    <div class="nav-list">
      <!-- 动态路由 -->
      <a
        v-for="item in navItems"
        :key="item.path"
        :href="item.path"
        class="nav-item"
        :class="{ active: currentPath === item.path }"
      >
        {{ getNavName(item.name) }}
      </a>

      <!-- “更多”入口 -->
      <div
        class="more-wrapper"
        @mouseenter="isMoreMenuOpen = true"
        @mouseleave="isMoreMenuOpen = false"
      >
        <div class="nav-item more-btn" :class="{ active: currentPath.includes('/archive') }">
          {{ getNavName('更多') }}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="chevron"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>

        <transition name="popover">
          <div v-if="isMoreMenuOpen" class="popover-menu">
            <a href="/archive" class="menu-item" :class="{ active: currentPath === '/archive' }">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M21 8v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8" />
                <path d="M23 3H1v5h22V3z" />
                <path d="M10 12h4" />
              </svg>
              {{ getNavName('归档') }}
            </a>
          </div>
        </transition>
      </div>
    </div>
  </nav>
</template>

<style scoped lang="scss">
.navbar {
  .nav-list {
    display: flex;
    align-items: center;
    gap: 2.5rem;
  }

  .nav-item {
    font-family: 'Noto Serif SC', serif;
    font-size: 0.9375rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    color: var(--text);
    text-decoration: none;
    transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
    position: relative;
    opacity: 0.7;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.4rem;

    &:hover,
    &.active {
      color: var(--text-h);
      opacity: 1;
    }

    &::after {
      content: '';
      position: absolute;
      bottom: -4px;
      left: 0;
      width: 0;
      height: 1.5px;
      background: var(--accent);
      transition: width 0.4s cubic-bezier(0.25, 1, 0.5, 1);
    }

    &:hover::after,
    &.active::after {
      width: 100%;
    }

    &.active {
      color: var(--accent);
    }

    .chevron {
      opacity: 0.5;
      transition: transform 0.3s;
    }
  }

  .more-wrapper {
    position: relative;
    padding-bottom: 4px; // 扩大悬浮桥接区

    &:hover .chevron {
      transform: rotate(180deg);
      opacity: 1;
    }
  }
}

/* Popover Menu 样式 - 统一玻璃磨砂感 */
.popover-menu {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  background: var(--bg);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 6px;
  display: flex;
  flex-direction: column;
  min-width: 140px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  z-index: 100;

  &::before {
    content: '';
    position: absolute;
    top: -12px;
    left: 0;
    right: 0;
    height: 12px;
    background: transparent;
  }

  .menu-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    border-radius: 8px;
    color: var(--text);
    text-decoration: none;
    font-size: 0.85rem;
    font-weight: 500;
    transition: all 0.2s;
    white-space: nowrap;

    &:hover {
      background: var(--accent-bg);
      color: var(--accent);
    }

    &.active {
      background: var(--accent-bg);
      color: var(--accent);
    }
  }
}

/* 动画过渡 */
.popover-enter-active,
.popover-leave-active {
  transition: all 0.25s cubic-bezier(0.25, 1, 0.5, 1);
}
.popover-enter-from,
.popover-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.95);
}

:global(.dark) {
  .popover-menu {
    background: rgba(10, 10, 12, 0.8);
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
  }
}
</style>
