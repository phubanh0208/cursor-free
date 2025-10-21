'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ToastContainer';
import { 
  BookOpen, 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  X,
  FileText
} from 'lucide-react';

interface Category {
  _id: string;
  name: string;
  displayName: string;
  guide: string;
  createdAt: string;
  updatedAt: string;
}

export default function CategoryGuidesPage() {
  const router = useRouter();
  const toast = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    guide: '<p>Nhập hướng dẫn cho danh mục này...</p>'
  });
  const [saving, setSaving] = useState(false);
  const [categorySuggestions, setCategorySuggestions] = useState<string[]>([]);

  useEffect(() => {
    checkAuth();
    fetchCategories();
    fetchCategorySuggestions();
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
        router.push('/');
      }
    } catch (error) {
      router.push('/login');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setCategories(data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.showError('Không thể tải danh sách category');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategorySuggestions = async () => {
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
      const existingCategories = Array.from(new Set(data.tokens.map((t: any) => t.category))).filter(Boolean);
      
      // Merge và loại bỏ duplicate, ưu tiên existing categories
      const allCategories = [
        ...existingCategories,
        ...defaultCategories.filter((cat: string) => !existingCategories.includes(cat))
      ];
      
      setCategorySuggestions(allCategories as string[]);
    } catch (error) {
      console.error('Error fetching category suggestions:', error);
      // Fallback: chỉ hiển thị categories mặc định nếu API fail
      setCategorySuggestions([
        'chatgpt', 'claude', 'midjourney', 'github', 
        'netflix', 'spotify', 'youtube', 'canva'
      ]);
    }
  };

  const handleCreate = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      displayName: '',
      guide: '<p>Nhập hướng dẫn cho danh mục này...</p>'
    });
    setShowEditor(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      displayName: category.displayName,
      guide: category.guide
    });
    setShowEditor(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.displayName.trim()) {
      toast.showError('Vui lòng nhập tên category và tên hiển thị');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save');
      }

      toast.showSuccess('Đã lưu hướng dẫn thành công');
      setShowEditor(false);
      await fetchCategories();
      await fetchCategorySuggestions();
    } catch (error: any) {
      toast.showError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (name: string) => {
    if (!confirm(`Bạn có chắc muốn xóa hướng dẫn của "${name}"?`)) return;

    try {
      const response = await fetch(`/api/admin/categories/${name}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete');
      }

      toast.showSuccess('Đã xóa hướng dẫn thành công');
      await fetchCategories();
      await fetchCategorySuggestions();
    } catch (error: any) {
      toast.showError(error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-3 flex items-center gap-3">
              <BookOpen className="w-10 h-10" />
              Quản lý Hướng dẫn Category
            </h1>
            <p className="text-gray-300 text-lg">
              Tạo hướng dẫn HTML cho từng danh mục sản phẩm
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="glass-button px-6 py-3 rounded-xl text-white font-semibold flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Tạo mới
          </button>
        </div>

        {/* Categories List */}
        {categories.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-white mb-2">
              Chưa có hướng dẫn nào
            </h2>
            <p className="text-gray-400 mb-6">
              Tạo hướng dẫn đầu tiên cho category
            </p>
            <button
              onClick={handleCreate}
              className="glass-button px-6 py-3 rounded-xl text-white font-semibold inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Tạo mới
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <div
                key={category._id}
                className="glass-card rounded-2xl p-6 hover:scale-105 transition-transform"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className="p-2 rounded-lg glass-hover text-blue-400"
                      aria-label="Chỉnh sửa"
                      title="Chỉnh sửa hướng dẫn"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(category.name)}
                      className="p-2 rounded-lg glass-hover text-red-400"
                      aria-label="Xóa"
                      title="Xóa hướng dẫn"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-1 capitalize">
                  {category.displayName}
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                  {category.name}
                </p>

                <div className="text-xs text-gray-500">
                  Cập nhật: {new Date(category.updatedAt).toLocaleDateString('vi-VN')}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Editor Modal */}
        {showEditor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowEditor(false)}
            />
            
            {/* Dialog */}
            <div className="relative glass-card rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar">
              {/* Close button */}
              <button
                onClick={() => setShowEditor(false)}
                aria-label="Đóng"
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Title */}
              <h2 className="text-2xl font-bold text-white mb-6">
                {editingCategory ? 'Chỉnh sửa hướng dẫn' : 'Tạo hướng dẫn mới'}
              </h2>

              {/* Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tên Category (slug) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    list="category-suggestions-guides"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value.toLowerCase() })}
                    disabled={!!editingCategory}
                    placeholder="Chọn hoặc nhập mới (VD: chatgpt, netflix, spotify)"
                    className="w-full px-4 py-3 rounded-xl glass-input text-white lowercase disabled:opacity-50"
                  />
                  <datalist id="category-suggestions-guides">
                    {categorySuggestions.map((cat) => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                  <p className="text-xs text-gray-400 mt-1">
                    💡 Tên này phải trùng với category trong token. Sẽ tự động chuyển thành chữ thường
                  </p>
                  
                  {/* Quick Select Buttons */}
                  {!editingCategory && categorySuggestions.length > 0 && (
                    <div className="mt-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-gray-500">📌 Chọn nhanh:</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {categorySuggestions.slice(0, 12).map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setFormData({ ...formData, name: cat })}
                            className={`text-xs px-3 py-1.5 rounded-lg transition-all capitalize ${
                              formData.name === cat
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
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tên hiển thị <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    placeholder="VD: ChatGPT, Netflix, Spotify"
                    className="w-full px-4 py-3 rounded-xl glass-input text-white"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Tên này sẽ hiển thị cho khách hàng
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Hướng dẫn (HTML)
                  </label>
                  <textarea
                    value={formData.guide}
                    onChange={(e) => setFormData({ ...formData, guide: e.target.value })}
                    rows={15}
                    className="w-full px-4 py-3 rounded-xl glass-input text-white font-mono text-sm custom-scrollbar"
                    placeholder="<h2>Hướng dẫn sử dụng</h2><p>Nội dung...</p>"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Có thể dùng HTML tags: h1-h6, p, ul, ol, li, strong, em, br, a, img
                  </p>
                </div>

                {/* Preview */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Xem trước
                  </label>
                  <div 
                    className="glass-card rounded-xl p-4 prose prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: formData.guide }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowEditor(false)}
                  className="flex-1 px-4 py-3 rounded-xl glass-hover text-white font-semibold"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    'Đang lưu...'
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Lưu
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

