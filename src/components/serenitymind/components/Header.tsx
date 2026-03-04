
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="flex items-center justify-between px-4 md:px-6 py-3 bg-white/50 backdrop-blur-md z-50 border-b border-slate-200">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg shadow-indigo-200">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <h1 className="text-lg font-semibold tracking-tight text-slate-800">心语 SerenityMind</h1>
      </div>
      <div className="hidden md:block">
        <span className="text-xs uppercase tracking-widest text-slate-500 font-medium">安全空间 · 深度共情 · 贴心关怀</span>
      </div>
    </header>
  );
};

export default Header;
