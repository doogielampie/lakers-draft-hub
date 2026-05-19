/**
 * PhysicalDiagram.jsx
 * Human silhouette PNG (438×569) with precise SVG measurement callout overlay.
 * Image anchor points calibrated from pixel analysis:
 *   Raised hand tips:  y=14,  cx=218
 *   Wingspan row:      y=180, left_x=13, right_x=424
 *   Head top (body):   y=97
 *   Torso mid:         y=340
 *   Feet:              y=555
 *   Image center x:    218
 * viewBox matches image: 0 0 438 569, SVG overflow=visible for margin labels.
 * Prospect A = gold = LEFT side labels
 * Prospect B = purple = RIGHT side labels
 */

const GOLD   = '#FDB927';
const PURPLE = '#552583';
const MUTED  = '#8a8a9a';
const BORDER = '#2a2a3a';
const TEXT   = '#f0f0f0';

// ─── Image intrinsic dimensions (pixel-exact) ─────────────────────────────────
const IW = 438, IH = 569;
const CX = 218; // center x

// ─── Calibrated anchor points ─────────────────────────────────────────────────
const REACH_Y      = 14;   // raised hand tips (standing reach)
const WINGSPAN_Y   = 180;  // outstretched arm row
const WS_LEFT_X    = 13;   // left fingertip x
const WS_RIGHT_X   = 424;  // right fingertip x
const HEAD_TOP_Y   = 97;   // top of head/body at center
const TORSO_MID_Y  = 340;  // weight callout
const MAX_VERT_Y   = 440;  // max vertical callout (lower torso)
const FOOT_Y       = 555;  // ground

// ─── Label rail x positions — outside image edges, SVG overflow:visible ────────
// These are in viewBox units; the SVG container has horizontal padding so
// labels don't get clipped by the outer div
const LEFT_LABEL_X  = -8;  // right-aligned labels on the left
const RIGHT_LABEL_X = IW + 8; // left-aligned labels on the right

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtLen(str) {
  if (!str || str === '—') return '—';
  return str.replace(/\s+/g, '');
}
function fmtWeight(p) {
  if (p?.wc != null) return Math.round(p.wc) + ' lbs';
  if (p?.wtT != null) return p.wtT + ' lbs';
  return '—';
}

// ─── Horizontal callout: dot at anchor → dashed line to rail → label ──────────
// side: 'left' (gold, label right-aligned at LEFT_LABEL_X)
//       'right' (purple, label left-aligned at RIGHT_LABEL_X)
function HCallout({ anchorX, anchorY, side, valueLine, statLabel }) {
  const color  = side === 'left' ? GOLD : PURPLE;
  const railX  = side === 'left' ? LEFT_LABEL_X  : RIGHT_LABEL_X;
  const anchor = side === 'left' ? 'end'          : 'start';

  return (
    <g>
      {/* Anchor dot on figure */}
      <circle cx={anchorX} cy={anchorY} r={2.5} fill={`${color}99`} />
      {/* Dashed line to margin */}
      <line x1={anchorX} y1={anchorY} x2={railX} y2={anchorY}
        stroke={`${color}55`} strokeWidth={0.8} strokeDasharray="4,5" />
      {/* Terminal dot */}
      <circle cx={railX} cy={anchorY} r={2} fill={`${color}88`} />
      {/* Value */}
      <text x={railX} y={anchorY - 6} textAnchor={anchor}
        fontFamily="'DM Mono', monospace" fontSize={13}
        fill={color} fontWeight={700}>{valueLine}</text>
      {/* Stat label */}
      <text x={railX} y={anchorY + 9} textAnchor={anchor}
        fontFamily="'DM Mono', monospace" fontSize={9}
        fill={`${MUTED}88`} letterSpacing={0.5}>{statLabel}</text>
    </g>
  );
}

