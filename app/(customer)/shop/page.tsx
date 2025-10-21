'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ToastContainer';
import ConfirmDialog from '@/components/ConfirmDialog';
import GuideModal from '@/components/GuideModal';
import { 
  ShoppingBag, 
  DollarSign, 
  Clock, 
  Calendar,
  Package,
  Wallet,
  HelpCircle
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
  credits: number;
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
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [guideCategory, setGuideCategory] = useState<string>('');
  const [guideCategoryDisplayName, setGuideCategoryDisplayName] = useState<string>('');
  const [guideHtml, setGuideHtml] = useState<string>('');

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

  const handlePurchaseClick = (tokenId: string) => {
    setSelectedTokenId(tokenId);
    setShowConfirmDialog(true);
  };

  const handleConfirmPurchase = async () => {
    if (!selectedTokenId) return;

    setShowConfirmDialog(false);
    setPurchasing(selectedTokenId);
    
    try {
      const response = await fetch('/api/shop/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenId: selectedTokenId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to purchase');
      }

      // Cập nhật credit của user
      if (user && typeof data.remainingCredits === 'number') {
        setUser({ ...user, credits: data.remainingCredits });
      }

      toast.showSuccess(`Mua token thành công! Còn lại ${data.remainingCredits} credit`);
      await fetchAvailableTokens();
    } catch (error: any) {
      toast.showError(error.message);
    } finally {
      setPurchasing(null);
      setSelectedTokenId(null);
    }
  };

  const handleCancelPurchase = () => {
    setShowConfirmDialog(false);
    setSelectedTokenId(null);
  };

  const handleShowGuide = async (category: string) => {
    try {
      const response = await fetch(`/api/shop/category-guide/${category}`);
      if (!response.ok) throw new Error('Failed to fetch guide');
      
      const data = await response.json();
      
      setGuideCategory(data.categoryName);
      setGuideCategoryDisplayName(data.displayName || category);
      setGuideHtml(data.guide);
      setShowGuideModal(true);
    } catch (error: any) {
      toast.showError('Không thể tải hướng dẫn');
      console.error('Error fetching guide:', error);
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
    <div className="p-8">
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

        {/* Credit Display */}
        <div className="glass-card rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <Wallet className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Số dư tài khoản</p>
                <p className="text-3xl font-bold text-white">
                  {user.credits} <span className="text-xl text-gray-400">credit</span>
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 mb-1">Tip</p>
              <p className="text-sm text-gray-300">
                1 credit = $1
              </p>
            </div>
          </div>
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
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-bold text-white flex-1">{token.name}</h3>
                      <button
                        onClick={() => handleShowGuide(token.category)}
                        className="p-2 rounded-lg glass-hover text-blue-400 hover:text-blue-300 transition-colors group"
                        aria-label="Xem hướng dẫn"
                        title="Xem hướng dẫn sử dụng"
                      >
                        <HelpCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      </button>
                    </div>
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
                    onClick={() => handlePurchaseClick(token._id)}
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

        {/* Confirm Dialog */}
        <ConfirmDialog
          isOpen={showConfirmDialog}
          title="Xác nhận mua hàng"
          message={
            selectedTokenId && tokens.find(t => t._id === selectedTokenId)
              ? `Bạn sẽ mua token "${tokens.find(t => t._id === selectedTokenId)!.name}" với giá ${tokens.find(t => t._id === selectedTokenId)!.value} credit.\n\nSố dư hiện tại: ${user?.credits || 0} credit\nSau khi mua: ${(user?.credits || 0) - tokens.find(t => t._id === selectedTokenId)!.value} credit`
              : "Bạn có chắc chắn muốn mua token này không?"
          }
          confirmText="Mua ngay"
          cancelText="Hủy"
          onConfirm={handleConfirmPurchase}
          onCancel={handleCancelPurchase}
        />

        {/* Guide Modal */}
        <GuideModal
          isOpen={showGuideModal}
          categoryName={guideCategory}
          categoryDisplayName={guideCategoryDisplayName}
          guideHtml={guideHtml}
          onClose={() => setShowGuideModal(false)}
        />
      </div>
  );
}

