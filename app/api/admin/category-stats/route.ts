import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Token from '@/models/Token';
import { requireAdmin } from '@/lib/middleware';

// GET: Thống kê theo category
async function handleGet(req: NextRequest) {
  try {
    await connectDB();
    
    // Aggregate statistics by category
    const stats = await Token.aggregate([
      {
        $group: {
          _id: '$category',
          totalProducts: { $sum: 1 },
          availableProducts: {
            $sum: {
              $cond: [{ $eq: ['$is_taken', false] }, 1, 0]
            }
          },
          soldProducts: {
            $sum: {
              $cond: [{ $eq: ['$is_taken', true] }, 1, 0]
            }
          },
          totalRevenue: {
            $sum: {
              $cond: [{ $eq: ['$is_taken', true] }, '$value', 0]
            }
          },
          emails: { $addToSet: '$email' }
        }
      },
      {
        $project: {
          _id: 0,
          category: '$_id',
          totalProducts: 1,
          availableProducts: 1,
          soldProducts: 1,
          totalRevenue: 1,
          uniqueEmails: {
            $size: {
              $filter: {
                input: '$emails',
                as: 'email',
                cond: { $and: [{ $ne: ['$$email', ''] }, { $ne: ['$$email', null] }] }
              }
            }
          }
        }
      },
      {
        $sort: { totalProducts: -1 }
      }
    ]);
    
    return NextResponse.json({ stats });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch category stats' },
      { status: 500 }
    );
  }
}

export const GET = requireAdmin(handleGet);

