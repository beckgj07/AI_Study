import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/users/[id] - Get user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        children: true,
        subjects: {
          include: {
            subject: true,
            textbookVersion: true,
          },
        },
        _count: {
          select: {
            answerRecords: true,
            wrongQuestions: true,
            achievements: true,
            checkIns: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      );
    }

    // Calculate total points
    const points = await prisma.point.aggregate({
      where: { userId: id },
      _sum: { points: true },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...user,
        totalPoints: points._sum.points || 0,
      },
    });
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return NextResponse.json(
      { success: false, error: '获取用户信息失败' },
      { status: 500 }
    );
  }
}

// PATCH /api/users/[id] - Update user
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, grade, avatar, dailyGoal, weeklyGoal, rewardRules } = body;

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(grade && { grade }),
        ...(avatar && { avatar }),
        ...(dailyGoal !== undefined && { dailyGoal }),
        ...(weeklyGoal !== undefined && { weeklyGoal }),
        ...(rewardRules && { rewardRules }),
      },
    });

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error('Failed to update user:', error);
    return NextResponse.json(
      { success: false, error: '更新用户失败' },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Delete related records first
    await prisma.$transaction([
      prisma.point.deleteMany({ where: { userId: id } }),
      prisma.achievement.deleteMany({ where: { userId: id } }),
      prisma.checkIn.deleteMany({ where: { userId: id } }),
      prisma.wrongQuestion.deleteMany({ where: { userId: id } }),
      prisma.answerRecord.deleteMany({ where: { userId: id } }),
      prisma.userSubject.deleteMany({ where: { userId: id } }),
      prisma.user.delete({ where: { id } }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete user:', error);
    return NextResponse.json(
      { success: false, error: '删除用户失败' },
      { status: 500 }
    );
  }
}
