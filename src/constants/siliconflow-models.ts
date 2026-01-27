/**
 * 硅基流动可用模型列表
 * 手动维护，根据官方支持的模型更新
 */

export interface SiliconFlowModel {
  id: string;
  name: string;
  type: 'chat' | 'embedding' | 'image';
  provider: string;
}

export const SILICONFLOW_MODELS: SiliconFlowModel[] = [
  {
    id: 'Qwen/Qwen3-Coder-480B-A35B-Instruct',
    name: 'Qwen3-Coder-480B-A35B-Instruct',
    type: 'chat',
    provider: 'Qwen',
  },
  {
    id: 'deepseek-ai/DeepSeek-V3.2',
    name: 'DeepSeek-V3.2',
    type: 'chat',
    provider: 'deepseek-ai',
  },
  {
    id: 'zai-org/GLM-4.6V',
    name: 'GLM-4.6V',
    type: 'chat',
    provider: 'zai-org',
  },
  {
    id: 'MiniMaxAI/MiniMax-M2',
    name: 'MiniMax-M2',
    type: 'chat',
    provider: 'MiniMaxAI',
  },
  {
    id: 'baidu/ERNIE-4.5-300B-A47B',
    name: 'ERNIE-4.5-300B-A47B',
    type: 'chat',
    provider: 'baidu',
  },
  {
    id: 'moonshotai/Kimi-Dev-72B',
    name: 'Kimi-Dev-72B',
    type: 'chat',
    provider: 'moonshotai',
  },
  {
    id: 'moonshotai/Kimi-K2-Thinking',
    name: 'Kimi-K2-Thinking',
    type: 'chat',
    provider: 'moonshotai',
  },
];

/**
 * 获取聊天模型列表
 */
export function getChatModels(): SiliconFlowModel[] {
  return SILICONFLOW_MODELS.filter((model) => model.type === 'chat');
}

/**
 * 根据 ID 查找模型
 */
export function findModelById(id: string): SiliconFlowModel | undefined {
  return SILICONFLOW_MODELS.find((model) => model.id === id);
}
