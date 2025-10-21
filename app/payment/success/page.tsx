'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, ArrowRight, Wallet } from 'lucide-react';

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderInvoiceNumber = searchParams.get('order');
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/shop');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="glass-card rounded-2xl p-8 text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-white mb-3">
            Thanh toán thành công!
          </h1>

          {/* Description */}
          <p className="text-gray-300 mb-6">
            Đơn hàng của bạn đã được thanh toán thành công. Credit sẽ được cộng vào tài khoản trong vài phút.
          </p>

          {/* Order Info */}
          {orderInvoiceNumber && (
            <div className="glass-card rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-400 mb-1">Mã đơn hàng</p>
              <p className="text-white font-mono font-semibold break-all">
                {orderInvoiceNumber}
              </p>
            </div>
          )}

          {/* Credit Info */}
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-center gap-2 text-green-400 mb-2">
              <Wallet className="w-5 h-5" />
              <span className="font-semibold">Credit đang được xử lý</span>
            </div>
            <p className="text-sm text-gray-300">
              Vui lòng kiểm tra số dư tài khoản sau vài phút
            </p>
          </div>

          {/* Auto redirect */}
          <p className="text-gray-400 text-sm mb-4">
            Tự động chuyển hướng trong {countdown} giây...
          </p>

          {/* Buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.push('/shop')}
              className="glass-button py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2"
            >
              Về trang cửa hàng
              <ArrowRight className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => router.push('/my-tokens')}
              className="glass-hover py-3 rounded-xl text-gray-300 font-semibold"
            >
              Xem token đã mua
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}

