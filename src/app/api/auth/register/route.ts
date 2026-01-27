import { jsonEncryptedResponse, readEncryptedJson } from '@/lib/crypto/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/password';
import { registerSchema } from '@/lib/validation';

export async function POST(req: Request) {
  try {
    const input = await readEncryptedJson<{
      email?: string;
      password?: string;
      username?: string;
    }>(req);

    const result = registerSchema.safeParse(input);

    if (!result.success) {
      const error = result.error.issues[0]?.message || '输入验证失败';
      return jsonEncryptedResponse({ error }, { status: 400 });
    }

    const { email, password, username } = result.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return jsonEncryptedResponse(
        { error: '该邮箱已被注册' },
        { status: 409 }
      );
    }

    const existingUsername = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUsername) {
      return jsonEncryptedResponse(
        { error: '该用户名已被使用' },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
      },
    });

    return jsonEncryptedResponse({
      message: '注册成功',
      user,
    });
  } catch (error) {
    console.error('注册失败:', error);
    
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2002'
    ) {
      return jsonEncryptedResponse(
        { error: '邮箱或用户名已存在' },
        { status: 409 }
      );
    }
    
    return jsonEncryptedResponse({ error: '服务器错误' }, { status: 500 });
  }
}
