# 🎨 Design System - Quick Start Guide

## 📚 Tài liệu

Dự án này sử dụng **Glassmorphism Design System** với theme đen trắng theo phong cách Apple.

### 📖 Đọc tài liệu chính:
- **[FRONTEND_RULES.md](./FRONTEND_RULES.md)** - Quy tắc đầy đủ, color palette, typography, best practices
- **[COMPONENT_EXAMPLES.tsx](./COMPONENT_EXAMPLES.tsx)** - 12 categories components mẫu để copy-paste

---

## 🚀 Quick Start

### 1. Cài đặt Icons
```bash
npm install lucide-react
```

### 2. Import Icons
```tsx
import { 
  Key, Mail, Lock, Calendar, Clock, Plus, 
  Edit3, Trash2, CheckCircle2, AlertCircle 
} from 'lucide-react';
```

### 3. Sử dụng Glass Components

#### Glass Card
```tsx
<div className="glass-card rounded-2xl shadow-2xl p-8">
  <h3 className="text-xl font-semibold text-white mb-4">Title</h3>
  <p className="text-gray-300">Content...</p>
</div>
```

#### Glass Button
```tsx
<button className="glass-button px-6 py-3 rounded-xl text-white font-semibold flex items-center gap-2">
  <Plus className="w-5 h-5" />
  Add New
</button>
```

#### Glass Input
```tsx
<div>
  <label className="flex items-center gap-2 text-sm font-medium text-gray-200 mb-2">
    <Mail className="w-4 h-4" />
    Email
  </label>
  <input
    type="email"
    className="glass-input w-full px-4 py-3 rounded-xl text-white placeholder-gray-400"
    placeholder="email@example.com"
  />
</div>
```

---

## 🎯 Quy tắc ngắn gọn

### ✅ DO
- Dùng `glass-card`, `glass-button`, `glass-input` classes
- Icons luôn đi kèm text trong buttons
- Text màu trắng (`text-white`) hoặc xám (`text-gray-300`)
- Rounded corners: `rounded-xl` (buttons), `rounded-2xl` (cards)
- Spacing: `gap-2`, `gap-4`, `gap-6`, `gap-8`

### ❌ DON'T
- Không dùng `bg-white`, `bg-blue-500` (dùng glass effect)
- Không dùng `border-gray-500` (dùng `border-white/10`)
- Không dùng `text-black` (dùng `text-white`)
- Không skip hover effects
- Không mix icon libraries khác (chỉ dùng lucide-react)

---

## 🎨 Color Reference

### Text Colors
```tsx
text-white          // Primary text
text-gray-300       // Secondary text
text-gray-400       // Tertiary text
text-gray-500       // Muted text
```

### Status Colors
```tsx
// Success - Green
bg-green-500/20 text-green-300 border-green-500/30

// Warning - Yellow  
bg-yellow-500/20 text-yellow-300 border-yellow-500/30

// Error - Red
bg-red-500/20 text-red-300 border-red-500/30

// Info - Blue
bg-blue-500/20 text-blue-300 border-blue-500/30
```

---

## 📐 Spacing & Sizing

### Icon Sizes
```tsx
w-3 h-3  // 12px - Small icons in badges
w-4 h-4  // 16px - Icons in labels/headers
w-5 h-5  // 20px - Icons in buttons
w-6 h-6  // 24px - Large icons
```

### Border Radius
```tsx
rounded-xl   // 16px - Buttons, inputs
rounded-2xl  // 24px - Cards
rounded-3xl  // 30px - Hero icons
rounded-full // Circle
```

### Spacing
```tsx
gap-2   // 8px
gap-3   // 12px
gap-4   // 16px
gap-6   // 24px
gap-8   // 32px
```

---

## 🔥 Most Used Components

### 1. Form Input with Label
```tsx
<div>
  <label className="flex items-center gap-2 text-sm font-medium text-gray-200 mb-2">
    <Key className="w-4 h-4" />
    Token <span className="text-red-400">*</span>
  </label>
  <input
    type="text"
    required
    className="glass-input w-full px-4 py-3 rounded-xl text-white placeholder-gray-400"
    placeholder="Enter token"
  />
</div>
```

