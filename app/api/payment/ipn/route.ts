import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import User from '@/models/User';

/**
 * IPN (Instant Payment Notification) Webhook từ SePay
 * Endpoint này nhận thông báo khi thanh toán thành công
 * 
 * JSON format từ SePay:
 * {
 *   "timestamp": 1759134682,
 *   "notification_type": "ORDER_PAID",
 *   "order": {
 *     "id": "20",
 *     "order_id": "NQD-68DA43D73C1A5",
 *     "order_status": "CAPTURED",
 *     "order_currency": "VND",
 *     "order_amount": "100000.00",
 *     "order_invoice_number": "INV-1759134677",
 *     ...
 *   },
 *   "transaction": {
 *     "id": "11",
 *     "payment_method": "BANK_TRANSFER",
 *     "transaction_id": "68da43da2d9de",
 *     "transaction_type": "PAYMENT",
 *     "transaction_date": "2025-09-29 15:31:22",
 *     "transaction_status": "APPROVED",
 *     "transaction_amount": "100000",
 *     ...
 *   }
 * }
 */

export async function POST(req: NextRequest) {
  try {
    console.log('🚀 ===== IPN WEBHOOK STARTED =====');
    console.log('⏰ Timestamp:', new Date().toISOString());
    console.log('🌐 Request URL:', req.url);
    console.log('📋 Headers:', Object.fromEntries(req.headers.entries()));
    
    await connectDB();
    console.log('✅ Database connected');
    
    // Parse IPN data từ SePay
    const ipnData = await req.json();
    
    console.log('📥 ===== IPN DATA RECEIVED =====');
    console.log('📥 Full IPN payload:', JSON.stringify(ipnData, null, 2));
    console.log('📥 Notification type:', ipnData.notification_type);
    console.log('📥 Order invoice number:', ipnData.order?.order_invoice_number);
    console.log('📥 Order status:', ipnData.order?.order_status);
    console.log('📥 Transaction status:', ipnData.transaction?.transaction_status);
    
    // Kiểm tra notification type - SePay có thể gửi ORDER_PAID hoặc PAYMENT_SUCCESS
    const validNotificationTypes = ['ORDER_PAID', 'PAYMENT_SUCCESS'];
    if (!validNotificationTypes.includes(ipnData.notification_type)) {
      console.log('⚠️ Invalid notification type:', ipnData.notification_type);
      return NextResponse.json({ 
        success: false, 
        message: 'Notification type not supported' 
      }, { status: 400 });
    }
    
    console.log('✅ Valid notification type:', ipnData.notification_type);
    
    // Lấy thông tin đơn hàng
    const orderInvoiceNumber = ipnData.order?.order_invoice_number;
    const orderStatus = ipnData.order?.order_status;
    const transactionStatus = ipnData.transaction?.transaction_status;
    
    console.log('🔍 ===== ORDER LOOKUP =====');
    console.log('🔍 Order invoice number:', orderInvoiceNumber);
    console.log('🔍 Order status from IPN:', orderStatus);
    console.log('🔍 Transaction status from IPN:', transactionStatus);
    
    if (!orderInvoiceNumber) {
      console.error('❌ Missing order_invoice_number in IPN data');
      return NextResponse.json({ 
        success: false, 
        message: 'Missing order_invoice_number' 
      }, { status: 400 });
    }
    
    console.log('🔍 Looking for order with invoice number:', orderInvoiceNumber);
    
    // Tìm đơn hàng trong database
    const order = await Order.findOne({ orderInvoiceNumber });
    
    if (!order) {
      console.error('❌ Order not found in database:', orderInvoiceNumber);
      console.error('💡 Tip: Make sure this order was created from /api/customer/deposit');
      console.error('💡 Order invoice numbers from our system start with "CREDIT-"');
      
      // Nếu là test IPN từ SePay dashboard, return success để không block
      if (ipnData.order?.custom_data?.webhook_test || ipnData.order?.custom_data?.test_mode) {
        console.log('⚠️ This is a webhook test from SePay dashboard - ignoring');
        return NextResponse.json({ 
          success: true, 
          message: 'Webhook test received and ignored' 
        }, { status: 200 });
      }
      
      return NextResponse.json({ 
        success: false, 
        message: 'Order not found' 
      }, { status: 404 });
    }
    
    console.log('✅ ===== ORDER FOUND =====');
    console.log('✅ Order ID:', order._id);
    console.log('✅ Credit amount:', order.creditAmount);
    console.log('✅ Current status:', order.orderStatus);
    console.log('✅ User ID:', order.userId);
    
    // Kiểm tra nếu đơn hàng đã được xử lý rồi
    if (order.orderStatus === 'paid') {
      console.log('⚠️ Order already paid:', orderInvoiceNumber);
      return NextResponse.json({ 
        success: true, 
        message: 'Order already processed' 
      }, { status: 200 });
    }
    
    console.log('💳 ===== PAYMENT VALIDATION =====');
    console.log('💳 Checking payment status...');
    console.log('💳 Order status from IPN:', orderStatus);
    console.log('💳 Transaction status from IPN:', transactionStatus);
    console.log('💳 Required: orderStatus=CAPTURED AND transactionStatus=APPROVED');
    
    // Kiểm tra trạng thái thanh toán
    if (orderStatus === 'CAPTURED' && transactionStatus === 'APPROVED') {
      console.log('✅ ===== PAYMENT SUCCESSFUL =====');
      console.log('✅ Payment successful for order:', orderInvoiceNumber);
      
      console.log('💾 ===== UPDATING ORDER =====');
      // Cập nhật trạng thái đơn hàng
      order.orderStatus = 'paid';
      order.transactionId = ipnData.transaction?.transaction_id;
      order.transactionDate = ipnData.transaction?.transaction_date 
        ? new Date(ipnData.transaction.transaction_date) 
        : new Date();
      order.ipnData = ipnData;
      
      console.log('💾 Order status updated to: paid');
      console.log('💾 Transaction ID:', order.transactionId);
      console.log('💾 Transaction date:', order.transactionDate);
      
      await order.save();
      console.log('✅ Order saved to database');
      
      console.log('👤 ===== UPDATING USER CREDITS =====');
      // Cộng credit cho user
      const user = await User.findById(order.userId);
      
      if (!user) {
        console.error('❌ User not found for order:', orderInvoiceNumber);
        return NextResponse.json({ 
          success: false, 
          message: 'User not found' 
        }, { status: 404 });
      }
      
      console.log('👤 User found:', user.email);
      console.log('👤 Current credits:', user.credits);
      
      // Cộng credit
      const oldCredits = user.credits;
      user.credits += order.creditAmount;
      await user.save();
      
      console.log('💰 ===== CREDITS ADDED =====');
      console.log(`💰 Added ${order.creditAmount} credits to user ${user.email}`);
      console.log(`💰 Old balance: ${oldCredits} -> New balance: ${user.credits}`);
      
      console.log('🎉 ===== IPN PROCESSING COMPLETE =====');
      console.log('🎉 Returning success response...');
      
      return NextResponse.json({ 
        success: true, 
        message: 'Payment processed successfully',
        order: {
          orderInvoiceNumber: order.orderInvoiceNumber,
          creditAmount: order.creditAmount,
          orderStatus: order.orderStatus
        }
      }, { status: 200 });
      
    } else {
      // Thanh toán thất bại
      console.log('❌ ===== PAYMENT FAILED =====');
      console.log('❌ Payment failed for order:', orderInvoiceNumber);
      console.log('❌ Order status:', orderStatus);
      console.log('❌ Transaction status:', transactionStatus);
      console.log('❌ Reason: Payment validation failed');
      
      order.orderStatus = 'failed';
      order.ipnData = ipnData;
      await order.save();
      
      return NextResponse.json({ 
        success: false, 
        message: 'Payment failed',
        order: {
          orderInvoiceNumber: order.orderInvoiceNumber,
          orderStatus: order.orderStatus
        }
      }, { status: 400 });
    }
    
  } catch (error: any) {
    console.error('💥 ===== IPN ERROR =====');
    console.error('💥 IPN processing error:', error);
    console.error('💥 Error message:', error.message);
    console.error('💥 Error stack:', error.stack);
    console.error('💥 ===== END ERROR =====');
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'IPN processing failed' 
      },
      { status: 500 }
    );
  }
}

