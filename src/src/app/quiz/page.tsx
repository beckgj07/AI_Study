'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ClayCard, ClayButton, Badge, ProgressBar } from '@/components/ClayCard';

interface Question {
  id: string;
  type: string;
  difficulty: number;
  content: string;
  options?: string[];
  answer: string;
  correctIndex: number;
  explanation?: string;
  knowledgePoint?: string;
  subject?: string;
}

// 根据 chapterId 判断科目类型
function getSubjectFromChapterId(chapterId: string): 'math' | 'chinese' | 'english' {
  if (chapterId.startsWith('c') && !['c1', 'c2', 'c3', 'c4', 'c5', 'c6'].includes(chapterId) && parseInt(chapterId.slice(1)) >= 7) {
    if (parseInt(chapterId.slice(1)) >= 9) return 'english';
    return 'chinese';
  }
  if (chapterId === 'comp2') return 'chinese';
  if (chapterId === 'comp3') return 'english';
  return 'math';
}

// 数学题生成器
function generateMathQuestion(difficulty: number): Question {
  const num1 = Math.floor(Math.random() * 50) + 5;
  const num2 = Math.floor(Math.random() * 50) + 5;
  const correctAnswer = num1 + num2;

  const wrongAnswers = [
    correctAnswer + Math.floor(Math.random() * 20) + 1,
    correctAnswer - Math.floor(Math.random() * 15) - 1,
    correctAnswer + Math.floor(Math.random() * 25) + 5,
  ];

  const optionsWithIndex = [
    { value: correctAnswer, isCorrect: true },
    { value: wrongAnswers[0], isCorrect: false },
    { value: wrongAnswers[1], isCorrect: false },
    { value: wrongAnswers[2], isCorrect: false },
  ];

  // 随机排序
  for (let j = optionsWithIndex.length - 1; j > 0; j--) {
    const k = Math.floor(Math.random() * (j + 1));
    [optionsWithIndex[j], optionsWithIndex[k]] = [optionsWithIndex[k], optionsWithIndex[j]];
  }

  const correctIndex = optionsWithIndex.findIndex(o => o.isCorrect);

  return {
    id: `math_${Date.now()}_${Math.random()}`,
    type: 'choice',
    difficulty,
    content: `${num1} + ${num2} = ?`,
    options: optionsWithIndex.map(o => `${o.value}`),
    answer: `${correctAnswer}`,
    correctIndex,
    explanation: '这是简单的加法计算。',
    knowledgePoint: '加法运算',
    subject: 'math',
  };
}

// 语文题生成器
function generateChineseQuestion(difficulty: number): Question {
  const poems = [
    { q: '"春眠不觉晓"下一句是？', a: '处处闻啼鸟', wrong: ['夜来风雨声', '花落知多少', '鸟鸣山更幽'] },
    { q: '"举头望明月"的下一句是？', a: '低头思故乡', wrong: ['海上生明月', '天涯共此时', '月是故乡明'] },
    { q: '《静夜思》的作者是？', a: '李白', wrong: ['杜甫', '王维', '白居易'] },
    { q: '"两个黄鹂鸣翠柳"下一句是？', a: '一行白鹭上青天', wrong: ['窗含西岭千秋雪', '门泊东吴万里船', '春风又绿江南岸'] },
    { q: '"锄禾日当午"下一句是？', a: '汗滴禾下土', wrong: ['粒粒皆辛苦', '春种一粒粟', '秋收万颗子'] },
  ];

  const poem = poems[Math.floor(Math.random() * poems.length)];
  const wrongAnswers = [...poem.wrong].sort(() => Math.random() - 0.5).slice(0, 3);

  const optionsWithIndex = [
    { value: poem.a, isCorrect: true },
    { value: wrongAnswers[0], isCorrect: false },
    { value: wrongAnswers[1], isCorrect: false },
    { value: wrongAnswers[2], isCorrect: false },
  ];

  // 随机排序
  for (let j = optionsWithIndex.length - 1; j > 0; j--) {
    const k = Math.floor(Math.random() * (j + 1));
    [optionsWithIndex[j], optionsWithIndex[k]] = [optionsWithIndex[k], optionsWithIndex[j]];
  }

  const correctIndex = optionsWithIndex.findIndex(o => o.isCorrect);

  return {
    id: `chinese_${Date.now()}_${Math.random()}`,
    type: 'choice',
    difficulty,
    content: poem.q,
    options: optionsWithIndex.map(o => o.value),
    answer: poem.a,
    correctIndex,
    explanation: '这是古诗词默写题目。',
    knowledgePoint: '古诗词',
    subject: 'chinese',
  };
}

