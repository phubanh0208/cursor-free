# ⚡ Quick Setup - Kombai Automation UI

## 🚀 Setup trong 3 bước

### 1. Install Playwright
```bash
npm install
npx playwright install chromium
```

### 2. Ensure Webhook is Active
Make sure this endpoint is running:
```
https://n8n.thietkelx.com/webhook/mail
```

Configured in `.env.local`:
```env
WEBHOOK_BASE_URL=https://n8n.thietkelx.com/webhook
```

Test it:
```bash
curl -X POST https://n8n.thietkelx.com/webhook/mail \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### 3. Start Dev Server
```bash
npm run dev
```

---

## 🎯 Access the UI

1. Login as **Admin**
2. Navigate to **Kombai Automation** in sidebar
3. Enter credentials and select IDE
4. Click **"Chạy Automation"**
5. Wait 15-20 seconds
6. Get auth code! 🎉

---

## 📍 URL

```
http://localhost:3000/admin/kombai-automation
```

---

## ✅ Features

- ✅ Form: Email + Password + IDE selection
- ✅ Real-time logs
- ✅ Auto screenshot
- ✅ Copy auth code button
- ✅ Copy auth link button
- ✅ Reset and re-run
- ✅ Error handling

---

## 🎨 Supported IDEs

- **Cursor** (default)
  ```
  cursor://kombai.kombai/auth-callback?status=success&code=ABC123
  ```

- **VS Code**
  ```
  vscode://kombai.kombai/auth-callback?status=success&code=ABC123
  ```

---

## ⏱️ Execution Time

**~15-20 seconds** from start to auth code

---

## 🔒 Security

- Admin only access
- Server-side automation
- Headless browser
- No credential exposure

---

## 📝 Test Credentials

```
Email: 123456@hocbaohiem.icu
Password: Phu0969727782
IDE: Cursor
```

---

**That's it! Happy automating!** 🚀

