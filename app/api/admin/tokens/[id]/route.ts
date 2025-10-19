import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Token from '@/models/Token';
import { requireAdmin } from '@/lib/middleware';

// GET: Admin xem chi tiết token
async function handleGet(
  req: NextRequest,
  context?: { params: { id: string } }
) {
  if (!context?.params) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  const { params } = context;
  try {
    await connectDB();
    const token = await Token.findById(params.id).populate('customerId', 'email username');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ token });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch token' },
      { status: 500 }
    );
  }
}

// PUT: Admin cập nhật token
async function handlePut(
  req: NextRequest,
  context?: { params: { id: string } }
) {
  if (!context?.params) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  const { params } = context;
  try {
    await connectDB();
    const body = await req.json();
    
    const token = await Token.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    );
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ token });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update token' },
      { status: 500 }
    );
  }
}

// DELETE: Admin xóa token
async function handleDelete(
  req: NextRequest,
  context?: { params: { id: string } }
) {
  if (!context?.params) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  const { params } = context;
  try {
    await connectDB();
    
    // Validate ObjectId
    if (!params.id || params.id.length !== 24) {
      return NextResponse.json(
        { error: 'Invalid token ID' },
        { status: 400 }
      );
    }
    
    const token = await Token.findByIdAndDelete(params.id);
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token not found' },
        { status: 404 }
      );
    }
    
    console.log('Token deleted successfully:', params.id);
    return NextResponse.json({ success: true, message: 'Token deleted successfully' });
  } catch (error: any) {
    console.error('Delete token error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to delete token',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

export const GET = requireAdmin(handleGet);
export const PUT = requireAdmin(handlePut);
export const DELETE = requireAdmin(handleDelete);

