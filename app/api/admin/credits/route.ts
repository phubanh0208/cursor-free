import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, AuthenticatedRequest } from '@/lib/middleware';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

// GET: Lấy danh sách users với credits
async function handleGet(req: AuthenticatedRequest) {
  try {
    await connectDB();
    
    const users = await User.find({}, 'username email role credits createdAt')
      .sort({ createdAt: -1 });
    
    return NextResponse.json({ users });
  } catch (error: any) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST: Cập nhật credits cho user
async function handlePost(req: AuthenticatedRequest) {
  try {
    await connectDB();
    
    const body = await req.json();
    const { userId, credits, action } = body;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    if (action === 'set' && typeof credits === 'number') {
      // Set absolute credits
      user.credits = Math.max(0, credits);
    } else if (action === 'add' && typeof credits === 'number') {
      // Add credits
      user.credits = Math.max(0, user.credits + credits);
    } else if (action === 'subtract' && typeof credits === 'number') {
      // Subtract credits
      user.credits = Math.max(0, user.credits - credits);
    } else {
      return NextResponse.json(
        { error: 'Invalid action or credits value. Action must be "set", "add", or "subtract"' },
        { status: 400 }
      );
    }
    
    await user.save();
    
    return NextResponse.json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        credits: user.credits
      }
    });
  } catch (error: any) {
    console.error('Update credits error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update credits' },
      { status: 500 }
    );
  }
}

export const GET = requireAdmin(handleGet);
export const POST = requireAdmin(handlePost);

