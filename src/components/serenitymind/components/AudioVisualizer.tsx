
import React from 'react';

interface AudioVisualizerProps {
  isActive: boolean;
  isConnecting: boolean;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ isActive, isConnecting }) => {
  return (
    <div className="flex items-center justify-center h-48 relative">
      <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 ${
        isConnecting ? 'bg-slate-200' : (isActive ? 'bg-indigo-500/10 scale-110' : 'bg-white shadow-xl shadow-indigo-100')
      }`}>
        <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
          isConnecting ? 'bg-slate-300 animate-pulse' : (isActive ? 'bg-indigo-500 animate-bounce' : 'bg-indigo-400 shadow-md')
        }`}>
          {isConnecting ? (
            <svg className="animate-spin h-8 w-8 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          )}
        </div>
      </div>
      
      {isActive && !isConnecting && (
        <>
          <div className="absolute inset-0 flex items-center justify-center -z-10">
            <div className="w-32 h-32 rounded-full border-2 border-indigo-400 animate-ping opacity-20"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center -z-10">
            <div className="w-32 h-32 rounded-full border border-indigo-200 animate-ping opacity-10 [animation-delay:0.5s]"></div>
          </div>
        </>
      )}
    </div>
  );
};

export default AudioVisualizer;
