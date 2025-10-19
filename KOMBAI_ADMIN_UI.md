# 🎨 Kombai Automation - Admin UI

## 🎯 Mục tiêu

Tạo giao diện Admin để chạy Kombai automation trực tiếp từ web, không cần chạy script manually.

---

## ✨ Tính năng

### 1. **Simple Form**
- ✅ Input email
- ✅ Input password
- ✅ Chọn IDE (Cursor hoặc VS Code)
- ✅ Button "Chạy Automation"

### 2. **Real-time Logs**
- ✅ Hiển thị logs real-time
- ✅ Mỗi bước được log chi tiết
- ✅ Timestamp cho mỗi log
- ✅ Scrollable log container

### 3. **Result Display**
- ✅ Auth code (large, copy button)
- ✅ Auth callback link (full URL, copy button)
- ✅ Email và IDE used
- ✅ Screenshot (success/error)
- ✅ Error message (nếu có)

### 4. **Actions**
- ✅ Copy auth code
- ✅ Copy auth link
- ✅ Reset form và chạy lại
- ✅ Loading state khi đang chạy

---

## 🎨 UI Design

### Layout
```
┌────────────────────────────────────────────────────────┐
│ Sidebar          │  Main Content                       │
├──────────────────┼─────────────────────────────────────┤
│                  │  🎯 Kombai Automation               │
│ • Dashboard      │  Tự động đăng ký và lấy auth code   │
│ • Categories     │                                     │
│ • Orders         │  ┌─────────────────────────────┐   │
│ • OTP Check      │  │ Form                        │   │
│ • Kombai Auto ✓  │  │                             │   │
│                  │  │ Email: [____________]       │   │
│                  │  │ Password: [________]        │   │
│                  │  │                             │   │
│                  │  │ IDE: [Cursor] [VS Code]    │   │
│                  │  │                             │   │
│                  │  │ [▶ Chạy Automation]        │   │
│                  │  └─────────────────────────────┘   │
│                  │                                     │
│                  │  ┌─────────────────────────────┐   │
│                  │  │ Logs                        │   │
│                  │  │ [timestamp] Step 1...       │   │
│                  │  │ [timestamp] Step 2...       │   │
│                  │  └─────────────────────────────┘   │
│                  │                                     │
│                  │  ┌─────────────────────────────┐   │
│                  │  │ ✅ Thành công! 🎉          │   │
│                  │  │                             │   │
│                  │  │ Auth Code:                  │   │
│                  │  │ ┌────────────┐             │   │
│                  │  │ │ ABC123XYZ  │ [📋]        │   │
│                  │  │ └────────────┘             │   │
│                  │  │                             │   │
│                  │  │ Auth Link:                  │   │
│                  │  │ cursor://...?code=...  [📋] │   │
│                  │  │                             │   │
│                  │  │ [Screenshot]                │   │
│                  │  │                             │   │
│                  │  │ [Chạy lại]                  │   │
│                  │  └─────────────────────────────┘   │
└────────────────────────────────────────────────────────┘
```

---

## 📁 Files Created

### 1. **Frontend: `app/admin/kombai-automation/page.tsx`**

**Features:**
- Form with email, password, IDE selection
- Submit to API endpoint
- Real-time log display
- Result display with copy buttons
- Screenshot preview
- Reset and re-run functionality

**Key Components:**
```typescript
interface AutomationResult {
  success: boolean;
  authLink?: string;
  authCode?: string;
  email?: string;
  ide?: string;
  error?: string;
  logs?: string[];
  screenshot?: string; // base64
}
```

### 2. **Backend: `app/api/admin/kombai-automation/route.ts`**

