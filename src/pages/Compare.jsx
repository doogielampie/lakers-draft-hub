import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BB, LAL_TARGETS } from '../data/bigboard';
import { PROSPECT_LOGO } from '../data/draftOrder';
import { COMPUTED_GRADES, ATTR_KEYS, ATTR_LABELS, ATTR_DESCRIPTIONS } from '../data/grades';
import Logo from '../components/Logo';
import { GOLD, PURPLE, CARD, SURFACE, BORDER, TEXT, MUTED, DARK } from '../theme';
import useIsMobile from '../hooks/useIsMobile';

// ─── Constants ────────────────────────────────────────────────────────────────
const N = ATTR_KEYS.length;
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
  return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : null;
}

// ─── Prospect selector ────────────────────────────────────────────────────────
function ProspectSelector({ value, onChange, exclude, accentColor }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const options = BB.filter(p => p.n !== exclude && p.n.toLowerCase().includes(search.toLowerCase()));
  const selected = BB.find(p => p.n === value);
  const logoKey = selected ? PROSPECT_LOGO[selected.n] : null;

  return (
    <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', background: CARD,
          border: `1px solid ${open ? accentColor : BORDER}`,
          borderTop: `2px solid ${accentColor}`,
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
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 200,
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

// ─── Dual-polygon radar — clean center, averages in legend strip ──────────────
function ComparisonRadar({ gradesA, gradesB, nameA, nameB, hoveredAttr, onHover }) {
  const viewSize = CENTER * 2;
  const ptsA = gradesA ? pointsStr(gradesA) : null;
  const ptsB = gradesB ? pointsStr(gradesB) : null;
  const avgA = gradesA ? avg(gradesA) : null;
  const avgB = gradesB ? avg(gradesB) : null;
  const labelA = nameA ? nameA.split(' ').pop().toUpperCase() : null;
  const labelB = nameB ? nameB.split(' ').pop().toUpperCase() : null;

  return (
    <div style={{
      background: 'radial-gradient(ellipse at center, #12121e 0%, #0a0a0f 100%)',
      border: `1px solid ${BORDER}`,
      borderRadius: 14,
      padding: '12px 8px 0',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: 14, backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.01) 2px, rgba(255,255,255,0.01) 4px)', pointerEvents: 'none' }} />
      {[
        { top: 6, left: 6, borderTop: `1px solid ${GOLD}44`, borderLeft: `1px solid ${GOLD}44` },
        { top: 6, right: 6, borderTop: `1px solid ${GOLD}44`, borderRight: `1px solid ${GOLD}44` },
        { bottom: 36, left: 6, borderBottom: `1px solid ${GOLD}44`, borderLeft: `1px solid ${GOLD}44` },
        { bottom: 36, right: 6, borderBottom: `1px solid ${GOLD}44`, borderRight: `1px solid ${GOLD}44` },
      ].map((s, i) => (
        <div key={i} style={{ position: 'absolute', width: 14, height: 14, ...s }} />
      ))}

      <svg viewBox={`0 0 ${viewSize} ${viewSize}`} width="100%" style={{ display: 'block', maxWidth: 340, margin: '0 auto' }}>
        {TICKS.map(t => {
          const r = gradeToR(t);
          const pts = Array.from({ length: N }, (_, i) => { const { x, y } = polar(r, i); return `${x},${y}`; }).join(' ');
          return <polygon key={t} points={pts} fill="none" stroke={t === 8 ? `${GOLD}28` : `${BORDER}66`} strokeWidth={t === 10 ? 0.8 : 0.5} strokeDasharray={t === 10 ? 'none' : '2,3'} />;
        })}
        {Array.from({ length: N }, (_, i) => {
          const inner = polar(0, i);
          const outer = polar(MAX_R, i);
          const isHov = hoveredAttr === ATTR_KEYS[i];
          return <line key={i} x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke={isHov ? `${GOLD}55` : `${BORDER}55`} strokeWidth={isHov ? 1 : 0.5} />;
        })}
        {ptsB && <polygon points={ptsB} fill={`${PURPLE}25`} stroke={PURPLE} strokeWidth={1.5} strokeLinejoin="round" />}
        {ptsA && <polygon points={ptsA} fill={`${GOLD}18`} stroke={GOLD} strokeWidth={1.5} strokeLinejoin="round" />}
        {gradesA && ATTR_KEYS.map((k, i) => {
          const g = gradesA[k] ?? 0;
          const { x, y } = polar(gradeToR(g), i);
          const isHov = hoveredAttr === k;
          return (
            <g key={k}>
              <circle cx={x} cy={y} r={12} fill="transparent" onMouseEnter={() => onHover(k)} onMouseLeave={() => onHover(null)} style={{ cursor: 'default' }} />
              <circle cx={x} cy={y} r={isHov ? 4.5 : 2.5} fill={isHov ? '#fff' : GOLD} stroke="#0a0a0f" strokeWidth={1} pointerEvents="none" />
            </g>
          );
        })}
        {gradesB && ATTR_KEYS.map((k, i) => {
          const g = gradesB[k] ?? 0;
          const { x, y } = polar(gradeToR(g), i);
          const isHov = hoveredAttr === k;
          return (
            <g key={k + 'b'}>
              <circle cx={x} cy={y} r={12} fill="transparent" onMouseEnter={() => onHover(k)} onMouseLeave={() => onHover(null)} style={{ cursor: 'default' }} />
              <circle cx={x} cy={y} r={isHov ? 4.5 : 2.5} fill={isHov ? '#c0a8ff' : PURPLE} stroke="#0a0a0f" strokeWidth={1} pointerEvents="none" />
            </g>
          );
        })}
        {ATTR_LABELS.map((lbl, i) => {
          const { x, y } = polar(LABEL_R, i);
          const dx = x - CENTER;
          const anchor = Math.abs(dx) < 8 ? 'middle' : dx > 0 ? 'start' : 'end';
          const isHov = hoveredAttr === ATTR_KEYS[i];
          return (
            <text key={i} x={x} y={y} textAnchor={anchor} dominantBaseline="middle" fontFamily="'DM Mono', monospace" fontSize={isHov ? 9 : 8} fill={isHov ? GOLD : `${MUTED}bb`} fontWeight={isHov ? 600 : 400} pointerEvents="none">
              {lbl}
            </text>
          );
        })}
        {!ptsA && !ptsB && (
          <text x={CENTER} y={CENTER} textAnchor="middle" dominantBaseline="middle" fontFamily="'DM Mono', monospace" fontSize={9} fill={`${MUTED}44`}>
            Select two prospects
          </text>
        )}
      </svg>

      {/* Legend strip — averages here, not cluttering the SVG center */}
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        gap: 16, padding: '10px 16px 14px',
        borderTop: `1px solid ${BORDER}22`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 18, height: 2, background: GOLD, display: 'inline-block', borderRadius: 1 }} />
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: GOLD }}>
            {labelA || 'A'}
          </span>
          {avgA && <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 17, color: GOLD, lineHeight: 1 }}>{avgA}</span>}
        </div>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: `${MUTED}44`, letterSpacing: 1 }}>AVG/10</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {avgB && <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 17, color: PURPLE, lineHeight: 1 }}>{avgB}</span>}
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: PURPLE }}>
            {labelB || 'B'}
          </span>
          <span style={{ width: 18, height: 2, background: PURPLE, display: 'inline-block', borderRadius: 1 }} />
        </div>
      </div>
    </div>
  );
}

