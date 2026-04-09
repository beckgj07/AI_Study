import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import path from 'path';
import fs from 'fs';

// GET /api/textbooks - 获取教材列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const grade = searchParams.get('grade');
    const subjectId = searchParams.get('subjectId');

    const textbooks = await prisma.textbook.findMany({
      where: {
        ...(grade && { grade: parseInt(grade) }),
        ...(subjectId && { subjectId }),
      },
      include: {
        subject: true,
        textbookVersion: true,
        units: {
          include: {
            chapters: {
              include: {
                _count: {
                  select: { questions: true }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, data: textbooks });
  } catch (error) {
    console.error('Failed to fetch textbooks:', error);
    return NextResponse.json(
      { success: false, error: '获取教材列表失败' },
      { status: 500 }
    );
  }
}

// POST /api/textbooks - 创建教材
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, subjectId, grade, semester, versionId, filePath } = body;

    // 创建教材记录
    const textbook = await prisma.textbook.create({
      data: {
        name,
        subjectId,
        grade,
        semester: semester || 1,
        versionId,
        filePath,
        status: 'uploaded',
      },
      include: {
        subject: true,
      }
    });

    return NextResponse.json({ success: true, data: textbook });
  } catch (error) {
    console.error('Failed to create textbook:', error);
    return NextResponse.json(
      { success: false, error: '创建教材失败' },
      { status: 500 }
    );
  }
}
