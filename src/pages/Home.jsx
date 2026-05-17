import { useNavigate } from 'react-router-dom';
import { GOLD, PURPLE, CARD, BORDER, TEXT, MUTED, DARK } from '../theme';

const SECTIONS = [
  { path: '/draft-order', label: 'Draft Order', num: '01', desc: 'Full 60-pick draft order, both rounds. Lakers pick #25 highlighted.' },
  { path: '/class-overview', label: '2026 Draft Class', num: '02', desc: 'Class character, tier breakdown, and the Lakers scouting window visualized.' },
  { path: '/lakers-at-25', label: 'The Lakers at #25', num: '03', desc: 'Roster context, pick history, and the BPA philosophy behind the board.' },
  { path: '/big-board', label: 'Interactive Big Board', num: '04', desc: 'All 130 prospects with combine data. Click any row for a full profile.' },
];

export default function Home() {
  const navigate = useNavigate();
  const go = (path) => { navigate(path); window.scrollTo({ top: 0 }); };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px' }}>
      <div style={{ marginBottom: 64 }}>
        <div style={{ fontSize: 12, color: GOLD, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16 }}>
          Los Angeles Lakers · Pick #25 · 2026 NBA Draft
        </div>
        <h1 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 'clamp(56px, 8vw, 100px)',
          lineHeight: 0.92, letterSpacing: 3, margin: '0 0 24px', color: TEXT,
        }}>
          2026 NBA<br /><span style={{ color: GOLD }}>Draft Hub</span>
        </h1>
        <p style={{ color: MUTED, fontSize: 16, maxWidth: 580, lineHeight: 1.8, margin: '0 0 48px' }}>
          A comprehensive look at the 2026 NBA Draft through a Lakers lens. Full big board
          with combine data, three-level prospect profiles, and analysis anchored by
          Mike Garcia / Lakers Draft Scouting.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {SECTIONS.map(sec => (
            <div
              key={sec.path}
              onClick={() => go(sec.path)}
              style={{
                background: CARD, border: `1px solid ${BORDER}`,
                borderRadius: 12, padding: 24, cursor: 'pointer',
                transition: 'border-color 0.2s, background 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = GOLD;
                e.currentTarget.style.background = `${GOLD}0a`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = BORDER;
                e.currentTarget.style.background = CARD;
              }}
            >
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: GOLD, marginBottom: 12 }}>{sec.num}</div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 1, color: TEXT, marginBottom: 8 }}>{sec.label}</div>
              <div style={{ fontSize: 13, color: MUTED, lineHeight: 1.6 }}>{sec.desc}</div>
              <div style={{ marginTop: 16, fontSize: 12, color: GOLD }}>Explore →</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 32, display: 'flex', gap: 32, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 12, color: MUTED }}>Data: <span style={{ color: TEXT }}>Tankathon Big Board + NBA Draft Combine</span></div>
        <div style={{ fontSize: 12, color: MUTED }}>Analysis: <span style={{ color: TEXT }}>Mike Garcia / Lakers Draft Scouting</span></div>
        <div style={{ fontSize: 12, color: MUTED }}>Built: <span style={{ color: TEXT }}>May 2026</span></div>
      </div>
    </div>
  );
}
