import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthenticatedRequest } from '@/lib/middleware';
import { getMailWebhookUrl } from '@/lib/webhook';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

async function handlePost(req: AuthenticatedRequest) {
  try {
    const user = req.user!;
    
    // Check and deduct credits
    await connectDB();
    const userDoc = await User.findById(user.userId);
    
    if (!userDoc) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    if (userDoc.credits < 1) {
      return NextResponse.json(
        { error: 'Không đủ credit. Bạn cần ít nhất 1 credit để lấy OTP.' },
        { status: 403 }
      );
    }
    
    // Deduct 1 credit
    userDoc.credits -= 1;
    await userDoc.save();
    
    const body = await req.json();
    const { email } = body;

    if (!email || !email.trim()) {
      // Refund credit if email is invalid
      userDoc.credits += 1;
      await userDoc.save();
      
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Forward to webhook
    const webhookUrl = getMailWebhookUrl();
    
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (!response.ok) {
        // Refund credit on webhook error
        userDoc.credits += 1;
        await userDoc.save();
        
        const errorText = await response.text();
        return NextResponse.json(
          { error: `Webhook error: ${errorText}` },
          { status: response.status }
        );
      }

      const data = await response.json();
      
      // Add remaining credits to response
      return NextResponse.json({
        ...data,
        remainingCredits: userDoc.credits
      });
      
    } catch (webhookError: any) {
      // Refund credit on network error
      userDoc.credits += 1;
      await userDoc.save();
      
      throw webhookError;
    }

  } catch (error: any) {
    console.error('Request OTP email error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to request OTP' },
      { status: 500 }
    );
  }
}

export const POST = requireAuth(handlePost); // Allow all authenticated users

