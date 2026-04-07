import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/ai-config - Get all AI model configs
export async function GET(request: NextRequest) {
  try {
    const configs = await prisma.aiModelConfig.findMany({
      orderBy: { priority: 'asc' },
    });

    return NextResponse.json({ success: true, data: configs });
  } catch (error) {
    console.error('Failed to fetch AI configs:', error);
    return NextResponse.json(
      { success: false, error: '获取AI配置失败' },
      { status: 500 }
    );
  }
}

// POST /api/ai-config - Create or update AI model config
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, provider, apiUrl, apiKey, isDefault } = body;

    if (id) {
      // Update existing
      const config = await prisma.aiModelConfig.update({
        where: { id },
        data: {
          name,
          provider,
          apiUrl,
          ...(apiKey && { apiKey }),
          ...(isDefault !== undefined && { isDefault }),
        },
      });
      return NextResponse.json({ success: true, data: config });
    } else {
      // Create new
      if (!name || !provider || !apiUrl) {
        return NextResponse.json(
          { success: false, error: '参数不完整' },
          { status: 400 }
        );
      }

      // If set as default, unset other defaults
      if (isDefault) {
        await prisma.aiModelConfig.updateMany({
          where: { isDefault: true },
          data: { isDefault: false },
        });
      }

      const config = await prisma.aiModelConfig.create({
        data: {
          name,
          provider,
          apiUrl,
          apiKey: apiKey || '',
          isDefault: isDefault || false,
        },
      });
      return NextResponse.json({ success: true, data: config });
    }
  } catch (error) {
    console.error('Failed to save AI config:', error);
    return NextResponse.json(
      { success: false, error: '保存AI配置失败' },
      { status: 500 }
    );
  }
}

// DELETE /api/ai-config - Delete AI model config
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

    await prisma.aiModelConfig.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete AI config:', error);
    return NextResponse.json(
      { success: false, error: '删除AI配置失败' },
      { status: 500 }
    );
  }
}
