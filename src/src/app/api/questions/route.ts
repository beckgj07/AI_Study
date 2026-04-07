import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/questions - Get questions for a chapter
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chapterId = searchParams.get('chapterId');
    const difficulty = searchParams.get('difficulty');
    const count = parseInt(searchParams.get('count') || '10');

    if (!chapterId) {
      return NextResponse.json(
        { success: false, error: '章节ID不能为空' },
        { status: 400 }
      );
    }

    const where: Record<string, unknown> = { chapterId };
    if (difficulty) {
      where.difficulty = parseInt(difficulty);
    }

    const questions = await prisma.question.findMany({
      where,
      take: count,
      orderBy: { difficulty: 'asc' },
    });

    return NextResponse.json({ success: true, data: questions });
  } catch (error) {
    console.error('Failed to fetch questions:', error);
    return NextResponse.json(
      { success: false, error: '获取题目失败' },
      { status: 500 }
    );
  }
}

// POST /api/questions - Generate questions using AI
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { chapterId, difficulty = 1, count = 10, type = 'choice' } = body;

    if (!chapterId) {
      return NextResponse.json(
        { success: false, error: '章节ID不能为空' },
        { status: 400 }
      );
    }

    // Get chapter info
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: { unit: { include: { course: true } } },
    });

    if (!chapter) {
      return NextResponse.json(
        { success: false, error: '章节不存在' },
        { status: 404 }
      );
    }

    // TODO: Integrate with AI service to generate questions
    // For now, return mock questions
    const mockQuestions = generateMockQuestions(chapter.name, difficulty, count, type);

    // Save generated questions to database
    const savedQuestions = await Promise.all(
      mockQuestions.map((q) =>
        prisma.question.create({
          data: {
            chapterId,
            type: q.type,
            difficulty: q.difficulty,
            content: q.content,
            options: q.options,
            answer: q.answer,
            explanation: q.explanation,
            knowledgePoint: q.knowledgePoint,
            source: 'ai',
          },
        })
      )
    );

    return NextResponse.json({ success: true, data: savedQuestions });
  } catch (error) {
    console.error('Failed to generate questions:', error);
    return NextResponse.json(
      { success: false, error: '生成题目失败' },
      { status: 500 }
    );
  }
}

function generateMockQuestions(
  chapterName: string,
  difficulty: number,
  count: number,
  type: string
) {
  const questions = [];
  const difficultyLabels = ['基础', '应用', '综合', '拓展'];

  for (let i = 0; i < count; i++) {
    const num1 = Math.floor(Math.random() * 50) + 10;
    const num2 = Math.floor(Math.random() * 50) + 10;
    const correctAnswer = num1 + num2;

    // 生成选项并随机打乱
    const optionsWithIndex = [
      { value: correctAnswer, isCorrect: true },
      { value: correctAnswer + Math.floor(Math.random() * 10) + 1, isCorrect: false },
      { value: correctAnswer - Math.floor(Math.random() * 10) - 1, isCorrect: false },
      { value: correctAnswer + Math.floor(Math.random() * 20) + 5, isCorrect: false },
    ];

    // 随机排序
    for (let j = optionsWithIndex.length - 1; j > 0; j--) {
      const k = Math.floor(Math.random() * (j + 1));
      [optionsWithIndex[j], optionsWithIndex[k]] = [optionsWithIndex[k], optionsWithIndex[j]];
    }

    const correctIndex = optionsWithIndex.findIndex(o => o.isCorrect);

    questions.push({
      type: type || 'choice',
      difficulty,
      content: `${num1} + ${num2} = ?`,
      options: optionsWithIndex.map(o => o.value.toString()),
      answer: correctAnswer.toString(),
      correctIndex: correctIndex,
      explanation: `这是一道${difficultyLabels[difficulty - 1]}难度的加法题。`,
      knowledgePoint: chapterName,
    });
  }

  return questions;
}
