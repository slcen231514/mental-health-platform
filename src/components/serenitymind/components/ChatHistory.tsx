
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Message } from '../types';

interface ChatHistoryProps {
  messages: Message[];
  currentInput: string;
  currentOutput: string;
  isStreaming?: boolean;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ messages, currentInput, currentOutput, isStreaming }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  // 过滤逻辑：匹配消息文本或引用源标题
  const filteredMessages = useMemo(() => {
    if (!searchTerm.trim()) return messages;
    
    const term = searchTerm.toLowerCase();
    return messages.filter(msg => {
      const textMatch = msg.text.toLowerCase().includes(term);
      const sourceMatch = msg.groundingSources?.some(source => 
        source.title.toLowerCase().includes(term)
      );
      return textMatch || sourceMatch;
    });
  }, [messages, searchTerm]);

  // 自动滚动逻辑
  useEffect(() => {
    if (!searchTerm && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, currentInput, currentOutput, searchTerm, isStreaming]);

  return (
    <div className="flex flex-col h-full bg-white/30 px-4 md:px-6">
      {/* 搜索工具栏 */}
      <div className={`transition-all duration-300 overflow-hidden flex-shrink-0 ${isSearchVisible ? 'py-3 border-b border-indigo-50 bg-white/50' : 'h-0 opacity-0'}`}>
        <div className="relative flex items-center">
          <svg className="absolute left-3 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="搜索对话记录或链接..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-10 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none transition-all"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-3 p-1 text-slate-400 hover:text-indigo-500"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* 搜索切换按钮 */}
      <div className="flex justify-end pt-2 flex-shrink-0">
        <button 
          onClick={() => {
            setIsSearchVisible(!isSearchVisible);
            if (isSearchVisible) setSearchTerm('');
          }}
          className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${
            isSearchVisible ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400 hover:text-indigo-500 hover:bg-slate-100'
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span>{isSearchVisible ? '关闭搜索' : '搜索历史'}</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-2 space-y-4 scroll-smooth min-h-0" ref={scrollRef}>
        {messages.length === 0 && !currentInput && !currentOutput && !isStreaming && (
          <div className="text-center py-8 animate-fade-in">
            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-slate-400 text-sm italic font-light tracking-wide">“你好，我是心语。我在这里倾听，准备好后请随时告诉我你的感受。”</p>
          </div>
        )}

        {searchTerm && filteredMessages.length === 0 && (
          <div className="text-center py-4">
            <p className="text-slate-400 text-sm italic">没有找到包含“{searchTerm}”的对话内容</p>
          </div>
        )}
        
        {filteredMessages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2 duration-300 space-y-2`}>
            <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm text-[15px] leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-indigo-500 text-white rounded-tr-none' 
                : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none shadow-sm'
            }`}>
              {msg.text}
            </div>
            
            {msg.groundingSources && msg.groundingSources.length > 0 && (
              <div className="flex flex-wrap gap-2 max-w-[85%]">
                {msg.groundingSources.map((source, idx) => (
                  <a 
                    key={idx} 
                    href={source.uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 px-2 py-1 bg-slate-100 hover:bg-indigo-100 text-slate-600 hover:text-indigo-600 rounded-md text-[11px] font-medium transition-colors border border-slate-200"
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                    <span className="truncate max-w-[120px]">{source.title}</span>
                  </a>
                ))}
              </div>
            )}
            <div className={`text-[10px] text-slate-300 px-1 font-medium ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}

        {/* 正在进行中的内容或加载指示器 */}
        {!searchTerm && (currentInput || currentOutput || isStreaming) && (
          <div className="space-y-4">
            {currentInput && (
              <div className="flex justify-end opacity-70">
                <div className="max-w-[85%] p-4 rounded-2xl bg-indigo-400 text-white text-sm rounded-tr-none italic animate-pulse">
                  {currentInput}
                </div>
              </div>
            )}

            {isStreaming && !currentOutput ? (
              /* 加载指示器 - Inspiration Ripple */
              <div className="flex justify-start animate-in fade-in slide-in-from-left-2 duration-500">
                <div className="max-w-[85%] bg-white/60 backdrop-blur-sm border border-indigo-100/50 p-4 rounded-2xl rounded-tl-none shadow-sm flex flex-col space-y-2">
                  <div className="flex space-x-1.5 items-center py-1">
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                  </div>
                  <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-[0.15em] opacity-80">心语正在感知并思索中...</span>
                </div>
              </div>
            ) : currentOutput ? (
              <div className="flex justify-start">
                <div className="max-w-[85%] p-4 rounded-2xl bg-white border border-slate-200 text-slate-800 text-sm rounded-tl-none shadow-sm relative overflow-hidden">
                  {currentOutput}
                  {isStreaming && <span className="inline-block w-1.5 h-4 bg-indigo-400 ml-1.5 animate-pulse align-middle rounded-full"></span>}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatHistory;
