import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from './Logo';
import { GOLD, MUTED, BORDER, TEXT } from '../theme';
import useIsMobile from '../hooks/useIsMobile';

const PAGES = [
  { path: '/', label: 'Home' },
  { path: '/draft-order', label: 'Draft Order' },
  { path: '/class-overview', label: 'Class Overview' },
  { path: '/lakers-at-25', label: 'Lakers at #25' },
  { path: '/big-board', label: 'Big Board' },
  { path: '/compare', label: 'Compare' },
];

export default function Nav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);

  const go = (path) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setMenuOpen(false);
  };

  return (
    <>
      <nav style={{
        position: 'sticky', top: 0, zIndex: 200,
        background: 'rgba(10,10,15,0.97)', backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${BORDER}`, padding: '0 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 52,
      }}>
        <div
          onClick={() => go('/')}
          style={{
            fontFamily: "'Bebas Neue', sans-serif", fontSize: 20,
            color: GOLD, letterSpacing: 2, display: 'flex',
            alignItems: 'center', gap: 10, cursor: 'pointer', flexShrink: 0,
          }}
        >
          <Logo logoKey="nba-la-lakers" size={28} fallback="LAL" />
          2026 DRAFT HUB
        </div>

        {!isMobile && (
          <div style={{ display: 'flex', gap: 20 }}>
            {PAGES.map(p => {
              const active = pathname === p.path;
              return (
                <span
                  key={p.path}
                  onClick={() => go(p.path)}
                  style={{
                    fontSize: 12, color: active ? GOLD : MUTED,
                    cursor: 'pointer', letterSpacing: 0.5, fontWeight: 500,
                    borderBottom: active ? `1px solid ${GOLD}` : '1px solid transparent',
                    paddingBottom: 2, transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => e.target.style.color = GOLD}
                  onMouseLeave={e => e.target.style.color = active ? GOLD : MUTED}
                >
                  {p.label}
                </span>
              );
            })}
          </div>
        )}

        {isMobile && (
          <button
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '6px 4px', display: 'flex', flexDirection: 'column',
              gap: 5, justifyContent: 'center', alignItems: 'center',
              width: 36, height: 36,
            }}
          >
            <span style={{
              display: 'block', width: 22, height: 2,
              background: menuOpen ? GOLD : MUTED, borderRadius: 2,
              transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none',
              transition: 'transform 0.2s, background 0.2s',
            }} />
            <span style={{
              display: 'block', width: 22, height: 2,
              background: menuOpen ? GOLD : MUTED, borderRadius: 2,
              opacity: menuOpen ? 0 : 1, transition: 'opacity 0.2s',
            }} />
            <span style={{
              display: 'block', width: 22, height: 2,
              background: menuOpen ? GOLD : MUTED, borderRadius: 2,
              transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none',
              transition: 'transform 0.2s, background 0.2s',
            }} />
          </button>
        )}
      </nav>

      {isMobile && menuOpen && (
        <div style={{
          position: 'fixed', top: 52, left: 0, right: 0, zIndex: 199,
          background: 'rgba(10,10,15,0.98)', backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${BORDER}`,
          display: 'flex', flexDirection: 'column',
          animation: 'navDropDown 0.18s ease-out',
        }}>
          {PAGES.map(p => {
            const active = pathname === p.path;
            return (
              <div
                key={p.path}
                onClick={() => go(p.path)}
                style={{
                  padding: '16px 24px',
                  borderBottom: `1px solid ${BORDER}`,
                  fontSize: 14, color: active ? GOLD : TEXT,
                  cursor: 'pointer', letterSpacing: 0.3,
                  background: active ? `${GOLD}0a` : 'transparent',
                  borderLeft: active ? `3px solid ${GOLD}` : '3px solid transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}
              >
                {p.label}
                {active && <span style={{ color: GOLD, fontSize: 10 }}>●</span>}
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        @keyframes navDropDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
