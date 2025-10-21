'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { XCircle, ArrowRight, RefreshCw } from 'lucide-react';

function PaymentErrorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderInvoiceNumber = searchParams.get('order');

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="glass-card rounded-2xl p-8 text-center">
          {/* Error Icon */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-12 h-12 text-white" />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-white mb-3">
            Thanh toán thất bại
          </h1>

          {/* Description */}
          <p className="text-gray-300 mb-6">
            Rất tiếc, giao dịch của bạn không thể hoàn thành. Vui lòng thử lại hoặc liên hệ hỗ trợ nếu vấn đề vẫn tiếp diễn.
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

          {/* Error Info */}
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
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
              <RefreshCw className="w-5 h-5" />
              Thử lại
            </button>
            
            <button
              onClick={() => router.push('/shop')}
              className="glass-hover py-3 rounded-xl text-gray-300 font-semibold flex items-center justify-center gap-2"
            >
              Về trang cửa hàng
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    }>
      <PaymentErrorContent />
    </Suspense>
  );
}

