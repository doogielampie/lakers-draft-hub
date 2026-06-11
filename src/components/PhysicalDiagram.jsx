/**
 * PhysicalDiagram.jsx — "Dumbbell" physical comparison chart.
 *
 * Replaces the old silhouette-PNG callout diagram. Every physical measurement
 * sits on ONE shared horizontal scale (further-right = stronger): a gold dot
 * (prospect A) and a purple dot (prospect B) joined by a winner-colored edge
 * bar. Each prospect's dots are linked into a single connected spine. Metrics
 * are grouped Frame / Length / Explosiveness.
 *
 * Props contract is unchanged: { prospectA, prospectB, nameA, nameB }.
 * Measurements are read from the existing combine data layer (bigboard.js)
 * rather than any hardcoded prototype object.
 */
import { useState } from 'react';
import { GOLD, PURPLE_LT, BORDER, TEXT, MUTED, DARK } from '../theme';

const PANEL_BG = '#08080f';

// ─── Layout constants (SVG user units) ────────────────────────────────────────
const DVW = 880;
const TX0 = 212, TX1 = 648, TW = TX1 - TX0; // track span
const CHIP_CX = 770;
const ROW_H = 50, GRP_GAP = 14, GRP_HEAD = 22, TOP = 50;

// ─── Metric descriptors ───────────────────────────────────────────────────────
// higher:true  → bigger value is better
// higher:false → lower value is better (timed events)
// dom = [min, max] plausible 2026-class range, used ONLY to normalize dot position
const PHYS_METRICS = [
  { key: 'ht', label: 'HEIGHT',         unit: 'no shoes', kind: 'len', dom: [70, 88],     higher: true  },
  { key: 'ws', label: 'WINGSPAN',       unit: '',         kind: 'len', dom: [74, 92],     higher: true  },
  { key: 'sr', label: 'STANDING REACH', unit: '',         kind: 'len', dom: [92, 118],    higher: true  },
  { key: 'wt', label: 'WEIGHT',         unit: 'lbs',      kind: 'wt',  dom: [160, 290],   higher: true  },
  { key: 'mv', label: 'MAX VERTICAL',   unit: 'in',       kind: 'in',  dom: [27, 46],     higher: true  },
  { key: 'la', label: 'LANE AGILITY',   unit: 'sec',      kind: 's',   dom: [10.2, 12.0], higher: false },
  { key: 'sp', label: 'SPRINT 3/4',     unit: 'sec',      kind: 's',   dom: [3.0, 3.65],  higher: false },
];

const GROUPS = [
  { name: 'FRAME',         keys: ['ht', 'wt'] },
  { name: 'LENGTH',        keys: ['sr', 'ws'] },
  { name: 'EXPLOSIVENESS', keys: ['mv', 'la', 'sp'] },
];

const mByKey = (k) => PHYS_METRICS.find((m) => m.key === k);