### 2. Button with Loading State
```tsx
<button
  disabled={loading}
  className="glass-button px-6 py-3 rounded-xl text-white font-semibold disabled:opacity-50 flex items-center gap-2"
>
  {loading ? (
    <>
      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
      Processing...
    </>
  ) : (
    <>
      <Save className="w-5 h-5" />
      Save
    </>
  )}
</button>
```

### 3. Status Badge
```tsx
<span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-green-500/20 text-green-300 border border-green-500/30">
  <CheckCircle2 className="w-3 h-3" />
  Active
</span>
```

### 4. Table Row with Hover
```tsx
<tr className="glass-hover">
  <td className="px-6 py-4 text-sm text-white">
    <div className="flex items-center gap-2">
      <Key className="w-4 h-4 text-gray-400" />
      Token Value
    </div>
  </td>
  <td className="px-6 py-4">
    <button className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1.5">
      <Edit3 className="w-4 h-4" />
      Edit
    </button>
  </td>
</tr>
```

### 5. Alert/Notification
```tsx
<div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
  <div className="flex items-start gap-3">
    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
    <div>
      <h3 className="text-green-400 font-semibold mb-1">Success!</h3>
      <p className="text-sm text-green-300">Your changes have been saved.</p>
    </div>
  </div>
</div>
```

---

## 📱 Responsive Grid

```tsx
{/* Mobile: 1 col, Tablet: 2 cols, Desktop: 3 cols */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <GlassCard />
  <GlassCard />
  <GlassCard />
</div>
```

---

## 🔍 Tìm Component Nhanh

| Component | File | Line |
|-----------|------|------|
| Glass Card | COMPONENT_EXAMPLES.tsx | Line 19 |
| Primary Button | COMPONENT_EXAMPLES.tsx | Line 53 |
| Text Input | COMPONENT_EXAMPLES.tsx | Line 95 |
| Checkbox | COMPONENT_EXAMPLES.tsx | Line 170 |
| Success Badge | COMPONENT_EXAMPLES.tsx | Line 194 |
| Table | COMPONENT_EXAMPLES.tsx | Line 231 |
| Success Alert | COMPONENT_EXAMPLES.tsx | Line 293 |
| Modal | COMPONENT_EXAMPLES.tsx | Line 368 |

---

## 📦 File Structure

```
├── FRONTEND_RULES.md          # Quy tắc đầy đủ (đọc này trước!)
├── COMPONENT_EXAMPLES.tsx     # 12 categories components mẫu
├── README_DESIGN_SYSTEM.md    # File này (quick reference)
├── app/
│   ├── globals.css           # Glass utilities CSS
│   └── page.tsx              # Example implementation
```

---

## 💡 Tips

1. **Copy-paste từ COMPONENT_EXAMPLES.tsx** - Đừng viết từ đầu
2. **Consistent spacing** - Dùng `gap-2`, `gap-4`, `gap-6`, `gap-8` (không dùng 3, 5, 7)
3. **Icons everywhere** - Mọi label, button, header đều có icon
4. **Glass effect** - Luôn dùng `glass-*` classes thay vì màu solid
5. **White text** - Mọi text chính đều `text-white` hoặc `text-gray-300`

---

## 🆘 Troubleshooting

### Icons không hiển thị?
```bash
npm install lucide-react
```

### Glass effect không hoạt động?
Check `app/globals.css` có glass utilities chưa:
```css
.glass-card {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(16px);
  ...
}
```

### Màu sắc không đúng?
Đảm bảo dùng:
- `text-white` (không phải `text-black`)
- `bg-white/5` (không phải `bg-white`)
- `border-white/10` (không phải `border-gray-500`)

---

## 📞 Support

1. **Đọc FRONTEND_RULES.md** - Tài liệu đầy đủ
2. **Copy từ COMPONENT_EXAMPLES.tsx** - Components mẫu
3. **Xem app/page.tsx** - Implementation thực tế
4. **Hỏi team** - Nếu vẫn chưa rõ

---

**Happy Coding! 🚀**

