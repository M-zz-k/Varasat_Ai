import React from 'react';

function getWorksSvgIcon(name, classes = "w-5 h-5 text-slate-700") {
  switch (name) {
    case 'robot':
    case 'ai':
      return (
        <svg className={classes} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 3h6m-3 0v3m-5 3h10a2 2 0 012 2v6a2 2 0 01-2 2H7a2 2 0 01-2-2v-6a2 2 0 012-2z" />
        </svg>
      );
    case 'book':
    case 'rag':
      return (
        <svg className={classes} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
      );
    case 'lightning':
    case 'wolfram':
      return (
        <svg className={classes} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
      );
    case 'document':
    case 'pdf':
      return (
        <svg className={classes} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      );
    default:
      return null;
  }
}

export default function HowVarasatWorks() {
  return (
    <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 md:p-8 font-sans">
      <h2 className="text-2xl font-extrabold text-slate-900 mb-3 text-center tracking-tight">
        How Varasat AI Works
      </h2>

      <p className="text-slate-600 text-center mb-8 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
        Varasat assists families in organizing documents, identifying possible assets, and preparing claim steps. It does not directly access bank databases or predict recovery guarantees.
      </p>

      {/* AI Pipeline Flow */}
      <div className="flex flex-col items-center gap-2 mb-8">
        <FlowStep iconKey="robot" title="Varasat AI Agent" desc="Understands intent and reasons securely" color="#10b981" />
        <FlowArrow />
        <FlowStep iconKey="book" title="Knowledge Retrieval (RAG)" desc="Fetches verified legal procedures" color="#f59e0b" />
        <FlowArrow />
        <FlowStep iconKey="lightning" title="Financial Analysis" desc="Calculates inflation impact with Wolfram" color="#8b5cf6" />
        <FlowArrow />
        <FlowStep iconKey="document" title="Document Assistance" desc="Analyzes statements & drafts legal forms" color="#3b82f6" />
      </div>

      {/* Engine Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Claude Column */}
        <div className="bg-emerald-50/40 border border-emerald-100 rounded-xl p-5 md:p-6 transition-all duration-200 hover:shadow-xs">
          <div className="flex items-center gap-2.5 mb-4">
            {getWorksSvgIcon('robot', "w-5 h-5 text-emerald-750")}
            <span className="text-base font-bold text-emerald-800">Agent & Reasoning</span>
          </div>
          <div className="text-slate-700 text-sm space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-emerald-600 font-semibold">✓</span>
              <span>Orchestrates secure local tool usage</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-600 font-semibold">✓</span>
              <span>Answers using verified RAG legal workflows</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-600 font-semibold">✓</span>
              <span>Empathetic, clear interaction in regional languages</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-600 font-semibold">✓</span>
              <span>Explains financial computations logically</span>
            </div>
          </div>
        </div>

        {/* Wolfram Column */}
        <div className="bg-indigo-50/40 border border-indigo-100 rounded-xl p-5 md:p-6 transition-all duration-200 hover:shadow-xs">
          <div className="flex items-center gap-2.5 mb-4">
            {getWorksSvgIcon('lightning', "w-5 h-5 text-indigo-755")}
            <span className="text-base font-bold text-indigo-800">Wolfram Language</span>
          </div>
          <div className="text-slate-700 text-sm space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-indigo-600 font-semibold">✓</span>
              <span>Advanced compound interest computations</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-indigo-600 font-semibold">✓</span>
              <span>Inflation & purchasing power modeling</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-indigo-600 font-semibold">✓</span>
              <span>Precise historical valuation analytics</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-indigo-600 font-semibold">✓</span>
              <span>Wolfram API confidence scoring models</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function FlowStep({ iconKey, title, desc, color }) {
  return (
    <div className="flex items-center gap-4 bg-white border border-slate-200/80 p-4 rounded-xl shadow-xs w-full max-w-md transition-all duration-200 hover:border-slate-300 hover:shadow-sm">
      <div 
        className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-50 flex-shrink-0"
        style={{ borderLeft: `4px solid ${color}` }}
      >
        {getWorksSvgIcon(iconKey, `w-5 h-5`)}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-slate-800 text-sm leading-tight">{title}</h4>
        <p className="text-slate-500 text-xs mt-0.5">{desc}</p>
      </div>
    </div>
  );
}

function FlowArrow() {
  return (
    <div className="text-slate-300 flex items-center justify-center my-0.5">
      <svg className="w-4 h-4 animate-bounce-subtle" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    </div>
  );
}
