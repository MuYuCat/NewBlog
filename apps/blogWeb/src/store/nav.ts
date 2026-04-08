import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface NavItem {
  id: number;
  name: string;
  path: string;
  i18nKey?: string;
  order: number;
  type: number; // 1: 内部, 2: 外部
  children?: NavItem[];
}

export const useNavStore = defineStore('nav', () => {
  const navItems = ref<NavItem[]>([]);
  const isLoaded = ref(false);

  const fetchNavData = async () => {
    if (isLoaded.value && navItems.value.length > 0) return;

    try {
      // 对接真实 API
      const response = await fetch('/api/public-menu/tree');
      const resData = await response.json();

      if (resData.code === 200) {
        navItems.value = resData.data;
        isLoaded.value = true;
      }
    } catch (error) {
      console.error('Failed to fetch nav data:', error);
    }
  };

  return {
    navItems,
    isLoaded,
    fetchNavData,
  };
});
