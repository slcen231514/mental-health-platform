
import React from 'react';
import { EmotionState } from '../types';

interface EmotionPulseProps {
  emotions: EmotionState;
}

const EmotionPulse: React.FC<EmotionPulseProps> = ({ emotions }) => {
  return (
    <div className="px-6 py-2 bg-white/20 backdrop-blur-sm border-b border-white/30 flex items-center justify-between animate-in fade-in slide-in-from-top-1">
      {/* 用户状态部分 */}
      <div className="flex items-center space-x-2 flex-shrink-0">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">你的状态</span>
        <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-full border transition-all duration-500 shadow-sm ${emotions.user.color} bg-white/80 min-w-fit`}>
          <span className="text-sm flex-shrink-0">{emotions.user.icon}</span>
          <span className="text-xs font-bold whitespace-nowrap">{emotions.user.label}</span>
        </div>
      </div>

      {/* 动态间隔线：在空间不足时自动收缩 */}
      <div className="flex-1 flex justify-center min-w-[12px]">
        <div className="h-[1px] w-full max-w-[32px] bg-slate-200 opacity-50"></div>
      </div>

      {/* AI 姿态部分 */}
      <div className="flex items-center space-x-2 text-right flex-shrink-0">
        <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-full border transition-all duration-500 shadow-sm ${emotions.ai.color} bg-white/80 min-w-fit`}>
          <span className="text-xs font-bold whitespace-nowrap">{emotions.ai.label}</span>
          <span className="text-sm flex-shrink-0">{emotions.ai.icon}</span>
        </div>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">心语姿态</span>
      </div>
    </div>
  );
};

export default EmotionPulse;
