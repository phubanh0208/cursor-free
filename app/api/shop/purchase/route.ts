import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Token from '@/models/Token';
import { requireAuth, AuthenticatedRequest } from '@/lib/middleware';

// POST: Customer mua token
async function handlePurchase(req: AuthenticatedRequest) {
  try {
    await connectDB();
    
    const { tokenId } = await req.json();
    const user = req.user!;
    
    // Chỉ customer mới được mua
    if (user.role !== 'customer') {
      return NextResponse.json(
        { error: 'Only customers can purchase tokens' },
        { status: 403 }
      );
    }
    
    // Tìm token
    const token = await Token.findById(tokenId);
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token not found' },
        { status: 404 }
      );
    }
    
    // Kiểm tra token còn available không
    if (token.is_taken || token.customerId) {
      return NextResponse.json(
        { error: 'Token already purchased' },
        { status: 400 }
      );
    }
    
    // Cập nhật token
    token.is_taken = true;
    token.customerId = user.userId;
    token.purchaseDate = new Date();
    await token.save();
    
    return NextResponse.json({
      success: true,
      message: 'Token purchased successfully',
      token: {
        id: token._id,
        value: token.value,
        purchaseDate: token.purchaseDate
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to purchase token' },
      { status: 500 }
    );
  }
}

export const POST = requireAuth(handlePurchase);

