import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  req: NextRequest,
  context: { params: { filename: string } }
) {
  try {
    const { filename } = context.params;
    
    // Security: Only allow alphanumeric, dash, underscore, and .png/.jpg extensions
    if (!/^[a-zA-Z0-9_-]+\.(png|jpg|jpeg)$/.test(filename)) {
      return NextResponse.json(
        { error: 'Invalid filename' },
        { status: 400 }
      );
    }

    const screenshotPath = path.join(process.cwd(), 'public', 'screenshots', filename);
    
    // Check if file exists
    if (!fs.existsSync(screenshotPath)) {
      return NextResponse.json(
        { error: 'Screenshot not found' },
        { status: 404 }
      );
    }

    // Read file
    const fileBuffer = fs.readFileSync(screenshotPath);
    const ext = path.extname(filename).toLowerCase();
    
    // Determine content type
    let contentType = 'image/png';
    if (ext === '.jpg' || ext === '.jpeg') {
      contentType = 'image/jpeg';
    }

    // Return image
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error: any) {
    console.error('Error serving screenshot:', error);
    return NextResponse.json(
      { error: 'Failed to serve screenshot' },
      { status: 500 }
    );
  }
}