// ─── AttrRow — three variants: left col, right col, full (mobile) ─────────────
function AttrRow({ attr, gradeA, gradeB, isHovered, onHover, descr, side }) {
  const diff = gradeA != null && gradeB != null ? gradeA - gradeB : null;
  const winner = diff == null ? null : diff > 0 ? 'A' : diff < 0 ? 'B' : 'tie';

  if (side === 'left') {
    const isWin = winner === 'A';
    return (
      <div onMouseEnter={() => onHover(attr)} onMouseLeave={() => onHover(null)}
        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', background: isHovered ? `${GOLD}08` : 'transparent', cursor: 'default' }}>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: isHovered ? GOLD : MUTED, letterSpacing: 1, flex: 1, textAlign: 'right', whiteSpace: 'nowrap' }}>
          {attr.toUpperCase()}
        </span>
        <div style={{ width: 64, height: 5, background: BORDER, borderRadius: 3, overflow: 'hidden', direction: 'rtl' }}>
          <div style={{ height: '100%', width: gradeA ? `${(gradeA / 10) * 100}%` : '0%', background: isWin ? GOLD : `${GOLD}44`, borderRadius: 3, transition: 'width 0.3s' }} />
        </div>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: isWin ? 700 : 400, color: gradeA != null ? (isWin ? GOLD : TEXT) : `${MUTED}33`, minWidth: 18, textAlign: 'right' }}>
          {gradeA ?? '—'}
        </span>
      </div>
    );
  }

  if (side === 'right') {
    const isWin = winner === 'B';
    return (
      <div onMouseEnter={() => onHover(attr)} onMouseLeave={() => onHover(null)}
        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', background: isHovered ? `${PURPLE}08` : 'transparent', cursor: 'default' }}>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: isWin ? 700 : 400, color: gradeB != null ? (isWin ? PURPLE : TEXT) : `${MUTED}33`, minWidth: 18 }}>
          {gradeB ?? '—'}
        </span>
        <div style={{ width: 64, height: 5, background: BORDER, borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: gradeB ? `${(gradeB / 10) * 100}%` : '0%', background: isWin ? PURPLE : `${PURPLE}44`, borderRadius: 3, transition: 'width 0.3s' }} />
        </div>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: isHovered ? PURPLE : MUTED, letterSpacing: 1, flex: 1, whiteSpace: 'nowrap' }}>
          {attr.toUpperCase()}
        </span>
      </div>
    );
  }

  // full — mobile
  return (
    <div onMouseEnter={() => onHover(attr)} onMouseLeave={() => onHover(null)}
      style={{ background: isHovered ? `${GOLD}08` : 'transparent', borderRadius: 6, padding: '10px 12px', cursor: 'default' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: isHovered ? GOLD : MUTED, letterSpacing: 1, flex: 1 }}>{attr.toUpperCase()}</span>
        {diff != null && (
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: winner === 'A' ? GOLD : winner === 'B' ? PURPLE : `${MUTED}55` }}>
            {winner === 'tie' ? 'EVEN' : winner === 'A' ? `+${diff} A` : `+${Math.abs(diff)} B`}
          </span>
        )}
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, fontWeight: 600, color: gradeA != null ? (winner === 'A' ? GOLD : TEXT) : `${MUTED}33`, minWidth: 18, textAlign: 'right' }}>{gradeA ?? '—'}</span>
          <div style={{ width: 80, height: 5, background: BORDER, borderRadius: 3, overflow: 'hidden', direction: 'rtl' }}>
            <div style={{ height: '100%', width: gradeA ? `${(gradeA / 10) * 100}%` : '0%', background: winner === 'A' ? GOLD : `${GOLD}44`, borderRadius: 3 }} />
          </div>
        </div>
        <div style={{ width: 1, height: 16, background: BORDER, flexShrink: 0 }} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 80, height: 5, background: BORDER, borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: gradeB ? `${(gradeB / 10) * 100}%` : '0%', background: winner === 'B' ? PURPLE : `${PURPLE}44`, borderRadius: 3 }} />
          </div>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, fontWeight: 600, color: gradeB != null ? (winner === 'B' ? PURPLE : TEXT) : `${MUTED}33`, minWidth: 18 }}>{gradeB ?? '—'}</span>
        </div>
      </div>
      {isHovered && <div style={{ fontSize: 11, color: `${MUTED}99`, marginTop: 6, lineHeight: 1.6, fontStyle: 'italic' }}>{descr}</div>}
    </div>
  );
}

