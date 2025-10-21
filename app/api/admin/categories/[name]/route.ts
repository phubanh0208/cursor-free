import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';
import { requireAuth, AuthenticatedRequest } from '@/lib/middleware';

// DELETE: Xóa category guide (admin only)
async function handleDeleteCategory(
  req: AuthenticatedRequest,
  context?: { params: { name: string } }
) {
  try {
    const user = req.user!;
    
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    if (!context?.params) {
      return NextResponse.json(
        { error: 'Missing category name parameter' },
        { status: 400 }
      );
    }

    await connectDB();
    
    const category = await Category.findOneAndDelete({ 
      name: context.params.name.toLowerCase() 
    });
    
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Category guide deleted successfully'
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete category guide' },
      { status: 500 }
    );
  }
}

export const DELETE = requireAuth(handleDeleteCategory);

