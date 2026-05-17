import { useEffect, useRef } from 'react';
import { PROFILES } from '../data/profiles';
import { PROSPECT_LOGO } from '../data/draftOrder';
import { LAL_TARGETS } from '../data/bigboard';
import Logo from './Logo';
import { GOLD, PURPLE, CARD, SURFACE, BORDER, TEXT, MUTED, DARK } from '../theme';

const fmt = (v, d = 1) => v == null ? '—' : Number(v).toFixed(d);
const fmtP = (v) => v == null ? '—' : (v * 100).toFixed(1) + '%';

function SectionLabel({ children }) {
  return (
    <div style={{
      fontFamily: "'Bebas Neue', sans-serif", fontSize: 12,
      color: GOLD, letterSpacing: 2, marginBottom: 8,
    }}>
      {children}
    </div>
  );
}

function StatGrid({ children }) {
  return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 6 }}>{children}</div>;
}

function StatTile({ label, val, highlight }) {
  return (
    <div style={{ background: SURFACE, borderRadius: 6, padding: '8px 6px', textAlign: 'center' }}>
      <div style={{
        fontFamily: "'DM Mono', monospace", fontSize: 14,
        color: highlight ? GOLD : TEXT, fontWeight: highlight ? 600 : 400,
      }}>{val}</div>
      <div style={{ fontSize: 9, color: MUTED, marginTop: 3, fontFamily: "'DM Mono', monospace" }}>{label}</div>
    </div>
  );
}

function AthBar({ label, val, unit, benchmark, lower, note }) {
  if (val == null) return null;
  const isGood = lower ? val <= benchmark : val >= benchmark;
  const pct = lower
    ? Math.min(100, Math.max(0, (12 - val) / 3 * 100))
    : Math.min(100, (val / 50) * 100);
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: MUTED, fontFamily: "'DM Mono', monospace" }}>
          {label}{note ? <span style={{ fontSize: 10, opacity: 0.6 }}> ({note})</span> : null}
        </span>
        <span style={{ fontSize: 13, fontWeight: 600, color: isGood ? GOLD : TEXT, fontFamily: "'DM Mono', monospace" }}>
          {val}{unit}
        </span>
      </div>
      <div style={{ background: BORDER, borderRadius: 4, height: 3 }}>
        <div style={{ height: '100%', background: isGood ? GOLD : PURPLE, borderRadius: 4, width: pct + '%' }} />
      </div>
      <div style={{ fontSize: 10, color: `${MUTED}77`, marginTop: 3 }}>
        Elite: {lower ? '< ' : '> '}{benchmark}{unit}
      </div>
    </div>
  );
}

