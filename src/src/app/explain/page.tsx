'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ClayCard, ClayButton, Badge } from '@/components/ClayCard';
import { PageHeader } from '@/components/Layout';

interface Question {
  id: string;
  content: string;
  options?: string[];
  answer: string;
  explanation: string;
  knowledgePoint: string;
}

const mockQuestion: Question = {
  id: '1',
  content: '小明有 12 颗糖果，小红比小明多 8 颗，小红有多少颗糖果？',
  options: ['16颗', '18颗', '20颗', '22颗'],
  answer: '20颗',
  explanation: `这道题考查的是加减法的应用。

解题思路：
1. 首先找出已知条件：小明有12颗糖果
2. 关键句：小红比小明多8颗
3. "比...多"意味着加法运算
4. 计算：小红的糖果 = 小明的糖果 + 8 = 12 + 8 = 20颗

所以答案是20颗，选择C选项。

小提示：遇到"比...多"要加法，"比...少"要减法哦！`,
  knowledgePoint: '加减法应用 - 多少问题',
};

export default function ExplainPage() {
  const [showHint, setShowHint] = useState(false);
  const [understood, setUnderstood] = useState(false);

  const question = mockQuestion;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/wrong" className="text-2xl">←</Link>
              <h1 className="font-bold text-xl text-gray-800">AI 讲解</h1>
            </div>
            <Badge variant="primary">智能分析</Badge>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <PageHeader title="错题讲解" subtitle="AI老师为你详细分析" />

        {/* Question Card */}
        <ClayCard className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="error">答错</Badge>
            <Badge variant="muted">数学</Badge>
            <Badge variant="muted">三年级</Badge>
          </div>

          <p className="text-lg font-medium text-gray-800 mb-6">{question.content}</p>

          {/* Options */}
          <div className="space-y-2">
            {question.options?.map((opt, i) => {
              const isCorrect = opt === question.answer;
              const label = String.fromCharCode(65 + i);
              return (
                <div
                  key={i}
                  className={`p-3 rounded-xl border-2 ${
                    isCorrect
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 text-gray-600 font-bold mr-2 text-sm">
                    {label}
                  </span>
                  {opt}
                  {isCorrect && <span className="ml-2 text-green-500">✓ 正确答案</span>}
                </div>
              );
            })}
          </div>
        </ClayCard>

        {/* AI Explanation */}
        <ClayCard className="mb-6 bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xl">
              🤖
            </div>
            <div>
              <h3 className="font-bold text-gray-800">AI老师讲解</h3>
              <p className="text-sm text-gray-500">小明同学，让我来帮你分析这道题~</p>
            </div>
          </div>

          <div className="clay-inset p-4">
            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
              {question.explanation}
            </div>
          </div>
        </ClayCard>

        {/* Knowledge Point */}
        <ClayCard className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">📚</span>
            <h3 className="font-bold text-gray-800">相关知识点</h3>
          </div>
          <Badge variant="primary" className="text-base px-4 py-2">
            {question.knowledgePoint}
          </Badge>
          <p className="text-sm text-gray-500 mt-3">
            掌握这个知识点后，可以尝试更多相关练习题来巩固提高~
          </p>
        </ClayCard>

        {/* Hint Section */}
        {!showHint && !understood && (
          <div className="text-center mb-6">
            <button
              onClick={() => setShowHint(true)}
              className="text-blue-500 hover:text-blue-600 font-medium"
            >
              💡 还有不明白？点击查看更多提示
            </button>
          </div>
        )}

        {showHint && (
          <ClayCard className="mb-6 bg-yellow-50 border-2 border-yellow-200">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">💡</span>
              <h3 className="font-bold text-gray-800">解题小提示</h3>
            </div>
            <ul className="space-y-2 text-gray-700">
              <li>1. 这是一道"比多少"的应用题</li>
              <li>2. 关键词是"比...多"，意味着要做加法</li>
              <li>3. 用小明的糖果数 + 多的部分 = 小红的糖果数</li>
              <li>4. 12 + 8 = ? 可以用竖式计算</li>
            </ul>
          </ClayCard>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Link href="/wrong" className="flex-1">
            <ClayButton variant="secondary" className="w-full">
              返回错题本
            </ClayButton>
          </Link>
          <div className="flex-1">
            <ClayButton
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500"
              onClick={() => setUnderstood(true)}
            >
              ✅ 我懂了，继续下一题
            </ClayButton>
          </div>
        </div>

        {understood && (
          <div className="mt-4 text-center">
            <p className="text-green-600 font-medium mb-3">🎉 太棒了！这道题已经掌握了！</p>
            <Link href="/quiz">
              <ClayButton>开始下一题练习</ClayButton>
            </Link>
          </div>
        )}

        {/* Related Practice */}
        <ClayCard className="mt-6">
          <h3 className="font-bold text-gray-800 mb-3">相关练习</h3>
          <div className="space-y-2">
            {[
              { name: '多少问题专项练', count: 10 },
              { name: '应用题强化训练', count: 15 },
              { name: '易错题巩固', count: 8 },
            ].map((p, i) => (
              <Link key={i} href={`/quiz?type=practice&topic=${p.name}`}>
                <div className="clay-inset p-3 flex items-center justify-between cursor-pointer hover:bg-gray-50">
                  <div>
                    <p className="font-medium text-gray-800">{p.name}</p>
                    <p className="text-sm text-gray-500">{p.count}道练习题</p>
                  </div>
                  <span className="text-gray-400">→</span>
                </div>
              </Link>
            ))}
          </div>
        </ClayCard>
      </main>
    </div>
  );
}
