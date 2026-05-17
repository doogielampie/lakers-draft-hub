import { GOLD, CARD, BORDER, TEXT, MUTED } from '../theme';

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
];

export default function LakersAt25() {
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px' }}>
      <div style={{ width: 40, height: 3, background: GOLD, marginBottom: 16, borderRadius: 2 }} />
      <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 40, letterSpacing: 2, marginBottom: 6, color: TEXT }}>
        THE LAKERS AT #25
      </h2>
      <p style={{ color: MUTED, fontSize: 14, marginBottom: 28 }}>
        Context, needs, and what this pick realistically yields.
      </p>
      <div style={{ display: 'grid', gap: 1, background: BORDER, borderRadius: 12, overflow: 'hidden', border: `1px solid ${BORDER}` }}>
        {PANELS.map((item, i) => (
          <div key={i} style={{ background: CARD, padding: '24px 28px' }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 15, color: GOLD, letterSpacing: 1, marginBottom: 10 }}>
              {item.t}
            </div>
            <p style={{ color: MUTED, lineHeight: 1.8, fontSize: 13, margin: 0 }}>{item.b}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
