'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ClayCard, ClayButton, Badge } from '@/components/ClayCard';
import { PageHeader } from '@/components/Layout';

interface ChapterNode {
  id: string;
  name: string;
  difficulty: 1 | 2 | 3 | 4;
  status: 'locked' | 'available' | 'completed';
  position: { x: number; y: number };
}

interface SubjectMap {
  id: string;
  name: string;
  icon: string;
  chapters: ChapterNode[];
}

const mockMap: SubjectMap = {
  id: 'math',
  name: '数学',
  icon: '📐',
  chapters: [
    { id: '1', name: '加法入门', difficulty: 1, status: 'completed', position: { x: 0, y: 0 } },
    { id: '2', name: '减法入门', difficulty: 1, status: 'completed', position: { x: 1, y: 0 } },
    { id: '3', name: '加减混合', difficulty: 1, status: 'available', position: { x: 2, y: 0 } },
    { id: '4', name: '乘法口诀', difficulty: 1, status: 'available', position: { x: 3, y: 0 } },
    { id: '5', name: '除法基础', difficulty: 2, status: 'locked', position: { x: 4, y: 0 } },
    { id: '6', name: '乘法进阶', difficulty: 2, status: 'locked', position: { x: 0, y: 1 } },
    { id: '7', name: '除法进阶', difficulty: 2, status: 'locked', position: { x: 1, y: 1 } },
    { id: '8', name: '分数基础', difficulty: 3, status: 'locked', position: { x: 2, y: 1 } },
    { id: '9', name: '分数运算', difficulty: 3, status: 'locked', position: { x: 3, y: 1 } },
    { id: '10', name: '奥赛初级', difficulty: 4, status: 'locked', position: { x: 4, y: 1 } },
  ],
};

const difficultyLabels = ['基础', '应用', '综合', '拓展'];
const difficultyColors = ['text-green-500', 'text-blue-500', 'text-orange-500', 'text-red-500'];

export default function MapPage() {
  const [selectedSubject, setSelectedSubject] = useState('math');
  const [selectedChapter, setSelectedChapter] = useState<ChapterNode | null>(null);

  const currentMap = mockMap;

  const getStatusIcon = (status: ChapterNode['status']) => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'available':
        return '🎯';
      case 'locked':
        return '🔒';
    }
  };

  const getStatusColor = (status: ChapterNode['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 border-green-300';
      case 'available':
        return 'bg-blue-100 border-blue-300';
      case 'locked':
        return 'bg-gray-100 border-gray-300 opacity-60';
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
              <h1 className="font-bold text-xl text-gray-800">知识地图</h1>
            </div>
            <Badge variant="primary">{currentMap.name}</Badge>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <PageHeader title="探索知识星球" subtitle="完成章节解锁下一关" />

        {/* Progress Overview */}
        <ClayCard className="mb-6 bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-4xl">{currentMap.icon}</span>
              <div>
                <h3 className="font-bold text-gray-800">{currentMap.name}</h3>
                <p className="text-sm text-gray-500">
                  已完成 {currentMap.chapters.filter(c => c.status === 'completed').length}/{currentMap.chapters.length} 章节
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-500">
                {Math.round((currentMap.chapters.filter(c => c.status === 'completed').length / currentMap.chapters.length) * 100)}%
              </div>
              <p className="text-sm text-gray-500">完成度</p>
            </div>
          </div>
        </ClayCard>

        {/* Map Grid */}
        <ClayCard>
          <h3 className="font-bold text-gray-800 mb-4">章节进度</h3>
          <div className="grid grid-cols-5 gap-4">
            {currentMap.chapters.map((chapter) => (
              <button
                key={chapter.id}
                onClick={() => chapter.status !== 'locked' && setSelectedChapter(chapter)}
                disabled={chapter.status === 'locked'}
                className={`
                  p-4 rounded-xl border-2 text-center transition-all
                  ${getStatusColor(chapter.status)}
                  ${chapter.status !== 'locked' ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed'}
                `}
              >
                <div className="text-3xl mb-2">{getStatusIcon(chapter.status)}</div>
                <p className={`font-medium text-sm ${chapter.status === 'locked' ? 'text-gray-400' : 'text-gray-800'}`}>
                  {chapter.name}
                </p>
                <p className={`text-xs mt-1 ${difficultyColors[chapter.difficulty - 1]}`}>
                  {difficultyLabels[chapter.difficulty - 1]}
                </p>
              </button>
            ))}
          </div>
        </ClayCard>

        {/* Chapter Detail Modal */}
        {selectedChapter && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <ClayCard className="w-full max-w-md">
              <div className="text-center">
                <div className="text-5xl mb-4">{getStatusIcon(selectedChapter.status)}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{selectedChapter.name}</h3>
                <Badge variant={selectedChapter.status === 'completed' ? 'success' : 'primary'}>
                  {difficultyLabels[selectedChapter.difficulty - 1]}
                </Badge>
              </div>

              <div className="mt-6 space-y-3">
                <div className="clay-inset p-3">
                  <p className="text-sm text-gray-500">包含内容</p>
                  <p className="font-medium text-gray-800">
                    {selectedChapter.difficulty === 1 && '10以内加减法、简单应用题'}
                    {selectedChapter.difficulty === 2 && '两位数运算、简单乘除'}
                    {selectedChapter.difficulty === 3 && '分数运算、综合应用'}
                    {selectedChapter.difficulty === 4 && '奥赛拓展思维训练'}
                  </p>
                </div>
                <div className="clay-inset p-3">
                  <p className="text-sm text-gray-500">预计题目</p>
                  <p className="font-medium text-gray-800">15-20 道练习题</p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <ClayButton variant="secondary" className="flex-1" onClick={() => setSelectedChapter(null)}>
                  返回
                </ClayButton>
                <Link href={`/quiz?chapterId=${selectedChapter.id}&difficulty=${selectedChapter.difficulty}`} className="flex-1">
                  <ClayButton className="w-full">开始学习</ClayButton>
                </Link>
              </div>
            </ClayCard>
          </div>
        )}

        {/* Legend */}
        <ClayCard className="mt-6">
          <h3 className="font-bold text-gray-800 mb-3">图例</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">✅</span>
              <span className="text-sm text-gray-600">已完成</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🎯</span>
              <span className="text-sm text-gray-600">可挑战</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🔒</span>
              <span className="text-sm text-gray-600">未解锁</span>
            </div>
          </div>
        </ClayCard>
      </main>
    </div>
  );
}
