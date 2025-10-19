import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Token from '@/models/Token';

// GET: Lấy danh sách tất cả categories có sẵn
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    // Lấy distinct categories từ tokens còn available
    const categories = await Token.distinct('category', {
      is_taken: false,
      customerId: null
    });
    
    return NextResponse.json({ categories });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

