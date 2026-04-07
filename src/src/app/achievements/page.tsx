'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ClayCard, ClayButton, Badge } from '@/components/ClayCard';
import { PageHeader } from '@/components/Layout';

interface Achievement {
  type: string;
  name: string;
  desc: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

const mockAchievements: Achievement[] = [
  { type: 'first_quiz', name: '初次答题', desc: '完成第一次答题', icon: '🎯', unlocked: true, unlockedAt: '2024-03-15' },
  { type: 'first_full', name: '首次全对', desc: '第一次答对所有题目', icon: '🌟', unlocked: true, unlockedAt: '2024-03-16' },
  { type: 'streak_3', name: '初露锋芒', desc: '连续3天学习', icon: '🔥', unlocked: true, unlockedAt: '2024-03-17' },
  { type: 'streak_7', name: '连续7天', desc: '连续7天学习', icon: '🔥', unlocked: true, unlockedAt: '2024-03-20' },
  { type: 'streak_30', name: '月度学霸', desc: '连续30天学习', icon: '🏆', unlocked: false },
  { type: 'quiz_100', name: '答题王', desc: '完成100道题', icon: '📝', unlocked: true, unlockedAt: '2024-03-25' },
  { type: 'quiz_500', name: '题库达人', desc: '完成500道题', icon: '📚', unlocked: false },
  { type: 'correct_50', name: '正确率50%', desc: '正确率达到50%', icon: '✅', unlocked: true, unlockedAt: '2024-03-15' },
  { type: 'correct_80', name: '正确率80%', desc: '正确率达到80%', icon: '💯', unlocked: true, unlockedAt: '2024-03-18' },
  { type: 'correct_100', name: '完美正确率', desc: '正确率达到100%', icon: '💯', unlocked: false },
  { type: 'math_master', name: '数学大师', desc: '数学正确率达到90%', icon: '📐', unlocked: true, unlockedAt: '2024-03-22' },
  { type: 'chinese_master', name: '语文大师', desc: '语文正确率达到90%', icon: '📖', unlocked: false },
  { type: 'english_master', name: '英语大师', desc: '英语正确率达到90%', icon: '🔤', unlocked: false },
  { type: 'wrong_0', name: '无错题日', desc: '一天内所有题目都答对', icon: '✨', unlocked: true, unlockedAt: '2024-03-19' },
  { type: 'checkin_7', name: '打卡达人', desc: '累计打卡7天', icon: '📅', unlocked: true, unlockedAt: '2024-03-20' },
  { type: 'checkin_30', name: '坚持不懈', desc: '累计打卡30天', icon: '📅', unlocked: false },
  { type: 'points_1000', name: '积分达人', desc: '累计获得1000积分', icon: '⭐', unlocked: true, unlockedAt: '2024-03-21' },
  { type: 'points_5000', name: '积分富豪', desc: '累计获得5000积分', icon: '💰', unlocked: false },
  { type: 'parent_login', name: '家长绑定', desc: '绑定家长账号', icon: '👨‍👩‍👧', unlocked: true, unlockedAt: '2024-03-14' },
];

const categories = [
  { key: 'all', label: '全部' },
  { key: 'unlocked', label: '已解锁' },
  { key: 'locked', label: '未解锁' },
];

export default function AchievementsPage() {
  const [filter, setFilter] = useState('all');

  const filteredAchievements = mockAchievements.filter((a) => {
    if (filter === 'unlocked') return a.unlocked;
    if (filter === 'locked') return !a.unlocked;
    return true;
  });

  const stats = {
    total: mockAchievements.length,
    unlocked: mockAchievements.filter((a) => a.unlocked).length,
    locked: mockAchievements.filter((a) => !a.unlocked).length,
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="text-2xl">←</Link>
              <h1 className="font-bold text-xl text-gray-800">成就墙</h1>
            </div>
            <Badge variant="accent">{stats.unlocked}/{stats.total} 已解锁</Badge>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <PageHeader title="我的成就" subtitle="收集徽章，达成成就" />

        {/* Stats */}
        <ClayCard className="mb-6 bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200">
          <div className="flex items-center gap-6">
            <div className="text-5xl">🏆</div>
            <div className="flex-1">
              <div className="text-3xl font-bold text-gray-800 mb-1">
                {stats.unlocked}/{stats.total}
              </div>
              <p className="text-gray-500">已解锁成就</p>
              <div className="mt-2 h-2 bg-white rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full transition-all"
                  style={{ width: `${(stats.unlocked / stats.total) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </ClayCard>

        {/* Filter */}
        <div className="flex gap-2 mb-6">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setFilter(cat.key)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === cat.key
                  ? 'bg-blue-500 text-white'
                  : 'clay-card hover:bg-gray-50'
              }`}
            >
              {cat.label} ({cat.key === 'all' ? stats.total : cat.key === 'unlocked' ? stats.unlocked : stats.locked})
            </button>
          ))}
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredAchievements.map((achievement) => (
            <div
              key={achievement.type}
              className={`p-4 rounded-xl text-center transition-all ${
                achievement.unlocked
                  ? 'bg-gradient-to-br from-yellow-100 to-orange-100 border-2 border-yellow-200 shadow-lg'
                  : 'bg-gray-100 opacity-60'
              }`}
            >
              <div className={`text-5xl mb-3 ${!achievement.unlocked && 'grayscale'}`}>
                {achievement.unlocked ? achievement.icon : '🔒'}
              </div>
              <h3 className={`font-bold text-sm mb-1 ${achievement.unlocked ? 'text-gray-800' : 'text-gray-500'}`}>
                {achievement.name}
              </h3>
              <p className="text-xs text-gray-500 mb-2">{achievement.desc}</p>
              {achievement.unlocked && achievement.unlockedAt && (
                <p className="text-xs text-yellow-600">{achievement.unlockedAt}</p>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
