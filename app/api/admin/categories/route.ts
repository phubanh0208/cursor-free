import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';
import { requireAuth, AuthenticatedRequest } from '@/lib/middleware';

// GET: Lấy tất cả categories (admin only)
async function handleGetCategories(req: AuthenticatedRequest) {
  try {
    const user = req.user!;
    
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    await connectDB();
    
    const categories = await Category.find().sort({ name: 1 });
    
    return NextResponse.json({
      success: true,
      categories
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST: Tạo hoặc cập nhật category guide (admin only)
async function handleUpsertCategory(req: AuthenticatedRequest) {
  try {
    const user = req.user!;
    
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    await connectDB();
    
    const { name, displayName, guide } = await req.json();
    
    if (!name || !displayName) {
      return NextResponse.json(
        { error: 'Name and displayName are required' },
        { status: 400 }
      );
    }
    
    // Upsert category
    const category = await Category.findOneAndUpdate(
      { name: name.toLowerCase().trim() },
      {
        name: name.toLowerCase().trim(),
        displayName: displayName.trim(),
        guide: guide || '<p>Chưa có hướng dẫn cho danh mục này.</p>',
        updatedAt: new Date()
      },
      { 
        upsert: true, 
        new: true,
        runValidators: true
      }
    );
    
    return NextResponse.json({
      success: true,
      message: 'Category guide saved successfully',
      category
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to save category guide' },
      { status: 500 }
    );
  }
}

export const GET = requireAuth(handleGetCategories);
export const POST = requireAuth(handleUpsertCategory);

