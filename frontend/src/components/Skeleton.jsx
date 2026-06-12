import React from 'react';

// Common shimmer background utility class
const SHIMMER_CLASS = "animate-pulse bg-slate-800/50 rounded-lg";

export function SkeletonText({ lines = 3, className = "" }) {
  return (
    <div className={`space-y-2.5 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => {
        // Vary widths to look like natural text lines
        const widthClass = i % 3 === 0 ? 'w-full' : i % 3 === 1 ? 'w-5/6' : 'w-2/3';
        return <div key={i} className={`h-3 ${SHIMMER_CLASS} ${widthClass}`} />;
      })}
    </div>
  );
}

export function SkeletonCard({ className = "" }) {
  return (
    <div className={`bg-slate-900/40 border border-slate-850 p-6 rounded-2xl space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 ${SHIMMER_CLASS} rounded-lg`} />
        <div className="space-y-1.5 flex-1">
          <div className={`h-3.5 w-1/3 ${SHIMMER_CLASS}`} />
          <div className={`h-2.5 w-1/5 ${SHIMMER_CLASS}`} />
        </div>
      </div>
      {/* Divider */}
      <div className="h-px bg-slate-850/60" />
      {/* Body Rows */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <div className={`h-2.5 w-1/2 ${SHIMMER_CLASS}`} />
          <div className={`h-3 w-3/4 ${SHIMMER_CLASS}`} />
        </div>
        <div className="space-y-1.5">
          <div className={`h-2.5 w-1/2 ${SHIMMER_CLASS}`} />
          <div className={`h-3 w-3/4 ${SHIMMER_CLASS}`} />
        </div>
      </div>
    </div>
  );
}

export function SkeletonGraph({ className = "" }) {
  return (
    <div className={`h-[400px] w-full bg-slate-950/45 border border-slate-850 rounded-2xl flex flex-col p-6 overflow-hidden relative ${className}`}>
      {/* Toolbar shimmer */}
      <div className="flex items-center justify-between mb-8">
        <div className={`w-32 h-6 ${SHIMMER_CLASS}`} />
        <div className="flex gap-2">
          <div className={`w-8 h-8 ${SHIMMER_CLASS} rounded-full`} />
          <div className={`w-8 h-8 ${SHIMMER_CLASS} rounded-full`} />
        </div>
      </div>
      
      {/* Nodes visual map simulation */}
      <div className="flex-1 flex flex-col items-center justify-center relative">
        {/* Deceased member root node */}
        <div className={`w-44 h-16 ${SHIMMER_CLASS} border border-slate-700/30 flex items-center justify-center relative z-10 mb-16`} />
        
        {/* Child nodes */}
        <div className="flex justify-around w-full">
          <div className={`w-36 h-20 ${SHIMMER_CLASS} border border-slate-700/30`} />
          <div className={`w-36 h-20 ${SHIMMER_CLASS} border border-slate-700/30`} />
          <div className={`w-36 h-20 ${SHIMMER_CLASS} border border-slate-700/30`} />
        </div>

        {/* Diagonal connection line shimmers */}
        <div className="absolute inset-0 pointer-events-none opacity-25 flex items-center justify-center">
          <svg className="w-full h-full text-slate-800" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="50%" y1="35%" x2="20%" y2="70%" strokeDasharray="4 4" />
            <line x1="50%" y1="35%" x2="50%" y2="70%" strokeDasharray="4 4" />
            <line x1="50%" y1="35%" x2="80%" y2="70%" strokeDasharray="4 4" />
          </svg>
        </div>
      </div>
    </div>
  );
}

// Default export bundles all skeletons so both
// `import Skeleton from './Skeleton'` and named imports work.
export default { SkeletonText, SkeletonCard, SkeletonGraph };
