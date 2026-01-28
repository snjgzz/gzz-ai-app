import { jsonEncryptedResponse, readEncryptedJson } from '@/lib/crypto/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/password';
import { loginSchema } from '@/lib/validation';
import { generateToken } from '@/lib/auth/token';

export async function POST(req: Request) {
  try {
    const input = await readEncryptedJson<{
      email?: string;
      password?: string;
    }>(req);

    const result = loginSchema.safeParse(input);

    if (!result.success) {
      const error = result.error.issues[0]?.message || '输入验证失败';
      return jsonEncryptedResponse({ error }, { status: 400 });
    }

    const { email, password } = result.data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return jsonEncryptedResponse(
        { error: '邮箱或密码错误' },
        { status: 401 }
      );
    }

    const isValidPassword = await verifyPassword(password, user.password);

    if (!isValidPassword) {
      return jsonEncryptedResponse(
        { error: '邮箱或密码错误' },
        { status: 401 }
      );
    }

    // 生成 JWT token
    const token = await generateToken(user.id, user.email, user.username);
    console.log('login token:', token);
    return jsonEncryptedResponse({
      message: '登录成功',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch {
    return jsonEncryptedResponse({ error: '服务器错误' }, { status: 500 });
  }
}
