import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Token from '@/models/Token';
import { requireAuth, AuthenticatedRequest } from '@/lib/middleware';
import { isAdmin } from '@/lib/auth';
import { getMailWebhookUrl } from '@/lib/webhook';

// GET: Lấy OTP cho token (chỉ admin hoặc owner của token)
async function handleGet(req: AuthenticatedRequest) {
  try {
    await connectDB();
    
    const user = req.user!;
    const tokenId = req.nextUrl.searchParams.get('tokenId');
    
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
        { error: 'You do not have permission to view this OTP' },
        { status: 403 }
      );
    }
    
    // Kiểm tra token có email không
    if (!token.email) {
      return NextResponse.json(
        { error: 'This token does not have an email configured' },
        { status: 400 }
      );
    }
    
    // Forward request to external webhook
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
      
      const webhookUrl = getMailWebhookUrl(tokenId);
      const response = await fetch(
        webhookUrl,
        { 
          method: 'GET',
          signal: controller.signal 
        }
      );
      
      clearTimeout(timeoutId);
      
      // Handle non-OK responses
      if (!response.ok) {
        const errorText = await response.text();
        return NextResponse.json(
          { 
            error: 'Failed to fetch OTP from webhook',
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
      
      return NextResponse.json({
        tokenId: token._id,
        email: token.email,
        fullText,
        htmlContent,  // New: HTML content
        otpCode,
        timestamp: new Date().toISOString()
      });
      
    } catch (fetchError: any) {
      if (fetchError.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Request timeout', details: 'The webhook took too long to respond' },
          { status: 504 }
        );
      }
      
      return NextResponse.json(
        { 
          error: 'Network error when fetching OTP',
          details: fetchError.message 
        },
        { status: 502 }
      );
    }
    
  } catch (error: any) {
    console.error('OTP fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch OTP' },
      { status: 500 }
    );
  }
}

export const GET = requireAuth(handleGet);

