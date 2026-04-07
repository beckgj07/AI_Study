'use client';

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ClayCard, Avatar } from './ClayCard';

interface NavItem {
  icon: string;
  label: string;
  href: string;
  divider?: boolean;
}

const navItems: NavItem[] = [
  { icon: '👤', label: '登录/切换', href: '/login' },
  { icon: '⚙️', label: '初始化设置', href: '/init', divider: true },
  { icon: '🏠', label: '首页仪表盘', href: '/dashboard' },
  { icon: '🗺️', label: '知识地图', href: '/map' },
  { icon: '🎮', label: '闯关选择', href: '/challenge' },
  { icon: '📝', label: '答题测验', href: '/quiz' },
  { icon: '💡', label: 'AI讲解', href: '/explain' },
  { icon: '❌', label: '错题本', href: '/wrong' },
  { icon: '📊', label: '学习报告', href: '/report' },
  { icon: '🏆', label: '成就墙', href: '/achievements' },
  { icon: '📅', label: '每日打卡', href: '/checkin' },
  { icon: '📤', label: '教材上传', href: '/upload', divider: true },
  { icon: '📚', label: '我的题库', href: '/question-bank' },
  { icon: '⚙️', label: '个人设置', href: '/settings' },
  { icon: '👨‍👩‍👧', label: '家长端', href: '/parent' },
  { icon: '🤖', label: 'AI配置', href: '/admin/ai-config' },
];

interface SidebarProps {
  children?: ReactNode;
}

export function Sidebar({ children }: SidebarProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string; grade?: number } | null>(null);

  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      setUser(JSON.parse(currentUser));
    }
  }, []);

  return (
    <aside className="w-64 min-h-screen bg-white shadow-lg flex flex-col">
      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white text-xl shadow-md">
            📚
          </div>
          <div>
            <h1 className="font-bold text-lg text-gray-800">AI_Study</h1>
            <p className="text-xs text-gray-500">智能学习伙伴</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="px-4 pb-4">
        <ClayCard variant="flat" className="flex items-center gap-3">
          <Avatar name={user?.name || '未登录'} size="md" />
          <div>
            <p className="font-semibold text-gray-800">{user?.name || '未登录'}</p>
            <p className="text-xs text-gray-500">{user?.grade ? `${user.grade}年级` : '请登录'}</p>
          </div>
        </ClayCard>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {navItems.map((item, index) => (
          <div key={item.href}>
            {item.divider && index > 0 && (
              <div className="my-3 border-t border-gray-200" />
            )}
            <Link
              href={item.href}
              className={`
                nav-item flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                ${
                  pathname === item.href
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 !text-white shadow-[4px_4px_8px_rgba(37,99,235,0.3)]'
                    : 'text-gray-600 hover:bg-gray-100'
                }
              `}
              style={pathname === item.href ? { color: 'white' } : undefined}
            >
              <span className="text-lg" style={pathname === item.href ? { color: 'white' } : undefined}>{item.icon}</span>
              <span className="font-medium" style={pathname === item.href ? { color: 'white' } : undefined}>{item.label}</span>
            </Link>
          </div>
        ))}
      </nav>

      {/* Stats */}
      <div className="p-4 border-t border-gray-100">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2">
            <p className="text-lg font-bold text-orange-500">7</p>
            <p className="text-xs text-gray-500">连续天数</p>
          </div>
          <div className="p-2">
            <p className="text-lg font-bold text-blue-500">1250</p>
            <p className="text-xs text-gray-500">积分</p>
          </div>
          <div className="p-2">
            <p className="text-lg font-bold text-green-500">78%</p>
            <p className="text-xs text-gray-500">正确率</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

interface MobileNavProps {
  children?: ReactNode;
}

export function MobileNav({ children }: MobileNavProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string } | null>(null);

  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      setUser(JSON.parse(currentUser));
    }
  }, []);

  const bottomNavItems = [
    { icon: '🏠', label: '首页', href: '/dashboard' },
    { icon: '🗺️', label: '地图', href: '/map' },
    { icon: '📝', label: '答题', href: '/quiz' },
    { icon: '❌', label: '错题', href: '/wrong' },
    { icon: '⚙️', label: '设置', href: '/settings' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white">
              📚
            </div>
            <span className="font-bold text-gray-800">AI_Study</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-orange-500">🔥 7天</span>
            <span className="text-sm text-blue-500">⭐ 1250</span>
            <Link href="/settings">
              <Avatar name={user?.name || '未登录'} size="sm" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-14 pb-20 px-4">{children}</main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50">
        <div className="flex justify-around py-2">
          {bottomNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors
                  ${isActive ? 'text-blue-600' : 'text-gray-400'}
                `}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
