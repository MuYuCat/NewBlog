import type { App } from 'vue';
import { getPinia } from './store/index';

export default (app: App) => {
  const pinia = getPinia();
  app.use(pinia);
};
