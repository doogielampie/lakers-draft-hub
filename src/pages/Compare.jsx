import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BB, LAL_TARGETS } from '../data/bigboard';
import { PROSPECT_LOGO } from '../data/draftOrder';
import { COMPUTED_GRADES, ATTR_KEYS, ATTR_LABELS, ATTR_DESCRIPTIONS } from '../data/grades';
import Logo from '../components/Logo';
import { GOLD, PURPLE, CARD, SURFACE, BORDER, TEXT, MUTED, DARK } from '../theme';
import useIsMobile from '../hooks/useIsMobile';

// ─── Constants ────────────────────────────────────────────────────────────────
const N = ATTR_KEYS.length; // 8
const CENTER = 140;
const MAX_R = 108;
const LABEL_R = 126;
const TICKS = [2, 4, 6, 8, 10];
const fmt = (v, d = 1) => v == null ? '—' : Number(v).toFixed(d);
const fmtP = (v) => v == null ? '—' : (v * 100).toFixed(1) + '%';

// ─── Radar geometry ───────────────────────────────────────────────────────────
function polar(r, i) {
  const angle = (2 * Math.PI * i) / N - Math.PI / 2;
  return { x: CENTER + r * Math.cos(angle), y: CENTER + r * Math.sin(angle) };
}
function gradeToR(g) { return (g / 10) * MAX_R; }
function pointsStr(grades) {
  return ATTR_KEYS.map((k, i) => {
    const g = grades[k] ?? 0;
    const { x, y } = polar(gradeToR(g), i);
    return `${x},${y}`;
  }).join(' ');
}
function avg(grades) {
  const vals = ATTR_KEYS.map(k => grades[k]).filter(v => v != null);
  return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : '—';
}

