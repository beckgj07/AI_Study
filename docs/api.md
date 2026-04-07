# AI_Study API 接口文档

## 概述

所有 API 接口均返回统一的 JSON 格式：

```json
{
  "success": true,
  "data": { ... }
}
```

或错误时：

```json
{
  "success": false,
  "error": "错误信息"
}
```

## 用户 API

### 获取用户列表

```
GET /api/users
```

**查询参数：**
- `parentId`: 家长ID（获取该家长的所有孩子）
- `role`: 角色过滤（parent/child）

**响应示例：**
```json
{
  "success": true,
  "data": [
    {
      "id": "xxx",
      "name": "小明",
      "role": "child",
      "grade": 3,
      "children": []
    }
  ]
}
```

### 创建用户

```
POST /api/users
```

**请求体：**
```json
{
  "name": "小明",
  "role": "child",
  "parentId": "xxx",
  "grade": 3
}
```

### 获取用户详情

```
GET /api/users/[id]
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "id": "xxx",
    "name": "小明",
    "role": "child",
    "grade": 3,
    "totalPoints": 1250,
    "_count": {
      "answerRecords": 256,
      "wrongQuestions": 12,
      "achievements": 8
    }
  }
}
```

### 更新用户

```
PATCH /api/users/[id]
```

**请求体：**
```json
{
  "name": "新名字",
  "grade": 4,
  "dailyGoal": 5
}
```

### 删除用户

```
DELETE /api/users/[id]
```

---

## 科目 API

### 获取科目列表

```
GET /api/subjects
```

**查询参数：**
- `includeVersions`: 是否包含教材版本（true/false）

**响应示例：**
```json
{
  "success": true,
  "data": {
    "preset": [
      {
        "id": "math",
        "name": "数学",
        "icon": "📐",
        "isPreset": true,
        "textbookVersions": [
          { "id": "pep", "name": "人教版" },
          { "id": "bsd", "name": "北师大版" }
        ]
      }
    ],
    "custom": []
  }
}
```

### 创建自定义科目

```
POST /api/subjects
```

**请求体：**
```json
{
  "name": "科学",
  "icon": "🔬"
}
```

---

## 用户科目绑定 API

### 获取用户的科目

```
GET /api/user-subjects
```

**查询参数：**
- `userId`: 用户ID（必填）
- `grade`: 年级

### 绑定科目

```
POST /api/user-subjects
```

**请求体：**
```json
{
  "userId": "xxx",
  "subjectId": "math",
  "grade": 3,
  "textbookVersionId": "pep"
}
```

### 解除绑定

```
DELETE /api/user-subjects?id=xxx
```

---

## 题目 API

### 获取题目

```
GET /api/questions
```

**查询参数：**
- `chapterId`: 章节ID（必填）
- `difficulty`: 难度等级
- `count`: 数量（默认10）

### AI生成题目

```
POST /api/questions
```

**请求体：**
```json
{
  "chapterId": "xxx",
  "difficulty": 1,
  "count": 10,
  "type": "choice"
}
```

**响应示例：**
```json
{
  "success": true,
  "data": [
    {
      "id": "xxx",
      "type": "choice",
      "difficulty": 1,
      "content": "25 + 17 = ?",
      "options": ["32", "42", "52", "62"],
      "answer": "42",
      "explanation": "这是简单的加法计算..."
    }
  ]
}
```

---

## 答题 API

### 提交答案

```
POST /api/answers
```

**请求体：**
```json
{
  "userId": "xxx",
  "questionId": "xxx",
  "answer": "B",
  "timeSpent": 30,
  "mode": "practice"
}
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "isCorrect": true,
    "correctAnswer": "B",
    "explanation": "这是简单的加法计算...",
    "recordId": "xxx"
  }
}
```

### 获取答题记录

```
GET /api/answers
```

**查询参数：**
- `userId`: 用户ID（必填）
- `questionId`: 题目ID（可选）

---

## 成就 API

### 获取成就列表

```
GET /api/achievements?userId=xxx
```

**响应示例：**
```json
{
  "success": true,
  "data": [
    {
      "type": "first_quiz",
      "name": "初次答题",
      "desc": "完成第一次答题",
      "icon": "🎯",
      "unlocked": true,
      "unlockedAt": "2024-03-15T10:00:00Z"
    }
  ]
}
```

### 解锁成就

```
POST /api/achievements
```

**请求体：**
```json
{
  "userId": "xxx",
  "type": "first_quiz"
}
```

---

## 积分 API

### 获取积分

```
GET /api/points?userId=xxx
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "total": 1250,
    "records": [
      { "id": "xxx", "points": 50, "source": "achievement", "desc": "解锁成就", "createdAt": "..." }
    ]
  }
}
```

### 添加积分

```
POST /api/points
```

**请求体：**
```json
{
  "userId": "xxx",
  "points": 10,
  "source": "checkin",
  "desc": "每日打卡"
}
```

---

## 打卡 API

### 获取打卡记录

```
GET /api/checkins?userId=xxx
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "records": [
      { "date": "2024-03-20", "completed": true }
    ],
    "todayCompleted": true,
    "currentStreak": 7
  }
}
```

### 打卡

```
POST /api/checkins
```

**请求体：**
```json
{
  "userId": "xxx"
}
```

---

## AI配置 API

### 获取AI模型配置

```
GET /api/ai-config
```

**响应示例：**
```json
{
  "success": true,
  "data": [
    {
      "id": "xxx",
      "name": "GLM-4",
      "provider": "zhipu",
      "apiUrl": "https://...",
      "isDefault": true,
      "isActive": true
    }
  ]
}
```

### 保存AI模型配置

```
POST /api/ai-config
```

**请求体：**
```json
{
  "name": "GLM-4",
  "provider": "zhipu",
  "apiUrl": "https://...",
  "apiKey": "xxx",
  "isDefault": true
}
```

### 删除AI模型配置

```
DELETE /api/ai-config?id=xxx
```

---

## 学习报告 API

### 获取学习报告

```
GET /api/reports?userId=xxx
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalQuestions": 256,
      "correctCount": 200,
      "incorrectCount": 56,
      "correctRate": 78,
      "avgTime": 45,
      "totalPoints": 1250,
      "achievementsCount": 8,
      "checkInDays": 12,
      "currentStreak": 7
    },
    "weeklyProgress": [
      { "date": "2024-03-18", "dayName": "一", "total": 20, "correct": 16, "rate": 80 }
    ],
    "topWrongQuestions": [
      { "topic": "乘法分配律", "subject": "数学", "wrongCount": 5 }
    ],
    "recentAchievements": []
  }
}
```

---

## 错误码

| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |
