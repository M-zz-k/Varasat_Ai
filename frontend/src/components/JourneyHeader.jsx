import { Link } from 'react-router-dom';

export default function JourneyHeader({ currentStep }) {
  const steps = [
    { id: 1, name: 'Discover', path: '/analyze' },
    { id: 2, name: 'Analyze', path: '/asset-discovery' },
    { id: 3, name: 'Recover', path: '/claim-analysis' },
    { id: 4, name: 'Complete', path: '/generate-document' },
  ];

  return (
    <div style={{ padding: '1rem 0 2rem 0', display: 'flex', justifyContent: 'center' }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        background: 'rgba(10,22,40,0.6)', 
        border: '1px solid rgba(240,192,64,0.2)', 
        borderRadius: '999px', 
        padding: '0.5rem 1.5rem',
        gap: '0.5rem',
        maxWidth: '100%',
        overflowX: 'auto',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
      }}>
        {steps.map((step, index) => {
          const isActive = step.id === currentStep;
          const isPassed = step.id < currentStep;

          return (
            <div key={step.id} style={{ display: 'flex', alignItems: 'center' }}>
              <Link to={step.path} style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.4rem 0.8rem', borderRadius: '999px',
                  background: isActive ? 'linear-gradient(135deg, #f0c040, #b8860b)' : (isPassed ? 'rgba(240,192,64,0.1)' : 'transparent'),
                  color: isActive ? '#051020' : (isPassed ? '#f0c040' : '#4a5e80'),
                  fontWeight: isActive ? 800 : 600,
                  fontSize: '0.85rem',
                  transition: 'all 0.3s'
                }}>
                  <span style={{ 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: '18px', height: '18px', borderRadius: '50%',
                    background: isActive ? 'rgba(5,16,32,0.2)' : (isPassed ? 'rgba(240,192,64,0.2)' : 'rgba(74,94,128,0.2)'),
                    fontSize: '0.65rem'
                  }}>
                    {isPassed ? '✓' : step.id}
                  </span>
                  {step.name}
                </div>
              </Link>

              {index < steps.length - 1 && (
                <div style={{ 
                  width: '20px', height: '2px', 
                  background: isPassed ? '#f0c040' : 'rgba(74,94,128,0.3)',
                  margin: '0 0.2rem'
                }}></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