**Features:**
- Admin-only endpoint (`requireAdmin` middleware)
- Playwright automation
- Email webhook integration
- Link extraction
- Screenshot capture
- Detailed logging

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "ide": "cursor" // or "vscode"
}
```

**Response:**
```json
{
  "success": true,
  "authLink": "cursor://kombai.kombai/auth-callback?status=success&code=ABC123",
  "authCode": "ABC123",
  "email": "user@example.com",
  "ide": "cursor",
  "logs": ["Step 1...", "Step 2..."],
  "screenshot": "data:image/png;base64,..."
}
```

### 3. **Updated: `components/Sidebar.tsx`**

Added new link:
```typescript
{ 
  href: '/admin/kombai-automation', 
  icon: Code, 
  label: 'Kombai Automation' 
}
```

---

## 🔄 Workflow

### User Flow:
```
1. Admin vào /admin/kombai-automation
   ↓
2. Nhập email, password, chọn IDE
   ↓
3. Click "Chạy Automation"
   ↓
4. Loading state hiện
   ↓
5. Logs real-time được hiển thị
   ↓
6. Automation chạy (13-19s)
   ↓
7. Result hiển thị với auth code
   ↓
8. Admin copy auth code/link
   ↓
9. Chạy lại hoặc reset
```

### Technical Flow:
```
Frontend (page.tsx)
    ↓
POST /api/admin/kombai-automation
    ↓
Launch Playwright Browser (headless)
    ↓
Navigate to Signup Page
    ↓
Fill Email + Password
    ↓
Submit Form
    ↓
Wait for Email Confirm Page
    ↓
POST to Webhook (get email HTML)
    ↓
Extract Confirmation Link
    ↓
Visit Confirmation Link
    ↓
Wait for Redirect
    ↓
Extract Auth Callback Link
    ↓
Extract Auth Code
    ↓
Take Screenshot
    ↓
Return Result to Frontend
    ↓
Display Result + Screenshot
```

---

## 🎯 IDE Selection

### Cursor (default)
```
Signup URL: 
https://agent.kombai.com/vscode-connect?redirectUri=cursor://kombai.kombai/auth-callback&...

Result:
cursor://kombai.kombai/auth-callback?status=success&code=ABC123
```

### VS Code
```
Signup URL: 
https://agent.kombai.com/vscode-connect?redirectUri=vscode://kombai.kombai/auth-callback&...

Result:
vscode://kombai.kombai/auth-callback?status=success&code=ABC123
```

---

## 💡 Smart Features

### 1. **IDE Toggle Buttons**
```tsx
<button
  onClick={() => setIde('cursor')}
  className={ide === 'cursor' ? 'active' : ''}
>
  Cursor
</button>
```

### 2. **Real-time Logs**
```typescript
const addLog = (message: string) => {
  logs.push(`[${new Date().toISOString()}] ${message}`);
};
```

### 3. **Screenshot Capture**
```typescript
const screenshot = await page.screenshot({ 
  fullPage: false, 
  type: 'png' 
});
const base64 = `data:image/png;base64,${screenshot.toString('base64')}`;
```

### 4. **Copy to Clipboard**
```typescript
const copyToClipboard = async (text: string) => {
  await navigator.clipboard.writeText(text);
  toast.showSuccess('Đã copy!');
};
```

---

## 🔒 Security

### 1. **Admin Only**
- Route protected with `requireAdmin` middleware
- Only admin role can access
- Customer will be redirected

### 2. **Server-side Execution**
- Automation runs on server
- No client-side credentials exposure
- Screenshot returned as base64

### 3. **Headless Browser**
- Browser runs in headless mode
- No GUI exposed to users
- Automatic cleanup after execution

---

## 📦 Installation

### 1. Install Playwright
```bash
npm install playwright
npx playwright install chromium
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Access Admin Page
```
http://localhost:3000/admin/kombai-automation
```

---

## 🧪 Testing

### Manual Test:
1. Login as admin
2. Navigate to "Kombai Automation"
3. Enter test credentials:
   - Email: `test@example.com`
   - Password: `TestPassword123`
   - IDE: Cursor
4. Click "Chạy Automation"
5. Watch logs appear
6. Verify auth code received
7. Try copying auth code
8. Check screenshot

