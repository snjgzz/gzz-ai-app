import { SignJWT, jwtVerify } from 'jose';

// 使用 TextEncoder 将密钥转换为 Uint8Array
const encoder = new TextEncoder();
const JWT_SECRET = encoder.encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);
const TOKEN_EXPIRY = '7d';

/**
 * 用户信息接口
 */
export interface UserPayload {
  userId: string;
  email: string;
  username: string;
  [key: string]: any; // 添加索引签名以兼容 JWTPayload
}

/**
 * 生成 JWT token
 * @param userId 用户ID
 * @param email 用户邮箱
 * @param username 用户名
 * @returns JWT token 字符串
 */
export async function generateToken(userId: string, email: string, username: string): Promise<string> {
  const payload: UserPayload = { userId, email, username };
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(JWT_SECRET);
  // jose 的 sign() 方法直接返回 JWT 字符串，无需额外解码
  return token as string;
}

/**
 * 验证 JWT token
 * @param token JWT token 字符串
 * @returns 解析后的用户信息，验证失败返回 null
 */
export async function verifyToken(token: string): Promise<UserPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as UserPayload;
  } catch (error) {
    console.error('verifyToken error:', error);
    return null;
  }
}

/**
 * 从 Authorization 请求头中提取 token
 * @param authHeader Authorization 请求头值
 * @returns token 字符串，提取失败返回 null
 */
export function extractToken(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7);
}
