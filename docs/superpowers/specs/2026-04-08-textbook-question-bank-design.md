# 教材管理与题库系统设计规格

**版本**: v2.0
**日期**: 2026-04-08
**状态**: 已确认

---

## 1. 整体架构

**核心流程**：
```
上传教材 → 选择年级/科目/版本 → AI解析 → 生成多题型题目 → 预览确认 → 入库 → 关联闯关系统
```

**页面结构**：
- `/upload` - 教材上传入口 + 文件列表
- `/upload/[id]` - 教材详情 + AI解析进度 + 题目预览确认
- `/question-bank` - 题库总览 + 筛选管理

---

## 2. 数据模型

### 2.1 题目题型定义

```typescript
// 题型枚举
enum QuestionType {
  // 数学
  CHOICE = 'choice',           // 选择题
  FILL_BLANK = 'fill',         // 填空题
  TRUE_FALSE = 'truefalse',    // 判断题
  CALCULATION = 'calc',        // 计算题
  APPLICATION = 'application',  // 应用题

  // 语文
  READING = 'reading',         // 阅读理解
  COMPOSITION = 'composition',  // 作文
  TRANSLATION = 'translation', // 翻译（古诗/文言文）
  WRITING = 'writing',         // 写作

  // 英语
  LISTENING = 'listening',     // 听力
  VOCABULARY = 'vocabulary',  // 词汇题
  GRAMMAR = 'grammar',         // 语法
  Cloze = 'cloze',            // 完形填空
  ERROR_FIND = 'errorfind',    // 改错题
}

// 难度等级
enum Difficulty {
  BASIC = 1,      // 基础
  APPLY = 2,      // 应用
  COMPREHENSIVE = 3, // 综合
  EXTEND = 4,     // 拓展
}
```

### 2.2 题型按科目配置

```typescript
const SubjectQuestionTypes = {
  'math': ['choice', 'fill', 'truefalse', 'calc', 'application'],
  'chinese': ['choice', 'fill', 'truefalse', 'reading', 'composition', 'translation', 'writing'],
  'english': ['choice', 'fill', 'truefalse', 'reading', 'translation', 'cloze', 'vocabulary', 'grammar'],
};
```

### 2.3 题目选项模型

```typescript
// 题目选项（选择题/判断题）
interface QuestionOption {
  id: string;       // A/B/C/D
  content: string;   // 选项内容
  isCorrect: boolean;
}

// 填空题答案
interface FillAnswer {
  answers: string[];      // 多个可能的正确答案
  requireOrder: boolean;  // 是否需要顺序匹配
}

// 判断题答案
interface TrueFalseAnswer {
  answer: boolean;
}

// 问答题/应用题答案
interface SubjectiveAnswer {
  standardAnswer: string;  // 标准答案
  points: string[];        // 给分点
  maxScore: number;
}

// 作文/写作答案
interface CompositionAnswer {
  title?: string;         // 题目（如果有）
  requirements: string[]; // 要求
  wordCount: [number, number]; // 字数范围
  scoringRubric: string;  // 评分标准
}
```

### 2.4 题目模型

```typescript
// Question 表扩展
model Question {
  id              String   @id @default(cuid())
  chapterId       String?
  textbookId      String?  // 关联教材ID
  type            String   // 题型
  difficulty      Int      @default(1) // 1-4
  content         String             // 题目内容
  options         Json?              // 选择题选项
  answer          String             // 答案
  explanation     String?            // 解析
  knowledgePoint  String?            // 知识点
  source          String  @default("textbook") // 来源

  // 各题型特有字段
  subQuestion?: Json     // 子题（如阅读理解有多题）
  scoring?: Json         // 评分细则

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### 2.5 教材文件模型

```typescript
// UploadedFile 表
model UploadedFile {
  id               String   @id @default(cuid())
  userId           String
  fileName         String             // 原始文件名
  filePath         String             // 本地存储路径
  fileSize         Int                // 文件大小(字节)
  subjectId        String             // 科目ID
  grade            Int                // 年级 1-6
  textbookVersionId String?            // 教材版本ID

  status           String   @default("uploaded")
  // uploaded | parsing | generating | completed | error

  parseProgress    Int      @default(0)
  generatedQuestions Int    @default(0)
  questionTypes: Json       // 本次生成的题型配置

  errorMessage     String?
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}

