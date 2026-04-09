'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ClayCard, ClayButton, Badge, Avatar, ClayInput } from '@/components/ClayCard';
import { PageHeader } from '@/components/Layout';

interface Child {
  id: string;
  name: string;
  grade: number;
  avatar?: string;
  parentId?: string;
  stats: {
    totalPoints: number;
    streak: number;
    correctRate: number;
    achievements: number;
  };
}

export default function ParentPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [showAddChild, setShowAddChild] = useState(false);
  const [newChildName, setNewChildName] = useState('');
  const [newChildGrade, setNewChildGrade] = useState(2);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // 从 localStorage 获取当前家长用户
  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      const userData = JSON.parse(user);
      setCurrentUser(userData);
      // 获取孩子列表
      fetchChildren();
    }
  }, []);

  const fetchChildren = () => {
    // 获取所有孩子账号（家长可以看到所有孩子）
    fetch('/api/users?role=child')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data.length > 0) {
          const childrenData = data.data.map((child: any) => ({
            id: child.id,
            name: child.name,
            grade: child.grade || 0,
            avatar: child.avatar,
            parentId: child.parentId,
            stats: {
              totalPoints: child.totalPoints || 0,
              streak: 0,
              correctRate: 0,
              achievements: child._count?.achievements || 0,
            },
          }));
          setChildren(childrenData);
          if (childrenData.length > 0 && !selectedChild) {
            setSelectedChild(childrenData[0]);
          }
        }
      })
      .catch(console.error);
  };

  const handleAddChild = async () => {
    if (!newChildName.trim() || !currentUser) return;

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newChildName.trim(),
          role: 'child',
          parentId: currentUser.id,
          grade: newChildGrade,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddChild(false);
        setNewChildName('');
        setNewChildGrade(2);
        fetchChildren(); // 刷新列表
      }
    } catch (error) {
      console.error('Failed to add child:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="text-2xl">←</Link>
              <h1 className="font-bold text-xl text-gray-800">家长端</h1>
            </div>
            <Link href="/dashboard" className="text-sm text-blue-500 hover:text-blue-700">返回首页</Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <PageHeader title="家长管理" subtitle="查看学习报告，管理孩子账号" />

        {/* Child Selector */}
        <ClayCard className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">我的孩子</h3>
            <ClayButton size="sm" onClick={() => setShowAddChild(true)}>
              + 添加孩子
            </ClayButton>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {children.length === 0 ? (
              <p className="text-gray-500 text-sm py-2">暂无关联的孩子账号</p>
            ) : children.map((child) => (
              <button
                key={child.id}
                onClick={() => setSelectedChild(child)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl whitespace-nowrap transition-all ${
                  selectedChild?.id === child.id
                    ? 'bg-blue-500 text-white'
                    : 'clay-inset hover:bg-gray-50'
                }`}
              >
                <Avatar name={child.name} size="md" />
                <div className="text-left">
                  <p className={`font-medium ${selectedChild?.id === child.id ? 'text-white' : 'text-gray-800'}`}>
                    {child.name}
                  </p>
                  <p className={`text-sm ${selectedChild?.id === child.id ? 'text-blue-100' : 'text-gray-500'}`}>
                    {child.grade}年级
                  </p>
                </div>
              </button>
            ))}
          </div>
        </ClayCard>

        {selectedChild && (
          <>
            {/* Learning Overview */}
            <ClayCard className="mb-6 bg-gradient-to-br from-blue-50 to-indigo-50">
              <div className="flex items-center gap-4 mb-4">
                <Avatar name={selectedChild.name} size="lg" />
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{selectedChild.name}</h3>
                  <p className="text-gray-500">{selectedChild.grade}年级 · 小学</p>
                </div>
                <Badge variant="success" className="ml-auto">
                  🔥 {selectedChild.stats.streak}天连续
                </Badge>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="text-center p-3 bg-white rounded-xl">
                  <div className="text-2xl font-bold text-blue-500">{selectedChild.stats.totalPoints}</div>
                  <div className="text-sm text-gray-500">积分</div>
                </div>
                <div className="text-center p-3 bg-white rounded-xl">
                  <div className="text-2xl font-bold text-green-500">{selectedChild.stats.correctRate}%</div>
                  <div className="text-sm text-gray-500">正确率</div>
                </div>
                <div className="text-center p-3 bg-white rounded-xl">
                  <div className="text-2xl font-bold text-orange-500">{selectedChild.stats.streak}</div>
                  <div className="text-sm text-gray-500">连续天数</div>
                </div>
                <div className="text-center p-3 bg-white rounded-xl">
                  <div className="text-2xl font-bold text-purple-500">{selectedChild.stats.achievements}</div>
                  <div className="text-sm text-gray-500">成就</div>
                </div>
              </div>
            </ClayCard>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <Link href="/report">
                <ClayCard className="cursor-pointer hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">📊</div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800">学习报告</h4>
                      <p className="text-sm text-gray-500">查看详细学习数据</p>
                    </div>
                    <span className="text-gray-400">→</span>
                  </div>
                </ClayCard>
              </Link>

              <ClayCard className="cursor-pointer hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl">🎯</div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800">目标设置</h4>
                    <p className="text-sm text-gray-500">设置每日/每周目标</p>
                  </div>
                  <span className="text-gray-400">→</span>
                </div>
              </ClayCard>

              <ClayCard className="cursor-pointer hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-2xl">🎁</div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800">奖励配置</h4>
                    <p className="text-sm text-gray-500">设置积分兑换规则</p>
                  </div>
                  <span className="text-gray-400">→</span>
                </div>
              </ClayCard>

              <Link href="/admin/ai-config">
                <ClayCard className="cursor-pointer hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl">🤖</div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800">AI配置</h4>
                      <p className="text-sm text-gray-500">管理AI模型设置</p>
                    </div>
                    <span className="text-gray-400">→</span>
                  </div>
                </ClayCard>
              </Link>
            </div>

            {/* Recent Activity */}
            <ClayCard>
              <h3 className="font-bold text-gray-800 mb-4">最近学习</h3>
              <div className="space-y-3">
                {[
                  { date: '今天', subject: '数学', chapter: '第五章', result: '85%' },
                  { date: '昨天', subject: '语文', chapter: '第三课', result: '90%' },
                  { date: '前天', subject: '英语', chapter: 'Unit 2', result: '75%' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 clay-inset">
                    <div className="text-2xl">
                      {item.subject === '数学' ? '📐' : item.subject === '语文' ? '📖' : '🔤'}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{item.subject} · {item.chapter}</p>
                      <p className="text-sm text-gray-500">{item.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-500">{item.result}</p>
                      <p className="text-xs text-gray-500">正确率</p>
                    </div>
                  </div>
                ))}
              </div>
            </ClayCard>
          </>
        )}
      </main>

      {/* 添加孩子弹窗 */}
      {showAddChild && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <ClayCard className="w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-800 mb-4">添加孩子账号</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">孩子姓名</label>
                <ClayInput
                  value={newChildName}
                  onChange={(e) => setNewChildName(e.target.value)}
                  placeholder="请输入孩子姓名"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">年级</label>
                <select
                  value={newChildGrade}
                  onChange={(e) => setNewChildGrade(parseInt(e.target.value))}
                  className="w-full p-2.5 bg-white rounded-xl border border-gray-200 text-sm"
                >
                  {[1, 2, 3, 4, 5, 6].map(g => (
                    <option key={g} value={g}>{g}年级</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <ClayButton variant="secondary" className="flex-1" onClick={() => setShowAddChild(false)}>
                取消
              </ClayButton>
              <ClayButton className="flex-1" onClick={handleAddChild} disabled={!newChildName.trim()}>
                添加
              </ClayButton>
            </div>
          </ClayCard>
        </div>
      )}
    </div>
  );
}