// ─── StatRow — mirrored bar, one row per stat ─────────────────────────────────
function StatRow({ label, valA, valB, higherBetter = true }) {
  const numA = parseFloat(valA);
  const numB = parseFloat(valB);
  const hasVals = !isNaN(numA) && !isNaN(numB) && valA !== '—' && valB !== '—';
  const winA = hasVals && (higherBetter ? numA > numB : numA < numB);
  const winB = hasVals && (higherBetter ? numB > numA : numB < numA);
  const maxVal = hasVals ? Math.max(Math.abs(numA), Math.abs(numB), 0.01) : 1;
  const pctA = hasVals ? Math.min(100, (Math.abs(numA) / maxVal) * 100) : 0;
  const pctB = hasVals ? Math.min(100, (Math.abs(numB) / maxVal) * 100) : 0;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderBottom: `1px solid ${BORDER}22` }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: winA ? 700 : 400, color: winA ? GOLD : hasVals ? TEXT : `${MUTED}33`, minWidth: 44, textAlign: 'right' }}>{valA}</span>
        <div style={{ width: 60, height: 4, background: BORDER, borderRadius: 3, overflow: 'hidden', direction: 'rtl' }}>
          <div style={{ height: '100%', width: `${pctA}%`, background: winA ? GOLD : `${GOLD}33`, borderRadius: 3 }} />
        </div>
      </div>
      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: MUTED, letterSpacing: 1, textAlign: 'center', minWidth: 56, flexShrink: 0 }}>{label}</div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 60, height: 4, background: BORDER, borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pctB}%`, background: winB ? PURPLE : `${PURPLE}33`, borderRadius: 3 }} />
        </div>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: winB ? 700 : 400, color: winB ? PURPLE : hasVals ? TEXT : `${MUTED}33`, minWidth: 44 }}>{valB}</span>
      </div>
    </div>
  );
}

// ─── Prospect header card ─────────────────────────────────────────────────────
function ProspectHeader({ p, color }) {
  if (!p) return (
    <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: '16px 20px', opacity: 0.35, minHeight: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: MUTED, fontSize: 13, fontFamily: "'DM Mono', monospace" }}>— Select prospect —</span>
    </div>
  );
  const isTarget = LAL_TARGETS.includes(p.n);
  return (
    <div style={{ background: CARD, border: `1px solid ${color}44`, borderTop: `3px solid ${color}`, borderRadius: 10, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
      <Logo logoKey={PROSPECT_LOGO[p.n]} size={40} fallback={p.sch} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: TEXT, letterSpacing: 0.5, lineHeight: 1 }}>{p.n}</div>
        <div style={{ fontSize: 12, color: MUTED, marginTop: 3 }}>{p.pos} · {p.sch} · {p.cls} · Age {p.age?.toFixed(1)}</div>
        {isTarget && <span style={{ background: GOLD, color: '#000', borderRadius: 3, padding: '1px 5px', fontSize: 9, fontWeight: 700, fontFamily: "'DM Mono', monospace", display: 'inline-block', marginTop: 4 }}>LAL TARGET</span>}
      </div>
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, color, lineHeight: 1, flexShrink: 0 }}>#{p.rd}</div>
    </div>
  );
}

// ─── Shared column/section name header ────────────────────────────────────────
function NameHeader({ nameA, nameB }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderBottom: `1px solid ${BORDER}`, background: DARK }}>
      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: GOLD, letterSpacing: 1, flex: 1, textAlign: 'right' }}>
        {nameA ? nameA.split(' ').pop().toUpperCase() : 'PROSPECT A'}
      </span>
      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: `${MUTED}44`, minWidth: 20, textAlign: 'center' }}>vs</span>
      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: PURPLE, letterSpacing: 1, flex: 1 }}>
        {nameB ? nameB.split(' ').pop().toUpperCase() : 'PROSPECT B'}
      </span>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function Compare() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [hoveredAttr, setHoveredAttr] = useState(null);
  const [activeTab, setActiveTab] = useState('radar');
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

  const STAT_ROWS = [
    { label: 'PPG',      valA: fmt(prospectA?.ppg),   valB: fmt(prospectB?.ppg) },
    { label: 'RPG',      valA: fmt(prospectA?.rpg),   valB: fmt(prospectB?.rpg) },
    { label: 'APG',      valA: fmt(prospectA?.apg),   valB: fmt(prospectB?.apg) },
    { label: 'BPM',      valA: fmt(prospectA?.bpm),   valB: fmt(prospectB?.bpm) },
    { label: 'TS%',      valA: fmtP(prospectA?.ts),   valB: fmtP(prospectB?.ts) },
    { label: 'USG%',     valA: prospectA?.usg != null ? prospectA.usg + '%' : '—', valB: prospectB?.usg != null ? prospectB.usg + '%' : '—' },
    { label: 'STL/36',   valA: fmt(prospectA?.p36s),  valB: fmt(prospectB?.p36s) },
    { label: 'BLK/36',   valA: fmt(prospectA?.p36b),  valB: fmt(prospectB?.p36b) },
    { label: 'DBPM',     valA: fmt(prospectA?.dbpm),  valB: fmt(prospectB?.dbpm) },
    { label: 'WINGSPAN', valA: prospectA?.ws || '—',  valB: prospectB?.ws || '—' },
    { label: 'MAX VERT', valA: prospectA?.mv != null ? prospectA.mv + '"' : '—', valB: prospectB?.mv != null ? prospectB.mv + '"' : '—' },
    { label: 'LANE AGI', valA: prospectA?.la != null ? prospectA.la + 's' : '—', valB: prospectB?.la != null ? prospectB.la + 's' : '—', higherBetter: false },
  ];

  return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding }}>

        {/* Page header */}
        <div style={{ width: 40, height: 3, background: GOLD, marginBottom: 16, borderRadius: 2 }} />
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: isMobile ? 26 : 38, letterSpacing: 2, marginBottom: 4, color: TEXT }}>
          PROSPECT COMPARISON
        </h2>
        <p style={{ color: MUTED, fontSize: 13, marginBottom: 24, lineHeight: 1.6 }}>
          Grades percentile-ranked across the full 2026 class. Anchored in Mike Garcia's scouting philosophy.
        </p>

        {/* Selectors — accent border replaces text label */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
          <ProspectSelector value={nameA} onChange={setA} exclude={nameB} accentColor={GOLD} />
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: `${MUTED}66`, flexShrink: 0 }}>VS</div>
          <ProspectSelector value={nameB} onChange={setB} exclude={nameA} accentColor={PURPLE} />
        </div>

        {/* Prospect headers */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 10, marginBottom: 24 }}>
          <ProspectHeader p={prospectA} color={GOLD} />
          <ProspectHeader p={prospectB} color={PURPLE} />
        </div>

        {/* ── MOBILE ── */}
        {isMobile && (
          <>
            <div style={{ display: 'flex', gap: 0, marginBottom: 16, background: CARD, borderRadius: 8, padding: 4, border: `1px solid ${BORDER}` }}>
              {[{ id: 'radar', label: 'Radar' }, { id: 'attrs', label: 'Grades' }, { id: 'stats', label: 'Stats' }].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                  flex: 1, padding: '8px 0', borderRadius: 6, border: 'none',
                  background: activeTab === tab.id ? GOLD : 'transparent',
                  color: activeTab === tab.id ? '#000' : MUTED,
                  fontFamily: "'DM Mono', monospace", fontSize: 12,
                  fontWeight: activeTab === tab.id ? 700 : 400, cursor: 'pointer',
                }}>{tab.label}</button>
              ))}
            </div>

            {activeTab === 'radar' && (
              <ComparisonRadar gradesA={gradesA} gradesB={gradesB} nameA={nameA} nameB={nameB} hoveredAttr={hoveredAttr} onHover={setHoveredAttr} />
            )}

            {activeTab === 'attrs' && (
              <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, overflow: 'hidden' }}>
                <NameHeader nameA={nameA} nameB={nameB} />
                {ATTR_KEYS.map((attr, i) => (
                  <AttrRow key={attr} attr={attr} gradeA={gradesA?.[attr]} gradeB={gradesB?.[attr]} isHovered={hoveredAttr === attr} onHover={setHoveredAttr} descr={ATTR_DESCRIPTIONS[attr]} side="full" />
                ))}
                <div style={{ padding: '8px 12px', borderTop: `1px solid ${BORDER}`, background: DARK }}>
                  <div style={{ fontSize: 10, color: `${MUTED}44`, fontFamily: "'DM Mono', monospace", lineHeight: 1.5 }}>Percentile-ranked across 130 prospects. Tap rows for methodology.</div>
                </div>
              </div>
            )}

            {activeTab === 'stats' && (
              <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ padding: '10px 12px 6px', borderBottom: `1px solid ${BORDER}`, background: DARK }}>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 12, color: GOLD, letterSpacing: 2, marginBottom: 4 }}>STAT COMPARISON</div>
                  <NameHeader nameA={nameA} nameB={nameB} />
                </div>
                {STAT_ROWS.map(row => (
                  <StatRow key={row.label} label={row.label} valA={row.valA} valB={row.valB} higherBetter={row.higherBetter !== false} />
                ))}
              </div>
            )}
          </>
        )}

        {/* ── DESKTOP ── */}
        {!isMobile && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Dashboard: grades | radar | grades */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px 1fr', gap: 0, alignItems: 'stretch' }}>

              {/* Left col — Prospect A */}
              <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRight: 'none', borderRadius: '10px 0 0 10px', overflow: 'hidden' }}>
                <div style={{ padding: '10px 12px', borderBottom: `1px solid ${BORDER}`, background: DARK, textAlign: 'right' }}>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: GOLD, letterSpacing: 1 }}>
                    {nameA ? nameA.split(' ').pop().toUpperCase() : 'PROSPECT A'}
                  </span>
                </div>
                {ATTR_KEYS.map((attr) => (
                  <AttrRow key={attr} attr={attr} gradeA={gradesA?.[attr]} gradeB={gradesB?.[attr]} isHovered={hoveredAttr === attr} onHover={setHoveredAttr} descr={ATTR_DESCRIPTIONS[attr]} side="left" />
                ))}
              </div>

              {/* Center — radar */}
              <ComparisonRadar gradesA={gradesA} gradesB={gradesB} nameA={nameA} nameB={nameB} hoveredAttr={hoveredAttr} onHover={setHoveredAttr} />

              {/* Right col — Prospect B */}
              <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderLeft: 'none', borderRadius: '0 10px 10px 0', overflow: 'hidden' }}>
                <div style={{ padding: '10px 12px', borderBottom: `1px solid ${BORDER}`, background: DARK }}>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: PURPLE, letterSpacing: 1 }}>
                    {nameB ? nameB.split(' ').pop().toUpperCase() : 'PROSPECT B'}
                  </span>
                </div>
                {ATTR_KEYS.map((attr) => (
                  <AttrRow key={attr} attr={attr} gradeA={gradesA?.[attr]} gradeB={gradesB?.[attr]} isHovered={hoveredAttr === attr} onHover={setHoveredAttr} descr={ATTR_DESCRIPTIONS[attr]} side="right" />
                ))}
              </div>
            </div>

            {/* Stat comparison — full width below */}
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px 8px', borderBottom: `1px solid ${BORDER}`, background: DARK }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 13, color: GOLD, letterSpacing: 2, marginBottom: 6 }}>STAT COMPARISON</div>
                <NameHeader nameA={nameA} nameB={nameB} />
              </div>
              {STAT_ROWS.map(row => (
                <StatRow key={row.label} label={row.label} valA={row.valA} valB={row.valB} higherBetter={row.higherBetter !== false} />
              ))}
            </div>
          </div>
        )}

        {/* Methodology note */}
        <div style={{ marginTop: 32, padding: '16px 20px', background: CARD, border: `1px solid ${BORDER}`, borderLeft: `3px solid ${GOLD}44`, borderRadius: 10 }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 11, color: GOLD, letterSpacing: 2, marginBottom: 8 }}>METHODOLOGY</div>
          <div style={{ fontSize: 12, color: `${MUTED}99`, lineHeight: 1.8 }}>
            All grades are percentile-ranked within the 2026 class (130 prospects) and scaled 1–10. Anchored in Mike Garcia's analytical framework: FTR as a physicality proxy, paired STL%/BLK% for defensive playmaking, TS%-at-usage for scoring efficiency, age-adjusted BPM for projection. Athleticism requires NBA Combine participation. Shooting Range currently uses OBPM as a proxy — will be updated with Hoop Math shot-location data.
          </div>
        </div>
      </div>
    </div>
  );
}
