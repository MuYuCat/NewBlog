import { defineStore } from 'pinia';
import { ref } from 'vue';

export type Lang = 'zh' | 'en';

export const useLangStore = defineStore('lang', () => {
  const lang = ref<Lang>('zh');

  const setLang = (newLang: Lang) => {
    lang.value = newLang;
    // 这里可以扩展为：同步修改 html[lang] 属性或保存到偏好设置
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('lang', newLang === 'zh' ? 'zh-CN' : 'en');
    }
  };

  const toggleLang = () => {
    setLang(lang.value === 'zh' ? 'en' : 'zh');
  };

  return {
    lang,
    setLang,
    toggleLang,
  };
});
