import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractToken } from '@/lib/auth/token';

// 需要验证 token 的路径前缀
const protectedPaths = ['/api/chat'];

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // 检查是否是需要验证的路径
  const needsAuth = protectedPaths.some(pathname =>
    path.startsWith(pathname)
  );

  if (!needsAuth) {
    return NextResponse.next();
  }

  // 排除登录和注册接口
  if (path === '/api/auth/login' || path === '/api/auth/register') {
    return NextResponse.next();
  }

  // 验证 token
  const token = extractToken(req.headers.get('authorization'));
  console.log('middleware token:', token);
  if (!token) {
    // 返回普通 401 响应（Edge Runtime 不支持 node:crypto）
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const user = await verifyToken(token);
  console.log('middleware user:', user);
  console.log('middleware JWT_SECRET:', process.env.JWT_SECRET);
  if (!user) {
    // 返回普通 401 响应
    return new NextResponse('Unauthorized', { status: 401 });
  }

  return NextResponse.next();
}

// 配置匹配的路径
export const config = {
  matcher: ['/api/chat/:path*'],
};
