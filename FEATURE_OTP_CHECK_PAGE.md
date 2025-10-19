# Feature - OTP Check Page (Standalone)

## 🎯 Mục tiêu

Tạo một trang **standalone** để lấy OTP chỉ cần nhập email, không cần token ID hay đăng nhập.

---

## ✨ Tính năng

### 1. **Simple Form - Chỉ cần Email**
- ✅ Input email duy nhất
- ✅ Validate email format
- ✅ Submit để lấy OTP
- ✅ Không cần authentication
- ✅ Không cần token ID

### 2. **POST Request to Webhook**
```
POST https://n8n.thietkelx.com/webhook-test/mail
Payload: { "email": "user@example.com" }
```

### 3. **Display Results**
- ✅ OTP code (highlighted, large)
- ✅ HTML email content (nếu có)
- ✅ Plain text (fallback)
- ✅ Copy OTP button
- ✅ Timestamp

### 4. **Actions**
- ✅ Làm mới (clear form)
- ✅ Lấy lại OTP (retry)
- ✅ Copy OTP

---

## 🎨 UI/UX Design

### Layout
```
┌─────────────────────────────────────┐
│          📧 Icon                    │
│     Lấy OTP Email                   │
│  Nhập email để nhận mã OTP          │
├─────────────────────────────────────┤
│                                     │
│  Email: [_______________]           │
│         [Lấy OTP Button]            │
│                                     │
├─────────────────────────────────────┤
│  Kết quả:                           │
│  Email: user@example.com            │
│                                     │
│  Mã OTP: ┌──────────┐              │
│          │ 123456   │ [Copy]       │
│          └──────────┘              │
│                                     │
│  Email HTML: ▼                      │
│  [HTML Content Rendered]            │
│                                     │
│  [Làm mới] [Lấy lại OTP]           │
└─────────────────────────────────────┘
```

---

## 📁 Files Created/Modified

### 1. New Page: `app/otp-check/page.tsx`
Standalone page không cần authentication.

**Key Features:**
- Simple email form
- POST to webhook directly
- Parse and display response
- Copy functionality
- Responsive design

### 2. New API: `app/api/customer/request-otp/route.ts`
POST API để request OTP với authentication (for future use).

**Payload:**
```json
{
  "tokenId": "optional",
  "email": "required"
}
```

### 3. Updated: `components/Sidebar.tsx`
Thêm link "Lấy OTP Email" cho cả Admin và Customer.

---

## 🔄 Workflow

### User Flow:
```
1. User vào /otp-check
   ↓
2. Nhập email
   ↓
3. Click "Lấy OTP"
   ↓
4. POST to webhook với email
   ↓
5. Parse response (HTML/Text)
   ↓
6. Extract OTP code
   ↓
7. Display results
   ↓
8. User copy OTP hoặc làm mới
```

### Technical Flow:
```
Frontend (otp-check/page.tsx)
    ↓
    POST https://n8n.thietkelx.com/webhook-test/mail
    Body: { email: "..." }
    ↓
Webhook Response:
{
  "html": "...",
  "text": "...",
  "message": "..."
}
    ↓
Parse Response:
  - Extract htmlContent
  - Extract fullText
  - Extract otpCode (regex)
    ↓
Display to User
```

---

## 🎯 Use Cases

### 1. **Quick OTP Check**
Admin/User muốn nhanh chóng check OTP của một email bất kỳ.

### 2. **Testing**
Developer test webhook và OTP extraction logic.

### 3. **Customer Support**
Support team giúp customer check OTP khi có vấn đề.

### 4. **Public Access**
Không cần đăng nhập, bất kỳ ai biết URL đều dùng được.

---

## 🔒 Security Considerations

### ⚠️ Important Notes:

1. **No Authentication Required**
   - Trang này không yêu cầu login
   - Bất kỳ ai có URL đều truy cập được
   - Cân nhắc thêm rate limiting

2. **Email Privacy**
   - Webhook có thể log emails
   - Không lưu email trên client
   - Clear data khi làm mới

