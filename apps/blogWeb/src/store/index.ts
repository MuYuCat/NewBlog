import { createPinia, setActivePinia } from 'pinia';

let pinia: any = null;

export function getPinia() {
  if (!pinia) {
    pinia = createPinia();
    // 强制在创建时设置为活动实例
    setActivePinia(pinia);
  }
  return pinia;
}
