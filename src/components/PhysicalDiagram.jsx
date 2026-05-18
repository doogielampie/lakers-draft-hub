/**
 * PhysicalDiagram.jsx
 * Da Vinci / Jarvis-style schematic figure comparing two prospects'
 * physical measurements. Prospect A = gold (left), Prospect B = purple (right).
 * Pure SVG — no images, no external assets.
 */

const GOLD   = '#FDB927';
const PURPLE = '#552583';
const MUTED  = '#8a8a9a';
const BORDER = '#2a2a3a';
const TEXT   = '#f0f0f0';

// ─── Figure geometry constants ────────────────────────────────────────────────
const W = 600, H = 520;
const CX = 300;                         // figure center x

const OY = 40;                          // vertical offset — headroom for markers

const HEAD_CY  = 72  + OY;             // 112
const HEAD_R   = 28;
const NECK_TOP = HEAD_CY + HEAD_R;     // 140
const NECK_BOT = NECK_TOP + 16;        // 156
const NECK_W   = 14;

const SHOULDER_Y = NECK_BOT + 6;      // 162
const SHOULDER_W = 86;                 // half-width

const HIP_Y = SHOULDER_Y + 128;       // 290
const HIP_W = 50;

const KNEE_Y = HIP_Y + 106;           // 396
const FOOT_Y = KNEE_Y + 106;          // 502

const LEG_HW = 18;                    // leg half-width
const LEG_GAP = 14;                   // gap from center to each leg

const ARM_Y   = SHOULDER_Y + 8;       // 170 — slightly below shoulder top
const HAND_XL = CX - 198;             // 102 — left fingertip
const HAND_XR = CX + 198;             // 498 — right fingertip

// Standing reach = conceptual arm raised overhead
// Shown as a bracket marker above the head
const REACH_Y   = HEAD_CY - HEAD_R - 32;   // 52
const REACH_LINE = REACH_Y - 6;            // 46 — dashed line

// Max vertical arrow origin (ground level to jump height)
const VERT_BASE = FOOT_Y;
const VERT_TIP  = REACH_Y - 16;           // 36

// ─── Parse wingspan string "6' 10.75''" → feet & inches display ─────────────
function fmtLen(str) {
  if (!str || str === '—') return '—';
  // already formatted like "6' 10.75''" — return as-is but clean up
  return str.replace(/\s+/g, '');
}

function fmtWeight(p) {
  if (p?.wc != null) return Math.round(p.wc) + ' lbs';
  if (p?.wtT != null) return p.wtT + ' lbs';
  return '—';
}

// ─── Callout line component ───────────────────────────────────────────────────
// Draws a horizontal tick + horizontal line to a label area
function Callout({ x, y, side, labelA, labelB, description, flip = false }) {
  // side: 'left' = line goes left from x; 'right' = line goes right from x
  const dir   = side === 'left' ? -1 : 1;
  const x1    = x;
  const x2    = side === 'left' ? 24 : W - 24;
  const textX = side === 'left' ? 20 : W - 20;
  const anchor = side === 'left' ? 'end' : 'start';

  return (
    <g>
      {/* Tick mark at figure */}
      <line x1={x1 - 4} y1={y} x2={x1 + 4} y2={y} stroke={`${MUTED}66`} strokeWidth={0.8} />
      {/* Horizontal callout line */}
      <line x1={x1} y1={y} x2={x2} y2={y} stroke={`${MUTED}33`} strokeWidth={0.6} strokeDasharray="3,4" />
      {/* Dot at line end */}
      <circle cx={x2} cy={y} r={2} fill={`${MUTED}55`} />
      {/* Labels */}
      <text
        x={textX} y={y - 5} textAnchor={anchor}
        fontFamily="'DM Mono', monospace" fontSize={9}
        fill={side === 'left' ? GOLD : PURPLE}
        fontWeight={600}
      >
        {side === 'left' ? labelA : labelB}
      </text>
      {description && (
        <text
          x={textX} y={y + 8} textAnchor={anchor}
          fontFamily="'DM Mono', monospace" fontSize={7.5}
          fill={`${MUTED}77`} letterSpacing={0.5}
        >
          {description}
        </text>
      )}
    </g>
  );
}

