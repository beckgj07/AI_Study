import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// POST /api/textbooks/parse - 解析教材并生成题目
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { textbookId, questionTypes, difficultyDistribution, countsPerType } = body;

    if (!textbookId) {
      return NextResponse.json(
        { success: false, error: '教材ID不能为空' },
        { status: 400 }
      );
    }

    // 获取教材信息
    const textbook = await prisma.textbook.findUnique({
      where: { id: textbookId },
      include: {
        subject: true,
        textbookVersion: true,
        units: {
          include: {
            chapters: true
          }
        }
      }
    });

    if (!textbook) {
      return NextResponse.json(
        { success: false, error: '教材不存在' },
        { status: 404 }
      );
    }

    // 更新状态为解析中
    await prisma.textbook.update({
      where: { id: textbookId },
      data: { status: 'parsing' }
    });

    // 模拟解析教材内容（实际应该调用AI解析PDF/Word）
    // 这里根据科目生成模拟的单元结构
    const mockUnits = generateMockUnits(textbook.subjectId, textbook.grade);

    // 创建单元和章节
    for (const unitData of mockUnits) {
      const unit = await prisma.unit.create({
        data: {
          name: unitData.name,
          order: unitData.order,
          textbookId: textbookId
        }
      });

      for (const chapterData of unitData.chapters) {
        await prisma.chapter.create({
          data: {
            name: chapterData.name,
            order: chapterData.order,
            difficulty: chapterData.difficulty,
            unitId: unit.id
          }
        });
      }
    }

    // 更新状态为生成中
    await prisma.textbook.update({
      where: { id: textbookId },
      data: { status: 'generating' }
    });

    // 生成题目
    const chapters = await prisma.chapter.findMany({
      where: {
        unit: {
          textbookId: textbookId
        }
      }
    });

    const generatedQuestions = [];
    for (const chapter of chapters) {
      const types = questionTypes || ['choice'];
      const difficulty = difficultyDistribution || [true, true, false, false];

      for (const type of types) {
        const count = countsPerType?.[type] || 5;
        const typeDifficulty = difficulty.indexOf(true) + 1 || 1;

        for (let i = 0; i < count; i++) {
          const question = await generateQuestion(type, typeDifficulty, chapter.name);
          generatedQuestions.push(question);
        }
      }
    }

    // 保存题目
    for (const q of generatedQuestions) {
      const chapter = chapters.find(c => c.name === q.knowledgePoint);
      if (chapter) {
        await prisma.question.create({
          data: {
            chapterId: chapter.id,
            type: q.type,
            difficulty: q.difficulty,
            content: q.content,
            options: q.options,
            answer: q.answer,
            explanation: q.explanation,
            knowledgePoint: q.knowledgePoint,
            source: 'ai'
          }
        });
      }
    }

    // 更新状态为完成
    await prisma.textbook.update({
      where: { id: textbookId },
      data: { status: 'completed' }
    });

    // 获取最终统计
    const stats = await getTextbookStats(textbookId);

    return NextResponse.json({
      success: true,
      data: {
        textbookId,
        status: 'completed',
        questionsGenerated: generatedQuestions.length,
        stats
      }
    });
  } catch (error) {
    console.error('Failed to parse textbook:', error);
    return NextResponse.json(
      { success: false, error: '解析教材失败' },
      { status: 500 }
    );
  }
}

// GET /api/textbooks/parse - 获取解析进度
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const textbookId = searchParams.get('textbookId');

    if (!textbookId) {
      return NextResponse.json(
        { success: false, error: '教材ID不能为空' },
        { status: 400 }
      );
    }

    const textbook = await prisma.textbook.findUnique({
      where: { id: textbookId },
      include: {
        units: {
          include: {
            chapters: {
              include: {
                _count: {
                  select: { questions: true }
                }
              }
            }
          }
        }
      }
    });

    if (!textbook) {
      return NextResponse.json(
        { success: false, error: '教材不存在' },
        { status: 404 }
      );
    }

    const stats = await getTextbookStats(textbookId);

    return NextResponse.json({
      success: true,
      data: {
        textbookId,
        status: textbook.status,
        stats
      }
    });
  } catch (error) {
    console.error('Failed to get parse progress:', error);
    return NextResponse.json(
      { success: false, error: '获取进度失败' },
      { status: 500 }
    );
  }
}

