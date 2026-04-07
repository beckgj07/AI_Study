import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/reports - Get learning report for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '用户ID不能为空' },
        { status: 400 }
      );
    }

    // Get user's answer records
    const answerRecords = await prisma.answerRecord.findMany({
      where: { userId },
      include: { question: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    // Calculate stats
    const totalQuestions = answerRecords.length;
    const correctCount = answerRecords.filter((r) => r.isCorrect).length;
    const incorrectCount = totalQuestions - correctCount;
    const correctRate = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

    // Calculate average time
    const totalTime = answerRecords.reduce((sum, r) => sum + (r.timeSpent || 0), 0);
    const avgTime = totalQuestions > 0 ? Math.round(totalTime / totalQuestions) : 0;

    // Get wrong questions
    const wrongQuestions = await prisma.wrongQuestion.findMany({
      where: { userId },
      include: { question: true },
      orderBy: { wrongCount: 'desc' },
      take: 10,
    });

    // Get achievements
    const achievements = await prisma.achievement.findMany({
      where: { userId },
      orderBy: { unlockedAt: 'desc' },
    });

    // Get total points
    const pointsAgg = await prisma.point.aggregate({
      where: { userId },
      _sum: { points: true },
    });

    // Get check-in stats
    const checkIns = await prisma.checkIn.findMany({
      where: { userId, completed: true },
      orderBy: { date: 'desc' },
    });

    // Calculate current streak
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    let checkDate = today;

    for (const c of checkIns) {
      if (c.date === checkDate) {
        streak++;
        const d = new Date(checkDate);
        d.setDate(d.getDate() - 1);
        checkDate = d.toISOString().split('T')[0];
      } else {
        break;
      }
    }

    // Weekly progress (last 7 days)
    const weeklyProgress = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayRecords = answerRecords.filter(
        (r) => r.createdAt.toISOString().split('T')[0] === dateStr
      );
      const dayCorrect = dayRecords.filter((r) => r.isCorrect).length;
      weeklyProgress.push({
        date: dateStr,
        dayName: ['日', '一', '二', '三', '四', '五', '六'][date.getDay()],
        total: dayRecords.length,
        correct: dayCorrect,
        rate: dayRecords.length > 0 ? Math.round((dayCorrect / dayRecords.length) * 100) : 0,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalQuestions,
          correctCount,
          incorrectCount,
          correctRate,
          avgTime,
          totalPoints: pointsAgg._sum.points || 0,
          achievementsCount: achievements.length,
          checkInDays: checkIns.length,
          currentStreak: streak,
        },
        weeklyProgress,
        topWrongQuestions: wrongQuestions.slice(0, 5),
        recentAchievements: achievements.slice(0, 3),
      },
    });
  } catch (error) {
    console.error('Failed to fetch report:', error);
    return NextResponse.json(
      { success: false, error: '获取学习报告失败' },
      { status: 500 }
    );
  }
}
