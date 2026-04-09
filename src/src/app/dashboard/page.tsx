'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ClayCard, ClayButton, Badge, ProgressBar, Avatar } from '@/components/ClayCard';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; grade?: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
      router.push('/login');
    } else {
      setUser(JSON.parse(currentUser));
    }
    setLoading(false);
  }, [router]);

  // 从用户数据获取，如果没有则显示空或加载状态
  const userName = user?.name || '';
  const grade = user?.grade || 0;
  const streak = 7;
  const totalPoints = 1250;
  const correctRate = 78;
  const todayProgress = { completed: 2, total: 3 };
  const wrongQuestions = [
    { subject: '数学', chapter: '第一章', topic: '乘法分配律' },
    { subject: '数学', chapter: '第二章', topic: '分数加减' },
    { subject: '语文', chapter: '第三课', topic: '古诗词理解' },
  ];
  const recommendedChallenges = [
    { subject: '数学', grade: `${grade > 0 ? grade : '?'}下`, chapter: '第5章', type: 'normal' },
    { subject: '语文', grade: `${grade > 0 ? grade : '?'}下`, chapter: '第3章', type: 'normal' },
    { subject: '数学', grade: '奥赛', chapter: '基础', type: 'competition' },
  ];
  const recentAchievements = [
    { icon: '🔥', name: '连续7天', unlocked: true },
    { icon: '🎯', name: '首次全对', unlocked: true },
    { icon: '📝', name: '答题王', unlocked: true },
    { icon: '🔒', name: '数学大师', unlocked: false },
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-bounce">📚</div>
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Main Content */}
      <main className="p-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {userName ? `${userName}同学，` : ''}下午好 🌤️
          </h2>
          <p className="text-gray-500">{grade > 0 ? `${grade}年级 · ` : ''}今天已完成 {todayProgress.completed}/{todayProgress.total} 关卡</p>
        </div>

        {/* Hero Card */}
        <ClayCard className="mb-8 bg-gradient-to-br from-blue-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">开始今日学习</h3>
              <p className="text-gray-500 mb-6">继续保持精彩表现！</p>
              <div className="flex flex-wrap gap-3">
                <Link href="/challenge">
                  <ClayButton>🎯 开始闯关</ClayButton>
                </Link>
                <Link href="/wrong">
                  <ClayButton variant="secondary">📝 巩固错题</ClayButton>
                </Link>
              </div>
            </div>
            <div className="text-8xl opacity-20">📚</div>
          </div>
        </ClayCard>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <ClayCard className="text-center">
            <div className="text-3xl mb-2">📝</div>
            <div className="text-2xl font-bold text-gray-800">256</div>
            <div className="text-sm text-gray-500">总题数</div>
          </ClayCard>
          <ClayCard className="text-center">
            <div className="text-3xl mb-2">✅</div>
            <div className="text-2xl font-bold text-green-600">{correctRate}%</div>
            <div className="text-sm text-gray-500">正确率</div>
          </ClayCard>
          <ClayCard className="text-center">
            <div className="text-3xl mb-2">⏱️</div>
            <div className="text-2xl font-bold text-gray-800">12h</div>
            <div className="text-sm text-gray-500">总用时</div>
          </ClayCard>
          <ClayCard className="text-center border-2 border-orange-200">
            <div className="text-3xl mb-2">🔥</div>
            <div className="text-2xl font-bold text-orange-500">{streak}天</div>
            <div className="text-sm text-gray-500">连续学习</div>
          </ClayCard>
        </div>

        {/* Today's Progress */}
        <ClayCard className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">今日任务</h3>
            <Badge variant="primary">{todayProgress.completed}/{todayProgress.total} 完成</Badge>
          </div>
          <ProgressBar value={todayProgress.completed} max={todayProgress.total} />
          <div className="mt-4 flex gap-3">
            <Link href="/challenge" className="flex-1">
              <ClayButton size="sm" className="w-full">开始闯关</ClayButton>
            </Link>
          </div>
        </ClayCard>

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Wrong Questions */}
          <ClayCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">错题待巩固</h3>
              <Badge variant="error">{wrongQuestions.length} 题</Badge>
            </div>
            <div className="space-y-3">
              {wrongQuestions.map((q, i) => (
                <Link key={i} href="/wrong">
                  <div className="clay-inset py-3 px-4 cursor-pointer hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-gray-800">{q.subject} · {q.chapter}</span>
                        <p className="text-sm text-gray-600">{q.topic}</p>
                      </div>
                      <span className="text-gray-400">→</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <Link href="/wrong">
              <ClayButton variant="secondary" size="sm" className="w-full mt-4">
                立即巩固 →
              </ClayButton>
            </Link>
          </ClayCard>

          {/* Recommended Challenges */}
          <ClayCard>
            <h3 className="font-bold text-gray-800 mb-4">推荐闯关</h3>
            <div className="space-y-3">
              {recommendedChallenges.map((c, i) => (
                <Link key={i} href="/challenge">
                  <div className={`clay-inset py-3 px-4 cursor-pointer hover:bg-gray-50 ${c.type === 'competition' ? 'border-2 border-orange-200' : ''}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-gray-800">
                          {c.subject} · {c.grade} · {c.chapter}
                        </span>
                        {c.type === 'competition' && (
                          <Badge variant="accent" className="ml-2">奥赛</Badge>
                        )}
                      </div>
                      <span className="text-gray-400">→</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </ClayCard>
        </div>

        {/* Recent Achievements */}
        <ClayCard>
          <h3 className="font-bold text-gray-800 mb-4">最近成就</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recentAchievements.map((a, i) => (
              <div
                key={i}
                className={`p-4 rounded-xl text-center ${
                  a.unlocked
                    ? 'bg-gradient-to-br from-orange-100 to-yellow-100 border-2 border-orange-200'
                    : 'bg-gray-100 opacity-50'
                }`}
              >
                <div className="text-3xl mb-2">{a.unlocked ? a.icon : '🔒'}</div>
                <div className={`text-sm font-medium ${a.unlocked ? 'text-orange-600' : 'text-gray-500'}`}>
                  {a.name}
                </div>
              </div>
            ))}
          </div>
        </ClayCard>
      </main>
    </div>
  );
}
