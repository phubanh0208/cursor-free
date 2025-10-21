# Hướng dẫn Test Tính năng Nạp Credit

## 🧪 Test Plan

### Phương án 1: Test đơn giản (không cần IPN)
Chỉ test UI và flow tạo đơn hàng, không test IPN webhook.

### Phương án 2: Test đầy đủ với ngrok
Test cả IPN webhook để verify credit được cộng tự động.

---

## 📋 Phương án 1: Test đơn giản (KHUYẾN NGHỊ)

### Bước 1: Chạy dev server
```bash
pnpm dev
```

### Bước 2: Login vào tài khoản customer
- Truy cập: http://localhost:3000/login
- Login với tài khoản customer
- (Nếu chưa có, tạo tài khoản mới)

### Bước 3: Test UI Nạp Credit
1. Click "Nạp Credit" trong sidebar
2. Chọn một gói credit (ví dụ: 50 credit)
3. Hoặc nhập số tùy chỉnh (ví dụ: 25)
4. Kiểm tra tóm tắt đơn hàng hiển thị đúng
5. Click "Thanh toán XXX đ"

### Bước 4: Kiểm tra tại SePay
- Sẽ redirect đến trang thanh toán SePay sandbox
- Hiển thị QR code
- Hiển thị thông tin đơn hàng

### Bước 5: Test callback pages
Trong môi trường sandbox, bạn có thể test callback bằng cách:
- Truy cập trực tiếp: http://localhost:3000/payment/success?order=CREDIT-123
- Truy cập: http://localhost:3000/payment/error?order=CREDIT-123
- Truy cập: http://localhost:3000/payment/cancel?order=CREDIT-123

### Bước 6: Kiểm tra lịch sử giao dịch
- Click "Lịch sử giao dịch" trong sidebar
- Xem đơn hàng vừa tạo (status: pending)
- Test filter theo status

### ✅ Kết quả mong đợi
- ✅ UI hiển thị đẹp, không bị lỗi
- ✅ Tạo đơn hàng thành công
- ✅ Redirect đến SePay sandbox
- ✅ Callback pages hiển thị đúng
- ✅ Lịch sử giao dịch hiển thị đơn hàng

---

## 🚀 Phương án 2: Test đầy đủ với ngrok

### Yêu cầu
- Cài đặt ngrok: https://ngrok.com/download
- Tài khoản ngrok (free tier OK)

### Bước 1: Cài đặt ngrok
```bash
# Windows (PowerShell)
choco install ngrok

# Hoặc download từ https://ngrok.com/download
```

### Bước 2: Setup ngrok
```bash
# Đăng ký tài khoản tại https://dashboard.ngrok.com/signup
# Lấy authtoken tại https://dashboard.ngrok.com/get-started/your-authtoken

# Authenticate
ngrok config add-authtoken <YOUR_AUTHTOKEN>
```

### Bước 3: Chạy dev server (Terminal 1)
```bash
pnpm dev
```

### Bước 4: Chạy ngrok (Terminal 2)
```bash
ngrok http 3000
```

Bạn sẽ thấy output như:
```
Forwarding  https://abc123.ngrok-free.app -> http://localhost:3000
```

### Bước 5: Cập nhật .env
```env
NEXT_PUBLIC_BASE_URL=https://abc123.ngrok-free.app
```

**Restart dev server** để load lại env.

### Bước 6: Cấu hình IPN trong SePay Dashboard

1. Truy cập: https://my.sepay.vn/pg/settings
2. Vào phần "Cấu hình IPN"
3. Nhập IPN URL: `https://abc123.ngrok-free.app/api/payment/ipn`
4. Lưu cấu hình

### Bước 7: Test thanh toán sandbox

1. Truy cập ngrok URL: `https://abc123.ngrok-free.app`
2. Login với tài khoản customer
3. Vào "Nạp Credit"
4. Chọn gói 10 credit (10,000 VND)
5. Click "Thanh toán"
6. Scan QR code trong sandbox (hoặc SePay sẽ auto approve)

### Bước 8: Kiểm tra kết quả

**Xem logs server:**
```
📥 Received IPN notification: {...}
✅ Payment successful for order: CREDIT-xxx
💰 Added 10 credits to user email@example.com
   Old balance: 0 -> New balance: 10
```

**Kiểm tra database:**
- Order status = 'paid'
- User credits tăng lên

**Kiểm tra UI:**
- Redirect về /payment/success
- Số dư credit trong sidebar tăng
- Lịch sử giao dịch hiển thị đơn "Thành công"

### ✅ Kết quả mong đợi
- ✅ IPN được gọi thành công
- ✅ Credit được cộng vào user
- ✅ Order status = 'paid'
- ✅ Redirect về success page
- ✅ UI update real-time

---

## 🔍 Checklist Test Cases

### UI Testing
- [ ] Trang /deposit hiển thị đúng số dư hiện tại
- [ ] 5 gói credit hiển thị đúng
- [ ] Click chọn gói → highlight đúng
- [ ] Nhập số tùy chỉnh → clear gói đã chọn
- [ ] Validation: nhập < 10 → hiển thị error
- [ ] Validation: nhập > 10000 → hiển thị error
- [ ] Validation: nhập text → không cho phép
- [ ] Tóm tắt đơn hàng tính toán đúng
- [ ] Bonus hiển thị cho gói 100, 500, 1000
- [ ] Button "Thanh toán" disabled khi chưa chọn

