'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { useToast } from '@/components/ToastContainer';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Calendar,
  DollarSign,
  Clock,
  Mail,
  Key,
  CheckCircle,
  XCircle,
  User,
  Eye,
  Loader,
  Copy,
  ChevronDown,
  ChevronUp,
  Package
} from 'lucide-react';

interface Token {
  _id: string;
  name: string;
  category: string;
  token?: string;
  email?: string;
  password?: string;
  day_create: string;
  expiry_days: number;
  is_taken: boolean;
  value: number;
  customerId?: {
    email: string;
    username: string;
  };
  purchaseDate?: string;
}

interface UserData {
  username: string;
  email: string;
  role: 'admin' | 'customer';
}

interface OTPData {
  tokenId: string;
  email: string;
  fullText: string;
  htmlContent?: string | null;  // NEW: HTML content
  otpCode: string | null;
  timestamp: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const toast = useToast();
  const [user, setUser] = useState<UserData | null>(null);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    token: '',
    email: '',
    password: 'Phu0969727782',
    expiry_days: 7,
    value: 20,
  });
  const [categories, setCategories] = useState<string[]>([]);
  const [viewingOtpId, setViewingOtpId] = useState<string | null>(null);
  const [otpData, setOtpData] = useState<Record<string, OTPData>>({});
  const [fetchingOtp, setFetchingOtp] = useState<string | null>(null);
  const [expandedText, setExpandedText] = useState<Record<string, boolean>>({});

  useEffect(() => {
    checkAuth();
    fetchTokens();
    fetchCategories();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (!response.ok) {
        router.push('/login');
        return;
      }
      const data = await response.json();
      if (data.user.role !== 'admin') {
        router.push('/shop');
        return;
      }
      setUser(data.user);
    } catch (error) {
      router.push('/login');
    }
  };

  const fetchTokens = async () => {
    try {
      const response = await fetch('/api/admin/tokens');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setTokens(data.tokens);
    } catch (error) {
      console.error('Error fetching tokens:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/tokens');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      
      // Categories phổ biến mặc định
      const defaultCategories = [
        'chatgpt', 'claude', 'midjourney', 'github', 
        'netflix', 'spotify', 'youtube', 'canva', 
        'notion', 'adobe', 'grammarly', 'copilot'
      ];
      
      // Lấy danh sách unique categories từ tokens
      const existingCategories = Array.from(new Set(data.tokens.map((t: Token) => t.category))).filter(Boolean);
      
      // Merge và loại bỏ duplicate, ưu tiên existing categories
      const allCategories = [
        ...existingCategories,
        ...defaultCategories.filter((cat: string) => !existingCategories.includes(cat))
      ];
      
      setCategories(allCategories as string[]);
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback: chỉ hiển thị categories mặc định nếu API fail
      setCategories([
        'chatgpt', 'claude', 'midjourney', 'github', 
        'netflix', 'spotify', 'youtube', 'canva'
      ]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category) {
      toast.showWarning('Name và Category là bắt buộc!');
      return;
    }

    const hasToken = formData.token && formData.token.trim().length > 0;
    const hasEmail = formData.email && formData.email.trim().length > 0;
    const hasPassword = formData.password && formData.password.trim().length > 0;

    if (!hasToken && (!hasEmail || !hasPassword)) {
      toast.showWarning('Nếu không có token thì phải nhập cả email và password!');
      return;
    }

    try {
      const url = editingId 
        ? `/api/admin/tokens/${editingId}`
        : '/api/admin/tokens';
      
      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save token');
      }

      await fetchTokens();
      await fetchCategories(); // Cập nhật danh sách categories
      resetForm();
      toast.showSuccess(editingId ? 'Cập nhật thành công!' : 'Thêm token thành công!');
    } catch (error: any) {
      toast.showError('Lỗi: ' + error.message);
    }
  };

  const handleEdit = (token: Token) => {
    setEditingId(token._id);
    setFormData({
      name: token.name,
      category: token.category,
      token: token.token || '',
      email: token.email || '',
      password: token.password || 'Phu0969727782',
      expiry_days: token.expiry_days,
      value: token.value,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa token này?')) return;

    try {
      const response = await fetch(`/api/admin/tokens/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete');
      }

      await fetchTokens();
      toast.showSuccess('Xóa thành công!');
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.showError('Lỗi khi xóa token: ' + error.message);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      name: '',
      category: '',
      token: '',
      email: '',
      password: 'Phu0969727782',
      expiry_days: 7,
      value: 20,
    });
  };

  const fetchOTP = async (tokenId: string, forceRequest = false) => {
    setFetchingOtp(tokenId);
    try {
      let response;
      
      if (forceRequest) {
        // POST request để trigger OTP mới
        response = await fetch('/api/customer/request-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tokenId })
        });
      } else {
        // GET request để lấy OTP hiện có
        response = await fetch(`/api/customer/otp?tokenId=${tokenId}`);
      }
      
      const data = await response.json();

      if (!response.ok) {
        toast.showError((data.error || 'Failed to fetch OTP') + (data.details ? '\n' + data.details : ''));
        return;
      }

      setOtpData(prev => ({ ...prev, [tokenId]: data.success ? data : data }));
      
      if (forceRequest) {
        toast.showSuccess('Đã gửi yêu cầu OTP mới!');
      }
    } catch (error: any) {
      toast.showError('Lỗi: ' + error.message);
    } finally {
      setFetchingOtp(null);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.showSuccess(`Đã copy ${label}!`);
    } catch (error) {
      toast.showError('Không thể copy');
    }
  };

  const toggleExpandText = (tokenId: string) => {
    setExpandedText(prev => ({ ...prev, [tokenId]: !prev[tokenId] }));
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      
      
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8">Quản lý Token</h1>

          {/* Form */}
          <div className="glass-card rounded-2xl shadow-2xl p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              {editingId ? (
                <Edit className="w-6 h-6 text-blue-400" />
              ) : (
                <Plus className="w-6 h-6 text-green-400" />
              )}
              <h2 className="text-2xl font-semibold text-white">
                {editingId ? 'Chỉnh sửa Token' : 'Thêm Token Mới'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-200 mb-2">
                    <Package className="w-4 h-4" />
                    Tên sản phẩm <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="glass-input w-full px-4 py-3 rounded-xl text-white placeholder-gray-400"
                    placeholder="VD: ChatGPT Plus Account - 1 Month"
                    required
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-200 mb-2">
                    <Package className="w-4 h-4" />
                    Category <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    list="category-suggestions"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value.toLowerCase() })}
                    className="glass-input w-full px-4 py-3 rounded-xl text-white placeholder-gray-400"
                    placeholder="Chọn hoặc nhập mới (VD: chatgpt, claude, netflix)"
                    required
                  />
                  <datalist id="category-suggestions">
                    {categories.map((cat) => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                  <p className="text-xs text-gray-400 mt-1">
                    💡 Chọn từ danh sách hoặc nhập mới. Sẽ tự động chuyển thành chữ thường
                  </p>
                  {categories.length > 0 && (
                    <div className="mt-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-gray-500">📌 Chọn nhanh:</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {categories.map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setFormData({ ...formData, category: cat })}
                            className={`text-xs px-3 py-1.5 rounded-lg transition-all capitalize ${
                              formData.category === cat
                                ? 'bg-blue-500 text-white'
                                : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-200 mb-2">
                    <Key className="w-4 h-4" />
                    Token (Tùy chọn)
                  </label>
                  <input
                    type="text"
                    value={formData.token}
                    onChange={(e) => setFormData({ ...formData, token: e.target.value })}
                    className="glass-input w-full px-4 py-3 rounded-xl text-white placeholder-gray-400"
                    placeholder={formData.email && formData.password ? "Có thể bỏ trống nếu có email và password" : "Nhập token..."}
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-200 mb-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="glass-input w-full px-4 py-3 rounded-xl text-white placeholder-gray-400"
                    placeholder={formData.token ? "Tùy chọn" : "Bắt buộc nếu không có token"}
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-200 mb-2">
                    <Key className="w-4 h-4" />
                    Password
                  </label>
                  <input
                    type="text"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="glass-input w-full px-4 py-3 rounded-xl text-white placeholder-gray-400"
                    placeholder="Phu0969727782"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-200 mb-2">
                    <Clock className="w-4 h-4" />
                    Số ngày hết hạn
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.expiry_days}
                    onChange={(e) => setFormData({ ...formData, expiry_days: parseInt(e.target.value) })}
                    className="glass-input w-full px-4 py-3 rounded-xl text-white"
                    title="Số ngày hết hạn"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-200 mb-2">
                    <DollarSign className="w-4 h-4" />
                    Giá trị ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: parseInt(e.target.value) })}
                    className="glass-input w-full px-4 py-3 rounded-xl text-white"
                    title="Giá trị"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="glass-button px-6 py-3 rounded-xl text-white font-semibold flex items-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {editingId ? 'Cập nhật' : 'Thêm Token'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="glass-hover px-6 py-3 rounded-xl text-gray-300 font-semibold flex items-center gap-2"
                  >
                    <X className="w-5 h-5" />
                    Hủy
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Tokens List */}
          <div className="glass-card rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-8 py-6 border-b border-white/10">
              <h2 className="text-2xl font-semibold text-white">Danh sách Token</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Sản phẩm</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Category</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Giá trị</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Hạn dùng</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Trạng thái</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Người mua</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {tokens.map((token) => {
                    const otp = otpData[token._id];
                    const isExpanded = expandedText[token._id];
                    
                    return (
                      <>
                        <tr key={token._id} className="glass-hover">
                          <td className="px-6 py-4 text-sm text-gray-300">
                            <div className="font-semibold text-white">{token.name}</div>
                            {token.token && (
                              <div className="text-xs text-gray-500 max-w-[150px] truncate" title={token.token}>
                                {token.token}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span className="px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-medium">
                              {token.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-300">{token.email || 'N/A'}</td>
                          <td className="px-6 py-4 text-sm text-gray-300">${token.value}</td>
                          <td className="px-6 py-4 text-sm text-gray-300">{token.expiry_days} ngày</td>
                          <td className="px-6 py-4 text-sm">
                            {token.is_taken ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-500/20 text-red-400">
                                <XCircle className="w-4 h-4" />
                                Đã bán
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/20 text-green-400">
                                <CheckCircle className="w-4 h-4" />
                                Còn hàng
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-300">
                            {token.customerId ? (
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                {token.customerId.username}
                              </div>
                            ) : (
                              'Chưa có'
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="flex gap-2">
                              {token.email && (
                                <button
                                  onClick={() => setViewingOtpId(viewingOtpId === token._id ? null : token._id)}
                                  className="p-2 rounded-lg glass-hover text-green-400 hover:text-green-300"
                                  title="Xem OTP"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => handleEdit(token)}
                                className="p-2 rounded-lg glass-hover text-blue-400 hover:text-blue-300"
                                title="Chỉnh sửa"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(token._id)}
                                className="p-2 rounded-lg glass-hover text-red-400 hover:text-red-300"
                                title="Xóa"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                        
                        {viewingOtpId === token._id && (
                          <tr key={`otp-${token._id}`} className="bg-white/5">
                            <td colSpan={8} className="px-6 py-6">
                              <div className="glass-card rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                  <Mail className="w-5 h-5" />
                                  OTP cho token: {token.email}
                                </h3>
                                
                                {!otp ? (
                                  <div className="text-center py-4">
                                    <button
                                      onClick={() => fetchOTP(token._id)}
                                      disabled={fetchingOtp === token._id}
                                      className="glass-button px-6 py-3 rounded-xl text-white font-semibold inline-flex items-center gap-2 disabled:opacity-50"
                                    >
                                      {fetchingOtp === token._id ? (
                                        <>
                                          <Loader className="w-5 h-5 animate-spin" />
                                          Đang lấy OTP...
                                        </>
                                      ) : (
                                        <>
                                          <Mail className="w-5 h-5" />
                                          Lấy mã OTP
                                        </>
                                      )}
                                    </button>
                                  </div>
                                ) : (
                                  <div className="space-y-4">
                                    {otp.otpCode && (
                                      <div>
                                        <label className="text-sm text-gray-400 mb-2 block">Mã OTP</label>
                                        <div className="flex items-center gap-3">
                                          <div className="glass-input flex-1 px-6 py-4 rounded-lg">
                                            <span className="text-4xl font-bold text-green-400 tracking-wider">
                                              {otp.otpCode}
                                            </span>
                                          </div>
                                          <button
                                            onClick={() => copyToClipboard(otp.otpCode!, 'OTP')}
                                            className="glass-button p-4 rounded-lg"
                                            title="Copy OTP"
                                          >
                                            <Copy className="w-6 h-6" />
                                          </button>
                                        </div>
                                      </div>
                                    )}

                                    {otp.htmlContent && (
                                      <div>
                                        <label className="text-sm text-gray-400 mb-2 block">Email HTML</label>
                                        <div className="glass-input px-4 py-3 rounded-lg max-h-96 overflow-auto">
                                          <div 
                                            className="prose prose-invert max-w-none"
                                            dangerouslySetInnerHTML={{ __html: otp.htmlContent }}
                                          />
                                        </div>
                                      </div>
                                    )}

                                    {otp.fullText && !otp.htmlContent && (
                                      <div>
                                        <label className="text-sm text-gray-400 mb-2 block">Nội dung đầy đủ</label>
                                        <div className="glass-input px-4 py-3 rounded-lg">
                                          <p className={`text-gray-300 text-sm whitespace-pre-wrap ${!isExpanded ? 'line-clamp-3' : ''}`}>
                                            {otp.fullText}
                                          </p>
                                          {otp.fullText.length > 150 && (
                                            <button
                                              onClick={() => toggleExpandText(token._id)}
                                              className="text-blue-400 hover:text-blue-300 text-sm mt-2 flex items-center gap-1"
                                            >
                                              {isExpanded ? (
                                                <>
                                                  Thu gọn <ChevronUp className="w-4 h-4" />
                                                </>
                                              ) : (
                                                <>
                                                  Xem thêm <ChevronDown className="w-4 h-4" />
                                                </>
                                              )}
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    )}

                                    <div className="flex items-center justify-between">
                                      <div className="text-xs text-gray-500">
                                        Lấy lúc: {new Date(otp.timestamp).toLocaleString('vi-VN')}
                                      </div>
                                      <button
                                        onClick={() => fetchOTP(token._id)}
                                        disabled={fetchingOtp === token._id}
                                        className="glass-hover px-4 py-2 rounded-lg text-white text-sm font-medium inline-flex items-center gap-2 disabled:opacity-50"
                                      >
                                        {fetchingOtp === token._id ? (
                                          <>
                                            <Loader className="w-4 h-4 animate-spin" />
                                            Đang làm mới...
                                          </>
                                        ) : (
                                          'Làm mới OTP'
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
