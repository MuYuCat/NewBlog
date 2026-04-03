import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useThemeStore = defineStore('theme', () => {
  // 核心状态：'light' | 'dark'
  const theme = ref<'light' | 'dark'>('light');

  // 1. 切换主题
  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light';
    applyThemeToDOM();
  };

  // 2. 将状态同步到 DOM (html 标签)
  const applyThemeToDOM = () => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (theme.value === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.add('light');
        root.classList.remove('dark');
      }
    }
  };

  // 3. 初始化逻辑
  const initTheme = () => {
    // 强制执行一次同步，确保当前 DOM 匹配 Store 状态
    applyThemeToDOM();
  };

  return {
    theme,
    toggleTheme,
    initTheme,
    applyThemeToDOM,
  };
});
