/**
 * 密码哈希和验证工具
 * 使用 bcryptjs 进行安全的密码哈希和验证
 */

import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10; // 哈希强度，10 是推荐值，平衡安全性和性能

/**
 * 对密码进行哈希处理
 * @param password 明文密码
 * @returns 哈希后的密码
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * 验证密码
 * @param password 明文密码
 * @param hashedPassword 哈希后的密码
 * @returns 密码是否匹配
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}
