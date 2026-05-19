/**
 * PhysicalDiagram.jsx
 * Human silhouette PNG with SVG measurement callout overlay.
 * Image: /human_silhouette.png (1404×788 px, gold/purple split figure)
 * ViewBox for overlay matches image aspect ratio: 1404 × 788
 * Key anchor points (calibrated from image):
 *   Top of head:      cx=702, cy=52
 *   Left fingertip:   cx=298, cy=200
 *   Right fingertip:  cx=1106, cy=200
 *   Feet/ground:      cy=752
 *   Torso mid:        cx=702, cy=420
 *   Wingspan line y:  200
 */

const GOLD   = '#FDB927';
const PURPLE = '#552583';
const MUTED  = '#8a8a9a';
const BORDER = '#2a2a3a';
const TEXT   = '#f0f0f0';

// Image intrinsic dimensions
const IW = 1404, IH = 788;

// ─── Calibrated anchor points ─────────────────────────────────────────────────
const HEAD_TOP_Y   = 52;
const HAND_L_X     = 298,  HAND_Y    = 200;
const HAND_R_X     = 1106;
const FOOT_Y       = 752;
const TORSO_MID_Y  = 420;
const CX           = IW / 2; // 702

// Callout rail x positions (where horizontal lines terminate at margins)
const LEFT_RAIL    = 48;
const RIGHT_RAIL   = IW - 48;

function fmtLen(str) {
  if (!str || str === '—') return '—';
  return str.replace(/\s+/g, '');
}
function fmtWeight(p) {
  if (p?.wc != null) return Math.round(p.wc) + ' lbs';
  if (p?.wtT != null) return p.wtT + ' lbs';
  return '—';
}

// ─── Horizontal callout: dashed line from anchor to rail, label above/below ──
function HCallout({ anchorX, anchorY, rail, side, valLine1, valLine2 }) {
  const color  = side === 'left' ? GOLD : PURPLE;
  const anchor = side === 'left' ? 'end' : 'start';
  const tx     = side === 'left' ? rail - 6 : rail + 6;

  return (
    <g>
      <circle cx={anchorX} cy={anchorY} r={3} fill={`${color}66`} />
      <line x1={anchorX} y1={anchorY} x2={rail} y2={anchorY}
        stroke={`${color}44`} strokeWidth={1} strokeDasharray="4,5" />
      <circle cx={rail} cy={anchorY} r={3} fill={`${color}88`} />
      <text x={tx} y={anchorY - 7} textAnchor={anchor}
        fontFamily="'DM Mono', monospace" fontSize={18}
        fill={color} fontWeight={700}>{valLine1}</text>
      {valLine2 && (
        <text x={tx} y={anchorY + 14} textAnchor={anchor}
          fontFamily="'DM Mono', monospace" fontSize={13}
          fill={`${MUTED}99`} letterSpacing={1}>{valLine2}</text>
      )}
    </g>
  );
}

// ─── Vertical bracket (for height) ───────────────────────────────────────────
function VBracket({ side, y1, y2, label, sublabel }) {
  const color  = side === 'left' ? GOLD : PURPLE;
  const bx     = side === 'left' ? LEFT_RAIL + 20 : RIGHT_RAIL - 20;
  const tx     = side === 'left' ? bx - 8 : bx + 8;
  const anchor = side === 'left' ? 'end' : 'start';
  const midY   = (y1 + y2) / 2;

  return (
    <g>
      <line x1={bx} y1={y1} x2={bx} y2={y2} stroke={`${color}55`} strokeWidth={1.2} />
      <line x1={bx - 8} y1={y1} x2={bx + 8} y2={y1} stroke={`${color}66`} strokeWidth={1} />
      <line x1={bx - 8} y1={y2} x2={bx + 8} y2={y2} stroke={`${color}66`} strokeWidth={1} />
      <text x={tx} y={midY - 10} textAnchor={anchor}
        fontFamily="'DM Mono', monospace" fontSize={18}
        fill={color} fontWeight={700}>{label}</text>
      <text x={tx} y={midY + 12} textAnchor={anchor}
        fontFamily="'DM Mono', monospace" fontSize={12}
        fill={`${MUTED}88`} letterSpacing={2}>{sublabel}</text>
    </g>
  );
}

