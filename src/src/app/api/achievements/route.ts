import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Predefined achievements
const ACHIEVEMENTS = [
  { type: 'first_quiz', name: '初次答题', desc: '完成第一次答题', icon: '🎯' },
  { type: 'first_full', name: '首次全对', desc: '第一次答对所有题目', icon: '🌟' },
  { type: 'streak_3', name: '初露锋芒', desc: '连续3天学习', icon: '🔥' },
  { type: 'streak_7', name: '连续7天', desc: '连续7天学习', icon: '🔥' },
  { type: 'streak_30', name: '月度学霸', desc: '连续30天学习', icon: '🏆' },
  { type: 'quiz_100', name: '答题王', desc: '完成100道题', icon: '📝' },
  { type: 'quiz_500', name: '题库达人', desc: '完成500道题', icon: '📚' },
  { type: 'correct_50', name: '正确率50%', desc: '正确率达到50%', icon: '✅' },
  { type: 'correct_80', name: '正确率80%', desc: '正确率达到80%', icon: '💯' },
  { type: 'correct_100', name: '完美正确率', desc: '正确率达到100%', icon: '💯' },
  { type: 'math_master', name: '数学大师', desc: '数学正确率达到90%', icon: '📐' },
  { type: 'chinese_master', name: '语文大师', desc: '语文正确率达到90%', icon: '📖' },
  { type: 'english_master', name: '英语大师', desc: '英语正确率达到90%', icon: '🔤' },
  { type: 'wrong_0', name: '无错题日', desc: '一天内所有题目都答对', icon: '✨' },
  { type: 'checkin_7', name: '打卡达人', desc: '累计打卡7天', icon: '📅' },
  { type: 'checkin_30', name: '坚持不懈', desc: '累计打卡30天', icon: '📅' },
  { type: 'points_1000', name: '积分达人', desc: '累计获得1000积分', icon: '⭐' },
  { type: 'points_5000', name: '积分富豪', desc: '累计获得5000积分', icon: '💰' },
  { type: 'parent_login', name: '家长绑定', desc: '绑定家长账号', icon: '👨‍👩‍👧' },
];

// GET /api/achievements - Get achievements for a user
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

    // Get user's unlocked achievements
    const userAchievements = await prisma.achievement.findMany({
      where: { userId },
    });

    // Combine with all achievements
    const achievements = ACHIEVEMENTS.map((a) => {
      const unlocked = userAchievements.find((ua) => ua.type === a.type);
      return {
        ...a,
        unlocked: !!unlocked,
        unlockedAt: unlocked?.unlockedAt || null,
      };
    });

    return NextResponse.json({ success: true, data: achievements });
  } catch (error) {
    console.error('Failed to fetch achievements:', error);
    return NextResponse.json(
      { success: false, error: '获取成就失败' },
      { status: 500 }
    );
  }
}

// POST /api/achievements - Unlock an achievement
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, type } = body;

    if (!userId || !type) {
      return NextResponse.json(
        { success: false, error: '参数不完整' },
        { status: 400 }
      );
    }

    // Find achievement definition
    const achievementDef = ACHIEVEMENTS.find((a) => a.type === type);
    if (!achievementDef) {
      return NextResponse.json(
        { success: false, error: '成就不存在' },
        { status: 404 }
      );
    }

    // Check if already unlocked
    const existing = await prisma.achievement.findUnique({
      where: { userId_type: { userId, type } },
    });

    if (existing) {
      return NextResponse.json({ success: true, data: existing, message: '已解锁' });
    }

    // Unlock achievement
    const achievement = await prisma.achievement.create({
      data: {
        userId,
        type,
        name: achievementDef.name,
        desc: achievementDef.desc,
        icon: achievementDef.icon,
      },
    });

    // Award points for achievement
    await prisma.point.create({
      data: {
        userId,
        points: 50,
        source: 'achievement',
        desc: `解锁成就：${achievementDef.name}`,
      },
    });

    return NextResponse.json({ success: true, data: achievement });
  } catch (error) {
    console.error('Failed to unlock achievement:', error);
    return NextResponse.json(
      { success: false, error: '解锁成就失败' },
      { status: 500 }
    );
  }
}
