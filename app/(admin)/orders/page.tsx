'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { useToast } from '@/components/ToastContainer';
import { 
  ShoppingCart,
  Package,
  User,
  Calendar,
  DollarSign,
  Filter,
  Mail,
  Key,
  Loader
} from 'lucide-react';

interface UserData {
  username: string;
  email: string;
  role: 'admin' | 'customer';
}

interface Order {
  _id: string;
  name: string;
  category: string;
  token?: string;
  email?: string;
  password?: string;
  value: number;
  expiry_days: number;
  purchaseDate: string;
  customerId: {
    _id: string;
    email: string;
    username: string;
  };
}

export default function OrdersPage() {
  const router = useRouter();
  const toast = useToast();
  const [user, setUser] = useState<UserData | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    checkAuth();
    fetchOrders();
    fetchCategories();
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

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/tokens');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      const uniqueCategories = [...new Set(data.tokens.map((t: any) => t.category))];
      setCategories(uniqueCategories as string[]);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/admin/orders');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setOrders(data.orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.showError('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchCategory = selectedCategory === 'all' || order.category === selectedCategory;
    const matchSearch = searchTerm === '' || 
      order.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerId.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerId.username.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchCategory && matchSearch;
  });

  const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.value, 0);

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

  return (
    <div className="flex min-h-screen">
      
      
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8 flex items-center gap-3">
            <ShoppingCart className="w-10 h-10" />
            Quản lý Đơn hàng
          </h1>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Tổng đơn hàng</span>
                <ShoppingCart className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-white">{filteredOrders.length}</div>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Khách hàng</span>
                <User className="w-5 h-5 text-green-400" />
              </div>
              <div className="text-3xl font-bold text-green-400">
                {new Set(filteredOrders.map(o => o.customerId._id)).size}
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Doanh thu</span>
                <DollarSign className="w-5 h-5 text-yellow-400" />
              </div>
              <div className="text-3xl font-bold text-yellow-400">${totalRevenue}</div>
            </div>
          </div>

          {/* Filters */}
          <div className="glass-card rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Filter className="w-5 h-5 text-white" />
              <h3 className="text-lg font-semibold text-white">Lọc đơn hàng</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search */}
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Tìm kiếm</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm theo tên, email, khách hàng..."
                  className="glass-input w-full px-4 py-3 rounded-xl text-white placeholder-gray-400"
                />
              </div>

              {/* Category Filter */}
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="glass-input w-full px-4 py-3 rounded-xl text-white"
                  title="Chọn category"
                >
                  <option value="all">Tất cả</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat} className="capitalize">
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="glass-card rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-8 py-6 border-b border-white/10">
              <h2 className="text-2xl font-semibold text-white">
                Danh sách đơn hàng ({filteredOrders.length})
              </h2>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="p-12 text-center">
                <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">
                  {searchTerm || selectedCategory !== 'all' 
                    ? 'Không tìm thấy đơn hàng nào'
                    : 'Chưa có đơn hàng nào'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Sản phẩm</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Category</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Khách hàng</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Email sản phẩm</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Giá trị</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Ngày mua</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {filteredOrders.map((order) => (
                      <tr key={order._id} className="glass-hover">
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-blue-400" />
                            <div>
                              <div className="font-semibold text-white">{order.name}</div>
                              <div className="text-xs text-gray-500">
                                {order.expiry_days} ngày
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-medium capitalize">
                            {order.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-green-400" />
                            <div>
                              <div className="text-white font-medium">{order.customerId.username}</div>
                              <div className="text-xs text-gray-500">{order.customerId.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">
                          {order.email ? (
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              {order.email}
                            </div>
                          ) : (
                            <span className="text-gray-500">N/A</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="text-yellow-400 font-semibold">${order.value}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {new Date(order.purchaseDate).toLocaleDateString('vi-VN')}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

