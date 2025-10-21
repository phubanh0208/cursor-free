'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ToastContainer';
import { 
  FolderTree,
  Package,
  DollarSign,
  CheckCircle,
  XCircle,
  TrendingUp,
  Loader
} from 'lucide-react';

interface UserData {
  username: string;
  email: string;
  role: 'admin' | 'customer';
}

interface CategoryStats {
  category: string;
  totalProducts: number;
  availableProducts: number;
  soldProducts: number;
  totalRevenue: number;
  uniqueEmails: number;
}

export default function CategoriesPage() {
  const router = useRouter();
  const toast = useToast();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<CategoryStats[]>([]);

  useEffect(() => {
    checkAuth();
    fetchCategoryStats();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (!response.ok) {
        router.push('/login');
        return;
      }
      const data = await response.json();
      if (data.user.role !== 'admin') {
        router.push('/shop');
        return;
      }
      setUser(data.user);
    } catch (error) {
      router.push('/login');
    }
  };

  const fetchCategoryStats = async () => {
    try {
      const response = await fetch('/api/admin/category-stats');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.showError('Không thể tải thống kê categories');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl flex items-center gap-3">
          <Loader className="w-6 h-6 animate-spin" />
          Loading...
        </div>
      </div>
    );
  }

  const totalProducts = stats.reduce((sum, s) => sum + s.totalProducts, 0);
  const totalAvailable = stats.reduce((sum, s) => sum + s.availableProducts, 0);
  const totalSold = stats.reduce((sum, s) => sum + s.soldProducts, 0);
  const totalRevenue = stats.reduce((sum, s) => sum + s.totalRevenue, 0);

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 flex items-center gap-3">
          <FolderTree className="w-10 h-10" />
          Quản lý Categories
        </h1>

          {/* Overall Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Tổng sản phẩm</span>
                <Package className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-white">{totalProducts}</div>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Còn hàng</span>
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div className="text-3xl font-bold text-green-400">{totalAvailable}</div>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Đã bán</span>
                <XCircle className="w-5 h-5 text-red-400" />
              </div>
              <div className="text-3xl font-bold text-red-400">{totalSold}</div>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Doanh thu</span>
                <DollarSign className="w-5 h-5 text-yellow-400" />
              </div>
              <div className="text-3xl font-bold text-yellow-400">${totalRevenue}</div>
            </div>
          </div>

          {/* Category Stats Table */}
          <div className="glass-card rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-8 py-6 border-b border-white/10">
              <h2 className="text-2xl font-semibold text-white">Thống kê theo Category</h2>
            </div>

            {stats.length === 0 ? (
              <div className="p-12 text-center">
                <FolderTree className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">Chưa có category nào</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Category</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Tổng SP</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Còn hàng</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Đã bán</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Email unique</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Doanh thu</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Tỉ lệ bán</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {stats.map((stat) => {
                      const soldRate = stat.totalProducts > 0 
                        ? ((stat.soldProducts / stat.totalProducts) * 100).toFixed(1)
                        : '0.0';
                      
                      return (
                        <tr key={stat.category} className="glass-hover">
                          <td className="px-6 py-4 text-sm">
                            <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-medium capitalize">
                              {stat.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-300">
                            <div className="flex items-center gap-2">
                              <Package className="w-4 h-4" />
                              {stat.totalProducts}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span className="text-green-400 font-semibold">{stat.availableProducts}</span>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span className="text-red-400 font-semibold">{stat.soldProducts}</span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-300">
                            {stat.uniqueEmails} email
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span className="text-yellow-400 font-semibold">${stat.totalRevenue}</span>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-white/10 rounded-full h-2 overflow-hidden relative">
                                <div 
                                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-full absolute top-0 left-0"
                                  data-width={soldRate}
                                  style={{ width: `${soldRate}%` }}
                                />
                              </div>
                              <span className="text-gray-300 text-xs font-medium min-w-[40px]">
                                {soldRate}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
  );
}

