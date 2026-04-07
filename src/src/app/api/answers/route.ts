import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// POST /api/answers - Submit answers and get grading
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, questionId, answer, timeSpent, mode = 'practice' } = body;

    if (!userId || !questionId || answer === undefined) {
      return NextResponse.json(
        { success: false, error: '参数不完整' },
        { status: 400 }
      );
    }

    // Get the question to compare answers
    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return NextResponse.json(
        { success: false, error: '题目不存在' },
        { status: 404 }
      );
    }

    // Check if answer is correct
    let isCorrect = false;
    if (question.type === 'multiple') {
      // For multiple choice, compare sorted arrays
      const userAnswer = JSON.parse(answer).sort();
      const correctAnswer = JSON.parse(question.answer).sort();
      isCorrect = JSON.stringify(userAnswer) === JSON.stringify(correctAnswer);
    } else {
      // For other types, string comparison (trim and case insensitive)
      isCorrect = answer.toString().trim().toLowerCase() === question.answer.toString().trim().toLowerCase();
    }

    // Record the answer
    const answerRecord = await prisma.answerRecord.create({
      data: {
        userId,
        questionId,
        answer: answer.toString(),
        isCorrect,
        timeSpent: timeSpent || null,
        mode,
      },
    });

    // If wrong, add to wrong questions
    if (!isCorrect) {
      await prisma.wrongQuestion.upsert({
        where: {
          userId_questionId: { userId, questionId },
        },
        update: {
          wrongCount: { increment: 1 },
          lastReview: new Date(),
          nextReview: new Date(Date.now() + 24 * 60 * 60 * 1000), // Next day
        },
        create: {
          userId,
          questionId,
          wrongCount: 1,
          lastReview: new Date(),
          nextReview: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });
    } else {
      // If correct, mark as mastered in wrong questions if exists
      await prisma.wrongQuestion.updateMany({
        where: { userId, questionId },
        data: { isMastered: true },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        isCorrect,
        correctAnswer: question.answer,
        explanation: question.explanation,
        recordId: answerRecord.id,
      },
    });
  } catch (error) {
    console.error('Failed to submit answer:', error);
    return NextResponse.json(
      { success: false, error: '提交答案失败' },
      { status: 500 }
    );
  }
}

// GET /api/answers - Get user's answer history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const questionId = searchParams.get('questionId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '用户ID不能为空' },
        { status: 400 }
      );
    }

    const where: Record<string, unknown> = { userId };
    if (questionId) where.questionId = questionId;

    const records = await prisma.answerRecord.findMany({
      where,
      include: { question: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ success: true, data: records });
  } catch (error) {
    console.error('Failed to fetch answers:', error);
    return NextResponse.json(
      { success: false, error: '获取答题记录失败' },
      { status: 500 }
    );
  }
}
