// 题型定义
export const QUESTION_TYPES = {
  // 数学
  CHOICE: 'choice',           // 选择题
  FILL_BLANK: 'fill',         // 填空题
  TRUE_FALSE: 'truefalse',     // 判断题
  CALCULATION: 'calc',        // 计算题
  APPLICATION: 'application', // 应用题
  // 语文
  READING: 'reading',          // 阅读理解
  COMPOSITION: 'composition',  // 作文
  TRANSLATION: 'translation',  // 翻译
  WRITING: 'writing',         // 写作
  // 英语
  LISTENING: 'listening',     // 听力题
  VOCABULARY: 'vocabulary',   // 词汇题
  GRAMMAR: 'grammar',         // 语法题
  CLOZE: 'cloze',            // 完形填空
  ERROR_FIND: 'errorfind',    // 改错题
} as const;

export type QuestionType = typeof QUESTION_TYPES[keyof typeof QUESTION_TYPES];

// 题型名称（中文）
export const QUESTION_TYPE_LABELS: Record<string, string> = {
  choice: '选择题',
  fill: '填空题',
  truefalse: '判断题',
  calc: '计算题',
  application: '应用题',
  reading: '阅读理解',
  composition: '作文',
  translation: '翻译题',
  writing: '写作',
  listening: '听力题',
  vocabulary: '词汇题',
  grammar: '语法题',
  cloze: '完形填空',
  errorfind: '改错题',
};

// 题型图标
export const QUESTION_TYPE_ICONS: Record<string, string> = {
  choice: '📝',
  fill: '✏️',
  truefalse: '✓',
  calc: '🧮',
  application: '📊',
  reading: '📖',
  composition: '✍️',
  translation: '🌐',
  writing: '📝',
  listening: '🎧',
  vocabulary: '🔤',
  grammar: '📐',
  cloze: '📚',
  errorfind: '🔍',
};

// 科目对应的题型
export const SUBJECT_QUESTION_TYPES: Record<string, string[]> = {
  math: ['choice', 'fill', 'truefalse', 'calc', 'application'],
  chinese: ['choice', 'fill', 'truefalse', 'reading', 'composition', 'translation', 'writing'],
  english: ['choice', 'fill', 'truefalse', 'reading', 'translation', 'cloze', 'vocabulary', 'grammar'],
};

// 难度等级
export const DIFFICULTY_LEVELS = {
  BASIC: 1,         // 基础
  APPLY: 2,         // 应用
  COMPREHENSIVE: 3, // 综合
  EXTEND: 4,        // 拓展
} as const;

export const DIFFICULTY_LABELS = ['基础', '应用', '综合', '拓展'];

// 难度颜色
export const DIFFICULTY_COLORS = ['success', 'primary', 'accent', 'error'] as const;

// 难度分布建议（按科目）
export const DIFFICULTY_DISTRIBUTION: Record<string, number[]> = {
  math: [30, 40, 20, 10],     // 基础30% 应用40% 综合20% 拓展10%
  chinese: [30, 35, 25, 10],
  english: [35, 35, 20, 10],
};

// 科目配置
export const SUBJECTS = [
  { id: 'math', name: '数学', icon: '📐' },
  { id: 'chinese', name: '语文', icon: '📖' },
  { id: 'english', name: '英语', icon: '🔤' },
];

// 年级选项
export const GRADES = [1, 2, 3, 4, 5, 6];

// 学期选项
export const SEMESTERS = [
  { id: 1, name: '上册' },
  { id: 2, name: '下册' },
];

// 教材版本
export const TEXTBOOK_VERSIONS = [
  { id: 'pep', name: '人教版' },
  { id: 'bsd', name: '北师大版' },
  { id: 'js', name: '苏教版' },
  { id: 'other', name: '其他版本' },
];
