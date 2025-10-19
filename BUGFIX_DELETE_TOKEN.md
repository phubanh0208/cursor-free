# Bug Fix - Lỗi xóa Token

## 🐛 Vấn đề

Khi xóa token trong Admin Dashboard, gặp lỗi:
```
TypeError: Cannot destructure property 'params' of 'undefined' as it is undefined.
```

## 🔍 Nguyên nhân

### Lỗi 1: Middleware không truyền params đúng cách
- Middleware `requireAdmin` không hỗ trợ dynamic route parameters
- Next.js dynamic routes (như `/api/admin/tokens/[id]`) cần nhận `context` object chứa `params`
- Middleware cũ chỉ truyền `req`, không truyền `context`

### Lỗi 2: Duplicate Index Warning
- Token model có cả `sparse: true` trong field definition VÀ `schema.index()`
- Mongoose cảnh báo về duplicate index definition

## ✅ Giải pháp

### 1. Cập nhật Middleware (lib/middleware.ts)

**Trước:**
```typescript
export function requireAdmin(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    // ... authentication logic
    return handler(authenticatedReq); // ❌ Không truyền context
  };
}
```

**Sau:**
```typescript
export function requireAdmin<T = any>(
  handler: (req: AuthenticatedRequest, context?: T) => Promise<NextResponse>
) {
  return async (req: NextRequest, context?: T) => {
    // ... authentication logic
    return handler(authenticatedReq, context); // ✅ Truyền context
  };
}
```

### 2. Cập nhật Route Handlers (app/api/admin/tokens/[id]/route.ts)

**Trước:**
```typescript
async function handleDelete(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // ❌ Destructure trực tiếp, lỗi khi params = undefined
  try {
    await Token.findByIdAndDelete(params.id);
  }
}
```

**Sau:**
```typescript
async function handleDelete(
  req: NextRequest,
  context?: { params: { id: string } }
) {
  // ✅ Kiểm tra context trước
  if (!context?.params) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  const { params } = context;
  
  try {
    // Validate ObjectId
    if (!params.id || params.id.length !== 24) {
      return NextResponse.json({ error: 'Invalid token ID' }, { status: 400 });
    }
    
    const token = await Token.findByIdAndDelete(params.id);
    // ... rest of logic
  }
}
```

### 3. Sửa Duplicate Index (models/Token.ts)

**Trước:**
```typescript
email: {
  type: String,
  default: '',
  trim: true,
  sparse: true, // ❌ Duplicate với schema.index()
}

// Và có thêm:
TokenSchema.index({ email: 1 }, { unique: true, sparse: true });
```

**Sau:**
```typescript
email: {
  type: String,
  default: '',
  trim: true, // ✅ Bỏ sparse ở đây
}

// Chỉ giữ index ở schema.index()
TokenSchema.index({ email: 1 }, { unique: true, sparse: true });
```

### 4. Cải thiện Error Handling

**Frontend (app/admin/dashboard/page.tsx):**
```typescript
const handleDelete = async (id: string) => {
  if (!confirm('Bạn có chắc muốn xóa token này?')) return;

  try {
    const response = await fetch(`/api/admin/tokens/${id}`, {
      method: 'DELETE',
    });

    const data = await response.json(); // ✅ Parse response để lấy error message

    if (!response.ok) {
      throw new Error(data.error || 'Failed to delete');
    }

    await fetchTokens();
    toast.showSuccess('Xóa thành công!');
  } catch (error: any) {
    console.error('Delete error:', error); // ✅ Log chi tiết
    toast.showError('Lỗi khi xóa token: ' + error.message);
  }
};
```

## 📝 Files đã sửa

1. ✅ `lib/middleware.ts` - Thêm support cho context params
2. ✅ `app/api/admin/tokens/[id]/route.ts` - Sửa handlers để nhận context
3. ✅ `models/Token.ts` - Bỏ duplicate sparse option
4. ✅ `app/admin/dashboard/page.tsx` - Cải thiện error handling

## 🧪 Testing

### Test xóa token:
1. Login với admin account
2. Vào "Quản lý Token"
3. Chọn một token bất kỳ
4. Click nút Xóa (trash icon)
5. Confirm xóa
6. ✅ Token phải được xóa thành công và hiển thị toast "Xóa thành công!"

### Test error cases:
1. Thử xóa với invalid ID → Hiển thị "Invalid token ID"
2. Thử xóa token không tồn tại → Hiển thị "Token not found"
3. Network error → Hiển thị error message chi tiết

## 🎯 Kết quả

- ✅ Xóa token hoạt động bình thường
- ✅ Không còn lỗi "Cannot destructure property 'params'"
- ✅ Không còn warning về duplicate index
- ✅ Error messages rõ ràng và hữu ích
- ✅ Validation ObjectId đúng cách

## 📚 Học được gì

### 1. Next.js Dynamic Routes với Middleware
- Middleware cần support cho `context` parameter
- Dynamic routes luôn nhận `context: { params: {...} }` làm tham số thứ 2
- Phải check `context?.params` trước khi dùng

### 2. TypeScript Generics
- Dùng `<T = any>` để middleware có thể nhận bất kỳ context type nào
- Optional parameter `context?: T` để support cả dynamic và static routes

### 3. Mongoose Index
- Không nên define index ở 2 nơi (field definition và schema.index())
- Chọn 1 trong 2: hoặc dùng `index: true` trong field, hoặc dùng `schema.index()`
- `sparse: true` trong `schema.index()` tốt hơn vì có thể combine với các options khác

## 🔧 Debug Script

Đã tạo script để test xóa token trực tiếp trong MongoDB:
```bash
node scripts/test-delete-token.js <token_id>
```

Hữu ích khi cần debug xem vấn đề ở database hay ở API layer.

---

**Fixed by:** AI Assistant  
**Date:** October 19, 2025  
**Status:** ✅ Resolved

