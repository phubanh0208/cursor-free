/**
 * Kombai Auto Signup Script
 * Automated signup flow for Kombai using Playwright
 * 
 * Flow:
 * 1. Navigate to signup page
 * 2. Enter email and password
 * 3. Submit signup form
 * 4. Call webhook to get email HTML
 * 5. Extract confirmation link from email
 * 6. Visit confirmation link
 * 7. Wait for redirect
 * 8. Extract auth-callback link with code
 */

const { chromium } = require('playwright');
const https = require('https');

// Configuration
const CONFIG = {
  SIGNUP_URL: 'https://agent.kombai.com/vscode-connect?redirectUri=cursor://kombai.kombai/auth-callback&code=T1JXQVpCbFVQQXFVOFFCUg==&from=vscode&type=new',
  WEBHOOK_URL: process.env.WEBHOOK_BASE_URL ? `${process.env.WEBHOOK_BASE_URL}/mail` : 'https://n8n.thietkelx.com/webhook-test/mail',
  EMAIL: '123456@hocbaohiem.icu',
  PASSWORD: 'Phu0969727782',
};

// Helper: Call webhook to get email
async function getEmailContent(email) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ email });
    const url = new URL(CONFIG.WEBHOOK_URL);

    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve(response);
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Helper: Extract confirmation link from HTML
function extractConfirmationLink(html) {
  const regex = /https:\/\/auth\.agent\.kombai\.com\/confirm_email\?t=[^"]+/;
  const match = html.match(regex);
  return match ? match[0] : null;
}

// Main automation function
async function autoSignup() {
  console.log('🚀 Starting Kombai Auto Signup...\n');

  // Launch browser
  const browser = await chromium.launch({
    headless: false, // Set to true for production
    slowMo: 100, // Slow down for visibility
  });

  // Create fresh context without cookies/cache (incognito mode)
  const context = await browser.newContext({
    storageState: undefined, // No stored cookies/sessions
    ignoreHTTPSErrors: true,
    bypassCSP: true,
  });
  const page = await context.newPage();
  
  // Clear any existing cookies
  await context.clearCookies();
  console.log('✅ Using fresh browser context (no cookies/cache)\n');

  try {
    // Step 1: Navigate to signup page
    console.log('📄 Step 1: Navigating to signup page...');
    await page.goto(CONFIG.SIGNUP_URL);
    await page.waitForLoadState('networkidle');
    
    // Clear localStorage and sessionStorage
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    console.log('✅ Signup page loaded (storage cleared)\n');

    // Step 2: Fill email and password
    console.log('✍️  Step 2: Filling email and password...');
    await page.fill('input[type="email"]', CONFIG.EMAIL);
    await page.fill('input[type="password"]', CONFIG.PASSWORD);
    console.log('✅ Credentials filled\n');

    // Step 3: Submit signup form
    console.log('📤 Step 3: Submitting signup form...');
    await page.click('button:has-text("Sign up with email")');
    await page.waitForLoadState('networkidle');
    console.log('✅ Signup submitted\n');

    // Step 4: Wait a bit for email to be sent
    console.log('⏳ Step 4: Waiting for email (5 seconds)...');
    await page.waitForTimeout(5000);

    // Step 5: Call webhook to get email
    console.log('📧 Step 5: Fetching email from webhook...');
    const emailResponse = await getEmailContent(CONFIG.EMAIL);
    
    if (!emailResponse || !emailResponse.html) {
      throw new Error('No email HTML received from webhook');
    }
    console.log('✅ Email received from webhook\n');

    // Step 6: Extract confirmation link
    console.log('🔍 Step 6: Extracting confirmation link...');
    const confirmLink = extractConfirmationLink(emailResponse.html);
    
    if (!confirmLink) {
      throw new Error('Could not extract confirmation link from email');
    }
    console.log(`✅ Confirmation link extracted: ${confirmLink}\n`);

    // Step 7: Visit confirmation link
    console.log('🔗 Step 7: Visiting confirmation link...');
    await page.goto(confirmLink);
    await page.waitForLoadState('networkidle');
    console.log('✅ Confirmation link visited\n');

    // Step 8: Wait for redirect (3 seconds + buffer)
    console.log('⏳ Step 8: Waiting for redirect...');
    await page.waitForTimeout(5000);
    console.log('✅ Page redirected\n');

    // Step 9: Extract auth-callback link
    console.log('🎯 Step 9: Extracting auth-callback link...');
    const authCallbackLink = await page.evaluate(() => {
      const link = document.querySelector('a[href*="cursor://kombai.kombai/auth-callback"]');
      return link ? link.href : null;
    });

    if (!authCallbackLink) {
      // Try alternative selectors
      const allLinks = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('a'))
          .map(a => a.href)
          .filter(href => href.includes('cursor://') || href.includes('auth-callback'));
      });
      
      if (allLinks.length > 0) {
        console.log('✅ Found auth-callback links:', allLinks);
        console.log('\n🎉 SUCCESS! Auth code:', allLinks[0].match(/code=([^&]+)/)?.[1]);
      } else {
        throw new Error('Could not find auth-callback link on page');
      }
    } else {
      const code = authCallbackLink.match(/code=([^&]+)/)?.[1];
      console.log('✅ Auth-callback link extracted\n');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🎉 SUCCESS! SIGNUP COMPLETED!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`\n📋 Auth Callback Link: ${authCallbackLink}`);
      console.log(`🔑 Auth Code: ${code}`);
      console.log(`📧 Email: ${CONFIG.EMAIL}`);
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    }

    // Take screenshot
    await page.screenshot({ path: 'kombai-signup-success.png', fullPage: true });
    console.log('📸 Screenshot saved: kombai-signup-success.png\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    
    // Take error screenshot
    try {
      await page.screenshot({ path: 'kombai-signup-error.png', fullPage: true });
      console.log('📸 Error screenshot saved: kombai-signup-error.png\n');
    } catch (screenshotError) {
      console.error('Could not save error screenshot');
    }
    
    throw error;
  } finally {
    // Keep browser open for 10 seconds to see result
    console.log('⏳ Keeping browser open for 10 seconds...');
    await page.waitForTimeout(10000);
    
    await browser.close();
    console.log('👋 Browser closed\n');
  }
}

// Run the automation
autoSignup()
  .then(() => {
    console.log('✅ Automation completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Automation failed:', error);
    process.exit(1);
  });

