'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import type { EncryptedPayload } from '@/lib/crypto/types';
import { decryptPayload, encryptPayload } from '@/lib/crypto/client';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (email: string) => void;
}

type Mode = 'login' | 'register';

/** 登录/注册弹窗组件 */
export default function AuthModal({
  open,
  onClose,
  onSuccess,
}: Readonly<AuthModalProps>) {
  const [mode, setMode] = useState<Mode>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  if (!open) return null;

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email || !password) {
      setMessage('请填写邮箱和密码');
      return;
    }

    if (mode === 'register' && !username) {
      setMessage('请填写用户名');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const payload = mode === 'register' 
        ? { email, password, username }
        : { email, password };
      
      const encryptedBody = await encryptPayload(payload);
      const res = await fetch(`/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(encryptedBody),
      });
      const encrypted = (await res.json()) as EncryptedPayload;
      const data = await decryptPayload<{ message?: string; error?: string }>(
        encrypted
      );
      if (!res.ok) {
        setMessage(data.error ?? '请求失败');
        return;
      }

      setMessage(data.message ?? '成功');
      onSuccess?.(email);
      onClose();
    } catch (error) {
      console.error(error);

      setMessage('网络错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        onClick={onClose}
        aria-label="关闭"
        className="absolute inset-0 bg-black/50"
      />
      <div className="relative w-full max-w-sm rounded-xl bg-white p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {mode === 'login' ? '登录' : '注册'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            关闭
          </button>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 rounded-lg px-3 py-2 text-sm ${
              mode === 'login'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            登录
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`flex-1 rounded-lg px-3 py-2 text-sm ${
              mode === 'register'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            注册
          </button>
        </div>

        <form onSubmit={onSubmit} className="mt-4 space-y-3">
          {mode === 'register' && (
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="用户名"
              className="w-full rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="邮箱"
            className="w-full rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="密码"
            className="w-full rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-500 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? '提交中...' : mode === 'login' ? '登录' : '注册'}
          </button>
        </form>

        {message ? (
          <p className="mt-3 text-sm text-gray-600">{message}</p>
        ) : null}
      </div>
    </div>
  );
}