// ─── Vertical bracket ─────────────────────────────────────────────────────────
function VertBracket({ x, y1, y2, side, labelA, labelB }) {
  const bx  = side === 'left' ? x - 16 : x + 16;
  const tx  = side === 'left' ? x - 20 : x + 20;
  const anchor = side === 'left' ? 'end' : 'start';
  const midY = (y1 + y2) / 2;
  const color = side === 'left' ? GOLD : PURPLE;
  const label = side === 'left' ? labelA : labelB;

  return (
    <g>
      {/* Vertical line */}
      <line x1={bx} y1={y1} x2={bx} y2={y2} stroke={`${color}55`} strokeWidth={0.8} />
      {/* Top tick */}
      <line x1={bx - 4} y1={y1} x2={bx + 4} y2={y1} stroke={`${color}55`} strokeWidth={0.8} />
      {/* Bottom tick */}
      <line x1={bx - 4} y1={y2} x2={bx + 4} y2={y2} stroke={`${color}55`} strokeWidth={0.8} />
      {/* Label */}
      <text x={tx} y={midY - 5} textAnchor={anchor} fontFamily="'DM Mono', monospace" fontSize={9} fill={color} fontWeight={600}>{label}</text>
      <text x={tx} y={midY + 8} textAnchor={anchor} fontFamily="'DM Mono', monospace" fontSize={7.5} fill={`${MUTED}77`} letterSpacing={0.5}>HEIGHT</text>
    </g>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function PhysicalDiagram({ prospectA, prospectB, nameA, nameB }) {
  const labelA = nameA ? nameA.split(' ').pop().toUpperCase() : 'A';
  const labelB = nameB ? nameB.split(' ').pop().toUpperCase() : 'B';

  const htA   = fmtLen(prospectA?.ht);
  const htB   = fmtLen(prospectB?.ht);
  const wsA   = fmtLen(prospectA?.ws);
  const wsB   = fmtLen(prospectB?.ws);
  const srA   = fmtLen(prospectA?.sr);
  const srB   = fmtLen(prospectB?.sr);
  const wtA   = fmtWeight(prospectA);
  const wtB   = fmtWeight(prospectB);
  const mvA   = prospectA?.mv != null ? prospectA.mv + '"' : '—';
  const mvB   = prospectB?.mv != null ? prospectB.mv + '"' : '—';

  const hasData = prospectA || prospectB;

  return (
    <div style={{
      background: 'radial-gradient(ellipse at 50% 60%, #0f0f1e 0%, #08080f 100%)',
      border: `1px solid ${BORDER}`,
      borderRadius: 14,
      padding: '16px 8px 12px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Scanlines */}
      <div style={{ position: 'absolute', inset: 0, borderRadius: 14, backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.008) 3px, rgba(255,255,255,0.008) 6px)', pointerEvents: 'none' }} />
      {/* Corner brackets */}
      {[
        { top: 8, left: 8, borderTop: `1px solid ${GOLD}44`, borderLeft: `1px solid ${GOLD}44` },
        { top: 8, right: 8, borderTop: `1px solid ${GOLD}44`, borderRight: `1px solid ${GOLD}44` },
        { bottom: 8, left: 8, borderBottom: `1px solid ${GOLD}44`, borderLeft: `1px solid ${GOLD}44` },
        { bottom: 8, right: 8, borderBottom: `1px solid ${GOLD}44`, borderRight: `1px solid ${GOLD}44` },
      ].map((s, i) => <div key={i} style={{ position: 'absolute', width: 16, height: 16, ...s }} />)}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 16, height: 2, background: GOLD, display: 'inline-block', borderRadius: 1 }} />
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: GOLD, letterSpacing: 1 }}>{labelA}</span>
        </div>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 12, color: `${MUTED}88`, letterSpacing: 3 }}>PHYSICAL PROFILE</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: PURPLE, letterSpacing: 1 }}>{labelB}</span>
          <span style={{ width: 16, height: 2, background: PURPLE, display: 'inline-block', borderRadius: 1 }} />
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>

        {/* ── Radial grid lines (subtle, engineering feel) ─────────────────── */}
        <circle cx={CX} cy={HEAD_CY} r={120} fill="none" stroke={`${BORDER}44`} strokeWidth={0.4} strokeDasharray="1,8" />
        <circle cx={CX} cy={HEAD_CY} r={220} fill="none" stroke={`${BORDER}33`} strokeWidth={0.3} strokeDasharray="1,12" />

        {/* ── Ground line ──────────────────────────────────────────────────── */}
        <line x1={60} y1={FOOT_Y} x2={W - 60} y2={FOOT_Y} stroke={`${BORDER}88`} strokeWidth={0.8} />
        {/* Ground hash marks */}
        {[-3, -2, -1, 0, 1, 2, 3].map(i => (
          <line key={i} x1={CX + i * 40} y1={FOOT_Y} x2={CX + i * 40 + 12} y2={FOOT_Y + 8} stroke={`${BORDER}55`} strokeWidth={0.6} />
        ))}

        {/* ── Standing reach dashed line ───────────────────────────────────── */}
        <line x1={CX - 30} y1={REACH_LINE} x2={CX + 30} y2={REACH_LINE} stroke={`${MUTED}33`} strokeWidth={0.6} strokeDasharray="2,3" />
        <line x1={CX} y1={REACH_LINE} x2={CX} y2={HEAD_CY - HEAD_R} stroke={`${MUTED}22`} strokeWidth={0.5} strokeDasharray="2,4" />

        {/* ── Max vertical arrow (right side, above head) ──────────────────── */}
        {/* Arrow line */}
        <line x1={CX + 110} y1={FOOT_Y} x2={CX + 110} y2={VERT_TIP + 8} stroke={`${PURPLE}44`} strokeWidth={0.8} strokeDasharray="2,3" />
        {/* Arrowhead */}
        <polygon points={`${CX + 110},${VERT_TIP} ${CX + 106},${VERT_TIP + 10} ${CX + 114},${VERT_TIP + 10}`} fill={`${PURPLE}44`} />
        {/* Bracket at ground */}
        <line x1={CX + 106} y1={FOOT_Y} x2={CX + 114} y2={FOOT_Y} stroke={`${PURPLE}44`} strokeWidth={0.8} />

        {/* ── Wingspan horizontal line ─────────────────────────────────────── */}
        <line x1={HAND_XL} y1={ARM_Y} x2={HAND_XR} y2={ARM_Y} stroke={`${MUTED}22`} strokeWidth={0.6} strokeDasharray="2,4" />
        {/* Endpoint ticks */}
        <line x1={HAND_XL} y1={ARM_Y - 6} x2={HAND_XL} y2={ARM_Y + 6} stroke={`${MUTED}44`} strokeWidth={0.8} />
        <line x1={HAND_XR} y1={ARM_Y - 6} x2={HAND_XR} y2={ARM_Y + 6} stroke={`${MUTED}44`} strokeWidth={0.8} />

        {/* ── FIGURE ───────────────────────────────────────────────────────── */}
        {/* All figure elements use a shared stroke style */}
        <g stroke={`${MUTED}cc`} strokeWidth={1.2} fill="none" strokeLinejoin="round" strokeLinecap="round">

          {/* Head */}
          <circle cx={CX} cy={HEAD_CY} r={HEAD_R} />

          {/* Neck */}
          <rect x={CX - NECK_W / 2} y={NECK_TOP} width={NECK_W} height={NECK_BOT - NECK_TOP} rx={3} />

          {/* Torso — trapezoid: wider at shoulders, narrower at hips */}
          <path d={`
            M ${CX - SHOULDER_W} ${SHOULDER_Y}
            L ${CX + SHOULDER_W} ${SHOULDER_Y}
            L ${CX + HIP_W} ${HIP_Y}
            L ${CX - HIP_W} ${HIP_Y}
            Z
          `} />

          {/* Left arm — shoulder to elbow to hand */}
          <path d={`
            M ${CX - SHOULDER_W} ${SHOULDER_Y + 6}
            L ${CX - SHOULDER_W - 60} ${ARM_Y + 4}
            L ${HAND_XL} ${ARM_Y}
          `} strokeWidth={1.4} />

          {/* Right arm */}
          <path d={`
            M ${CX + SHOULDER_W} ${SHOULDER_Y + 6}
            L ${CX + SHOULDER_W + 60} ${ARM_Y + 4}
            L ${HAND_XR} ${ARM_Y}
          `} strokeWidth={1.4} />

          {/* Hand circles */}
          <circle cx={HAND_XL} cy={ARM_Y} r={5} />
          <circle cx={HAND_XR} cy={ARM_Y} r={5} />

          {/* Left leg */}
          <path d={`
            M ${CX - LEG_GAP - LEG_HW} ${HIP_Y}
            L ${CX - LEG_GAP - LEG_HW - 6} ${KNEE_Y}
            L ${CX - LEG_GAP - LEG_HW - 2} ${FOOT_Y}
          `} strokeWidth={1.4} />
          <path d={`
            M ${CX - LEG_GAP + LEG_HW} ${HIP_Y}
            L ${CX - LEG_GAP + LEG_HW - 4} ${KNEE_Y}
            L ${CX - LEG_GAP + LEG_HW - 6} ${FOOT_Y}
          `} strokeWidth={1.4} />
          {/* Left knee */}
          <circle cx={CX - LEG_GAP} cy={KNEE_Y} r={6} />

          {/* Right leg */}
          <path d={`
            M ${CX + LEG_GAP - LEG_HW} ${HIP_Y}
            L ${CX + LEG_GAP - LEG_HW + 4} ${KNEE_Y}
            L ${CX + LEG_GAP - LEG_HW + 6} ${FOOT_Y}
          `} strokeWidth={1.4} />
          <path d={`
            M ${CX + LEG_GAP + LEG_HW} ${HIP_Y}
            L ${CX + LEG_GAP + LEG_HW + 6} ${KNEE_Y}
            L ${CX + LEG_GAP + LEG_HW + 2} ${FOOT_Y}
          `} strokeWidth={1.4} />
          {/* Right knee */}
          <circle cx={CX + LEG_GAP} cy={KNEE_Y} r={6} />

          {/* Feet (small rectangles) */}
          <rect x={CX - LEG_GAP - LEG_HW - 8} y={FOOT_Y} width={22} height={7} rx={3} />
          <rect x={CX + LEG_GAP - 6} y={FOOT_Y} width={22} height={7} rx={3} />

        </g>

        {/* Joint dots — subtle structural markers */}
        {[
          [CX - SHOULDER_W, SHOULDER_Y],
          [CX + SHOULDER_W, SHOULDER_Y],
          [CX - HIP_W, HIP_Y],
          [CX + HIP_W, HIP_Y],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={3} fill={`${MUTED}44`} stroke={`${MUTED}88`} strokeWidth={0.6} />
        ))}

        {/* ── MEASUREMENT CALLOUTS ─────────────────────────────────────────── */}

        {/* 1. HEIGHT — vertical bracket, A (gold) left, B (purple) right */}
        {/* Left bracket (A) */}
        <VertBracket
          x={HAND_XL - 10} y1={HEAD_CY - HEAD_R} y2={FOOT_Y}
          side="left" labelA={htA} labelB={htB}
        />
        {/* Right bracket (B) */}
        <VertBracket
          x={HAND_XR + 10} y1={HEAD_CY - HEAD_R} y2={FOOT_Y}
          side="right" labelA={htA} labelB={htB}
        />

        {/* 2. WINGSPAN — A label at left fingertip, B label at right fingertip */}
        {/* Left (A) */}
        <text x={HAND_XL - 8} y={ARM_Y - 14} textAnchor="end" fontFamily="'DM Mono', monospace" fontSize={9} fill={GOLD} fontWeight={600}>{wsA}</text>
        <text x={HAND_XL - 8} y={ARM_Y - 3} textAnchor="end" fontFamily="'DM Mono', monospace" fontSize={7.5} fill={`${MUTED}77`} letterSpacing={0.5}>WINGSPAN</text>
        {/* Right (B) */}
        <text x={HAND_XR + 8} y={ARM_Y - 14} textAnchor="start" fontFamily="'DM Mono', monospace" fontSize={9} fill={PURPLE} fontWeight={600}>{wsB}</text>
        <text x={HAND_XR + 8} y={ARM_Y - 3} textAnchor="start" fontFamily="'DM Mono', monospace" fontSize={7.5} fill={`${MUTED}77`} letterSpacing={0.5}>WINGSPAN</text>

        {/* 3. STANDING REACH — callout from above head, A left, B right */}
        {/* Left callout line */}
        <line x1={CX - 30} y1={REACH_LINE} x2={36} y2={REACH_LINE} stroke={`${MUTED}33`} strokeWidth={0.6} strokeDasharray="3,4" />
        <circle cx={36} cy={REACH_LINE} r={2} fill={`${MUTED}55`} />
        <text x={32} y={REACH_LINE - 5} textAnchor="end" fontFamily="'DM Mono', monospace" fontSize={9} fill={GOLD} fontWeight={600}>{srA}</text>
        <text x={32} y={REACH_LINE + 8} textAnchor="end" fontFamily="'DM Mono', monospace" fontSize={7.5} fill={`${MUTED}77`} letterSpacing={0.5}>STD REACH</text>
        {/* Right callout line */}
        <line x1={CX + 30} y1={REACH_LINE} x2={W - 36} y2={REACH_LINE} stroke={`${MUTED}33`} strokeWidth={0.6} strokeDasharray="3,4" />
        <circle cx={W - 36} cy={REACH_LINE} r={2} fill={`${MUTED}55`} />
        <text x={W - 32} y={REACH_LINE - 5} textAnchor="start" fontFamily="'DM Mono', monospace" fontSize={9} fill={PURPLE} fontWeight={600}>{srB}</text>
        <text x={W - 32} y={REACH_LINE + 8} textAnchor="start" fontFamily="'DM Mono', monospace" fontSize={7.5} fill={`${MUTED}77`} letterSpacing={0.5}>STD REACH</text>

        {/* 4. WEIGHT — callout from torso center */}
        {(() => {
          const torsoMidY = (SHOULDER_Y + HIP_Y) / 2; // ~226
          return (
            <>
              {/* A left */}
              <line x1={CX - HIP_W + 10} y1={torsoMidY} x2={36} y2={torsoMidY} stroke={`${MUTED}33`} strokeWidth={0.6} strokeDasharray="3,4" />
              <circle cx={36} cy={torsoMidY} r={2} fill={`${MUTED}55`} />
              <text x={32} y={torsoMidY - 5} textAnchor="end" fontFamily="'DM Mono', monospace" fontSize={9} fill={GOLD} fontWeight={600}>{wtA}</text>
              <text x={32} y={torsoMidY + 8} textAnchor="end" fontFamily="'DM Mono', monospace" fontSize={7.5} fill={`${MUTED}77`} letterSpacing={0.5}>WEIGHT</text>
              {/* B right */}
              <line x1={CX + HIP_W - 10} y1={torsoMidY} x2={W - 36} y2={torsoMidY} stroke={`${MUTED}33`} strokeWidth={0.6} strokeDasharray="3,4" />
              <circle cx={W - 36} cy={torsoMidY} r={2} fill={`${MUTED}55`} />
              <text x={W - 32} y={torsoMidY - 5} textAnchor="start" fontFamily="'DM Mono', monospace" fontSize={9} fill={PURPLE} fontWeight={600}>{wtB}</text>
              <text x={W - 32} y={torsoMidY + 8} textAnchor="start" fontFamily="'DM Mono', monospace" fontSize={7.5} fill={`${MUTED}77`} letterSpacing={0.5}>WEIGHT</text>
            </>
          );
        })()}

        {/* 5. MAX VERTICAL — label beside arrow */}
        {/* A (gold) — left of arrow */}
        <text x={CX + 94} y={(FOOT_Y + VERT_TIP) / 2 - 5} textAnchor="end" fontFamily="'DM Mono', monospace" fontSize={9} fill={GOLD} fontWeight={600}>{mvA}</text>
        <text x={CX + 94} y={(FOOT_Y + VERT_TIP) / 2 + 8} textAnchor="end" fontFamily="'DM Mono', monospace" fontSize={7.5} fill={`${MUTED}77`} letterSpacing={0.5}>MAX VERT</text>
        {/* B (purple) — right of arrow */}
        <text x={CX + 126} y={(FOOT_Y + VERT_TIP) / 2 - 5} textAnchor="start" fontFamily="'DM Mono', monospace" fontSize={9} fill={PURPLE} fontWeight={600}>{mvB}</text>
        <text x={CX + 126} y={(FOOT_Y + VERT_TIP) / 2 + 8} textAnchor="start" fontFamily="'DM Mono', monospace" fontSize={7.5} fill={`${MUTED}77`} letterSpacing={0.5}>MAX VERT</text>

        {/* ── Empty state overlay ─────────────────────────────────────────── */}
        {!hasData && (
          <text x={CX} y={H / 2} textAnchor="middle" dominantBaseline="middle" fontFamily="'DM Mono', monospace" fontSize={11} fill={`${MUTED}44`}>
            Select two prospects to compare
          </text>
        )}

      </svg>

      {/* Footer note */}
      <div style={{ textAlign: 'center', paddingTop: 4 }}>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: `${MUTED}44`, letterSpacing: 1 }}>
          NBA COMBINE MEASUREMENTS · NO-SHOES HEIGHT
        </span>
      </div>
    </div>
  );
}
