import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Token from '@/models/Token';

// GET: Customer xem tokens còn available (chưa bán)
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    // Lấy category từ query params (optional filter)
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    
    // Build query
    const query: any = {
      is_taken: false,
      customerId: null
    };
    
    // Nếu có category filter
    if (category) {
      query.category = category.toLowerCase();
    }
    
    // Chỉ lấy tokens chưa được mua (is_taken = false và customerId = null)
    const tokens = await Token.find(query)
      .select('name category value expiry_days day_create')
      .sort({ category: 1, createdAt: -1 });
    
    return NextResponse.json({ tokens });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch available tokens' },
      { status: 500 }
    );
  }
}

