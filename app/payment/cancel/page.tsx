'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, ArrowRight, ShoppingBag } from 'lucide-react';

function PaymentCancelContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderInvoiceNumber = searchParams.get('order');

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="glass-card rounded-2xl p-8 text-center">
          {/* Cancel Icon */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-12 h-12 text-white" />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-white mb-3">
            Thanh toán đã hủy
          </h1>

          {/* Description */}
          <p className="text-gray-300 mb-6">
            Bạn đã hủy giao dịch thanh toán. Nếu đây là nhầm lẫn, bạn có thể thử lại bất cứ lúc nào.
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

          {/* Info */}
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-300">
              Không có khoản tiền nào bị trừ từ tài khoản của bạn
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.push('/shop')}
              className="glass-button py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-5 h-5" />
              Tiếp tục mua sắm
            </button>
            
            <button
              onClick={() => router.push('/my-tokens')}
              className="glass-hover py-3 rounded-xl text-gray-300 font-semibold flex items-center justify-center gap-2"
            >
              Xem token đã mua
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentCancelPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    }>
      <PaymentCancelContent />
    </Suspense>
  );
}

