# Quick Start - Multi-Product Categories

## 🚀 Bắt đầu nhanh với tính năng Categories mới

### 1️⃣ Nếu bạn đã có data cũ (Migration)

Chạy script migration để thêm `name` và `category` cho tokens hiện có:

```bash
node scripts/add-name-category-to-tokens.js
```

**Lựa chọn:**
- **Option 1 (Tự động)**: Đặt giá trị mặc định cho tất cả tokens
- **Option 2 (Thủ công)**: Nhập từng token một

---

### 2️⃣ Tạo sản phẩm mới (Admin)

1. **Đăng nhập Admin** → Vào "Quản lý Token"
2. **Điền form:**
   - ✅ **Tên sản phẩm** (required): VD: "ChatGPT Plus Account - 1 Month"
   - ✅ **Category** (required): VD: chatgpt, claude, midjourney
   - Token/Email/Password: Như cũ
   - Giá trị và số ngày hết hạn

3. **Lưu ý:**
   - Category sẽ tự động chuyển thành chữ thường
   - Email phải unique (không được trùng với sản phẩm khác)

---

### 3️⃣ Quản lý Categories (Admin)

**Menu:** Admin → Quản lý Category

**Xem thống kê:**
- 📊 Tổng quan hệ thống (tổng SP, còn hàng, đã bán, doanh thu)
- 📈 Chi tiết từng category:
  - Số sản phẩm
  - Tỉ lệ bán
  - Số email unique
  - Doanh thu

**Mục đích:**
- Biết category nào bán chạy nhất
- Quản lý inventory theo từng loại sản phẩm
- Đảm bảo không trùng email

---

### 4️⃣ Quản lý Đơn hàng (Admin)

**Menu:** Admin → Quản lý Đơn hàng

**Tính năng:**
- 🔍 Filter theo category
- 🔎 Search theo tên sản phẩm, email, khách hàng
- 📊 Thống kê tổng đơn hàng và doanh thu
- 👥 Xem thông tin chi tiết khách hàng

**Use cases:**
- Xem khách hàng nào mua sản phẩm gì
- Theo dõi doanh thu theo category
- Kiểm tra lịch sử mua hàng

---

### 5️⃣ Shop (Customer)

**Tính năng mới:**
- 🏷️ Hiển thị tên và category của mỗi sản phẩm
- 🔘 Filter buttons theo category (Tất cả, ChatGPT, Claude, etc)
- ✨ UI đẹp hơn với product name và category badge

**Trải nghiệm:**
- Dễ dàng tìm loại sản phẩm cần mua
- Thông tin rõ ràng hơn
- Navigation nhanh hơn

---

### 6️⃣ My Tokens (Customer)

**Hiển thị:**
- 📦 Tên sản phẩm rõ ràng
- 🏷️ Category badge
- Đầy đủ thông tin như cũ

---

## 📝 Ví dụ Categories phổ biến

```
chatgpt     - ChatGPT Plus/Pro
claude      - Claude Pro
midjourney  - Midjourney
netflix     - Netflix Premium
spotify     - Spotify Premium
github      - GitHub Copilot
canva       - Canva Pro
notion      - Notion Premium
youtube     - YouTube Premium
adobe       - Adobe Creative Cloud
```

---

## ⚠️ Lưu ý quan trọng

### Email Unique
- ❌ **Không được tạo 2 sản phẩm cùng email**
- ✅ Hệ thống sẽ báo lỗi nếu email trùng
- 💡 Mỗi email chỉ nên dùng cho 1 sản phẩm

### Category Naming
- ✅ Dùng chữ thường, không dấu
- ✅ Dùng từ ngắn gọn (1-2 từ)
- ✅ Nhất quán (không viết chatgpt lúc thì ChatGPT lúc)
- 🔄 Hệ thống tự động lowercase

---

## 🎯 Workflow khuyến nghị

### Cho Admin:
1. **Tạo sản phẩm** với name và category rõ ràng
2. **Kiểm tra Categories page** để xem thống kê
3. **Theo dõi Orders page** để xem ai mua gì
4. **Đảm bảo email unique** để tránh xung đột

### Cho Customer:
1. **Vào Shop** → Chọn category cần mua
2. **Xem thông tin** sản phẩm (name, giá, hạn dùng)
3. **Mua sản phẩm**
4. **Vào My Tokens** để lấy thông tin và OTP

---

## 🐛 Troubleshooting

### Lỗi "Email đã được sử dụng"
- **Nguyên nhân:** Email trùng với sản phẩm khác
- **Giải pháp:** Sử dụng email khác hoặc xóa sản phẩm cũ

### Category không hiện trong filter
- **Nguyên nhân:** Chưa có sản phẩm available cho category đó
- **Giải pháp:** Tạo thêm sản phẩm cho category

### Thống kê không chính xác
- **Giải pháp:** Refresh trang hoặc kiểm tra lại database

---

## 📞 Support

Nếu gặp vấn đề, liên hệ admin hoặc check:
- `CHANGELOG_CATEGORIES.md` - Chi tiết thay đổi
- `README.md` - Tài liệu tổng quan

---

**Happy Selling! 🎉**