// 英语题生成器
function generateEnglishQuestion(difficulty: number): Question {
  const questions = [
    { q: '"Hello"的意思是？', a: '你好', wrong: ['再见', '谢谢', '对不起'] },
    { q: '"Thank you"的意思是？', a: '谢谢', wrong: ['请', '你好', '再见'] },
    { q: '"Good morning"的意思是？', a: '早上好', wrong: ['晚上好', '下午好', '晚安'] },
    { q: '"My name is Tom"中"Tom"是什么？', a: '名字', wrong: ['姓氏', '国籍', '年龄'] },
    { q: '"I am a student"翻译正确的是？', a: '我是一个学生', wrong: ['我是一名老师', '我是一个医生', '我是一个警察'] },
  ];

  const q = questions[Math.floor(Math.random() * questions.length)];
  const wrongAnswers = [...q.wrong].sort(() => Math.random() - 0.5).slice(0, 3);

  const optionsWithIndex = [
    { value: q.a, isCorrect: true },
    { value: wrongAnswers[0], isCorrect: false },
    { value: wrongAnswers[1], isCorrect: false },
    { value: wrongAnswers[2], isCorrect: false },
  ];

  // 随机排序
  for (let j = optionsWithIndex.length - 1; j > 0; j--) {
    const k = Math.floor(Math.random() * (j + 1));
    [optionsWithIndex[j], optionsWithIndex[k]] = [optionsWithIndex[k], optionsWithIndex[j]];
  }

  const correctIndex = optionsWithIndex.findIndex(o => o.isCorrect);

  return {
    id: `english_${Date.now()}_${Math.random()}`,
    type: 'choice',
    difficulty,
    content: q.q,
    options: optionsWithIndex.map(o => o.value),
    answer: q.a,
    correctIndex,
    explanation: '这是英语选择题。',
    knowledgePoint: '基础英语',
    subject: 'english',
  };
}

// 根据科目生成题目
function generateQuestion(subject: 'math' | 'chinese' | 'english', difficulty: number): Question {
  switch (subject) {
    case 'chinese':
      return generateChineseQuestion(difficulty);
    case 'english':
      return generateEnglishQuestion(difficulty);
    default:
      return generateMathQuestion(difficulty);
  }
}

// 获取科目名称
function getSubjectName(subject: 'math' | 'chinese' | 'english'): string {
  switch (subject) {
    case 'chinese': return '语文';
    case 'english': return '英语';
    default: return '数学';
  }
}

