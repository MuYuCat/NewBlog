<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { getPinia } from '../store/index';
import { useNavStore } from '../store/nav';
import { useI18n } from '../hooks/useI18n';

const navItems = ref<any[]>([]);
const currentPath = ref('');
const { t } = useI18n();

/**
 * 映射后端/Store返回的中文名称到词库 Key
 */
const getNavName = (name: string) => {
  // 统一映射表，确保 100% 命中
  const keyMap: Record<string, string> = {
    首页: '导航.首页',
    游戏轨迹: '导航.游戏轨迹',
    知识智库: '导航.知识智库',
    资源宝库: '导航.资源宝库',
    关于我: '导航.关于我',
  };

  const key = keyMap[name];
  if (key) {
    return t(key);
  }

  // 如果没在映射表里，尝试作为子路径查找
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
      <a
        v-for="item in navItems"
        :key="item.path"
        :href="item.path"
        class="nav-item"
        :class="{ active: currentPath === item.path }"
      >
        {{ getNavName(item.name) }}
      </a>
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
    font-size: 0.875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: var(--text);
    text-decoration: none;
    transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
    position: relative;
    opacity: 0.7;

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
      background: var(--text-h);
      transition: width 0.4s cubic-bezier(0.25, 1, 0.5, 1);
    }

    &:hover::after,
    &.active::after {
      width: 100%;
    }
  }
}
</style>
