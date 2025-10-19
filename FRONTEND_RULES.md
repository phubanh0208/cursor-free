# Frontend Design System & Rules

## 🎨 Theme Overview
Website sử dụng **Glassmorphism** với chủ đề **đen trắng** theo phong cách Apple.

---

## 📋 Table of Contents
1. [Color Palette](#color-palette)
2. [Typography](#typography)
3. [Components](#components)
4. [Icons](#icons)
5. [Spacing & Layout](#spacing--layout)
6. [Animation & Transitions](#animation--transitions)
7. [Form Elements](#form-elements)
8. [Best Practices](#best-practices)

---

## 🎨 Color Palette

### Background Colors
```css
/* Main background gradient */
background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%);

/* Dark shades */
--bg-primary: #0a0a0a;      /* Đen chính */
--bg-secondary: #1a1a1a;    /* Đen nhạt */
--bg-tertiary: #0f0f0f;     /* Đen trung bình */
```

### Text Colors
```css
--text-primary: #ffffff;     /* Trắng - text chính */
--text-secondary: #d1d5db;   /* Xám nhạt - text phụ */
--text-tertiary: #9ca3af;    /* Xám - text mờ */
--text-muted: #6b7280;       /* Xám đậm - text disabled */
```

### Glass Colors (RGBA)
```css
/* Glass backgrounds */
--glass-light: rgba(255, 255, 255, 0.05);    /* Kính nhạt */
--glass-medium: rgba(255, 255, 255, 0.08);   /* Kính trung bình */
--glass-strong: rgba(255, 255, 255, 0.1);    /* Kính đậm */

/* Glass borders */
--glass-border-light: rgba(255, 255, 255, 0.08);
--glass-border-medium: rgba(255, 255, 255, 0.15);
--glass-border-strong: rgba(255, 255, 255, 0.3);
```

### Status Colors
```css
/* Success - Green */
--success-bg: rgba(34, 197, 94, 0.2);
--success-border: rgba(34, 197, 94, 0.3);
--success-text: #86efac;

/* Warning - Yellow */
--warning-bg: rgba(234, 179, 8, 0.2);
--warning-border: rgba(234, 179, 8, 0.3);
--warning-text: #fde047;

/* Error - Red */
--error-bg: rgba(239, 68, 68, 0.2);
--error-border: rgba(239, 68, 68, 0.3);
--error-text: #fca5a5;

/* Info - Blue */
--info-bg: rgba(59, 130, 246, 0.2);
--info-border: rgba(59, 130, 246, 0.3);
--info-text: #93c5fd;
```

---

## ✍️ Typography

### Font Family
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

### Font Sizes
```css
--text-xs: 0.75rem;      /* 12px - Labels nhỏ */
--text-sm: 0.875rem;     /* 14px - Text phụ */
--text-base: 1rem;       /* 16px - Text chính */
--text-lg: 1.125rem;     /* 18px - Subtitle */
--text-xl: 1.25rem;      /* 20px - Heading nhỏ */
--text-2xl: 1.5rem;      /* 24px - Heading */
--text-3xl: 1.875rem;    /* 30px - Title */
--text-4xl: 2.25rem;     /* 36px - Large title */
--text-5xl: 3rem;        /* 48px - Hero title */
```

### Font Weights
```css
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

---

## 🧩 Components

### 1. Glass Card
```tsx
<div className="glass-card rounded-2xl shadow-2xl p-8">
  {/* Content */}
</div>
```

**CSS:**
```css
.glass-card {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
```

### 2. Glass Button
```tsx
<button className="glass-button px-6 py-3 rounded-xl text-white font-semibold">
  Button Text
</button>
```

**CSS:**
```css
.glass-button {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-button:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px 0 rgba(255, 255, 255, 0.1);
}

.glass-button:active {
  transform: scale(0.98);
}
```

### 3. Glass Input
```tsx
<input 
  type="text"
  className="glass-input w-full px-4 py-3 rounded-xl text-white placeholder-gray-400"
  placeholder="Enter text..."
/>
```

**CSS:**
```css
.glass-input {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.glass-input:focus {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.3);
  outline: none;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.05);
}
```

### 4. Status Badge
```tsx
{/* Success */}
<span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-green-500/20 text-green-300 border border-green-500/30">
  <CheckCircle2 className="w-3 h-3" />
  Success
</span>

{/* Warning */}
<span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
  <Circle className="w-3 h-3" />
  Warning
</span>

{/* Error */}
<span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
  <AlertCircle className="w-3 h-3" />
  Error
</span>
```

### 5. Glass Hover Effect
```tsx
<div className="glass-hover">
  {/* Content */}
</div>
```

**CSS:**
```css
.glass-hover {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-hover:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}
```

---

## 🎯 Icons

### Icon Library
**Sử dụng:** [Lucide React](https://lucide.dev/)

```bash
npm install lucide-react
```

### Import Icons
```tsx
import { 
  Key, Calendar, Clock, DollarSign, Mail, Lock,
  CheckCircle2, Circle, AlertCircle, Plus, Edit3,
  Trash2, X, Save, List
} from 'lucide-react';
```

### Icon Sizes
```tsx
{/* Small - 12px */}
<Key className="w-3 h-3" />

{/* Medium - 16px */}
<Key className="w-4 h-4" />

{/* Large - 20px */}
<Key className="w-5 h-5" />

{/* XL - 24px */}
<Key className="w-6 h-6" />

{/* 2XL - 48px */}
<Key className="w-12 h-12" />
```

### Icon Stroke Width
```tsx
{/* Default */}
<Key className="w-5 h-5" strokeWidth={2} />

{/* Thin */}
<Key className="w-5 h-5" strokeWidth={1.5} />

{/* Bold */}
<Key className="w-5 h-5" strokeWidth={2.5} />
```

### Icon Colors
```tsx
{/* White - Primary */}
<Key className="w-5 h-5 text-white" />

{/* Gray - Secondary */}
<Key className="w-5 h-5 text-gray-400" />

{/* Colored */}
<CheckCircle2 className="w-5 h-5 text-green-300" />
<AlertCircle className="w-5 h-5 text-red-300" />
```

---

## 📐 Spacing & Layout

### Border Radius
```css
--radius-sm: 0.5rem;      /* 8px */
--radius-md: 0.75rem;     /* 12px */
--radius-lg: 1rem;        /* 16px */
--radius-xl: 1.25rem;     /* 20px */
--radius-2xl: 1.5rem;     /* 24px */
--radius-3xl: 1.875rem;   /* 30px */
--radius-full: 9999px;    /* Circle */
```

### Spacing Scale
```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

### Container Max Width
```css
.container {
  max-width: 1280px;  /* 7xl */
  margin: 0 auto;
  padding: 0 1rem;
}
```

---

## 🎬 Animation & Transitions

### Transition Duration
```css
--duration-fast: 150ms;
--duration-normal: 300ms;
--duration-slow: 500ms;
```

### Easing Functions
```css
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
```

### Common Animations

#### Fade In
```tsx
<div className="animate-fade-in">
  {/* Content */}
</div>
```

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}
```

#### Slide Up
```tsx
<div className="animate-slide-up">
  {/* Content */}
</div>
```

```css
@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(20px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-up {
  animation: slideUp 0.3s ease-out;
}
```

#### Loading Spinner
```tsx
<div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
```

---

## 📝 Form Elements

### Text Input
```tsx
<div>
  <label className="flex items-center gap-2 text-sm font-medium text-gray-200 mb-2">
    <Mail className="w-4 h-4" />
    Email <span className="text-red-400">*</span>
  </label>
  <input
    type="email"
    required
    className="glass-input w-full px-4 py-3 rounded-xl text-white placeholder-gray-400"
    placeholder="email@example.com"
  />
</div>
```

### Checkbox
```tsx
<label className="flex items-center gap-3 cursor-pointer glass-button px-4 py-3 rounded-xl">
  <input
    type="checkbox"
    className="w-5 h-5 rounded focus:ring-2 focus:ring-white/30"
  />
  <CheckCircle2 className="w-4 h-4" />
  <span className="text-sm font-medium text-white">
    Remember me
  </span>
</label>
```

### Button with Icon
```tsx
<button className="glass-button flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold">
  <Plus className="w-5 h-5" />
  Add New
</button>
```

### Submit Button with Loading
```tsx
<button
  type="submit"
  disabled={loading}
  className="glass-button w-full py-4 px-6 rounded-xl text-white font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
>
  {loading ? (
    <>
      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
      Processing...
    </>
  ) : (
    <>
      <Save className="w-5 h-5" />
      Save Changes
    </>
  )}
</button>
```

---

## ✅ Best Practices

### DO's ✓

1. **Luôn sử dụng glass classes có sẵn**
   ```tsx
   ✓ <div className="glass-card">
   ✗ <div className="bg-white/5 backdrop-blur-lg">
   ```

2. **Icons luôn đi kèm với text trong buttons**
   ```tsx
   ✓ <Plus className="w-5 h-5" /> Add New
   ✗ Add New (không có icon)
   ```

3. **Sử dụng semantic colors cho status**
   ```tsx
   ✓ bg-green-500/20 text-green-300 (success)
   ✗ bg-blue-500/20 (cho success)
   ```

4. **Rounded corners nhất quán**
   ```tsx
   ✓ rounded-xl (16px) cho inputs/buttons
   ✓ rounded-2xl (24px) cho cards
   ```

5. **Spacing đều đặn**
   ```tsx
   ✓ gap-2, gap-3, gap-4, gap-6, gap-8
   ✗ gap-5, gap-7, gap-9
   ```

6. **Font weights rõ ràng**
   ```tsx
   ✓ font-medium (labels)
   ✓ font-semibold (buttons, headings)
   ✓ font-bold (hero text)
   ```

### DON'Ts ✗

1. **Không dùng màu sáng cho background**
   ```tsx
   ✗ bg-white
   ✗ bg-blue-500
   ✓ bg-white/5 (glass effect)
   ```

2. **Không dùng solid borders**
   ```tsx
   ✗ border-gray-500
   ✓ border-white/10
   ```

3. **Không dùng text đen**
   ```tsx
   ✗ text-black
   ✗ text-gray-900
   ✓ text-white
   ✓ text-gray-300
   ```

4. **Không skip hover effects**
   ```tsx
   ✗ <button className="glass-button">
   ✓ <button className="glass-button hover:bg-white/15">
   ```

5. **Không mix icon libraries**
   ```tsx
   ✗ import { FaUser } from 'react-icons/fa'
   ✓ import { User } from 'lucide-react'
   ```

---

## 📱 Responsive Design

### Breakpoints
```css
/* Mobile first approach */
sm: 640px   /* Tablet */
md: 768px   /* Small desktop */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Extra large */
```

### Grid Layout
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Items */}
</div>
```

### Padding
```tsx
<div className="px-4 sm:px-6 lg:px-8">
  {/* Content */}
</div>
```

---

## 🎯 Component Examples

### Hero Section
```tsx
<div className="text-center mb-12">
  <div className="inline-flex items-center justify-center w-20 h-20 glass-card rounded-3xl mb-4">
    <Key className="w-10 h-10 text-white" strokeWidth={1.5} />
  </div>
  <h1 className="text-5xl font-bold text-white mb-3 tracking-tight">
    Token Manager
  </h1>
  <p className="text-gray-300 text-lg">
    Quản lý token của bạn một cách dễ dàng
  </p>
</div>
```

### Table Header
```tsx
<thead className="glass border-b border-white/10">
  <tr>
    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
      <div className="flex items-center gap-2">
        <Key className="w-4 h-4" />
        Token
      </div>
    </th>
  </tr>
</thead>
```

### Action Buttons
```tsx
<div className="flex gap-4">
  <button className="glass-button flex-1 py-4 px-6 rounded-xl text-white font-semibold">
    <Save className="w-5 h-5" />
    Save
  </button>
  <button className="glass-button py-4 px-6 rounded-xl text-white font-semibold">
    <X className="w-5 h-5" />
    Cancel
  </button>
</div>
```

---

## 🔍 Quick Reference

### Common Classes
```tsx
// Cards
glass-card rounded-2xl shadow-2xl p-8

// Buttons
glass-button px-6 py-3 rounded-xl text-white font-semibold

// Inputs
glass-input w-full px-4 py-3 rounded-xl text-white placeholder-gray-400

// Text
text-white text-gray-300 text-gray-400

// Spacing
gap-2 gap-3 gap-4 gap-6 gap-8
mb-2 mb-4 mb-6 mb-8 mb-12

// Icons
w-3 h-3 (12px)
w-4 h-4 (16px)
w-5 h-5 (20px)
w-6 h-6 (24px)
```

---

## 📞 Support

Nếu có thắc mắc về design system:
1. Tham khảo file này trước
2. Xem code trong `app/page.tsx` và `app/globals.css`
3. Liên hệ team design

---

**Version:** 1.0.0  
**Last Updated:** 2024  
**Maintained by:** Development Team

