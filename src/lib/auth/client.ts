// localStorage 中存储 token 的键名
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

/**
 * 保存 token 到 localStorage
 * @param token JWT token 字符串
 */
export function setToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

/**
 * 从 localStorage 读取 token
 * @returns token 字符串，不存在返回 null
 */
export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
}

/**
 * 从 localStorage 删除 token
 */
export function removeToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
}

/**
 * 保存用户信息到 localStorage
 * @param user 用户信息对象
 */
export function setUser(user: { id: string; email: string; username: string }): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

/**
 * 从 localStorage 读取用户信息
 * @returns 用户信息对象，不存在返回 null
 */
export function getUser(): { id: string; email: string; username: string } | null {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem(USER_KEY);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
  }
  return null;
}

/**
 * 检查是否已登录（有有效的 token）
 * @returns 是否已登录
 */
export function isLoggedIn(): boolean {
  return typeof window !== 'undefined' && localStorage.getItem(TOKEN_KEY) !== null;
}
