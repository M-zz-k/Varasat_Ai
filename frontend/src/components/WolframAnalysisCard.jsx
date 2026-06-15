import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

export default function WolframAnalysisCard({ analysisData, isLoading }) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-md animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-slate-200 rounded w-2/3"></div>
      </div>
    );
  }

  if (!analysisData) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden mb-8">
      <div className="border-b border-slate-200/60 px-6 py-4 bg-slate-50/50 flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
            {/* Simple spark icon for computational intelligence */}
            <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" />
          </svg>
          Computational Intelligence
        </h3>
        <span className="text-xs font-bold px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full">
          Powered by Wolfram Language
        </span>
      </div>
      
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Model Input */}
        <div className="bg-slate-50/50 rounded-lg p-4 border border-slate-100">
          <h4 className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold mb-3">Input Parameters</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">Total Asset Value:</span>
              <span className="text-slate-800 font-bold font-mono">₹{analysisData.totalAmount?.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">Inflation Rate:</span>
              <span className="text-slate-800 font-bold font-mono">6.0%</span>
            </div>
          </div>
        </div>

        {/* Mathematical Model Output */}
        <div className="bg-slate-50/50 rounded-lg p-4 border border-slate-100">
          <h4 className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold mb-3">Mathematical Models</h4>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600 font-semibold">Priority Score</span>
                <span className={`font-extrabold ${
                  analysisData.priorityScore?.priorityScore >= 80 ? 'text-emerald-600' :
                  analysisData.priorityScore?.priorityScore >= 50 ? 'text-amber-600' : 'text-rose-600'
                }`}>{analysisData.priorityScore?.priorityScore}/100</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5">
                <div className="bg-gradient-to-r from-rose-500 to-emerald-500 h-1.5 rounded-full" style={{ width: `${analysisData.priorityScore?.priorityScore || 0}%` }}></div>
              </div>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600 font-semibold">Risk Profile</span>
              <span className={`px-2 py-0.5 rounded text-xs font-bold border ${
                analysisData.riskLevel?.riskLevel === 'Low' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                analysisData.riskLevel?.riskLevel === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-red-50 text-red-700 border-red-200'
              }`}>{analysisData.riskLevel?.riskLevel || 'Unknown'}</span>
            </div>
          </div>
        </div>

        {/* Computed Result */}
        <div className="bg-slate-50/50 rounded-lg p-4 border border-slate-100">
          <h4 className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold mb-3">Computed Impact</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">Purchasing Power Loss:</span>
              <span className="text-rose-600 font-bold font-mono">₹{analysisData.financialImpact?.purchasingPowerImpact?.toLocaleString('en-IN') || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">Recovery Timeline:</span>
              <span className="text-slate-800 font-bold">{analysisData.recoveryPrediction?.estimatedMonths || 0} months</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Analysis text */}
      <div className="px-6 pb-6 pt-2">
        <div className="bg-blue-50/60 border border-blue-100 rounded-lg p-4 text-blue-800 text-sm leading-relaxed font-medium">
          <strong>Analysis:</strong> {analysisData.analysis}
        </div>
        <p className="text-xs text-slate-400 mt-3 text-center font-medium italic">
          Wolfram performs mathematical and financial analysis to support recovery decisions.
        </p>
      </div>
    </div>
  );
}
