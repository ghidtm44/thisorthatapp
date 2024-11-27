import React from 'react';

interface VoteButtonProps {
  color: string;
  count: number;
  onClick: () => void;
  isLoading: boolean;
  label: string;
}

export function VoteButton({ color, count, onClick, isLoading, label }: VoteButtonProps) {
  const baseClasses = "w-full sm:w-48 h-32 sm:h-48 rounded-2xl shadow-xl transition-all transform hover:scale-105 hover:shadow-2xl flex flex-col items-center justify-center text-white font-bold text-xl sm:text-2xl relative overflow-hidden";

  return (
    <div className="flex flex-col items-center gap-4 sm:gap-6 w-full sm:w-auto">
      <div className="text-3xl sm:text-4xl font-bold text-slate-700">{count}</div>
      <button
        onClick={onClick}
        disabled={isLoading}
        className={`${baseClasses} ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
        style={{
          background: `linear-gradient(135deg, ${color}, ${color}dd)`,
        }}
      >
        <div className="absolute inset-0 bg-white/10 transform -skew-y-12"></div>
        <span className="relative z-10 px-4 text-center">
          {isLoading ? 'Voting...' : label}
        </span>
      </button>
    </div>
  );
}