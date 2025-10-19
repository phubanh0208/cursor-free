'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { useToast } from '@/components/ToastContainer';
import { 
  ShoppingBag, 
  DollarSign, 
  Clock, 
  Calendar,
  Package
} from 'lucide-react';

interface Token {
  _id: string;
  name: string;
  category: string;
  value: number;
  expiry_days: number;
  day_create: string;
}

interface UserData {
  username: string;
  email: string;
  role: 'admin' | 'customer';
}

export default function ShopPage() {
  const router = useRouter();
  const toast = useToast();
  const [user, setUser] = useState<UserData | null>(null);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    checkAuth();
    fetchCategories();
    fetchAvailableTokens();
  }, []);

  useEffect(() => {
    fetchAvailableTokens();
  }, [selectedCategory]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (!response.ok) {
        router.push('/login');
        return;
      }
      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      router.push('/login');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/shop/categories');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setCategories(data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchAvailableTokens = async () => {
    try {
      const url = selectedCategory === 'all' 
        ? '/api/shop/tokens'
        : `/api/shop/tokens?category=${selectedCategory}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setTokens(data.tokens);
    } catch (error) {
      console.error('Error fetching tokens:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (tokenId: string) => {
    if (!confirm('Bạn có chắc muốn mua token này?')) return;

    setPurchasing(tokenId);
    try {
      const response = await fetch('/api/shop/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to purchase');
      }

      toast.showSuccess('Mua token thành công! Xem trong "Token của tôi"');
      await fetchAvailableTokens();
    } catch (error: any) {
      toast.showError('Lỗi: ' + error.message);
    } finally {
      setPurchasing(null);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      
      
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-3 flex items-center gap-3">
              <ShoppingBag className="w-10 h-10" />
              Cửa hàng Token
            </h1>
            <p className="text-gray-300 text-lg">
              Chọn và mua token phù hợp với bạn
            </p>
          </div>

          {/* Category Filter */}
          {categories.length > 0 && (
            <div className="glass-card rounded-2xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">Lọc theo danh mục</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    selectedCategory === 'all'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                      : 'glass-hover text-gray-300'
                  }`}
                >
                  Tất cả
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-xl font-medium transition-all capitalize ${
                      selectedCategory === cat
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                        : 'glass-hover text-gray-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tokens Grid */}
          {tokens.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-white mb-2">
                Hiện tại không có token nào
              </h2>
              <p className="text-gray-400">
                Vui lòng quay lại sau khi có token mới
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tokens.map((token) => (
                <div
                  key={token._id}
                  className="glass-card rounded-2xl p-6 hover:scale-105 transition-transform"
                >
                  {/* Token Icon */}
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mb-4">
                    <Package className="w-8 h-8 text-white" />
                  </div>

                  {/* Product Name & Category */}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-white mb-2">{token.name}</h3>
                    <span className="inline-block px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-medium capitalize">
                      {token.category}
                    </span>
                  </div>

                  {/* Token Info */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Giá trị
                      </span>
                      <span className="text-2xl font-bold text-white">
                        ${token.value}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Hạn sử dụng
                      </span>
                      <span className="text-white font-semibold">
                        {token.expiry_days} ngày
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Ngày tạo
                      </span>
                      <span className="text-white font-semibold">
                        {new Date(token.day_create).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>

                  {/* Purchase Button */}
                  <button
                    onClick={() => handlePurchase(token._id)}
                    disabled={purchasing === token._id}
                    className="glass-button w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {purchasing === token._id ? (
                      'Đang mua...'
                    ) : (
                      <>
                        <ShoppingBag className="w-5 h-5" />
                        Mua ngay
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

