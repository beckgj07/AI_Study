'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ClayCard, ClayButton, Badge, Avatar } from '@/components/ClayCard';
import { PageHeader } from '@/components/Layout';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatar?: string;
  totalPoints: number;
  streak: number;
  correctRate: number;
  isCurrentUser?: boolean;
}

const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, userId: '1', name: '小明', totalPoints: 2560, streak: 15, correctRate: 92, isCurrentUser: true },
  { rank: 2, userId: '2', name: '小红', totalPoints: 2340, streak: 12, correctRate: 88 },
  { rank: 3, userId: '3', name: '小华', totalPoints: 2100, streak: 10, correctRate: 85 },
  { rank: 4, userId: '4', name: '小强', totalPoints: 1890, streak: 8, correctRate: 82 },
  { rank: 5, userId: '5', name: '小丽', totalPoints: 1650, streak: 7, correctRate: 79 },
  { rank: 6, userId: '6', name: '小军', totalPoints: 1420, streak: 6, correctRate: 76 },
  { rank: 7, userId: '7', name: '小芳', totalPoints: 1280, streak: 5, correctRate: 74 },
  { rank: 8, userId: '8', name: '小杰', totalPoints: 1100, streak: 4, correctRate: 71 },
  { rank: 9, userId: '9', name: '小燕', totalPoints: 980, streak: 3, correctRate: 68 },
  { rank: 10, userId: '10', name: '小宇', totalPoints: 850, streak: 2, correctRate: 65 },
];

const tabs = [
  { key: 'points', label: '积分排行' },
  { key: 'streak', label: '连续排行' },
  { key: 'correct', label: '正确率排行' },
];

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState('points');
  const [period, setPeriod] = useState('week');

  const sortedLeaderboard = [...mockLeaderboard].sort((a, b) => {
    switch (activeTab) {
      case 'streak':
        return b.streak - a.streak;
      case 'correct':
        return b.correctRate - a.correctRate;
      default:
        return b.totalPoints - a.totalPoints;
    }
  });

  // Re-rank after sorting
  const rankedLeaderboard = sortedLeaderboard.map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return null;
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
              <h1 className="font-bold text-xl text-gray-800">排行榜</h1>
            </div>
            <Badge variant="accent">本周排行</Badge>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <PageHeader title="学习排行榜" subtitle="和同学们一较高下" />

        {/* Period Filter */}
        <div className="flex gap-2 mb-6">
          {['week', 'month', 'all'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                period === p
                  ? 'bg-blue-500 text-white'
                  : 'clay-card hover:bg-gray-50'
              }`}
            >
              {p === 'week' ? '本周' : p === 'month' ? '本月' : '全部'}
            </button>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-3 rounded-xl font-medium transition-all text-center ${
                activeTab === tab.key
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                  : 'clay-card hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Top 3 */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {rankedLeaderboard.slice(0, 3).map((entry) => (
            <div
              key={entry.userId}
              className={`text-center p-4 rounded-2xl ${
                entry.rank === 1
                  ? 'bg-gradient-to-b from-yellow-100 to-yellow-50 border-2 border-yellow-300 order-2'
                  : entry.rank === 2
                  ? 'bg-gradient-to-b from-gray-100 to-gray-50 border-2 border-gray-300 order-1'
                  : 'bg-gradient-to-b from-orange-100 to-orange-50 border-2 border-orange-300 order-3'
              }`}
            >
              <div className="text-4xl mb-2">{getRankIcon(entry.rank)}</div>
              <Avatar name={entry.name} size="lg" className="mx-auto mb-2" />
              <p className="font-bold text-gray-800">{entry.name}</p>
              <p className="text-sm text-gray-500">
                {activeTab === 'points'
                  ? `${entry.totalPoints} 积分`
                  : activeTab === 'streak'
                  ? `${entry.streak} 天`
                  : `${entry.correctRate}%`}
              </p>
            </div>
          ))}
        </div>

        {/* Leaderboard List */}
        <ClayCard>
          <div className="space-y-3">
            {rankedLeaderboard.map((entry) => (
              <div
                key={entry.userId}
                className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                  entry.isCurrentUser
                    ? 'bg-blue-50 border-2 border-blue-200'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="w-8 h-8 flex items-center justify-center font-bold text-gray-500">
                  {entry.rank <= 3 ? getRankIcon(entry.rank) : entry.rank}
                </div>
                <Avatar name={entry.name} size="md" />
                <div className="flex-1">
                  <p className="font-medium text-gray-800">
                    {entry.name}
                    {entry.isCurrentUser && (
                      <span className="ml-2 text-xs text-blue-500">(我)</span>
                    )}
                  </p>
                  <p className="text-sm text-gray-500">🔥 {entry.streak}天 · ✅ {entry.correctRate}%</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-blue-500">{entry.totalPoints}</p>
                  <p className="text-xs text-gray-500">积分</p>
                </div>
              </div>
            ))}
          </div>
        </ClayCard>
      </main>
    </div>
  );
}
