import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/textbooks/questions?textbookId=xxx - 获取教材的所有题目
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const textbookId = searchParams.get('textbookId');
    const chapterId = searchParams.get('chapterId');

    if (!textbookId && !chapterId) {
      return NextResponse.json(
        { success: false, error: '缺少textbookId或chapterId参数' },
        { status: 400 }
      );
    }

    const where: Record<string, unknown> = {};
    if (chapterId) {
      where.chapterId = chapterId;
    } else if (textbookId) {
      // 获取教材的所有章节ID
      const units = await prisma.unit.findMany({
        where: { textbookId },
        include: {
          chapters: {
            select: { id: true }
          }
        }
      });
      const chapterIds = units.flatMap(u => u.chapters.map(c => c.id));
      where.chapterId = { in: chapterIds };
    }

    const questions = await prisma.question.findMany({
      where,
      include: {
        chapter: {
          include: {
            unit: true
          }
        }
      },
      orderBy: [
        { chapter: { order: 'asc' } },
        { difficulty: 'asc' },
        { createdAt: 'asc' }
      ],
      take: 100 // 限制返回数量
    });

    // 按单元和题型分组统计
    const statsByUnit: Record<string, Record<string, number>> = {};
    const statsByType: Record<string, number> = {};

    questions.forEach(q => {
      const unitName = q.chapter.unit.name;
      if (!statsByUnit[unitName]) statsByUnit[unitName] = {};
      statsByUnit[unitName][q.type] = (statsByUnit[unitName][q.type] || 0) + 1;
      statsByType[q.type] = (statsByType[q.type] || 0) + 1;
    });

    return NextResponse.json({
      success: true,
      data: {
        questions,
        stats: {
          total: questions.length,
          byUnit: statsByUnit,
          byType: statsByType
        }
      }
    });
  } catch (error) {
    console.error('Failed to fetch questions:', error);
    return NextResponse.json(
      { success: false, error: '获取题目列表失败' },
      { status: 500 }
    );
  }
}
