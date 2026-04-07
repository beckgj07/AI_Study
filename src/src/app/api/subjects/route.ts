import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/subjects - Get all subjects
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeVersions = searchParams.get('includeVersions') === 'true';

    const subjects = await prisma.subject.findMany({
      where: { isRequired: true },
      include: {
        textbookVersions: includeVersions,
      },
      orderBy: { order: 'asc' },
    });

    // Also get custom subjects
    const customSubjects = await prisma.subject.findMany({
      where: { isRequired: false },
      include: {
        textbookVersions: includeVersions,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: {
        preset: subjects,
        custom: customSubjects,
      },
    });
  } catch (error) {
    console.error('Failed to fetch subjects:', error);
    return NextResponse.json(
      { success: false, error: '获取科目列表失败' },
      { status: 500 }
    );
  }
}

// POST /api/subjects - Create a custom subject
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, icon } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: '科目名称不能为空' },
        { status: 400 }
      );
    }

    const subject = await prisma.subject.create({
      data: {
        name,
        icon: icon || '📚',
        isPreset: false,
        isRequired: false,
      },
    });

    return NextResponse.json({ success: true, data: subject });
  } catch (error) {
    console.error('Failed to create subject:', error);
    return NextResponse.json(
      { success: false, error: '创建科目失败' },
      { status: 500 }
    );
  }
}
