'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ClayCard, ClayButton, Badge } from '@/components/ClayCard';
import { PageHeader } from '@/components/Layout';

interface CalendarDay {
  date: string;
  day: number;
  completed: boolean;
  isToday: boolean;
  isFuture: boolean;
}

export default function CheckInPage() {
  const [checkedIn, setCheckedIn] = useState(true);
  const [currentStreak, setCurrentStreak] = useState(7);

  // Generate calendar for current month
  const generateCalendar = (): CalendarDay[] => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startWeekday = firstDay.getDay();

    const calendar: CalendarDay[] = [];

    // Empty cells for days before first of month
    for (let i = 0; i < startWeekday; i++) {
      calendar.push({ date: '', day: 0, completed: false, isToday: false, isFuture: true });
    }

    // Days of the month
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const dateStr = date.toISOString().split('T')[0];
      const isToday = dateStr === today.toISOString().split('T')[0];
      const isFuture = date > today;

      // Mock: completed days (last 10 days for demo)
      const completed = d >= today.getDate() - 10 && d <= today.getDate() - 1;

      calendar.push({
        date: dateStr,
        day: d,
        completed: completed && !isToday,
        isToday,
        isFuture,
      });
    }

    return calendar;
  };

  const calendar = generateCalendar();
  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  const today = new Date();

  const stats = {
    total: 30,
    current: 12,
    streak: currentStreak,
    longest: 15,
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="text-2xl">←</Link>
              <h1 className="font-bold text-xl text-gray-800">每日打卡</h1>
            </div>
            <Badge variant="success">🔥 {currentStreak}天连续</Badge>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <PageHeader title="学习打卡" subtitle="坚持每日学习，养成好习惯" />

        {/* Today's Check-in Card */}
        <ClayCard className={`mb-6 ${checkedIn ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200' : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200'}`}>
          <div className="flex items-center gap-6">
            <div className="text-6xl">{checkedIn ? '✅' : '📝'}</div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-800 mb-1">
                {today.getMonth() + 1}月{today.getDate()}日
              </h2>
              <p className="text-gray-500 mb-3">
                {checkedIn ? '今日已打卡！继续加油！' : '今日还未打卡'}
              </p>
              {!checkedIn ? (
                <ClayButton
                  onClick={() => setCheckedIn(true)}
                  className="bg-gradient-to-r from-green-500 to-emerald-500"
                >
                  📅 立即打卡
                </ClayButton>
              ) : (
                <div className="flex items-center gap-2 text-green-600">
                  <span className="text-2xl">🎉</span>
                  <span className="font-medium">打卡成功！+10积分</span>
                </div>
              )}
            </div>
          </div>
        </ClayCard>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <ClayCard className="text-center">
            <div className="text-2xl font-bold text-blue-500">{stats.current}</div>
            <div className="text-sm text-gray-500">本月打卡</div>
          </ClayCard>
          <ClayCard className="text-center border-2 border-orange-200">
            <div className="text-2xl font-bold text-orange-500">{stats.streak}</div>
            <div className="text-sm text-gray-500">连续天数</div>
          </ClayCard>
          <ClayCard className="text-center">
            <div className="text-2xl font-bold text-green-500">{stats.longest}</div>
            <div className="text-sm text-gray-500">最长连续</div>
          </ClayCard>
        </div>

        {/* Calendar */}
        <ClayCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-gray-800">
              {monthNames[today.getMonth()]} {today.getFullYear()}
            </h3>
            <div className="flex gap-2">
              <button className="p-2 clay-inset hover:bg-gray-50">←</button>
              <button className="p-2 clay-inset hover:bg-gray-50">→</button>
            </div>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekdays.map((day) => (
              <div key={day} className="text-center text-sm text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendar.map((day, i) => (
              <div
                key={i}
                className={`
                  aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all
                  ${day.isFuture ? 'text-gray-300' : ''}
                  ${day.isToday ? 'bg-blue-500 text-white' : ''}
                  ${day.completed && !day.isToday ? 'bg-green-100 text-green-700' : ''}
                  ${!day.completed && !day.isToday && !day.isFuture ? 'bg-gray-50 text-gray-400' : ''}
                `}
              >
                {day.day || ''}
                {day.completed && !day.isToday && (
                  <span className="absolute text-xs text-green-500">✓</span>
                )}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-gray-500">今天</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
              <span className="text-gray-500">已打卡</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-50 border border-gray-200 rounded"></div>
              <span className="text-gray-500">未打卡</span>
            </div>
          </div>
        </ClayCard>

        {/* Tips */}
        <ClayCard className="mt-6 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-100">
          <div className="flex items-start gap-4">
            <div className="text-3xl">💡</div>
            <div>
              <h3 className="font-bold text-gray-800 mb-2">打卡小贴士</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 每日打卡可获得 10 积分</li>
                <li>• 连续打卡 7 天解锁「连续7天」成就</li>
                <li>• 连续打卡 30 天解锁「月度学霸」成就</li>
                <li>• 中间断签会重置连续天数哦！</li>
              </ul>
            </div>
          </div>
        </ClayCard>
      </main>
    </div>
  );
}
