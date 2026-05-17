import { useNavigate, useLocation } from 'react-router-dom';
import Logo from './Logo';
import { GOLD, PURPLE, MUTED, BORDER, DARK } from '../theme';

const PAGES = [
  { path: '/', label: 'Home' },
  { path: '/draft-order', label: 'Draft Order' },
  { path: '/class-overview', label: 'Class Overview' },
  { path: '/lakers-at-25', label: 'Lakers at #25' },
  { path: '/big-board', label: 'Big Board' },
];

export default function Nav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const go = (path) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 200,
      background: 'rgba(10,10,15,0.97)', backdropFilter: 'blur(12px)',
      borderBottom: `1px solid ${BORDER}`, padding: '0 24px',
      display: 'flex', alignItems: 'center', gap: 32, height: 52,
    }}>
      <div
        onClick={() => go('/')}
        style={{
          fontFamily: "'Bebas Neue', sans-serif", fontSize: 20,
          color: GOLD, letterSpacing: 2, display: 'flex',
          alignItems: 'center', gap: 10, cursor: 'pointer',
        }}
      >
        <Logo logoKey="nba-la-lakers" size={28} fallback="LAL" />
        2026 DRAFT HUB
      </div>

      <div style={{ display: 'flex', gap: 20, marginLeft: 'auto' }}>
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
    </nav>
  );
}
