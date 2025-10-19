import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Token from '@/models/Token';
import { requireAdmin } from '@/lib/middleware';

// GET: Lấy tất cả đơn hàng (tokens đã bán)
async function handleGet(req: NextRequest) {
  try {
    await connectDB();
    
    // Lấy tất cả tokens đã bán, populate thông tin customer
    const orders = await Token.find({
      is_taken: true,
      customerId: { $ne: null }
    })
    .populate('customerId', 'email username')
    .sort({ purchaseDate: -1 });
    
    return NextResponse.json({ orders });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export const GET = requireAdmin(handleGet);

