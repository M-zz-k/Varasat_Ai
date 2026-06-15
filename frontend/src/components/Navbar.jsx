import { Link } from 'react-router-dom';

/**
 * Navbar — Shared global navigation header for all VARASAT pages.
 *
 * Props:
 *  backTo      {string}  — href for the back button (default '/').
 *  backLabel   {string}  — label for the back button (default '← Home').
 *  rightSlot   {ReactNode} — optional content rendered on the right side
 *                           (e.g. language toggle, demo badge, etc.).
 *  subtitle    {string}  — small subtitle text under "VARASAT" (optional).
 */
export default function Navbar({
  backTo    = '/',
  backLabel = '← Home',
  rightSlot = null,
  subtitle  = 'Unlocking Family Wealth Through Intelligence',
}) {
  return (
    <header
      style={{
        padding: '0.65rem 1.25rem',
        background: '#0b1329',
        borderBottom: '1px solid rgba(30,41,59,0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        gap: '0.75rem',
      }}
    >
      {/* Left — back button + logo wordmark */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {backTo && (
          <Link
            to={backTo}
            style={{
              color: '#cbd5e1',
              textDecoration: 'none',
              fontSize: '0.8rem',
              fontWeight: 700,
              padding: '0.3rem 0.7rem',
              border: '1px solid rgba(71,85,105,0.6)',
              borderRadius: '8px',
              background: 'rgba(15,23,42,0.5)',
              whiteSpace: 'nowrap',
              transition: 'color 0.15s',
              flexShrink: 0,
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.color = '#cbd5e1')}
          >
            {backLabel}
          </Link>
        )}

        {/* Logo + name */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            textDecoration: 'none',
          }}
        >
          <img
            src="/images/varasat-logo.png"
            alt="VARASAT logo"
            loading="eager"
            style={{
              width: '36px',
              height: '36px',
              objectFit: 'contain',
              borderRadius: '8px',
              flexShrink: 0,
            }}
          />
          <div style={{ lineHeight: 1 }}>
            <div
              style={{
                fontWeight: 900,
                fontSize: '1rem',
                color: '#ffffff',
                letterSpacing: '0.04em',
              }}
            >
              VARASAT
            </div>
            {subtitle && (
              <div
                style={{
                  fontSize: '0.62rem',
                  color: '#fbbf24',
                  fontWeight: 600,
                  marginTop: '2px',
                  whiteSpace: 'nowrap',
                }}
              >
                {subtitle}
              </div>
            )}
          </div>
        </Link>
      </div>

      {/* Right slot — caller-provided content */}
      {rightSlot && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          {rightSlot}
        </div>
      )}
    </header>
  );
}