// 解析结果临时表
model ParseResult {
  id              String   @id @default(cuid())
  uploadedFileId  String
  questions       Json               // 生成的题目JSON
  questionTypes   Json               // 题型配置
  status          String   @default("pending")
  // pending | confirmed | rejected

  createdAt       DateTime @default(now())
}
```

---

## 3. AI生成配置

### 3.1 题目生成配置

```typescript
interface QuestionGenerateConfig {
  subject: string;        // 科目
  grade: number;          // 年级
  textbookVersion?: string; // 教材版本
  questionTypes: string[]; // 题型列表
  difficultyDistribution: {
    basic: number;        // 基础题比例
    apply: number;        // 应用题比例
    comprehensive: number; // 综合题比例
    extend: number;       // 拓展题比例
  };
  countPerType: number;   // 每种题型数量
}
```

### 3.2 难度分布建议

| 科目 | 基础(1) | 应用(2) | 综合(3) | 拓展(4) |
|------|---------|---------|---------|---------|
| 数学 | 30% | 40% | 20% | 10% |
| 语文 | 30% | 35% | 25% | 10% |
| 英语 | 35% | 35% | 20% | 10% |

---

## 4. 页面详细设计

### 4.1 教材上传页面 `/upload`

**功能模块**：

| 模块 | 说明 |
|------|------|
| 上传区域 | 拖拽/点击上传，支持PDF/DOC/DOCX |
| 教材配置 | 上传后选择：科目、年级、版本、题型 |
| 文件列表 | 显示已上传教材及状态 |
| 快捷入口 | 查看题库 |

**教材配置模态框**：
```
┌─────────────────────────────────────────┐
│ 教材配置                                 │
├─────────────────────────────────────────┤
│ 科目:    [数学 ▼]                        │
│ 年级:    [三年级 ▼]                      │
│ 版本:    [人教版 ▼]                       │
│ 题型:    ☑ 选择题  ☐ 填空题              │
│          ☑ 判断题  ☐ 计算题              │
│          ☐ 应用题  ☐ 阅读理解            │
│ 题目数量: [10 ▼] 题                      │
│ 难度:    ☑ 基础  ☑ 应用                  │
│          ☑ 综合  ☐ 拓展                  │
├─────────────────────────────────────────┤
│              [取消]  [开始解析]           │
└─────────────────────────────────────────┘
```

**文件列表卡片**：
```
┌─────────────────────────────────────────┐
│ 📄 三年级数学上册.pdf                    │
│  数学 · 三年级 · 人教版                  │
│  题型: 选择题×5 计算题×3 应用题×2        │
│  ████████████░░░░ 75%  生成中...        │
│                          [查看] [删除]   │
└─────────────────────────────────────────┘
```

### 4.2 教材详情页 `/upload/[id]`

**功能模块**：

| 模块 | 说明 |
|------|------|
| 教材信息 | 文件名、科目、年级、版本、上传时间 |
| 题型配置 | 显示本次生成的题型和难度 |
| 解析进度 | 实时进度条 + 状态说明 |
| 题目预览 | AI生成的各类题目列表（按题型分组） |
| 操作按钮 | 确认入库 / 重新生成 / 返回 |

**题目预览（按题型分组）**：
```
┌─────────────────────────────────────────┐
│ 📝 选择题 (5题)               基础×3 应用×2 │
├─────────────────────────────────────────┤
│ Q1. 12 + 8 = ?                          │
│     ○ A. 20  ○ B. 19  ○ C. 21  ○ D. 18 │
│                                   ✓ A   │
├─────────────────────────────────────────┤
│ Q2. 下列哪个是偶数？                      │
│     ○ A. 3   ○ B. 5   ○ C. 7   ○ D. 2   │
│                                   ✓ D   │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 📝 计算题 (3题)               基础×2 应用×1 │
├─────────────────────────────────────────┤
│ Q1. 25 × 17 = ?                         │
│     答案: 425                           │
│     解题思路: 先算25×10=250...          │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 📝 应用题 (2题)               应用×1 综合×1 │
├─────────────────────────────────────────┤
│ Q1. 小明有12个苹果，小红给了他5个，        │
│     现在一共有多少个？                    │
│     答案: 17个                          │
│     解题思路: 12+5=17...                │
└─────────────────────────────────────────┘
```

### 4.3 题库管理页面 `/question-bank`

**功能模块**：

| 模块 | 说明 |
|------|------|
| 筛选器 | 按科目/年级/题型/难度/来源筛选 |
| 题目列表 | 题目卡片展示（按题型分组合并显示） |
| 题库统计 | 总数、各题型数量、各难度数量 |
| 批量操作 | 批量删除、批量导出 |

**筛选器**：
```
[全部科目 ▼] [全部年级 ▼] [全部题型 ▼] [全部难度 ▼] [全部来源 ▼]
```

**题型选项**：
```
数学: 选择题、填空题、判断题、计算题、应用题
语文: 选择题、填空题、判断题、阅读理解、作文、翻译
英语: 选择题、填空题、判断题、阅读理解、翻译、完形填空
```

**题目卡片**：
```
┌─────────────────────────────────────────┐
│ 📝 选择题  基础  数学  三年级  📄 人教版  │
│                                         │
│ 12 + 8 = ?                              │
│                                         │
│ A. 20 ✓  B. 19  C. 21  D. 18           │
│                                         │
│ 创建时间: 2024-03-20     [编辑] [删除]   │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ ✍️ 应用题  应用  数学  三年级              │
│                                         │
│ 小明有12个苹果，小红给了他5个...          │
│                                         │
│ 答案: 17个  思路: 加法运算               │
│                                         │
│ 创建时间: 2024-03-20     [编辑] [删除]   │
└─────────────────────────────────────────┘
```

---

## 5. API 设计

```
# 教材相关
POST   /api/upload                  # 上传教材文件
GET    /api/upload                  # 获取教材列表
GET    /api/upload/[id]             # 获取教材详情
DELETE /api/upload/[id]             # 删除教材及关联题目
POST   /api/upload/[id]/generate    # 触发AI解析生成
GET    /api/upload/[id]/questions   # 获取生成的题目预览
POST   /api/upload/[id]/confirm     # 确认入库
POST   /api/upload/[id]/retry       # 重新生成

