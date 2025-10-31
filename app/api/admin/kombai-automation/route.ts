import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthenticatedRequest } from '@/lib/middleware';
import { chromium } from 'playwright';
import { getMailWebhookUrl } from '@/lib/webhook';
import connectDB from '@/lib/mongodb';
import Token from '@/models/Token';
import User from '@/models/User';
import fs from 'fs';
import path from 'path';

interface AutomationRequest {
  email: string;
  password: string;
  ide: 'cursor' | 'vscode';
  signupUrl?: string;
}

// Helper: Call webhook to get email with retry
async function getEmailContent(email: string, maxRetries: number = 5): Promise<any> {
  const webhookUrl = getMailWebhookUrl();
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[Attempt ${attempt}/${maxRetries}] Calling webhook...`);
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Webhook returned ${response.status}: ${errorText}`);
      }

      // Get response text first
      const responseText = await response.text();
      
      // Check if response is empty
      if (!responseText || responseText.trim().length === 0) {
        throw new Error('Webhook returned empty response');
      }

      // Try to parse JSON
      try {
        const data = JSON.parse(responseText);
        
        // Check if email has content
        if (data.html && data.html.trim().length > 0) {
          console.log(`[Attempt ${attempt}] Success! Email received.`);
          return data;
        } else {
          throw new Error('Email HTML is empty');
        }
      } catch (parseError) {
        throw new Error(`Failed to parse webhook response: ${responseText.substring(0, 100)}...`);
      }
    } catch (error: any) {
      lastError = error;
      console.log(`[Attempt ${attempt}] Failed: ${error.message}`);
      
      // Don't wait after last attempt
      if (attempt < maxRetries) {
        const delaySeconds = 3 + Math.random(); // 3-4 seconds random delay
        console.log(`[Attempt ${attempt}] Waiting ${delaySeconds.toFixed(1)}s before retry...`);
        await new Promise(resolve => setTimeout(resolve, delaySeconds * 1000));
      }
    }
  }

  throw new Error(`Failed after ${maxRetries} attempts. Last error: ${lastError?.message}`);
}

