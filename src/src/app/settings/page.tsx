'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ClayCard, ClayButton, Badge, ClayInput, Avatar } from '@/components/ClayCard';

interface User {
  id: string;
  name: string;
  grade?: number;
}

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [userName, setUserName] = useState('');
  const [notifications, setNotifications] = useState({
    dailyReminder: true,
    wrongQuestionReminder: true,
    achievementNotification: true,
    parentNotification: false,
  });

  // 从 localStorage 加载用户数据
  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      const userData = JSON.parse(currentUser);
      setUser(userData);
      setUserName(userData.name || '');
    }
  }, []);

  const handleSave = () => {
    if (!user) return;
    // 更新本地存储的用户数据
    const updatedUser = { ...user, name: userName };
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    // 同时更新全局用户列表（如果存在）
    const allUsers = localStorage.getItem('users');
    if (allUsers) {
      const users = JSON.parse(allUsers);
      const index = users.findIndex((u: User) => u.id === user.id);
      if (index !== -1) {
        users[index] = updatedUser;
        localStorage.setItem('users', JSON.stringify(users));
      }
    }
    alert('设置已保存！');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="text-2xl">←</Link>
              <h1 className="font-bold text-xl text-gray-800">设置</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Profile Section */}
        <ClayCard className="mb-6">
          <h3 className="font-bold text-gray-800 mb-4">个人资料</h3>
          <div className="flex items-center gap-4 mb-4">
            <Avatar name={userName || '用户'} size="lg" />
            <div>
              <p className="font-medium text-gray-800">{userName || '未设置'}</p>
              <p className="text-sm text-gray-500">{user?.grade ? `${user.grade}年级` : '未设置年级'}</p>
            </div>
            <ClayButton variant="secondary" size="sm" className="ml-auto">
              修改头像
            </ClayButton>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">昵称</label>
            <ClayInput
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="输入昵称"
            />
          </div>
        </ClayCard>

        {/* Notification Settings */}
        <ClayCard className="mb-6">
          <h3 className="font-bold text-gray-800 mb-4">通知设置</h3>
          <div className="space-y-4">
            {[
              { key: 'dailyReminder', label: '每日学习提醒', desc: '每天固定时间提醒学习' },
              { key: 'wrongQuestionReminder', label: '错题巩固提醒', desc: '错题复习时间到时提醒' },
              { key: 'achievementNotification', label: '成就解锁通知', desc: '解锁新成就时通知' },
              { key: 'parentNotification', label: '家长通知', desc: '学习情况同步给家长' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">{item.label}</p>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
                <button
                  onClick={() => setNotifications({
                    ...notifications,
                    [item.key]: !notifications[item.key as keyof typeof notifications],
                  })}
                  className={`w-12 h-7 rounded-full transition-all relative ${
                    notifications[item.key as keyof typeof notifications]
                      ? 'bg-blue-500'
                      : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-all ${
                      notifications[item.key as keyof typeof notifications]
                        ? 'left-6'
                        : 'left-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </ClayCard>

        {/* Display Settings */}
        <ClayCard className="mb-6">
          <h3 className="font-bold text-gray-800 mb-4">显示设置</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">深色模式</p>
                <p className="text-sm text-gray-500">切换深色/浅色主题</p>
              </div>
              <button
                className="w-12 h-7 bg-gray-300 rounded-full relative"
              >
                <div className="absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow" />
              </button>
            </div>
            <div>
              <p className="font-medium text-gray-800 mb-2">字体大小</p>
              <div className="flex gap-2">
                {['小', '中', '大'].map((size, i) => (
                  <button
                    key={size}
                    className={`flex-1 py-2 rounded-lg text-center font-medium transition-all ${
                      i === 1
                        ? 'bg-blue-500 text-white'
                        : 'clay-inset hover:bg-gray-50'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </ClayCard>

        {/* About */}
        <ClayCard className="mb-6">
          <h3 className="font-bold text-gray-800 mb-4">关于</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>AI_Study v1.0.0</p>
            <p>小学生全科AI学习辅助系统</p>
            <p className="text-gray-400">让学习变得有趣</p>
          </div>
        </ClayCard>

        {/* Save Button */}
        <ClayButton className="w-full" onClick={handleSave}>
          保存设置
        </ClayButton>

        {/* Logout */}
        <Link href="/login">
          <ClayButton variant="secondary" className="w-full mt-3">
            退出登录
          </ClayButton>
        </Link>
      </main>
    </div>
  );
}
