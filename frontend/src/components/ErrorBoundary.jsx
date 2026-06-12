import React, { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center font-sans">
          {/* Branded Varasat Logo/Scales SVG */}
          <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-6 text-amber-500 shadow-md">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17M4.5 9h15M6 9a6 6 0 0012 0M6 9a6 6 0 0112 0" />
            </svg>
          </div>

          <h2 className="text-2xl font-black text-white tracking-tight mb-2">
            Something went wrong
          </h2>
          
          <p className="text-slate-400 text-sm max-w-sm mx-auto leading-relaxed mb-8">
            An unexpected error occurred in the Varasat dashboard. Please try again or return home.
          </p>

          <div className="flex gap-4">
            <button
              onClick={this.handleRetry}
              className="inline-flex items-center justify-center rounded-lg bg-gradient-to-b from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-bold text-xs h-10 px-5 cursor-pointer transition-all duration-200"
            >
              Try Again
            </button>
            <a
              href="/"
              className="inline-flex items-center justify-center rounded-lg border border-slate-800 bg-transparent text-slate-350 hover:text-white font-semibold text-xs h-10 px-5 transition-all duration-200"
            >
              Back to Home
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
