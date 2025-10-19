'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { useToast } from '@/components/ToastContainer';
import { Mail, Lock, Loader, Code, Copy, CheckCircle, AlertCircle, Play, Shuffle, ExternalLink } from 'lucide-react';

interface UserData {
  username: string;
  email: string;
  role: 'admin' | 'customer';
}

interface AutomationResult {
  success: boolean;
  authLink?: string;
  authCode?: string;
  email?: string;
  ide?: string;
  error?: string;
  logs?: string[];
  screenshots?: string[];
}

export default function KombaiAutomationPage() {
  const router = useRouter();
  const toast = useToast();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  
  // Form data
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [ide, setIde] = useState<'cursor' | 'vscode'>('cursor');
  const [signupUrl, setSignupUrl] = useState('');
  
  // Result data
  const [result, setResult] = useState<AutomationResult | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);

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
    
    if (!email || !password) {
      toast.showWarning('Vui lòng nhập đầy đủ email và password!');
      return;
    }

    setLoading(true);
    setResult(null);
    setLogs([]);

    try {
      const response = await fetch('/api/admin/kombai-automation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, ide, signupUrl: signupUrl || undefined }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Automation failed');
      }

      setResult(data);
      setLogs(data.logs || []);
      
      if (data.success) {
        toast.showSuccess('🎉 Automation thành công!');
        
        // Auto open auth callback link with countdown
        if (data.authLink) {
          setRedirectCountdown(5);
          const countdownInterval = setInterval(() => {
            setRedirectCountdown((prev) => {
              if (prev === null || prev <= 1) {
                clearInterval(countdownInterval);
                window.location.href = data.authLink;
                return null;
              }
              return prev - 1;
            });
          }, 1000);
        }
      } else {
        toast.showError('Automation thất bại: ' + (data.error || 'Unknown error'));
      }
    } catch (error: any) {
      toast.showError('Lỗi: ' + error.message);
      console.error('Automation error:', error);
      setResult({
        success: false,
        error: error.message,
      });
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

  const handleReset = () => {
    setEmail('');
    setPassword('');
    setIde('cursor');
    setSignupUrl('');
    setResult(null);
    setLogs([]);
  };

  const generateRandomEmail = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    const randomEmail = `test${timestamp}${random}@hocbaohiem.icu`;
    setEmail(randomEmail);
    toast.showSuccess('Generated random email!');
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
      
      
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <Code className="w-10 h-10" />
              Kombai Automation
            </h1>
            <p className="text-gray-400">Tự động đăng ký tài khoản Kombai và lấy auth code</p>
          </div>

          {/* Form */}
          <div className="glass-card rounded-2xl shadow-2xl p-8 mb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-gray-200 mb-2">
                  <Mail className="w-4 h-4" />
                  Email
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="glass-input flex-1 px-4 py-3 rounded-xl text-white placeholder-gray-400"
                    placeholder="user@example.com"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={generateRandomEmail}
                    disabled={loading}
                    className="glass-button px-4 py-3 rounded-xl flex items-center gap-2"
                    title="Generate random email"
                  >
                    <Shuffle className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Dùng email mới để tránh conflict với account đã tồn tại
                </p>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="flex items-center gap-2 text-sm font-medium text-gray-200 mb-2">
                  <Lock className="w-4 h-4" />
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="glass-input w-full px-4 py-3 rounded-xl text-white placeholder-gray-400"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
              </div>

              {/* Signup URL (Optional) */}
              <div>
                <label htmlFor="signupUrl" className="flex items-center gap-2 text-sm font-medium text-gray-200 mb-2">
                  <Code className="w-4 h-4" />
                  Signup URL (Optional)
                </label>
                <input
                  type="url"
                  id="signupUrl"
                  value={signupUrl}
                  onChange={(e) => setSignupUrl(e.target.value)}
                  className="glass-input w-full px-4 py-3 rounded-xl text-white placeholder-gray-400 text-sm"
                  placeholder="https://agent.kombai.com/vscode-connect?..."
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Để trống để sử dụng URL mặc định theo IDE đã chọn
                </p>
              </div>

              {/* IDE Selection */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-200 mb-3">
                  <Code className="w-4 h-4" />
                  IDE
                </label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setIde('cursor')}
                    disabled={loading}
                    className={`flex-1 px-6 py-4 rounded-xl font-semibold transition-all ${
                      ide === 'cursor'
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                        : 'glass-card text-gray-400 hover:text-white'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Code className="w-6 h-6" />
                      <span>Cursor</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIde('vscode')}
                    disabled={loading}
                    className={`flex-1 px-6 py-4 rounded-xl font-semibold transition-all ${
                      ide === 'vscode'
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                        : 'glass-card text-gray-400 hover:text-white'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Code className="w-6 h-6" />
                      <span>VS Code</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="glass-button w-full py-4 rounded-xl text-white font-semibold flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Đang chạy automation...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    Chạy Automation
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Logs */}
          {logs.length > 0 && (
            <div className="glass-card rounded-2xl shadow-2xl p-6 mb-8">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Logs
              </h2>
              <div className="bg-black/30 rounded-lg p-4 max-h-64 overflow-y-auto font-mono text-sm">
                {logs.map((log, index) => (
                  <div key={index} className="text-gray-300 mb-1">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className={`glass-card rounded-2xl shadow-2xl p-8 ${
              result.success ? 'border-2 border-green-500/50' : 'border-2 border-red-500/50'
            }`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  {result.success ? (
                    <>
                      <CheckCircle className="w-8 h-8 text-green-400" />
                      <h2 className="text-2xl font-bold text-white">Thành công! 🎉</h2>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-8 h-8 text-red-400" />
                      <h2 className="text-2xl font-bold text-white">Thất bại</h2>
                    </>
                  )}
                </div>
                
                {/* Countdown */}
                {redirectCountdown !== null && result.success && (
                  <div className="flex items-center gap-2 bg-green-500/20 px-4 py-2 rounded-lg">
                    <Loader className="w-5 h-5 text-green-400 animate-spin" />
                    <span className="text-green-400 font-semibold">
                      Redirecting in {redirectCountdown}s...
                    </span>
                  </div>
                )}
              </div>

              {result.success ? (
                <div className="space-y-6">
                  {/* Auth Code */}
                  {result.authCode && (
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Auth Code</label>
                      <div className="flex items-center gap-3">
                        <div className="glass-input flex-1 px-6 py-4 rounded-lg">
                          <span className="text-2xl font-bold text-green-400 tracking-wider">
                            {result.authCode}
                          </span>
                        </div>
                        <button
                          onClick={() => copyToClipboard(result.authCode!, 'Auth Code')}
                          className="glass-button p-4 rounded-lg"
                          title="Copy Auth Code"
                        >
                          <Copy className="w-6 h-6" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Auth Link */}
                  {result.authLink && (
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Auth Callback Link</label>
                      <div className="flex items-center gap-3">
                        <div className="glass-input flex-1 px-4 py-3 rounded-lg overflow-x-auto">
                          <code className="text-sm text-blue-400 break-all">
                            {result.authLink}
                          </code>
                        </div>
                        <button
                          onClick={() => window.location.href = result.authLink!}
                          className="glass-button p-3 rounded-lg bg-green-500/20 hover:bg-green-500/30"
                          title="Open Link"
                        >
                          <ExternalLink className="w-5 h-5 text-green-400" />
                        </button>
                        <button
                          onClick={() => copyToClipboard(result.authLink!, 'Auth Link')}
                          className="glass-button p-3 rounded-lg"
                          title="Copy Auth Link"
                        >
                          <Copy className="w-5 h-5" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {redirectCountdown !== null 
                          ? `Tự động mở sau ${redirectCountdown} giây hoặc click 🔗 để mở ngay`
                          : 'Click 🔗 để mở link'
                        }
                      </p>
                    </div>
                  )}

                  {/* Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="glass-card p-4 rounded-lg">
                      <div className="text-sm text-gray-400 mb-1">Email</div>
                      <div className="text-white font-medium">{result.email}</div>
                    </div>
                    <div className="glass-card p-4 rounded-lg">
                      <div className="text-sm text-gray-400 mb-1">IDE</div>
                      <div className="text-white font-medium uppercase">{result.ide}</div>
                    </div>
                  </div>

                  {/* Screenshots */}
                  {result.screenshots && result.screenshots.length > 0 && (
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">
                        Screenshots ({result.screenshots.length})
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        {result.screenshots.map((screenshot, index) => (
                          <div key={index} className="glass-card p-2 rounded-lg">
                            <a 
                              href={screenshot} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="block hover:opacity-80 transition-opacity"
                            >
                              <img 
                                src={screenshot} 
                                alt={`Screenshot ${index + 1}`} 
                                className="w-full h-auto rounded"
                              />
                              <p className="text-xs text-gray-500 mt-2 text-center">
                                Click to view full size
                              </p>
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={handleReset}
                      className="glass-button flex-1 py-3 rounded-xl text-white font-semibold"
                    >
                      Chạy lại
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                    <p className="text-red-400">{result.error}</p>
                  </div>
                  <button
                    onClick={handleReset}
                    className="glass-button w-full py-3 rounded-xl text-white font-semibold"
                  >
                    Thử lại
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

