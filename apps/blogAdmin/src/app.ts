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
  isLoggedIn: boolean;
}> {
  const token = localStorage.getItem('admin-token');
  const pathname = window.location.pathname;

  // 1. 登录拦截逻辑
  if (!token && pathname !== '/login') {
    history.push('/login');
    return { isLoggedIn: false };
  }

  // 2. 如果已登录，模拟获取用户信息 (真实环境应请求接口)
  if (token) {
    return {
      currentUser: {
        username: 'MuYuCat',
        avatar: 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
        role: 'ADMIN',
      },
      isLoggedIn: true,
    };
  }

  return { isLoggedIn: false };
}

// 全局请求配置 (Axios 封装)
export const request: RequestConfig = {
  baseURL: '/api',
  timeout: 10000,
  // 请求拦截：携带 Token
  requestInterceptors: [
    (config: any) => {
      const token = localStorage.getItem('admin-token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
  ],
  // 响应拦截：处理统一返回格式
  responseInterceptors: [
    (response: any) => {
      const { data } = response;
      // 这里的 data 对应后端返回的 { code, data, message }
      if (data && data.code !== 200) {
        message.error(data.message || '服务异常');
        return Promise.reject(data);
      }
      // 返回 data.data，让前端调用处直接拿数据
      return data;
    },
  ],
};
