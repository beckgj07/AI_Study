import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/users - Get all users (for parent to manage children)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get('parentId');
    const role = searchParams.get('role');

    const where: Record<string, unknown> = {};
    if (parentId) where.parentId = parentId;
    if (role) where.role = role;

    const users = await prisma.user.findMany({
      where,
      include: {
        children: true,
        subjects: {
          include: {
            subject: true,
            textbookVersion: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json(
      { success: false, error: '获取用户列表失败' },
      { status: 500 }
    );
  }
}

// POST /api/users - Create a new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, role = 'child', parentId, grade, avatar } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: '用户名不能为空' },
        { status: 400 }
      );
    }

    const user = await prisma.user.create({
      data: {
        name,
        role,
        parentId: parentId || null,
        grade: grade || null,
        avatar: avatar || null,
      },
    });

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error('Failed to create user:', error);
    return NextResponse.json(
      { success: false, error: '创建用户失败' },
      { status: 500 }
    );
  }
}
