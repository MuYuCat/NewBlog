import { history, request as umiRequest } from '@umijs/max';
import type { RequestConfig } from '@umijs/max';
import { message } from 'antd';

// 1. 全局初始化状态：负责刷新页面时的状态恢复
export async function getInitialState(): Promise<{
  currentUser?: {
    id: number;
    username: string;
    avatar?: string;
    role: string;
    isTwoFactorEnabled?: boolean;
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
    try {
      // 通过 token 获取当前用户信息
      const res = await umiRequest('/auth/me', { method: 'GET' });

      if (!res || !res.id) {
        throw new Error('用户信息获取失败');
      }

      return {
        currentUser: res,
        settings: { navTheme: savedTheme },
        isLoggedIn: true,
      };
    } catch (e) {
      console.error('[initialState] Sync failed:', e);
      if (pathname !== '/login') history.push('/login');
      return { isLoggedIn: false, settings: { navTheme: savedTheme } };
    }
  }

  return { isLoggedIn: false, settings: { navTheme: savedTheme } };
}

// 2. 集中化请求配置：负责全站的解包与错误拦截
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
      const { data: body } = response;

      // 关键修复：如果是文件流(Blob)，直接返回 response，不进行 JSON 解包校验
      if (body instanceof Blob) {
        return response;
      }

      // 业务 code 校验
      if (body && body.code !== undefined && body.code !== 200) {
        const errorMsg = body.message || '服务异常';
        message.error(errorMsg);
        return Promise.reject(body);
      }

      // 核心修复：重写 response.data。
      // Umi 内置的 request 在拦截器执行完后，会自动返回 response.data 给业务层。
      // 通过这种方式，我们既实现了集中解包，又保证了 Umi 管道的完整性。
      response.data = body.data !== undefined ? body.data : body;
      return response;
    },
  ],
};
