import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Token from '@/models/Token';
import { requireAuth, AuthenticatedRequest } from '@/lib/middleware';

// GET: Customer xem tokens đã mua
async function handleGet(req: AuthenticatedRequest) {
  try {
    await connectDB();
    
    const user = req.user!;
    
    // Chỉ customer mới có my-tokens
    if (user.role !== 'customer') {
      return NextResponse.json(
        { error: 'Only customers can view their tokens' },
        { status: 403 }
      );
    }
    
    // Lấy tất cả tokens của customer này
    const tokens = await Token.find({
      customerId: user.userId
    }).sort({ purchaseDate: -1 });
    
    return NextResponse.json({ tokens });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch your tokens' },
      { status: 500 }
    );
  }
}

export const GET = requireAuth(handleGet);

