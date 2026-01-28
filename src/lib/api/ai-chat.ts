import { getToken, removeToken } from '@/lib/auth/client';
import { TextStreamChatTransport } from 'ai';
import { toast } from 'sonner';

/**
 * 创建 AI Chat Transport
 * 统一处理 token 注入和错误处理
 */
export function createChatTransport(apiEndpoint: string) {
  const token = getToken();
  const headers: Record<string, string> = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return new TextStreamChatTransport({
    api: apiEndpoint,
    headers,
  });
}

/**
 * 处理 Chat 错误
 * 统一处理 401 未登录错误
 */
export function handleChatError(
  error: Error & { status?: number },
  onUnauthorized?: () => void
): void {
  const errorMessage = error.message || '请求失败';

  const isUnauthorized =
    error.status === 401 ||
    errorMessage.includes('401') ||
    errorMessage.includes('Unauthorized') ||
    errorMessage.includes('未登录') ||
    errorMessage.includes('登录已过期');

  if (isUnauthorized) {
    removeToken();
    toast.error('登录已过期，请重新登录');
    onUnauthorized?.();
  } else {
    toast.error(errorMessage);
  }
}
