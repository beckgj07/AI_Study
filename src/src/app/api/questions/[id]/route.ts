import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/questions/[id] - Get single question
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const question = await prisma.question.findUnique({
      where: { id },
      include: {
        chapter: {
          include: {
            unit: {
              include: {
                course: {
                  include: { subject: true }
                }
              }
            }
          }
        }
      }
    });

    if (!question) {
      return NextResponse.json(
        { success: false, error: '题目不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: question });
  } catch (error) {
    console.error('Failed to fetch question:', error);
    return NextResponse.json(
      { success: false, error: '获取题目失败' },
      { status: 500 }
    );
  }
}

// PUT /api/questions/[id] - Update question
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { content, type, difficulty, options, answer, explanation, knowledgePoint } = body;

    // Validate required fields
    if (!content || !type || difficulty === undefined || !answer) {
      return NextResponse.json(
        { success: false, error: '缺少必填字段' },
        { status: 400 }
      );
    }

    // Check if question exists
    const existing = await prisma.question.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: '题目不存在' },
        { status: 404 }
      );
    }

    // Update question
    const updated = await prisma.question.update({
      where: { id },
      data: {
        content,
        type,
        difficulty,
        options: options || null,
        answer,
        explanation: explanation || null,
        knowledgePoint: knowledgePoint || null,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Failed to update question:', error);
    return NextResponse.json(
      { success: false, error: '更新题目失败' },
      { status: 500 }
    );
  }
}

// DELETE /api/questions/[id] - Delete question
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Check if question exists
    const existing = await prisma.question.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: '题目不存在' },
        { status: 404 }
      );
    }

    // Delete related records first (answer records, wrong questions)
    await prisma.answerRecord.deleteMany({ where: { questionId: id } });
    await prisma.wrongQuestion.deleteMany({ where: { questionId: id } });

    // Delete question
    await prisma.question.delete({ where: { id } });

    return NextResponse.json({ success: true, message: '题目已删除' });
  } catch (error) {
    console.error('Failed to delete question:', error);
    return NextResponse.json(
      { success: false, error: '删除题目失败' },
      { status: 500 }
    );
  }
}
