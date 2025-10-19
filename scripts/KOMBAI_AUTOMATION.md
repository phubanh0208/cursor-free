# 🤖 Kombai Auto Signup Automation

Automated signup flow for Kombai using Playwright.

---

## 🎯 What it does

This script automates the entire Kombai signup process:

1. ✅ Navigate to Kombai signup page
2. ✅ Enter email and password
3. ✅ Submit signup form
4. ✅ Fetch confirmation email via webhook
5. ✅ Extract confirmation link from email HTML
6. ✅ Visit confirmation link
7. ✅ Wait for redirect
8. ✅ Extract auth-callback link with code
9. ✅ Save screenshots

---

## 📋 Prerequisites

### 1. Install Playwright
```bash
npm install
npx playwright install chromium
```

### 2. Webhook Must Be Active
Make sure the webhook endpoint is running:
```
https://n8n.thietkelx.com/webhook-test/mail
```

The webhook should:
- Accept POST requests with `{ "email": "..." }`
- Return email HTML content with confirmation link

---

## 🚀 Usage

### Quick Start
```bash
npm run kombai-signup
```

### Manual Run
```bash
node scripts/kombai-auto-signup.js
```

---

## ⚙️ Configuration

Edit the `CONFIG` object in `kombai-auto-signup.js`:

```javascript
const CONFIG = {
  SIGNUP_URL: 'https://agent.kombai.com/vscode-connect?...',
  WEBHOOK_URL: 'https://n8n.thietkelx.com/webhook-test/mail',
  EMAIL: '123456@hocbaohiem.icu',
  PASSWORD: 'Phu0969727782',
};
```

### Important Notes:
- **Email:** Use a valid email that the webhook can access
- **Password:** Must meet Kombai requirements
- **Webhook:** Must be running before script execution

---

## 📊 Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Start Automation                          │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
          ┌───────────────────────┐
          │ 1. Open Browser       │
          │ Navigate to Signup    │
          └───────────┬───────────┘
                      │
                      ▼
          ┌───────────────────────┐
          │ 2. Fill Form          │
          │ Email + Password      │
          └───────────┬───────────┘
                      │
                      ▼
          ┌───────────────────────┐
          │ 3. Submit Form        │
          │ Wait for Redirect     │
          └───────────┬───────────┘
                      │
                      ▼
          ┌───────────────────────┐
          │ 4. Call Webhook       │
          │ POST email to n8n     │
          └───────────┬───────────┘
                      │
                      ▼
          ┌───────────────────────┐
          │ 5. Parse Email HTML   │
          │ Extract confirm link  │
          └───────────┬───────────┘
                      │
                      ▼
          ┌───────────────────────┐
          │ 6. Visit Confirm Link │
          │ Verify Email          │
          └───────────┬───────────┘
                      │
                      ▼
          ┌───────────────────────┐
          │ 7. Wait for Redirect  │
          │ Load success page     │
          └───────────┬───────────┘
                      │
                      ▼
          ┌───────────────────────┐
          │ 8. Extract Auth Code  │
          │ cursor://...?code=XXX │
          └───────────┬───────────┘
                      │
                      ▼
          ┌───────────────────────┐
          │ 9. Save Screenshot    │
          │ Display Results       │
          └───────────┬───────────┘
                      │
                      ▼
          ┌───────────────────────┐
          │    SUCCESS! 🎉        │
          │ Auth Code Retrieved   │
          └───────────────────────┘
```

---

## 📸 Screenshots

The script saves two types of screenshots:

1. **Success:** `kombai-signup-success.png`
   - Saved when auth code is successfully extracted
   
2. **Error:** `kombai-signup-error.png`
   - Saved when any step fails

---

## 🔍 Output Example

```
🚀 Starting Kombai Auto Signup...

📄 Step 1: Navigating to signup page...
✅ Signup page loaded

✍️  Step 2: Filling email and password...
✅ Credentials filled

📤 Step 3: Submitting signup form...
✅ Signup submitted

⏳ Step 4: Waiting for email (5 seconds)...

📧 Step 5: Fetching email from webhook...
✅ Email received from webhook

🔍 Step 6: Extracting confirmation link...
✅ Confirmation link extracted: https://auth.agent.kombai.com/confirm_email?t=...

🔗 Step 7: Visiting confirmation link...
✅ Confirmation link visited

⏳ Step 8: Waiting for redirect...
✅ Page redirected

