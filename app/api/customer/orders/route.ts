import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { requireAuth, AuthenticatedRequest } from '@/lib/middleware';

// GET: Lấy danh sách đơn hàng của customer
async function handleGetOrders(req: AuthenticatedRequest) {
  try {
    await connectDB();
    
    const sessionUser = req.user!;
    
    // Chỉ customer mới được xem đơn hàng của mình
    if (sessionUser.role !== 'customer') {
      return NextResponse.json(
        { error: 'Only customers can view their orders' },
        { status: 403 }
      );
    }
    
    // Lấy query parameters
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status'); // pending, paid, failed, cancelled
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = parseInt(searchParams.get('skip') || '0');
    
    // Build query
    const query: any = { userId: sessionUser.userId };
    
    if (status && ['pending', 'paid', 'failed', 'cancelled'].includes(status)) {
      query.orderStatus = status;
    }
    
    // Lấy đơn hàng
    const orders = await Order.find(query)
      .sort({ createdAt: -1 }) // Mới nhất trước
      .limit(Math.min(limit, 100)) // Tối đa 100
      .skip(skip)
      .select('-ipnData') // Không trả về ipnData (quá nhiều thông tin)
      .lean();
    
    // Đếm tổng số đơn hàng
    const total = await Order.countDocuments(query);
    
    return NextResponse.json({
      success: true,
      orders: orders.map(order => ({
        id: order._id,
        orderInvoiceNumber: order.orderInvoiceNumber,
        orderType: order.orderType,
        creditAmount: order.creditAmount,
        orderAmount: order.orderAmount,
        orderStatus: order.orderStatus,
        paymentMethod: order.paymentMethod,
        transactionId: order.transactionId,
        transactionDate: order.transactionDate,
        orderDescription: order.orderDescription,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      })),
      pagination: {
        total,
        limit,
        skip,
        hasMore: skip + orders.length < total
      }
    });
  } catch (error: any) {
    console.error('Get orders error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get orders' },
      { status: 500 }
    );
  }
}

export const GET = requireAuth(handleGetOrders);

