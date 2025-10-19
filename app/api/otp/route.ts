import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Token from '@/models/Token';
import { getMailWebhookUrl } from '@/lib/webhook';

// GET OTP for a token
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const searchParams = request.nextUrl.searchParams;
    const tokenId = searchParams.get('id');
    
    if (!tokenId) {
      return NextResponse.json(
        { success: false, error: 'Token ID is required' },
        { status: 400 }
      );
    }
    
    // Verify token exists
    const token = await Token.findById(tokenId);
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token not found' },
        { status: 404 }
      );
    }
    
    // Forward request to n8n webhook
    const webhookUrl = getMailWebhookUrl(tokenId);
    
    let response;
    try {
      response = await fetch(webhookUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add timeout
        signal: AbortSignal.timeout(30000), // 30 seconds
      });
    } catch (fetchError: any) {
      console.error('Fetch error:', fetchError);
      return NextResponse.json(
        { 
          success: false, 
          error: fetchError.name === 'TimeoutError' 
            ? 'Request timeout - Webhook took too long to respond' 
            : `Network error: ${fetchError.message}` 
        },
        { status: 500 }
      );
    }
    
    if (!response.ok) {
      let errorMessage = `Webhook returned status ${response.status}`;
      try {
        const errorText = await response.text();
        if (errorText) {
          errorMessage += `: ${errorText}`;
        }
      } catch (e) {
        // Ignore error reading error response
      }
      
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: response.status }
      );
    }
    
    // Try to get response text first
    let responseText = '';
    try {
      responseText = await response.text();
    } catch (e) {
      return NextResponse.json(
        { success: false, error: 'Failed to read response from webhook' },
        { status: 500 }
      );
    }
    
    // Check if response is empty
    if (!responseText || responseText.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Webhook returned empty response' },
        { status: 500 }
      );
    }
    
    // Try to parse JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Response text:', responseText);
      
      // Try to extract OTP from plain text response
      const otpMatch = responseText.match(/\b\d{6}\b/);
      if (otpMatch) {
        return NextResponse.json({
          success: true,
          data: {
            tokenId,
            email: token.email,
            fullText: responseText,
            otpCode: otpMatch[0],
            timestamp: new Date().toISOString(),
          },
        });
      }
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid JSON response from webhook',
          details: responseText.substring(0, 200) // First 200 chars for debugging
        },
        { status: 500 }
      );
    }
    
    // Extract OTP code from text using regex
    let otpCode = null;
    let fullText = '';
    
    if (data && typeof data === 'object') {
      // Try different possible field names
      fullText = data.text || data.message || data.content || data.body || JSON.stringify(data);
      
      if (fullText) {
        // Match 6-digit code pattern
        const match = fullText.match(/\b\d{6}\b/);
        if (match) {
          otpCode = match[0];
        }
      }
    } else if (typeof data === 'string') {
      fullText = data;
      const match = fullText.match(/\b\d{6}\b/);
      if (match) {
        otpCode = match[0];
      }
    }
    
    return NextResponse.json({
      success: true,
      data: {
        tokenId,
        email: token.email,
        fullText,
        otpCode,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Error fetching OTP:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

