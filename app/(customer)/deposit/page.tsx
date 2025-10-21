'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ToastContainer';
import { 
  Wallet, 
  CreditCard, 
  DollarSign,
  ArrowRight,
  Info,
  Loader2
} from 'lucide-react';

interface UserData {
  username: string;
  email: string;
  role: 'admin' | 'customer';
  credits: number;
}

// Các gói nạp credit phổ biến
const CREDIT_PACKAGES = [
  { credits: 10, bonus: 0, popular: false },
  { credits: 50, bonus: 0, popular: true },
  { credits: 100, bonus: 5, popular: false },
  { credits: 500, bonus: 50, popular: false },
  { credits: 1000, bonus: 150, popular: false },
];

export default function DepositPage() {
  const router = useRouter();
  const toast = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [paymentData, setPaymentData] = useState<any>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  // Auto submit form khi có paymentData
  useEffect(() => {
    if (paymentData && formRef.current) {
      formRef.current.submit();
    }
  }, [paymentData]);

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
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPackage = (credits: number) => {
    setSelectedPackage(credits);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Chỉ cho phép số
    if (value === '' || /^\d+$/.test(value)) {
      setCustomAmount(value);
      setSelectedPackage(null);
    }
  };

  const getSelectedCredits = (): number => {
    if (selectedPackage !== null) {
      return selectedPackage;
    }
    if (customAmount) {
      return parseInt(customAmount);
    }
    return 0;
  };

  const getBonus = (credits: number): number => {
    const pkg = CREDIT_PACKAGES.find(p => p.credits === credits);
    return pkg?.bonus || 0;
  };

  const getTotalCredits = (): number => {
    const base = getSelectedCredits();
    const bonus = getBonus(base);
    return base + bonus;
  };

  const getAmount = (): number => {
    return getSelectedCredits() * 1000; // 1 credit = 1,000 VND
  };

  const handleDeposit = async () => {
    const credits = getSelectedCredits();
    
    if (credits <= 0) {
      toast.showError('Vui lòng chọn số credit muốn nạp');
      return;
    }

    if (credits < 10) {
      toast.showError('Số credit tối thiểu là 10');
      return;
    }

    if (credits > 10000) {
      toast.showError('Số credit tối đa là 10,000');
      return;
    }

    setProcessing(true);

    try {
      const response = await fetch('/api/customer/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creditAmount: credits }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Không thể tạo đơn nạp credit');
      }

      // Lưu thông tin thanh toán và submit form
      setPaymentData(data.payment);
      
    } catch (error: any) {
      toast.showError(error.message);
      setProcessing(false);
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-3 flex items-center gap-3">
            <Wallet className="w-10 h-10" />
            Nạp Credit
          </h1>
          <p className="text-gray-300 text-lg">
            Nạp credit để mua token và sử dụng dịch vụ
          </p>
        </div>

        {/* Current Balance */}
        <div className="glass-card rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <Wallet className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Số dư hiện tại</p>
                <p className="text-3xl font-bold text-white">
                  {user.credits} <span className="text-xl text-gray-400">credit</span>
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 mb-1">Tỷ giá</p>
              <p className="text-sm text-gray-300">
                1 credit = 1,000 VND
              </p>
            </div>
          </div>
        </div>

        {/* Credit Packages */}
        <div className="glass-card rounded-2xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <CreditCard className="w-6 h-6" />
            Chọn gói nạp
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
            {CREDIT_PACKAGES.map((pkg) => (
              <button
                key={pkg.credits}
                onClick={() => handleSelectPackage(pkg.credits)}
                className={`relative glass-hover rounded-xl p-4 transition-all ${
                  selectedPackage === pkg.credits
                    ? 'ring-2 ring-blue-500 bg-blue-500/10'
                    : ''
                } ${pkg.popular ? 'border-2 border-yellow-500/50' : ''}`}
              >
                {pkg.popular && (
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    PHỔ BIẾN
                  </div>
                )}
                <div className="text-center">
                  <p className="text-2xl font-bold text-white mb-1">
                    {pkg.credits}
                  </p>
                  <p className="text-xs text-gray-400 mb-2">credit</p>
                  {pkg.bonus > 0 && (
                    <div className="bg-green-500/20 text-green-400 text-xs font-semibold px-2 py-1 rounded-full">
                      +{pkg.bonus} bonus
                    </div>
                  )}
                  <p className="text-sm text-gray-300 mt-2">
                    {(pkg.credits * 1000).toLocaleString('vi-VN')} đ
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Custom Amount */}
          <div className="border-t border-gray-700 pt-6">
            <label className="block text-white font-semibold mb-3">
              Hoặc nhập số credit tùy chỉnh
            </label>
            <input
              type="text"
              value={customAmount}
              onChange={handleCustomAmountChange}
              placeholder="Nhập số credit (tối thiểu 10)"
              className="w-full glass-input rounded-xl px-4 py-3 text-white placeholder-gray-500"
            />
            <p className="text-gray-400 text-sm mt-2">
              Giới hạn: 10 - 10,000 credit
            </p>
          </div>
        </div>

        {/* Order Summary */}
        {getSelectedCredits() > 0 && (
          <div className="glass-card rounded-2xl p-6 mb-6">
            <h3 className="text-xl font-bold text-white mb-4">Tóm tắt đơn hàng</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Số credit</span>
                <span className="text-white font-semibold">{getSelectedCredits()} credit</span>
              </div>
              {getBonus(getSelectedCredits()) > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Bonus</span>
                  <span className="text-green-400 font-semibold">+{getBonus(getSelectedCredits())} credit</span>
                </div>
              )}
              <div className="border-t border-gray-700 pt-3 flex justify-between items-center">
                <span className="text-white font-bold text-lg">Tổng credit nhận được</span>
                <span className="text-white font-bold text-2xl">{getTotalCredits()} credit</span>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <DollarSign className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-blue-400 font-semibold mb-1">Số tiền thanh toán</p>
                    <p className="text-white text-3xl font-bold">
                      {getAmount().toLocaleString('vi-VN')} đ
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Info */}
        <div className="glass-card rounded-2xl p-6 mb-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-white font-semibold mb-2">Thông tin thanh toán</h4>
              <ul className="text-gray-300 text-sm space-y-2">
                <li>• Thanh toán qua cổng thanh toán SePay an toàn</li>
                <li>• Hỗ trợ chuyển khoản ngân hàng qua QR Code</li>
                <li>• Credit sẽ được cộng vào tài khoản trong vài phút sau khi thanh toán thành công</li>
                <li>• Vui lòng không tắt trình duyệt cho đến khi hoàn tất thanh toán</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleDeposit}
          disabled={processing || getSelectedCredits() <= 0}
          className="glass-button w-full py-4 rounded-xl text-white font-bold text-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {processing ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              Đang xử lý...
            </>
          ) : (
            <>
              Thanh toán {getAmount().toLocaleString('vi-VN')} đ
              <ArrowRight className="w-6 h-6" />
            </>
          )}
        </button>

        {/* Hidden form for SePay */}
        {paymentData && (
          <form 
            ref={formRef}
            action={paymentData.checkoutURL} 
            method="POST"
            className="hidden"
          >
            {Object.keys(paymentData.checkoutFormfields).map(field => (
              <input 
                key={field}
                type="hidden" 
                name={field} 
                value={paymentData.checkoutFormfields[field]} 
              />
            ))}
          </form>
        )}
      </div>
    </div>
  );
}

