'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Loader, Copy, ChevronDown, ChevronUp, Send } from 'lucide-react';
import { useToast } from '@/components/ToastContainer';
import Sidebar from '@/components/Sidebar';

interface OTPResponse {
  email: string;
  fullText: string;
  htmlContent?: string | null;
  otpCode: string | null;
  timestamp: string;
}

interface UserData {
  username: string;
  email: string;
  role: 'admin' | 'customer';
}

export default function OTPCheckPage() {
  const router = useRouter();
  const toast = useToast();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [otpData, setOtpData] = useState<OTPResponse | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (!response.ok) {
        router.push('/login');
        return;
      }
      const data = await response.json();
      
      // Chỉ admin mới được truy cập
      if (data.user.role !== 'admin') {
        router.push('/shop');
        return;
      }
      
      setUser(data.user);
    } catch (error) {
      router.push('/login');
    } finally {
      setPageLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.trim()) {
      toast.showWarning('Vui lòng nhập email!');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.showWarning('Email không hợp lệ!');
      return;
    }

    setLoading(true);
    setOtpData(null);

    try {
      // Call through our API endpoint instead of directly to webhook
      const response = await fetch('/api/admin/request-otp-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP ${response.status}`);
      }

      const responseText = await response.text();
      
      if (!responseText || responseText.trim().length === 0) {
        throw new Error('Webhook trả về response trống');
      }

      // Parse response
      let data;
      let otpCode = null;
      let fullText = responseText;
      let htmlContent = null;

      try {
        data = JSON.parse(responseText);
        htmlContent = data.html || data.htmlContent || data.htmlBody || null;
        fullText = data.text || data.message || data.content || data.body || responseText;
        
        const contentToSearch = htmlContent || fullText;
        
        // Extract OTP patterns
        const otpPatterns = [
          /\b\d{6}\b/,
          /(?:code|otp|verification)[:\s]*(\d{6})/i,
          /(\d{6})/,
        ];
        
        for (const pattern of otpPatterns) {
          const match = contentToSearch.match(pattern);
          if (match) {
            otpCode = match[1] || match[0];
            break;
          }
        }
      } catch (parseError) {
        if (responseText.includes('<') && responseText.includes('>')) {
          htmlContent = responseText;
        }
        
        const otpMatch = responseText.match(/\b\d{6}\b/);
        otpCode = otpMatch ? otpMatch[0] : null;
      }

      setOtpData({
        email: email.trim(),
        fullText,
        htmlContent,
        otpCode,
        timestamp: new Date().toISOString(),
      });

      toast.showSuccess('Đã lấy OTP thành công!');
    } catch (error: any) {
      console.error('Error:', error);
      toast.showError('Lỗi: ' + error.message);
    } finally {
      setLoading(false);
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

  if (pageLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl flex items-center gap-3">
          <Loader className="w-6 h-6 animate-spin" />
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">      
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 mb-4">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">
            Lấy OTP Email
          </h1>
          <p className="text-gray-300 text-lg">
            Nhập email để nhận mã OTP xác thực
          </p>
        </div>

        {/* Form */}
        <div className="glass-card rounded-2xl shadow-2xl p-8 mb-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-200 mb-2">
                <Mail className="w-4 h-4" />
                Email <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="glass-input w-full px-4 py-3 rounded-xl text-white placeholder-gray-400"
                placeholder="example@email.com"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="glass-button w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Đang lấy OTP...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Lấy OTP
                </>
              )}
            </button>
          </form>
        </div>

        {/* OTP Result */}
        {otpData && (
          <div className="glass-card rounded-2xl shadow-2xl p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-2xl font-semibold text-white">Kết quả</h2>
              <span className="text-xs text-gray-500">
                {new Date(otpData.timestamp).toLocaleString('vi-VN')}
              </span>
            </div>

            {/* Email */}
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Email</label>
              <div className="glass-input px-4 py-3 rounded-lg">
                <p className="text-white font-medium">{otpData.email}</p>
              </div>
            </div>

            {/* OTP Code */}
            {otpData.otpCode ? (
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Mã OTP</label>
                <div className="flex items-center gap-3">
                  <div className="glass-input flex-1 px-6 py-4 rounded-lg text-center">
                    <span className="text-4xl font-bold text-green-400 tracking-wider">
                      {otpData.otpCode}
                    </span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(otpData.otpCode!, 'OTP')}
                    className="glass-button p-4 rounded-lg"
                    title="Copy OTP"
                  >
                    <Copy className="w-6 h-6" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="glass-input px-4 py-3 rounded-lg border-2 border-yellow-500/30">
                <p className="text-yellow-400 text-sm">
                  ⚠️ Không tìm thấy mã OTP 6 số trong response
                </p>
              </div>
            )}

            {/* HTML Content */}
            {otpData.htmlContent && (
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Email HTML</label>
                <div className="glass-input px-4 py-3 rounded-lg max-h-96 overflow-auto">
                  <div 
                    className="prose prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: otpData.htmlContent }}
                  />
                </div>
              </div>
            )}

            {/* Text Content */}
            {otpData.fullText && !otpData.htmlContent && (
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Nội dung đầy đủ</label>
                <div className="glass-input px-4 py-3 rounded-lg">
                  <p className={`text-gray-300 text-sm whitespace-pre-wrap ${!expanded ? 'line-clamp-5' : ''}`}>
                    {otpData.fullText}
                  </p>
                  {otpData.fullText.length > 200 && (
                    <button
                      onClick={() => setExpanded(!expanded)}
                      className="text-blue-400 hover:text-blue-300 text-sm mt-2 flex items-center gap-1"
                    >
                      {expanded ? (
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

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setOtpData(null);
                  setEmail('');
                  setExpanded(false);
                }}
                className="glass-hover flex-1 px-4 py-3 rounded-xl text-white font-medium"
              >
                Làm mới
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="glass-button flex-1 px-4 py-3 rounded-xl text-white font-medium disabled:opacity-50"
              >
                Lấy lại OTP
              </button>
            </div>
          </div>
        )}
        </div>
      </main>
    </div>
  );
}