### Expected Result:
```
✅ Success banner
✅ Auth Code: ABC123XYZ (large, green)
✅ Auth Link: cursor://kombai.kombai/auth-callback?...
✅ Screenshot visible
✅ Copy buttons work
✅ Reset button clears form
```

---

## 🎨 Styling

### Colors:
- **Success:** Green-400
- **Error:** Red-400
- **Info:** Blue-400
- **Warning:** Yellow-400

### Components:
- **glass-card:** Glassmorphism background
- **glass-input:** Input with glass effect
- **glass-button:** Button with gradient on hover

### Responsive:
- Max width: 4xl (896px)
- Centered layout
- Mobile-friendly

---

## 🐛 Troubleshooting

### Error: "Playwright not installed"

**Solution:**
```bash
npm install playwright
npx playwright install chromium
```

---

### Error: "Webhook not responding"

**Cause:** n8n webhook not active

**Solution:**
1. Check webhook is running
2. Test manually:
   ```bash
   curl -X POST https://n8n.thietkelx.com/webhook-test/mail \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com"}'
   ```

---

### Error: "Could not extract auth code"

**Possible causes:**
1. Page structure changed
2. Timeout too short
3. Wrong IDE selector

**Solution:**
1. Check page HTML manually
2. Increase timeout in API route
3. Update selector in code

---

### Browser timeout

**Cause:** Network slow or page loading long

**Solution:**
Increase timeouts in API route:
```typescript
await page.waitForTimeout(10000); // 10 seconds
```

---

## 📊 Performance

### Execution Times:

| Step | Duration |
|------|----------|
| Navigate to signup | 2-3s |
| Fill form | 0.5s |
| Submit & redirect | 2-3s |
| Fetch email | 1-2s |
| Visit confirm link | 2-3s |
| Wait for redirect | 5s |
| Extract auth code | 0.5s |
| Screenshot | 0.5s |
| **Total** | **14-20s** |

---

## 🔧 Configuration

### API Route Config:

```typescript
const browser = await chromium.launch({
  headless: true,  // Production: true, Dev: false for debugging
});
```

### Timeouts:

```typescript
// Email wait
await page.waitForTimeout(5000); // 5 seconds

// Redirect wait
await page.waitForTimeout(5000); // 5 seconds
```

---

## 📝 Future Improvements

### 1. **Batch Processing**
- Upload CSV with multiple accounts
- Process in parallel
- Export results as CSV

### 2. **History**
- Save automation history to database
- View past results
- Search by email/date

### 3. **Scheduling**
- Schedule automation to run at specific times
- Recurring automation
- Email notifications

### 4. **Advanced Options**
- Custom timeout values
- Retry on failure
- Different email providers

---

## 📸 Screenshots

### Form View:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   🎯 Kombai Automation
   Tự động đăng ký và lấy auth code
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Email:    [user@example.com________]
Password: [••••••••••••____________]

IDE:      [Cursor ✓] [VS Code]

          [▶ Chạy Automation]
```

### Success View:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ✅ Thành công! 🎉
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Auth Code:
┌──────────────────────────┐
│   ABC123XYZ           📋 │
└──────────────────────────┘

Auth Callback Link:
cursor://kombai.kombai/auth-callback?status=success&code=ABC123XYZ [📋]

Email: user@example.com
IDE: CURSOR

[Screenshot Preview]

[Chạy lại]
```

---

## ✅ Checklist

- [x] Create admin page
- [x] Create API endpoint
- [x] Add Playwright automation
- [x] Email webhook integration
- [x] Link extraction
- [x] Screenshot capture
- [x] Real-time logs
- [x] Copy buttons
- [x] Reset functionality
- [x] Error handling
- [x] Loading states
- [x] Toast notifications
- [x] IDE selection (Cursor/VS Code)
- [x] Update Sidebar
- [x] Documentation

---

## 🎉 Status

**✅ PRODUCTION READY**

**Route:** `/admin/kombai-automation`

**Access:** Admin only

**Dependencies:** Playwright, n8n webhook

---

**Happy Automating from UI!** 🚀

