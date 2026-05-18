import { useState } from 'react';
import { RADAR_ATTRS, RADAR_LABELS, RADAR_GRADES } from '../data/radarGrades';
import { GOLD, PURPLE, BORDER, MUTED, TEXT, SURFACE, CARD } from '../theme';

const N = RADAR_ATTRS.length; // 12
const CENTER = 130;
const MAX_R = 100;
const LABEL_R = 118;
const TICKS = [2, 4, 6, 8, 10];

// Polar → cartesian. Offset by -90° so first spoke points up.
function polar(r, i) {
  const angle = (2 * Math.PI * i) / N - Math.PI / 2;
  return {
    x: CENTER + r * Math.cos(angle),
    y: CENTER + r * Math.sin(angle),
  };
}

function gradeToR(g) {
  return (g / 10) * MAX_R;
}

function pointsStr(grades) {
  return grades
    .map((g, i) => {
      const { x, y } = polar(gradeToR(g), i);
      return `${x},${y}`;
    })
    .join(' ');
}

// Avg grade across the 12 attributes
function avg(grades) {
  return (grades.reduce((s, g) => s + g, 0) / grades.length).toFixed(1);
}

// Which attribute is strongest / weakest
function peaks(grades) {
  const max = Math.max(...grades);
  const min = Math.min(...grades);
  const hi = RADAR_ATTRS[grades.indexOf(max)];
  const lo = RADAR_ATTRS[grades.indexOf(min)];
  return { hi, lo, max, min };
}

// Spoke angle in degrees for rotate transform
function spokeDeg(i) {
  return (360 * i) / N - 90;
}

