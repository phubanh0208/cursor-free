'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ToastContainer';
import { 
  Receipt, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertCircle,
  Filter,
  Calendar,
  DollarSign
} from 'lucide-react';

interface Order {
  id: string;
  orderInvoiceNumber: string;
  orderType: string;
  creditAmount: number;
  orderAmount: number;
  orderStatus: 'pending' | 'paid' | 'failed' | 'cancelled';
  paymentMethod: string;
  transactionId?: string;
  transactionDate?: string;
  orderDescription: string;
  createdAt: string;
  updatedAt: string;
}

interface UserData {
  username: string;
  email: string;
  role: 'admin' | 'customer';
  credits: number;
}

export default function OrdersPage() {
  const router = useRouter();
  const toast = useToast();
  
  const [user, setUser] = useState<UserData | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user, filterStatus]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (!response.ok) {
        router.push('/login');
        return;
      }
      const data = await response.json();
      if (data.user.role !== 'customer') {
        router.push('/');
        return;
      }
      setUser(data.user);
    } catch (error) {
      router.push('/login');
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const url = filterStatus === 'all' 
        ? '/api/customer/orders'
        : `/api/customer/orders?status=${filterStatus}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch orders');
      
      const data = await response.json();
      setOrders(data.orders);
    } catch (error: any) {
      toast.showError('Không thể tải lịch sử giao dịch');
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-400" />;
      case 'cancelled':
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      paid: 'bg-green-500/20 text-green-400 border-green-500/30',
      failed: 'bg-red-500/20 text-red-400 border-red-500/30',
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      cancelled: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    };
    
    const labels = {
      paid: 'Thành công',
      failed: 'Thất bại',
      pending: 'Đang xử lý',
      cancelled: 'Đã hủy'
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-3 flex items-center gap-3">
            <Receipt className="w-10 h-10" />
            Lịch sử giao dịch
          </h1>
          <p className="text-gray-300 text-lg">
            Xem tất cả các giao dịch nạp credit của bạn
          </p>
        </div>

        {/* Filter */}
        <div className="glass-card rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Filter className="w-5 h-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-white">Lọc theo trạng thái</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {[
              { value: 'all', label: 'Tất cả' },
              { value: 'paid', label: 'Thành công' },
              { value: 'pending', label: 'Đang xử lý' },
              { value: 'failed', label: 'Thất bại' },
              { value: 'cancelled', label: 'Đã hủy' }
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setFilterStatus(filter.value)}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  filterStatus === filter.value
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                    : 'glass-hover text-gray-300'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <Receipt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-white mb-2">
              Chưa có giao dịch nào
            </h2>
            <p className="text-gray-400 mb-6">
              Bạn chưa thực hiện giao dịch nạp credit nào
            </p>
            <button
              onClick={() => router.push('/deposit')}
              className="glass-button px-6 py-3 rounded-xl text-white font-semibold"
            >
              Nạp credit ngay
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="glass-card rounded-2xl p-6 hover:scale-[1.01] transition-transform"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Status Icon */}
                  <div className="flex items-center gap-4 flex-1">
                    <div className="p-3 rounded-xl glass-hover">
                      {getStatusIcon(order.orderStatus)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-white font-semibold truncate">
                          {order.orderDescription}
                        </h3>
                        {getStatusBadge(order.orderStatus)}
                      </div>
                      <p className="text-gray-400 text-sm font-mono truncate">
                        {order.orderInvoiceNumber}
                      </p>
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                    <div>
                      <p className="text-gray-400 text-xs mb-1">Credit</p>
                      <p className="text-white font-bold">
                        {order.creditAmount}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-gray-400 text-xs mb-1">Số tiền</p>
                      <p className="text-white font-bold flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {order.orderAmount.toLocaleString('vi-VN')}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-gray-400 text-xs mb-1">Ngày tạo</p>
                      <p className="text-white font-semibold flex items-center gap-1 text-sm">
                        <Calendar className="w-4 h-4" />
                        {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Transaction Details (if paid) */}
                {order.orderStatus === 'paid' && order.transactionId && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-400">Mã giao dịch: </span>
                        <span className="text-white font-mono">{order.transactionId}</span>
                      </div>
                      {order.transactionDate && (
                        <div>
                          <span className="text-gray-400">Ngày thanh toán: </span>
                          <span className="text-white">
                            {new Date(order.transactionDate).toLocaleString('vi-VN')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Stats Summary */}
        {orders.length > 0 && (
          <div className="glass-card rounded-2xl p-6 mt-6">
            <h3 className="text-lg font-semibold text-white mb-4">Thống kê</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="glass-hover rounded-xl p-4">
                <p className="text-gray-400 text-sm mb-1">Tổng giao dịch</p>
                <p className="text-2xl font-bold text-white">{orders.length}</p>
              </div>
              
              <div className="glass-hover rounded-xl p-4">
                <p className="text-gray-400 text-sm mb-1">Thành công</p>
                <p className="text-2xl font-bold text-green-400">
                  {orders.filter(o => o.orderStatus === 'paid').length}
                </p>
              </div>
              
              <div className="glass-hover rounded-xl p-4">
                <p className="text-gray-400 text-sm mb-1">Đang xử lý</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {orders.filter(o => o.orderStatus === 'pending').length}
                </p>
              </div>
              
              <div className="glass-hover rounded-xl p-4">
                <p className="text-gray-400 text-sm mb-1">Tổng đã nạp</p>
                <p className="text-2xl font-bold text-blue-400">
                  {orders
                    .filter(o => o.orderStatus === 'paid')
                    .reduce((sum, o) => sum + o.creditAmount, 0)} credit
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