function QuizContent() {
  const searchParams = useSearchParams();
  const chapterId = searchParams.get('chapterId') || 'demo';
  const count = parseInt(searchParams.get('count') || '10');
  const mode = searchParams.get('mode') || 'practice';
  const difficulty = parseInt(searchParams.get('difficulty') || '1');

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [fillAnswer, setFillAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [results, setResults] = useState({ correct: 0, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [quizComplete, setQuizComplete] = useState(false);

  // 根据 chapterId 确定科目
  const subject = getSubjectFromChapterId(chapterId);
  const subjectName = getSubjectName(subject);

  useEffect(() => {
    // 根据科目生成题目
    const mockQuestions: Question[] = Array.from({ length: count }, () => {
      return generateQuestion(subject, difficulty);
    });
    setQuestions(mockQuestions);
    setIsLoading(false);
  }, [count, subject, difficulty]);

  const currentQuestion = questions[currentIndex];

  const handleSelectAnswer = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
  };

  const handleFillAnswer = (answer: string) => {
    if (showResult) return;
    setFillAnswer(answer);
  };

  const handleSubmit = () => {
    if (showResult) {
      // 下一题或完成
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setSelectedAnswer(null);
        setFillAnswer('');
        setShowResult(false);
      } else {
        setQuizComplete(true);
      }
      return;
    }

    // 判断答案是否正确
    if (currentQuestion.type === 'fill') {
      // 填空题：直接比较数值
      const userAnswer = fillAnswer.trim();
      const isCorrect = userAnswer === currentQuestion.answer;
      setResults((prev) => ({
        correct: prev.correct + (isCorrect ? 1 : 0),
        total: prev.total + 1,
      }));
    } else {
      // 选择题：比较选项索引
      if (selectedAnswer === null) return;
      const isCorrect = selectedAnswer === currentQuestion.correctIndex;
      setResults((prev) => ({
        correct: prev.correct + (isCorrect ? 1 : 0),
        total: prev.total + 1,
      }));
    }
    setShowResult(true);
  };

  const getOptionClass = (optIndex: number) => {
    const baseClass = 'p-4 rounded-xl border-2 text-left font-medium transition-all';

    if (showResult) {
      if (optIndex === currentQuestion.correctIndex) {
        return `${baseClass} border-green-500 bg-green-50 text-green-700`;
      }
      if (optIndex === selectedAnswer && optIndex !== currentQuestion.correctIndex) {
        return `${baseClass} border-red-500 bg-red-50 text-red-700`;
      }
      return `${baseClass} border-gray-200 bg-gray-50`;
    }

    if (optIndex === selectedAnswer) {
      return `${baseClass} border-orange-400 bg-orange-50 shadow-[4px_4px_8px_rgba(249,115,22,0.15)]`;
    }
    return `${baseClass} border-gray-200 bg-white hover:border-blue-300`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-bounce">📚</div>
          <p className="text-gray-500">正在加载题目...</p>
        </div>
      </div>
    );
  }

  if (quizComplete) {
    const percentage = Math.round((results.correct / results.total) * 100);
    const isGood = percentage >= 60;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <ClayCard className="w-full max-w-md text-center">
          <div className="text-6xl mb-4">{isGood ? '🎉' : '💪'}</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {isGood ? '太棒了！' : '继续加油！'}
          </h2>
          <p className="text-gray-500 mb-6">
            {isGood ? '你已经掌握了这些知识点' : '多练习一下，你会更好的'}
          </p>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 clay-inset text-center">
              <div className="text-2xl font-bold text-blue-500">{results.total}</div>
              <div className="text-sm text-gray-500">总题数</div>
            </div>
            <div className="p-4 clay-inset text-center">
              <div className="text-2xl font-bold text-green-500">{results.correct}</div>
              <div className="text-sm text-gray-500">答对</div>
            </div>
            <div className="p-4 clay-inset text-center">
              <div className="text-2xl font-bold text-orange-500">{percentage}%</div>
              <div className="text-sm text-gray-500">正确率</div>
            </div>
          </div>

          <div className="space-y-3">
            <Link href="/dashboard">
              <ClayButton className="w-full">返回首页</ClayButton>
            </Link>
            <Link href="/challenge">
              <ClayButton variant="secondary" className="w-full">
                再闯一关
              </ClayButton>
            </Link>
          </div>
        </ClayCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <Link href="/challenge" className="text-gray-500 hover:text-gray-700">
              ← 退出
            </Link>
            <Badge variant={mode === 'exam' ? 'error' : 'primary'}>
              {mode === 'exam' ? '考试模式' : '练习模式'}
            </Badge>
            <span className="text-sm text-gray-500">
              {currentIndex + 1}/{questions.length}
            </span>
          </div>
          <ProgressBar value={currentIndex + 1} max={questions.length} />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <ClayCard className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="primary">{subjectName}</Badge>
            <Badge variant="muted">三年级</Badge>
            <Badge variant="success">基础</Badge>
          </div>

          <p className="text-xl font-semibold text-center py-6">{currentQuestion.content}</p>

          {currentQuestion.type === 'choice' && currentQuestion.options && (
            <div className="grid grid-cols-2 gap-3">
              {currentQuestion.options.map((opt, optIndex) => (
                <button
                  key={optIndex}
                  onClick={() => handleSelectAnswer(optIndex)}
                  disabled={showResult}
                  className={getOptionClass(optIndex)}
                >
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-bold mr-3">
                    {String.fromCharCode(65 + optIndex)}
                  </span>
                  {opt}
                </button>
              ))}
            </div>
          )}

          {currentQuestion.type === 'fill' && (
            <div className="clay-inset">
              <input
                type="text"
                value={fillAnswer}
                onChange={(e) => handleFillAnswer(e.target.value)}
                disabled={showResult}
                placeholder="请输入答案"
                className="w-full bg-transparent text-lg outline-none text-center"
              />
            </div>
          )}

          {showResult && (
            <div
              className={`mt-4 p-4 rounded-xl ${
                (currentQuestion.type === 'fill'
                  ? fillAnswer.trim() === currentQuestion.answer
                  : selectedAnswer === currentQuestion.correctIndex)
                  ? 'bg-green-50 border-2 border-green-200'
                  : 'bg-red-50 border-2 border-red-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">
                  {currentQuestion.type === 'fill'
                    ? fillAnswer.trim() === currentQuestion.answer
                      ? '✅'
                      : '❌'
                    : selectedAnswer === currentQuestion.correctIndex
                    ? '✅'
                    : '❌'}
                </span>
                <span className="font-bold">
                  {currentQuestion.type === 'fill'
                    ? fillAnswer.trim() === currentQuestion.answer
                      ? '回答正确！'
                      : '回答错误'
                    : selectedAnswer === currentQuestion.correctIndex
                    ? '回答正确！'
                    : '回答错误'}
                </span>
              </div>
              {currentQuestion.explanation && (
                <p className="text-gray-600 text-sm">{currentQuestion.explanation}</p>
              )}
              {currentQuestion.type !== 'fill' && selectedAnswer !== currentQuestion.correctIndex && (
                <p className="text-gray-600 text-sm mt-2">
                  正确答案：{String.fromCharCode(65 + currentQuestion.correctIndex)}.{' '}
                  {currentQuestion.options?.[currentQuestion.correctIndex]}
                </p>
              )}
            </div>
          )}
        </ClayCard>

        <div className="flex gap-3">
          <ClayButton variant="ghost" className="flex-1">
            💡 提示
          </ClayButton>
          <ClayButton
            variant="ghost"
            className="flex-1"
            onClick={() => {
              if (currentIndex < questions.length - 1) {
                setCurrentIndex(currentIndex + 1);
                setSelectedAnswer(null);
                setFillAnswer('');
                setShowResult(false);
              } else {
                setQuizComplete(true);
              }
            }}
          >
            ⏭️ 跳过
          </ClayButton>
          <ClayButton
            className="flex-1"
            onClick={handleSubmit}
            disabled={
              !showResult &&
              (currentQuestion.type === 'fill' ? !fillAnswer : selectedAnswer === null)
            }
          >
            {showResult ? (currentIndex < questions.length - 1 ? '下一题' : '完成') : '提交'}
          </ClayButton>
        </div>
      </main>
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-bounce">📚</div>
          <p className="text-gray-500">正在加载...</p>
        </div>
      </div>
    }>
      <QuizContent />
    </Suspense>
  );
}