🎯 Step 9: Extracting auth-callback link...
✅ Auth-callback link extracted

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 SUCCESS! SIGNUP COMPLETED!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Auth Callback Link: cursor://kombai.kombai/auth-callback?status=success&code=ORWAZBlUPAqU8QBR
🔑 Auth Code: ORWAZBlUPAqU8QBR
📧 Email: 123456@hocbaohiem.icu

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📸 Screenshot saved: kombai-signup-success.png

⏳ Keeping browser open for 10 seconds...
👋 Browser closed

✅ Automation completed successfully!
```

---

## 🛠️ Troubleshooting

### Error: "No email HTML received from webhook"

**Cause:** Webhook is not running or not returning data.

**Solution:**
1. Check if webhook is active at `https://n8n.thietkelx.com/webhook-test/mail`
2. Test webhook manually:
   ```bash
   curl -X POST https://n8n.thietkelx.com/webhook-test/mail \
     -H "Content-Type: application/json" \
     -d '{"email":"123456@hocbaohiem.icu"}'
   ```
3. Verify response contains `html` field

---

### Error: "Could not extract confirmation link from email"

**Cause:** Email HTML format changed or doesn't contain link.

**Solution:**
1. Check email HTML manually
2. Verify link format: `https://auth.agent.kombai.com/confirm_email?t=...`
3. Update regex pattern in script if needed

---

### Error: "Could not find auth-callback link on page"

**Cause:** Page didn't redirect properly or timeout too short.

**Solution:**
1. Increase wait timeout in Step 8
2. Check if email was actually confirmed
3. Verify page URL is `https://agent.kombai.com/vscode-connect`

---

### Playwright Not Installed

**Solution:**
```bash
npm install playwright
npx playwright install chromium
```

---

## 🔧 Advanced Options

### Headless Mode

Change `headless` option in script:

```javascript
const browser = await chromium.launch({
  headless: true,  // Run without GUI
  slowMo: 0,       // No delay
});
```

### Custom Timeouts

Adjust timeouts for slower connections:

```javascript
// Wait longer for email
await page.waitForTimeout(10000); // 10 seconds

// Wait longer for redirect
await page.waitForTimeout(10000); // 10 seconds
```

### Debug Mode

Enable verbose logging:

```javascript
const browser = await chromium.launch({
  headless: false,
  slowMo: 500,     // Slow motion for debugging
  devtools: true,  // Open DevTools
});
```

---

## 🔐 Security Notes

1. **Credentials:**
   - Keep credentials secure
   - Don't commit sensitive data to git
   - Consider using environment variables

2. **Webhook:**
   - Ensure webhook is secure
   - Implement rate limiting
   - Validate email format

3. **Rate Limiting:**
   - Don't run too frequently
   - Kombai may block automated signups
   - Use responsibly

---

## 📝 API Reference

### getEmailContent(email)

Fetches email content from webhook.

**Parameters:**
- `email` (string): Email address to fetch

**Returns:**
- Promise<Object>: Email response with `html` field

**Example:**
```javascript
const response = await getEmailContent('user@example.com');
console.log(response.html);
```

---

### extractConfirmationLink(html)

Extracts confirmation link from email HTML.

**Parameters:**
- `html` (string): Email HTML content

**Returns:**
- string | null: Confirmation link or null if not found

**Example:**
```javascript
const link = extractConfirmationLink(emailHtml);
// Returns: "https://auth.agent.kombai.com/confirm_email?t=..."
```

---

## 🎓 Learning Resources

### Playwright Documentation
- [Getting Started](https://playwright.dev/docs/intro)
- [API Reference](https://playwright.dev/docs/api/class-playwright)
- [Best Practices](https://playwright.dev/docs/best-practices)

### Related Tools
- [Puppeteer](https://pptr.dev/) - Alternative automation library
- [Selenium](https://www.selenium.dev/) - Classic browser automation
- [Cypress](https://www.cypress.io/) - E2E testing framework

---

## 📊 Performance

Typical execution times:

| Step | Duration |
|------|----------|
| Navigate to signup | 2-3s |
| Fill form | 0.5s |
| Submit & redirect | 2-3s |
| Fetch email | 1-2s |
| Visit confirm link | 2-3s |
| Wait for redirect | 5s |
| Extract auth code | 0.5s |
| **Total** | **13-19s** |

---

## 🤝 Contributing

To improve this automation:

1. Test with different email providers
2. Add error recovery mechanisms
3. Implement retry logic
4. Add logging to file
5. Create TypeScript version

---

## 📜 License

Part of Cursor Token Manager project.

---

## 🆘 Support

If you encounter issues:

1. Check troubleshooting section
2. Review console output
3. Check screenshots
4. Verify webhook is active
5. Test manually first

---

**Happy Automating!** 🚀

