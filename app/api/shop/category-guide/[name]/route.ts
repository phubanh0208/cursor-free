import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';

// GET: Lấy hướng dẫn của category (public)
export async function GET(
  req: NextRequest,
  { params }: { params: { name: string } }
) {
  try {
    await connectDB();
    
    const category = await Category.findOne({ 
      name: params.name.toLowerCase() 
    });
    
    if (!category) {
      return NextResponse.json({
        success: true,
        guide: '<p>Chưa có hướng dẫn cho danh mục này.</p>',
        categoryName: params.name
      });
    }
    
    return NextResponse.json({
      success: true,
      guide: category.guide,
      displayName: category.displayName,
      categoryName: category.name
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch category guide' },
      { status: 500 }
    );
  }
}

