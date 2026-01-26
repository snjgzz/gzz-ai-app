import { jsonEncryptedResponse, readEncryptedJson } from '@/lib/crypto/server';

export async function POST(req: Request) {
  try {
    const { email, password } = await readEncryptedJson<{
      email?: string;
      password?: string;
    }>(req);

    if (!email || !password) {
      return jsonEncryptedResponse(
        { error: 'email 和 password 必填' },
        { status: 400 }
      );
    }

    return jsonEncryptedResponse({
      message: '登录示例成功',
      user: { email },
    });
  } catch {
    return jsonEncryptedResponse({ error: '请求格式错误' }, { status: 400 });
  }
}