export default function ProspectDrawer({ prospect, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!prospect) return null;

  const p = prospect;
  const isTarget = LAL_TARGETS.includes(p.n);
  const hasCombine = !!(p.ht || p.ws || p.mv || p.la);
  const prof = PROFILES[p.n];
  const logoKey = PROSPECT_LOGO[p.n];
  const level = (isTarget || prof?.marTake) ? 3 : hasCombine ? 2 : 1;

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', justifyContent: 'flex-end' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} />

      <div
        ref={ref}
        style={{
          position: 'relative', width: 480, height: '100%',
          background: CARD, borderLeft: `1px solid ${BORDER}`,
          display: 'flex', flexDirection: 'column', zIndex: 1, overflowY: 'auto',
          animation: 'slideIn 0.22s ease-out',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 14, right: 14,
            background: DARK, border: `1px solid ${BORDER}`,
            color: TEXT, borderRadius: 6, padding: '5px 11px',
            cursor: 'pointer', fontSize: 16, zIndex: 10, lineHeight: 1,
            boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
          }}
        >×</button>

        {/* Header */}
        <div style={{
          background: `linear-gradient(135deg, ${PURPLE}55 0%, ${CARD} 100%)`,
          padding: '28px 28px 20px', borderBottom: `1px solid ${BORDER}`, flexShrink: 0,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <Logo logoKey={logoKey} size={48} fallback={p.sch} />
              <div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: 1, lineHeight: 1, color: TEXT }}>{p.n}</div>
                <div style={{ color: MUTED, fontSize: 13, marginTop: 4 }}>{p.pos} · {p.sch} · {p.cls} · Age {p.age}</div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, color: GOLD, lineHeight: 1 }}>#{p.rd}</div>
              {isTarget && (
                <div style={{
                  background: GOLD, color: '#000', borderRadius: 4,
                  padding: '2px 8px', fontSize: 11, fontWeight: 700, marginTop: 4, display: 'inline-block',
                }}>LAL TARGET</div>
              )}
            </div>
          </div>
          {/* Data depth indicator */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
            {[1, 2, 3].map(l => (
              <div key={l} style={{ flex: 1, height: 3, borderRadius: 2, background: l <= level ? GOLD : BORDER }} />
            ))}
          </div>
          <div style={{ fontSize: 10, color: MUTED, fontFamily: "'DM Mono', monospace" }}>
            DATA DEPTH: {level === 1 ? 'STATS ONLY' : level === 2 ? 'STATS + COMBINE' : isTarget ? 'FULL SCOUTING PROFILE (LAKERS TARGET)' : "MIKE'S TAKE"}
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 28px', flex: 1 }}>
          {/* Level 1 — Stats */}
          <div style={{ marginBottom: 20 }}>
            <SectionLabel>PER GAME</SectionLabel>
            <StatGrid>
              {[['PPG', fmt(p.ppg)], ['RPG', fmt(p.rpg)], ['APG', fmt(p.apg)], ['BPG', fmt(p.bpg)], ['SPG', fmt(p.spg)]].map(([l, v]) => (
                <StatTile key={l} label={l} val={v} />
              ))}
            </StatGrid>
          </div>
          <div style={{ marginBottom: 20 }}>
            <SectionLabel>PER 36</SectionLabel>
            <StatGrid>
              {[['PTS', fmt(p.p36p)], ['REB', fmt(p.p36r)], ['AST', fmt(p.p36a)], ['BLK', fmt(p.p36b)], ['STL', fmt(p.p36s)]].map(([l, v]) => (
                <StatTile key={l} label={l} val={v} />
              ))}
            </StatGrid>
          </div>
          <div style={{ marginBottom: 20 }}>
            <SectionLabel>ADVANCED</SectionLabel>
            <StatGrid>
              {[['BPM', fmt(p.bpm)], ['OBPM', fmt(p.obpm)], ['DBPM', fmt(p.dbpm)], ['TS%', fmtP(p.ts)], ['USG', p.usg ? p.usg + '%' : '—']].map(([l, v]) => (
                <StatTile key={l} label={l} val={v} highlight={l === 'BPM' && p.bpm >= 10} />
              ))}
            </StatGrid>
          </div>

          {/* Level 2 — Combine */}
          {hasCombine && (
            <>
              <div style={{ height: 1, background: BORDER, margin: '16px 0' }} />
              <div style={{ marginBottom: 16 }}>
                <SectionLabel>PHYSICAL — NBA DRAFT COMBINE</SectionLabel>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8, marginBottom: 12 }}>
                  {[
                    ['HEIGHT (no shoes)', p.ht || p.htT || '—'],
                    ['WINGSPAN', p.ws || '—'],
                    ['STANDING REACH', p.sr || '—'],
                    ['WEIGHT', p.wc ? `${Math.round(p.wc)} lbs` : p.wtT ? `${p.wtT} lbs` : '—'],
                  ].map(([l, v]) => (
                    <div key={l} style={{ background: SURFACE, borderRadius: 6, padding: '10px 12px' }}>
                      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: TEXT, fontWeight: 600 }}>{v}</div>
                      <div style={{ fontSize: 10, color: MUTED, marginTop: 3 }}>{l}</div>
                    </div>
                  ))}
                </div>
              </div>
              {(p.mv || p.la || p.sp) && (
                <div style={{ marginBottom: 16 }}>
                  <SectionLabel>ATHLETICISM — NBA COMBINE</SectionLabel>
                  <AthBar label="Max Vert" val={p.mv} unit='"' benchmark={40} lower={false} />
                  <AthBar label="Lane Agility" val={p.la} unit="s" benchmark={10.5} lower={true} note="lower = faster" />
                  <AthBar label="3/4 Sprint" val={p.sp} unit="s" benchmark={3.10} lower={true} />
                </div>
              )}
            </>
          )}

          {/* Level 3 — Full scouting profile for LAL targets, or Mike's take for March prospects */}
          {prof && (
            <>
              <div style={{ height: 1, background: BORDER, margin: '16px 0' }} />

              {/* Full profile for LAL targets */}
              {isTarget && (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <SectionLabel>CONSENSUS RANGE</SectionLabel>
                    <div style={{
                      background: `${PURPLE}22`, border: `1px solid ${PURPLE}55`,
                      borderRadius: 6, padding: '10px 14px', fontSize: 13, color: TEXT,
                    }}>{prof.range}</div>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <SectionLabel>SHOOTING SPLITS</SectionLabel>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {[['3PT%', prof.splits?.threeP], ['FT%', prof.splits?.ft]].map(([l, v]) => (
                        <div key={l} style={{ flex: 1, background: SURFACE, borderRadius: 6, padding: '10px', textAlign: 'center' }}>
                          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 16, color: TEXT }}>{v || '—'}</div>
                          <div style={{ fontSize: 10, color: MUTED, marginTop: 3 }}>{l}</div>
                        </div>
                      ))}
                      <div style={{ flex: 1, background: SURFACE, borderRadius: 6, padding: '10px', textAlign: 'center' }}>
                        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: MUTED, fontStyle: 'italic' }}>{prof.comp}</div>
                        <div style={{ fontSize: 10, color: MUTED, marginTop: 3 }}>COMP</div>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                    <div>
                      <SectionLabel>STRENGTHS</SectionLabel>
                      {prof.strengths?.map((s, i) => (
                        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                          <span style={{ color: GOLD, flexShrink: 0, marginTop: 2 }}>+</span>
                          <span style={{ color: MUTED, fontSize: 12, lineHeight: 1.6 }}>{s}</span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <SectionLabel>CONCERNS</SectionLabel>
                      {prof.concerns?.map((c, i) => (
                        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                          <span style={{ color: '#ff6b6b', flexShrink: 0, marginTop: 2 }}>–</span>
                          <span style={{ color: MUTED, fontSize: 12, lineHeight: 1.6 }}>{c}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Take — shown for both LAL targets and March article prospects */}
              <div>
                <SectionLabel>{prof.credit ? "MIKE'S TAKE" : "THE TAKE"}</SectionLabel>
                <div style={{ borderLeft: `3px solid ${prof.credit ? GOLD : PURPLE}`, paddingLeft: 16, marginBottom: 8 }}>
                  <p style={{ color: TEXT, fontSize: 13, lineHeight: 1.85, margin: 0, fontStyle: 'italic' }}>{prof.take}</p>
                </div>
                {prof.credit && (
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: MUTED, marginTop: 8 }}>{prof.credit}</div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      `}</style>
    </div>
  );
}
