import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Token from '@/models/Token';

// GET all tokens
export async function GET() {
  try {
    await connectDB();
    const tokens = await Token.find({}).sort({ day_create: -1 });
    return NextResponse.json({ success: true, data: tokens }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

// POST - Create new token
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    
    // Create token with defaults
    const tokenData = {
      token: body.token || '',
      day_create: body.day_create || new Date(),
      expiry_days: body.expiry_days || 7,
      is_taken: body.is_taken !== undefined ? body.is_taken : false,
      value: body.value || 20,
      email: body.email || '',
      password: body.password || 'Phu0969727782',
    };

    const token = await Token.create(tokenData);
    return NextResponse.json({ success: true, data: token }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

