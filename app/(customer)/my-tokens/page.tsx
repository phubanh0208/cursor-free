'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { useToast } from '@/components/ToastContainer';
import { 
  Package, 
  Key, 
  Mail, 
  Lock, 
  Calendar,
  DollarSign,
  Clock,
  Copy,
  CheckCircle,
  Loader,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface Token {
  _id: string;
  name: string;
  category: string;
  token?: string;
  email?: string;
  password?: string;
  value: number;
  expiry_days: number;
  purchaseDate: string;
  day_create: string;
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

export default function MyTokensPage() {
  const router = useRouter();
  const toast = useToast();
  const [user, setUser] = useState<UserData | null>(null);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [otpData, setOtpData] = useState<{ [key: string]: OTPData }>({});
  const [fetchingOtp, setFetchingOtp] = useState<string | null>(null);
  const [expandedText, setExpandedText] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    checkAuth();
    fetchMyTokens();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (!response.ok) {
        router.push('/login');
        return;
      }
      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      router.push('/login');
    }
  };

  const fetchMyTokens = async () => {
    try {
      const response = await fetch('/api/customer/my-tokens');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setTokens(data.tokens);
    } catch (error) {
      console.error('Error fetching tokens:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOTP = async (tokenId: string) => {
    setFetchingOtp(tokenId);
    try {
      const response = await fetch(`/api/customer/otp?tokenId=${tokenId}`);
      const data = await response.json();

      if (!response.ok) {
        toast.showError((data.error || 'Failed to fetch OTP') + (data.details ? '\n' + data.details : ''));
        return;
      }

      setOtpData(prev => ({ ...prev, [tokenId]: data }));
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
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-3 flex items-center gap-3">
              <Package className="w-10 h-10" />
              Token của tôi
            </h1>
            <p className="text-gray-300 text-lg">
              Quản lý và xem thông tin các token đã mua
            </p>
          </div>

          {/* Tokens List */}
          {tokens.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-white mb-2">
                Bạn chưa có token nào
              </h2>
              <p className="text-gray-400 mb-6">
                Hãy vào cửa hàng để mua token
              </p>
              <button
                onClick={() => router.push('/shop')}
                className="glass-button px-6 py-3 rounded-xl text-white font-semibold inline-flex items-center gap-2"
              >
                Đến cửa hàng
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {tokens.map((token) => {
                const otp = otpData[token._id];
                const isExpanded = expandedText[token._id];

                return (
                  <div key={token._id} className="glass-card rounded-2xl p-6">
                    {/* Product Name & Category Header */}
                    <div className="mb-6 pb-4 border-b border-white/10">
                      <h2 className="text-2xl font-bold text-white mb-2">{token.name}</h2>
                      <span className="inline-block px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-sm font-medium capitalize">
                        {token.category}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Left: Token Info */}
                      <div className="space-y-4">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                          <Key className="w-5 h-5" />
                          Thông tin Token
                        </h3>

                        {token.token && (
                          <div>
                            <label className="text-sm text-gray-400 mb-1 block">Token</label>
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={token.token}
                                readOnly
                                className="glass-input flex-1 px-4 py-2 rounded-lg text-white text-sm"
                                title={token.token}
                              />
                              <button
                                onClick={() => copyToClipboard(token.token!, 'token')}
                                className="glass-button p-2 rounded-lg"
                                title="Copy token"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}

                        {token.email && (
                          <div>
                            <label className="text-sm text-gray-400 mb-1 block flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              Email
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={token.email}
                                readOnly
                                className="glass-input flex-1 px-4 py-2 rounded-lg text-white text-sm"
                                title={token.email}
                              />
                              <button
                                onClick={() => copyToClipboard(token.email!, 'email')}
                                className="glass-button p-2 rounded-lg"
                                title="Copy email"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}

                        {token.password && (
                          <div>
                            <label className="text-sm text-gray-400 mb-1 block flex items-center gap-2">
                              <Lock className="w-4 h-4" />
                              Password
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={token.password}
                                readOnly
                                className="glass-input flex-1 px-4 py-2 rounded-lg text-white text-sm"
                                title={token.password}
                              />
                              <button
                                onClick={() => copyToClipboard(token.password!, 'password')}
                                className="glass-button p-2 rounded-lg"
                                title="Copy password"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 pt-2">
                          <div>
                            <label className="text-sm text-gray-400 mb-1 block flex items-center gap-2">
                              <DollarSign className="w-4 h-4" />
                              Giá trị
                            </label>
                            <div className="text-white font-semibold">${token.value}</div>
                          </div>

                          <div>
                            <label className="text-sm text-gray-400 mb-1 block flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              Hạn dùng
                            </label>
                            <div className="text-white font-semibold">{token.expiry_days} ngày</div>
                          </div>

                          <div>
                            <label className="text-sm text-gray-400 mb-1 block flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              Ngày mua
                            </label>
                            <div className="text-white font-semibold">
                              {new Date(token.purchaseDate).toLocaleDateString('vi-VN')}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: OTP */}
                      <div className="space-y-4">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                          <Mail className="w-5 h-5" />
                          Mã OTP
                        </h3>

                        {!otp ? (
                          <div className="text-center py-8">
                            <button
                              onClick={() => fetchOTP(token._id)}
                              disabled={fetchingOtp === token._id || !token.email}
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
                                  {token.email ? 'Lấy mã OTP' : 'Không có email'}
                                </>
                              )}
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {otp.otpCode && (
                              <div>
                                <label className="text-sm text-gray-400 mb-1 block">Mã OTP</label>
                                <div className="flex items-center gap-2">
                                  <div className="glass-input flex-1 px-4 py-3 rounded-lg">
                                    <span className="text-3xl font-bold text-green-400 tracking-wider">
                                      {otp.otpCode}
                                    </span>
                                  </div>
                                  <button
                                    onClick={() => copyToClipboard(otp.otpCode!, 'OTP')}
                                    className="glass-button p-3 rounded-lg"
                                    title="Copy OTP"
                                  >
                                    <Copy className="w-5 h-5" />
                                  </button>
                                </div>
                              </div>
                            )}

                            {otp.htmlContent && (
                              <div>
                                <label className="text-sm text-gray-400 mb-1 block">Email HTML</label>
                                <div className="glass-input px-4 py-3 rounded-lg max-h-96 overflow-auto">
                                  <div 
                                    className="prose prose-invert max-w-none text-sm"
                                    dangerouslySetInnerHTML={{ __html: otp.htmlContent }}
                                  />
                                </div>
                              </div>
                            )}

                            {otp.fullText && !otp.htmlContent && (
                              <div>
                                <label className="text-sm text-gray-400 mb-1 block">Nội dung đầy đủ</label>
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
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

