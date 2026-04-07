'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ClayCard, ClayButton, Badge } from '@/components/ClayCard';
import { PageHeader } from '@/components/Layout';

interface WrongQuestion {
  id: string;
  subject: string;
  chapter: string;
  topic: string;
  wrongCount: number;
  lastReview?: string;
  status: 'review' | 'mastered' | 'new';
}

const mockWrongQuestions: WrongQuestion[] = [
  { id: '1', subject: '数学', chapter: '第一章', topic: '乘法分配律', wrongCount: 2, status: 'review' },
  { id: '2', subject: '数学', chapter: '第二章', topic: '分数加减', wrongCount: 3, status: 'new' },
  { id: '3', subject: '语文', chapter: '第三课', topic: '古诗词理解', wrongCount: 1, status: 'review' },
  { id: '4', subject: '英语', chapter: 'Unit 2', topic: '现在进行时', wrongCount: 2, status: 'mastered' },
];

export default function WrongQuestionsPage() {
  const [filter, setFilter] = useState<'all' | 'review' | 'mastered'>('all');
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);

  const filteredQuestions = mockWrongQuestions.filter((q) => {
    if (filter === 'all') return true;
    return q.status === filter;
  });

  const toggleSelect = (id: string) => {
    setSelectedQuestions((prev) =>
      prev.includes(id) ? prev.filter((q) => q !== id) : [...prev, id]
    );
  };

  const stats = {
    total: mockWrongQuestions.length,
    toReview: mockWrongQuestions.filter((q) => q.status === 'review').length,
    mastered: mockWrongQuestions.filter((q) => q.status === 'mastered').length,
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="text-2xl">←</Link>
              <h1 className="font-bold text-xl text-gray-800">错题本</h1>
            </div>
            <Badge variant="error">{stats.toReview} 题待巩固</Badge>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <PageHeader title="错题回顾" subtitle="巩固练习，防止遗忘" />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <ClayCard className="text-center">
            <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
            <div className="text-sm text-gray-500">错题总数</div>
          </ClayCard>
          <ClayCard className="text-center border-2 border-red-200">
            <div className="text-2xl font-bold text-red-500">{stats.toReview}</div>
            <div className="text-sm text-gray-500">待巩固</div>
          </ClayCard>
          <ClayCard className="text-center border-2 border-green-200">
            <div className="text-2xl font-bold text-green-500">{stats.mastered}</div>
            <div className="text-sm text-gray-500">已掌握</div>
          </ClayCard>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'all', label: '全部', count: stats.total },
            { key: 'review', label: '待巩固', count: stats.toReview },
            { key: 'mastered', label: '已掌握', count: stats.mastered },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as typeof filter)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === tab.key
                  ? 'bg-blue-500 text-white'
                  : 'clay-card hover:bg-gray-50'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Wrong Questions List */}
        <div className="space-y-3">
          {filteredQuestions.map((q) => (
            <ClayCard
              key={q.id}
              className={`cursor-pointer transition-all ${
                selectedQuestions.includes(q.id) ? 'ring-2 ring-blue-400' : ''
              }`}
              onClick={() => toggleSelect(q.id)}
            >
              <div className="flex items-start gap-4">
                {/* Checkbox */}
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1 transition-all ${
                    selectedQuestions.includes(q.id)
                      ? 'bg-blue-500 border-blue-500'
                      : 'border-gray-300'
                  }`}
                >
                  {selectedQuestions.includes(q.id) && (
                    <span className="text-white text-sm">✓</span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="primary">{q.subject}</Badge>
                    <span className="text-sm text-gray-500">{q.chapter}</span>
                    {q.status === 'mastered' && (
                      <Badge variant="success">已掌握</Badge>
                    )}
                    {q.status === 'review' && (
                      <Badge variant="error">待巩固</Badge>
                    )}
                  </div>
                  <p className="font-medium text-gray-800">{q.topic}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    错误次数：{q.wrongCount}次
                    {q.lastReview && ` · 上次复习：${q.lastReview}`}
                  </p>
                </div>

                {/* Arrow */}
                <span className="text-gray-400">→</span>
              </div>
            </ClayCard>
          ))}
        </div>

        {filteredQuestions.length === 0 && (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🎉</div>
            <p className="text-gray-500">太棒了，没有错题！</p>
          </div>
        )}

        {/* Practice Button */}
        {selectedQuestions.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
              <span className="text-gray-600">
                已选择 {selectedQuestions.length} 题
              </span>
              <Link
                href={`/quiz?wrongIds=${selectedQuestions.join(',')}&mode=practice`}
              >
                <ClayButton>开始巩固练习</ClayButton>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