# 题库相关
GET    /api/questions               # 获取题库（支持筛选分页）
GET    /api/questions/[id]          # 获取题目详情
DELETE /api/questions/[id]          # 删除题目
PATCH  /api/questions/[id]          # 编辑题目
POST   /api/questions/batch-delete  # 批量删除

# 辅助接口
GET    /api/subjects                # 获取科目列表
GET    /api/textbook-versions       # 获取教材版本
GET    /api/question-types          # 获取题型配置
```

### 5.1 题目筛选参数

```
GET /api/questions?
  subject=math&
  grade=3&
  type=choice,fill&
  difficulty=1,2&
  source=textbook&
  page=1&
  pageSize=20
```

---

## 6. 存储结构

```
/uploads/
  /{userId}/
    /{uploadedFileId}/
      original.pdf                  # 原始文件
      metadata.json                 # 解析元数据

/prisma/
  study.db                          # SQLite数据库
```

---

## 7. UI/UX 要点

1. **上传页**：上传后弹出配置框，选择科目后动态显示对应题型
2. **详情页**：
   - 解析进度实时更新
   - 题目按题型分组展示
   - 不同题型用不同图标区分
3. **题库页**：
   - 支持多条件组合筛选
   - 题型图标统一（选择题📝、填空题✏️、判断题✓、计算题🧮、应用题📊、阅读📖、作文✍️、翻译🌐）
4. **响应式**：移动端筛选器折叠为下拉菜单

---

## 8. 题题型图标对照

| 题型 | 图标 | 英文key |
|------|------|---------|
| 选择题 | 📝 | choice |
| 填空题 | ✏️ | fill |
| 判断题 | ✓❌ | truefalse |
| 计算题 | 🧮 | calc |
| 应用题 | 📊 | application |
| 阅读理解 | 📖 | reading |
| 作文/写作 | ✍️ | composition/writing |
| 翻译题 | 🌐 | translation |
| 完形填空 | 📚 | cloze |
| 词汇题 | 🔤 | vocabulary |
| 语法题 | 📐 | grammar |

---

## 9. 已确认

- [x] 教材上传 → AI解析 → 自动生成题库
- [x] 本地存储
- [x] 题目归属科目+年级
- [x] AI生成后预览+确认入库
- [x] 题库关联闯关系统随机抽取
- [x] 增加多题型：选择、填空、判断、计算、应用、阅读、作文、翻译等
- [x] 年级和科目和版本归属
