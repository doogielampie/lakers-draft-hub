import { useState } from 'react';
import { COMPUTED_GRADES, ATTR_KEYS, ATTR_LABELS, ATTR_DESCRIPTIONS } from '../data/grades';
import { GOLD, PURPLE, BORDER, MUTED, TEXT, SURFACE, CARD } from '../theme';

const N = ATTR_KEYS.length;
const CENTER = 130;
const MAX_R = 100;
const LABEL_R = 118;
const TICKS = [2, 4, 6, 8, 10];

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
function peaks(grades) {
  const entries = ATTR_KEYS.map(k => ({ k, v: grades[k] })).filter(e => e.v != null);
  if (!entries.length) return { hi: '—', lo: '—', max: '—', min: '—' };
  const hi = entries.reduce((a, b) => b.v > a.v ? b : a);
  const lo = entries.reduce((a, b) => b.v < a.v ? b : a);
  return { hi: hi.k, lo: lo.k, max: hi.v, min: lo.v };
}

export default function ProspectRadar({ prospectName }) {
  const grades = COMPUTED_GRADES[prospectName];
  const [hovered, setHovered] = useState(null);

  if (!grades) return null;

  const polyPts = pointsStr(grades);
  const { hi, lo, max, min } = peaks(grades);
  const overallAvg = avg(grades);
  const viewSize = CENTER * 2;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 12, letterSpacing: 2, color: GOLD }}>SCOUTING GRADES</div>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: MUTED }}>MG METHODOLOGY</div>
      </div>

      <div style={{ background: 'radial-gradient(ellipse at center, #12121e 0%, #0a0a0f 100%)', border: `1px solid ${BORDER}`, borderRadius: 12, padding: '8px 4px 4px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: 12, backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.012) 2px, rgba(255,255,255,0.012) 4px)', pointerEvents: 'none' }} />
        {[
          { top: 6, left: 6, borderTop: `1px solid ${GOLD}55`, borderLeft: `1px solid ${GOLD}55` },
          { top: 6, right: 6, borderTop: `1px solid ${GOLD}55`, borderRight: `1px solid ${GOLD}55` },
          { bottom: 6, left: 6, borderBottom: `1px solid ${GOLD}55`, borderLeft: `1px solid ${GOLD}55` },
          { bottom: 6, right: 6, borderBottom: `1px solid ${GOLD}55`, borderRight: `1px solid ${GOLD}55` },
        ].map((s, i) => <div key={i} style={{ position: 'absolute', width: 12, height: 12, ...s }} />)}

        <svg viewBox={`0 0 ${viewSize} ${viewSize}`} width="100%" style={{ display: 'block', maxWidth: 280, margin: '0 auto' }}>
          {TICKS.map(t => {
            const r = gradeToR(t);
            const pts = Array.from({ length: N }, (_, i) => { const { x, y } = polar(r, i); return `${x},${y}`; }).join(' ');
            return <polygon key={t} points={pts} fill="none" stroke={t === 8 ? `${GOLD}30` : `${BORDER}88`} strokeWidth={t === 8 ? 0.8 : 0.5} strokeDasharray={t === 10 ? 'none' : '2,3'} />;
          })}
          {Array.from({ length: N }, (_, i) => {
            const inner = polar(0, i); const outer = polar(MAX_R, i);
            return <line key={i} x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke={`${BORDER}66`} strokeWidth={0.5} />;
          })}
          <polygon points={polyPts} fill={`${GOLD}1a`} stroke={GOLD} strokeWidth={1.5} strokeLinejoin="round" />
          <polygon points={polyPts} fill="none" stroke={`${PURPLE}80`} strokeWidth={0.5} strokeLinejoin="round" strokeDasharray="3,4" />
          {ATTR_KEYS.map((k, i) => {
            const g = grades[k] ?? 0;
            const { x, y } = polar(gradeToR(g), i);
            const isHov = hovered === i;
            return (
              <g key={k}>
                <circle cx={x} cy={y} r={10} fill="transparent" onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} style={{ cursor: 'default' }} />
                <circle cx={x} cy={y} r={isHov ? 4 : 2.5} fill={isHov ? '#fff' : GOLD} stroke={isHov ? GOLD : '#0a0a0f'} strokeWidth={1} pointerEvents="none" />
                {isHov && <circle cx={x} cy={y} r={7} fill="none" stroke={`${GOLD}55`} strokeWidth={1} pointerEvents="none" />}
              </g>
            );
          })}
          {ATTR_LABELS.map((lbl, i) => {
            const { x, y } = polar(LABEL_R, i);
            const dx = x - CENTER;
            const anchor = Math.abs(dx) < 8 ? 'middle' : dx > 0 ? 'start' : 'end';
            const isHov = hovered === i;
            return <text key={i} x={x} y={y} textAnchor={anchor} dominantBaseline="middle" fontFamily="'DM Mono', monospace" fontSize={isHov ? 8.5 : 7.5} fill={isHov ? GOLD : `${MUTED}cc`} fontWeight={isHov ? 600 : 400} pointerEvents="none">{lbl}</text>;
          })}
          <text x={CENTER} y={CENTER - 7} textAnchor="middle" fontFamily="'Bebas Neue', sans-serif" fontSize={22} fill={GOLD} opacity={0.9}>{overallAvg}</text>
          <text x={CENTER} y={CENTER + 9} textAnchor="middle" fontFamily="'DM Mono', monospace" fontSize={6.5} fill={`${MUTED}99`} letterSpacing={1}>AVG / 10</text>
        </svg>

        <div style={{ height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px 6px' }}>
          {hovered !== null ? (
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: TEXT, display: 'flex', gap: 8 }}>
              <span style={{ color: MUTED }}>{ATTR_KEYS[hovered]}</span>
              <span style={{ color: GOLD, fontWeight: 600 }}>{grades[ATTR_KEYS[hovered]] ?? '—'} / 10</span>
            </div>
          ) : (
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: `${MUTED}55` }}>hover to inspect</div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginTop: 8 }}>
        <div style={{ background: `${GOLD}12`, border: `1px solid ${GOLD}33`, borderRadius: 8, padding: '8px 10px' }}>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: `${MUTED}99`, letterSpacing: 0.5, marginBottom: 3 }}>PEAK</div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 13, color: GOLD, letterSpacing: 0.5 }}>{hi}</div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: GOLD }}>{max} / 10</div>
        </div>
        <div style={{ background: `${PURPLE}18`, border: `1px solid ${PURPLE}44`, borderRadius: 8, padding: '8px 10px' }}>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: `${MUTED}99`, letterSpacing: 0.5, marginBottom: 3 }}>FLOOR</div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 13, color: `${MUTED}cc`, letterSpacing: 0.5 }}>{lo}</div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: MUTED }}>{min} / 10</div>
        </div>
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, padding: '8px 10px', display: 'flex', flexWrap: 'wrap', gap: '3px 5px', alignContent: 'flex-start' }}>
          {ATTR_LABELS.map((lbl, i) => (
            <span key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
              style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: hovered === i ? GOLD : (grades[ATTR_KEYS[i]] ?? 0) >= 8 ? `${GOLD}cc` : `${MUTED}99`, cursor: 'default', transition: 'color 0.1s' }}>
              {lbl}·{grades[ATTR_KEYS[i]] ?? '—'}
            </span>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 8, padding: '8px 10px', background: `${BORDER}44`, borderRadius: 6 }}>
        <div style={{ fontSize: 10, color: `${MUTED}77`, lineHeight: 1.6, fontFamily: "'DM Mono', monospace" }}>
          {hovered !== null ? ATTR_DESCRIPTIONS[ATTR_KEYS[hovered]] : 'Percentile-ranked across 130 prospects. Hover attributes for methodology.'}
        </div>
      </div>
    </div>
  );
}