### API Testing
- [ ] POST /api/customer/deposit tạo đơn thành công
- [ ] Response trả về đúng format
- [ ] Order được lưu vào database
- [ ] Order status = 'pending'
- [ ] orderInvoiceNumber unique
- [ ] Không cho phép admin nạp credit

### Payment Flow
- [ ] Redirect đến SePay checkout
- [ ] QR code hiển thị
- [ ] Thông tin đơn hàng đúng
- [ ] Số tiền hiển thị đúng

### IPN Testing (cần ngrok)
- [ ] IPN được gọi khi thanh toán thành công
- [ ] Server logs hiển thị đúng
- [ ] Order status update → 'paid'
- [ ] Credit được cộng vào user
- [ ] Transaction data được lưu
- [ ] Idempotency: IPN gọi 2 lần không cộng 2 lần

### Callback Pages
- [ ] /payment/success hiển thị đẹp
- [ ] /payment/error hiển thị đúng
- [ ] /payment/cancel hiển thị đúng
- [ ] Auto redirect từ success page
- [ ] Buttons hoạt động

### Order History
- [ ] Hiển thị đúng danh sách đơn hàng
- [ ] Filter theo status hoạt động
- [ ] Status badges màu sắc đúng
- [ ] Transaction details hiển thị cho đơn paid
- [ ] Thống kê tính toán đúng
- [ ] Empty state hiển thị khi không có đơn

### Edge Cases
- [ ] User không đủ quyền (admin) → 403
- [ ] Token expired → redirect login
- [ ] Order không tồn tại trong IPN → 404
- [ ] Order đã paid, IPN gọi lại → không cộng lại
- [ ] Network error khi tạo đơn → hiển thị error
- [ ] Concurrent requests → không tạo duplicate orders

---

## 🐛 Debug Tools

### Xem logs server
```bash
# Server sẽ log ra console
# Tìm dòng có emoji: 📥 ✅ ❌ ⚠️ 💰
```

### Kiểm tra MongoDB
```javascript
// Xem orders
db.orders.find().sort({createdAt: -1}).limit(10)

// Xem user credits
db.users.find({email: "test@example.com"})

// Xem order cụ thể
db.orders.findOne({orderInvoiceNumber: "CREDIT-xxx"})
```

### Test IPN manually
```bash
curl -X POST http://localhost:3000/api/payment/ipn \
  -H "Content-Type: application/json" \
  -d '{
    "timestamp": 1729567890,
    "notification_type": "ORDER_PAID",
    "order": {
      "order_invoice_number": "CREDIT-xxx",
      "order_status": "CAPTURED",
      "order_amount": "10000"
    },
    "transaction": {
      "transaction_id": "test123",
      "transaction_status": "APPROVED",
      "transaction_date": "2025-10-21 10:00:00"
    }
  }'
```

### Xem ngrok requests
- Mở: http://localhost:4040
- Xem tất cả requests đến ngrok tunnel
- Inspect request/response details

---

## ⚠️ Lưu ý Sandbox

### SePay Sandbox Mode
- Không thực hiện giao dịch thật
- QR code chỉ để demo
- Có thể auto-approve payment trong dashboard
- IPN vẫn được gửi như production

### Limitations
- Không test được thanh toán thật
- Không test được với ngân hàng thật
- Một số features có thể khác production

---

## 🎯 Recommended Test Flow

**Lần 1: Test UI** (5 phút)
```
1. Chạy pnpm dev
2. Login customer
3. Test trang /deposit
4. Test trang /orders
5. Test callback pages
```

**Lần 2: Test với Manual IPN** (10 phút)
```
1. Tạo đơn hàng
2. Lấy orderInvoiceNumber
3. Gọi IPN API bằng curl/Postman
4. Kiểm tra credit được cộng
```

**Lần 3: Test với ngrok** (20 phút)
```
1. Setup ngrok
2. Cấu hình IPN
3. Test full flow
4. Verify kết quả
```

---

## 📊 Expected Results

### Successful Test
```
✅ UI hoạt động mượt mà
✅ Đơn hàng được tạo
✅ IPN được gọi
✅ Credit được cộng
✅ Order status = paid
✅ Lịch sử hiển thị đúng
```

### Logs mẫu
```bash
📥 Received IPN notification: {...}
✅ Payment successful for order: CREDIT-1729567890-ABC123
💰 Added 100 credits to user customer@example.com
   Old balance: 50 -> New balance: 150
```

---

## 🚀 Sẵn sàng deploy lên production?

Sau khi test thành công sandbox, để deploy production:

1. **Cập nhật SePay credentials:**
   ```env
   SEPAY_ENV=production
   SEPAY_MERCHANT_ID=<production_merchant_id>
   SEPAY_SECRET_KEY=<production_secret_key>
   NEXT_PUBLIC_BASE_URL=https://yourdomain.com
   ```

2. **Cấu hình IPN URL:**
   - `https://yourdomain.com/api/payment/ipn`

3. **Liên kết ngân hàng thật** trong SePay dashboard

4. **Test với số tiền nhỏ** (10 credit = 10,000 VND)

5. **Monitor logs** và database

---

**Good luck testing! 🎉**

