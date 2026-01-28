'use client';

/* eslint-disable react-hooks/set-state-in-effect */

import { useChat } from '@ai-sdk/react';
import { FileText, LogIn, LogOut, MessageSquarePlus, Settings } from 'lucide-react';
import { useLayoutEffect, useMemo, useState } from 'react';
import AuthModal from '@/components/auth-modal';
import { Toaster } from '@/components/ui/sonner';
import ModelSelector from '@/components/model-selector';
import type { Provider } from '@/components/model-selector';
import { createChatTransport, handleChatError } from '@/lib/api/ai-chat';
import { getUser, removeToken } from '@/lib/auth/client';

interface ChatAreaProps {
  provider: Provider;
  model?: string;
}

function ChatArea({ provider, model }: ChatAreaProps) {
  const getApiEndpoint = (provider: Provider) => {
    switch (provider) {
      case 'deepseek':
        return '/api/chat/deepseek';
      case 'zhipu':
        return '/api/chat/zhipu';
      case 'siliconflow':
        return '/api/chat/siliconflow';
      default:
        return '/api/chat/deepseek';
    }
  };

  const transport = useMemo(
    () => createChatTransport(getApiEndpoint(provider)),
    [provider]
  );

  const { messages, status, sendMessage } = useChat({
    transport,
    onError: (err) => {
      handleChatError(err);
    },
  });

  const [inputValue, setInputValue] = useState('');

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    const options = provider === 'siliconflow' && model ? { body: { model } } : undefined;
    sendMessage({ parts: [{ type: 'text', text: inputValue }] }, options);
    setInputValue('');
  };

  const isLoading = status === 'streaming' || status === 'submitted';

  return (
    <>
      <div className="mb-4 flex-1 overflow-y-auto space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`p-3 rounded-lg ${
              message.role === 'user'
                ? 'bg-blue-500 text-white ml-auto max-w-[80%]'
                : 'bg-gray-200 text-gray-800 mr-auto max-w-[80%]'
            }`}
          >
            {message.parts.map((part, i) =>
              part.type === 'text' ? <span key={i}>{part.text}</span> : null
            )}
          </div>
        ))}
      </div>

      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="输入消息..."
          className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? '发送中...' : '发送'}
        </button>
      </form>
    </>
  );
}

export default function Home() {
  const [selectedProvider, setSelectedProvider] = useState<Provider>('siliconflow');
  const [selectedModel, setSelectedModel] = useState('');
  const [authOpen, setAuthOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  // 页面加载时恢复登录态
  useLayoutEffect(() => {
    const user = getUser();
    if (user) {
      setUserEmail(user.email);
      setUsername(user.username);
    }
  }, []);

  // 退出登录处理函数
  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      removeToken();
      setUserEmail(null);
      setUsername(null);
    }
  };

  // 检查是否已登录
  const isLoggedIn = userEmail && username;

  return (
    <div className="relative flex h-screen">
      {/* 未登录时显示登录按钮 */}
      {!isLoggedIn && (
        <button
          type="button"
          onClick={() => setAuthOpen(true)}
          className="absolute right-4 top-4 flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
        >
          <LogIn aria-hidden="true" className="h-4 w-4 text-gray-600" />
          登录
        </button>
      )}

      <aside className="flex w-56 flex-col border-r border-gray-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-gray-600">功能</h2>
        <div className="mt-3 space-y-2">
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-left text-sm hover:bg-gray-200"
          >
            <MessageSquarePlus
              aria-hidden="true"
              className="h-4 w-4 text-gray-600"
            />
            新建对话
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-left text-sm hover:bg-gray-200"
          >
            <FileText aria-hidden="true" className="h-4 w-4 text-gray-600" />
            历史记录
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-left text-sm hover:bg-gray-200"
          >
            <Settings aria-hidden="true" className="h-4 w-4 text-gray-600" />
            设置
          </button>
        </div>

        <div className="mt-auto">
          {isLoggedIn ? (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white">
                  {username[0]?.toUpperCase()}
                </div>
                <div className="text-sm text-gray-700">{username}</div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-red-500"
                title="退出登录"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="text-sm text-gray-400">未登录</div>
          )}
        </div>
      </aside>

      <main className="flex flex-1 flex-col p-6">
        <div className="mx-auto flex h-full w-full max-w-2xl flex-col">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold">AI Chat</h1>
            <ModelSelector
              onModelChange={(provider, model) => {
                setSelectedProvider(provider);
                if (model) {
                  setSelectedModel(model);
                }
              }}
              defaultProvider={selectedProvider}
            />
          </div>

          <ChatArea
            key={`${selectedProvider}-${selectedModel}-${isLoggedIn ? 'logged' : 'guest'}`}
            provider={selectedProvider}
            model={selectedProvider === 'siliconflow' ? selectedModel : undefined}
          />
        </div>
      </main>
      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onSuccess={(email, username) => {
          setUserEmail(email);
          setUsername(username);
        }}
      />
      <Toaster />
    </div>
  );
}
