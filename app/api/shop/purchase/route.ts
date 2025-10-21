import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Token from '@/models/Token';
import User from '@/models/User';
import { requireAuth, AuthenticatedRequest } from '@/lib/middleware';

// POST: Customer mua token
async function handlePurchase(req: AuthenticatedRequest) {
  try {
    await connectDB();
    
    const { tokenId } = await req.json();
    const sessionUser = req.user!;
    
    // Chỉ customer mới được mua
    if (sessionUser.role !== 'customer') {
      return NextResponse.json(
        { error: 'Only customers can purchase tokens' },
        { status: 403 }
      );
    }
    
    // Lấy thông tin user từ database
    const user = await User.findById(sessionUser.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
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
        { error: 'Token đã được mua rồi' },
        { status: 400 }
      );
    }
    
    // Kiểm tra credit
    if (user.credits < token.value) {
      return NextResponse.json(
        { error: `Không đủ credit! Bạn cần ${token.value} credit nhưng chỉ có ${user.credits} credit` },
        { status: 400 }
      );
    }
    
    // Trừ credit của user
    user.credits -= token.value;
    await user.save();
    
    // Cập nhật token
    token.is_taken = true;
    token.customerId = user._id;
    token.purchaseDate = new Date();
    await token.save();
    
    return NextResponse.json({
      success: true,
      message: 'Token purchased successfully',
      token: {
        id: token._id,
        value: token.value,
        purchaseDate: token.purchaseDate
      },
      remainingCredits: user.credits
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to purchase token' },
      { status: 500 }
    );
  }
}

export const POST = requireAuth(handlePurchase);

