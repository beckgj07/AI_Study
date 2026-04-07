import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

// GET /api/logs - Get recent logs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lines = parseInt(searchParams.get('lines') || '100');
    const level = searchParams.get('level');

    let logs: string[];

    if (level) {
      logs = logger.getLogsByLevel(level.toUpperCase());
    } else {
      logs = logger.getRecentLogs(lines);
    }

    return NextResponse.json({
      success: true,
      data: {
        logs,
        count: logs.length,
      },
    });
  } catch (error) {
    logger.error('Failed to fetch logs', { error: String(error) });
    return NextResponse.json(
      { success: false, error: '获取日志失败' },
      { status: 500 }
    );
  }
}

// POST /api/logs - Clear logs
export async function POST(request: NextRequest) {
  try {
    // This would need fs access which is limited in edge runtime
    return NextResponse.json({
      success: false,
      error: 'Not supported in edge runtime',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '清除日志失败' },
      { status: 500 }
    );
  }
}
