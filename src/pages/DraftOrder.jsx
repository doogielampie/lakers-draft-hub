import { DRAFT_ORDER, DRAFT_LOGO } from '../data/draftOrder';
import Logo from '../components/Logo';
import { GOLD, PURPLE, CARD, BORDER, TEXT, MUTED, SURFACE } from '../theme';

export default function DraftOrder() {
  const firstRound = DRAFT_ORDER.filter(p => p.pick <= 30);
  const secondRound = DRAFT_ORDER.filter(p => p.pick > 30);

  const PickCard = ({ p }) => {
    const isLAL = p.pick === 25;
    const logoKey = DRAFT_LOGO[String(p.pick)];
    return (
      <div style={{
        background: isLAL ? `${PURPLE}33` : CARD,
        border: `1px solid ${isLAL ? GOLD : BORDER}`,
        borderRadius: 8, padding: '10px 10px 8px',
        boxShadow: isLAL ? `0 0 16px ${GOLD}33` : 'none',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: isLAL ? 6 : 4 }}>
          <Logo logoKey={logoKey} size={20} fallback={p.team} />
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: isLAL ? GOLD : MUTED }}>#{p.pick}</span>
        </div>
        <div style={{ fontSize: 11, color: isLAL ? GOLD : TEXT, fontWeight: isLAL ? 700 : 400, lineHeight: 1.3 }}>{p.team}</div>
        {p.note && <div style={{ fontSize: 9, color: MUTED, marginTop: 3, lineHeight: 1.3 }}>{p.note}</div>}
      </div>
    );
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px' }}>
      <div style={{ width: 40, height: 3, background: GOLD, marginBottom: 16, borderRadius: 2 }} />
      <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 40, letterSpacing: 2, marginBottom: 6, color: TEXT }}>
        DRAFT ORDER
      </h2>
      <p style={{ color: MUTED, fontSize: 14, marginBottom: 28 }}>
        Full 2026 NBA Draft — both rounds. The Lakers hold pick #25.
      </p>

      {[{ label: 'FIRST ROUND', picks: firstRound, gold: true }, { label: 'SECOND ROUND', picks: secondRound, gold: false }].map(({ label, picks, gold }) => (
        <div key={label} style={{ marginBottom: 40 }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 13, color: gold ? GOLD : MUTED, letterSpacing: 2, marginBottom: 12 }}>
            {label}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 6 }}>
            {picks.map(p => <PickCard key={p.pick} p={p} />)}
          </div>
        </div>
      ))}
    </div>
  );
}
