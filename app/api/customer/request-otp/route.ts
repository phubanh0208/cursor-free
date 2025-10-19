import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Token from '@/models/Token';
import { requireAuth, AuthenticatedRequest } from '@/lib/middleware';
import { isAdmin } from '@/lib/auth';
import { getMailWebhookUrl } from '@/lib/webhook';

// POST: Request OTP - gửi email để nhận OTP mới
async function handlePost(req: AuthenticatedRequest) {
  try {
    await connectDB();
    
    const user = req.user!;
    const body = await req.json();
    const { tokenId, email } = body;
    
    if (!tokenId) {
      return NextResponse.json(
        { error: 'Token ID is required' },
        { status: 400 }
      );
    }
    
    // Tìm token
    const token = await Token.findById(tokenId);
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token not found' },
        { status: 404 }
      );
    }
    
    // Kiểm tra quyền: phải là admin hoặc owner của token
    const isOwner = token.customerId?.toString() === user.userId;
    if (!isAdmin(user) && !isOwner) {
      return NextResponse.json(
        { error: 'You do not have permission to request OTP for this token' },
        { status: 403 }
      );
    }
    
    // Sử dụng email từ request hoặc email của token
    const emailToUse = email || token.email;
    
    if (!emailToUse) {
      return NextResponse.json(
        { error: 'Email is required (provide in request or configure in token)' },
        { status: 400 }
      );
    }
    
    // POST request to webhook với email
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
      
      console.log(`Requesting OTP for email: ${emailToUse}`);
      
      const webhookUrl = getMailWebhookUrl();
      const response = await fetch(
        webhookUrl,
        { 
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            email: emailToUse,
            tokenId: token._id.toString()
          }),
          signal: controller.signal 
        }
      );
      
      clearTimeout(timeoutId);
      
      // Handle non-OK responses
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Webhook error:', response.status, errorText);
        return NextResponse.json(
          { 
            error: 'Failed to request OTP from webhook',
            details: errorText,
            status: response.status 
          },
          { status: 502 }
        );
      }
      
      // Get response text
      const responseText = await response.text();
      
      // Check for empty response
      if (!responseText || responseText.trim().length === 0) {
        return NextResponse.json(
          { 
            error: 'Empty response from webhook',
            details: 'The webhook returned no data'
          },
          { status: 502 }
        );
      }
      
      // Try to parse as JSON
      let data;
      let otpCode = null;
      let fullText = responseText;
      let htmlContent = null;
      
      try {
        data = JSON.parse(responseText);
        // Extract content from various possible fields
        htmlContent = data.html || data.htmlContent || data.htmlBody || null;
        fullText = data.text || data.message || data.content || data.body || responseText;
        
        // If we have HTML, try to extract OTP from it
        const contentToSearch = htmlContent || fullText;
        
        // Extract OTP code (6 digits) - support multiple patterns
        const otpPatterns = [
          /\b\d{6}\b/,                    // Simple 6 digits
          /(?:code|otp|verification)[:\s]*(\d{6})/i,  // "code: 123456"
          /(\d{6})/,                      // Any 6 digits
        ];
        
        for (const pattern of otpPatterns) {
          const match = contentToSearch.match(pattern);
          if (match) {
            otpCode = match[1] || match[0];
            break;
          }
        }
      } catch (parseError) {
        // If JSON parse fails, treat as plain text/HTML
        // Check if it looks like HTML
        if (responseText.includes('<') && responseText.includes('>')) {
          htmlContent = responseText;
        }
        
        // Try to extract OTP from response
        const otpMatch = responseText.match(/\b\d{6}\b/);
        otpCode = otpMatch ? otpMatch[0] : null;
      }
      
      console.log(`OTP requested successfully. Code found: ${otpCode ? 'Yes' : 'No'}`);
      
      return NextResponse.json({
        success: true,
        tokenId: token._id,
        email: emailToUse,
        fullText,
        htmlContent,
        otpCode,
        timestamp: new Date().toISOString()
      });
      
    } catch (fetchError: any) {
      console.error('Fetch error:', fetchError);
      
      if (fetchError.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Request timeout', details: 'The webhook took too long to respond' },
          { status: 504 }
        );
      }
      
      return NextResponse.json(
        { 
          error: 'Network error when requesting OTP',
          details: fetchError.message 
        },
        { status: 502 }
      );
    }
    
  } catch (error: any) {
    console.error('OTP request error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to request OTP' },
      { status: 500 }
    );
  }
}

export const POST = requireAuth(handlePost);