// ─── Vertical bracket for height ──────────────────────────────────────────────
function VBracket({ side, y1, y2, valueLabel }) {
  const color  = side === 'left' ? GOLD : PURPLE;
  // bracket x: just outside the image bounds
  const bx     = side === 'left' ? LEFT_LABEL_X + 14 : RIGHT_LABEL_X - 14;
  const tx     = side === 'left' ? LEFT_LABEL_X       : RIGHT_LABEL_X;
  const anchor = side === 'left' ? 'end'               : 'start';
  const midY   = (y1 + y2) / 2;

  return (
    <g>
      {/* Vertical line */}
      <line x1={bx} y1={y1} x2={bx} y2={y2}
        stroke={`${color}55`} strokeWidth={1} />
      {/* Top cap */}
      <line x1={bx - 5} y1={y1} x2={bx + 5} y2={y1}
        stroke={`${color}77`} strokeWidth={1} />
      {/* Bottom cap */}
      <line x1={bx - 5} y1={y2} x2={bx + 5} y2={y2}
        stroke={`${color}77`} strokeWidth={1} />
      {/* Value */}
      <text x={tx} y={midY - 7} textAnchor={anchor}
        fontFamily="'DM Mono', monospace" fontSize={13}
        fill={color} fontWeight={700}>{valueLabel}</text>
      {/* Label */}
      <text x={tx} y={midY + 9} textAnchor={anchor}
        fontFamily="'DM Mono', monospace" fontSize={9}
        fill={`${MUTED}88`} letterSpacing={0.5}>HEIGHT</text>
    </g>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function PhysicalDiagram({ prospectA, prospectB, nameA, nameB }) {
  const labelA = nameA ? nameA.split(' ').pop().toUpperCase() : 'A';
  const labelB = nameB ? nameB.split(' ').pop().toUpperCase() : 'B';

  const htA = fmtLen(prospectA?.ht);
  const htB = fmtLen(prospectB?.ht);
  const wsA = fmtLen(prospectA?.ws);
  const wsB = fmtLen(prospectB?.ws);
  const srA = fmtLen(prospectA?.sr);
  const srB = fmtLen(prospectB?.sr);
  const wtA = fmtWeight(prospectA);
  const wtB = fmtWeight(prospectB);
  const mvA = prospectA?.mv != null ? `${prospectA.mv}"` : '—';
  const mvB = prospectB?.mv != null ? `${prospectB.mv}"` : '—';

  return (
    <div style={{
      background: '#08080f',
      border: `1px solid ${BORDER}`,
      borderRadius: 14,
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Scanlines */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2,
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.006) 3px, rgba(255,255,255,0.006) 6px)',
      }} />
      {/* Corner brackets */}
      {[
        { top: 8,    left: 8,   borderTop:    `1px solid ${GOLD}44`, borderLeft:   `1px solid ${GOLD}44` },
        { top: 8,    right: 8,  borderTop:    `1px solid ${GOLD}44`, borderRight:  `1px solid ${GOLD}44` },
        { bottom: 8, left: 8,   borderBottom: `1px solid ${GOLD}44`, borderLeft:   `1px solid ${GOLD}44` },
        { bottom: 8, right: 8,  borderBottom: `1px solid ${GOLD}44`, borderRight:  `1px solid ${GOLD}44` },
      ].map((s, i) => (
        <div key={i} style={{ position: 'absolute', width: 18, height: 18, zIndex: 3, ...s }} />
      ))}

      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px 24px 8px', position: 'relative', zIndex: 3,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 16, height: 2, background: GOLD, display: 'inline-block', borderRadius: 1 }} />
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: GOLD, letterSpacing: 1 }}>{labelA}</span>
        </div>
        <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 13, color: `${MUTED}66`, letterSpacing: 3 }}>
          PHYSICAL PROFILE
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: PURPLE, letterSpacing: 1 }}>{labelB}</span>
          <span style={{ width: 16, height: 2, background: PURPLE, display: 'inline-block', borderRadius: 1 }} />
        </div>
      </div>

      {/* PNG + SVG overlay — horizontal padding gives room for labels */}
      <div style={{
        position: 'relative',
        padding: '0 120px', // room for labels on each side
        boxSizing: 'border-box',
      }}>
        {/* Silhouette */}
        <img
          src="/lakers-draft-hub/human_silhouette.png"
          alt="Human silhouette"
          style={{ width: '100%', display: 'block' }}
        />

        {/* SVG overlay — viewBox matches image pixels exactly */}
        <svg
          viewBox={`0 0 ${IW} ${IH}`}
          style={{
            position: 'absolute',
            // inset must account for the 120px left/right padding
            top: 0, bottom: 0,
            left: '120px', right: '120px',
            width: 'calc(100% - 240px)',
            height: '100%',
            overflow: 'visible', // labels spill into padding area
          }}
        >
          {/* ── 1. STANDING REACH — raised hand tips, top of figure ───────── */}
          <HCallout
            anchorX={CX - 30} anchorY={REACH_Y}
            side="left" valueLine={srA} statLabel="STD REACH"
          />
          <HCallout
            anchorX={CX + 30} anchorY={REACH_Y}
            side="right" valueLine={srB} statLabel="STD REACH"
          />

          {/* ── 2. HEIGHT — vertical bracket, left (A) and right (B) ──────── */}
          <VBracket side="left"  y1={HEAD_TOP_Y} y2={FOOT_Y} valueLabel={htA} />
          <VBracket side="right" y1={HEAD_TOP_Y} y2={FOOT_Y} valueLabel={htB} />

          {/* ── 3. WINGSPAN — labels at each outstretched fingertip ───────── */}
          {/* Subtle dashed span line */}
          <line
            x1={WS_LEFT_X} y1={WINGSPAN_Y}
            x2={WS_RIGHT_X} y2={WINGSPAN_Y}
            stroke={`${MUTED}1a`} strokeWidth={0.6} strokeDasharray="3,7"
          />
          <HCallout
            anchorX={WS_LEFT_X} anchorY={WINGSPAN_Y}
            side="left" valueLine={wsA} statLabel="WINGSPAN"
          />
          <HCallout
            anchorX={WS_RIGHT_X} anchorY={WINGSPAN_Y}
            side="right" valueLine={wsB} statLabel="WINGSPAN"
          />

          {/* ── 4. WEIGHT — torso mid ─────────────────────────────────────── */}
          <HCallout
            anchorX={CX - 45} anchorY={TORSO_MID_Y}
            side="left" valueLine={wtA} statLabel="WEIGHT"
          />
          <HCallout
            anchorX={CX + 45} anchorY={TORSO_MID_Y}
            side="right" valueLine={wtB} statLabel="WEIGHT"
          />

          {/* ── 5. MAX VERTICAL — lower torso ────────────────────────────── */}
          <HCallout
            anchorX={CX - 45} anchorY={MAX_VERT_Y}
            side="left" valueLine={mvA} statLabel="MAX VERT"
          />
          <HCallout
            anchorX={CX + 45} anchorY={MAX_VERT_Y}
            side="right" valueLine={mvB} statLabel="MAX VERT"
          />
        </svg>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '8px 0 12px', position: 'relative', zIndex: 3 }}>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: `${MUTED}33`, letterSpacing: 1 }}>
          NBA COMBINE · NO-SHOES HEIGHT
        </span>
      </div>
    </div>
  );
}
