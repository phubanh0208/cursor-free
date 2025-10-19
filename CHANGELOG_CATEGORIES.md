# Changelog - Categories & Multi-Product Support

## 📅 Ngày cập nhật: October 19, 2025

## 🎯 Mục tiêu
Thêm khả năng quản lý nhiều loại sản phẩm khác nhau (ChatGPT, Claude, Midjourney, Netflix, Spotify, v.v.) với hệ thống categories và đảm bảo không có sản phẩm nào trùng email.

---

## ✨ Tính năng mới

### 1. **Token Model - Thêm Name & Category**
- ✅ Thêm field `name` (string, required) - Tên sản phẩm
- ✅ Thêm field `category` (string, required, lowercase) - Loại sản phẩm
- ✅ Validation email unique - Không cho phép 2 sản phẩm có cùng email
- ✅ Index unique cho email với partial filter expression

**File:** `models/Token.ts`

### 2. **Admin Dashboard - Form cập nhật**
- ✅ Thêm input `name` và `category` vào form tạo/sửa token
- ✅ Validation required cho 2 field mới
- ✅ Hiển thị name và category trong bảng danh sách
- ✅ Category tự động lowercase
- ✅ UI cải thiện với badge cho category

**File:** `app/admin/dashboard/page.tsx`

### 3. **Quản lý Categories (Admin)**
- ✅ Trang mới: `/admin/categories`
- ✅ Thống kê tổng quan: Tổng sản phẩm, còn hàng, đã bán, doanh thu
- ✅ Thống kê chi tiết theo từng category:
  - Tổng sản phẩm
  - Số lượng còn hàng
  - Số lượng đã bán
  - Số email unique
  - Doanh thu
  - Tỉ lệ bán (với progress bar)
- ✅ Sidebar navigation mới

**Files:** 
- `app/admin/categories/page.tsx`
- `app/api/admin/category-stats/route.ts`

### 4. **Quản lý Đơn hàng (Admin)**
- ✅ Trang mới: `/admin/orders`
- ✅ Hiển thị tất cả đơn hàng (tokens đã bán)
- ✅ Thống kê: Tổng đơn hàng, số khách hàng, doanh thu
- ✅ Filter theo category
- ✅ Search theo tên sản phẩm, email, tên khách hàng
- ✅ Hiển thị đầy đủ thông tin:
  - Sản phẩm (name, category, expiry days)
  - Khách hàng (username, email)
  - Email sản phẩm
  - Giá trị
  - Ngày mua

**Files:**
- `app/admin/orders/page.tsx`
- `app/api/admin/orders/route.ts`

### 5. **Shop Page - Filter & Display**
- ✅ Hiển thị name và category cho mỗi sản phẩm
- ✅ Filter buttons theo category
- ✅ Lấy danh sách categories từ API
- ✅ UI responsive với category badges

**Files:**
- `app/shop/page.tsx`
- `app/api/shop/categories/route.ts` (new)

### 6. **My Tokens Page - Display**
- ✅ Hiển thị name và category cho tokens đã mua
- ✅ Header section với product name và category badge
- ✅ UI cải thiện

**File:** `app/my-tokens/page.tsx`

### 7. **Sidebar Navigation**
- ✅ Thêm 2 menu mới cho Admin:
  - Quản lý Category
  - Quản lý Đơn hàng
- ✅ Icons: FolderTree và ShoppingCart

**File:** `components/Sidebar.tsx`

---

## 🔧 API Endpoints mới

### Admin APIs
```
GET  /api/admin/category-stats    - Thống kê theo category
GET  /api/admin/orders            - Danh sách đơn hàng đã bán
```

### Shop APIs
```
GET  /api/shop/categories         - Lấy danh sách categories
GET  /api/shop/tokens?category=xxx - Filter tokens theo category
```

---

## 📊 Database Changes

### Token Schema
```typescript
{
  name: string;              // NEW - Tên sản phẩm
  category: string;          // NEW - Loại sản phẩm (chatgpt, claude, etc)
  token?: string;
  email?: string;            // NOW UNIQUE (if not empty)
  password?: string;
  day_create: Date;
  expiry_days: number;
  is_taken: boolean;
  value: number;
  customerId?: ObjectId;
  purchaseDate?: Date;
}
```

### Indexes
- Email: Unique index với partial filter (chỉ áp dụng khi email không rỗng)

---

## 🛠️ Migration Script

**File:** `scripts/add-name-category-to-tokens.js`

Script để cập nhật tokens hiện có trong database:
- Mode tự động: Đặt giá trị mặc định cho tất cả
- Mode thủ công: Nhập từng token một

**Chạy migration:**
```bash
node scripts/add-name-category-to-tokens.js
```

---

## 🎨 UI/UX Improvements

1. **Category Badges**: Hiển thị category với màu sắc đẹp mắt
2. **Filter Buttons**: Active state với gradient background
3. **Progress Bars**: Thể hiện tỉ lệ bán hàng trực quan
4. **Statistics Cards**: Hiển thị thống kê với icons và màu sắc
5. **Responsive Design**: Tất cả trang đều responsive

---

## ✅ Validation & Security

1. **Email Unique**: Đảm bảo không có 2 sản phẩm cùng email
2. **Required Fields**: Name và category bắt buộc
3. **Category Lowercase**: Tự động chuẩn hóa category
4. **Admin Only**: Tất cả trang quản lý chỉ dành cho admin

---

## 📝 Categories Examples

Hệ thống hỗ trợ nhiều loại sản phẩm:
- `chatgpt` - ChatGPT Plus/Pro accounts
- `claude` - Claude Pro accounts
- `midjourney` - Midjourney subscriptions
- `netflix` - Netflix accounts
- `spotify` - Spotify Premium
- `github` - GitHub Copilot
- `canva` - Canva Pro
- `notion` - Notion Premium
- ... và nhiều loại khác

---

## 🚀 Next Steps

1. ✅ Chạy migration script nếu có data cũ
2. ✅ Tạo tokens mới với name và category
3. ✅ Sử dụng các tính năng quản lý mới
4. ✅ Theo dõi thống kê theo category

---

## 📞 Support

Mọi thắc mắc về tính năng mới vui lòng liên hệ admin.

---

**Made with ❤️ for CURSOR VIP**