// 获取教材统计信息
async function getTextbookStats(textbookId: string) {
  const questions = await prisma.question.findMany({
    where: {
      chapter: {
        unit: {
          textbookId
        }
      }
    }
  });

  const byType: Record<string, number> = {};
  const byDifficulty: Record<number, number> = {};
  const byUnit: Record<string, { count: number; types: string[] }> = {};

  for (const q of questions) {
    byType[q.type] = (byType[q.type] || 0) + 1;
    byDifficulty[q.difficulty] = (byDifficulty[q.difficulty] || 0) + 1;
  }

  const units = await prisma.unit.findMany({
    where: { textbookId },
    include: {
      chapters: {
        include: {
          questions: true
        }
      }
    }
  });

  for (const unit of units) {
    let unitCount = 0;
    const unitTypes = new Set<string>();
    for (const chapter of unit.chapters) {
      unitCount += chapter.questions.length;
      for (const q of chapter.questions) {
        unitTypes.add(q.type);
      }
    }
    byUnit[unit.name] = {
      count: unitCount,
      types: Array.from(unitTypes)
    };
  }

  return {
    total: questions.length,
    byType,
    byDifficulty,
    byUnit
  };
}

// 生成模拟单元结构
function generateMockUnits(subjectId: string, grade: number) {
  if (subjectId === 'math') {
    return [
      { name: '第一单元 长度单位', order: 1, chapters: [
        { name: '认识厘米和米', order: 1, difficulty: 1 },
        { name: '认识分米和毫米', order: 2, difficulty: 1 },
        { name: '单位换算', order: 3, difficulty: 2 },
      ]},
      { name: '第二单元 万以内的加法和减法', order: 2, chapters: [
        { name: '两位数加法', order: 1, difficulty: 1 },
        { name: '两位数减法', order: 2, difficulty: 1 },
        { name: '三位数加减法', order: 3, difficulty: 2 },
        { name: '应用题', order: 4, difficulty: 3 },
      ]},
      { name: '第三单元 测量', order: 3, chapters: [
        { name: '认识克和千克', order: 1, difficulty: 1 },
        { name: '认识吨', order: 2, difficulty: 2 },
      ]},
      { name: '第四单元 倍的认识', order: 4, chapters: [
        { name: '倍的意义', order: 1, difficulty: 2 },
        { name: '求一个数的几倍', order: 2, difficulty: 2 },
      ]},
    ];
  } else if (subjectId === 'chinese') {
    return [
      { name: '第一单元 课文', order: 1, chapters: [
        { name: '古诗词三首', order: 1, difficulty: 1 },
        { name: '燕子', order: 2, difficulty: 1 },
        { name: '荷花', order: 3, difficulty: 1 },
      ]},
      { name: '第二单元 习作', order: 2, chapters: [
        { name: '写日记', order: 1, difficulty: 2 },
        { name: '看图写话', order: 2, difficulty: 2 },
      ]},
      { name: '第三单元 阅读', order: 3, chapters: [
        { name: '阅读理解技巧', order: 1, difficulty: 2 },
        { name: '中心思想', order: 2, difficulty: 3 },
      ]},
    ];
  } else {
    return [
      { name: '第一单元 问候', order: 1, chapters: [
        { name: 'Hello!', order: 1, difficulty: 1 },
        { name: 'How are you?', order: 2, difficulty: 1 },
      ]},
      { name: '第二单元 家庭', order: 2, chapters: [
        { name: 'Family members', order: 1, difficulty: 1 },
        { name: 'This is my family', order: 2, difficulty: 2 },
      ]},
    ];
  }
}

// 生成模拟题目
async function generateQuestion(type: string, difficulty: number, knowledgePoint: string) {
  // 这里是模拟题目生成，实际应该调用AI服务
  const templates = {
    choice: {
      content: `下列关于"${knowledgePoint}"的说法正确的是？`,
      options: [
        { id: 'A', content: '选项A内容', isCorrect: true },
        { id: 'B', content: '选项B内容', isCorrect: false },
        { id: 'C', content: '选项C内容', isCorrect: false },
        { id: 'D', content: '选项D内容', isCorrect: false },
      ],
      answer: 'A'
    },
    fill: {
      content: `请填空：${knowledgePoint}的相关知识点是______。`,
      answer: '答案'
    },
    calc: {
      content: `计算：${Math.floor(Math.random() * 100)} + ${Math.floor(Math.random() * 100)} = ?`,
      answer: String(Math.floor(Math.random() * 200))
    },
    application: {
      content: `应用题：${knowledgePoint}的实际应用，小明有${Math.floor(Math.random() * 50)}个苹果，又买了${Math.floor(Math.random() * 30)}个，现在一共有多少个？`,
      answer: String(Math.floor(Math.random() * 80))
    }
  };

  const template = templates[type as keyof typeof templates] || templates.choice;

  return {
    type,
    difficulty,
    content: template.content,
    options: template.options ? JSON.stringify(template.options) : null,
    answer: template.answer,
    explanation: `这是关于${knowledgePoint}的${difficulty}难度题目。`,
    knowledgePoint
  };
}