// ─── Prospect selector dropdown ───────────────────────────────────────────────
function ProspectSelector({ value, onChange, exclude, label }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const options = BB.filter(p => p.n !== exclude && p.n.toLowerCase().includes(search.toLowerCase()));
  const selected = BB.find(p => p.n === value);
  const logoKey = selected ? PROSPECT_LOGO[selected.n] : null;

  return (
    <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
      <div style={{
        fontSize: 10, fontFamily: "'DM Mono', monospace", color: GOLD,
        letterSpacing: 2, marginBottom: 6,
      }}>{label}</div>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', background: CARD, border: `1px solid ${open ? GOLD : BORDER}`,
          borderRadius: 8, padding: '10px 14px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left',
          transition: 'border-color 0.15s',
        }}
      >
        {selected ? (
          <>
            <Logo logoKey={logoKey} size={22} fallback={selected.sch} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: TEXT, fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {selected.n}
              </div>
              <div style={{ color: MUTED, fontSize: 11 }}>{selected.pos} · {selected.sch}</div>
            </div>
            {LAL_TARGETS.includes(selected.n) && (
              <span style={{ background: GOLD, color: '#000', borderRadius: 3, padding: '1px 5px', fontSize: 9, fontWeight: 700, fontFamily: "'DM Mono', monospace", flexShrink: 0 }}>LAL</span>
            )}
          </>
        ) : (
          <span style={{ color: MUTED, fontSize: 13 }}>Select a prospect…</span>
        )}
        <span style={{ color: MUTED, marginLeft: 'auto', flexShrink: 0 }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
          background: DARK, border: `1px solid ${BORDER}`, borderRadius: 8,
          marginTop: 4, maxHeight: 320, overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        }}>
          <div style={{ padding: '8px 10px', borderBottom: `1px solid ${BORDER}`, flexShrink: 0 }}>
            <input
              autoFocus
              placeholder="Search prospects…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', background: CARD, border: `1px solid ${BORDER}`,
                borderRadius: 6, padding: '6px 10px', color: TEXT, fontSize: 13,
                outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {options.length === 0 && (
              <div style={{ padding: '12px 14px', color: MUTED, fontSize: 13 }}>No results</div>
            )}
            {options.map(p => {
              const lk = PROSPECT_LOGO[p.n];
              const isLal = LAL_TARGETS.includes(p.n);
              return (
                <div
                  key={p.n}
                  onClick={() => { onChange(p.n); setOpen(false); setSearch(''); }}
                  style={{
                    padding: '9px 14px', cursor: 'pointer', display: 'flex',
                    alignItems: 'center', gap: 10,
                    background: p.n === value ? `${GOLD}14` : 'transparent',
                    borderLeft: isLal ? `3px solid ${GOLD}` : '3px solid transparent',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = `${GOLD}0a`}
                  onMouseLeave={e => e.currentTarget.style.background = p.n === value ? `${GOLD}14` : 'transparent'}
                >
                  <Logo logoKey={lk} size={18} fallback={p.sch} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: isLal ? GOLD : TEXT, fontSize: 13, fontWeight: isLal ? 600 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {p.n}
                    </div>
                    <div style={{ color: MUTED, fontSize: 10 }}>{p.pos} · {p.sch} · #{p.rd}</div>
                  </div>
                  {isLal && <span style={{ background: GOLD, color: '#000', borderRadius: 3, padding: '1px 4px', fontSize: 8, fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>LAL</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Dual-polygon radar ───────────────────────────────────────────────────────
function ComparisonRadar({ gradesA, gradesB, nameA, nameB, hoveredAttr, onHover }) {
  const viewSize = CENTER * 2;
  const ptsA = gradesA ? pointsStr(gradesA) : null;
  const ptsB = gradesB ? pointsStr(gradesB) : null;
  const avgA = gradesA ? avg(gradesA) : null;
  const avgB = gradesB ? avg(gradesB) : null;

  return (
    <div style={{
      background: 'radial-gradient(ellipse at center, #12121e 0%, #0a0a0f 100%)',
      border: `1px solid ${BORDER}`,
      borderRadius: 14,
      padding: '12px 8px 8px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Scanlines */}
      <div style={{ position: 'absolute', inset: 0, borderRadius: 14, backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.01) 2px, rgba(255,255,255,0.01) 4px)', pointerEvents: 'none' }} />
      {/* Corner brackets */}
      {[
        { top: 6, left: 6, borderTop: `1px solid ${GOLD}44`, borderLeft: `1px solid ${GOLD}44` },
        { top: 6, right: 6, borderTop: `1px solid ${GOLD}44`, borderRight: `1px solid ${GOLD}44` },
        { bottom: 6, left: 6, borderBottom: `1px solid ${GOLD}44`, borderLeft: `1px solid ${GOLD}44` },
        { bottom: 6, right: 6, borderBottom: `1px solid ${GOLD}44`, borderRight: `1px solid ${GOLD}44` },
      ].map((s, i) => (
        <div key={i} style={{ position: 'absolute', width: 14, height: 14, ...s }} />
      ))}

      <svg viewBox={`0 0 ${viewSize} ${viewSize}`} width="100%" style={{ display: 'block', maxWidth: 340, margin: '0 auto' }}>
        {/* Rings */}
        {TICKS.map(t => {
          const r = gradeToR(t);
          const pts = Array.from({ length: N }, (_, i) => { const { x, y } = polar(r, i); return `${x},${y}`; }).join(' ');
          return <polygon key={t} points={pts} fill="none" stroke={t === 8 ? `${GOLD}28` : `${BORDER}66`} strokeWidth={t === 10 ? 0.8 : 0.5} strokeDasharray={t === 10 ? 'none' : '2,3'} />;
        })}

        {/* Spokes */}
        {Array.from({ length: N }, (_, i) => {
          const inner = polar(0, i);
          const outer = polar(MAX_R, i);
          const isHov = hoveredAttr === ATTR_KEYS[i];
          return <line key={i} x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke={isHov ? `${GOLD}55` : `${BORDER}55`} strokeWidth={isHov ? 1 : 0.5} />;
        })}

        {/* Polygon B (purple — prospect B, behind) */}
        {ptsB && (
          <polygon points={ptsB} fill={`${PURPLE}25`} stroke={PURPLE} strokeWidth={1.5} strokeLinejoin="round" />
        )}

        {/* Polygon A (gold — prospect A, in front) */}
        {ptsA && (
          <polygon points={ptsA} fill={`${GOLD}18`} stroke={GOLD} strokeWidth={1.5} strokeLinejoin="round" />
        )}

        {/* Dots A */}
        {gradesA && ATTR_KEYS.map((k, i) => {
          const g = gradesA[k] ?? 0;
          const { x, y } = polar(gradeToR(g), i);
          const isHov = hoveredAttr === k;
          return (
            <g key={k}>
              <circle cx={x} cy={y} r={12} fill="transparent" onMouseEnter={() => onHover(k)} onMouseLeave={() => onHover(null)} style={{ cursor: 'default' }} />
              <circle cx={x} cy={y} r={isHov ? 4.5 : 2.5} fill={isHov ? '#fff' : GOLD} stroke="#0a0a0f" strokeWidth={1} pointerEvents="none" style={{ transition: 'r 0.1s' }} />
            </g>
          );
        })}

        {/* Dots B */}
        {gradesB && ATTR_KEYS.map((k, i) => {
          const g = gradesB[k] ?? 0;
          const { x, y } = polar(gradeToR(g), i);
          const isHov = hoveredAttr === k;
          return (
            <g key={k + 'b'}>
              <circle cx={x} cy={y} r={12} fill="transparent" onMouseEnter={() => onHover(k)} onMouseLeave={() => onHover(null)} style={{ cursor: 'default' }} />
              <circle cx={x} cy={y} r={isHov ? 4.5 : 2.5} fill={isHov ? '#c0a8ff' : PURPLE} stroke="#0a0a0f" strokeWidth={1} pointerEvents="none" style={{ transition: 'r 0.1s' }} />
            </g>
          );
        })}

        {/* Axis labels */}
        {ATTR_LABELS.map((lbl, i) => {
          const { x, y } = polar(LABEL_R, i);
          const dx = x - CENTER;
          const anchor = Math.abs(dx) < 8 ? 'middle' : dx > 0 ? 'start' : 'end';
          const isHov = hoveredAttr === ATTR_KEYS[i];
          return (
            <text key={i} x={x} y={y} textAnchor={anchor} dominantBaseline="middle" fontFamily="'DM Mono', monospace" fontSize={isHov ? 9 : 8} fill={isHov ? GOLD : `${MUTED}bb`} fontWeight={isHov ? 600 : 400} pointerEvents="none" style={{ transition: 'font-size 0.1s, fill 0.1s' }}>
              {lbl}
            </text>
          );
        })}

        {/* Center display */}
        {(avgA || avgB) && (
          <>
            {avgA && <text x={CENTER - 2} y={CENTER - 10} textAnchor="end" fontFamily="'Bebas Neue', sans-serif" fontSize={16} fill={GOLD} opacity={0.9}>{avgA}</text>}
            <text x={CENTER} y={CENTER - 10} textAnchor="middle" fontFamily="'DM Mono', monospace" fontSize={8} fill={`${MUTED}77`}>vs</text>
            {avgB && <text x={CENTER + 2} y={CENTER - 10} textAnchor="start" fontFamily="'Bebas Neue', sans-serif" fontSize={16} fill={PURPLE} opacity={0.9}>{avgB}</text>}
            <text x={CENTER} y={CENTER + 6} textAnchor="middle" fontFamily="'DM Mono', monospace" fontSize={6} fill={`${MUTED}77`} letterSpacing={0.5}>AVG / 10</text>
          </>
        )}
        {!avgA && !avgB && (
          <text x={CENTER} y={CENTER} textAnchor="middle" fontFamily="'DM Mono', monospace" fontSize={9} fill={`${MUTED}55`}>Select prospects</text>
        )}
      </svg>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', padding: '4px 8px 4px', flexWrap: 'wrap' }}>
        {nameA && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: GOLD, fontFamily: "'DM Mono', monospace" }}>
            <span style={{ width: 16, height: 2, background: GOLD, display: 'inline-block', borderRadius: 1 }} />
            {nameA.split(' ').pop().toUpperCase()}
          </div>
        )}
        {nameB && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: PURPLE, fontFamily: "'DM Mono', monospace" }}>
            <span style={{ width: 16, height: 2, background: PURPLE, display: 'inline-block', borderRadius: 1 }} />
            {nameB.split(' ').pop().toUpperCase()}
          </div>
        )}
        {!nameA && !nameB && (
          <div style={{ fontSize: 10, color: `${MUTED}55`, fontFamily: "'DM Mono', monospace" }}>Gold = Prospect A · Purple = Prospect B</div>
        )}
      </div>
    </div>
  );
}

// ─── Attribute bar row ────────────────────────────────────────────────────────
function AttrRow({ attr, label, descr, gradeA, gradeB, isHovered, onHover }) {
  const diff = gradeA != null && gradeB != null ? gradeA - gradeB : null;
  const winner = diff == null ? null : diff > 0 ? 'A' : diff < 0 ? 'B' : 'tie';

  return (
    <div
      onMouseEnter={() => onHover(attr)}
      onMouseLeave={() => onHover(null)}
      style={{
        background: isHovered ? `${GOLD}08` : 'transparent',
        borderRadius: 6,
        padding: '10px 12px',
        transition: 'background 0.1s',
        cursor: 'default',
      }}
    >
      {/* Label row */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
        <span style={{
          fontFamily: "'DM Mono', monospace", fontSize: 10,
          color: isHovered ? GOLD : MUTED, letterSpacing: 1,
          transition: 'color 0.1s', flex: 1,
        }}>{attr.toUpperCase()}</span>
        {diff != null && (
          <span style={{
            fontFamily: "'DM Mono', monospace", fontSize: 9,
            color: winner === 'A' ? GOLD : winner === 'B' ? PURPLE : `${MUTED}88`,
          }}>
            {winner === 'tie' ? '=' : winner === 'A' ? `+${diff} A` : `+${Math.abs(diff)} B`}
          </span>
        )}
      </div>

      {/* Dual bar */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {/* A bar (left-aligned, reversed) */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
          <span style={{
            fontFamily: "'DM Mono', monospace", fontSize: 12, fontWeight: 600,
            color: gradeA != null ? (winner === 'A' ? GOLD : TEXT) : `${MUTED}55`,
            minWidth: 18, textAlign: 'right',
          }}>{gradeA ?? '—'}</span>
          <div style={{ width: 80, height: 5, background: `${BORDER}`, borderRadius: 3, overflow: 'hidden', direction: 'rtl' }}>
            <div style={{
              height: '100%', width: gradeA ? `${(gradeA / 10) * 100}%` : '0%',
              background: winner === 'A' ? GOLD : `${GOLD}66`,
              borderRadius: 3, transition: 'width 0.3s',
            }} />
          </div>
        </div>

        {/* Center divider */}
        <div style={{ width: 1, height: 16, background: BORDER, flexShrink: 0 }} />

        {/* B bar (right-aligned) */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 80, height: 5, background: `${BORDER}`, borderRadius: 3, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: gradeB ? `${(gradeB / 10) * 100}%` : '0%',
              background: winner === 'B' ? PURPLE : `${PURPLE}66`,
              borderRadius: 3, transition: 'width 0.3s',
            }} />
          </div>
          <span style={{
            fontFamily: "'DM Mono', monospace", fontSize: 12, fontWeight: 600,
            color: gradeB != null ? (winner === 'B' ? PURPLE : TEXT) : `${MUTED}55`,
            minWidth: 18,
          }}>{gradeB ?? '—'}</span>
        </div>
      </div>

      {/* Description on hover */}
      {isHovered && (
        <div style={{ fontSize: 11, color: `${MUTED}bb`, marginTop: 6, lineHeight: 1.6, fontStyle: 'italic' }}>
          {descr}
        </div>
      )}
    </div>
  );
}

// ─── Stat comparison tile ─────────────────────────────────────────────────────
function StatCompare({ label, valA, valB, higherBetter = true, format = 'num' }) {
  const numA = parseFloat(valA);
  const numB = parseFloat(valB);
  const hasVals = !isNaN(numA) && !isNaN(numB);
  const winnerA = hasVals && (higherBetter ? numA > numB : numA < numB);
  const winnerB = hasVals && (higherBetter ? numB > numA : numB < numA);

  const style = (isWinner) => ({
    fontFamily: "'DM Mono', monospace",
    fontSize: 15, fontWeight: isWinner ? 700 : 400,
    color: isWinner ? TEXT : `${MUTED}88`,
  });

  return (
    <div style={{
      background: CARD, borderRadius: 8, padding: '10px 12px',
      border: `1px solid ${BORDER}`,
    }}>
      <div style={{ fontSize: 9, color: MUTED, fontFamily: "'DM Mono', monospace", letterSpacing: 0.5, marginBottom: 6 }}>{label}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={style(winnerA)}>{valA}</span>
        <span style={{ fontSize: 9, color: `${MUTED}55` }}>vs</span>
        <span style={style(winnerB)}>{valB}</span>
      </div>
    </div>
  );
}

// ─── Prospect header card ─────────────────────────────────────────────────────
function ProspectHeader({ p, color }) {
  if (!p) return (
    <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: '16px 20px', opacity: 0.4, minHeight: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: MUTED, fontSize: 13, fontFamily: "'DM Mono', monospace" }}>— Select prospect —</span>
    </div>
  );
  const logoKey = PROSPECT_LOGO[p.n];
  const isTarget = LAL_TARGETS.includes(p.n);
  return (
    <div style={{
      background: CARD,
      border: `1px solid ${color}55`,
      borderTop: `3px solid ${color}`,
      borderRadius: 10, padding: '14px 18px',
      display: 'flex', alignItems: 'center', gap: 14,
    }}>
      <Logo logoKey={logoKey} size={40} fallback={p.sch} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: TEXT, letterSpacing: 0.5, lineHeight: 1 }}>{p.n}</div>
        <div style={{ fontSize: 12, color: MUTED, marginTop: 3 }}>{p.pos} · {p.sch} · {p.cls} · Age {p.age?.toFixed(1)}</div>
        {isTarget && <span style={{ background: GOLD, color: '#000', borderRadius: 3, padding: '1px 5px', fontSize: 9, fontWeight: 700, fontFamily: "'DM Mono', monospace", display: 'inline-block', marginTop: 4 }}>LAL TARGET</span>}
      </div>
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, color: color, lineHeight: 1, flexShrink: 0 }}>#{p.rd}</div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function Compare() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [hoveredAttr, setHoveredAttr] = useState(null);
  const [activeTab, setActiveTab] = useState('radar'); // mobile tab: 'radar' | 'attrs' | 'stats'
  const isMobile = useIsMobile();

  const nameA = searchParams.get('a') || '';
  const nameB = searchParams.get('b') || '';

  const setA = (n) => setSearchParams(p => { p.set('a', n); return p; });
  const setB = (n) => setSearchParams(p => { p.set('b', n); return p; });

  const prospectA = BB.find(p => p.n === nameA) || null;
  const prospectB = BB.find(p => p.n === nameB) || null;
  const gradesA = nameA ? COMPUTED_GRADES[nameA] : null;
  const gradesB = nameB ? COMPUTED_GRADES[nameB] : null;

  const padding = 'clamp(20px, 5vw, 48px) clamp(16px, 4vw, 24px)';

  // Stat rows to compare
  const STAT_ROWS = [
    { label: 'PPG', valA: fmt(prospectA?.ppg), valB: fmt(prospectB?.ppg) },
    { label: 'RPG', valA: fmt(prospectA?.rpg), valB: fmt(prospectB?.rpg) },
    { label: 'APG', valA: fmt(prospectA?.apg), valB: fmt(prospectB?.apg) },
    { label: 'BPM', valA: fmt(prospectA?.bpm), valB: fmt(prospectB?.bpm) },
    { label: 'TS%', valA: fmtP(prospectA?.ts), valB: fmtP(prospectB?.ts) },
    { label: 'USG%', valA: prospectA?.usg != null ? prospectA.usg + '%' : '—', valB: prospectB?.usg != null ? prospectB.usg + '%' : '—' },
    { label: 'STL/36', valA: fmt(prospectA?.p36s), valB: fmt(prospectB?.p36s) },
    { label: 'BLK/36', valA: fmt(prospectA?.p36b), valB: fmt(prospectB?.p36b) },
    { label: 'DBPM', valA: fmt(prospectA?.dbpm), valB: fmt(prospectB?.dbpm) },
    { label: 'WINGSPAN', valA: prospectA?.ws || '—', valB: prospectB?.ws || '—', higherBetter: true },
    { label: 'MAX VERT', valA: prospectA?.mv != null ? prospectA.mv + '"' : '—', valB: prospectB?.mv != null ? prospectB.mv + '"' : '—' },
    { label: 'LANE AGI', valA: prospectA?.la != null ? prospectA.la + 's' : '—', valB: prospectB?.la != null ? prospectB.la + 's' : '—', higherBetter: false },
  ];

  const RadarAndLegend = (
    <div>
      <ComparisonRadar
        gradesA={gradesA}
        gradesB={gradesB}
        nameA={nameA}
        nameB={nameB}
        hoveredAttr={hoveredAttr}
        onHover={setHoveredAttr}
      />
    </div>
  );

  const AttrRows = (
    <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, overflow: 'hidden' }}>
      {/* Column headers */}
      <div style={{ display: 'flex', gap: 8, padding: '10px 12px', borderBottom: `1px solid ${BORDER}`, background: `${DARK}` }}>
        <div style={{ flex: 1, textAlign: 'right', fontSize: 10, fontFamily: "'DM Mono', monospace", color: GOLD, letterSpacing: 1 }}>
          {nameA ? nameA.split(' ').pop().toUpperCase() : 'PROSPECT A'}
        </div>
        <div style={{ width: 1, flexShrink: 0 }} />
        <div style={{ flex: 1, fontSize: 10, fontFamily: "'DM Mono', monospace", color: PURPLE, letterSpacing: 1 }}>
          {nameB ? nameB.split(' ').pop().toUpperCase() : 'PROSPECT B'}
        </div>
      </div>
      {ATTR_KEYS.map((attr, i) => (
        <AttrRow
          key={attr}
          attr={attr}
          label={ATTR_LABELS[i]}
          descr={ATTR_DESCRIPTIONS[attr]}
          gradeA={gradesA?.[attr]}
          gradeB={gradesB?.[attr]}
          isHovered={hoveredAttr === attr}
          onHover={setHoveredAttr}
        />
      ))}
      <div style={{ padding: '8px 12px', borderTop: `1px solid ${BORDER}`, background: DARK }}>
        <div style={{ fontSize: 10, color: `${MUTED}66`, fontFamily: "'DM Mono', monospace', lineHeight: 1.5 }}>
          Grades computed from BigBoard stats. Percentile-ranked across 130 prospects. Hover any row to see methodology.
        </div>
      </div>
    </div>
  );

  const StatGrid = (
    <div>
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 12, color: GOLD, letterSpacing: 2, marginBottom: 10 }}>
        STAT COMPARISON
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
        {STAT_ROWS.map(row => (
          <StatCompare
            key={row.label}
            label={row.label}
            valA={row.valA}
            valB={row.valB}
            higherBetter={row.higherBetter !== false}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ background: `#0a0a0f`, minHeight: '100vh' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding }}>
        {/* Page header */}
        <div style={{ width: 40, height: 3, background: GOLD, marginBottom: 16, borderRadius: 2 }} />
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: isMobile ? 26 : 38, letterSpacing: 2, marginBottom: 4, color: TEXT }}>
          PROSPECT COMPARISON
        </h2>
        <p style={{ color: MUTED, fontSize: 13, marginBottom: 24, lineHeight: 1.6 }}>
          Grades computed from BigBoard stats, percentile-ranked across the full 2026 class. Anchored in Mike Garcia's scouting philosophy. Hover attributes for methodology.
        </p>

        {/* Selectors */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'flex-end', flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
          <ProspectSelector value={nameA} onChange={setA} exclude={nameB} label="PROSPECT A — GOLD" />
          <div style={{
            fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: MUTED,
            paddingBottom: 8, flexShrink: 0, alignSelf: 'flex-end',
          }}>VS</div>
          <ProspectSelector value={nameB} onChange={setB} exclude={nameA} label="PROSPECT B — PURPLE" />
        </div>

        {/* Prospect headers */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 10, marginBottom: 24 }}>
          <ProspectHeader p={prospectA} color={GOLD} />
          <ProspectHeader p={prospectB} color={PURPLE} />
        </div>

        {/* Mobile tab strip */}
        {isMobile && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 16, background: CARD, borderRadius: 8, padding: 4, border: `1px solid ${BORDER}` }}>
            {[
              { id: 'radar', label: 'Radar' },
              { id: 'attrs', label: 'Attributes' },
              { id: 'stats', label: 'Stats' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1, padding: '8px 0', borderRadius: 6, border: 'none',
                  background: activeTab === tab.id ? GOLD : 'transparent',
                  color: activeTab === tab.id ? '#000' : MUTED,
                  fontFamily: "'DM Mono', monospace", fontSize: 12, fontWeight: activeTab === tab.id ? 700 : 400,
                  cursor: 'pointer',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Desktop layout: two-column */}
        {!isMobile && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {RadarAndLegend}
              {StatGrid}
            </div>
            <div>
              {AttrRows}
            </div>
          </div>
        )}

        {/* Mobile layout: tabbed */}
        {isMobile && (
          <div>
            {activeTab === 'radar' && RadarAndLegend}
            {activeTab === 'attrs' && AttrRows}
            {activeTab === 'stats' && StatGrid}
          </div>
        )}

        {/* Methodology note */}
        <div style={{
          marginTop: 32, padding: '16px 20px',
          background: CARD, border: `1px solid ${BORDER}`,
          borderLeft: `3px solid ${GOLD}55`,
          borderRadius: 10,
        }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 11, color: GOLD, letterSpacing: 2, marginBottom: 8 }}>
            METHODOLOGY
          </div>
          <div style={{ fontSize: 12, color: `${MUTED}bb`, lineHeight: 1.8 }}>
            All grades are percentile-ranked within the 2026 class (130 prospects) and scaled 1–10. Anchored in Mike Garcia's analytical framework: FTR as a physicality proxy, paired STL%/BLK% for defensive playmaking, TS%-at-usage for scoring efficiency, age-adjusted BPM for projection. Athleticism requires NBA Combine participation and is null for non-participants. Shooting Range currently uses OBPM as a proxy — will be updated with Hoop Math shot-location data. Grades are a starting point, not a verdict.
          </div>
        </div>
      </div>
    </div>
  );
}
