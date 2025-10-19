/**
 * Test Webhook Script
 * Quickly test if webhook is working properly
 */

const https = require('https');

// Read from env or use default
const WEBHOOK_BASE_URL = process.env.WEBHOOK_BASE_URL || 'https://n8n.thietkelx.com/webhook';
const TEST_EMAIL = process.argv[2] || '123333@hocbaohiem.icu';

console.log('🧪 Testing Webhook...\n');
console.log(`📍 Webhook URL: ${WEBHOOK_BASE_URL}/mail`);
console.log(`📧 Test Email: ${TEST_EMAIL}\n`);

function testWebhook(email) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ email });
    const url = new URL(`${WEBHOOK_BASE_URL}/mail`);

    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
      },
      timeout: 30000, // 30 second timeout
    };

    console.log('⏳ Sending request...');
    const startTime = Date.now();

    const req = https.request(options, (res) => {
      console.log(`✅ Status Code: ${res.statusCode}\n`);

      let body = '';
      res.on('data', (chunk) => (body += chunk));
      
      res.on('end', () => {
        const duration = Date.now() - startTime;
        console.log(`⏱️  Duration: ${duration}ms\n`);

        if (res.statusCode !== 200) {
          console.log('❌ Response Body:');
          console.log(body);
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }

        try {
          const response = JSON.parse(body);
          console.log('✅ Valid JSON response');
          
          if (response.html) {
            console.log('✅ HTML content found');
            console.log(`📏 HTML length: ${response.html.length} characters\n`);
            
            // Try to extract confirmation link
            const linkRegex = /https:\/\/auth\.agent\.kombai\.com\/confirm_email\?t=[^"]+/;
            const match = response.html.match(linkRegex);
            
            if (match) {
              console.log('✅ Confirmation link found:');
              console.log(match[0].substring(0, 80) + '...\n');
            } else {
              console.log('⚠️  No confirmation link found in HTML\n');
            }
          } else {
            console.log('⚠️  No HTML content in response\n');
          }
          
          resolve(response);
        } catch (error) {
          console.log('❌ Failed to parse JSON:');
          console.log(body.substring(0, 200));
          reject(new Error(`Invalid JSON: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      console.log(`❌ Request Error: ${error.message}`);
      reject(error);
    });

    req.on('timeout', () => {
      console.log('❌ Request Timeout (30s)');
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.write(data);
    req.end();
  });
}

// Run test
testWebhook(TEST_EMAIL)
  .then(() => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 Webhook test PASSED!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    process.exit(0);
  })
  .catch((error) => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('❌ Webhook test FAILED!');
    console.log(`Error: ${error.message}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    process.exit(1);
  });