// ─── Data mapping (combine data → chart shape) ────────────────────────────────
// App length fields are strings like "6' 4.50''"; convert to { d, v } where
// v = total inches and d = a clean display string ("6' 4.5\"").
function parseLen(str) {
  if (!str || typeof str !== 'string') return null;
  const m = str.match(/(\d+)\s*'\s*([\d.]+)/);
  if (!m) return null;
  const ft = parseInt(m[1], 10);
  const inch = parseFloat(m[2]);
  if (Number.isNaN(ft) || Number.isNaN(inch)) return null;
  const v = ft * 12 + inch;
  const inchD = Number.isInteger(inch)
    ? String(inch)
    : inch.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
  return { d: `${ft}' ${inchD}"`, v };
}

// Build the { ht, ws, sr, wt, mv, la, sp } record the chart consumes.
function toPhys(p) {
  if (!p) return null;
  const wt = p.wc != null ? Math.round(p.wc) : (p.wtT != null ? p.wtT : null);
  return {
    ht: parseLen(p.ht),
    ws: parseLen(p.ws),
    sr: parseLen(p.sr),
    wt,
    mv: p.mv != null ? p.mv : null,
    la: p.la != null ? p.la : null,
    sp: p.sp != null ? p.sp : null,
  };
}

// ─── Core helpers (chart depends on normMetric) ───────────────────────────────
function normMetric(m, val) {
  const [lo, hi] = m.dom;
  let t = Math.min(1, Math.max(0, (val - lo) / (hi - lo)));
  return m.higher ? t : 1 - t; // invert for timed events
}
function metricVal(m, p) {
  const val = p[m.key];
  if (val == null) return null;
  return m.kind === 'len' ? val.v : val;
}
function fmtMetric(m, p) {
  const val = p[m.key];
  if (val == null) return '—';
  if (m.kind === 'len') return val.d;       // "6' 4.5\""
  if (m.kind === 'wt')  return val + ' lbs';
  if (m.kind === 'in')  return val + '"';
  if (m.kind === 's')   return val.toFixed(2) + 's';
  return String(val);
}
function metricWinner(m, A, B) {            // 'A' | 'B' | 'tie'
  const va = metricVal(m, A), vb = metricVal(m, B);
  if (va === vb) return 'tie';
  return (m.higher ? va > vb : va < vb) ? 'A' : 'B';
}
function metricDelta(m, A, B) {             // absolute gap, formatted with unit
  const d = Math.abs(metricVal(m, A) - metricVal(m, B));
  if (m.kind === 'len' || m.kind === 'in')
    return (Number.isInteger(d) ? d : d.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')) + '"';
  if (m.kind === 'wt') return Math.round(d) + ' lbs';
  if (m.kind === 's')  return d.toFixed(2) + 's';
  return String(d);
}

// ─── Panel chrome ─────────────────────────────────────────────────────────────
function PanelChrome() {
  const corners = [
    { top: 10, left: 10,  borderTop: `1px solid ${GOLD}55`, borderLeft: `1px solid ${GOLD}55` },
    { top: 10, right: 10, borderTop: `1px solid ${GOLD}55`, borderRight: `1px solid ${GOLD}55` },
    { bottom: 10, left: 10,  borderBottom: `1px solid ${GOLD}55`, borderLeft: `1px solid ${GOLD}55` },
    { bottom: 10, right: 10, borderBottom: `1px solid ${GOLD}55`, borderRight: `1px solid ${GOLD}55` },
  ];
  return (
    <>
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2,
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.008) 3px, rgba(255,255,255,0.008) 6px)',
      }} />
      {corners.map((st, i) => (
        <div key={i} style={{ position: 'absolute', width: 18, height: 18, zIndex: 3, ...st }} />
      ))}
    </>
  );
}

