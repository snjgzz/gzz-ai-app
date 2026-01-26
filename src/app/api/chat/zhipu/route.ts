import { createOpenAI } from '@ai-sdk/openai';
import { convertToModelMessages, streamText } from 'ai';

// 创建智谱 AI 客户端（兼容 OpenAI 格式）
const zhipu = createOpenAI({
  baseURL: 'https://open.bigmodel.cn/api/paas/v4/',
  apiKey: process.env.ZHIPU_API_KEY,
});

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: zhipu.chat('GLM-4.7'),
    messages: await convertToModelMessages(messages),
  });

  return result.toTextStreamResponse();
}
