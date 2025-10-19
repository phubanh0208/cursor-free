'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, UserPlus, Mail, Lock, User } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ToastContainer';

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin 
        ? { email: formData.email, password: formData.password }
        : formData;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.showError(data.error || 'Authentication failed');
        setLoading(false);
        return;
      }

      // Redirect based on role
      if (data.user.role === 'admin') {
        router.push('/dashboard');
      } else {
        router.push('/shop');
      }
      
      router.refresh();
    } catch (error: any) {
      console.error('Auth error:', error);
      toast.showError('Authentication failed: ' + error.message);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <img 
              src="/logo.png" 
              alt="CURSOR VIP Logo"
              className="w-20 h-20 object-contain"
            />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            CURSOR VIP
          </h1>
          <p className="text-gray-300">
            {isLogin ? 'Đăng nhập vào tài khoản' : 'Tạo tài khoản mới'}
          </p>
        </div>

        {/* Form */}
        <div className="glass-card rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-200 mb-2">
                  <User className="w-4 h-4" />
                  Tên người dùng
                </label>
                <input
                  type="text"
                  required={!isLogin}
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="glass-input w-full px-4 py-3 rounded-xl text-white placeholder-gray-400"
                  placeholder="Nhập tên của bạn"
                />
              </div>
            )}

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-200 mb-2">
                <Mail className="w-4 h-4" />
                Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="glass-input w-full px-4 py-3 rounded-xl text-white placeholder-gray-400"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-200 mb-2">
                <Lock className="w-4 h-4" />
                Mật khẩu
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="glass-input w-full px-4 py-3 rounded-xl text-white placeholder-gray-400"
                placeholder="••••••••"
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="glass-button w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                'Đang xử lý...'
              ) : isLogin ? (
                <>
                  <LogIn className="w-5 h-5" />
                  Đăng nhập
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Đăng ký
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-gray-300 hover:text-white transition-colors text-sm"
            >
              {isLogin ? (
                <>Chưa có tài khoản? <span className="font-semibold">Đăng ký ngay</span></>
              ) : (
                <>Đã có tài khoản? <span className="font-semibold">Đăng nhập</span></>
              )}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

