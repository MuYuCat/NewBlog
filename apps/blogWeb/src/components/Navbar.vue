<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { getPinia } from '../store/index';
import { useNavStore, type NavItem } from '../store/nav';
import { useI18n } from '../hooks/useI18n';

const navItems = ref<NavItem[]>([]);
const currentPath = ref('');
const activeDropdownId = ref<number | null>(null);
const { t, lang } = useI18n();

/**
 * 极简翻译逻辑：
 * 中文模式 (zh) -> 直接取后台填写的中文名 (item.name)
 * 英文模式 (en) -> 取后台填写的英文标识 (item.i18nKey)，若为空则回退到 name
 */
const getLabel = (item: NavItem) => {
  if (lang.value === 'zh') {
    return item.name;
  }
  return item.i18nKey || item.name;
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
      <div
        v-for="item in navItems"
        :key="item.id"
        class="nav-wrapper"
        @mouseenter="activeDropdownId = item.id"
        @mouseleave="activeDropdownId = null"
      >
        <!-- 一级菜单 -->
        <a
          :href="item.path"
          class="nav-item"
          :class="{
            active: currentPath === item.path || item.children?.some((c) => c.path === currentPath),
          }"
          :target="item.type === 2 ? '_blank' : '_self'"
        >
          {{ getLabel(item) }}
          <svg
            v-if="item.children?.length"
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
        </a>

        <!-- 二级下拉菜单 -->
        <transition name="popover">
          <div v-if="item.children?.length && activeDropdownId === item.id" class="popover-menu">
            <a
              v-for="child in item.children"
              :key="child.id"
              :href="child.path"
              class="menu-item"
              :class="{ active: currentPath === child.path }"
              :target="child.type === 2 ? '_blank' : '_self'"
            >
              {{ getLabel(child) }}
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

  .nav-wrapper {
    position: relative;
    padding-bottom: 4px;
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

  .nav-wrapper:hover .chevron {
    transform: rotate(180deg);
    opacity: 1;
  }
}

.popover-menu {
  position: absolute;
  top: calc(100% + 12px);
  left: 50%;
  transform: translateX(-50%);
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

.popover-enter-active,
.popover-leave-active {
  transition: all 0.25s cubic-bezier(0.25, 1, 0.5, 1);
}
.popover-enter-from,
.popover-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(10px) scale(0.95);
}

:global(.dark) {
  .popover-menu {
    background: rgba(10, 10, 12, 0.8);
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
  }
}
</style>
