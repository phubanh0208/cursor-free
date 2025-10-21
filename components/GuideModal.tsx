'use client';

import { X, BookOpen } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  categoryName: string;
  categoryDisplayName: string;
  guideHtml: string;
  onClose: () => void;
}

export default function GuideModal({
  isOpen,
  categoryName,
  categoryDisplayName,
  guideHtml,
  onClose
}: GuideModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="relative glass-card rounded-2xl p-6 max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col animate-scale-in">
        {/* Header */}
        <div className="flex items-start justify-between mb-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white capitalize">
                {categoryDisplayName || categoryName}
              </h3>
              <p className="text-sm text-gray-400">Hướng dẫn sử dụng</p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            aria-label="Đóng"
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div 
            className="prose prose-invert max-w-none
              prose-headings:text-white prose-headings:font-bold
              prose-h1:text-3xl prose-h1:mb-4
              prose-h2:text-2xl prose-h2:mb-3 prose-h2:mt-6
              prose-h3:text-xl prose-h3:mb-2 prose-h3:mt-4
              prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-4
              prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
              prose-strong:text-white prose-strong:font-semibold
              prose-em:text-gray-300
              prose-ul:text-gray-300 prose-ul:list-disc prose-ul:ml-6
              prose-ol:text-gray-300 prose-ol:list-decimal prose-ol:ml-6
              prose-li:mb-2
              prose-code:text-blue-400 prose-code:bg-white/5 prose-code:px-2 prose-code:py-1 prose-code:rounded
              prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/10 prose-pre:rounded-xl
              prose-img:rounded-xl prose-img:border prose-img:border-white/10
              prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-4 prose-blockquote:italic
            "
            dangerouslySetInnerHTML={{ __html: guideHtml }}
          />
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/10 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all"
          >
            Đã hiểu
          </button>
        </div>
      </div>
    </div>
  );
}

