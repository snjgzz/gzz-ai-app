import { getToken, removeToken } from '@/lib/auth/client';
import { decryptPayload } from '@/lib/crypto/client';
import type { EncryptedPayload } from '@/lib/crypto/types';

/**
 * API 错误类型
 */
export interface ApiError {
  error: string;
  message?: string;
}

/**
 * API 响应结果
 */
export interface ApiResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * 统一的 API 请求函数
 * 
 * 功能：
 * 1. 自动携带 token 到请求头
 * 2. 自动处理加密请求/响应
 * 3. 统一错误处理（401 自动清除 token 并提示）
 * 
 * @param url 请求 URL
 * @param options fetch 请求选项
 * @returns 解析后的响应数据
 * 
 * @example
 * // GET 请求
 * const data = await api.get('/api/user');
 * 
 * // POST 请求（自动加密）
 * const result = await api.post('/api/chat', { messages: [...] });
 */
export async function api<T = unknown>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResult<T>> {
  // 获取 token 并添加到请求头
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    // 尝试解析加密响应
    const contentType = res.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      const json = await res.json();
      
      // 如果是加密响应，解密后返回
      if (json.data && json.iv && json.tag) {
        const encrypted = json as EncryptedPayload;
        const decrypted = await decryptPayload<T>(encrypted);
        return { success: true, data: decrypted };
      }
      
      // 普通 JSON 响应
      return { success: res.ok, data: json, error: json.error };
    }

    return { success: res.ok, error: res.statusText };
  } catch (error) {
    console.error('API 请求错误:', error);
    return { success: false, error: '网络请求失败' };
  }
}

/**
 * 处理 API 响应错误
 * 如果是 401 未登录错误，会清除 token 并提示用户
 * 
 * @param result API 请求结果
 * @param onUnauthorized 未登录时的回调（可选）
 * @returns 是否有错误
 */
export function handleApiError(
  result: ApiResult,
  onUnauthorized?: () => void
): boolean {
  if (!result.success) {
    // 401 未登录错误
    if (result.error === '未登录' || result.error === '登录已过期') {
      // 清除本地 token
      removeToken();
      
      // 调用回调（可显示 toast 或跳转）
      onUnauthorized?.();
      
      console.warn('用户未登录或登录已过期');
      return true;
    }
    
    // 其他错误
    console.error('API 错误:', result.error);
    return true;
  }
  
  return false;
}

/**
 * GET 请求快捷方法
 */
export async function apiGet<T = unknown>(
  url: string,
  options?: RequestInit
): Promise<ApiResult<T>> {
  return api<T>(url, { ...options, method: 'GET' });
}

/**
 * POST 请求快捷方法
 */
export async function apiPost<T = unknown>(
  url: string,
  body?: unknown,
  options?: RequestInit
): Promise<ApiResult<T>> {
  return api<T>(url, {
    ...options,
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
}
