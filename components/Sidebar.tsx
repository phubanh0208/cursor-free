'use client';

import { useRouter, usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  LogOut, 
  User,
  Settings,
  FolderTree,
  ShoppingCart,
  Mail,
  Code,
  Coins,
  BookOpen
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface SidebarProps {
  userRole: 'admin' | 'customer';
  username: string;
  credits?: number;
}

export default function Sidebar({ userRole, username, credits = 0 }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const adminLinks = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Quản lý Token' },
    { href: '/categories', icon: FolderTree, label: 'Quản lý Category' },
    { href: '/category-guides', icon: BookOpen, label: 'Quản lý Hướng dẫn' },
    { href: '/orders', icon: ShoppingCart, label: 'Quản lý Đơn hàng' },
    { href: '/credits', icon: Coins, label: 'Quản lý Credits' },
    { href: '/otp-tools', icon: Mail, label: 'Lấy OTP Email' },
    { href: '/kombai-automation', icon: Code, label: 'Kombai Automation' },
  ];

  const customerLinks = [
    { href: '/shop', icon: ShoppingBag, label: 'Cửa hàng' },
    { href: '/my-tokens', icon: Package, label: 'Token của tôi' },
    { href: '/otp', icon: Mail, label: 'Lấy OTP Email' },
    { href: '/kombai', icon: Code, label: 'Kombai Automation' },
  ];

  const links = userRole === 'admin' ? adminLinks : customerLinks;

  return (
    <aside className="w-64 flex-shrink-0 min-h-screen glass-card border-r border-white/10 flex flex-col">
      {/* Logo & Brand */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3 mb-2">
          <img 
            src="/logo.png" 
            alt="CURSOR VIP"
            className="w-10 h-10 object-contain"
          />
          <div>
            <h1 className="text-xl font-bold text-white">CURSOR VIP</h1>
            <p className="text-xs text-gray-400">
              {userRole === 'admin' ? 'Admin Panel' : 'Customer Portal'}
            </p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-white/10">
        <div className="glass-hover rounded-xl p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{username}</p>
            <p className="text-xs text-gray-400 capitalize">{userRole}</p>
          </div>
        </div>
      </div>

      {/* Credits Display for Customer */}
      {userRole === 'customer' && (
        <div className="mx-4 mt-4 mb-2 glass-card rounded-xl p-4 border-2 border-yellow-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/20">
              <Coins className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-400">Credits</p>
              <p className="text-xl font-bold text-yellow-400">{credits}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          
          return (
            <button
              key={link.href}
              onClick={() => router.push(link.href)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'glass-button text-white'
                  : 'glass-hover text-gray-300 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{link.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl glass-hover text-gray-300 hover:text-red-400 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}

