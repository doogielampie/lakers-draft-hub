import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ReferenceArea, ResponsiveContainer } from 'recharts';
import { BB, LAL_TARGETS } from '../data/bigboard';
import { PROSPECT_LOGO } from '../data/draftOrder';
import Logo from '../components/Logo';
import { GOLD, PURPLE, CARD, BORDER, TEXT, MUTED, SURFACE } from '../theme';

const TIER1 = [
  { n: 'Cameron Boozer', pos: 'PF', sch: 'Duke', rank: 1, bpm: 18.7, note: "National Player of the Year. Elite skill, IQ, shooting touch. Some scouts question his athletic ceiling." },
  { n: 'Darryn Peterson', pos: 'SG/PG', sch: 'Kansas', rank: 2, bpm: 14.1, note: "Most gifted on-ball creator in the class. Concerns about durability and inconsistency temper what is otherwise a No. 1 candidacy." },
  { n: 'AJ Dybantsa', pos: 'SF', sch: 'BYU', rank: 3, bpm: 11.7, note: "ESPN's No. 1 overall. The 'safest' option: fewest holes, elite tools, plus shooting and decision-making growth." },
  { n: 'Caleb Wilson', pos: 'SF/PF', sch: 'North Carolina', rank: 4, bpm: 14.0, note: "Cleanest 'modern forward' archetype. Plus length (6'10.5\"), defensive instincts, emerging two-way profile." },
];

const TIER2 = [
  { n: 'Keaton Wagler', pos: 'SG/PG', sch: 'Illinois', rank: 5, bpm: 12.3, note: 'Most NBA-ready second-tier guard. Size, scoring efficiency, feel at 6\'6".' },
  { n: 'Darius Acuff Jr.', pos: 'PG', sch: 'Arkansas', rank: 6, bpm: 10.1, note: 'SEC Player of the Year. Elite shot creator. Defensive questions linger.' },
  { n: 'Kingston Flemings', pos: 'PG', sch: 'Houston', rank: 7, bpm: 12.6, note: 'Considered a better two-way fit than Acuff. Strong defensive metrics.' },
];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{ background: '#1a1a26', border: `1px solid ${d.isTarget ? GOLD : '#2a2a3a'}`, borderRadius: 6, padding: '8px 12px', fontSize: 12 }}>
      <div style={{ fontWeight: 600, color: d.isTarget ? GOLD : '#f0f0f0' }}>{d.name}</div>
      <div style={{ color: '#8a8a9a' }}>Rank #{d.x} · BPM {d.y?.toFixed(1)}</div>
      {d.isTarget && <div style={{ color: GOLD, fontSize: 10, marginTop: 2 }}>★ Lakers Target</div>}
    </div>
  );
};

const CustomDot = ({ cx, cy, payload }) => {
  if (!cx || !cy) return null;
  const t = payload.isTarget;
  return <circle cx={cx} cy={cy} r={t ? 6 : 3} fill={t ? GOLD : '#8a8a9a55'} stroke={t ? '#000' : 'none'} strokeWidth={t ? 0.5 : 0} />;
};

const scatterData = BB
  .filter(p => p.rank != null && p.bpm != null)
  .map(p => ({ x: p.rank, y: p.bpm, name: p.n, isTarget: LAL_TARGETS.includes(p.n) }));

