'use client';

import { useChat } from '@ai-sdk/react';
import { TextStreamChatTransport } from 'ai';
import { FileText, LogIn, MessageSquarePlus, Settings } from 'lucide-react';
import { useState } from 'react';
import AuthModal from '@/components/auth-modal';
import ModelSelector from '@/components/model-selector';
import type { Provider } from '@/components/model-selector';

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

  const { messages, status, sendMessage } = useChat({
    transport: new TextStreamChatTransport({ api: getApiEndpoint(provider) }),
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

  return (
    <div className="relative flex h-screen">
      <button
        type="button"
        onClick={() => setAuthOpen(true)}
        className="absolute right-4 top-4 flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
      >
        <LogIn aria-hidden="true" className="h-4 w-4 text-gray-600" />
        登录
      </button>

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
          {userEmail ? (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white">
                {userEmail[0]?.toUpperCase()}
              </div>
              <div className="text-sm text-gray-700">{userEmail}</div>
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
            key={`${selectedProvider}-${selectedModel}`}
            provider={selectedProvider}
            model={selectedProvider === 'siliconflow' ? selectedModel : undefined}
          />
        </div>
      </main>
      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onSuccess={(email) => setUserEmail(email)}
      />
    </div>
  );
}
