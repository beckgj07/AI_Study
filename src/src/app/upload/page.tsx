'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ClayCard, ClayButton, Badge } from '@/components/ClayCard';
import { SUBJECTS, GRADES, TEXTBOOK_VERSIONS, SEMESTERS, QUESTION_TYPE_LABELS, QUESTION_TYPE_ICONS, SUBJECT_QUESTION_TYPES } from '@/lib/question-types';

interface Unit {
  name: string;
  count: number;
  types: string[];
}

interface QuestionStats {
  total: number;
  byUnit: Unit[];
  byType: Record<string, number>;
}

interface Textbook {
  id: string;
  name: string;
  subjectId: string;
  grade: number;
  semester: number;
  versionId: string;
  status: 'uploaded' | 'parsing' | 'generating' | 'completed' | 'error';
  parseProgress: number;
  questionStats?: QuestionStats;
  uploadedAt: string;
  subject?: { id: string; name: string; icon: string };
  textbookVersion?: { id: string; name: string };
}

export default function UploadPage() {
  const [user, setUser] = useState<{ name: string; grade?: number } | null>(null);
  const [textbooks, setTextbooks] = useState<Textbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedTextbook, setSelectedTextbook] = useState<Textbook | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [detailTab, setDetailTab] = useState<'content' | 'outline' | 'stats'>('content');
  const [questionList, setQuestionList] = useState<any[]>([]);
  const [showQuestionDetail, setShowQuestionDetail] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [unitQuestions, setUnitQuestions] = useState<{unitId: string, unitName: string, questions: any[]}[]>([]);
  const [showChapterDetail, setShowChapterDetail] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<any>(null);
  const [questionFilter, setQuestionFilter] = useState('all');

  // 筛选条件
  const [filters, setFilters] = useState({
    grade: 0, // 0表示全部年级
    subjectId: '',
    versionId: '',
    semester: 0,
  });

  // 上传配置
  const [uploadConfig, setUploadConfig] = useState({
    subjectId: 'math',
    grade: 3,
    semester: 1,
    versionId: 'pep',
    questionTypes: ['choice'],
    difficultyDistribution: [true, true, false, false],
    countsPerType: { choice: 10 },
  });

  // 文件上传状态
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 加载教材数据
  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      const userData = JSON.parse(currentUser);
      setUser(userData);
      if (userData.grade) {
        setFilters(prev => ({ ...prev, grade: userData.grade }));
        setUploadConfig(prev => ({ ...prev, grade: userData.grade }));
      }
    }
    fetchTextbooks();
  }, []);

  const fetchTextbooks = async () => {
    try {
      const res = await fetch('/api/textbooks');
      const data = await res.json();
      if (data.success) {
        // 计算每个教材的题目统计
        const textbooksWithStats = data.data.map((t: any) => {
          if (t.units && t.units.length > 0) {
            let total = 0;
            const byType: Record<string, number> = {};
            const byUnit = t.units.map((unit: any) => {
              let unitTotal = 0;
              const types = new Set<string>();
              unit.chapters?.forEach((chapter: any) => {
                const count = chapter._count?.questions || 0;
                unitTotal += count;
                total += count;
                // 假设每种题型数量相等
                const typeCount = 5; // choice, fill, truefalse, calc, application
                const eachTypeCount = Math.floor(count / typeCount);
                ['choice', 'fill', 'truefalse', 'calc', 'application'].forEach(type => {
                  byType[type] = (byType[type] || 0) + eachTypeCount;
                  types.add(type);
                });
              });
              return { name: unit.name, count: unitTotal, types: Array.from(types) };
            });
            return {
              ...t,
              questionStats: { total, byUnit, byType }
            };
          }
          return t;
        });
        setTextbooks(textbooksWithStats);
      }
    } catch (error) {
      console.error('Failed to fetch textbooks:', error);
    } finally {
      setLoading(false);
    }
  };

  // 筛选教材
  const filteredTextbooks = textbooks.filter(t => {
    if (filters.grade && t.grade !== filters.grade) return false;
    if (filters.subjectId && t.subjectId !== filters.subjectId) return false;
    if (filters.versionId && t.versionId !== filters.versionId) return false;
    if (filters.semester && t.semester !== filters.semester) return false;
    return true;
  });

  // 统计
  const stats = {
    total: filteredTextbooks.length,
    completed: filteredTextbooks.filter(t => t.status === 'completed').length,
    generating: filteredTextbooks.filter(t => t.status === 'generating' || t.status === 'parsing').length,
    totalQuestions: filteredTextbooks.reduce((sum, t) => sum + (t.questionStats?.total || 0), 0),
  };

  // 获取科目/版本名称
  const getSubjectName = (id: string) => SUBJECTS.find(s => s.id === id)?.name || id;
  const getSubjectIcon = (id: string) => SUBJECTS.find(s => s.id === id)?.icon || '📄';
  const getVersionName = (id: string) => TEXTBOOK_VERSIONS.find(v => v.id === id)?.name || id;

  // 文件大小格式化
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // 获取文件图标
  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': return '📕';
      case 'doc':
      case 'docx': return '📘';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return '🖼️';
      default: return '📄';
    }
  };

  // 处理文件选择
  const handleFileSelect = (files: FileList | null) => {
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  // 拖拽处理
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  }, []);

  // 打开文件选择器
  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  // 上传教材
  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      // 创建教材记录
      const createRes = await fetch('/api/textbooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: selectedFile.name.replace(/\.[^/.]+$/, ''),
          subjectId: uploadConfig.subjectId,
          grade: uploadConfig.grade,
          semester: uploadConfig.semester,
          versionId: uploadConfig.versionId,
          filePath: `/uploads/${selectedFile.name}`
        })
      });

      const createData = await createRes.json();
      if (!createData.success) {
        alert('创建教材失败');
        return;
      }

      const newTextbook = createData.data;
      setTextbooks(prev => [newTextbook, ...prev]);
      setUploadProgress(10);
      setShowUpload(false);
      setSelectedFile(null);

      // 开始解析和生成
      await parseTextbook(newTextbook.id);

    } catch (error) {
      console.error('Failed to upload:', error);
      alert('上传失败');
    }
  };

  // 解析教材并生成题目
  const parseTextbook = async (textbookId: string) => {
    try {
      setTextbooks(prev => prev.map(t =>
        t.id === textbookId ? { ...t, status: 'parsing', parseProgress: 10 } : t
      ));

      // 调用解析API
      const parseRes = await fetch('/api/textbooks/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          textbookId,
          questionTypes: uploadConfig.questionTypes,
          difficultyDistribution: uploadConfig.difficultyDistribution,
          countsPerType: uploadConfig.countsPerType
        })
      });

      const parseData = await parseRes.json();

      // 模拟进度更新
      for (let i = 20; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 300));
        setUploadProgress(i);
        setTextbooks(prev => prev.map(t =>
          t.id === textbookId ? { ...t, parseProgress: i, status: i >= 100 ? 'completed' : 'generating' } : t
        ));
      }

      // 获取最终统计
      const statsRes = await fetch(`/api/textbooks/parse?textbookId=${textbookId}`);
      const statsData = await statsRes.json();

      setTextbooks(prev => prev.map(t =>
        t.id === textbookId ? {
          ...t,
          status: 'completed',
          parseProgress: 100,
          questionStats: statsData.data?.stats || { total: 50, byUnit: [], byType: {} }
        } : t
      ));

    } catch (error) {
      console.error('Failed to parse:', error);
      setTextbooks(prev => prev.map(t =>
        t.id === textbookId ? { ...t, status: 'error' } : t
      ));
    }
  };

  // 重新生成
  const handleRegenerate = async (id: string) => {
    setTextbooks(prev => prev.map(t =>
      t.id === id ? { ...t, status: 'generating', parseProgress: 0 } : t
    ));
    await parseTextbook(id);
  };

  // 查看详情
  const handleViewDetail = async (textbook: Textbook) => {
    // 直接使用列表中已有的教材数据（包含计算好的questionStats）
    setSelectedTextbook(textbook);
    setDetailTab('content'); // 默认显示教材内容
    setShowDetail(true);
  };

  // 更新题型数量
  const updateCountPerType = (type: string, count: number) => {
    setUploadConfig(prev => ({
      ...prev,
      countsPerType: { ...prev.countsPerType, [type]: count }
    }));
  };

  // 切换题型
  const toggleQuestionType = (type: string) => {
    setUploadConfig(prev => {
      const types = prev.questionTypes.includes(type)
        ? prev.questionTypes.filter(t => t !== type)
        : [...prev.questionTypes, type];
      const newCounts = { ...prev.countsPerType };
      if (!prev.questionTypes.includes(type)) {
        newCounts[type] = 10;
      }
      return { ...prev, questionTypes: types, countsPerType: newCounts };
    });
  };

  // 获取可用题型
  const availableTypes = SUBJECT_QUESTION_TYPES[uploadConfig.subjectId] || ['choice'];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">📚</div>
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <main className="p-6">
        {/* 页面标题 */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-1">教材管理</h2>
          <p className="text-gray-500">管理学生的教材和生成的题库</p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <ClayCard className="text-center">
            <div className="text-3xl mb-1">📚</div>
            <div className="text-2xl font-bold text-blue-500">{stats.total}</div>
            <div className="text-sm text-gray-500">教材总数</div>
          </ClayCard>
          <ClayCard className="text-center">
            <div className="text-3xl mb-1">✅</div>
            <div className="text-2xl font-bold text-green-500">{stats.completed}</div>
            <div className="text-sm text-gray-500">已完成</div>
          </ClayCard>
          <ClayCard className="text-center">
            <div className="text-3xl mb-1">⏳</div>
            <div className="text-2xl font-bold text-orange-500">{stats.generating}</div>
            <div className="text-sm text-gray-500">生成中</div>
          </ClayCard>
          <ClayCard className="text-center">
            <div className="text-3xl mb-1">📝</div>
            <div className="text-2xl font-bold text-purple-500">{stats.totalQuestions}</div>
            <div className="text-sm text-gray-500">已生成题目</div>
          </ClayCard>
        </div>

        {/* 筛选器 */}
        <ClayCard className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">筛选条件</h3>
            <ClayButton size="sm" onClick={() => setShowUpload(true)}>
              📤 上传教材
            </ClayButton>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">年级</label>
              <select
                value={filters.grade}
                onChange={(e) => setFilters({ ...filters, grade: parseInt(e.target.value) })}
                className="w-full p-2.5 bg-white rounded-xl border border-gray-200 text-sm"
              >
                {GRADES.map(g => (
                  <option key={g} value={g}>{g}年级</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">科目</label>
              <select
                value={filters.subjectId}
                onChange={(e) => setFilters({ ...filters, subjectId: e.target.value })}
                className="w-full p-2.5 bg-white rounded-xl border border-gray-200 text-sm"
              >
                <option value="">全部科目</option>
                {SUBJECTS.map(s => (
                  <option key={s.id} value={s.id}>{s.icon} {s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">版本</label>
              <select
                value={filters.versionId}
                onChange={(e) => setFilters({ ...filters, versionId: e.target.value })}
                className="w-full p-2.5 bg-white rounded-xl border border-gray-200 text-sm"
              >
                <option value="">全部版本</option>
                {TEXTBOOK_VERSIONS.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">学期</label>
              <select
                value={filters.semester}
                onChange={(e) => setFilters({ ...filters, semester: parseInt(e.target.value) })}
                className="w-full p-2.5 bg-white rounded-xl border border-gray-200 text-sm"
              >
                <option value={0}>全部</option>
                {SEMESTERS.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>
        </ClayCard>

        {/* 教材列表 */}
        <ClayCard>
          <h3 className="font-bold text-gray-800 mb-4">教材列表 ({filteredTextbooks.length})</h3>
          <div className="space-y-4">
            {filteredTextbooks.map(textbook => (
              <div key={textbook.id} className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-start gap-4">
                  {/* 教材图标 */}
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
                    {getSubjectIcon(textbook.subjectId)}
                  </div>

                  {/* 教材信息 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-gray-800">{textbook.name}</h4>
                      <Badge variant={textbook.status === 'completed' ? 'success' : textbook.status === 'error' ? 'error' : 'primary'}>
                        {textbook.status === 'completed' ? '已完成' :
                         textbook.status === 'generating' ? '生成中' :
                         textbook.status === 'parsing' ? '解析中' :
                         textbook.status === 'error' ? '失败' : '待处理'}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-2">
                      <span>{getSubjectName(textbook.subjectId)}</span>
                      <span>·</span>
                      <span>{textbook.grade}年级</span>
                      <span>·</span>
                      <span>{getVersionName(textbook.versionId)}</span>
                      <span>·</span>
                      <span>{textbook.semester === 1 ? '上册' : '下册'}</span>
                      <span>·</span>
                      <span>上传于 {textbook.uploadedAt || new Date().toISOString().split('T')[0]}</span>
                    </div>

                    {/* 进度条 */}
                    {(textbook.status === 'parsing' || textbook.status === 'generating') && (
                      <div className="mb-2">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>{textbook.status === 'parsing' ? 'AI解析教材...' : 'AI生成题目...'}</span>
                          <span>{textbook.parseProgress || 0}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 transition-all duration-300"
                            style={{ width: `${textbook.parseProgress || 0}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* 题目统计 */}
                    {textbook.questionStats && (
                      <div className="flex flex-wrap items-center gap-3">
                        <Badge variant="primary">📝 {textbook.questionStats.total} 题</Badge>
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(textbook.questionStats.byType).slice(0, 4).map(([type, count]) => (
                            <span key={type} className="text-xs px-2 py-0.5 bg-white rounded-full text-gray-600">
                              {QUESTION_TYPE_ICONS[type]} {count}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex flex-col gap-2">
                    <ClayButton
                      size="sm"
                      variant="secondary"
                      onClick={() => handleViewDetail(textbook)}
                      disabled={textbook.status !== 'completed'}
                    >
                      📖 查看详情
                    </ClayButton>
                    {textbook.status === 'completed' && (
                      <ClayButton
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRegenerate(textbook.id)}
                      >
                        🔄 重新生成
                      </ClayButton>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {filteredTextbooks.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <div className="text-5xl mb-2">📭</div>
                <p>暂无教材</p>
                <p className="text-sm">点击上方按钮上传教材</p>
              </div>
            )}
          </div>
        </ClayCard>
      </main>

      {/* 上传弹窗 */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <ClayCard className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-800 mb-4">📤 上传教材</h3>

            <div className="space-y-4">
              {/* 基本信息 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">科目</label>
                  <select
                    value={uploadConfig.subjectId}
                    onChange={(e) => setUploadConfig({ ...uploadConfig, subjectId: e.target.value, questionTypes: ['choice'] })}
                    className="w-full p-2.5 bg-white rounded-xl border border-gray-200 text-sm"
                  >
                    {SUBJECTS.map(s => (
                      <option key={s.id} value={s.id}>{s.icon} {s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">年级</label>
                  <select
                    value={uploadConfig.grade}
                    onChange={(e) => setUploadConfig({ ...uploadConfig, grade: parseInt(e.target.value) })}
                    className="w-full p-2.5 bg-white rounded-xl border border-gray-200 text-sm"
                  >
                    {GRADES.map(g => (
                      <option key={g} value={g}>{g}年级</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">学期</label>
                  <select
                    value={uploadConfig.semester}
                    onChange={(e) => setUploadConfig({ ...uploadConfig, semester: parseInt(e.target.value) })}
                    className="w-full p-2.5 bg-white rounded-xl border border-gray-200 text-sm"
                  >
                    {SEMESTERS.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">版本</label>
                  <select
                    value={uploadConfig.versionId}
                    onChange={(e) => setUploadConfig({ ...uploadConfig, versionId: e.target.value })}
                    className="w-full p-2.5 bg-white rounded-xl border border-gray-200 text-sm"
                  >
                    {TEXTBOOK_VERSIONS.map(v => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 题型选择 */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">生成题型</label>
                <div className="flex flex-wrap gap-2">
                  {availableTypes.map(type => (
                    <button
                      key={type}
                      onClick={() => toggleQuestionType(type)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        uploadConfig.questionTypes.includes(type)
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {QUESTION_TYPE_ICONS[type]} {QUESTION_TYPE_LABELS[type]}
                    </button>
                  ))}
                </div>
              </div>

              {/* 每种题型数量 */}
              {uploadConfig.questionTypes.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">每种题型数量</label>
                  <div className="space-y-2">
                    {uploadConfig.questionTypes.map(type => (
                      <div key={type} className="flex items-center gap-3">
                        <span className="text-sm text-gray-600 w-24">
                          {QUESTION_TYPE_ICONS[type]} {QUESTION_TYPE_LABELS[type]}
                        </span>
                        <input
                          type="number"
                          min="1"
                          max="50"
                          value={uploadConfig.countsPerType[type] || 10}
                          onChange={(e) => updateCountPerType(type, parseInt(e.target.value) || 10)}
                          className="w-20 p-2 bg-white rounded-lg border border-gray-200 text-sm text-center"
                        />
                        <span className="text-sm text-gray-400">题</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    总计: {Object.values(uploadConfig.countsPerType).reduce((a, b) => a + b, 0)} 题
                  </div>
                </div>
              )}

              {/* 文件上传 */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">选择教材文件</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className="hidden"
                />

                {!selectedFile ? (
                  <div
                    onClick={openFileSelector}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`
                      border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all
                      ${dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'}
                    `}
                  >
                    <div className="text-4xl mb-2">📄</div>
                    <p className="text-gray-600 mb-1">点击或拖拽文件到此处</p>
                    <p className="text-xs text-gray-400">支持 PDF、Word、图片 (最大 50MB)</p>
                  </div>
                ) : (
                  <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center text-2xl">
                        {getFileIcon(selectedFile.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">{selectedFile.name}</p>
                        <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
                      </div>
                      <button
                        onClick={() => setSelectedFile(null)}
                        className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <ClayButton variant="secondary" className="flex-1" onClick={() => {
                setShowUpload(false);
                setSelectedFile(null);
              }}>
                取消
              </ClayButton>
              <ClayButton className="flex-1" onClick={handleUpload} disabled={!selectedFile}>
                开始上传
              </ClayButton>
            </div>
          </ClayCard>
        </div>
      )}

      {/* 详情弹窗 */}
      {showDetail && selectedTextbook && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <ClayCard className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">📖 {selectedTextbook.name}</h3>
              <button
                onClick={() => setShowDetail(false)}
                className="w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center text-2xl text-gray-500"
              >
                ✕
              </button>
            </div>

            {/* 标签 */}
            <div className="flex flex-wrap gap-2 mb-6">
              <Badge variant="primary">{getSubjectName(selectedTextbook.subjectId)}</Badge>
              <Badge variant="primary">{selectedTextbook.grade}年级</Badge>
              <Badge variant="primary">{selectedTextbook.semester === 1 ? '上册' : '下册'}</Badge>
              <Badge variant="primary">{getVersionName(selectedTextbook.versionId)}</Badge>
            </div>

            {/* Tab 导航 */}
            <div className="flex gap-2 mb-4 border-b border-gray-100 pb-3">
              <button
                onClick={() => setDetailTab('content')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  detailTab === 'content' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                📚 教材内容
              </button>
              <button
                onClick={() => setDetailTab('outline')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  detailTab === 'outline' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                📋 教学大纲
              </button>
              <button
                onClick={() => setDetailTab('stats')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  detailTab === 'stats' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                📊 题型统计
              </button>
            </div>

            {/* Tab 1: 教材内容 */}
            {detailTab === 'content' && (
              <div className="space-y-4">
                {/* 教材基本信息 */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{getSubjectIcon(selectedTextbook.subjectId)}</span>
                    <div>
                      <h4 className="font-bold text-gray-800">{selectedTextbook.name}</h4>
                      <p className="text-sm text-gray-500">
                        {getVersionName(selectedTextbook.versionId)} · {selectedTextbook.grade}年级{selectedTextbook.semester === 1 ? '上册' : '下册'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 单元列表 */}
                {selectedTextbook.units && selectedTextbook.units.length > 0 ? (
                  selectedTextbook.units.map((unit: any, idx: number) => (
                    <div key={unit.id} className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 bg-blue-500 text-white rounded-full text-center text-sm font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <h4 className="font-bold text-gray-800">{unit.name}</h4>
                        </div>
                        <Badge variant="primary">{unit.chapters?.length || 0} 章节</Badge>
                      </div>
                      {/* 章节列表 */}
                      <div className="ml-9 space-y-2">
                        {unit.chapters?.map((chapter: any) => (
                          <div key={chapter.id} className="flex items-center justify-between p-2 bg-white rounded-lg">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400">├</span>
                              <span className="text-sm text-gray-700">{chapter.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="success">{chapter._count?.questions || 0} 题</Badge>
                              <span className="text-xs text-gray-400">
                                {chapter.difficulty === 1 ? '基础' : chapter.difficulty === 2 ? '应用' : chapter.difficulty === 3 ? '综合' : '拓展'}
                              </span>
                              <button
                                onClick={() => {
                                  setSelectedChapter(chapter);
                                  setShowChapterDetail(true);
                                }}
                                className="ml-2 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                              >
                                查看内容
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <div className="text-4xl mb-2">📭</div>
                    <p>暂无教材内容</p>
                    <p className="text-sm">请上传教材文件</p>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: 教学大纲 */}
            {detailTab === 'outline' && (
              <div className="space-y-4">
                {/* 教材信息 */}
                <div className="p-4 bg-blue-50 rounded-xl">
                  <h4 className="font-bold text-gray-800 mb-2">📖 {selectedTextbook.name}</h4>
                  <p className="text-sm text-gray-600">
                    {getSubjectName(selectedTextbook.subjectId)} · {selectedTextbook.grade}年级 ·
                    {selectedTextbook.semester === 1 ? '上册' : '下册'} · {getVersionName(selectedTextbook.versionId)}
                  </p>
                </div>

                {/* 总体学习目标 */}
                <div className="p-4 bg-green-50 rounded-xl">
                  <h4 className="font-bold text-gray-800 mb-3">🎯 总体学习目标</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span>掌握本册教材的基础知识、基本概念和基本技能</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span>能够运用所学知识解决日常生活中的简单问题</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span>培养观察能力、逻辑思维能力和表达能力</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span>养成良好的学习习惯和思考习惯</span>
                    </li>
                  </ul>
                </div>

                {/* 各单元学习重点 */}
                <div className="p-4 bg-yellow-50 rounded-xl">
                  <h4 className="font-bold text-gray-800 mb-3">📚 各单元学习重点</h4>
                  <div className="space-y-4">
                    {selectedTextbook.units?.map((unit: any, idx: number) => (
                      <div key={unit.id} className="flex items-start gap-3">
                        <span className="w-7 h-7 bg-yellow-400 text-white rounded-full text-center text-sm font-bold flex items-center justify-center flex-shrink-0">
                          {idx + 1}
                        </span>
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{unit.name}</p>
                          <div className="mt-1 flex flex-wrap gap-2">
                            {unit.chapters?.map((chapter: any) => (
                              <span key={chapter.id} className="text-xs px-2 py-1 bg-white rounded-full text-gray-600">
                                {chapter.name}
                              </span>
                            ))}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            难度：
                            {unit.chapters?.some((c: any) => c.difficulty === 1) && <span className="text-green-500">基础 </span>}
                            {unit.chapters?.some((c: any) => c.difficulty === 2) && <span className="text-blue-500">应用 </span>}
                            {unit.chapters?.some((c: any) => c.difficulty === 3) && <span className="text-orange-500">综合 </span>}
                            {unit.chapters?.some((c: any) => c.difficulty === 4) && <span className="text-red-500">拓展</span>}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: 题型统计 */}
            {detailTab === 'stats' && (
              <div className="space-y-4">
                {/* 总览 */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-xl">
                    <div className="text-3xl font-bold text-blue-500">{selectedTextbook.questionStats?.total || 0}</div>
                    <div className="text-sm text-gray-500">总题数</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-xl">
                    <div className="text-3xl font-bold text-green-500">{selectedTextbook.questionStats?.byUnit?.length || 0}</div>
                    <div className="text-sm text-gray-500">单元数</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-xl">
                    <div className="text-3xl font-bold text-orange-500">
                      {Object.keys(selectedTextbook.questionStats?.byType || {}).length}
                    </div>
                    <div className="text-sm text-gray-500">题型数</div>
                  </div>
                </div>

                {/* 题型分布 */}
                {selectedTextbook.questionStats?.byType && Object.keys(selectedTextbook.questionStats.byType).length > 0 && (
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <h4 className="font-bold text-gray-800 mb-3">📊 题型分布</h4>
                    <div className="grid grid-cols-5 gap-3">
                      {Object.entries(selectedTextbook.questionStats.byType).map(([type, count]) => (
                        <div key={type} className="text-center p-3 bg-white rounded-xl">
                          <div className="text-2xl mb-1">{QUESTION_TYPE_ICONS[type]}</div>
                          <div className="text-lg font-bold text-gray-800">{count}</div>
                          <div className="text-xs text-gray-500">{QUESTION_TYPE_LABELS[type]}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 各单元题目列表 - 按教材列表方式显示 */}
                <div className="p-4 bg-gray-50 rounded-xl">
                  <h4 className="font-bold text-gray-800 mb-3">📚 各单元题目详情</h4>
                  <div className="space-y-3">
                    {selectedTextbook.units?.map((unit: any, idx: number) => (
                      <div key={unit.id} className="bg-white rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 bg-blue-500 text-white rounded-full text-center text-sm font-bold flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <h5 className="font-bold text-gray-800">{unit.name}</h5>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="success">
                              {unit.chapters?.reduce((sum: number, c: any) => sum + (c._count?.questions || 0), 0) || 0} 题
                            </Badge>
                            <button
                              onClick={() => {
                                setLoadingQuestions(true);
                                fetch(`/api/textbooks/questions?textbookId=${selectedTextbook.id}`)
                                  .then(res => res.json())
                                  .then(data => {
                                    if (data.success) {
                                      const filteredQuestions = data.data.questions.filter((q: any) =>
                                        unit.chapters?.some((c: any) => c.id === q.chapterId)
                                      );
                                      setUnitQuestions([{
                                        unitId: unit.id,
                                        unitName: unit.name,
                                        questions: filteredQuestions
                                      }]);
                                      setQuestionList(filteredQuestions);
                                      setShowQuestionDetail(true);
                                    }
                                    setLoadingQuestions(false);
                                  })
                                  .catch(() => setLoadingQuestions(false));
                              }}
                              className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                              🔍 查看试题
                            </button>
                          </div>
                        </div>
                        {/* 章节列表 */}
                        <div className="ml-9 space-y-2">
                          {unit.chapters?.map((chapter: any, cIdx: number) => (
                            <div key={chapter.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-2">
                                <span className="text-gray-400 text-xs">{cIdx + 1}.</span>
                                <span className="text-sm text-gray-700">{chapter.name}</span>
                                <span className="text-xs text-gray-400">
                                  ({chapter._count?.questions || 0}题)
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {Object.entries(selectedTextbook.questionStats?.byType || {}).slice(0, 3).map(([type, count]: [string, any]) => (
                                  <span key={type} className="text-xs px-1.5 py-0.5 bg-gray-100 rounded text-gray-500">
                                    {QUESTION_TYPE_ICONS[type]}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <ClayButton variant="secondary" className="flex-1" onClick={() => handleRegenerate(selectedTextbook.id)}>
                🔄 重新生成
              </ClayButton>
              <ClayButton className="flex-1" onClick={() => window.location.href = '/question-bank'}>
                🎯 开始练习
              </ClayButton>
            </div>
          </ClayCard>
        </div>
      )}

      {/* 试题列表弹窗 */}
      {showQuestionDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <ClayCard className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">📝 试题详情</h3>
              <button
                onClick={() => {
                  setShowQuestionDetail(false);
                  setQuestionList([]);
                }}
                className="w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center text-2xl text-gray-500"
              >
                ✕
              </button>
            </div>

            {loadingQuestions ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4 animate-spin">⏳</div>
                <p className="text-gray-500">加载中...</p>
              </div>
            ) : questionList.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <div className="text-4xl mb-2">📭</div>
                <p>暂无生成的试题</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-500">共 {questionList.length} 道试题</p>
                  <select
                    className="p-2 bg-white rounded-lg border border-gray-200 text-sm"
                    value={questionFilter}
                    onChange={(e) => setQuestionFilter(e.target.value)}
                  >
                    <option value="all">全部题型</option>
                    {Object.entries(QUESTION_TYPE_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>

                {(() => {
                  const filtered = questionFilter === 'all'
                    ? questionList
                    : questionList.filter((q: any) => q.type === questionFilter);
                  if (filtered.length === 0) {
                    return (
                      <div className="text-center py-8 text-gray-400">
                        <div className="text-4xl mb-2">📭</div>
                        <p>该题型暂无试题</p>
                      </div>
                    );
                  }
                  return filtered.map((question: any, idx: number) => (
                    <div key={question.id} className="p-4 bg-gray-50 rounded-xl mb-3">
                      <div className="flex items-start gap-3">
                        <span className="w-8 h-8 bg-blue-500 text-white rounded-full text-center text-sm font-bold flex items-center justify-center flex-shrink-0">
                          {idx + 1}
                        </span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="primary">{QUESTION_TYPE_ICONS[question.type]} {QUESTION_TYPE_LABELS[question.type]}</Badge>
                            <Badge variant={question.difficulty === 1 ? 'success' : question.difficulty === 2 ? 'primary' : 'warning'}>
                              {question.difficulty === 1 ? '基础' : question.difficulty === 2 ? '应用' : '综合'}
                            </Badge>
                            <span className="text-xs text-gray-400">
                              {question.chapter?.unit?.name} · {question.chapter?.name}
                            </span>
                          </div>
                          <p className="text-gray-800 mb-3">{question.content}</p>

                          {/* 选择题选项 */}
                          {question.options && (() => {
                            const opts = typeof question.options === 'string' ? JSON.parse(question.options) : question.options;
                            return (
                              <div className="space-y-2 mb-3">
                                {opts.map((opt: any) => (
                                  <div key={opt.id} className={`p-2 rounded-lg ${opt.isCorrect ? 'bg-green-100 border border-green-300' : 'bg-white'}`}>
                                    <span className="font-medium text-gray-600 mr-2">{opt.id}.</span>
                                    <span className="text-gray-800">{opt.content}</span>
                                    {opt.isCorrect && <span className="ml-2 text-green-500 text-sm">✓</span>}
                                  </div>
                                ))}
                              </div>
                            );
                          })()}

                          {/* 非选择题答案 */}
                          {['fill', 'calc', 'essay'].includes(question.type) && (
                            <div className="p-2 bg-green-50 rounded-lg mb-3">
                              <span className="text-sm text-gray-600">正确答案：</span>
                              <span className="font-medium text-green-700">{question.answer}</span>
                            </div>
                          )}

                          {/* 知识点 */}
                          {question.knowledgePoint && (
                            <p className="text-xs text-gray-400">📌 知识点：{question.knowledgePoint}</p>
                          )}

                          {/* AI讲解 */}
                          {question.explanation && (
                            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                              <p className="text-sm text-blue-800">
                                <span className="font-medium">💡 AI讲解：</span>{question.explanation}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            )}
          </ClayCard>
        </div>
      )}

      {/* 章节详细内容弹窗 */}
      {showChapterDetail && selectedChapter && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <ClayCard className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800">📖 {selectedChapter.name}</h3>
                <p className="text-sm text-gray-500">
                  {selectedTextbook?.name} · {selectedChapter.difficulty === 1 ? '基础' : selectedChapter.difficulty === 2 ? '应用' : selectedChapter.difficulty === 3 ? '综合' : '拓展'}难度
                </p>
              </div>
              <button
                onClick={() => {
                  setShowChapterDetail(false);
                  setSelectedChapter(null);
                }}
                className="w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center text-2xl text-gray-500"
              >
                ✕
              </button>
            </div>

            {/* PDF预览 */}
            <div className="mb-4">
              {selectedTextbook?.filePath ? (
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <iframe
                    src={`/api/uploads/${encodeURIComponent(selectedTextbook.filePath.split('/').pop() || '')}`}
                    className="w-full h-96"
                    title="PDF预览"
                  />
                </div>
              ) : (
                <div className="bg-gray-100 rounded-xl p-8 text-center">
                  <div className="text-6xl mb-4">📄</div>
                  <p className="text-gray-600 mb-2">PDF教材内容预览</p>
                  <p className="text-sm text-gray-400">
                    {selectedChapter.name} 的教材原文内容
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    请上传教材PDF文件后查看
                  </p>
                </div>
              )}
            </div>

            {/* 章节学习内容 */}
            <div className="p-4 bg-blue-50 rounded-xl mb-4">
              <h4 className="font-bold text-gray-800 mb-2">📚 本章学习内容</h4>
              <div className="text-sm text-gray-600 space-y-2">
                <p>本章节将学习以下内容：</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>理解基本概念和定义</li>
                  <li>掌握解题方法和技巧</li>
                  <li>能够运用所学知识解决实际问题</li>
                  <li>培养逻辑思维和分析能力</li>
                </ul>
              </div>
            </div>

            {/* 相关题目 */}
            <div className="p-4 bg-gray-50 rounded-xl">
              <h4 className="font-bold text-gray-800 mb-3">📝 相关题目 ({selectedChapter._count?.questions || 0}题)</h4>
              <p className="text-sm text-gray-500 mb-3">
                点击下方按钮查看本章生成的所有试题
              </p>
              <ClayButton
                onClick={() => {
                  setLoadingQuestions(true);
                  fetch(`/api/textbooks/questions?chapterId=${selectedChapter.id}`)
                    .then(res => res.json())
                    .then(data => {
                      if (data.success) {
                        setQuestionList(data.data.questions);
                        setShowChapterDetail(false);
                        setShowQuestionDetail(true);
                      }
                      setLoadingQuestions(false);
                    })
                    .catch(() => setLoadingQuestions(false));
                }}
                className="w-full"
              >
                🔍 查看本章试题
              </ClayButton>
            </div>
          </ClayCard>
        </div>
      )}

    </div>
  );
}
