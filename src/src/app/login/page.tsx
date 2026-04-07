'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ClayCard, ClayButton, ClayInput, Avatar } from '@/components/ClayCard';

interface User {
  id: string;
  name: string;
  role: 'parent' | 'child';
  grade?: number;
}

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'select' | 'login' | 'create'>('select');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newUserName, setNewUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreateRole, setShowCreateRole] = useState<'child' | 'parent' | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    // Save current user to localStorage
    localStorage.setItem('currentUserId', user.id);
    localStorage.setItem('currentUser', JSON.stringify(user));
    // Redirect to dashboard
    router.push('/dashboard');
  };

  const handleCreateUser = async (role: 'child' | 'parent') => {
    if (!newUserName.trim()) return;

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newUserName.trim(),
          role,
        }),
      });
      const data = await res.json();
      if (data.success) {
        // If creating a child, go to init
        if (role === 'child') {
          localStorage.setItem('currentUserId', data.data.id);
          localStorage.setItem('currentUser', JSON.stringify(data.data));
          router.push('/init');
        } else {
          // For parent, go directly to parent dashboard
          localStorage.setItem('currentUserId', data.data.id);
          localStorage.setItem('currentUser', JSON.stringify(data.data));
          router.push('/parent');
        }
      }
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  };

  const handleDeleteUser = async (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('确定要删除这个账号吗？所有数据将被清除。')) return;

    try {
      const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
      if (res.ok) {
        setUsers(users.filter((u) => u.id !== userId));
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const parentUsers = users.filter((u) => u.role === 'parent');
  const childUsers = users.filter((u) => u.role === 'child');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-bounce">📚</div>
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg mb-4">
            <span className="text-4xl">📚</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">AI_Study</h1>
          <p className="text-gray-500 mt-2">智能学习伙伴</p>
        </div>

        <ClayCard>
          {mode === 'select' && (
            <>
              {/* Parent Login */}
              {parentUsers.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">👨‍👩‍👧 家长账号</h3>
                  <div className="space-y-2">
                    {parentUsers.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => handleSelectUser(user)}
                        className="flex items-center gap-3 p-4 clay-inset hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <Avatar name={user.name} size="md" />
                        <div className="flex-1 text-left">
                          <p className="font-medium text-gray-800">{user.name}</p>
                          <p className="text-sm text-gray-500">家长账号</p>
                        </div>
                        <button
                          onClick={(e) => handleDeleteUser(user.id, e)}
                          className="p-2 text-gray-400 hover:text-red-500"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Child Login */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">👤 小学生账号</h3>
                {childUsers.length > 0 ? (
                  <div className="space-y-2">
                    {childUsers.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => handleSelectUser(user)}
                        className="flex items-center gap-3 p-4 clay-inset hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <Avatar name={user.name} size="md" />
                        <div className="flex-1 text-left">
                          <p className="font-medium text-gray-800">{user.name}</p>
                          <p className="text-sm text-gray-500">
                            {user.grade ? `${user.grade}年级` : '未设置年级'}
                          </p>
                        </div>
                        <button
                          onClick={(e) => handleDeleteUser(user.id, e)}
                          className="p-2 text-gray-400 hover:text-red-500"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">还没有账号</p>
                )}
              </div>

              {/* Add New */}
              <div className="border-t border-gray-100 pt-6 space-y-3">
                <ClayButton
                  variant="secondary"
                  className="w-full"
                  onClick={() => setMode('create')}
                >
                  + 添加新账号
                </ClayButton>
              </div>
            </>
          )}

          {mode === 'create' && (
            <>
              <h3 className="text-xl font-bold text-gray-800 mb-6">创建账号</h3>

              {showCreateRole === null ? (
                <div className="space-y-4">
                  <p className="text-gray-600 text-center mb-4">选择账号类型</p>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setShowCreateRole('child')}
                      className="p-6 clay-inset text-center hover:bg-blue-50 transition-colors"
                    >
                      <div className="text-4xl mb-2">👤</div>
                      <p className="font-medium text-gray-800">小学生</p>
                      <p className="text-sm text-gray-500">开始学习</p>
                    </button>
                    <button
                      onClick={() => setShowCreateRole('parent')}
                      className="p-6 clay-inset text-center hover:bg-green-50 transition-colors"
                    >
                      <div className="text-4xl mb-2">👨‍👩‍👧</div>
                      <p className="font-medium text-gray-800">家长</p>
                      <p className="text-sm text-gray-500">管理孩子</p>
                    </button>
                  </div>
                  <ClayButton
                    variant="ghost"
                    className="w-full mt-4"
                    onClick={() => setMode('select')}
                  >
                    返回
                  </ClayButton>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {showCreateRole === 'child' ? '小朋友的名字' : '您的名字'}
                      </label>
                      <ClayInput
                        placeholder="请输入名字"
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                      />
                    </div>

                    <ClayButton
                      className="w-full"
                      onClick={() => handleCreateUser(showCreateRole)}
                      disabled={!newUserName.trim()}
                    >
                      {showCreateRole === 'child' ? '创建学生账号' : '创建家长账号'}
                    </ClayButton>

                    <ClayButton
                      variant="ghost"
                      className="w-full"
                      onClick={() => {
                        setShowCreateRole(null);
                        setNewUserName('');
                      }}
                    >
                      返回选择
                    </ClayButton>
                  </div>
                </>
              )}
            </>
          )}
        </ClayCard>

        {/* Footer */}
        <p className="text-center text-gray-400 text-sm mt-6">
          让学习变得有趣 📚
        </p>
      </div>
    </div>
  );
}
