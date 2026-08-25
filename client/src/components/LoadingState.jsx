import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingState = ({ message = 'Loading requests...', height = 'py-12' }) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center ${height} px-4`}>
      <div className="relative flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-amber-50 text-amber-600 shadow-sm border border-amber-100">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
      <p className="text-base font-medium text-slate-700">{message}</p>
      <p className="mt-1 text-xs text-slate-400">Connecting hungry hearts with surplus food...</p>
    </div>
  );
};

export default LoadingState;
