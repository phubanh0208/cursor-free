'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ToastContainer';
import { Coins, User, Plus, Minus, Edit, Loader } from 'lucide-react';

interface UserData {
  _id: string;
  username: string;
  email: string;
  role: 'admin' | 'customer';
  credits: number;
  createdAt: string;
}

export default function AdminCreditsPage() {
  const toast = useToast();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [creditAmount, setCreditAmount] = useState<number>(0);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/credits');
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data.users);
    } catch (error: any) {
      toast.showError('Lỗi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateCredits = async (userId: string, action: 'set' | 'add' | 'subtract', credits: number) => {
    if (credits < 0) {
      toast.showWarning('Số credit phải >= 0');
      return;
    }

    setActionLoading(userId);
    try {
      const response = await fetch('/api/admin/credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action, credits }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update credits');
      }

      const data = await response.json();
      
      // Update local state
      setUsers(prev => prev.map(u => 
        u._id === userId ? { ...u, credits: data.user.credits } : u
      ));
      
      toast.showSuccess('Cập nhật credits thành công!');
      setEditingUser(null);
      setCreditAmount(0);
    } catch (error: any) {
      toast.showError('Lỗi: ' + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleQuickAction = (userId: string, action: 'add' | 'subtract', amount: number) => {
    updateCredits(userId, action, amount);
  };

  const handleSetCredits = (userId: string) => {
    if (creditAmount < 0) {
      toast.showWarning('Số credit phải >= 0');
      return;
    }
    updateCredits(userId, 'set', creditAmount);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader className="w-8 h-8 animate-spin text-white" />
        </div>
      </div>
    );
  }

  const totalCredits = users.reduce((sum, user) => sum + user.credits, 0);

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Coins className="w-10 h-10" />
            Quản lý Credits
          </h1>
          <p className="text-gray-400">Quản lý credits của người dùng</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-gray-400 text-sm mb-2">Tổng Users</h3>
            <p className="text-3xl font-bold text-white">{users.length}</p>
          </div>
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-gray-400 text-sm mb-2">Tổng Credits</h3>
            <p className="text-3xl font-bold text-yellow-400">{totalCredits}</p>
          </div>
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-gray-400 text-sm mb-2">Avg Credits/User</h3>
            <p className="text-3xl font-bold text-blue-400">
              {users.length > 0 ? (totalCredits / users.length).toFixed(1) : 0}
            </p>
          </div>
        </div>

        {/* Users Table */}
        <div className="glass-card rounded-2xl shadow-2xl overflow-hidden">
          <div className="px-8 py-6 border-b border-white/10">
            <h2 className="text-2xl font-semibold text-white">Danh sách Users</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">User</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Role</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Credits</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {users.map((user) => (
                  <tr key={user._id} className="glass-hover">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-white font-medium">{user.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin' 
                          ? 'bg-purple-500/20 text-purple-400' 
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {editingUser === user._id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={creditAmount}
                            onChange={(e) => setCreditAmount(parseInt(e.target.value) || 0)}
                            className="glass-input w-24 px-3 py-1 rounded-lg text-white text-sm"
                            min="0"
                            placeholder="0"
                          />
                          <button
                            onClick={() => handleSetCredits(user._id)}
                            disabled={actionLoading === user._id}
                            className="glass-button px-3 py-1 rounded-lg text-sm"
                          >
                            OK
                          </button>
                          <button
                            onClick={() => {
                              setEditingUser(null);
                              setCreditAmount(0);
                            }}
                            className="glass-hover px-3 py-1 rounded-lg text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <span className="text-2xl font-bold text-yellow-400">
                          {user.credits}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleQuickAction(user._id, 'add', 1)}
                          disabled={actionLoading === user._id}
                          className="glass-button p-2 rounded-lg"
                          title="Thêm 1 credit"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleQuickAction(user._id, 'subtract', 1)}
                          disabled={actionLoading === user._id || user.credits === 0}
                          className="glass-button p-2 rounded-lg disabled:opacity-30"
                          title="Trừ 1 credit"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingUser(user._id);
                            setCreditAmount(user.credits);
                          }}
                          disabled={actionLoading === user._id}
                          className="glass-button p-2 rounded-lg"
                          title="Set credits"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

