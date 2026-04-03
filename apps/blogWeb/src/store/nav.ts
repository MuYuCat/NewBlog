import { defineStore } from 'pinia';
import { ref } from 'vue';

interface NavItem {
  name: string;
  path: string;
}

export const useNavStore = defineStore('nav', () => {
  const navItems = ref<NavItem[]>([]);
  const isLoaded = ref(false);

  const fetchNavData = async () => {
    // 如果已经加载过，且不是强制刷新，则直接返回缓存
    if (isLoaded.value && navItems.value.length > 0) return;

    try {
      // 模拟 API 调用
      const mockData: NavItem[] = [
        { name: '首页', path: '/' },
        { name: '游戏轨迹', path: '/games' },
        { name: '知识智库', path: '/docs' },
        { name: '资源宝库', path: '/resources' },
        { name: '关于我', path: '/about' },
      ];

      navItems.value = mockData;
      isLoaded.value = true;
      console.log('Nav data fetched from API and cached in Pinia.');
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
