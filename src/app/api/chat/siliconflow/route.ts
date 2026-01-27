import { createOpenAI } from '@ai-sdk/openai';
import { convertToModelMessages, streamText } from 'ai';

const siliconflow = createOpenAI({
  baseURL: 'https://api.siliconflow.cn/v1',
  apiKey: process.env.SILICONFLOW_API_KEY,
});

export async function POST(req: Request) {
  const { messages, model } = await req.json();

  const result = streamText({
    model: siliconflow.chat(model || 'MiniMaxAI/MiniMax-M2'),
    messages: await convertToModelMessages(messages),
  });

  return result.toTextStreamResponse();
}
