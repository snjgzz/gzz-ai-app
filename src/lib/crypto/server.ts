import crypto from 'node:crypto';
import type { EncryptedPayload } from '@/lib/crypto/types';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

let cachedKey: Buffer | null = null;

function getKey(): Buffer {
  if (cachedKey) return cachedKey;
  const rawKey =
    process.env.API_CRYPTO_KEY ?? process.env.NEXT_PUBLIC_API_CRYPTO_KEY;

  if (!rawKey) {
    throw new Error('缺少 API_CRYPTO_KEY');
  }

  const key = Buffer.from(rawKey, 'base64');
  if (key.length !== 32) {
    throw new Error('API_CRYPTO_KEY 必须是 32 字节 base64');
  }

  cachedKey = key;
  return key;
}

/** 加密响应对象 */
export function encryptPayload(data: unknown): EncryptedPayload {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  const json = JSON.stringify(data);
  const encrypted = Buffer.concat([cipher.update(json, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  const combined = Buffer.concat([encrypted, tag]);

  return {
    iv: iv.toString('base64'),
    data: combined.toString('base64'),
  };
}

/** 解密请求对象 */
export function decryptPayload<T>(payload: EncryptedPayload): T {
  const iv = Buffer.from(payload.iv, 'base64');
  const combined = Buffer.from(payload.data, 'base64');

  if (combined.length <= TAG_LENGTH) {
    throw new Error('密文格式错误');
  }

  const encrypted = combined.subarray(0, combined.length - TAG_LENGTH);
  const tag = combined.subarray(combined.length - TAG_LENGTH);

  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return JSON.parse(decrypted.toString('utf8')) as T;
}

/** 读取并解密 JSON 请求 */
export async function readEncryptedJson<T>(req: Request): Promise<T> {
  const payload = (await req.json()) as EncryptedPayload;
  return decryptPayload<T>(payload);
}

/** 返回加密 JSON 响应 */
export function jsonEncryptedResponse(
  data: unknown,
  init?: ResponseInit
): Response {
  return Response.json(encryptPayload(data), init);
}