3. **Rate Limiting (Recommended)**
   Thêm rate limit ở webhook để tránh abuse:
   ```
   - Max 10 requests per email per hour
   - Max 100 requests per IP per day
   ```

4. **CORS**
   Webhook cần allow CORS từ domain này.

---

## 💡 Smart Features

### 1. **Email Validation**
```typescript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  toast.showWarning('Email không hợp lệ!');
}
```

### 2. **OTP Extraction Patterns**
```typescript
const otpPatterns = [
  /\b\d{6}\b/,                    // 6 digits
  /(?:code|otp)[:\s]*(\d{6})/i,  // "code: 123456"
  /(\d{6})/,                      // Any 6 digits
];
```

### 3. **Auto HTML Detection**
```typescript
if (responseText.includes('<') && responseText.includes('>')) {
  htmlContent = responseText;
}
```

### 4. **Error Handling**
- Network errors
- Timeout (30s)
- Empty response
- Invalid JSON
- No OTP found

---

## 🎨 Styling

### Glassmorphism Design
```css
.glass-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

### Responsive
- Mobile-first design
- Max width: 2xl (672px)
- Centered layout
- Touch-friendly buttons

### Colors
- Primary: Blue-Purple gradient
- Success: Green (OTP code)
- Warning: Yellow (no OTP found)
- Text: White/Gray scale

---

## 📝 API Endpoints

### 1. **Webhook (External)**
```
POST https://n8n.thietkelx.com/webhook-test/mail
Content-Type: application/json

Body:
{
  "email": "user@example.com"
}

Response:
{
  "html": "<html>...</html>",  // Optional
  "text": "Your code: 123456", // Optional
  "message": "..."             // Optional
}
```

### 2. **Internal API (Future)**
```
POST /api/customer/request-otp
Authorization: Bearer <token>

Body:
{
  "tokenId": "optional",
  "email": "required"
}

Response:
{
  "success": true,
  "email": "...",
  "htmlContent": "...",
  "fullText": "...",
  "otpCode": "123456",
  "timestamp": "..."
}
```

---

## 🚀 Deployment Notes

### Environment Variables
Không cần env vars mới. Webhook URL được hardcode.

### Routes
- `/otp-check` - Public page
- Không cần authentication middleware

### Navigation
- Sidebar: "Lấy OTP Email" (Admin & Customer)
- Direct URL: `/otp-check`

---

## 🧪 Testing Checklist

- [x] Form validation works
- [x] Email format validation
- [x] POST request to webhook
- [x] Parse HTML response
- [x] Parse text response
- [x] Extract OTP code
- [x] Display HTML content
- [x] Copy OTP functionality
- [x] Loading state
- [x] Error handling
- [x] Empty response handling
- [x] Làm mới functionality
- [x] Lấy lại OTP functionality
- [x] Mobile responsive
- [x] Toast notifications

---

## 📸 Screenshots

### Initial State
```
╔═══════════════════════════════════╗
║         📧                        ║
║    Lấy OTP Email                 ║
║ Nhập email để nhận mã OTP        ║
╠═══════════════════════════════════╣
║                                   ║
║ Email *                           ║
║ [example@email.com________]       ║
║                                   ║
║ [📤 Lấy OTP]                     ║
║                                   ║
╚═══════════════════════════════════╝
```

### With Results
```
╔═══════════════════════════════════╗
║ Kết quả          10:30 AM         ║
╠═══════════════════════════════════╣
║ Email:                            ║
║ user@example.com                  ║
║                                   ║
║ Mã OTP:                           ║
║ ┌─────────────────┐              ║
║ │   123456       │ [📋]          ║
║ └─────────────────┘              ║
║                                   ║
║ Email HTML: ▼                     ║
║ [Beautiful HTML rendered here]    ║
║                                   ║
║ [Làm mới] [Lấy lại OTP]          ║
╚═══════════════════════════════════╝
```

---

## ✅ Status

- **Created:** October 19, 2025
- **Status:** ✅ Ready for Production
- **URL:** `/otp-check`
- **Access:** Public (no auth required)

---

**Simple. Fast. Beautiful.** 🚀

