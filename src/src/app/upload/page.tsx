'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ClayCard, ClayButton, Badge, ProgressBar } from '@/components/ClayCard';
import { SUBJECTS, GRADES, TEXTBOOK_VERSIONS, SUBJECT_QUESTION_TYPES, QUESTION_TYPE_LABELS, QUESTION_TYPE_ICONS, DIFFICULTY_LABELS } from '@/lib/question-types';

interface UploadFile {
  id: string;
  fileName: string;
  fileSize: number;
  subjectId: string;
  grade: number;
  textbookVersionId?: string;
  status: 'uploaded' | 'parsing' | 'generating' | 'completed' | 'error';
  parseProgress: number;
  generatedQuestions: number;
  questionTypes?: string;
  createdAt: string;
}

// 模拟数据
const mockFiles: UploadFile[] = [
  {
    id: '1',
    fileName: '三年级数学上册.pdf',
    fileSize: 2.5 * 1024 * 1024,
    subjectId: 'math',
    grade: 3,
    textbookVersionId: 'pep',
    status: 'completed',
    parseProgress: 100,
    generatedQuestions: 45,
    questionTypes: JSON.stringify({ questionTypes: ['choice', 'calc', 'application'] }),
    createdAt: '2024-03-20',
  },
  {
    id: '2',
    fileName: '语文教材第三单元.docx',
    fileSize: 1.2 * 1024 * 1024,
    subjectId: 'chinese',
    grade: 3,
    textbookVersionId: 'pep',
    status: 'generating',
    parseProgress: 65,
    generatedQuestions: 0,
    questionTypes: JSON.stringify({ questionTypes: ['choice', 'reading'] }),
    createdAt: '2024-03-19',
  },
];

