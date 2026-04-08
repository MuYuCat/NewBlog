import { history } from '@umijs/max';
import type { RequestConfig } from '@umijs/max';
import { message } from 'antd';

// 定义初始化状态模型
export async function getInitialState(): Promise<{
  currentUser?: {
    username: string;
    avatar?: string;
    role: string;
  };
  settings?: {
    navTheme: 'light' | 'dark';
  };
  isLoggedIn: boolean;
}> {
  const token = localStorage.getItem('admin-token');
  const savedTheme = (localStorage.getItem('admin-theme') as 'light' | 'dark') || 'light';
  const pathname = window.location.pathname;

  if (!token && pathname !== '/login') {
    history.push('/login');
    return { isLoggedIn: false, settings: { navTheme: savedTheme } };
  }

  if (token) {
    return {
      currentUser: {
        username: 'MuYuCat',
        role: 'ADMIN',
      },
      settings: {
        navTheme: savedTheme,
      },
      isLoggedIn: true,
    };
  }

  return { isLoggedIn: false, settings: { navTheme: savedTheme } };
}

// 全局请求配置
export const request: RequestConfig = {
  baseURL: '/api',
  timeout: 10000,
  requestInterceptors: [
    (config: any) => {
      const token = localStorage.getItem('admin-token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
  ],
  responseInterceptors: [
    (response: any) => {
      const { data } = response as any;
      if (data && data.code !== 200) {
        message.error(data.message || '服务异常');
        return Promise.reject(data);
      }
      return data;
    },
  ],
};