export default function PhysicalDiagram({ prospectA, prospectB, nameA, nameB }) {
  const labelA = nameA ? nameA.split(' ').pop().toUpperCase() : 'A';
  const labelB = nameB ? nameB.split(' ').pop().toUpperCase() : 'B';

  const htA  = fmtLen(prospectA?.ht);
  const htB  = fmtLen(prospectB?.ht);
  const wsA  = fmtLen(prospectA?.ws);
  const wsB  = fmtLen(prospectB?.ws);
  const srA  = fmtLen(prospectA?.sr);
  const srB  = fmtLen(prospectB?.sr);
  const wtA  = fmtWeight(prospectA);
  const wtB  = fmtWeight(prospectB);
  const mvA  = prospectA?.mv != null ? `${prospectA.mv}"` : '—';
  const mvB  = prospectB?.mv != null ? `${prospectB.mv}"` : '—';

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
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.007) 3px, rgba(255,255,255,0.007) 6px)',
      }} />
      {/* Corner brackets */}
      {[
        { top: 8,  left: 8,  borderTop:    `1px solid ${GOLD}44`, borderLeft:   `1px solid ${GOLD}44` },
        { top: 8,  right: 8, borderTop:    `1px solid ${GOLD}44`, borderRight:  `1px solid ${GOLD}44` },
        { bottom: 8, left: 8,  borderBottom: `1px solid ${GOLD}44`, borderLeft: `1px solid ${GOLD}44` },
        { bottom: 8, right: 8, borderBottom: `1px solid ${GOLD}44`, borderRight:`1px solid ${GOLD}44` },
      ].map((s, i) => (
        <div key={i} style={{ position: 'absolute', width: 18, height: 18, zIndex: 3, ...s }} />
      ))}

      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px 20px 8px', position: 'relative', zIndex: 3,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 18, height: 2, background: GOLD, display: 'inline-block', borderRadius: 1 }} />
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: GOLD, letterSpacing: 1 }}>{labelA}</span>
        </div>
        <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 13, color: `${MUTED}77`, letterSpacing: 3 }}>
          PHYSICAL PROFILE
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: PURPLE, letterSpacing: 1 }}>{labelB}</span>
          <span style={{ width: 18, height: 2, background: PURPLE, display: 'inline-block', borderRadius: 1 }} />
        </div>
      </div>

      {/* PNG + SVG overlay container */}
      <div style={{ position: 'relative', width: '100%' }}>
        {/* Silhouette PNG */}
        <img
          src="/lakers-draft-hub/human_silhouette.png"
          alt="Human silhouette"
          style={{ width: '100%', display: 'block' }}
        />

        {/* SVG overlay — same aspect ratio as image */}
        <svg
          viewBox={`0 0 ${IW} ${IH}`}
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            overflow: 'visible',
          }}
        >
          {/* ── 1. HEIGHT — vertical brackets at far left (A) and far right (B) */}
          <VBracket side="left"  y1={HEAD_TOP_Y} y2={FOOT_Y} label={htA}  sublabel="HEIGHT" />
          <VBracket side="right" y1={HEAD_TOP_Y} y2={FOOT_Y} label={htB}  sublabel="HEIGHT" />

          {/* ── 2. WINGSPAN — A label at left hand, B label at right hand */}
          {/* Dashed span line at hand height */}
          <line x1={HAND_L_X} y1={HAND_Y} x2={HAND_R_X} y2={HAND_Y}
            stroke={`${MUTED}22`} strokeWidth={0.8} strokeDasharray="3,6" />
          {/* A — left */}
          <HCallout anchorX={HAND_L_X} anchorY={HAND_Y}
            rail={LEFT_RAIL} side="left"
            valLine1={wsA} valLine2="WINGSPAN" />
          {/* B — right */}
          <HCallout anchorX={HAND_R_X} anchorY={HAND_Y}
            rail={RIGHT_RAIL} side="right"
            valLine1={wsB} valLine2="WINGSPAN" />

          {/* ── 3. STANDING REACH — slightly above head */}
          {(() => {
            const y = HEAD_TOP_Y - 10;
            return (
              <>
                {/* A — left */}
                <HCallout anchorX={CX - 40} anchorY={y}
                  rail={LEFT_RAIL} side="left"
                  valLine1={srA} valLine2="STD REACH" />
                {/* B — right */}
                <HCallout anchorX={CX + 40} anchorY={y}
                  rail={RIGHT_RAIL} side="right"
                  valLine1={srB} valLine2="STD REACH" />
              </>
            );
          })()}

          {/* ── 4. WEIGHT — torso mid */}
          <HCallout anchorX={CX - 60} anchorY={TORSO_MID_Y}
            rail={LEFT_RAIL} side="left"
            valLine1={wtA} valLine2="WEIGHT" />
          <HCallout anchorX={CX + 60} anchorY={TORSO_MID_Y}
            rail={RIGHT_RAIL} side="right"
            valLine1={wtB} valLine2="WEIGHT" />

          {/* ── 5. MAX VERTICAL — lower torso / hip area */}
          {(() => {
            const y = 580;
            return (
              <>
                <HCallout anchorX={CX - 50} anchorY={y}
                  rail={LEFT_RAIL} side="left"
                  valLine1={mvA} valLine2="MAX VERT" />
                <HCallout anchorX={CX + 50} anchorY={y}
                  rail={RIGHT_RAIL} side="right"
                  valLine1={mvB} valLine2="MAX VERT" />
              </>
            );
          })()}
        </svg>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '8px 0 12px', position: 'relative', zIndex: 3 }}>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: `${MUTED}44`, letterSpacing: 1 }}>
          NBA COMBINE · NO-SHOES HEIGHT
        </span>
      </div>
    </div>
  );
}
