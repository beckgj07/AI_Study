'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ClayCard, ClayButton, Badge } from '@/components/ClayCard';
import { PageHeader } from '@/components/Layout';
import { SUBJECTS, GRADES, QUESTION_TYPE_LABELS, QUESTION_TYPE_ICONS, DIFFICULTY_LABELS, SUBJECT_QUESTION_TYPES } from '@/lib/question-types';

interface Chapter {
  id: string;
  name: string;
  difficulty: number;
  completed?: boolean;
  questionCount?: number;
}

interface Unit {
  id: string;
  name: string;
  chapters: Chapter[];
}

interface Subject {
  id: string;
  name: string;
  icon: string;
  units: Unit[];
}

// Mock data
const mockSubjects: Subject[] = [
  {
    id: 'math',
    name: '数学',
    icon: '📐',
    units: [
      {
        id: 'u1',
        name: '第一章 加减法',
        chapters: [
          { id: 'c1', name: '两位数加法', difficulty: 1, completed: true, questionCount: 20 },
          { id: 'c2', name: '两位数减法', difficulty: 1, completed: true, questionCount: 18 },
          { id: 'c3', name: '三位数加减', difficulty: 2, completed: false, questionCount: 15 },
        ],
      },
      {
        id: 'u2',
        name: '第二章 乘法',
        chapters: [
          { id: 'c4', name: '乘法口诀', difficulty: 1, completed: false, questionCount: 25 },
          { id: 'c5', name: '两位数乘法', difficulty: 2, completed: false, questionCount: 12 },
          { id: 'c6', name: '乘法分配律', difficulty: 3, completed: false, questionCount: 10 },
        ],
      },
    ],
  },
  {
    id: 'chinese',
    name: '语文',
    icon: '📖',
    units: [
      {
        id: 'u3',
        name: '第一单元 课文',
        chapters: [
          { id: 'c7', name: '古诗词', difficulty: 1, completed: true, questionCount: 15 },
          { id: 'c8', name: '现代文阅读', difficulty: 2, completed: false, questionCount: 10 },
        ],
      },
    ],
  },
  {
    id: 'english',
    name: '英语',
    icon: '🔤',
    units: [
      {
        id: 'u4',
        name: 'Unit 1 Greetings',
        chapters: [
          { id: 'c9', name: 'Hello!', difficulty: 1, completed: false, questionCount: 20 },
          { id: 'c10', name: 'How are you?', difficulty: 1, completed: false, questionCount: 18 },
        ],
      },
    ],
  },
];

const difficultyLabels = ['基础', '应用', '综合', '拓展'];
const difficultyColors = ['success', 'primary', 'accent', 'error'] as const;