export default function ProspectRadar({ prospectName }) {
  const grades = RADAR_GRADES[prospectName];
  const [hovered, setHovered] = useState(null);

  // ── No data state ───────────────────────────────────────────────────────
  if (!grades) {
    return (
      <div style={{
        background: `${SURFACE}cc`,
        border: `1px solid ${BORDER}`,
        borderRadius: 10,
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          border: `1px dashed ${BORDER}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          fontSize: 16, color: MUTED,
        }}>
          ◌
        </div>
        <div>
          <div style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 12, letterSpacing: 2, color: MUTED, marginBottom: 4,
          }}>
            SCOUTING GRADES
          </div>
          <div style={{ fontSize: 12, color: `${MUTED}99`, lineHeight: 1.5 }}>
            nbadraft.net has not published grades for this prospect yet.
          </div>
        </div>
      </div>
    );
  }

  // ── Pre-compute ──────────────────────────────────────────────────────────
  const polyPts = pointsStr(grades);
  const { hi, lo, max, min } = peaks(grades);
  const overallAvg = avg(grades);

  // Build spoke endpoint coords for hit targets
  const spokePoints = grades.map((g, i) => ({
    ...polar(gradeToR(g), i),
    grade: g,
    attr: RADAR_ATTRS[i],
    label: RADAR_LABELS[i],
    i,
  }));

  // Label positions (slightly beyond MAX_R)
  const labelPoints = RADAR_LABELS.map((lbl, i) => ({
    ...polar(LABEL_R, i),
    lbl,
    attr: RADAR_ATTRS[i],
    grade: grades[i],
    i,
  }));

  const viewSize = CENTER * 2; // 260

  return (
    <div>
      {/* ── Header row ─────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        marginBottom: 12,
      }}>
        <div style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 12, letterSpacing: 2, color: GOLD,
        }}>
          SCOUTING GRADES
        </div>
        <div style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 10, color: MUTED,
        }}>
          SOURCE: NBADRAFT.NET
        </div>
      </div>

      {/* ── SVG radar ───────────────────────────────────────────────────── */}
      <div style={{
        background: 'radial-gradient(ellipse at center, #12121e 0%, #0a0a0f 100%)',
        border: `1px solid ${BORDER}`,
        borderRadius: 12,
        padding: '8px 4px 4px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Scanline texture overlay */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 12,
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.012) 2px, rgba(255,255,255,0.012) 4px)',
          pointerEvents: 'none',
        }} />

        {/* Corner brackets — Jarvis UI detail */}
        {[
          { top: 6, left: 6, borderTop: `1px solid ${GOLD}55`, borderLeft: `1px solid ${GOLD}55` },
          { top: 6, right: 6, borderTop: `1px solid ${GOLD}55`, borderRight: `1px solid ${GOLD}55` },
          { bottom: 6, left: 6, borderBottom: `1px solid ${GOLD}55`, borderLeft: `1px solid ${GOLD}55` },
          { bottom: 6, right: 6, borderBottom: `1px solid ${GOLD}55`, borderRight: `1px solid ${GOLD}55` },
        ].map((s, i) => (
          <div key={i} style={{ position: 'absolute', width: 12, height: 12, ...s }} />
        ))}

        <svg
          viewBox={`0 0 ${viewSize} ${viewSize}`}
          width="100%"
          style={{ display: 'block', maxWidth: 280, margin: '0 auto' }}
        >
          {/* ── Concentric rings ─────────────────────────────────────── */}
          {TICKS.map((t) => {
            const r = gradeToR(t);
            const pts = Array.from({ length: N }, (_, i) => {
              const { x, y } = polar(r, i);
              return `${x},${y}`;
            }).join(' ');
            const isEight = t === 8;
            return (
              <polygon
                key={t}
                points={pts}
                fill="none"
                stroke={isEight ? `${GOLD}30` : `${BORDER}88`}
                strokeWidth={isEight ? 0.8 : 0.5}
                strokeDasharray={t === 10 ? 'none' : '2,3'}
              />
            );
          })}

          {/* ── Spokes ───────────────────────────────────────────────── */}
          {Array.from({ length: N }, (_, i) => {
            const inner = polar(0, i);
            const outer = polar(MAX_R, i);
            return (
              <line
                key={i}
                x1={inner.x} y1={inner.y}
                x2={outer.x} y2={outer.y}
                stroke={`${BORDER}66`}
                strokeWidth={0.5}
              />
            );
          })}

          {/* ── Filled polygon (gold fill) ────────────────────────── */}
          <polygon
            points={polyPts}
            fill={`${GOLD}1a`}
            stroke={GOLD}
            strokeWidth={1.5}
            strokeLinejoin="round"
          />

          {/* ── Purple accent ring at the grade boundary ─────────── */}
          <polygon
            points={polyPts}
            fill="none"
            stroke={`${PURPLE}80`}
            strokeWidth={0.5}
            strokeLinejoin="round"
            strokeDasharray="3,4"
          />

          {/* ── Data point dots + hover hit targets ──────────────── */}
          {spokePoints.map(({ x, y, grade, attr, i }) => {
            const isHov = hovered === i;
            return (
              <g key={i}>
                {/* Invisible larger hit area */}
                <circle
                  cx={x} cy={y} r={10}
                  fill="transparent"
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  style={{ cursor: 'default' }}
                />
                {/* Visible dot */}
                <circle
                  cx={x} cy={y}
                  r={isHov ? 4 : 2.5}
                  fill={isHov ? '#fff' : GOLD}
                  stroke={isHov ? GOLD : '#0a0a0f'}
                  strokeWidth={1}
                  style={{ transition: 'r 0.12s, fill 0.12s' }}
                  pointerEvents="none"
                />
                {/* Pulsing ring on hover */}
                {isHov && (
                  <circle
                    cx={x} cy={y} r={7}
                    fill="none"
                    stroke={`${GOLD}55`}
                    strokeWidth={1}
                    pointerEvents="none"
                  />
                )}
              </g>
            );
          })}

          {/* ── Axis labels ──────────────────────────────────────── */}
          {labelPoints.map(({ x, y, lbl, attr, grade, i }) => {
            const isHov = hovered === i;
            // Determine text anchor by x position relative to center
            const dx = x - CENTER;
            const anchor = Math.abs(dx) < 8 ? 'middle' : dx > 0 ? 'start' : 'end';
            return (
              <text
                key={i}
                x={x} y={y}
                textAnchor={anchor}
                dominantBaseline="middle"
                fontFamily="'DM Mono', monospace"
                fontSize={isHov ? 8.5 : 7.5}
                fill={isHov ? GOLD : `${MUTED}cc`}
                fontWeight={isHov ? 600 : 400}
                style={{ transition: 'font-size 0.1s, fill 0.1s' }}
                pointerEvents="none"
              >
                {lbl}
              </text>
            );
          })}

          {/* ── Center score ─────────────────────────────────────── */}
          <text
            x={CENTER} y={CENTER - 7}
            textAnchor="middle"
            fontFamily="'Bebas Neue', sans-serif"
            fontSize={22}
            fill={GOLD}
            opacity={0.9}
          >
            {overallAvg}
          </text>
          <text
            x={CENTER} y={CENTER + 9}
            textAnchor="middle"
            fontFamily="'DM Mono', monospace"
            fontSize={6.5}
            fill={`${MUTED}99`}
            letterSpacing={1}
          >
            AVG / 10
          </text>
        </svg>

        {/* ── Hover tooltip (outside SVG for easier styling) ──────────── */}
        <div style={{
          height: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 16px 6px',
        }}>
          {hovered !== null ? (
            <div style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 11, color: TEXT,
              display: 'flex', gap: 8, alignItems: 'center',
            }}>
              <span style={{ color: MUTED }}>{RADAR_ATTRS[hovered]}</span>
              <span style={{ color: GOLD, fontWeight: 600 }}>{grades[hovered]} / 10</span>
            </div>
          ) : (
            <div style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 10, color: `${MUTED}55`,
            }}>
              hover to inspect
            </div>
          )}
        </div>
      </div>

      {/* ── Stat pills row ───────────────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 6,
        marginTop: 8,
      }}>
        {/* High */}
        <div style={{
          background: `${GOLD}12`,
          border: `1px solid ${GOLD}33`,
          borderRadius: 8,
          padding: '8px 10px',
        }}>
          <div style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 9, color: `${MUTED}99`, letterSpacing: 0.5, marginBottom: 3,
          }}>
            PEAK
          </div>
          <div style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 14, color: GOLD, letterSpacing: 0.5,
          }}>
            {hi}
          </div>
          <div style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 11, color: GOLD,
          }}>
            {max} / 10
          </div>
        </div>

        {/* Low */}
        <div style={{
          background: `${PURPLE}18`,
          border: `1px solid ${PURPLE}44`,
          borderRadius: 8,
          padding: '8px 10px',
        }}>
          <div style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 9, color: `${MUTED}99`, letterSpacing: 0.5, marginBottom: 3,
          }}>
            FLOOR
          </div>
          <div style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 14, color: `${MUTED}cc`, letterSpacing: 0.5,
          }}>
            {lo}
          </div>
          <div style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 11, color: MUTED,
          }}>
            {min} / 10
          </div>
        </div>

        {/* Grade grid — all 12 attrs in a compact form */}
        <div style={{
          background: CARD,
          border: `1px solid ${BORDER}`,
          borderRadius: 8,
          padding: '8px 10px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '3px 5px',
          alignContent: 'flex-start',
        }}>
          {RADAR_LABELS.map((lbl, i) => (
            <span
              key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 9,
                color: hovered === i ? GOLD : grades[i] >= 8 ? `${GOLD}cc` : `${MUTED}99`,
                cursor: 'default',
                transition: 'color 0.1s',
              }}
            >
              {lbl}·{grades[i]}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