export default function ClassOverview() {
  return (
    <div style={{ background: SURFACE, minHeight: '100vh' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ width: 40, height: 3, background: GOLD, marginBottom: 16, borderRadius: 2 }} />
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 40, letterSpacing: 2, marginBottom: 6, color: TEXT }}>
          2026 DRAFT CLASS
        </h2>
        <p style={{ color: MUTED, fontSize: 14, marginBottom: 32 }}>
          One of the strongest classes in recent memory, with a structural wrinkle that matters for the Lakers.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginBottom: 36 }}>
          <div>
            <p style={{ color: TEXT, lineHeight: 1.85, fontSize: 14, margin: '0 0 16px' }}>
              The 2026 class is being characterized as one of the strongest in recent memory. ESPN's Bobby Marks called it{' '}
              <span style={{ color: GOLD, fontStyle: 'italic' }}>"the deepest pool of talent entering the NBA since 1996."</span>{' '}
              The consensus: a generationally talented top 4, a defined second tier of guards, and legitimate first-round grades extending to roughly 35–40 names.
            </p>
            <p style={{ color: TEXT, lineHeight: 1.85, fontSize: 14, margin: 0 }}>
              <strong style={{ color: GOLD }}>NIL has reshaped the late first round.</strong>{' '}
              Multiple projected first-rounders — Haugh, Ngongba II, Mullins, Krivas, Condon — returned to school because their NIL earnings exceeded what a late-first contract could offer. This compressed the pool around available bigs and shifted some borderline names upward. The Lakers' scouting window (#15–40) is where this effect is most visible.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { t: 'Guard-Heavy at the Top', b: 'After the top 4, the class is fronted by high-end freshman/sophomore guards. Tier 2 is almost entirely guards.' },
              { t: "Frontcourt in Lakers' Range", b: 'Centers and skill bigs cluster in #15–40 — exactly where the Lakers pick. High value, right slot.' },
              { t: 'NIL Compressed the Pool', b: 'Several projected late-first bigs returned to school. The class you see is not the class that declared.' },
            ].map(item => (
              <div key={item.t} style={{ background: '#1a1a26', border: `1px solid #2a2a3a`, borderLeft: `3px solid ${GOLD}`, borderRadius: '0 8px 8px 0', padding: '14px 16px' }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 13, color: GOLD, letterSpacing: 1, marginBottom: 4 }}>{item.t}</div>
                <div style={{ color: MUTED, fontSize: 12, lineHeight: 1.6 }}>{item.b}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tier 1 */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: TEXT, letterSpacing: 1, marginBottom: 14 }}>TIER 1 — CONSENSUS TOP 4</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 24 }}>
            {TIER1.map(p => (
              <div key={p.n} style={{ background: CARD, border: `1px solid ${PURPLE}55`, borderRadius: 10, padding: '16px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <Logo logoKey={PROSPECT_LOGO[p.n]} size={24} fallback={p.sch} />
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: GOLD }}>#{p.rank}</span>
                </div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 17, color: TEXT, marginBottom: 2 }}>{p.n}</div>
                <div style={{ fontSize: 11, color: MUTED, marginBottom: 10 }}>{p.pos} · {p.sch}</div>
                <span style={{ background: `${GOLD}22`, color: GOLD, borderRadius: 4, padding: '2px 7px', fontSize: 11, fontFamily: "'DM Mono', monospace" }}>
                  BPM {p.bpm}
                </span>
                <p style={{ fontSize: 11, color: MUTED, lineHeight: 1.6, marginTop: 10, marginBottom: 0 }}>{p.note}</p>
              </div>
            ))}
          </div>

          {/* Tier 2 */}
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: TEXT, letterSpacing: 1, marginBottom: 14 }}>TIER 2 — SECOND-TIER GUARDS</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 24 }}>
            {TIER2.map(p => (
              <div key={p.n} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: '16px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <Logo logoKey={PROSPECT_LOGO[p.n]} size={24} fallback={p.sch} />
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: GOLD }}>#{p.rank}</span>
                </div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 17, color: TEXT, marginBottom: 2 }}>{p.n}</div>
                <div style={{ fontSize: 11, color: MUTED, marginBottom: 10 }}>{p.pos} · {p.sch}</div>
                <span style={{ background: `${GOLD}22`, color: GOLD, borderRadius: 4, padding: '2px 7px', fontSize: 11, fontFamily: "'DM Mono', monospace" }}>
                  BPM {p.bpm}
                </span>
                <p style={{ fontSize: 11, color: MUTED, lineHeight: 1.6, marginTop: 10, marginBottom: 0 }}>{p.note}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scatter */}
        <div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, color: TEXT, letterSpacing: 1, marginBottom: 4 }}>
            LAKERS SCOUTING WINDOW — BPM BY RANK
          </div>
          <div style={{ color: MUTED, fontSize: 11, marginBottom: 16 }}>
            All ranked prospects · Gold = Lakers targets · Shaded band = #15–40 window
          </div>
          <div style={{ height: 300, background: CARD, borderRadius: 12, padding: '16px 8px 12px', border: `1px solid ${BORDER}` }}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 8, right: 24, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" opacity={0.5} />
                <XAxis dataKey="x" type="number" domain={[1, 75]} tick={{ fill: '#8a8a9a', fontSize: 10, fontFamily: 'DM Mono' }}
                  label={{ value: 'Rank', position: 'insideBottom', offset: -10, fill: '#8a8a9a', fontSize: 11 }} />
                <YAxis dataKey="y" type="number" domain={[-2, 20]} tick={{ fill: '#8a8a9a', fontSize: 10, fontFamily: 'DM Mono' }}
                  label={{ value: 'BPM', angle: -90, position: 'insideLeft', fill: '#8a8a9a', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceArea x1={15} x2={40} fill={GOLD} fillOpacity={0.06} stroke={GOLD} strokeOpacity={0.25}
                  label={{ value: "Lakers Window #15–40", fill: GOLD, fontSize: 10, position: 'insideTop', offset: 8 }} />
                <ReferenceLine x={25} stroke={GOLD} strokeDasharray="4 4" strokeOpacity={0.7} />
                <Scatter data={scatterData} shape={<CustomDot />} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
