import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Token from '@/models/Token';
import { requireAdmin } from '@/lib/middleware';

// GET: Admin xem tất cả tokens
async function handleGet(req: NextRequest) {
  try {
    await connectDB();
    const tokens = await Token.find().populate('customerId', 'email username').sort({ createdAt: -1 });
    return NextResponse.json({ tokens });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch tokens' },
      { status: 500 }
    );
  }
}

// POST: Admin tạo token mới
async function handlePost(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    
    // Validate required fields
    if (!body.name || !body.category) {
      return NextResponse.json(
        { error: 'Name and category are required' },
        { status: 400 }
      );
    }
    
    const tokenData = {
      name: body.name,
      category: body.category,
      token: body.token || '',
      email: body.email || '',
      password: body.password || 'Phu0969727782',
      expiry_days: body.expiry_days || 7,
      value: body.value || 20,
      is_taken: false,
    };
    
    const newToken = await Token.create(tokenData);
    return NextResponse.json({ token: newToken }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create token' },
      { status: 500 }
    );
  }
}

export const GET = requireAdmin(handleGet);
export const POST = requireAdmin(handlePost);

