'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SILICONFLOW_MODELS, type SiliconFlowModel } from '@/constants/siliconflow-models';
import { useState } from 'react';

export type Provider = 'deepseek' | 'zhipu' | 'siliconflow';

interface ModelSelectorProps {
  onModelChange: (provider: Provider, model?: string) => void;
  defaultProvider?: Provider;
}

export default function ModelSelector({
  onModelChange,
  defaultProvider = 'deepseek'
}: ModelSelectorProps) {
  const [provider, setProvider] = useState<Provider>(defaultProvider);
  const [model, setModel] = useState('');

  const handleProviderChange = (newProvider: Provider) => {
    setProvider(newProvider);
    if (newProvider === 'deepseek') {
      setModel('deepseek-chat');
      onModelChange('deepseek', 'deepseek-chat');
    } else if (newProvider === 'zhipu') {
      setModel('GLM-4.7');
      onModelChange('zhipu', 'GLM-4.7');
    } else if (newProvider === 'siliconflow') {
      const firstModel = SILICONFLOW_MODELS[0];
      setModel(firstModel.id);
      onModelChange('siliconflow', firstModel.id);
    }
  };

  const handleModelChange = (newModel: string) => {
    setModel(newModel);
    onModelChange('siliconflow', newModel);
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs text-gray-600">Provider</label>
        <Select value={provider} onValueChange={(value) => handleProviderChange(value as Provider)}>
          <SelectTrigger className="w-full mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {/* <SelectItem value="deepseek">DeepSeek</SelectItem>
            <SelectItem value="zhipu">智谱 AI</SelectItem> */}
            <SelectItem value="siliconflow">硅基流动</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {provider === 'siliconflow' && (
        <div>
          <label className="text-xs text-gray-600">Model</label>
          <Select value={model} onValueChange={handleModelChange}>
            <SelectTrigger className="w-full mt-1">
              <SelectValue placeholder="选择模型" />
            </SelectTrigger>
            <SelectContent>
              {SILICONFLOW_MODELS.map((m: SiliconFlowModel) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
