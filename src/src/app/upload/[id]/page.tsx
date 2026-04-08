'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ClayCard, ClayButton, Badge, ProgressBar } from '@/components/ClayCard';
import { QUESTION_TYPE_LABELS, QUESTION_TYPE_ICONS, DIFFICULTY_LABELS, DIFFICULTY_COLORS, SUBJECTS } from '@/lib/question-types';

interface UploadFile {
  id: string;
  fileName: string;
  fileSize: number;
  subjectId: string;
  grade: number;
  textbookVersionId?: string;
  status: string;
  parseProgress: number;
  generatedQuestions: number;
  questionTypes?: string;
  createdAt: string;
}

interface Question {
  id: string;
  type: string;
  difficulty: number;
  content: string;
  options?: string;
  answer: string;
  explanation?: string;
}

// 模拟数据
const mockFile: UploadFile = {
  id: '1',
  fileName: '三年级数学上册.pdf',
  fileSize: 2.5 * 1024 * 1024,
  subjectId: 'math',
  grade: 3,
  textbookVersionId: 'pep',
  status: 'completed',
  parseProgress: 100,
  generatedQuestions: 45,
  questionTypes: JSON.stringify({
    questionTypes: ['choice', 'fill', 'calc', 'application'],
    difficultyDistribution: [true, true, false, false],
    countPerType: 10,
  }),
  createdAt: '2024-03-20',
};

const mockQuestions: Question[] = [
  { id: '1', type: 'choice', difficulty: 1, content: '12 + 8 = ?', options: JSON.stringify([{ id: 'A', content: '20', isCorrect: true }, { id: 'B', content: '19', isCorrect: false }, { id: 'C', content: '21', isCorrect: false }, { id: 'D', content: '18', isCorrect: false }]), answer: 'A', explanation: '12+8=20' },
  { id: '2', type: 'choice', difficulty: 1, content: '15 - 7 = ?', options: JSON.stringify([{ id: 'A', content: '6', isCorrect: false }, { id: 'B', content: '7', isCorrect: false }, { id: 'C', content: '8', isCorrect: true }, { id: 'D', content: '9', isCorrect: false }]), answer: 'C', explanation: '15-7=8' },
  { id: '3', type: 'choice', difficulty: 2, content: '25 × 4 = ?', options: JSON.stringify([{ id: 'A', content: '90', isCorrect: false }, { id: 'B', content: '100', isCorrect: true }, { id: 'C', content: '110', isCorrect: false }, { id: 'D', content: '80', isCorrect: false }]), answer: 'B', explanation: '25×4=100' },
  { id: '4', type: 'fill', difficulty: 1, content: '18 + 24 = ___', answer: '42', explanation: '18+24=42' },
  { id: '5', type: 'fill', difficulty: 2, content: '56 - ___ = 28', answer: '28', explanation: '56-28=28' },
  { id: '6', type: 'calc', difficulty: 1, content: '计算: 36 + 57 = ?', answer: '93', explanation: '36+57=93' },
  { id: '7', type: 'calc', difficulty: 2, content: '计算: 125 × 4 = ?', answer: '500', explanation: '125×4=500' },
  { id: '8', type: 'application', difficulty: 2, content: '小明有23个苹果，小红又给了他15个，现在一共有多少个？', answer: '38个', explanation: '23+15=38，用加法计算' },
  { id: '9', type: 'application', difficulty: 3, content: '学校组织春游，三年级有45人，四年级有38人，一共需要几辆能坐50人的大巴车？', answer: '2辆', explanation: '(45+38)÷50=1.66，需要2辆车' },
];