export default function ChallengePage() {
  const [selectedSubject, setSelectedSubject] = useState<string>('math');
  const [showConfig, setShowConfig] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [questionCount, setQuestionCount] = useState(10);
  const [selectedDifficulty, setSelectedDifficulty] = useState(1);
  const [selectedMode, setSelectedMode] = useState<'practice' | 'exam'>('practice');
  const [questionSource, setQuestionSource] = useState<'chapter' | 'bank'>('chapter');

  // 题库模式筛选条件
  const [bankFilters, setBankFilters] = useState({
    subjectId: 'math',
    grade: 3,
    type: 'choice',
    difficulty: 0,
  });

  const currentSubject = mockSubjects.find((s) => s.id === selectedSubject);
  const availableTypes = SUBJECT_QUESTION_TYPES[bankFilters.subjectId] || [];

  const handleStartChallenge = () => {
    if (questionSource === 'chapter' && selectedChapter) {
      window.location.href = `/quiz?chapterId=${selectedChapter.id}&count=${questionCount}&difficulty=${selectedDifficulty}&mode=${selectedMode}`;
    } else if (questionSource === 'bank') {
      const params = new URLSearchParams({
        source: 'bank',
        subjectId: bankFilters.subjectId,
        grade: bankFilters.grade.toString(),
        type: bankFilters.type,
        difficulty: bankFilters.difficulty.toString(),
        count: questionCount.toString(),
        mode: selectedMode,
      });
      window.location.href = `/quiz?${params.toString()}`;
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
              <h1 className="font-bold text-xl text-gray-800">闯关测验</h1>
            </div>
            <Badge variant="accent">🔥 7天连续</Badge>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <PageHeader title="选择关卡" subtitle="完成关卡解锁下一章" />

        {/* Question Source Toggle */}
        <ClayCard className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg font-bold text-gray-800">📋 题目来源</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setQuestionSource('chapter')}
              className={`p-4 rounded-xl text-center transition-all ${
                questionSource === 'chapter'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'clay-inset hover:bg-gray-50'
              }`}
            >
              <span className="text-2xl mb-1 block">📖</span>
              <span className="font-medium">教材章节</span>
              <p className="text-xs mt-1 opacity-80">按课本章节顺序练习</p>
            </button>
            <button
              onClick={() => setQuestionSource('bank')}
              className={`p-4 rounded-xl text-center transition-all ${
                questionSource === 'bank'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'clay-inset hover:bg-gray-50'
              }`}
            >
              <span className="text-2xl mb-1 block">📚</span>
              <span className="font-medium">智能题库</span>
              <p className="text-xs mt-1 opacity-80">按条件筛选组卷</p>
            </button>
          </div>
        </ClayCard>

        {/* Question Bank Filters - Only show when bank mode is selected */}
        {questionSource === 'bank' && (
          <ClayCard className="mb-6 bg-gradient-to-br from-indigo-50 to-blue-50">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg font-bold text-gray-800">🎯 智能组卷</span>
              <Badge variant="primary">按条件筛选</Badge>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">科目</label>
                <select
                  value={bankFilters.subjectId}
                  onChange={(e) => setBankFilters({ ...bankFilters, subjectId: e.target.value, type: '' })}
                  className="w-full p-2.5 clay-input text-sm"
                >
                  {SUBJECTS.map(s => (
                    <option key={s.id} value={s.id}>{s.icon} {s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">年级</label>
                <select
                  value={bankFilters.grade}
                  onChange={(e) => setBankFilters({ ...bankFilters, grade: parseInt(e.target.value) })}
                  className="w-full p-2.5 clay-input text-sm"
                >
                  {GRADES.map(g => (
                    <option key={g} value={g}>{g}年级</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">题型</label>
                <select
                  value={bankFilters.type}
                  onChange={(e) => setBankFilters({ ...bankFilters, type: e.target.value })}
                  className="w-full p-2.5 clay-input text-sm"
                >
                  <option value="">全部题型</option>
                  {availableTypes.map(t => (
                    <option key={t} value={t}>{QUESTION_TYPE_ICONS[t]} {QUESTION_TYPE_LABELS[t]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">难度</label>
                <select
                  value={bankFilters.difficulty}
                  onChange={(e) => setBankFilters({ ...bankFilters, difficulty: parseInt(e.target.value) })}
                  className="w-full p-2.5 clay-input text-sm"
                >
                  <option value={0}>全部难度</option>
                  {DIFFICULTY_LABELS.map((label, i) => (
                    <option key={i + 1} value={i + 1}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
          </ClayCard>
        )}

        {/* Subject Tabs - Only show when chapter mode is selected */}
        {questionSource === 'chapter' && (
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {mockSubjects.map((subject) => (
            <button
              key={subject.id}
              onClick={() => setSelectedSubject(subject.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl whitespace-nowrap transition-all ${
                selectedSubject === subject.id
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'clay-card hover:bg-gray-50'
              }`}
            >
              <span className="text-xl">{subject.icon}</span>
              <span className="font-medium">{subject.name}</span>
            </button>
          ))}
        </div>
        )}

        {/* Units and Chapters - Only show when chapter mode is selected */}
        {questionSource === 'chapter' && (
          <div className="space-y-6">
          {currentSubject?.units.map((unit) => (
            <ClayCard key={unit.id}>
              <h3 className="font-bold text-lg text-gray-800 mb-4">{unit.name}</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {unit.chapters.map((chapter) => (
                  <button
                    key={chapter.id}
                    onClick={() => {
                      setSelectedChapter(chapter);
                      setShowConfig(true);
                    }}
                    className={`p-4 rounded-xl text-left transition-all ${
                      chapter.completed
                        ? 'bg-green-50 border-2 border-green-200'
                        : 'clay-inset hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="font-medium text-gray-800">{chapter.name}</span>
                      {chapter.completed && <span className="text-green-500">✓</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={difficultyColors[chapter.difficulty - 1] as 'success' | 'primary' | 'accent' | 'error'}
                        className="text-xs"
                      >
                        {difficultyLabels[chapter.difficulty - 1]}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {chapter.questionCount}题
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </ClayCard>
          ))}
        </div>
        )}

        {/* Competition Challenges - Only show when chapter mode is selected */}
        {questionSource === 'chapter' && (
          <ClayCard className="mt-6 bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-200">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">🏅</span>
            <div>
              <h3 className="font-bold text-lg text-gray-800">奥赛挑战</h3>
              <p className="text-sm text-gray-500">更高难度，拓展思维</p>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            <button
              onClick={() => {
                setSelectedChapter({ id: 'comp1', name: '数学奥赛基础', difficulty: 4 });
                setShowConfig(true);
              }}
              className="p-4 rounded-xl bg-white border-2 border-orange-300 hover:border-orange-500 transition-all"
            >
              <span className="text-xl">📐</span>
              <p className="font-medium text-gray-800 mt-2">数学奥赛基础</p>
              <Badge variant="error" className="mt-2">拓展</Badge>
            </button>
            <button
              onClick={() => {
                setSelectedChapter({ id: 'comp2', name: '语文拓展阅读', difficulty: 4 });
                setShowConfig(true);
              }}
              className="p-4 rounded-xl bg-white border-2 border-orange-300 hover:border-orange-500 transition-all"
            >
              <span className="text-xl">📚</span>
              <p className="font-medium text-gray-800 mt-2">语文拓展阅读</p>
              <Badge variant="error" className="mt-2">拓展</Badge>
            </button>
            <button
              onClick={() => {
                setSelectedChapter({ id: 'comp3', name: '英语思维训练', difficulty: 4 });
                setShowConfig(true);
              }}
              className="p-4 rounded-xl bg-white border-2 border-orange-300 hover:border-orange-500 transition-all"
            >
              <span className="text-xl">🔤</span>
              <p className="font-medium text-gray-800 mt-2">英语思维训练</p>
              <Badge variant="error" className="mt-2">拓展</Badge>
            </button>
          </div>
        </ClayCard>
        )}
      </main>

      {/* Challenge Config Modal */}
      {showConfig && selectedChapter && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <ClayCard className="w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-800 mb-4">闯关配置</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  题目数量
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[5, 10, 15, 20].map((n) => (
                    <button
                      key={n}
                      onClick={() => setQuestionCount(n)}
                      className={`p-3 rounded-xl text-center font-medium transition-all ${
                        questionCount === n
                          ? 'bg-blue-500 text-white'
                          : 'clay-inset hover:bg-gray-50'
                      }`}
                    >
                      {n}题
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  难度等级
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {difficultyLabels.map((label, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedDifficulty(i + 1)}
                      className={`p-3 rounded-xl text-center font-medium transition-all ${
                        selectedDifficulty === i + 1
                          ? 'bg-blue-500 text-white'
                          : 'clay-inset hover:bg-gray-50'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  答题模式
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSelectedMode('practice')}
                    className={`p-4 rounded-xl text-center transition-all ${
                      selectedMode === 'practice'
                        ? 'bg-green-500 text-white'
                        : 'clay-inset hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-2xl mb-1 block">📖</span>
                    <span className="font-medium">练习模式</span>
                    <p className="text-xs mt-1 opacity-80">随时可退出</p>
                  </button>
                  <button
                    onClick={() => setSelectedMode('exam')}
                    className={`p-4 rounded-xl text-center transition-all ${
                      selectedMode === 'exam'
                        ? 'bg-red-500 text-white'
                        : 'clay-inset hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-2xl mb-1 block">📝</span>
                    <span className="font-medium">考试模式</span>
                    <p className="text-xs mt-1 opacity-80">全屏专注</p>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <ClayButton
                variant="secondary"
                className="flex-1"
                onClick={() => setShowConfig(false)}
              >
                取消
              </ClayButton>
              <ClayButton className="flex-1" onClick={handleStartChallenge}>
                开始闯关
              </ClayButton>
            </div>
          </ClayCard>
        </div>
      )}
    </div>
  );
}