function PhysHeader({ labelA, labelB }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '14px 24px 10px', position: 'relative', zIndex: 3,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
        <span style={{ width: 16, height: 2, background: GOLD, display: 'inline-block', borderRadius: 1 }} />
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: GOLD, letterSpacing: 1 }}>{labelA}</span>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 15, color: MUTED, letterSpacing: 3, whiteSpace: 'nowrap' }}>PHYSICAL EDGE</div>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 8, color: `${MUTED}66`, letterSpacing: 2, marginTop: 2, whiteSpace: 'nowrap' }}>ONE SCALE · FURTHER RIGHT = STRONGER</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'flex-end' }}>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: PURPLE_LT, letterSpacing: 1 }}>{labelB}</span>
        <span style={{ width: 16, height: 2, background: PURPLE_LT, display: 'inline-block', borderRadius: 1 }} />
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function PhysicalDiagram({ prospectA, prospectB, nameA, nameB }) {
  const [hoveredMetric, setHoveredMetric] = useState(null);

  const labelA = nameA ? nameA.split(' ').pop().toUpperCase() : 'A';
  const labelB = nameB ? nameB.split(' ').pop().toUpperCase() : 'B';

  const A = toPhys(prospectA);
  const B = toPhys(prospectB);

  // ─── Layout pass ──────────────────────────────────────────────────────────
  const rows = [];
  const groupLabels = [];
  let y = TOP;
  let firstGroup = true;

  if (A && B) {
    GROUPS.forEach((g) => {
      const keys = g.keys.filter((k) => {
        const m = mByKey(k);
        return metricVal(m, A) != null && metricVal(m, B) != null;
      });
      if (keys.length === 0) return;
      if (!firstGroup) y += GRP_GAP;
      firstGroup = false;
      groupLabels.push({ name: g.name, y });
      y += GRP_HEAD;
      keys.forEach((k) => {
        const m = mByKey(k);
        const posA = TX0 + normMetric(m, metricVal(m, A)) * TW;
        const posB = TX0 + normMetric(m, metricVal(m, B)) * TW;
        const win = metricWinner(m, A, B);
        rows.push({ m, y: y + ROW_H / 2, posA, posB, win });
        y += ROW_H;
      });
    });
  }
  const H = y + 16;

  const goldPts = rows.map((r) => `${r.posA},${r.y}`).join(' ');
  const purplePts = rows.map((r) => `${r.posB},${r.y}`).join(' ');

  let aw = 0, bw = 0;
  rows.forEach((r) => { if (r.win === 'A') aw++; else if (r.win === 'B') bw++; });

  const empty = rows.length === 0;

  return (
    <div style={{
      background: PANEL_BG, border: `1px solid ${BORDER}`, borderRadius: 14,
      overflow: 'hidden', position: 'relative',
    }}>
      <PanelChrome />
      <PhysHeader labelA={labelA} labelB={labelB} />

      <div style={{ padding: '0 6px' }}>
        {empty ? (
          <div style={{
            padding: '40px 0 48px', textAlign: 'center',
            fontFamily: "'DM Mono', monospace", fontSize: 11, color: `${MUTED}99`, letterSpacing: 1,
          }}>
            NO COMBINE MEASUREMENTS AVAILABLE FOR THIS MATCHUP
          </div>
        ) : (
          <svg viewBox={`0 0 ${DVW} ${H}`} width="100%" style={{ display: 'block' }}>
            {/* scale legend (learned once) */}
            <text x={TX0} y={30} fontFamily="'DM Mono', monospace" fontSize="8.5" fill={`${MUTED}88`} letterSpacing="1">◄ WEAKER</text>
            <text x={TX1} y={30} textAnchor="end" fontFamily="'DM Mono', monospace" fontSize="8.5" fill={`${MUTED}88`} letterSpacing="1">STRONGER ►</text>
            <text x={CHIP_CX} y={30} textAnchor="middle" fontFamily="'DM Mono', monospace" fontSize="8.5" fill={`${MUTED}66`} letterSpacing="1">EDGE</text>

            {/* group headers + hairline rules */}
            {groupLabels.map((g) => (
              <g key={g.name}>
                <text x={28} y={g.y + GRP_HEAD - 6} fontFamily="'Bebas Neue', sans-serif" fontSize="14" fill={`${MUTED}cc`} letterSpacing="2">{g.name}</text>
                <line x1={120} y1={g.y + GRP_HEAD - 11} x2={DVW - 24} y2={g.y + GRP_HEAD - 11} stroke={`${BORDER}66`} strokeWidth="1" />
              </g>
            ))}

            {/* connected spines (each player as one shape) */}
            <polyline points={goldPts} fill="none" stroke={GOLD} strokeWidth="2" opacity={hoveredMetric ? 0.12 : 0.28} strokeLinejoin="round" />
            <polyline points={purplePts} fill="none" stroke={PURPLE_LT} strokeWidth="2" opacity={hoveredMetric ? 0.12 : 0.28} strokeLinejoin="round" />

            {/* rows */}
            {rows.map((r) => {
              const m = r.m;
              const dim = hoveredMetric && hoveredMetric !== m.key;
              const leftX = Math.min(r.posA, r.posB), rightX = Math.max(r.posA, r.posB);
              const winColor = r.win === 'B' ? PURPLE_LT : GOLD;
              const aWin = r.win === 'A', bWin = r.win === 'B';
              const inverted = m.higher === false;
              const subLabel = inverted ? 'LOWER = FASTER' : (m.unit ? m.unit.toUpperCase() : '');
              const winLast = r.win === 'A' ? labelA : labelB;
              const chipTxt = r.win === 'tie' ? 'EVEN' : `${winLast}  +${metricDelta(m, A, B)}`;
              const chipW = Math.min(196, chipTxt.length * 6.6 + 18);
              return (
                <g key={m.key} opacity={dim ? 0.32 : 1} style={{ transition: 'opacity .15s' }}>
                  {/* hover hit area + highlight */}
                  <rect x={20} y={r.y - ROW_H / 2 + 2} width={DVW - 40} height={ROW_H - 4} rx="6"
                    fill={hoveredMetric === m.key ? 'rgba(255,255,255,0.03)' : 'transparent'}
                    onMouseEnter={() => setHoveredMetric(m.key)} onMouseLeave={() => setHoveredMetric(null)} />

                  {/* metric label + sub-label */}
                  <text x={188} y={r.y - 2} textAnchor="end" fontFamily="'DM Mono', monospace" fontSize="11" fill={hoveredMetric === m.key ? TEXT : `${MUTED}dd`} letterSpacing="0.5" style={{ pointerEvents: 'none' }}>{m.label}</text>
                  <text x={188} y={r.y + 11} textAnchor="end" fontFamily="'DM Mono', monospace" fontSize="7.5" fill={`${MUTED}77`} letterSpacing="0.5" style={{ pointerEvents: 'none' }}>{subLabel}</text>

                  {/* full-scale track */}
                  <line x1={TX0} y1={r.y} x2={TX1} y2={r.y} stroke={`${BORDER}cc`} strokeWidth="2" strokeLinecap="round" style={{ pointerEvents: 'none' }} />
                  {/* edge connector (winner-colored) */}
                  <line x1={leftX} y1={r.y} x2={rightX} y2={r.y} stroke={winColor} strokeWidth="5" strokeLinecap="round" opacity={r.win === 'tie' ? 0.3 : 0.92} style={{ pointerEvents: 'none' }} />

                  {/* dots */}
                  <circle cx={r.posA} cy={r.y} r={aWin ? 7.5 : 6} fill={GOLD} stroke="#08080f" strokeWidth="2" style={{ pointerEvents: 'none', filter: aWin && hoveredMetric === m.key ? `drop-shadow(0 0 5px ${GOLD})` : 'none' }} />
                  <circle cx={r.posB} cy={r.y} r={bWin ? 7.5 : 6} fill={PURPLE_LT} stroke="#08080f" strokeWidth="2" style={{ pointerEvents: 'none', filter: bWin && hoveredMetric === m.key ? `drop-shadow(0 0 5px ${PURPLE_LT})` : 'none' }} />

                  {/* value labels — gold above, purple below (consistent) */}
                  <text x={r.posA} y={r.y - 13} textAnchor="middle" fontFamily="'DM Mono', monospace" fontSize="12" fontWeight={aWin ? 600 : 400} fill={aWin ? GOLD : `${GOLD}cc`} style={{ pointerEvents: 'none' }}>{fmtMetric(m, A)}</text>
                  <text x={r.posB} y={r.y + 21} textAnchor="middle" fontFamily="'DM Mono', monospace" fontSize="12" fontWeight={bWin ? 600 : 400} fill={bWin ? PURPLE_LT : `${PURPLE_LT}cc`} style={{ pointerEvents: 'none' }}>{fmtMetric(m, B)}</text>

                  {/* edge chip */}
                  <g style={{ pointerEvents: 'none' }}>
                    <rect x={CHIP_CX - chipW / 2} y={r.y - 10} width={chipW} height="20" rx="4"
                      fill={r.win === 'tie' ? 'transparent' : `${winColor}1f`} stroke={r.win === 'tie' ? BORDER : `${winColor}66`} strokeWidth="1" />
                    <text x={CHIP_CX} y={r.y + 4} textAnchor="middle" fontFamily="'DM Mono', monospace" fontSize="10" fontWeight="500" fill={r.win === 'tie' ? `${MUTED}99` : winColor} letterSpacing="0.5">{chipTxt}</text>
                  </g>
                </g>
              );
            })}
          </svg>
        )}
      </div>

      {/* tally footer */}
      {!empty && (
        <div style={{ display: 'flex', alignItems: 'stretch', borderTop: `1px solid ${BORDER}`, background: DARK }}>
          <div style={{ flex: aw, padding: '12px 20px', background: `${GOLD}10`, display: 'flex', alignItems: 'center', gap: 10, transition: 'flex .3s' }}>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, color: GOLD, lineHeight: 1 }}>{aw}</span>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: `${GOLD}bb`, letterSpacing: 1 }}>EDGES · {labelA}</span>
          </div>
          <div style={{ flex: bw, padding: '12px 20px', background: `${PURPLE_LT}14`, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, transition: 'flex .3s' }}>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: `${PURPLE_LT}cc`, letterSpacing: 1 }}>EDGES · {labelB}</span>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, color: PURPLE_LT, lineHeight: 1 }}>{bw}</span>
          </div>
        </div>
      )}
    </div>
  );
}
