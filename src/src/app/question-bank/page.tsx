'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ClayCard, ClayButton, Badge } from '@/components/ClayCard';
import { PageHeader } from '@/components/Layout';

interface Question {
  id: string;
  type: string;
  difficulty: number;
  content: string;
  options?: string[];
  answer: string;
  subject: string;
  grade: number;
  chapterName?: string;
  createdAt: string;
}

export default function QuestionBankPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filter, setFilter] = useState<'all' | 'math' | 'chinese' | 'english'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 模拟加载题库数据
    const mockQuestions: Question[] = [
      {
        id: '1',
        type: 'choice',
        difficulty: 1,
        content: '12 + 8 = ?',
        options: ['20', '19', '21', '18'],
        answer: '20',
        subject: 'math',
        grade: 3,
        chapterName: '两位数加法',
        createdAt: '2024-03-20',
      },
      {
        id: '2',
        type: 'choice',
        difficulty: 1,
        content: '"春眠不觉晓"下一句是？',
        options: ['处处闻啼鸟', '夜来风雨声', '花落知多少', '鸟鸣山更幽'],
        answer: '处处闻啼鸟',
        subject: 'chinese',
        grade: 3,
        chapterName: '古诗词',
        createdAt: '2024-03-19',
      },
      {
        id: '3',
        type: 'choice',
        difficulty: 1,
        content: '"Hello"的意思是？',
        options: ['你好', '再见', '谢谢', '对不起'],
        answer: '你好',
        subject: 'english',
        grade: 3,
        chapterName: 'Hello!',
        createdAt: '2024-03-18',
      },
      {
        id: '4',
        type: 'choice',
        difficulty: 2,
        content: '25 + 17 = ?',
        options: ['42', '41', '43', '40'],
        answer: '42',
        subject: 'math',
        grade: 3,
        chapterName: '两位数加法',
        createdAt: '2024-03-17',
      },
      {
        id: '5',
        type: 'choice',
        difficulty: 2,
        content: '"举头望明月"的下一句是？',
        options: ['低头思故乡', '海上生明月', '天涯共此时', '月是故乡明'],
        answer: '低头思故乡',
        subject: 'chinese',
        grade: 3,
        chapterName: '古诗词',
        createdAt: '2024-03-16',
      },
    ];

    setTimeout(() => {
      setQuestions(mockQuestions);
      setIsLoading(false);
    }, 500);
  }, []);

  const filteredQuestions = filter === 'all'
    ? questions
    : questions.filter(q => q.subject === filter);

  const subjectLabels = {
    math: '数学',
    chinese: '语文',
    english: '英语',
  };

  const difficultyLabels = ['基础', '应用', '综合', '拓展'];
  const difficultyColors = ['success', 'primary', 'accent', 'error'] as const;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/upload" className="text-2xl">←</Link>
              <h1 className="font-bold text-xl text-gray-800">题库管理</h1>
            </div>
            <Link href="/dashboard" className="text-sm text-blue-500 hover:text-blue-700">返回首页</Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <PageHeader title="我的题库" subtitle="管理从教材中生成的练习题" />

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'all', label: '全部' },
            { key: 'math', label: '📐 数学' },
            { key: 'chinese', label: '📖 语文' },
            { key: 'english', label: '🔤 英语' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key as typeof filter)}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                filter === key
                  ? 'bg-blue-500 text-white'
                  : 'clay-card hover:bg-gray-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Question List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4 animate-bounce">📚</div>
            <p className="text-gray-500">加载中...</p>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <ClayCard className="text-center py-12">
            <div className="text-5xl mb-4">📭</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">暂无题目</h3>
            <p className="text-gray-500 mb-4">上传教材后会自动生成练习题</p>
            <Link href="/upload">
              <ClayButton>去上传教材</ClayButton>
            </Link>
          </ClayCard>
        ) : (
          <div className="space-y-4">
            {filteredQuestions.map((question) => (
              <ClayCard key={question.id} className="hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={difficultyColors[question.difficulty - 1] as 'success' | 'primary' | 'accent' | 'error'}>
                        {difficultyLabels[question.difficulty - 1]}
                      </Badge>
                      <Badge variant="muted">{subjectLabels[question.subject as keyof typeof subjectLabels]}</Badge>
                      <Badge variant="muted">{question.grade}年级</Badge>
                      {question.chapterName && (
                        <Badge variant="primary">{question.chapterName}</Badge>
                      )}
                    </div>

                    <p className="text-lg font-medium text-gray-800 mb-3">{question.content}</p>

                    {question.options && (
                      <div className="grid grid-cols-2 gap-2">
                        {question.options.map((opt, idx) => (
                          <div
                            key={idx}
                            className={`p-3 rounded-xl text-center font-medium ${
                              opt === question.answer
                                ? 'bg-green-100 text-green-700 border-2 border-green-300'
                                : 'bg-gray-50 text-gray-600'
                            }`}
                          >
                            {String.fromCharCode(65 + idx)}. {opt}
                            {opt === question.answer && <span className="ml-2">✓</span>}
                          </div>
                        ))}
                      </div>
                    )}

                    <p className="text-sm text-gray-400 mt-3">
                      创建时间: {question.createdAt}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg">
                      ✏️ 编辑
                    </button>
                    <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                      🗑️ 删除
                    </button>
                  </div>
                </div>
              </ClayCard>
            ))}
          </div>
        )}

        {/* Stats */}
        <ClayCard className="mt-6 bg-gradient-to-br from-blue-50 to-indigo-50">
          <h3 className="font-bold text-gray-800 mb-4">题库统计</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-4 clay-inset">
              <div className="text-2xl font-bold text-blue-500">{questions.length}</div>
              <div className="text-sm text-gray-500">总题数</div>
            </div>
            <div className="text-center p-4 clay-inset">
              <div className="text-2xl font-bold text-green-500">
                {questions.filter(q => q.difficulty === 1).length}
              </div>
              <div className="text-sm text-gray-500">基础题</div>
            </div>
            <div className="text-center p-4 clay-inset">
              <div className="text-2xl font-bold text-orange-500">
                {questions.filter(q => q.difficulty === 2).length}
              </div>
              <div className="text-sm text-gray-500">应用题</div>
            </div>
            <div className="text-center p-4 clay-inset">
              <div className="text-2xl font-bold text-purple-500">
                {questions.filter(q => q.difficulty >= 3).length}
              </div>
              <div className="text-sm text-gray-500">综合题</div>
            </div>
          </div>
        </ClayCard>
      </main>
    </div>
  );
}
