import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

export default function WolframAnalysisCard({ analysisData, isLoading }) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 shadow-lg animate-pulse">
        <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-700 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-700 rounded w-2/3"></div>
      </div>
    );
  }

  if (!analysisData) {
    return null;
  }

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 shadow-xl overflow-hidden mb-8">
      <div className="border-b border-gray-800 px-6 py-4 bg-black/40 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
            {/* Simple spark icon for computational intelligence */}
            <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" />
          </svg>
          Computational Intelligence
        </h3>
        <span className="text-xs font-medium px-2.5 py-1 bg-red-900/30 text-red-400 border border-red-800/50 rounded-full">
          Powered by Wolfram Language
        </span>
      </div>
      
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Model Input */}
        <div className="bg-black/30 rounded-lg p-4 border border-gray-800">
          <h4 className="text-sm text-gray-400 uppercase tracking-wider font-semibold mb-3">Input Parameters</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Total Asset Value:</span>
              <span className="text-white font-mono">₹{analysisData.totalAmount?.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Inflation Rate:</span>
              <span className="text-white font-mono">6.0%</span>
            </div>
          </div>
        </div>

        {/* Mathematical Model Output */}
        <div className="bg-black/30 rounded-lg p-4 border border-gray-800">
          <h4 className="text-sm text-gray-400 uppercase tracking-wider font-semibold mb-3">Mathematical Models</h4>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-300">Priority Score</span>
                <span className={`font-bold ${
                  analysisData.priorityScore?.priorityScore >= 80 ? 'text-green-400' :
                  analysisData.priorityScore?.priorityScore >= 50 ? 'text-yellow-400' : 'text-red-400'
                }`}>{analysisData.priorityScore?.priorityScore}/100</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1.5">
                <div className="bg-gradient-to-r from-red-500 to-green-500 h-1.5 rounded-full" style={{ width: `${analysisData.priorityScore?.priorityScore || 0}%` }}></div>
              </div>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-300">Risk Profile</span>
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                analysisData.riskLevel?.riskLevel === 'Low' ? 'bg-green-900/40 text-green-400' :
                analysisData.riskLevel?.riskLevel === 'Medium' ? 'bg-yellow-900/40 text-yellow-400' : 'bg-red-900/40 text-red-400'
              }`}>{analysisData.riskLevel?.riskLevel || 'Unknown'}</span>
            </div>
          </div>
        </div>

        {/* Computed Result */}
        <div className="bg-black/30 rounded-lg p-4 border border-gray-800">
          <h4 className="text-sm text-gray-400 uppercase tracking-wider font-semibold mb-3">Computed Impact</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Purchasing Power Loss:</span>
              <span className="text-red-400 font-mono font-medium">₹{analysisData.financialImpact?.purchasingPowerImpact?.toLocaleString('en-IN') || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Recovery Timeline:</span>
              <span className="text-white font-medium">{analysisData.recoveryPrediction?.estimatedMonths || 0} months</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Analysis text */}
      <div className="px-6 pb-6 pt-2">
        <div className="bg-blue-900/10 border border-blue-900/30 rounded-lg p-4 text-blue-200 text-sm leading-relaxed">
          <strong>Analysis:</strong> {analysisData.analysis}
        </div>
        <p className="text-xs text-gray-500 mt-3 text-center italic">
          Wolfram performs mathematical and financial analysis to support recovery decisions.
        </p>
      </div>
    </div>
  );
}
