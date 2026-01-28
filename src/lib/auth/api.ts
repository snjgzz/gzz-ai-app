import { jsonEncryptedResponse } from '@/lib/crypto/server';
import { verifyToken, extractToken, type UserPayload } from './token';

/**
 * 认证结果接口
 */
interface AuthResult {
  user: UserPayload;
  token: string;
}

/**
 * 验证请求中的 token
 * @param req HTTP 请求对象
 * @returns 验证成功返回用户信息，验证失败返回加密的 401 响应
 */
export async function verifyAuth(req: Request): Promise<AuthResult | Response> {
  const token = extractToken(req.headers.get('authorization'));

  if (!token) {
    return jsonEncryptedResponse({ error: '未登录' }, { status: 401 });
  }

  const user = await verifyToken(token);
  if (!user) {
    return jsonEncryptedResponse({ error: '登录已过期' }, { status: 401 });
  }

  return { user, token };
}

/**
 * 带 token 验证的 API 处理器
 * 
 * 使用方式：
 * ```ts
 * // src/app/api/protected-route/route.ts
 * import { withAuth } from '@/lib/auth/api';
 * 
 * export async function POST(req: Request) {
 *   const auth = await withAuth(req);
 *   if (auth instanceof Response) return auth;
 *   
 *   const { user, token } = auth;
 *   // user 包含 userId, email, username
 *   // 可以在这里使用 user 进行业务逻辑
 * }
 * ```
 * 
 * @param req HTTP 请求对象
 * @returns 验证成功返回 { user, token }，验证失败返回 Response
 */
export async function withAuth(req: Request) {
  return await verifyAuth(req);
}
