'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ClayCard, ClayButton, Badge, ProgressBar } from '@/components/ClayCard';
import { PageHeader } from '@/components/Layout';

export default function ReportPage() {
  const [period, setPeriod] = useState('week');

  const stats = {
    totalQuestions: 256,
    correctRate: 78,
    totalTime: '12h',
    streak: 7,
    points: 1250,
    achievements: 12,
  };

  const weeklyProgress = [
    { day: '一', rate: 75 },
    { day: '二', rate: 82 },
    { day: '三', rate: 68 },
    { day: '四', rate: 90 },
    { day: '五', rate: 85 },
    { day: '六', rate: 78 },
    { day: '日', rate: 92 },
  ];

  const subjectStats = [
    { name: '数学', icon: '📐', rate: 82, trend: '+5%' },
    { name: '语文', icon: '📖', rate: 75, trend: '+3%' },
    { name: '英语', icon: '🔤', rate: 68, trend: '+8%' },
  ];

  const topWrongTopics = [
    { topic: '乘法分配律', subject: '数学', wrongCount: 5 },
    { topic: '分数加减', subject: '数学', wrongCount: 4 },
    { topic: '古诗词理解', subject: '语文', wrongCount: 3 },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/parent" className="text-2xl">←</Link>
              <h1 className="font-bold text-xl text-gray-800">学习报告</h1>
            </div>
            <Badge variant="primary">本周</Badge>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <PageHeader title="学习数据分析" subtitle="全面了解学习情况" />

        {/* Period Filter */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'week', label: '本周' },
            { key: 'month', label: '本月' },
            { key: 'all', label: '全部' },
          ].map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                period === p.key
                  ? 'bg-blue-500 text-white'
                  : 'clay-card hover:bg-gray-50'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <ClayCard className="text-center">
            <div className="text-3xl mb-2">📝</div>
            <div className="text-2xl font-bold text-gray-800">{stats.totalQuestions}</div>
            <div className="text-sm text-gray-500">总题数</div>
          </ClayCard>
          <ClayCard className="text-center">
            <div className="text-3xl mb-2">✅</div>
            <div className="text-2xl font-bold text-green-500">{stats.correctRate}%</div>
            <div className="text-sm text-gray-500">正确率</div>
          </ClayCard>
          <ClayCard className="text-center">
            <div className="text-3xl mb-2">⏱️</div>
            <div className="text-2xl font-bold text-gray-800">{stats.totalTime}</div>
            <div className="text-sm text-gray-500">总用时</div>
          </ClayCard>
          <ClayCard className="text-center border-2 border-orange-200">
            <div className="text-3xl mb-2">🔥</div>
            <div className="text-2xl font-bold text-orange-500">{stats.streak}天</div>
            <div className="text-sm text-gray-500">连续学习</div>
          </ClayCard>
          <ClayCard className="text-center">
            <div className="text-3xl mb-2">⭐</div>
            <div className="text-2xl font-bold text-blue-500">{stats.points}</div>
            <div className="text-sm text-gray-500">积分</div>
          </ClayCard>
        </div>

        {/* Weekly Progress Chart */}
        <ClayCard className="mb-6">
          <h3 className="font-bold text-gray-800 mb-4">本周正确率趋势</h3>
          <div className="flex items-end justify-between gap-2 h-40">
            {weeklyProgress.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-gray-100 rounded-t-lg relative" style={{ height: `${day.rate}%` }}>
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all"
                    style={{ height: `${day.rate}%` }}
                  />
                </div>
                <span className="text-sm text-gray-500 mt-2">{day.day}</span>
                <span className="text-xs text-gray-400">{day.rate}%</span>
              </div>
            ))}
          </div>
        </ClayCard>

        {/* Subject Stats */}
        <ClayCard className="mb-6">
          <h3 className="font-bold text-gray-800 mb-4">科目掌握度</h3>
          <div className="space-y-4">
            {subjectStats.map((subject) => (
              <div key={subject.name}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{subject.icon}</span>
                    <span className="font-medium text-gray-800">{subject.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={subject.rate >= 80 ? 'success' : subject.rate >= 60 ? 'accent' : 'error'}>
                      {subject.rate}%
                    </Badge>
                    <span className="text-sm text-green-500">{subject.trend}</span>
                  </div>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      subject.rate >= 80
                        ? 'bg-gradient-to-r from-green-400 to-green-500'
                        : subject.rate >= 60
                        ? 'bg-gradient-to-r from-orange-400 to-orange-500'
                        : 'bg-gradient-to-r from-red-400 to-red-500'
                    }`}
                    style={{ width: `${subject.rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </ClayCard>

        {/* Top Wrong Topics */}
        <ClayCard className="mb-6">
          <h3 className="font-bold text-gray-800 mb-4">易错知识点</h3>
          <div className="space-y-3">
            {topWrongTopics.map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-3 clay-inset">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{item.topic}</p>
                  <p className="text-sm text-gray-500">{item.subject}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-red-500">{item.wrongCount}次</p>
                  <p className="text-xs text-gray-500">错误</p>
                </div>
              </div>
            ))}
          </div>
          <Link href="/wrong">
            <ClayButton variant="secondary" className="w-full mt-4">
              查看全部错题 →
            </ClayButton>
          </Link>
        </ClayCard>

        {/* Achievements Summary */}
        <ClayCard className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">成就进度</h3>
            <Badge variant="accent">{stats.achievements} 已解锁</Badge>
          </div>
          <div className="flex gap-4">
            {['🔥', '🎯', '📝', '💯', '🏆'].map((emoji, i) => (
              <div
                key={i}
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                  i < 3 ? 'bg-white shadow-md' : 'bg-gray-200 opacity-50'
                }`}
              >
                {emoji}
              </div>
            ))}
          </div>
          <Link href="/achievements">
            <ClayButton variant="secondary" className="w-full mt-4">
              查看成就墙 →
            </ClayButton>
          </Link>
        </ClayCard>
      </main>
    </div>
  );
}