// Helper: Extract confirmation link from HTML
function extractConfirmationLink(html: string): string | null {
  const regex = /https:\/\/auth\.agent\.kombai\.com\/confirm_email\?t=[^"]+/;
  const match = html.match(regex);
  return match ? match[0] : null;
}

async function handlePost(req: AuthenticatedRequest) {
  const logs: string[] = [];
  const screenshots: string[] = []; // Store screenshot paths
  const timestamp = Date.now();
  const user = req.user!; // Get authenticated user
  
  const addLog = (message: string) => {
    logs.push(`[${new Date().toISOString()}] ${message}`);
    console.log(message);
  };
  
  // Check and deduct credits
  try {
    await connectDB();
    const userDoc = await User.findById(user.userId);
    
    if (!userDoc) {
      return NextResponse.json({
        success: false,
        error: 'User not found',
        logs: ['❌ ERROR: User not found']
      }, { status: 404 });
    }
    
    if (userDoc.credits < 1) {
      return NextResponse.json({
        success: false,
        error: 'Không đủ credit. Bạn cần ít nhất 1 credit để chạy automation.',
        logs: ['❌ ERROR: Insufficient credits']
      }, { status: 403 });
    }
    
    // Deduct 1 credit
    userDoc.credits -= 1;
    await userDoc.save();
    
    addLog(`✅ Credit deducted. Remaining credits: ${userDoc.credits}`);
  } catch (dbError: any) {
    return NextResponse.json({
      success: false,
      error: 'Database error: ' + dbError.message,
      logs: [`❌ ERROR: ${dbError.message}`]
    }, { status: 500 });
  }
  
  const saveScreenshot = async (screenshot: Buffer, name: string): Promise<string> => {
    const publicDir = path.join(process.cwd(), 'public', 'screenshots');
    
    // Create directory if not exists
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    const filename = `${timestamp}-${name}.png`;
    const filepath = path.join(publicDir, filename);
    
    // Save file
    fs.writeFileSync(filepath, screenshot);
    
    // Return API URL (served via API endpoint, not static public folder)
    const publicUrl = `/api/screenshots/${filename}`;
    screenshots.push(publicUrl);
    return publicUrl;
  };

  try {
    const body: AutomationRequest = await req.json();
    const { email, password, ide, signupUrl: customSignupUrl } = body;

    if (!email || !password || !ide) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    addLog('🚀 Starting Kombai automation...');
    
    // Use custom signup URL or build default based on IDE
    let signupUrl: string;
    
    if (customSignupUrl && customSignupUrl.trim()) {
      signupUrl = customSignupUrl.trim();
      addLog(`📍 Using custom signup URL`);
    } else {
      const redirectUri = ide === 'cursor' 
        ? 'cursor://kombai.kombai/auth-callback'
        : 'vscode://kombai.kombai/auth-callback';
      
      signupUrl = `https://agent.kombai.com/vscode-connect?redirectUri=${encodeURIComponent(redirectUri)}&code=T1JXQVpCbFVQQXFVOFFCUg==&from=vscode&type=new`;
      addLog(`📍 Using default signup URL for ${ide.toUpperCase()}`);
    }
    
    addLog(`📍 IDE: ${ide.toUpperCase()}`);
    addLog(`📧 Email: ${email}`);

    // Launch browser
    addLog('🌐 Launching browser...');
    const browser = await chromium.launch({
      headless: true,
      // Use system Chromium in Docker (Alpine Linux)
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });

    // Create new context with no storage (incognito mode)
    // This ensures no cookies/cache from previous sessions
    const context = await browser.newContext({
      storageState: undefined, // No stored cookies/sessions
      ignoreHTTPSErrors: true,
      bypassCSP: true,
      viewport: { width: 1280, height: 720 }, // Set explicit viewport for headless
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });
    const page = await context.newPage();
    
    // Clear any existing cookies/storage
    await context.clearCookies();
    
    addLog('   → Using fresh browser context (no cookies/cache/sessions)');

    try {
      // Step 1: Navigate to signup with retry
      addLog('📄 Step 1: Navigating to signup page...');
      addLog(`   URL: ${signupUrl}`);
      
      let pageLoaded = false;
      const maxNavigationRetries = 3;
      
      for (let attempt = 1; attempt <= maxNavigationRetries; attempt++) {
        try {
          addLog(`   [Attempt ${attempt}/${maxNavigationRetries}] Navigating...`);
          
          await page.goto(signupUrl, {
            timeout: 60000,
            waitUntil: 'domcontentloaded'
          });
          
          await page.waitForLoadState('domcontentloaded', { timeout: 30000 });
          await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {
            addLog('   ⚠️  networkidle timeout, continuing anyway...');
          });
          
          pageLoaded = true;
          addLog('   ✅ Page navigation successful');
          break;
        } catch (error: any) {
          addLog(`   ⚠️  Attempt ${attempt} failed: ${error.message.substring(0, 100)}`);
          if (attempt < maxNavigationRetries) {
            addLog(`   ⏳ Retrying in 3s...`);
            await page.waitForTimeout(3000);
          }
        }
      }
      
      if (!pageLoaded) {
        throw new Error('Failed to load signup page after 3 attempts');
      }
      
      // Clear localStorage and sessionStorage to ensure fresh signup
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      }).catch(() => {
        addLog('   ⚠️  Could not clear storage, continuing...');
      });
      
      // Log current URL after navigation
      const currentUrl = page.url();
      addLog(`   Current URL: ${currentUrl}`);
      
      // Take screenshot of initial page
      const screenshot1 = await page.screenshot({ fullPage: false, type: 'png' });
      const screenshot1Url = await saveScreenshot(screenshot1, '1-initial-page');
      addLog(`   → Screenshot saved: ${screenshot1Url}`);
      
      // Check page title
      const pageTitle = await page.title();
      addLog(`   Page Title: ${pageTitle}`);
      
      // Check if already logged in and logout if needed
      if (!currentUrl.includes('signup') && !currentUrl.includes('login')) {
        addLog('⚠️  Already logged in, attempting logout...');
        
        let loggedOut = false;
        
        // Try to find and click logout button
        try {
          const logoutButton = page.locator('button:has-text("Logout"), a:has-text("Logout"), button:has-text("Log out"), a:has-text("Log out")').first();
          const isVisible = await logoutButton.isVisible({ timeout: 3000 }).catch(() => false);
          
          if (isVisible) {
            await logoutButton.click();
            await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});
            await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
            addLog('   ✅ Logged out successfully');
            loggedOut = true;
          }
        } catch (logoutError) {
          addLog('   ⚠️  Could not find logout button');
        }
        
        if (!loggedOut) {
          addLog('   ⚠️  Clearing cookies and reloading...');
        }
        
        // Clear everything again and reload signup page with retry
        await context.clearCookies();
        await page.evaluate(() => {
          localStorage.clear();
          sessionStorage.clear();
        }).catch(() => {});
        
        // Retry reload
        for (let attempt = 1; attempt <= 2; attempt++) {
          try {
            await page.goto(signupUrl, { 
              timeout: 60000, 
              waitUntil: 'domcontentloaded' 
            });
            await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});
            addLog('   ✅ Reloaded signup page');
            break;
          } catch (reloadError: any) {
            if (attempt === 2) throw reloadError;
            await page.waitForTimeout(2000);
          }
        }
      }
      
      addLog('✅ Signup page loaded (storage cleared)');

      // Step 2: Fill form with wait and retry
      addLog('✍️  Step 2: Filling credentials...');
      addLog(`   Email: ${email}`);
      addLog(`   Password: ${'*'.repeat(password.length)}`);
      
      // Wait for page to be fully loaded and interactive
      addLog('   ⏳ Waiting for page to be fully interactive...');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000); // Additional wait for JS to render form
      
      // Retry logic for finding form fields
      let emailFieldFound = false;
      let passwordFieldFound = false;
      const maxFieldRetries = 5;
      
      for (let attempt = 1; attempt <= maxFieldRetries; attempt++) {
        addLog(`   [Attempt ${attempt}/${maxFieldRetries}] Looking for form fields...`);
        
        try {
          // Try to wait for both fields
          await Promise.all([
            page.waitForSelector('input[type="email"]', { state: 'visible', timeout: 5000 }),
            page.waitForSelector('input[type="password"]', { state: 'visible', timeout: 5000 }),
          ]);
          
          // Double check they exist
          const emailCount = await page.locator('input[type="email"]').count();
          const passwordCount = await page.locator('input[type="password"]').count();
          
          if (emailCount > 0 && passwordCount > 0) {
            emailFieldFound = true;
            passwordFieldFound = true;
            addLog(`   ✅ Found ${emailCount} email field(s) and ${passwordCount} password field(s)`);
            break;
          }
        } catch (e) {
          addLog(`   ⚠️  Fields not found yet, waiting...`);
        }
        
        if (attempt < maxFieldRetries) {
          await page.waitForTimeout(2000); // Wait 2s before retry
        }
      }
      
      if (!emailFieldFound || !passwordFieldFound) {
        addLog('❌ ERROR: Email or password field not found after retries!');
        const screenshot2 = await page.screenshot({ fullPage: true, type: 'png' });
        const screenshot2Url = await saveScreenshot(screenshot2, '2-error-no-fields');
        addLog(`   → Error screenshot saved: ${screenshot2Url}`);
        
        // Log page content for debugging
        const pageContent = await page.content();
        addLog(`   → Page URL: ${page.url()}`);
        addLog(`   → Page has ${pageContent.length} characters`);
        
        throw new Error('Signup form fields not found on page after retries');
      }
      
      // Fill fields
      addLog('   ✍️  Filling email field...');
      await page.fill('input[type="email"]', email);
      await page.waitForTimeout(500); // Small delay between fields
      
      addLog('   ✍️  Filling password field...');
      await page.fill('input[type="password"]', password);
      
      // Take screenshot after filling
      const screenshot3 = await page.screenshot({ fullPage: false, type: 'png' });
      const screenshot3Url = await saveScreenshot(screenshot3, '3-form-filled');
      addLog(`   → Screenshot saved: ${screenshot3Url}`);
      
      addLog('✅ Credentials filled');

      // Step 3: Submit with retry
      addLog('📤 Step 3: Submitting form...');
      
      let formSubmitted = false;
      const maxSubmitRetries = 5;
      
      for (let attempt = 1; attempt <= maxSubmitRetries; attempt++) {
        try {
          addLog(`   [Attempt ${attempt}/${maxSubmitRetries}] Looking for submit button...`);
          
          // Wait for submit button to be visible and enabled
          await page.waitForSelector('button:has-text("Sign up with email")', { 
            state: 'visible', 
            timeout: 5000 
          });
          
          const submitButton = page.locator('button:has-text("Sign up with email")').first();
          const isVisible = await submitButton.isVisible({ timeout: 2000 }).catch(() => false);
          const isEnabled = await submitButton.isEnabled({ timeout: 2000 }).catch(() => false);
          
          if (isVisible && isEnabled) {
            addLog('   ✅ Submit button found and enabled');
            
            // Click submit button
            await submitButton.click();
            
            // Wait for navigation/response
            await page.waitForLoadState('domcontentloaded', { timeout: 30000 });
            await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {
              addLog('   ⚠️  networkidle timeout after submit, continuing...');
            });
            await page.waitForTimeout(2000); // Extra stability wait
            
            formSubmitted = true;
            
            // Log URL after submit
            const urlAfterSubmit = page.url();
            addLog(`   URL after submit: ${urlAfterSubmit}`);
            
            // Take screenshot after submit
            const screenshot5 = await page.screenshot({ fullPage: false, type: 'png' });
            const screenshot5Url = await saveScreenshot(screenshot5, '4-after-submit');
            addLog(`   → Screenshot saved: ${screenshot5Url}`);
            
            break;
          } else {
            addLog(`   ⚠️  Button not ready (visible: ${isVisible}, enabled: ${isEnabled})`);
          }
        } catch (error: any) {
          addLog(`   ⚠️  Attempt ${attempt} failed: ${error.message.substring(0, 100)}`);
        }
        
        if (attempt < maxSubmitRetries && !formSubmitted) {
          addLog(`   ⏳ Retrying in 2s...`);
          await page.waitForTimeout(2000);
        }
      }
      
      if (!formSubmitted) {
        addLog('❌ ERROR: Could not submit form after retries!');
        const screenshot4 = await page.screenshot({ fullPage: true, type: 'png' });
        const screenshot4Url = await saveScreenshot(screenshot4, '4-error-no-submit');
        addLog(`   → Error screenshot saved: ${screenshot4Url}`);
        throw new Error('Submit button not found or not clickable after retries');
      }
      
      addLog('✅ Form submitted');

      // Step 4: Wait for email
      addLog('⏳ Step 4: Waiting for email (5 seconds)...');
      await page.waitForTimeout(5000);

      // Step 5: Fetch email with retry
      addLog('📧 Step 5: Fetching email from webhook (with retry)...');
      addLog('   → Will retry up to 5 times with 3-4s delay between attempts');
      
      const emailResponse = await getEmailContent(email, 5);
      
      if (!emailResponse || !emailResponse.html) {
        throw new Error('No email HTML received from webhook');
      }
      addLog('✅ Email received');

      // Step 6: Extract confirmation link
      addLog('🔍 Step 6: Extracting confirmation link...');
      const confirmLink = extractConfirmationLink(emailResponse.html);
      
      if (!confirmLink) {
        throw new Error('Could not extract confirmation link from email');
      }
      addLog(`✅ Link extracted: ${confirmLink.substring(0, 60)}...`);

      // Step 7: Visit confirmation with retry
      addLog('🔗 Step 7: Visiting confirmation link...');
      let confirmationVisited = false;
      const maxConfirmRetries = 3;
      
      for (let attempt = 1; attempt <= maxConfirmRetries; attempt++) {
        try {
          addLog(`   [Attempt ${attempt}/${maxConfirmRetries}] Navigating to confirmation link...`);
          await page.goto(confirmLink, { 
            timeout: 60000,
            waitUntil: 'domcontentloaded' 
          });
          await page.waitForLoadState('domcontentloaded', { timeout: 30000 });
          await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {
            addLog('   ⚠️  networkidle timeout, continuing anyway...');
          });
          confirmationVisited = true;
          addLog('   ✅ Confirmation link visited successfully');
          break;
        } catch (error: any) {
          addLog(`   ⚠️  Attempt ${attempt} failed: ${error.message.substring(0, 100)}`);
          if (attempt < maxConfirmRetries) {
            addLog(`   ⏳ Retrying in 2s...`);
            await page.waitForTimeout(2000);
          }
        }
      }
      
      if (!confirmationVisited) {
        throw new Error('Failed to visit confirmation link after 3 attempts');
      }
      
      addLog('✅ Confirmation link visited');

      // Step 8: Wait for redirect and ensure page is stable
      addLog('⏳ Step 8: Waiting for redirect...');
      await page.waitForTimeout(3000);
      
      // Wait for any ongoing navigation to complete
      try {
        await page.waitForLoadState('load', { timeout: 10000 });
        await page.waitForLoadState('domcontentloaded', { timeout: 10000 });
      } catch (e) {
        addLog('   ⚠️  Page load timeout, but continuing...');
      }
      
      addLog('✅ Page redirected');

      // Step 9: Extract auth link with retry
      addLog('🎯 Step 9: Extracting auth callback link...');
      addLog('   → Will retry up to 10 times with 1-2s delay');
      
      let authCallbackLink: string | null = null;
      const maxLinkRetries = 10;
      
      for (let attempt = 1; attempt <= maxLinkRetries; attempt++) {
        addLog(`   [Attempt ${attempt}/${maxLinkRetries}] Looking for auth link...`);
        
        try {
          // Wait for page to be fully loaded with multiple states
          await page.waitForLoadState('load', { timeout: 5000 }).catch(() => {});
          await page.waitForLoadState('domcontentloaded', { timeout: 5000 }).catch(() => {});
          await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
          
          // Additional wait for JS to render
          await page.waitForTimeout(1000);
          
          // Use locator instead of evaluate to avoid context destruction
          const selector = ide === 'cursor' 
            ? 'a[href*="cursor://kombai.kombai/auth-callback"]'
            : 'a[href*="vscode://kombai.kombai/auth-callback"]';
          
          const linkElement = page.locator(selector).first();
          
          // Check if link exists and is visible
          const count = await linkElement.count();
          if (count > 0) {
            const isVisible = await linkElement.isVisible({ timeout: 2000 }).catch(() => false);
            if (isVisible) {
              authCallbackLink = await linkElement.getAttribute('href');
              if (authCallbackLink) {
                addLog(`   ✅ Found auth link on attempt ${attempt}`);
                break;
              }
            }
          }
          
          addLog(`   ⏳ Link not visible yet (found ${count} element(s))...`);
        } catch (error: any) {
          addLog(`   ⚠️  Error on attempt ${attempt}: ${error.message.substring(0, 100)}`);
        }
        
        // Take screenshot of current state every 3 attempts
        if (attempt % 3 === 0) {
          try {
            const debugScreenshot = await page.screenshot({ fullPage: false, type: 'png' });
            const debugUrl = await saveScreenshot(debugScreenshot, `debug-attempt-${attempt}`);
            addLog(`   → Debug screenshot: ${debugUrl}`);
          } catch (screenshotError) {
            addLog(`   ⚠️  Could not take screenshot`);
          }
        }
        
        if (attempt < maxLinkRetries) {
          // Random delay 1-2s to avoid rate limiting
          const delay = 1000 + Math.random() * 1000;
          addLog(`   ⏳ Waiting ${(delay/1000).toFixed(1)}s before retry...`);
          await page.waitForTimeout(delay);
        }
      }

      if (!authCallbackLink) {
        const finalScreenshot = await page.screenshot({ fullPage: true, type: 'png' });
        const finalUrl = await saveScreenshot(finalScreenshot, 'final-no-link-found');
        addLog(`   → Final screenshot saved: ${finalUrl}`);
        throw new Error('Could not find auth-callback link after 10 attempts');
      }

      const authCode = authCallbackLink.match(/code=([^&]+)/)?.[1];
      
      if (!authCode) {
        throw new Error('Could not extract auth code from link');
      }

      addLog('✅ Auth code extracted');
      addLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      addLog('🎉 SUCCESS! AUTOMATION COMPLETED!');
      addLog(`🔑 Auth Code: ${authCode}`);
      addLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      // Take final screenshot
      const screenshot = await page.screenshot({ fullPage: false, type: 'png' });
      const screenshotUrl = await saveScreenshot(screenshot, '5-final-success');
      addLog(`   → Final screenshot saved: ${screenshotUrl}`);

      await browser.close();
      addLog('👋 Browser closed');

      // Save token to database
      addLog('💾 Saving Kombai token to database...');
      try {
        await connectDB();
        
        const newToken = new Token({
          name: 'Kombai Trial',
          category: 'kombai',
          token: authCallbackLink, // Lưu Auth Callback Link vào token field
          email,
          password,
          expiry_days: 30, // 30 ngày
          value: 1,
          is_taken: true,
          customerId: user.userId,
          purchaseDate: new Date(),
        });
        
        await newToken.save();
        addLog(`   ✅ Token saved with ID: ${newToken._id}`);
      } catch (dbError: any) {
        addLog(`   ⚠️  Failed to save token to database: ${dbError.message}`);
        console.error('Database save error:', dbError);
      }

      return NextResponse.json({
        success: true,
        authLink: authCallbackLink,
        authCode,
        email,
        ide,
        logs,
        screenshots,
      });

    } catch (error: any) {
      addLog('❌ ERROR: ' + error.message);
      
      // Take error screenshot
      try {
        const screenshot = await page.screenshot({ fullPage: true, type: 'png' });
        const screenshotUrl = await saveScreenshot(screenshot, 'error');
        addLog(`   → Error screenshot saved: ${screenshotUrl}`);
        
        await browser.close();
        
        return NextResponse.json({
          success: false,
          error: error.message,
          logs,
          screenshots,
        }, { status: 500 });
      } catch (screenshotError) {
        await browser.close();
        throw error;
      }
    }

  } catch (error: any) {
    addLog('❌ FATAL ERROR: ' + error.message);
    console.error('Kombai automation error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Automation failed',
      logs,
    }, { status: 500 });
  }
}

export const POST = requireAuth(handlePost); // Allow all authenticated users

