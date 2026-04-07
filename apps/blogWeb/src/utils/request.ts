/**
 * 前台统一请求工具 (fetch 封装)
 */

const BASE_URL = 'http://localhost:3000';

interface RequestOptions extends RequestInit {
  data?: any;
}

export async function request<T = any>(url: string, options: RequestOptions = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  // 合并用户自定义 headers
  if (options.headers) {
    Object.assign(headers, options.headers);
  }

  // 处理请求体
  let body = options.body;
  if (options.data) {
    body = JSON.stringify(options.data);
  }

  const response = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers,
    body,
  });

  const result = await response.json();

  // 统一处理返回码
  if (result.code !== 200) {
    const errorMsg = result.message || '请求失败';
    if (typeof window !== 'undefined') {
      console.error(`[API Error] ${url}:`, errorMsg);
    }
    throw new Error(errorMsg);
  }

  return result.data as T;
}
