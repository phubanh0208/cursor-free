/**
 * COMPONENT EXAMPLES - Glassmorphism Theme
 * 
 * File này chứa các component mẫu để developer tham khảo
 * Tất cả components đều follow design system trong FRONTEND_RULES.md
 */

import { 
  Key, Calendar, Clock, DollarSign, Mail, Lock,
  CheckCircle2, Circle, AlertCircle, Plus, Edit3,
  Trash2, X, Save, List, User, Search, Bell
} from 'lucide-react';

// ============================================
// 1. CARDS
// ============================================

export function GlassCard() {
  return (
    <div className="glass-card rounded-2xl shadow-2xl p-8">
      <h3 className="text-xl font-semibold text-white mb-4">Card Title</h3>
      <p className="text-gray-300">Card content goes here...</p>
    </div>
  );
}

export function StatCard() {
  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 glass rounded-xl flex items-center justify-center">
          <DollarSign className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-sm text-gray-400">Total Value</p>
          <p className="text-2xl font-bold text-white">$1,234</p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 2. BUTTONS
// ============================================

export function PrimaryButton() {
  return (
    <button className="glass-button px-6 py-3 rounded-xl text-white font-semibold flex items-center gap-2">
      <Plus className="w-5 h-5" />
      Add New
    </button>
  );
}

export function IconButton() {
  return (
    <button className="glass-button p-3 rounded-xl text-white">
      <Edit3 className="w-5 h-5" />
    </button>
  );
}

export function LoadingButton({ loading }: { loading: boolean }) {
  return (
    <button
      disabled={loading}
      className="glass-button px-6 py-3 rounded-xl text-white font-semibold disabled:opacity-50 flex items-center gap-2"
    >
      {loading ? (
        <>
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          Loading...
        </>
      ) : (
        <>
          <Save className="w-5 h-5" />
          Save
        </>
      )}
    </button>
  );
}

export function DangerButton() {
  return (
    <button className="glass-button px-6 py-3 rounded-xl text-red-300 font-semibold flex items-center gap-2 hover:bg-red-500/20">
      <Trash2 className="w-5 h-5" />
      Delete
    </button>
  );
}

// ============================================
// 3. INPUTS
// ============================================

export function TextInput() {
  return (
    <div>
      <label className="flex items-center gap-2 text-sm font-medium text-gray-200 mb-2">
        <User className="w-4 h-4" />
        Username <span className="text-red-400">*</span>
      </label>
      <input
        type="text"
        required
        className="glass-input w-full px-4 py-3 rounded-xl text-white placeholder-gray-400"
        placeholder="Enter username"
      />
    </div>
  );
}

export function EmailInput() {
  return (
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
  );
}

export function SearchInput() {
  return (
    <div className="relative">
      <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
      <input
        type="search"
        className="glass-input w-full pl-12 pr-4 py-3 rounded-xl text-white placeholder-gray-400"
        placeholder="Search..."
      />
    </div>
  );
}

export function NumberInput() {
  return (
    <div>
      <label className="flex items-center gap-2 text-sm font-medium text-gray-200 mb-2">
        <DollarSign className="w-4 h-4" />
        Amount
      </label>
      <input
        type="number"
        min="0"
        step="0.01"
        className="glass-input w-full px-4 py-3 rounded-xl text-white"
        placeholder="0.00"
      />
    </div>
  );
}

export function DateInput() {
  return (
    <div>
      <label className="flex items-center gap-2 text-sm font-medium text-gray-200 mb-2">
        <Calendar className="w-4 h-4" />
        Date
      </label>
      <input
        type="date"
        className="glass-input w-full px-4 py-3 rounded-xl text-white"
      />
    </div>
  );
}

// ============================================
// 4. CHECKBOXES & RADIO
// ============================================

export function Checkbox() {
  return (
    <label className="flex items-center gap-3 cursor-pointer glass-button px-4 py-3 rounded-xl">
      <input
        type="checkbox"
        className="w-5 h-5 rounded focus:ring-2 focus:ring-white/30"
      />
      <CheckCircle2 className="w-4 h-4 text-white" />
      <span className="text-sm font-medium text-white">
        I agree to terms
      </span>
    </label>
  );
}

export function SimpleCheckbox() {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        className="w-4 h-4 rounded focus:ring-2 focus:ring-white/30"
      />
      <span className="text-sm text-gray-300">Remember me</span>
    </label>
  );
}

// ============================================
// 5. BADGES & STATUS
// ============================================

export function SuccessBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-green-500/20 text-green-300 border border-green-500/30">
      <CheckCircle2 className="w-3 h-3" />
      Success
    </span>
  );
}

export function WarningBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
      <Circle className="w-3 h-3" />
      Pending
    </span>
  );
}

