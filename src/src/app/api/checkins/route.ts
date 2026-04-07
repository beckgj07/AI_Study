import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Helper to get today's date string
function getToday() {
  return new Date().toISOString().split('T')[0];
}

// Helper to check if date is yesterday
function isYesterday(dateStr: string): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return dateStr === yesterday.toISOString().split('T')[0];
}

// GET /api/checkins - Get user's check-in records
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

    // Get recent check-ins
    const checkIns = await prisma.checkIn.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 30,
    });

    // Calculate current streak
    let streak = 0;
    const today = getToday();
    let checkDate = today;

    for (const check of checkIns) {
      if (check.date === checkDate && check.completed) {
        streak++;
        // Move to previous day
        const d = new Date(checkDate);
        d.setDate(d.getDate() - 1);
        checkDate = d.toISOString().split('T')[0];
      } else if (check.date === checkDate) {
        // Today but not completed
        continue;
      } else {
        break;
      }
    }

    // Check if today's check-in exists
    const todayCheckIn = checkIns.find((c) => c.date === today);

    return NextResponse.json({
      success: true,
      data: {
        records: checkIns,
        todayCompleted: todayCheckIn?.completed || false,
        currentStreak: streak,
      },
    });
  } catch (error) {
    console.error('Failed to fetch check-ins:', error);
    return NextResponse.json(
      { success: false, error: '获取打卡记录失败' },
      { status: 500 }
    );
  }
}

// POST /api/checkins - Check in for today
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '用户ID不能为空' },
        { status: 400 }
      );
    }

    const today = getToday();

    // Check if already checked in today
    const existing = await prisma.checkIn.findUnique({
      where: { userId_date: { userId, date: today } },
    });

    if (existing?.completed) {
      return NextResponse.json({
        success: false,
        error: '今日已打卡',
      });
    }

    // Create or update check-in
    const checkIn = await prisma.checkIn.upsert({
      where: { userId_date: { userId, date: today } },
      update: { completed: true },
      create: {
        userId,
        date: today,
        completed: true,
        goal: 1,
        achieved: 1,
      },
    });

    // Award points for check-in
    await prisma.point.create({
      data: {
        userId,
        points: 10,
        source: 'checkin',
        desc: '每日打卡',
      },
    });

    // Update streak
    const recentCheckIns = await prisma.checkIn.findMany({
      where: { userId, completed: true },
      orderBy: { date: 'desc' },
      take: 30,
    });

    let streak = 1;
    let checkDate = today;

    for (const c of recentCheckIns) {
      if (c.date === checkDate && c.id !== checkIn.id) {
        streak++;
        const d = new Date(checkDate);
        d.setDate(d.getDate() - 1);
        checkDate = d.toISOString().split('T')[0];
      } else {
        break;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...checkIn,
        streak,
      },
    });
  } catch (error) {
    console.error('Failed to check in:', error);
    return NextResponse.json(
      { success: false, error: '打卡失败' },
      { status: 500 }
    );
  }
}
