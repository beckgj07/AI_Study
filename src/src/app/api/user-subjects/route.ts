import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/user-subjects - Get user's subjects
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const grade = searchParams.get('grade');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '用户ID不能为空' },
        { status: 400 }
      );
    }

    const where: Record<string, unknown> = { userId };
    if (grade) where.grade = parseInt(grade);

    const userSubjects = await prisma.userSubject.findMany({
      where,
      include: {
        subject: true,
        textbookVersion: true,
      },
      orderBy: { subject: { order: 'asc' } },
    });

    return NextResponse.json({ success: true, data: userSubjects });
  } catch (error) {
    console.error('Failed to fetch user subjects:', error);
    return NextResponse.json(
      { success: false, error: '获取用户科目失败' },
      { status: 500 }
    );
  }
}

// POST /api/user-subjects - Bind subject to user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, subjectId, grade, textbookVersionId } = body;

    if (!userId || !subjectId || !grade) {
      return NextResponse.json(
        { success: false, error: '参数不完整' },
        { status: 400 }
      );
    }

    // Check if already exists
    const existing = await prisma.userSubject.findFirst({
      where: { userId, subjectId, grade },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: '该科目已绑定' },
        { status: 400 }
      );
    }

    const userSubject = await prisma.userSubject.create({
      data: {
        userId,
        subjectId,
        grade,
        textbookVersionId: textbookVersionId || null,
      },
      include: {
        subject: true,
        textbookVersion: true,
      },
    });

    return NextResponse.json({ success: true, data: userSubject });
  } catch (error) {
    console.error('Failed to bind subject:', error);
    return NextResponse.json(
      { success: false, error: '绑定科目失败' },
      { status: 500 }
    );
  }
}

// DELETE /api/user-subjects - Unbind subject from user
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID不能为空' },
        { status: 400 }
      );
    }

    await prisma.userSubject.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to unbind subject:', error);
    return NextResponse.json(
      { success: false, error: '解除绑定失败' },
      { status: 500 }
    );
  }
}
