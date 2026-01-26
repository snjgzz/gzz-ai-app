import { createOpenAI } from '@ai-sdk/openai';
import { convertToModelMessages, streamText } from 'ai';

// 创建 DeepSeek 客户端（兼容 OpenAI 格式）
const deepseek = createOpenAI({
  baseURL: 'https://api.deepseek.com/v1',
  apiKey: process.env.DEEPSEEK_API_KEY,
});

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: deepseek.chat('deepseek-chat'),
    messages: await convertToModelMessages(messages),
  });

  return result.toTextStreamResponse();
}
