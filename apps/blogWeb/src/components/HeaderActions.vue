<template>
  <div class="header-actions">
    <!-- 搜索按钮 -->
    <button class="action-btn" :title="t('页头.搜索')">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
    </button>

    <!-- 语言切换 -->
    <div
      class="menu-wrapper"
      @mouseenter="isLangMenuOpen = true"
      @mouseleave="isLangMenuOpen = false"
    >
      <button class="action-btn" :class="{ active: isLangMenuOpen }">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a14.5 14.5 0 0 0 0 20" />
          <path d="M2 12h20" />
          <path d="M12 2a14.5 14.5 0 0 1 0 20" />
        </svg>
      </button>
      <transition name="popover">
        <div v-if="isLangMenuOpen" class="popover-menu">
          <button @click="setLang('zh')" :class="{ active: lang === 'zh' }">简体中文</button>
          <button @click="setLang('en')" :class="{ active: lang === 'en' }">English</button>
        </div>
      </transition>
    </div>

    <!-- 主题切换 (Capsule Switch - Resized for consistency) -->
    <div class="theme-switch-container">
      <div
        class="theme-toggle-track"
        @click="toggleTheme"
        role="button"
        tabindex="0"
        :aria-label="theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'"
        @keydown="onKeydown"
      >
        <div class="theme-toggle-ball" :class="theme"></div>
        <div class="icon-wrapper">
          <div class="icon-item" :class="{ active: theme === 'light' }">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              stroke-width="2.5"
              stroke="currentColor"
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="4"></circle>
              <path
                d="M3 12h1m8 -9v1m8 8h1m-9 8v1m-6.4 -15.4l.7 .7m12.1 -.7l-.7 .7m0 11.4l.7 .7m-12.1 -.7l-.7 .7"
              ></path>
            </svg>
          </div>
          <div class="icon-item" :class="{ active: theme === 'dark' }">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              stroke-width="2.5"
              stroke="currentColor"
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z"
              ></path>
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { getPinia } from '../store/index';
import { useThemeStore } from '../store/theme';
import { useLangStore, type Lang } from '../store/lang';
import { useI18n } from '../hooks/useI18n';

const pinia = getPinia();
const themeStore = useThemeStore(pinia);
const langStore = useLangStore(pinia);
const { theme } = storeToRefs(themeStore);
const { lang } = storeToRefs(langStore);
const { t } = useI18n();

const isLangMenuOpen = ref(false);

const toggleTheme = () => {
  themeStore.toggleTheme();
};

const setLang = (val: Lang) => {
  langStore.setLang(val);
  isLangMenuOpen.value = false;
};

const handleAfterSwap = () => {
  themeStore.applyThemeToDOM();
};

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    toggleTheme();
  }
};

onMounted(() => {
  themeStore.initTheme();
  document.addEventListener('astro:after-swap', handleAfterSwap);
});

onUnmounted(() => {
  document.removeEventListener('astro:after-swap', handleAfterSwap);
});
</script>

<style scoped lang="scss">
.header-actions {
  display: flex;
  align-items: center;
  gap: 1.5rem; // 增加间距使整体更舒展

  .action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    border-radius: 12px;
    color: var(--text-h);
    transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
    background: transparent;
    border: none;
    cursor: pointer;

    &:hover,
    &.active {
      background: var(--accent-bg);
      color: var(--accent);
    }

    svg {
      opacity: 0.8;
    }
  }
}

.menu-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

/* 主题开关 - 尺寸调整以匹配前两个图标 */
.theme-switch-container {
  display: flex;
  align-items: center;
}

.theme-toggle-track {
  width: 64px; // 调大轨道
  height: 32px; // 调大高度
  background-color: var(--border);
  display: flex;
  border-radius: 30px;
  align-items: center;
  position: relative;
  cursor: pointer;
  transition: background-color 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-sizing: border-box;
  outline: none;

  &:focus-visible {
    box-shadow: 0 0 0 2px var(--accent);
  }

  &:hover {
    filter: brightness(0.95);
  }
}

.icon-wrapper {
  position: absolute;
  inset: 0;
  display: flex;
  z-index: 2;
  pointer-events: none;

  .icon-item {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text);
    opacity: 0.4;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

    &.active {
      opacity: 1;
      color: var(--text-h);
      transform: scale(1.1);
    }

    svg {
      // 保持与前两个按钮内部图标尺寸协调
      width: 16px;
      height: 16px;
    }
  }
}

.theme-toggle-ball {
  background-color: var(--bg);
  width: 28px; // 相应调大小球
  height: 28px;
  position: absolute;
  border-radius: 50%;
  top: 2px;
  left: 2px;
  transition:
    transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
    background-color 0.4s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  z-index: 1;

  &.dark {
    // 64 (track) - 2 (left) - 28 (ball) - 2 (right) = 32px travel
    transform: translateX(32px);
  }
}

/* 统一菜单样式 */
.popover-menu {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  background: var(--bg);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 120px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  z-index: 10;

  &::before {
    content: '';
    position: absolute;
    top: -12px;
    left: 0;
    right: 0;
    height: 12px;
    background: transparent;
  }

  button {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    border-radius: 8px;
    border: none;
    background: transparent;
    color: var(--text);
    font-size: 0.8rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;

    svg {
      opacity: 0.6;
      width: 14px;
      height: 14px;
    }

    &:hover {
      background: rgba(0, 0, 0, 0.04);
      color: var(--text-h);
    }

    &.active {
      background: var(--accent-bg);
      color: var(--accent);
      svg {
        opacity: 1;
        color: var(--accent);
      }
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

/* 暗色模式适配 */
:global(.dark) {
  .theme-toggle-track {
    background-color: #2c2c2e;
  }
  .theme-toggle-ball {
    background-color: #636366;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  }
  .action-btn:hover,
  .action-btn.active {
    background: rgba(255, 255, 255, 0.1);
  }
  .popover-menu button:hover {
    background: rgba(255, 255, 255, 0.08);
  }
}
</style>
