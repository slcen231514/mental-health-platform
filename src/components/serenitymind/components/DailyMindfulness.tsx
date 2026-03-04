
import React from 'react';

interface DailyMindfulnessProps {
  content: string;
  isVisible: boolean;
  onClose: () => void;
}

const DailyMindfulness: React.FC<DailyMindfulnessProps> = ({ content, isVisible, onClose }) => {
  if (!isVisible || !content) return null;

  return (
    <div className="px-6 py-4 animate-in fade-in slide-in-from-top-2 duration-700">
      <div className="bg-gradient-to-r from-orange-50/80 to-rose-50/80 border border-orange-100 rounded-2xl p-4 shadow-sm relative group overflow-hidden">
        {/* 背景装饰 */}
        <div className="absolute -right-4 -top-4 w-20 h-20 bg-orange-200/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
        
        <div className="flex items-start space-x-4 relative z-10">
          <div className="flex-shrink-0 w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-orange-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
            </svg>
          </div>
          
          <div className="flex-1 pr-4">
            <h3 className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] mb-1 whitespace-nowrap">今日正念 · Daily Mindfulness</h3>
            <p className="text-slate-700 text-sm leading-relaxed font-medium italic break-words">
              “{content}”
            </p>
          </div>

          <button 
            onClick={onClose}
            className="flex-shrink-0 p-1 text-slate-300 hover:text-orange-400 transition-colors"
            title="稍后再读"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DailyMindfulness;
