import { Link } from 'react-router-dom';

export default function JourneyHeader({ currentStep }) {
  const steps = [
    { id: 1, name: 'Upload', path: '/upload' },
    { id: 2, name: 'Analyze', path: '/claim-analysis' },
    { id: 3, name: 'Recover', path: '/asset-discovery' },
    { id: 4, name: 'Complete', path: '/generate-document' },
  ];

  return (
    <div className="py-4 flex justify-center font-sans select-none">
      <div className="flex items-center bg-slate-50 border border-slate-200/80 rounded-full p-1.5 gap-2 max-w-full overflow-x-auto shadow-2xs">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep;
          const isPassed = step.id < currentStep;

          return (
            <div key={step.id} className="flex items-center">
              <Link to={step.path} className="no-underline">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 ${
                  isActive 
                    ? 'bg-slate-900 text-white font-extrabold text-xs shadow-xs' 
                    : isPassed 
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-100 text-xs font-bold' 
                      : 'text-slate-400 hover:text-slate-600 text-xs font-semibold'
                }`}>
                  <span className={`flex items-center justify-center w-4 h-4 rounded-full text-[10px] ${
                    isActive 
                      ? 'bg-white/20 text-white' 
                      : isPassed 
                        ? 'bg-emerald-200 text-emerald-850' 
                        : 'bg-slate-200 text-slate-500'
                  }`}>
                    {isPassed ? '✓' : step.id}
                  </span>
                  <span>{step.name}</span>
                </div>
              </Link>

              {index < steps.length - 1 && (
                <div className={`w-8 h-[2px] mx-1 ${
                  isPassed ? 'bg-emerald-400' : 'bg-slate-200'
                }`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