export default function UploadDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [file, setFile] = useState<UploadFile | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);

  useEffect(() => {
    // 模拟加载数据
    setTimeout(() => {
      setFile(mockFile);
      setQuestions(mockQuestions);
      setLoading(false);
    }, 500);
  }, [id]);

  // 按题型分组
  const questionsByType = questions.reduce((acc, q) => {
    if (!acc[q.type]) acc[q.type] = [];
    acc[q.type].push(q);
    return acc;
  }, {} as Record<string, Question[]>);

  // 过滤题目
  const filteredQuestions = selectedType === 'all'
    ? questions
    : questions.filter(q => q.type === selectedType);

  // 统计
  const stats = {
    total: questions.length,
    byType: Object.entries(questionsByType).map(([type, qs]) => ({
      type,
      count: qs.length,
      icon: QUESTION_TYPE_ICONS[type],
      label: QUESTION_TYPE_LABELS[type],
    })),
    byDifficulty: [1, 2, 3].map(d => ({
      difficulty: d,
      label: DIFFICULTY_LABELS[d - 1],
      count: questions.filter(q => q.difficulty === d).length,
    })),
  };

  // 获取科目信息
  const getSubjectInfo = (subjectId: string) => SUBJECTS.find(s => s.id === subjectId) || { name: subjectId, icon: '📄' };

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // 渲染选项
  const renderOptions = (question: Question) => {
    if (!question.options) return null;
    const options = JSON.parse(question.options);
    return (
      <div className="grid grid-cols-2 gap-2 mt-3">
        {options.map((opt: { id: string; content: string; isCorrect: boolean }) => (
          <div
            key={opt.id}
            className={`p-2.5 rounded-lg text-center text-sm font-medium ${
              opt.isCorrect
                ? 'bg-green-100 text-green-700 border-2 border-green-300'
                : 'bg-gray-50 text-gray-600'
            }`}
          >
            {opt.id}. {opt.content}
            {opt.isCorrect && <span className="ml-1 text-green-500">✓</span>}
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center">
            <span className="text-4xl animate-bounce">📚</span>
          </div>
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  if (!file) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center">
            <span className="text-4xl">📭</span>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">教材不存在</h3>
          <Link href="/upload">
            <ClayButton>返回上传页</ClayButton>
          </Link>
        </div>
      </div>
    );
  }

  const subjectInfo = getSubjectInfo(file.subjectId);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/upload" className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors">
                <span className="text-xl">←</span>
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white">
                  📄
                </div>
                <h1 className="font-bold text-xl text-gray-800">教材详情</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={file.status === 'completed' ? 'success' : 'primary'}>
                {file.status === 'completed' ? '✓ 已完成' : '生成中'}
              </Badge>
              <Link href="/dashboard" className="text-sm text-blue-500 hover:text-blue-700 font-medium">
                返回首页
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* File Info Card */}
        <ClayCard className="mb-6">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0">
              📄
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-gray-800 mb-2">{file.fileName}</h2>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-3">
                <span className="flex items-center gap-1">
                  {subjectInfo.icon} {subjectInfo.name}
                </span>
                <span>·</span>
                <span>{file.grade}年级</span>
                <span>·</span>
                <span>人教版</span>
                <span>·</span>
                <span>{formatFileSize(file.fileSize)}</span>
                <span>·</span>
                <span>上传于 {file.createdAt}</span>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-500">{file.generatedQuestions}</div>
                  <div className="text-xs text-gray-500">生成题目</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-500">{Object.keys(questionsByType).length}</div>
                  <div className="text-xs text-gray-500">题型种类</div>
                </div>
              </div>
            </div>
          </div>

          {/* Question Types Summary */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex flex-wrap gap-2">
              {stats.byType.map(({ type, count, icon, label }) => (
                <div
                  key={type}
                  className={`px-3 py-1.5 rounded-xl flex items-center gap-2 ${
                    selectedType === type ? 'bg-blue-100 border-2 border-blue-400' : 'bg-gray-50'
                  } cursor-pointer hover:bg-blue-50 transition-colors`}
                  onClick={() => setSelectedType(selectedType === type ? 'all' : type)}
                >
                  <span>{icon}</span>
                  <span className="text-sm font-medium text-gray-700">{label}</span>
                  <Badge variant="primary">{count}</Badge>
                </div>
              ))}
            </div>
          </div>
        </ClayCard>

        {/* Actions */}
        <div className="flex gap-3 mb-6">
          {!importSuccess ? (
            <>
              <ClayButton
                variant="secondary"
                className="flex-1"
                onClick={() => setShowConfirmModal(true)}
              >
                ✅ 确认入库
              </ClayButton>
              <Link href="/question-bank" className="flex-1">
                <ClayButton variant="secondary" className="w-full">
                  📚 查看全部题库
                </ClayButton>
              </Link>
              <Link href="/challenge" className="flex-1">
                <ClayButton className="w-full">
                  🎯 开始闯关练习
                </ClayButton>
              </Link>
            </>
          ) : (
            <>
              <Link href="/question-bank" className="flex-1">
                <ClayButton variant="secondary" className="w-full">
                  📚 查看全部题库
                </ClayButton>
              </Link>
              <Link href="/challenge" className="flex-1">
                <ClayButton className="w-full">
                  🎯 开始闯关练习
                </ClayButton>
              </Link>
            </>
          )}
        </div>

        {/* Import Success Banner */}
        {importSuccess && (
          <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-xl flex items-center gap-3">
            <span className="text-3xl">🎉</span>
            <div>
              <p className="font-bold text-green-700">题目已成功入库！</p>
              <p className="text-sm text-green-600">{stats.total}道题目已添加到题库</p>
            </div>
          </div>
        )}

        {/* Questions Preview */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800">
              题目预览 {selectedType !== 'all' ? `- ${QUESTION_TYPE_LABELS[selectedType]}` : `(共${filteredQuestions.length}题)`}
            </h3>
            {selectedType !== 'all' && (
              <button
                onClick={() => setSelectedType('all')}
                className="text-sm text-blue-500 hover:text-blue-700"
              >
                显示全部
              </button>
            )}
          </div>
        </div>

        {/* Questions by Type */}
        {selectedType === 'all' ? (
          // Group by type
          <div className="space-y-6">
            {Object.entries(questionsByType).map(([type, qs]) => (
              <ClayCard key={type}>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">{QUESTION_TYPE_ICONS[type]}</span>
                  <h4 className="font-bold text-gray-800">{QUESTION_TYPE_LABELS[type]}</h4>
                  <Badge variant="muted">{qs.length}题</Badge>
                </div>

                <div className="space-y-3">
                  {qs.slice(0, 3).map((q, idx) => (
                    <div key={q.id} className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-start gap-2 mb-2">
                        <span className="font-bold text-gray-500">{idx + 1}.</span>
                        <p className="text-gray-800 font-medium flex-1">{q.content}</p>
                      </div>
                      {(type === 'choice' || type === 'truefalse') && (
                        <div className="grid grid-cols-4 gap-2 mt-2">
                          {JSON.parse(q.options || '[]').map((opt: { id: string; content: string; isCorrect: boolean }) => (
                            <div
                              key={opt.id}
                              className={`p-2 rounded-lg text-center text-sm ${
                                opt.isCorrect ? 'bg-green-100 text-green-700 font-medium' : 'bg-white text-gray-600'
                              }`}
                            >
                              {opt.id}. {opt.content}
                            </div>
                          ))}
                        </div>
                      )}
                      {type !== 'choice' && type !== 'truefalse' && (
                        <p className="text-sm text-green-600 mt-2">答案: {q.answer}</p>
                      )}
                    </div>
                  ))}
                  {qs.length > 3 && (
                    <button
                      onClick={() => setSelectedType(type)}
                      className="w-full py-2 text-center text-blue-500 hover:text-blue-700 text-sm font-medium"
                    >
                      查看全部 {qs.length} 题 →
                    </button>
                  )}
                </div>
              </ClayCard>
            ))}
          </div>
        ) : (
          // Single type questions
          <div className="space-y-4">
            {filteredQuestions.map((q, idx) => (
              <ClayCard key={q.id}>
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${
                    q.difficulty === 1 ? 'bg-green-100' : q.difficulty === 2 ? 'bg-blue-100' : 'bg-orange-100'
                  }`}>
                    {QUESTION_TYPE_ICONS[q.type]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={DIFFICULTY_COLORS[q.difficulty - 1] as 'success' | 'primary' | 'accent'}>
                        {DIFFICULTY_LABELS[q.difficulty - 1]}
                      </Badge>
                      <span className="text-sm text-gray-500">Q{idx + 1}</span>
                    </div>
                    <p className="text-gray-800 font-medium">{q.content}</p>
                  </div>
                </div>

                {(q.type === 'choice' || q.type === 'truefalse') && (
                  renderOptions(q)
                )}

                {q.type !== 'choice' && q.type !== 'truefalse' && (
                  <div className="p-3 bg-green-50 rounded-xl mt-3">
                    <span className="text-sm font-medium text-green-700">答案: {q.answer}</span>
                  </div>
                )}

                {q.explanation && (
                  <div className="p-3 bg-blue-50 rounded-xl mt-3">
                    <span className="text-sm text-blue-700">💡 {q.explanation}</span>
                  </div>
                )}
              </ClayCard>
            ))}
          </div>
        )}

        {/* Difficulty Distribution */}
        <ClayCard className="mt-6 bg-gradient-to-br from-gray-50 to-blue-50">
          <h4 className="font-bold text-gray-800 mb-4">📊 难度分布</h4>
          <div className="grid grid-cols-3 gap-4">
            {stats.byDifficulty.map(({ difficulty, label, count }) => (
              <div key={difficulty} className="text-center p-4 clay-inset">
                <div className={`text-2xl font-bold text-${DIFFICULTY_COLORS[difficulty - 1]}-500`}>
                  {count}
                </div>
                <div className="text-sm text-gray-500">{label}</div>
              </div>
            ))}
          </div>
        </ClayCard>

        {/* Confirm Import Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <ClayCard className="w-full max-w-md">
              <h3 className="text-xl font-bold text-gray-800 mb-4">📋 确认入库</h3>

              <div className="mb-4">
                <p className="text-gray-600 mb-4">
                  请确认以下题目信息，导入后将添加到题库：
                </p>

                {/* Summary */}
                <div className="p-4 bg-gray-50 rounded-xl mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-gray-700">教材</span>
                    <span className="text-gray-800">{file.fileName}</span>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-gray-700">题目总数</span>
                    <span className="text-2xl font-bold text-blue-500">{stats.total}</span>
                  </div>
                </div>

                {/* Question Types Summary */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-600 mb-2">题型分布</p>
                  <div className="space-y-2">
                    {stats.byType.map(({ type, count, icon, label }) => (
                      <div key={type} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{icon}</span>
                          <span className="font-medium text-gray-700">{label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="primary">{count}题</Badge>
                          <span className="text-sm text-green-500">✓</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Difficulty Summary */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-600 mb-2">难度分布</p>
                  <div className="flex gap-2">
                    {stats.byDifficulty.map(({ difficulty, label, count }) => (
                      <div key={difficulty} className="flex-1 p-3 bg-white rounded-lg border border-gray-100 text-center">
                        <div className={`text-lg font-bold text-${DIFFICULTY_COLORS[difficulty - 1]}-500`}>
                          {count}题
                        </div>
                        <div className="text-xs text-gray-500">{label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <p className="text-sm text-amber-700">
                    💡 确认后将题目添加到题库，可随时在题库管理中进行编辑和删除
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <ClayButton
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setShowConfirmModal(false)}
                  disabled={isImporting}
                >
                  取消
                </ClayButton>
                <ClayButton
                  className="flex-1"
                  onClick={async () => {
                    setIsImporting(true);
                    // 模拟入库操作
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    setIsImporting(false);
                    setShowConfirmModal(false);
                    setImportSuccess(true);
                  }}
                  disabled={isImporting}
                >
                  {isImporting ? '导入中...' : '确认导入'}
                </ClayButton>
              </div>
            </ClayCard>
          </div>
        )}

        {/* Re-generate Button */}
        <div className="mt-6">
          <ClayButton
            variant="secondary"
            className="w-full"
            onClick={async () => {
              if (confirm('确定要重新生成题目吗？当前题目将被替换。')) {
                setLoading(true);
                // 模拟重新生成
                await new Promise(resolve => setTimeout(resolve, 2000));
                setImportSuccess(false);
                setLoading(false);
              }
            }}
          >
            🔄 重新生成题目
          </ClayButton>
        </div>
      </main>
    </div>
  );
}
