'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ClayCard, ClayButton, Badge } from '@/components/ClayCard';
import { SUBJECTS, GRADES, TEXTBOOK_VERSIONS, SUBJECT_QUESTION_TYPES, QUESTION_TYPE_LABELS, QUESTION_TYPE_ICONS, DIFFICULTY_LABELS, DIFFICULTY_COLORS } from '@/lib/question-types';

interface Question {
  id: string;
  type: string;
  difficulty: number;
  content: string;
  options?: string;
  answer: string;
  explanation?: string;
  source?: string;
  createdAt: string;
  textbookName?: string;
  textbookId?: string;
  textbookVersion?: string;
  unitName?: string;
}

// 模拟数据 - 按教材分组
const mockTextbooks = [
  { id: '1', name: '三年级数学上册.pdf', unit: '第一章 加减法', version: 'pep' },
  { id: '2', name: '语文教材第三单元.docx', unit: '第三单元', version: 'pep' },
  { id: '3', name: '英语第一单元.docx', unit: 'Unit 1 Greetings', version: 'bsd' },
];

const mockQuestions: Question[] = [
  {
    id: '1',
    type: 'choice',
    difficulty: 1,
    content: '12 + 8 = ?',
    options: JSON.stringify([
      { id: 'A', content: '20', isCorrect: true },
      { id: 'B', content: '19', isCorrect: false },
      { id: 'C', content: '21', isCorrect: false },
      { id: 'D', content: '18', isCorrect: false },
    ]),
    answer: 'A',
    explanation: '这是简单的加法计算。',
    source: 'textbook',
    createdAt: '2024-03-20',
    textbookName: '三年级数学上册.pdf',
    textbookId: '1',
    textbookVersion: 'pep',
    unitName: '第一章 加减法',
  },
  {
    id: '2',
    type: 'calc',
    difficulty: 2,
    content: '25 × 17 = ?',
    options: undefined,
    answer: '425',
    explanation: '25×17=25×10+25×7=250+175=425',
    source: 'textbook',
    createdAt: '2024-03-20',
    textbookName: '三年级数学上册.pdf',
    textbookId: '1',
    textbookVersion: 'pep',
    unitName: '第一章 加减法',
  },
  {
    id: '3',
    type: 'application',
    difficulty: 2,
    content: '小明有12个苹果，小红给了他5个，现在一共有多少个？',
    options: undefined,
    answer: '17个',
    explanation: '12+5=17，用加法计算',
    source: 'textbook',
    createdAt: '2024-03-20',
    textbookName: '三年级数学上册.pdf',
    textbookId: '1',
    textbookVersion: 'pep',
    unitName: '第一章 加减法',
  },
  {
    id: '4',
    type: 'choice',
    difficulty: 1,
    content: '"春眠不觉晓"下一句是？',
    options: JSON.stringify([
      { id: 'A', content: '处处闻啼鸟', isCorrect: true },
      { id: 'B', content: '夜来风雨声', isCorrect: false },
      { id: 'C', content: '花落知多少', isCorrect: false },
      { id: 'D', content: '鸟鸣山更幽', isCorrect: false },
    ]),
    answer: 'A',
    explanation: '出自唐代孟浩然的《春晓》',
    source: 'textbook',
    createdAt: '2024-03-19',
    textbookName: '语文教材第三单元.docx',
    textbookId: '2',
    textbookVersion: 'pep',
    unitName: '第三单元',
  },
  {
    id: '5',
    type: 'reading',
    difficulty: 3,
    content: '阅读下面的短文，回答问题：\n\n春天的早晨，窗外的鸟叫声把我从睡梦中唤醒...',
    options: undefined,
    answer: '（见解析）',
    explanation: '阅读理解需要根据短文内容作答',
    source: 'textbook',
    createdAt: '2024-03-19',
    textbookName: '语文教材第三单元.docx',
    textbookId: '2',
    textbookVersion: 'pep',
    unitName: '第三单元',
  },
  {
    id: '6',
    type: 'fill',
    difficulty: 1,
    content: '25 + 17 = ___',
    options: undefined,
    answer: '42',
    explanation: '25+17=42',
    source: 'textbook',
    createdAt: '2024-03-18',
    textbookName: '三年级数学上册.pdf',
    textbookId: '1',
    textbookVersion: 'pep',
    unitName: '第二章 乘法',
  },
  {
    id: '7',
    type: 'truefalse',
    difficulty: 1,
    content: '判断：3是偶数。',
    options: JSON.stringify([
      { id: 'A', content: '正确', isCorrect: false },
      { id: 'B', content: '错误', isCorrect: true },
    ]),
    answer: 'B',
    explanation: '3是奇数，2是偶数',
    source: 'textbook',
    createdAt: '2024-03-17',
    textbookName: '三年级数学上册.pdf',
    textbookId: '1',
    textbookVersion: 'pep',
    unitName: '第二章 乘法',
  },
  {
    id: '8',
    type: 'choice',
    difficulty: 1,
    content: '"Hello"的意思是？',
    options: JSON.stringify([
      { id: 'A', content: '你好', isCorrect: true },
      { id: 'B', content: '再见', isCorrect: false },
      { id: 'C', content: '谢谢', isCorrect: false },
      { id: 'D', content: '对不起', isCorrect: false },
    ]),
    answer: 'A',
    explanation: 'Hello是英语中最常用的问候语',
    source: 'textbook',
    createdAt: '2024-03-16',
    textbookName: '英语第一单元.docx',
    textbookId: '3',
    textbookVersion: 'bsd',
    unitName: 'Unit 1 Greetings',
  },
];

