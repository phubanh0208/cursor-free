# CURSOR VIP - Token Manager & Shop

Hệ thống quản lý và bán token Cursor với phân quyền Admin/Customer.

## 🌟 Tính năng

### 🔐 Hệ thống Authentication
- Đăng ký/Đăng nhập với JWT
- Phân quyền: **Admin** và **Customer**
- Bảo mật với bcrypt và httpOnly cookies

### 👨‍💼 Admin Features
- ✅ **Quản lý Token** (CRUD)
- ✅ Thêm/Sửa/Xóa token
- ✅ Xem thông tin người mua
- ✅ Quản lý email/password cho token
- ✅ Full access tất cả token và OTP

### 🛒 Customer Features
- ✅ **Cửa hàng Token** - Xem và mua token available
- ✅ **Token của tôi** - Xem token đã mua
- ✅ **Lấy OTP** - Chỉ xem OTP của token đã mua
- ✅ Copy token/email/password/OTP
- ✅ Responsive glassmorphism UI

### 🔒 Phân quyền API
- `/api/admin/*` - Chỉ Admin
- `/api/customer/*` - Customer (chỉ xem token của mình)
- `/api/shop/*` - Public/Customer (xem & mua)
- `/api/customer/otp` - Admin hoặc Owner của token

## 🚀 Cài đặt

### 1. Clone và cài đặt dependencies
```bash
npm install
```

### 2. Cấu hình MongoDB
File `.env.local` đã được cấu hình:
```env
MONGODB_URI=mongodb+srv://phubanh0208:phu0969727782@cluster1.qjwfwix.mongodb.net/cursor
JWT_SECRET=cursor-vip-secret-key-2024-super-secure
```

### 3. Tạo Admin user đầu tiên
```bash
npm run create-admin
```

Sẽ tạo 2 accounts:
- **Admin**: `admin@cursor.vip` / `admin123`
- **Customer Demo**: `customer@cursor.vip` / `customer123`

### 3.1. Migration cho tokens hiện có (nếu cần)
Nếu bạn đã có tokens trong database, chạy script migration để thêm `name` và `category`:
```bash
node scripts/add-name-category-to-tokens.js
```

### 4. Chạy development server
```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000)

## 📁 Cấu trúc Project

```
cursor-free/
├── app/
│   ├── api/
│   │   ├── auth/          # Login, Register, Logout, Me
│   │   ├── admin/         # Admin APIs (CRUD tokens)
│   │   ├── customer/      # Customer APIs (my-tokens, otp)
│   │   └── shop/          # Shop APIs (available tokens, purchase)
│   ├── admin/
│   │   └── dashboard/     # Admin Dashboard
│   ├── login/             # Login/Register Page
│   ├── shop/              # Shop Page (Customer)
│   ├── my-tokens/         # My Tokens Page (Customer)
│   └── page.tsx           # Redirect to login
├── components/
│   └── Sidebar.tsx        # Sidebar with navigation
├── lib/
│   ├── auth.ts            # JWT utilities
│   ├── middleware.ts      # Auth middleware
│   └── mongodb.ts         # MongoDB connection
├── models/
│   ├── User.ts            # User model (admin/customer)
│   └── Token.ts           # Token model
└── scripts/
    └── create-admin.js    # Script tạo admin
```

## 🎨 UI/UX Features

- ✨ **Glassmorphism Design** - Modern, elegant
- 🌙 **Dark Theme** - Black & White gradient
- 📱 **Responsive** - Mobile-friendly
- 🎯 **Lucide Icons** - Professional icons
- 💫 **Smooth Animations** - Glass hover effects

## 🔐 Database Schema

### User Model
```typescript
{
  email: string;
  password: string (hashed);
  username: string;
  role: 'admin' | 'customer';
  createdAt: Date;
}
```

### Token Model
```typescript
{
  name: string;              // Tên sản phẩm (VD: "ChatGPT Plus Account")
  category: string;          // Loại sản phẩm (VD: "chatgpt", "claude", "midjourney", "netflix", "spotify")
  token?: string;
  email?: string;
  password?: string;
  day_create: Date;
  expiry_days: number;
  is_taken: boolean;
  value: number;
  customerId?: ObjectId;     // Người mua
  purchaseDate?: Date;       // Ngày mua
}
```

### Validation Rules
- Nếu `token` trống → Phải có cả `email` VÀ `password`
- Token đã bán (`is_taken=true`) không hiện trong shop
- Customer chỉ xem được token và OTP của mình

## 🛡️ Security Features

- ✅ JWT với httpOnly cookies
- ✅ Password hashing với bcrypt
- ✅ Role-based access control
- ✅ API middleware cho phân quyền
- ✅ Token ownership validation
- ✅ Secure environment variables

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất
- `GET /api/auth/me` - Lấy thông tin user

### Admin (Require Admin Role)
- `GET /api/admin/tokens` - Xem tất cả tokens
- `POST /api/admin/tokens` - Tạo token mới
- `GET /api/admin/tokens/[id]` - Xem token
- `PUT /api/admin/tokens/[id]` - Cập nhật token
- `DELETE /api/admin/tokens/[id]` - Xóa token

### Shop (Public/Customer)
- `GET /api/shop/tokens` - Xem tokens available (có thể filter theo `?category=xxx`)
- `GET /api/shop/categories` - Lấy danh sách categories có sẵn
- `POST /api/shop/purchase` - Mua token (require auth)

### Customer (Require Auth)
- `GET /api/customer/my-tokens` - Xem tokens đã mua
- `GET /api/customer/otp?tokenId=xxx` - Lấy OTP (chỉ token của mình)

## 🎯 Workflow

### Admin Workflow
1. Login với admin account
2. Vào "Quản lý Token"
3. Thêm tokens mới (token hoặc email+pass)
4. Xem danh sách, chỉnh sửa, xóa
5. Xem người mua cho mỗi token

### Customer Workflow
1. Đăng ký/Login
2. Vào "Cửa hàng"
3. Xem tokens available và mua
4. Vào "Token của tôi"
5. Xem thông tin token đã mua
6. Lấy OTP từ email (nếu có)
7. Copy token/email/password/OTP

## 🔧 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: MongoDB + Mongoose
- **Auth**: JWT + bcryptjs
- **UI**: Tailwind CSS + Glassmorphism
- **Icons**: Lucide React
- **Language**: TypeScript

## 📞 Support

Mọi thắc mắc vui lòng liên hệ admin.

---

Made with ❤️ for CURSOR VIP
