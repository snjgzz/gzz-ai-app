import type { EncryptedPayload } from '@/lib/crypto/types';

const ALGORITHM = 'AES-GCM';
const IV_LENGTH = 12;

let cachedKey: Promise<CryptoKey> | null = null;

function getKey(): Promise<CryptoKey> {
  if (cachedKey) return cachedKey;

  const rawKey = process.env.NEXT_PUBLIC_API_CRYPTO_KEY;
  if (!rawKey) {
    throw new Error('缺少 NEXT_PUBLIC_API_CRYPTO_KEY');
  }

  const keyBytes = base64ToBytes(rawKey);
  if (keyBytes.length !== 32) {
    throw new Error('NEXT_PUBLIC_API_CRYPTO_KEY 必须是 32 字节 base64');
  }

  cachedKey = crypto.subtle.importKey(
    'raw',
    keyBytes as BufferSource,
    { name: ALGORITHM },
    false,
    ['encrypt', 'decrypt']
  );
  return cachedKey;
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/** 加密请求对象 */
export async function encryptPayload(data: unknown): Promise<EncryptedPayload> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const encoded = new TextEncoder().encode(JSON.stringify(data));
  const encrypted = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    await getKey(),
    encoded
  );

  return {
    iv: bytesToBase64(iv),
    data: bytesToBase64(new Uint8Array(encrypted)),
  };
}

/** 解密响应对象 */
export async function decryptPayload<T>(
  payload: EncryptedPayload
): Promise<T> {
  const iv = base64ToBytes(payload.iv);
  const data = base64ToBytes(payload.data);
  const decrypted = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv: iv as BufferSource },
    await getKey(),
    data as BufferSource
  );

  const json = new TextDecoder().decode(decrypted);
  return JSON.parse(json) as T;
}
