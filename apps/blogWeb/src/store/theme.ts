import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useThemeStore = defineStore('theme', () => {
  // 核心状态：初始化时优先从 localStorage 或系统偏好读取
  const theme = ref<'light' | 'dark'>('light');

  // 1. 初始化逻辑 (用于 Vue 挂载后的二次同步)
  const initTheme = () => {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('theme');
      if (stored === 'dark' || stored === 'light') {
        theme.value = stored as 'light' | 'dark';
      } else {
        // 无存储时，参考系统偏好
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        theme.value = isDark ? 'dark' : 'light';
      }
    }
    applyThemeToDOM();
  };

  // 2. 切换主题
  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light';
    applyThemeToDOM();
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('theme', theme.value);
    }
  };

  // 3. 将状态同步到 DOM (html 标签)
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

  return {
    theme,
    toggleTheme,
    initTheme,
    applyThemeToDOM,
  };
});
