import { computed } from 'vue';
import { getPinia } from '../store/index';
import { useLangStore } from '../store/lang';
import zh from '../locales/zh';
import en from '../locales/en';

const locales = { zh, en };

export function useI18n() {
  const pinia = getPinia();
  const langStore = useLangStore(pinia);

  /**
   * 翻译函数
   * @param path 路径，如 '页头.搜索'
   * @returns 响应式的翻译字符串
   */
  const t = (path: string) => {
    return computed(() => {
      const keys = path.split('.');
      let result: any = locales[langStore.lang];

      for (const key of keys) {
        if (result && result[key]) {
          result = result[key];
        } else {
          return path; // 如果未找到，则返回原始路径
        }
      }
      return result;
    }).value;
  };

  return {
    t,
    lang: computed(() => langStore.lang),
  };
}