export default function UploadPage() {
  const [files, setFiles] = useState<UploadFile[]>(mockFiles);
  const [dragOver, setDragOver] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [config, setConfig] = useState({
    subjectId: 'math',
    grade: 3,
    textbookVersionId: 'pep',
    questionTypes: ['choice'] as string[],
    countsPerType: { choice: 5 } as Record<string, number>,
    difficultyDistribution: [true, true, false, false] as boolean[],
    useGlobalCount: true,
    globalCount: 10,
  });

  // 获取题型配置
  const availableTypes = SUBJECT_QUESTION_TYPES[config.subjectId] || ['choice'];

  // 计算总题目数
  const totalCount = config.useGlobalCount
    ? config.questionTypes.length * config.globalCount
    : Object.values(config.countsPerType).reduce((sum, c) => sum + c, 0);

  // 更新每种题型的数量
  const setCountForType = (type: string, count: number) => {
    setConfig({
      ...config,
      countsPerType: { ...config.countsPerType, [type]: count },
    });
  };

  // 快捷设置每种题型数量
  const setAllCounts = (count: number) => {
    const newCounts: Record<string, number> = {};
    config.questionTypes.forEach(t => { newCounts[t] = count; });
    setConfig({
      ...config,
      globalCount: count,
      countsPerType: newCounts,
    });
  };

  // 切换题型时初始化数量
  const toggleQuestionType = (type: string) => {
    const types = config.questionTypes.includes(type)
      ? config.questionTypes.filter(t => t !== type)
      : [...config.questionTypes, type];
    const newCounts = { ...config.countsPerType };
    if (!config.questionTypes.includes(type)) {
      newCounts[type] = config.globalCount;
    } else {
      delete newCounts[type];
    }
    setConfig({ ...config, questionTypes: types, countsPerType: newCounts });
  };

  // 获取科目名称
  const getSubjectName = (id: string) => SUBJECTS.find(s => s.id === id)?.name || id;
  const getSubjectIcon = (id: string) => SUBJECTS.find(s => s.id === id)?.icon || '📄';
  const getVersionName = (id: string) => TEXTBOOK_VERSIONS.find(v => v.id === id)?.name || id;

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // 获取状态显示
  const getStatusDisplay = (status: string, progress: number) => {
    switch (status) {
      case 'uploaded':
        return { badge: <Badge variant="muted">待解析</Badge>, progress: 0 };
      case 'parsing':
        return { badge: <Badge variant="primary">解析中</Badge>, progress };
      case 'generating':
        return { badge: <Badge variant="primary">生成中</Badge>, progress };
      case 'completed':
        return { badge: <Badge variant="success">已完成</Badge>, progress: 100 };
      case 'error':
        return { badge: <Badge variant="error">失败</Badge>, progress: 0 };
      default:
        return { badge: <Badge variant="muted">{status}</Badge>, progress: 0 };
    }
  };

  // 处理拖拽
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      setSelectedFile(droppedFiles[0]);
      setShowConfig(true);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      setSelectedFile(selectedFiles[0]);
      setShowConfig(true);
    }
  };

  // 切换科目时更新题型
  const handleSubjectChange = (subjectId: string) => {
    const firstType = SUBJECT_QUESTION_TYPES[subjectId]?.[0] || 'choice';
    setConfig({
      ...config,
      subjectId,
      questionTypes: [firstType],
      countsPerType: { [firstType]: config.globalCount },
    });
  };

  // 模拟上传
  const handleUpload = () => {
    if (!selectedFile) return;

    const newFile: UploadFile = {
      id: `upload_${Date.now()}`,
      fileName: selectedFile.name,
      fileSize: selectedFile.size,
      subjectId: config.subjectId,
      grade: config.grade,
      textbookVersionId: config.textbookVersionId,
      status: 'generating',
      parseProgress: 0,
      generatedQuestions: 0,
      questionTypes: JSON.stringify({
        questionTypes: config.questionTypes,
        difficultyDistribution: config.difficultyDistribution,
        countsPerType: config.countsPerType,
        totalCount,
      }),
      createdAt: new Date().toISOString().split('T')[0],
    };

    setFiles([newFile, ...files]);
    setShowConfig(false);
    setSelectedFile(null);

    // 模拟进度
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setFiles(prev => prev.map(f =>
          f.id === newFile.id
            ? { ...f, status: 'completed' as const, parseProgress: 100, generatedQuestions: totalCount }
            : f
        ));
      } else {
        setFiles(prev => prev.map(f =>
          f.id === newFile.id ? { ...f, parseProgress: Math.round(progress) } : f
        ));
      }
    }, 500);
  };

  // 删除教材
  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个教材吗？')) {
      setFiles(files.filter(f => f.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <main className="p-6">
        {/* Page Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-1">上传学习资料</h2>
          <p className="text-gray-500">支持PDF、Word文档，AI将自动分析并生成多题型练习题</p>
        </div>

        {/* Upload Area */}
        <div
          className={`
            mb-6 p-8 bg-white rounded-2xl border-2 border-dashed transition-all cursor-pointer
            ${dragOver
              ? 'border-blue-500 bg-blue-50 shadow-[inset_4px_4px_8px_rgba(37,99,235,0.1)]'
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-input')?.click()}
        >
          <input
            id="file-input"
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={handleFileSelect}
          />
          <div className="text-center py-4">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center">
              <span className="text-4xl">📤</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">拖拽文件到此处</h3>
            <p className="text-gray-500 mb-4">或点击选择文件</p>
            <span className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-b from-blue-500 to-blue-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-shadow">
              选择文件
            </span>
            <p className="text-sm text-gray-400 mt-4">支持 PDF、Word 文档，单个文件不超过 20MB</p>
          </div>
        </div>

        {/* Upload Tips */}
        <ClayCard className="mb-6 bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-100">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">💡</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-800 mb-2">上传说明</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 支持人教版、北师大版、苏教版等多种教材版本</li>
                <li>• AI将根据教材内容自动生成针对性练习题</li>
                <li>• 生成后可预览题目，确认后入库到题库</li>
                <li>• 题目将自动关联到闯关系统用于练习</li>
              </ul>
            </div>
          </div>
        </ClayCard>

        {/* File List */}
        <ClayCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800 text-lg">已上传教材</h3>
            <Badge variant="accent">{files.length} 个文件</Badge>
          </div>

          {files.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center">
                <span className="text-3xl">📁</span>
              </div>
              <p className="text-gray-500">还没有上传任何教材</p>
              <p className="text-sm text-gray-400 mt-1">上传教材后会自动生成练习题</p>
            </div>
          ) : (
            <div className="space-y-4">
              {files.map(file => {
                const statusDisplay = getStatusDisplay(file.status, file.parseProgress);
                const questionTypes = file.questionTypes ? JSON.parse(file.questionTypes).questionTypes || [] : [];

                return (
                  <div key={file.id} className="clay-inset p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                      {/* File Icon */}
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${
                        file.status === 'completed'
                          ? 'bg-gradient-to-br from-green-100 to-green-200'
                          : 'bg-gradient-to-br from-blue-100 to-blue-200'
                      }`}>
                        📄
                      </div>

                      {/* File Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-800 truncate">{file.fileName}</h4>
                          {statusDisplay.badge}
                        </div>

                        {/* Meta Info */}
                        <div className="flex items-center gap-3 text-sm text-gray-500 mb-2">
                          <span className="flex items-center gap-1">
                            {getSubjectIcon(file.subjectId)} {getSubjectName(file.subjectId)}
                          </span>
                          <span>·</span>
                          <span>{file.grade}年级</span>
                          <span>·</span>
                          <span>{getVersionName(file.textbookVersionId || '')}</span>
                          <span>·</span>
                          <span>{formatFileSize(file.fileSize)}</span>
                        </div>

                        {/* Question Types Tags */}
                        {questionTypes.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {questionTypes.map((type: string) => (
                              <span key={type} className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600">
                                {QUESTION_TYPE_ICONS[type]} {QUESTION_TYPE_LABELS[type]}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Progress Bar */}
                        {file.status === 'generating' && (
                          <div className="mt-2">
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                                style={{ width: `${file.parseProgress}%` }}
                              />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              AI生成中... {file.parseProgress}%
                            </p>
                          </div>
                        )}

                        {/* Completed Info */}
                        {file.status === 'completed' && (
                          <p className="text-sm text-green-600 mt-1">
                            ✓ 已生成 {file.generatedQuestions} 道练习题
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {file.status === 'completed' && (
                          <Link href={`/upload/${file.id}`}>
                            <ClayButton size="sm" variant="secondary">
                              查看详情
                            </ClayButton>
                          </Link>
                        )}
                        <button
                          onClick={() => handleDelete(file.id)}
                          className="w-10 h-10 rounded-xl hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                          title="删除"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ClayCard>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-4 mt-6">
          <Link href="/question-bank">
            <ClayCard className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02]">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center text-2xl">
                  📚
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">查看题库</h4>
                  <p className="text-sm text-gray-500">管理已生成的练习题</p>
                </div>
                <span className="ml-auto text-gray-400">→</span>
              </div>
            </ClayCard>
          </Link>

          <Link href="/challenge">
            <ClayCard className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02]">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center text-2xl">
                  🎯
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">开始闯关</h4>
                  <p className="text-sm text-gray-500">用生成的题目练习</p>
                </div>
                <span className="ml-auto text-gray-400">→</span>
              </div>
            </ClayCard>
          </Link>
        </div>
      </main>

      {/* Config Modal */}
      {showConfig && selectedFile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <ClayCard className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">教材配置</h3>
              <button
                onClick={() => setShowConfig(false)}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* File Preview */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-xl">
                📄
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 truncate">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Subject Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">科目</label>
                <div className="grid grid-cols-3 gap-3">
                  {SUBJECTS.map(subject => (
                    <button
                      key={subject.id}
                      onClick={() => handleSubjectChange(subject.id)}
                      className={`
                        p-4 rounded-xl text-center transition-all
                        ${config.subjectId === subject.id
                          ? 'bg-gradient-to-b from-blue-500 to-blue-600 text-white shadow-lg'
                          : 'clay-inset hover:bg-gray-50'
                        }
                      `}
                    >
                      <span className="text-2xl block mb-1">{subject.icon}</span>
                      <span className="text-sm font-medium">{subject.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Grade Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">年级</label>
                <div className="grid grid-cols-6 gap-2">
                  {GRADES.map(grade => (
                    <button
                      key={grade}
                      onClick={() => setConfig({ ...config, grade })}
                      className={`
                        p-3 rounded-xl text-center font-medium transition-all
                        ${config.grade === grade
                          ? 'bg-gradient-to-b from-blue-500 to-blue-600 text-white shadow-md'
                          : 'clay-inset hover:bg-gray-50'
                        }
                      `}
                    >
                      {grade}
                    </button>
                  ))}
                </div>
              </div>

              {/* Textbook Version */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">教材版本</label>
                <select
                  value={config.textbookVersionId}
                  onChange={(e) => setConfig({ ...config, textbookVersionId: e.target.value })}
                  className="w-full p-3 clay-input"
                >
                  {TEXTBOOK_VERSIONS.map(version => (
                    <option key={version.id} value={version.id}>{version.name}</option>
                  ))}
                </select>
              </div>

              {/* Question Types */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">生成题型</label>
                <div className="grid grid-cols-2 gap-2">
                  {availableTypes.map(type => (
                    <label
                      key={type}
                      className={`
                        flex items-center gap-2 p-3 rounded-xl cursor-pointer transition-all
                        ${config.questionTypes.includes(type)
                          ? 'bg-blue-50 border-2 border-blue-400'
                          : 'bg-gray-50 border-2 border-transparent hover:border-gray-300'
                        }
                      `}
                    >
                      <input
                        type="checkbox"
                        checked={config.questionTypes.includes(type)}
                        onChange={() => toggleQuestionType(type)}
                        className="w-4 h-4 rounded text-blue-500"
                      />
                      <span className="text-lg">{QUESTION_TYPE_ICONS[type]}</span>
                      <span className="text-sm font-medium text-gray-700">{QUESTION_TYPE_LABELS[type]}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">难度级别</label>
                <div className="grid grid-cols-4 gap-2">
                  {DIFFICULTY_LABELS.map((label, i) => (
                    <button
                      key={label}
                      onClick={() => {
                        const dist = [...config.difficultyDistribution];
                        dist[i] = !dist[i];
                        setConfig({ ...config, difficultyDistribution: dist });
                      }}
                      className={`
                        p-3 rounded-xl text-center text-sm font-medium transition-all
                        ${config.difficultyDistribution[i]
                          ? 'bg-gradient-to-b from-blue-500 to-blue-600 text-white shadow-md'
                          : 'clay-inset text-gray-600'
                        }
                      `}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Count per Type */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700">每种题型数量</label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={config.useGlobalCount}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        if (checked) {
                          setAllCounts(config.globalCount);
                        }
                        setConfig({ ...config, useGlobalCount: checked });
                      }}
                      className="w-4 h-4 rounded text-blue-500"
                    />
                    <span className="text-gray-600">统一设置</span>
                  </label>
                </div>

                {config.useGlobalCount ? (
                  /* Quick Select for all types */
                  <div className="grid grid-cols-5 gap-2">
                    {[5, 10, 15, 20, 30].map(n => (
                      <button
                        key={n}
                        onClick={() => setAllCounts(n)}
                        className={`
                          p-3 rounded-xl text-center font-medium transition-all
                          ${config.globalCount === n
                            ? 'bg-gradient-to-b from-blue-500 to-blue-600 text-white shadow-md'
                            : 'clay-inset text-gray-600 hover:bg-blue-50'
                          }
                        `}
                      >
                        {n}题
                      </button>
                    ))}
                  </div>
                ) : (
                  /* Per-type count settings */
                  <div className="space-y-2">
                    {config.questionTypes.map(type => (
                      <div key={type} className="flex items-center gap-3 p-2 bg-gray-50 rounded-xl">
                        <span className="text-lg">{QUESTION_TYPE_ICONS[type]}</span>
                        <span className="text-sm font-medium text-gray-700 flex-1">{QUESTION_TYPE_LABELS[type]}</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setCountForType(type, Math.max(1, (config.countsPerType[type] || 1) - 1))}
                            className="w-8 h-8 rounded-lg bg-white shadow flex items-center justify-center hover:bg-gray-100"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            max="50"
                            value={config.countsPerType[type] || 1}
                            onChange={(e) => setCountForType(type, parseInt(e.target.value) || 1)}
                            className="w-14 h-8 text-center bg-white rounded-lg shadow font-medium"
                          />
                          <button
                            onClick={() => setCountForType(type, Math.min(50, (config.countsPerType[type] || 1) + 1))}
                            className="w-8 h-8 rounded-lg bg-white shadow flex items-center justify-center hover:bg-gray-100"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                    {config.questionTypes.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">请先选择题型</p>
                    )}
                  </div>
                )}
              </div>

              {/* Total Preview */}
              <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">预计生成</span>
                  <span className="text-2xl font-bold text-blue-600">{totalCount}</span>
                  <span className="text-gray-600">道题目</span>
                </div>
                {!config.useGlobalCount && config.questionTypes.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-blue-200 flex flex-wrap gap-2">
                    {config.questionTypes.map(type => (
                      <span key={type} className="text-xs bg-white px-2 py-1 rounded-lg">
                        {QUESTION_TYPE_ICONS[type]}{QUESTION_TYPE_LABELS[type]}: {config.countsPerType[type] || 0}题
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <ClayButton
                variant="secondary"
                className="flex-1"
                onClick={() => setShowConfig(false)}
              >
                取消
              </ClayButton>
              <ClayButton
                className="flex-1"
                onClick={handleUpload}
                disabled={config.questionTypes.length === 0}
              >
                开始解析
              </ClayButton>
            </div>
          </ClayCard>
        </div>
      )}
    </div>
  );
}
