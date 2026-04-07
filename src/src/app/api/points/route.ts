import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/points - Get user's points
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

    // Get total points
    const pointsAgg = await prisma.point.aggregate({
      where: { userId },
      _sum: { points: true },
    });

    // Get recent point records
    const records = await prisma.point.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return NextResponse.json({
      success: true,
      data: {
        total: pointsAgg._sum.points || 0,
        records,
      },
    });
  } catch (error) {
    console.error('Failed to fetch points:', error);
    return NextResponse.json(
      { success: false, error: '获取积分失败' },
      { status: 500 }
    );
  }
}

// POST /api/points - Add points
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, points, source, desc } = body;

    if (!userId || points === undefined) {
      return NextResponse.json(
        { success: false, error: '参数不完整' },
        { status: 400 }
      );
    }

    const record = await prisma.point.create({
      data: {
        userId,
        points,
        source: source || 'other',
        desc: desc || null,
      },
    });

    return NextResponse.json({ success: true, data: record });
  } catch (error) {
    console.error('Failed to add points:', error);
    return NextResponse.json(
      { success: false, error: '添加积分失败' },
      { status: 500 }
    );
  }
}
