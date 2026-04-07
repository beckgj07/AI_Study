# AI_Study - 小学生全科AI学习辅助系统

## 项目简介

AI_Study 是一款面向小学生的全科AI学习辅助系统，通过AI动态生成测验题目、游戏化闯关机制，帮助小学生巩固学习成果。

### 核心功能

- **AI智能出题**：支持数学、语文、英语等科目，根据教材内容和学生水平动态生成题目
- **游戏化学习**：知识地图、闯关模式、成就系统、积分排行，提升学习兴趣
- **错题本**：自动记录错题，AI讲解分析，定期提醒巩固
- **家长端**：查看学习报告、设置目标、配置奖励
- **多模型支持**：支持GLM、千问、Kimi等国产大模型

## 技术栈

| 层级 | 技术选型 |
|------|---------|
| 前端框架 | Next.js 14 + React + TypeScript |
| 样式框架 | Tailwind CSS (Claymorphism风格) |
| 状态管理 | Zustand + TanStack React Query |
| 后端 | Next.js API Routes |
| 数据库 | SQLite (通过Prisma ORM) |
| AI接入 | 支持 GLM/千问/Kimi/混元/MiniMax |

## 快速开始

### 环境要求

- Node.js 18+
- npm / yarn / pnpm

### 安装

```bash
cd src
npm install
```

### 初始化数据库

```bash
npx prisma db push
npx prisma generate
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 构建生产版本

```bash
npm run build
npm start
```

## 项目结构

```
src/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API 路由
│   │   │   ├── users/         # 用户相关 API
│   │   │   ├── subjects/      # 科目相关 API
│   │   │   ├── questions/     # 题目相关 API
│   │   │   ├── answers/       # 答题相关 API
│   │   │   ├── achievements/  # 成就相关 API
│   │   │   ├── points/        # 积分相关 API
│   │   │   ├── checkins/      # 打卡相关 API
│   │   │   ├── ai-config/     # AI配置 API
│   │   │   └── reports/       # 报告 API
│   │   ├── login/             # 登录页
│   │   ├── init/              # 初始化向导
│   │   ├── dashboard/         # 首页仪表盘
│   │   ├── challenge/         # 闯关选择
│   │   ├── quiz/              # 答题测验
│   │   ├── wrong/             # 错题本
│   │   ├── achievements/      # 成就墙
│   │   ├── checkin/           # 每日打卡
│   │   ├── leaderboard/        # 排行榜
│   │   ├── report/             # 学习报告
│   │   ├── parent/             # 家长端
│   │   ├── admin/ai-config/   # AI配置管理
│   │   └── settings/          # 设置页
│   ├── components/            # React 组件
│   │   ├── ClayCard.tsx       # Claymorphism 卡片组件
│   │   ├── QuizOption.tsx     # 题目选项组件
│   │   └── Layout.tsx         # 布局组件
│   ├── lib/                   # 工具函数
│   │   ├── db.ts              # Prisma 数据库客户端
│   │   └── ai-service.ts      # AI 服务
│   └── generated/prisma/      # Prisma 生成的代码
├── prisma/
│   └── schema.prisma          # 数据库 Schema
└── public/                    # 静态资源
```

## 数据库模型

详见 [docs/database.md](./docs/database.md)

## API 接口文档

详见 [docs/api.md](./docs/api.md)

## 组件库

详见 [docs/components.md](./docs/components.md)

## 部署

### 本地部署

```bash
npm run build
npm start
```

### Vercel 部署

```bash
npm i -g vercel
vercel
```

### 环境变量

创建 `.env` 文件：

```env
DATABASE_URL="file:./dev.db"
AI_API_URL="https://api.example.com/v1/"
AI_API_KEY="your-api-key"
```

## 开发指南

### 添加新的API接口

1. 在 `src/app/api/` 下创建路由文件
2. 使用 Prisma 客户端操作数据库
3. 返回统一的 JSON 响应格式

### 添加新页面

1. 在 `src/app/` 下创建页面文件夹
2. 创建 `page.tsx` 文件
3. 使用组件库保持 UI 一致性

### 添加新的数据模型

1. 修改 `prisma/schema.prisma`
2. 运行 `npx prisma db push` 更新数据库
3. 运行 `npx prisma generate` 生成客户端代码

## License

MIT
