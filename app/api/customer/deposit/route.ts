import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import User from '@/models/User';
import { requireAuth, AuthenticatedRequest } from '@/lib/middleware';
// @ts-ignore
import { SePayPgClient } from 'sepay-pg-node';

// Hàm tạo mã đơn hàng duy nhất
function generateOrderInvoiceNumber(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `CREDIT-${timestamp}-${random}`;
}

// POST: Tạo đơn nạp credit
async function handleCreateDeposit(req: AuthenticatedRequest) {
  try {
    await connectDB();
    
    const { creditAmount } = await req.json();
    const sessionUser = req.user!;
    
    // Chỉ customer mới được nạp credit
    if (sessionUser.role !== 'customer') {
      return NextResponse.json(
        { error: 'Only customers can deposit credits' },
        { status: 403 }
      );
    }
    
    // Validate creditAmount
    if (!creditAmount || creditAmount <= 0 || !Number.isInteger(creditAmount)) {
      return NextResponse.json(
        { error: 'Số credit phải là số nguyên dương' },
        { status: 400 }
      );
    }
    
    // Giới hạn số credit tối thiểu và tối đa
    if (creditAmount < 10) {
      return NextResponse.json(
        { error: 'Số credit tối thiểu là 10' },
        { status: 400 }
      );
    }
    
    if (creditAmount > 10000) {
      return NextResponse.json(
        { error: 'Số credit tối đa là 10,000' },
        { status: 400 }
      );
    }
    
    // Lấy thông tin user
    const user = await User.findById(sessionUser.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Tính số tiền VND (1 credit = 1,000 VND)
    const orderAmount = creditAmount * 1000;
    
    // Tạo mã đơn hàng
    const orderInvoiceNumber = generateOrderInvoiceNumber();
    
    // Tạo đơn hàng trong database
    const order = new Order({
      userId: user._id,
      orderInvoiceNumber,
      orderType: 'credit_deposit',
      orderAmount,
      creditAmount,
      orderStatus: 'pending',
      paymentMethod: 'BANK_TRANSFER',
      orderDescription: `Nạp ${creditAmount} credit cho tài khoản ${user.email}`
    });
    
    await order.save();
    
    // Khởi tạo SePay client
    const client = new SePayPgClient({
      env: (process.env.SEPAY_ENV as 'production' | 'sandbox') || 'sandbox',
      merchant_id: process.env.SEPAY_MERCHANT_ID || '',
      secret_key: process.env.SEPAY_SECRET_KEY || ''
    });
    
    // Tạo checkout URL và form fields
    const checkoutURL = client.checkout.initCheckoutUrl();
    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    const checkoutFormfields = client.checkout.initOneTimePaymentFields({
      operation: 'PURCHASE',
      payment_method: 'BANK_TRANSFER',
      order_invoice_number: orderInvoiceNumber,
      order_amount: orderAmount,
      currency: 'VND',
      order_description: order.orderDescription,
      success_url: `${baseUrl}/payment/success?order=${orderInvoiceNumber}`,
      error_url: `${baseUrl}/payment/error?order=${orderInvoiceNumber}`,
      cancel_url: `${baseUrl}/payment/cancel?order=${orderInvoiceNumber}`,
    });
    
    console.log('🔐 ===== SEAPAY FORM FIELDS =====');
    console.log('🔐 Form fields:', JSON.stringify(checkoutFormfields, null, 2));
    console.log('🔐 Checkout URL:', checkoutURL);
    
    return NextResponse.json({
      success: true,
      order: {
        id: order._id,
        orderInvoiceNumber: order.orderInvoiceNumber,
        creditAmount: order.creditAmount,
        orderAmount: order.orderAmount,
        orderStatus: order.orderStatus
      },
      payment: {
        checkoutURL,
        checkoutFormfields
      }
    });
  } catch (error: any) {
    console.error('Create deposit error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create deposit order' },
      { status: 500 }
    );
  }
}

export const POST = requireAuth(handleCreateDeposit);