export default function QuestionBankPage() {
  const [questions] = useState<Question[]>(mockQuestions);
  const [filter, setFilter] = useState({
    subject: '',
    grade: '',
    textbookVersion: '',
    type: '',
    difficulty: '',
    unit: '',
  });
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'all' | 'byTextbook'>('byTextbook');
  const [expandedTextbook, setExpandedTextbook] = useState<string | null>(null);

  // 筛选题目
  const filteredQuestions = questions.filter(q => {
    if (filter.type && q.type !== filter.type) return false;
    if (filter.difficulty && q.difficulty !== parseInt(filter.difficulty)) return false;
    if (filter.unit && q.unitName !== filter.unit) return false;
    if (filter.textbookVersion && q.textbookVersion !== filter.textbookVersion) return false;
    return true;
  });

  // 按教材分组
  const questionsByTextbook = filteredQuestions.reduce((acc, q) => {
    const key = q.textbookName || '未分类';
    if (!acc[key]) {
      acc[key] = {
        textbookName: key,
        textbookId: q.textbookId,
        textbookVersion: q.textbookVersion,
        questions: [],
        unitNames: new Set<string>(),
      };
    }
    acc[key].questions.push(q);
    if (q.unitName) acc[key].unitNames.add(q.unitName);
    return acc;
  }, {} as Record<string, { textbookName: string; textbookId?: string; textbookVersion?: string; questions: Question[]; unitNames: Set<string> }>);

  // 获取所有可用的单元列表
  const availableUnits = Array.from(new Set(questions.map(q => q.unitName).filter(Boolean))) as string[];

  // 统计 - 基于筛选后的题目
  const stats = {
    total: filteredQuestions.length,
    byType: filteredQuestions.reduce((acc, q) => {
      acc[q.type] = (acc[q.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byDifficulty: filteredQuestions.reduce((acc, q) => {
      acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
      return acc;
    }, {} as Record<number, number>),
  };

  // 获取可用题型
  const availableTypes = filter.subject
    ? SUBJECT_QUESTION_TYPES[filter.subject] || []
    : Object.keys(QUESTION_TYPE_LABELS);

  // 渲染题目选项
  const renderOptions = (question: Question) => {
    if (!question.options) return null;

    const options = JSON.parse(question.options);
    return (
      <div className="grid grid-cols-2 gap-2 mt-3">
        {options.map((opt: { id: string; content: string; isCorrect: boolean }) => (
          <div
            key={opt.id}
            className={`p-3 rounded-xl text-center font-medium ${
              opt.isCorrect
                ? 'bg-green-100 text-green-700 border-2 border-green-300'
                : 'bg-gray-50 text-gray-600'
            }`}
          >
            <span className="font-bold mr-2">{opt.id}.</span>
            {opt.content}
            {opt.isCorrect && <span className="ml-2 text-green-500">✓</span>}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <main className="p-6">
        {/* Page Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-1">我的题库</h2>
          <p className="text-gray-500">管理从教材中生成的练习题，支持多种题型筛选</p>
        </div>

        {/* Filters */}
        <ClayCard className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg font-bold text-gray-800">🔍</span>
            <span className="font-semibold text-gray-700">筛选条件</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Subject Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">科目</label>
              <select
                value={filter.subject}
                onChange={(e) => setFilter({ ...filter, subject: e.target.value, type: '' })}
                className="w-full p-2.5 clay-input text-sm"
              >
                <option value="">全部</option>
                {SUBJECTS.map(s => (
                  <option key={s.id} value={s.id}>{s.icon} {s.name}</option>
                ))}
              </select>
            </div>

            {/* Grade Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">年级</label>
              <select
                value={filter.grade}
                onChange={(e) => setFilter({ ...filter, grade: e.target.value })}
                className="w-full p-2.5 clay-input text-sm"
              >
                <option value="">全部</option>
                {GRADES.map(g => (
                  <option key={g} value={g}>{g}年级</option>
                ))}
              </select>
            </div>

            {/* Version Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">教材版本</label>
              <select
                value={filter.textbookVersion}
                onChange={(e) => setFilter({ ...filter, textbookVersion: e.target.value })}
                className="w-full p-2.5 clay-input text-sm"
              >
                <option value="">全部版本</option>
                {TEXTBOOK_VERSIONS.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">题型</label>
              <select
                value={filter.type}
                onChange={(e) => setFilter({ ...filter, type: e.target.value })}
                className="w-full p-2.5 clay-input text-sm"
              >
                <option value="">全部</option>
                {availableTypes.map(t => (
                  <option key={t} value={t}>{QUESTION_TYPE_ICONS[t]} {QUESTION_TYPE_LABELS[t]}</option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">难度</label>
              <select
                value={filter.difficulty}
                onChange={(e) => setFilter({ ...filter, difficulty: e.target.value })}
                className="w-full p-2.5 clay-input text-sm"
              >
                <option value="">全部</option>
                {DIFFICULTY_LABELS.map((label, i) => (
                  <option key={i + 1} value={i + 1}>{label}</option>
                ))}
              </select>
            </div>

            {/* Unit Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">单元</label>
              <select
                value={filter.unit}
                onChange={(e) => setFilter({ ...filter, unit: e.target.value })}
                className="w-full p-2.5 clay-input text-sm"
              >
                <option value="">全部单元</option>
                {availableUnits.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Reset Button */}
          {(filter.subject || filter.grade || filter.type || filter.difficulty || filter.textbookVersion || filter.unit) && (
            <button
              onClick={() => setFilter({ subject: '', grade: '', type: '', difficulty: '', textbookVersion: '', unit: '' })}
              className="mt-4 text-sm text-blue-500 hover:text-blue-700 font-medium"
            >
              重置筛选
            </button>
          )}
        </ClayCard>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {/* Total */}
          <ClayCard className="text-center">
            <div className="text-3xl font-bold text-blue-500">{stats.total}</div>
            <div className="text-sm text-gray-500">总题数</div>
          </ClayCard>

          {/* By Difficulty */}
          {DIFFICULTY_LABELS.map((label, i) => (
            <ClayCard key={label} className="text-center">
              <div className={`text-2xl font-bold text-${DIFFICULTY_COLORS[i]}-500`}>
                {stats.byDifficulty[i + 1] || 0}
              </div>
              <div className="text-sm text-gray-500">{label}</div>
            </ClayCard>
          ))}
        </div>

        {/* Question Types Stats */}
        <ClayCard className="mb-6 bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg font-bold text-gray-800">📊 题型分布</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats.byType).map(([type, count]) => (
              <div
                key={type}
                className="px-3 py-2 bg-white rounded-xl shadow-sm flex items-center gap-2"
              >
                <span className="text-lg">{QUESTION_TYPE_ICONS[type]}</span>
                <span className="font-medium text-gray-700">{QUESTION_TYPE_LABELS[type]}</span>
                <Badge variant="primary">{count}</Badge>
              </div>
            ))}
          </div>
        </ClayCard>

        {/* View Mode Toggle */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">
            {viewMode === 'byTextbook' ? '📚 按教材查看' : '📋 所有题目'}
            <span className="text-gray-500 font-normal ml-2">({filteredQuestions.length}题)</span>
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('byTextbook')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === 'byTextbook'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              按教材
            </button>
            <button
              onClick={() => setViewMode('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              全部
            </button>
          </div>
        </div>

        {/* Question List */}
        {filteredQuestions.length === 0 ? (
          <ClayCard className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center">
              <span className="text-4xl">📭</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">暂无题目</h3>
            <p className="text-gray-500 mb-4">请先上传教材生成练习题</p>
            <Link href="/upload">
              <ClayButton>去上传教材</ClayButton>
            </Link>
          </ClayCard>
        ) : viewMode === 'byTextbook' ? (
          /* Grouped by Textbook View */
          <div className="space-y-6">
            {Object.entries(questionsByTextbook).map(([textbookName, group]) => {
              const isExpanded = expandedTextbook === textbookName;
              return (
                <ClayCard key={textbookName}>
                  {/* Textbook Header */}
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setExpandedTextbook(isExpanded ? null : textbookName)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${
                        isExpanded ? 'bg-blue-500 text-white' : 'bg-gradient-to-br from-blue-100 to-blue-200'
                      }`}>
                        📄
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800">{textbookName}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>{group.questions.length}题</span>
                          {group.unitNames.size > 0 && (
                            <>
                              <span>·</span>
                              <span>{Array.from(group.unitNames).join(', ')}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className={`w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center transition-transform ${
                      isExpanded ? 'rotate-180' : ''
                    }`}>
                      <span className="text-gray-500">▼</span>
                    </div>
                  </div>

                  {/* Questions in Group */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                      {group.questions.map(question => {
                        const isQExpanded = expandedQuestion === question.id;
                        return (
                          <div
                            key={question.id}
                            className={`p-4 rounded-xl transition-all ${
                              isQExpanded ? 'bg-blue-50' : 'bg-gray-50 hover:bg-gray-100'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${
                                question.difficulty <= 1
                                  ? 'bg-green-100'
                                  : question.difficulty === 2
                                  ? 'bg-blue-100'
                                  : 'bg-orange-100'
                              }`}>
                                {QUESTION_TYPE_ICONS[question.type]}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <Badge variant={DIFFICULTY_COLORS[question.difficulty - 1] as 'success' | 'primary' | 'accent'}>
                                    {DIFFICULTY_LABELS[question.difficulty - 1]}
                                  </Badge>
                                  <Badge variant="muted">{QUESTION_TYPE_LABELS[question.type]}</Badge>
                                  {question.unitName && (
                                    <span className="text-xs text-gray-500">📍 {question.unitName}</span>
                                  )}
                                </div>
                                <p className="text-gray-800 font-medium">{question.content}</p>

                                {isQExpanded && (
                                  <div className="mt-3 space-y-2">
                                    {question.type === 'choice' || question.type === 'truefalse' ? (
                                      renderOptions(question)
                                    ) : (
                                      <div className="p-3 bg-green-50 rounded-lg">
                                        <span className="text-sm font-medium text-green-700">答案: {question.answer}</span>
                                      </div>
                                    )}
                                    {question.explanation && (
                                      <div className="p-3 bg-blue-50 rounded-lg">
                                        <span className="text-sm text-blue-700">💡 {question.explanation}</span>
                                      </div>
                                    )}
                                    <div className="flex gap-2 pt-2">
                                      <button className="px-3 py-1.5 rounded-lg bg-white text-blue-600 hover:bg-blue-100 transition-colors text-sm">
                                        ✏️ 编辑
                                      </button>
                                      <button className="px-3 py-1.5 rounded-lg bg-white text-red-600 hover:bg-red-100 transition-colors text-sm">
                                        🗑️ 删除
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedQuestion(isQExpanded ? null : question.id);
                                }}
                                className="w-8 h-8 rounded-lg bg-white shadow flex items-center justify-center"
                              >
                                <span className={`text-gray-500 transition-transform ${isQExpanded ? 'rotate-180' : ''}`}>▼</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </ClayCard>
              );
            })}
          </div>
        ) : (
          /* All Questions View */
          <div className="space-y-4">
            {filteredQuestions.map(question => {
              const isExpanded = expandedQuestion === question.id;

              return (
                <ClayCard
                  key={question.id}
                  className={`hover:shadow-lg transition-all cursor-pointer ${
                    isExpanded ? 'ring-2 ring-blue-400' : ''
                  }`}
                  onClick={() => setExpandedQuestion(isExpanded ? null : question.id)}
                >
                  {/* Question Header */}
                  <div className="flex items-start gap-3 mb-3">
                    {/* Question Type Icon */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${
                      question.difficulty <= 1
                        ? 'bg-green-100'
                        : question.difficulty === 2
                        ? 'bg-blue-100'
                        : question.difficulty === 3
                        ? 'bg-orange-100'
                        : 'bg-red-100'
                    }`}>
                      {QUESTION_TYPE_ICONS[question.type]}
                    </div>

                    {/* Question Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <Badge variant={DIFFICULTY_COLORS[question.difficulty - 1] as 'success' | 'primary' | 'accent' | 'error'}>
                          {DIFFICULTY_LABELS[question.difficulty - 1]}
                        </Badge>
                        <Badge variant="muted">{QUESTION_TYPE_LABELS[question.type]}</Badge>
                        {question.textbookName && (
                          <Badge variant="primary">
                            📄 {question.textbookName}
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-800 font-medium">{question.content}</p>
                    </div>

                    {/* Expand Icon */}
                    <div className={`w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center transition-transform ${
                      isExpanded ? 'rotate-180' : ''
                    }`}>
                      <span className="text-gray-500">▼</span>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      {/* Options for choice/truefalse */}
                      {question.type === 'choice' || question.type === 'truefalse' ? (
                        renderOptions(question)
                      ) : (
                        /* Answer for other types */
                        <div className="p-4 bg-green-50 rounded-xl">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg font-bold text-green-600">✓</span>
                            <span className="font-semibold text-green-700">正确答案</span>
                          </div>
                          <p className="text-lg text-green-800 font-medium">{question.answer}</p>
                        </div>
                      )}

                      {/* Explanation */}
                      {question.explanation && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-xl">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">💡</span>
                            <span className="font-semibold text-blue-700">解析</span>
                          </div>
                          <p className="text-blue-800">{question.explanation}</p>
                        </div>
                      )}

                      {/* Meta */}
                      <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
                        <span>创建时间: {question.createdAt}</span>
                        <div className="flex gap-2">
                          <button className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                            ✏️ 编辑
                          </button>
                          <button className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                            🗑️ 删除
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </ClayCard>
              );
            })}
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4 mt-6">
          <Link href="/upload">
            <ClayCard className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center text-xl">
                  📤
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">上传教材</h4>
                  <p className="text-sm text-gray-500">生成更多练习题</p>
                </div>
              </div>
            </ClayCard>
          </Link>

          <Link href="/challenge">
            <ClayCard className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center text-xl">
                  🎯
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">开始闯关</h4>
                  <p className="text-sm text-gray-500">用题库练习</p>
                </div>
              </div>
            </ClayCard>
          </Link>

          <Link href="/wrong">
            <ClayCard className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 rounded-xl flex items-center justify-center text-xl">
                  ❌
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">错题本</h4>
                  <p className="text-sm text-gray-500">巩固薄弱知识点</p>
                </div>
              </div>
            </ClayCard>
          </Link>
        </div>
      </main>
    </div>
  );
}
