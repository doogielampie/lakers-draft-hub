import { Link } from 'react-router-dom';
import { GOLD, CARD, BORDER, TEXT, MUTED } from '../theme';
import { BB, LAL_TARGETS, LAL_WORKOUTS } from '../data/bigboard';
import { PROSPECT_LOGO } from '../data/draftOrder';
import Logo from '../components/Logo';
import useIsMobile from '../hooks/useIsMobile';

const BOARD_NAMES = new Set(BB.map(p => p.n));

const PANELS = [
  {
    t: 'Roster Context',
    b: "Luka Dončić anchors everything — 33.5 / 7.7 / 8.3, second scoring title, locked into a three-year $165M extension, hamstring injury ended his postseason. JJ Redick returns as head coach after a 53-win season and a 4-0 second-round sweep at OKC's hands. Austin Reaves (23.3 / 4.7 / 5.5, 36% from three) is the central offseason variable: expected to decline his player option, eligible for a five-year max, and Dončić has reportedly told the front office he wants him back. LeBron is an unrestricted free agent; retirement is a real possibility. The rookie-scale contract at #25 (~$3M Year 1) is meaningful in a second-apron environment.",
  },
  {
    t: 'What #25 Realistically Addresses',
    b: 'A mobile rim-running center (a Gafford/Lively archetype for the Dončić pick-and-roll), two-way wings with size and shooting, or a secondary ball-handler if Reaves departs. Multiple outlets have explicitly projected Henri Veesaar to the Lakers at #25 as a logical fit.',
  },
  {
    t: 'What #25 Typically Yields',
    b: 'Immanuel Quickley (#25, 2020) is the recent high-water mark — now a starter earning rotation-anchor money. Honest distribution: ~10% chance of a long-term starter arc, ~35% multi-year rotation player, ~30% fringe/specialist, ~25% bust. The pattern that wins: older prospects with one clearly translatable NBA skill on a defined role. Not raw upside swings on freshman projections.',
  },
  {
    t: "The Writer's Philosophy — BPA Over Fit",
    b: "'I'm focusing on the idea of drafting good basketball players, and not just for specific skill sets. I feel like that's what happens when guys like Reed Sheppard are drafted over Stephon Castle. Who is the better basketball player? Castle.' The post's prospect list skews toward switchable bigs not because of fit — but because good basketball players who happen to fit are the real target.",
  },
  {
    t: 'Buying Into the Second Round',
    b: "The new CBA's first- and second-apron limits make it harder to buy talent the way the Lakers once did with unlimited veteran-minimum deals. The workaround Garcia lays out: acquire second-round talent on minimums or two-way contracts — two-ways don't count against the cap — and treat the Coachella Valley Lakers as a development pipeline for rarer archetypes that used to be easy to find on the buyout market. The 2026 center class is deep enough to source that there, and the board lines up with Tony Bennett's philosophy and the fever-dream vision of Luka surrounded by lob threats and shooters. Second-round watch list: Baba Miller (the steal), Ugonna Onyenso, Izaiyah Nelson, Ernest Udeh Jr., and Trevon Brazile — full takes live on each player's Big Board profile.",
  },
];

export default function LakersAt25() {
  const isMobile = useIsMobile();
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(20px, 5vw, 48px) clamp(16px, 4vw, 24px)' }}>
      <div style={{ width: 40, height: 3, background: GOLD, marginBottom: 16, borderRadius: 2 }} />
      <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: isMobile ? 28 : 40, letterSpacing: 2, marginBottom: 6, color: TEXT }}>
        THE LAKERS AT #25
      </h2>
      <p style={{ color: MUTED, fontSize: 14, marginBottom: 28 }}>
        Context, needs, and what this pick realistically yields.
      </p>
      <div style={{ display: 'grid', gap: 1, background: BORDER, borderRadius: 12, overflow: 'hidden', border: `1px solid ${BORDER}` }}>
        {PANELS.map((item, i) => (
          <div key={i} style={{ background: CARD, padding: isMobile ? '20px 18px' : '24px 28px' }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 15, color: GOLD, letterSpacing: 1, marginBottom: 10 }}>
              {item.t}
            </div>
            <p style={{ color: MUTED, lineHeight: 1.8, fontSize: 13, margin: 0 }}>{item.b}</p>
          </div>
        ))}
      </div>

      {/* Pre-draft workout tracker */}
      <div style={{ marginTop: 32 }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: isMobile ? 22 : 28, letterSpacing: 1, color: TEXT, marginBottom: 6 }}>
          PRE-DRAFT WORKOUTS
        </div>
        <p style={{ color: MUTED, fontSize: 13, lineHeight: 1.7, margin: '0 0 16px' }}>
          Updated June 8, 2026.
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 8,
        }}>
          {LAL_WORKOUTS.map(w => {
            const onBoard = BOARD_NAMES.has(w.n);
            const isTarget = LAL_TARGETS.includes(w.n);
            const cardStyle = {
              display: 'flex', alignItems: 'center', gap: 9,
              background: CARD, border: `1px solid ${onBoard ? `${GOLD}66` : BORDER}`,
              borderLeft: `3px solid ${onBoard ? GOLD : BORDER}`,
              borderRadius: '0 6px 6px 0', padding: '9px 12px', minWidth: 0,
            };
            const inner = (
              <>
                <Logo logoKey={PROSPECT_LOGO[w.n]} size={22} fallback={w.sch} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{
                      color: onBoard ? GOLD : TEXT, fontSize: 13, fontWeight: onBoard ? 600 : 400,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>{w.n}</span>
                    {isTarget && (
                      <span style={{
                        background: GOLD, color: '#000', borderRadius: 3, padding: '0 4px',
                        fontSize: 8, fontWeight: 700, fontFamily: "'DM Mono', monospace", flexShrink: 0,
                      }}>TARGET</span>
                    )}
                  </div>
                  <div style={{ color: MUTED, fontSize: 11, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{w.sch}</div>
                </div>
              </>
            );
            // On-board prospects link to their Big Board profile (opens the drawer via ?p=).
            return onBoard ? (
              <Link
                key={w.n}
                to={`/big-board?p=${encodeURIComponent(w.n)}`}
                title={`View ${w.n}'s profile`}
                style={{ ...cardStyle, textDecoration: 'none', cursor: 'pointer' }}
              >{inner}</Link>
            ) : (
              <div key={w.n} style={cardStyle}>{inner}</div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
