'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ClayCard, ClayButton, Badge, ClayInput } from '@/components/ClayCard';
import { PageHeader } from '@/components/Layout';

interface AiModel {
  id: string;
  name: string;
  provider: string;
  apiUrl: string;
  isDefault: boolean;
  isActive: boolean;
}

const mockModels: AiModel[] = [
  { id: '1', name: 'GLM-4', provider: 'zhipu', apiUrl: 'https://open.bigmodel.cn/api/paas/v4/', isDefault: true, isActive: true },
  { id: '2', name: 'Qwen-Turbo', provider: 'qwen', apiUrl: 'https://dashscope.aliyuncs.com/', isDefault: false, isActive: true },
  { id: '3', name: 'Moonshot', provider: 'kimi', apiUrl: 'https://api.moonshot.cn/v1/', isDefault: false, isActive: false },
];

export default function AiConfigPage() {
  const [models, setModels] = useState(mockModels);
  const [showAdd, setShowAdd] = useState(false);
  const [editingModel, setEditingModel] = useState<AiModel | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    provider: 'zhipu',
    apiUrl: '',
    apiKey: '',
    isDefault: false,
  });

  const handleSave = () => {
    if (editingModel) {
      // Update
      setModels(models.map(m =>
        m.id === editingModel.id
          ? { ...m, ...formData }
          : { ...m, isDefault: formData.isDefault ? true : m.isDefault }
      ));
    } else {
      // Add new
      const newModel: AiModel = {
        id: Date.now().toString(),
        name: formData.name,
        provider: formData.provider,
        apiUrl: formData.apiUrl,
        isDefault: formData.isDefault,
        isActive: true,
      };
      setModels([...models, newModel]);
    }
    setShowAdd(false);
    setEditingModel(null);
    setFormData({ name: '', provider: 'zhipu', apiUrl: '', apiKey: '', isDefault: false });
  };

  const handleEdit = (model: AiModel) => {
    setEditingModel(model);
    setFormData({
      name: model.name,
      provider: model.provider,
      apiUrl: model.apiUrl,
      apiKey: '',
      isDefault: model.isDefault,
    });
    setShowAdd(true);
  };

  const handleDelete = (id: string) => {
    setModels(models.filter(m => m.id !== id));
  };

  const toggleActive = (id: string) => {
    setModels(models.map(m =>
      m.id === id ? { ...m, isActive: !m.isActive } : m
    ));
  };

  const providerLabels: Record<string, string> = {
    zhipu: '智谱 GLM',
    qwen: '阿里千问',
    kimi: '月之暗面 Kimi',
    hunyuan: '腾讯混元',
    minimax: 'MiniMax',
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/parent" className="text-2xl">←</Link>
              <h1 className="font-bold text-xl text-gray-800">AI 模型配置</h1>
            </div>
            <ClayButton size="sm" onClick={() => setShowAdd(true)}>
              + 添加模型
            </ClayButton>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <PageHeader title="AI 配置管理" subtitle="配置AI模型以支持题目生成和讲解" />

        {/* Info Card */}
        <ClayCard className="mb-6 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-100">
          <div className="flex items-start gap-4">
            <div className="text-3xl">💡</div>
            <div>
              <h3 className="font-bold text-gray-800 mb-2">配置说明</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 支持多种国产大模型：GLM、千问、Kimi、混元、MiniMax</li>
                <li>• 可以添加多个模型，系统会根据优先级自动选择</li>
                <li>• 设置默认模型后，所有AI功能将优先使用该模型</li>
                <li>• API Key 会在本地加密存储，不会上传到服务器</li>
              </ul>
            </div>
          </div>
        </ClayCard>

        {/* Models List */}
        <div className="space-y-4">
          {models.map((model) => (
            <ClayCard key={model.id}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                  model.isActive ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  🤖
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-gray-800">{model.name}</h4>
                    {model.isDefault && <Badge variant="success">默认</Badge>}
                    {!model.isActive && <Badge variant="muted">已禁用</Badge>}
                  </div>
                  <p className="text-sm text-gray-500">
                    {providerLabels[model.provider] || model.provider}
                  </p>
                  <p className="text-xs text-gray-400 mt-1 truncate">{model.apiUrl}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleActive(model.id)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                      model.isActive
                        ? 'bg-red-100 text-red-600 hover:bg-red-200'
                        : 'bg-green-100 text-green-600 hover:bg-green-200'
                    }`}
                  >
                    {model.isActive ? '禁用' : '启用'}
                  </button>
                  <ClayButton size="sm" variant="secondary" onClick={() => handleEdit(model)}>
                    编辑
                  </ClayButton>
                  <button
                    onClick={() => handleDelete(model.id)}
                    className="p-2 text-gray-400 hover:text-red-500"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </ClayCard>
          ))}
        </div>

        {models.length === 0 && (
          <ClayCard className="text-center py-12">
            <div className="text-5xl mb-4">🤖</div>
            <p className="text-gray-500 mb-4">还没有配置任何AI模型</p>
            <ClayButton onClick={() => setShowAdd(true)}>添加第一个模型</ClayButton>
          </ClayCard>
        )}
      </main>

      {/* Add/Edit Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <ClayCard className="w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {editingModel ? '编辑模型' : '添加模型'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  模型名称
                </label>
                <ClayInput
                  placeholder="如：GLM-4"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  提供商
                </label>
                <select
                  value={formData.provider}
                  onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                  className="w-full bg-white rounded-xl shadow-[inset_2px_2px_4px_rgba(0,0,0,0.08),inset_-2px_-2px_4px_rgba(255,255,255,0.7)] px-4 py-3 outline-none border-2 border-transparent focus:border-blue-400"
                >
                  <option value="zhipu">智谱 GLM</option>
                  <option value="qwen">阿里千问</option>
                  <option value="kimi">月之暗面 Kimi</option>
                  <option value="hunyuan">腾讯混元</option>
                  <option value="minimax">MiniMax</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API 地址
                </label>
                <ClayInput
                  placeholder="https://api.example.com/v1/"
                  value={formData.apiUrl}
                  onChange={(e) => setFormData({ ...formData, apiUrl: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API Key
                </label>
                <ClayInput
                  type="password"
                  placeholder="输入 API Key"
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="w-5 h-5 rounded"
                />
                <label htmlFor="isDefault" className="text-sm text-gray-700">
                  设为默认模型
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <ClayButton
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  setShowAdd(false);
                  setEditingModel(null);
                }}
              >
                取消
              </ClayButton>
              <ClayButton className="flex-1" onClick={handleSave}>
                保存
              </ClayButton>
            </div>
          </ClayCard>
        </div>
      )}
    </div>
  );
}
