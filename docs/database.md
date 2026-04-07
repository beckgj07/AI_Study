# AI_Study 数据库文档

## 概述

AI_Study 使用 SQLite 数据库，通过 Prisma ORM 进行操作。数据库文件位于 `prisma/dev.db`。

## 数据模型

### User (用户)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String | 主键，CUID |
| name | String | 用户名称 |
| avatar | String? | 头像URL |
| role | String | 角色：parent/child |
| parentId | String? | 家长ID（孩子账号关联） |
| grade | Int? | 年级 1-6 |
| dailyGoal | Int? | 每日目标（关卡数） |
| weeklyGoal | Int? | 每周目标 |
| rewardRules | Json? | 奖励规则配置 |
| createdAt | DateTime | 创建时间 |
| updatedAt | DateTime | 更新时间 |

**关系：**
- 一个家长可以有多个孩子账号
- 一个用户可以绑定多个科目
- 一个用户有多条答题记录、错题记录、成就、积分、打卡记录

### Subject (科目)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String | 主键 |
| name | String | 科目名称 |
| icon | String? | 图标 |
| isPreset | Boolean | 是否预设（语数外） |
| isRequired | Boolean | 是否必选 |
| order | Int | 排序 |
| createdAt | DateTime | 创建时间 |

**预设科目：**
- 数学 (📐)
- 语文 (📖)
- 英语 (🔤)

### TextbookVersion (教材版本)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String | 主键 |
| name | String | 版本名称 |
| publisher | String? | 出版社 |
| subjectId | String | 科目ID |
| createdAt | DateTime | 创建时间 |

**支持版本：**

数学：
- 人教版
- 北师大版
- 苏教版
- 沪教版

语文：
- 人教版
- 北师大版
- 部编版
- 苏教版

英语：
- 人教版(PEP)
- 外研社版
- 北师大版
- 沪教版

### UserSubject (用户科目绑定)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String | 主键 |
| userId | String | 用户ID |
| subjectId | String | 科目ID |
| grade | Int | 年级 |
| textbookVersionId | String? | 教材版本ID |
| createdAt | DateTime | 创建时间 |
| updatedAt | DateTime | 更新时间 |

**唯一约束：** userId + subjectId + grade

### Course (课程)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String | 主键 |
| name | String | 课程名称 |
| subjectId | String | 科目ID |
| grade | Int | 年级 |
| createdAt | DateTime | 创建时间 |

### Unit (单元)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String | 主键 |
| name | String | 单元名称 |
| order | Int | 排序 |
| courseId | String | 课程ID |
| createdAt | DateTime | 创建时间 |

### Chapter (章节)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String | 主键 |
| name | String | 章节名称 |
| order | Int | 排序 |
| difficulty | Int | 难度等级 1-4 |
| unitId | String | 单元ID |
| createdAt | DateTime | 创建时间 |

**难度等级：**
- 1: 基础
- 2: 应用
- 3: 综合
- 4: 拓展（奥赛）

### Question (题目)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String | 主键 |
| chapterId | String | 章节ID |
| type | String | 类型：choice/multiple/fill/essay |
| difficulty | Int | 难度 1-4 |
| content | String | 题目内容 |
| options | Json? | 选项（选择题） |
| answer | String | 正确答案 |
| explanation | String? | AI讲解 |
| knowledgePoint | String? | 知识点标签 |
| source | String? | 来源：教材/AI生成/手动 |
| createdAt | DateTime | 创建时间 |

**题目类型：**
- choice: 单选题
- multiple: 多选题
- fill: 填空题
- essay: 解答题

### AnswerRecord (答题记录)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String | 主键 |
| userId | String | 用户ID |
| questionId | String | 题目ID |
| answer | String | 用户答案 |
| isCorrect | Boolean | 是否正确 |
| timeSpent | Int? | 耗时（秒） |
| mode | String | 模式：practice/exam |
| createdAt | DateTime | 答题时间 |

### WrongQuestion (错题本)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String | 主键 |
| userId | String | 用户ID |
| questionId | String | 题目ID |
| wrongCount | Int | 错误次数 |
| wrongReason | String? | 错因分析 |
| lastReview | DateTime? | 上次复习时间 |
| nextReview | DateTime? | 下次复习时间 |
| isMastered | Boolean | 是否已掌握 |
| createdAt | DateTime | 创建时间 |
| updatedAt | DateTime | 更新时间 |

**唯一约束：** userId + questionId

### Achievement (成就)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String | 主键 |
| userId | String | 用户ID |
| type | String | 成就类型标识 |
| name | String | 成就名称 |
| desc | String? | 成就描述 |
| icon | String? | 图标 |
| unlockedAt | DateTime | 解锁时间 |

**唯一约束：** userId + type

### Point (积分)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String | 主键 |
| userId | String | 用户ID |
| points | Int | 积分变动 |
| source | String | 来源 |
| desc | String? | 描述 |
| createdAt | DateTime | 时间 |

### CheckIn (打卡记录)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String | 主键 |
| userId | String | 用户ID |
| date | String | 日期 YYYY-MM-DD |
| completed | Boolean | 是否完成 |
| goal | Int? | 当日目标 |
| achieved | Int? | 完成数量 |
| createdAt | DateTime | 创建时间 |

**唯一约束：** userId + date

### AiModelConfig (AI模型配置)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String | 主键 |
| name | String | 模型名称 |
| provider | String | 提供商 |
| apiUrl | String | API地址 |
| apiKey | String? | API Key |
| isDefault | Boolean | 是否默认 |
| isActive | Boolean | 是否启用 |
| priority | Int | 调用优先级 |
| costLimit | Float? | 成本限制 |
| createdAt | DateTime | 创建时间 |
| updatedAt | DateTime | 更新时间 |

## ER 关系图

```
User (1) ────── (N) UserSubject (N) ────── (1) Subject
  │                                        │
  │                                        ▼
  │                               TextbookVersion
  │
  ├──── (N) AnswerRecord (N) ───── Question (N) ───── Chapter (N) ───── Unit (N) ───── Course
  │
  ├──── (N) WrongQuestion ────────────────────────── Question
  │
  ├──── (N) Achievement
  │
  ├──── (N) Point
  │
  └──── (N) CheckIn
```

## 索引

- `UserSubject`: userId, subjectId, grade (唯一索引)
- `WrongQuestion`: userId, questionId (唯一索引)
- `Achievement`: userId, type (唯一索引)
- `CheckIn`: userId, date (唯一索引)
- `AnswerRecord`: userId, createdAt
- `Point`: userId, createdAt

## 迁移

修改 Schema 后执行：

```bash
npx prisma db push    # 推送到数据库
npx prisma generate   # 重新生成客户端
```