export function ErrorBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
      <AlertCircle className="w-3 h-3" />
      Error
    </span>
  );
}

export function InfoBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
      <Bell className="w-3 h-3" />
      New
    </span>
  );
}

// ============================================
// 6. TABLES
// ============================================

export function TableExample() {
  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-white/10">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <List className="w-5 h-5" />
          Data Table
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="glass border-b border-white/10">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Name
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            <tr className="glass-hover">
              <td className="px-6 py-4 text-sm text-white">John Doe</td>
              <td className="px-6 py-4 text-sm text-gray-300">john@example.com</td>
              <td className="px-6 py-4">
                <SuccessBadge />
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <button className="text-blue-400 hover:text-blue-300">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button className="text-red-400 hover:text-red-300">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================
// 7. ALERTS & NOTIFICATIONS
// ============================================

export function SuccessAlert() {
  return (
    <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
      <div className="flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="text-green-400 font-semibold mb-1">Success!</h3>
          <p className="text-sm text-green-300">Your changes have been saved successfully.</p>
        </div>
      </div>
    </div>
  );
}

export function ErrorAlert() {
  return (
    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="text-red-400 font-semibold mb-1">Error!</h3>
          <p className="text-sm text-red-300">Something went wrong. Please try again.</p>
        </div>
      </div>
    </div>
  );
}

export function InfoAlert() {
  return (
    <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
      <div className="flex items-start gap-3">
        <Bell className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="text-blue-400 font-semibold mb-1">Information</h3>
          <p className="text-sm text-blue-300">This is an informational message.</p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 8. FORMS
// ============================================

export function LoginForm() {
  return (
    <div className="glass-card rounded-2xl shadow-2xl p-8 max-w-md mx-auto">
      <h2 className="text-2xl font-semibold text-white mb-6 text-center">Login</h2>
      
      <form className="space-y-4">
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

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-200 mb-2">
            <Lock className="w-4 h-4" />
            Password
          </label>
          <input
            type="password"
            className="glass-input w-full px-4 py-3 rounded-xl text-white placeholder-gray-400"
            placeholder="Enter password"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded" />
            <span className="text-sm text-gray-300">Remember me</span>
          </label>
          <a href="#" className="text-sm text-blue-400 hover:text-blue-300">
            Forgot password?
          </a>
        </div>

        <button
          type="submit"
          className="glass-button w-full py-3 rounded-xl text-white font-semibold"
        >
          Sign In
        </button>
      </form>
    </div>
  );
}

// ============================================
// 9. MODAL / DIALOG
// ============================================

export function Modal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      {/* Modal Content */}
      <div className="glass-card rounded-2xl shadow-2xl p-8 max-w-md w-full relative z-10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-semibold text-white">Modal Title</h3>
          <button
            onClick={onClose}
            className="glass-button p-2 rounded-lg text-white hover:bg-white/15"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <p className="text-gray-300 mb-6">
          Modal content goes here...
        </p>
        
        <div className="flex gap-4">
          <button className="glass-button flex-1 py-3 rounded-xl text-white font-semibold">
            Confirm
          </button>
          <button 
            onClick={onClose}
            className="glass-button py-3 px-6 rounded-xl text-white font-semibold"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 10. HEADER / NAVIGATION
// ============================================

export function Header() {
  return (
    <header className="glass-card rounded-2xl shadow-2xl mb-8">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 glass rounded-xl flex items-center justify-center">
            <Key className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-semibold text-white">Token Manager</h1>
        </div>
        
        <nav className="flex items-center gap-4">
          <button className="glass-button p-2 rounded-lg relative">
            <Bell className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center">
              3
            </span>
          </button>
          <button className="glass-button px-4 py-2 rounded-lg flex items-center gap-2">
            <User className="w-5 h-5 text-white" />
            <span className="text-white">Profile</span>
          </button>
        </nav>
      </div>
    </header>
  );
}

// ============================================
// 11. EMPTY STATE
// ============================================

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-20 h-20 glass-card rounded-3xl flex items-center justify-center mb-4">
        <Key className="w-10 h-10 text-gray-600" strokeWidth={1.5} />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">No data found</h3>
      <p className="text-gray-400 mb-6 max-w-sm">
        Get started by adding your first item
      </p>
      <button className="glass-button px-6 py-3 rounded-xl text-white font-semibold flex items-center gap-2">
        <Plus className="w-5 h-5" />
        Add New
      </button>
    </div>
  );
}

// ============================================
// 12. LOADING STATE
// ============================================

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
    </div>
  );
}

export function LoadingCard() {
  return (
    <div className="glass-card rounded-2xl p-6 animate-pulse">
      <div className="h-4 bg-white/10 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-white/10 rounded w-1/2"></div>
    </div>
  );
}

