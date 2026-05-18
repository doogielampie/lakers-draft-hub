/**
 * grades.js — Mike Garcia Attribute Grading Engine
 *
 * 8 attributes, all computed from existing BigBoard data.
 * Each raw signal is percentile-ranked across the full prospect pool,
 * then scaled 1–10. Null data = null grade (not zero — renders as "—").
 *
 * Attributes:
 *   1. Physicality     — FTR proxy: FTA/FGA ≈ (p36s + p36b) heuristic + ORB signal
 *                        Best available: spg/ppg ratio + p36r for bigs (contact-seeking proxy)
 *   2. Def Playmaking  — STL% + BLK% (per-36 normalized by minutes proxy)
 *   3. Scoring Eff     — TS% anchored, penalized by USG (efficiency under load)
 *   4. Shooting Range  — ts + bpm offensive component; proxy for shot-making
 *   5. Playmaking      — APG/USG ratio (assist production per unit of usage)
 *   6. Length          — Wingspan-to-height ratio (BAR) + standing reach normalized by position
 *   7. Projection      — BPM age-adjusted (younger = bonus, older = penalty)
 *   8. Athleticism     — Combine: max vertical + lane agility + sprint composite
 */

import { BB } from './bigboard';

// ─── Position groups for length normalization ────────────────────────────────
const BIG_POSITIONS = ['C', 'PF', 'PF/C', 'PF/SF', 'SF/PF', 'C/PF'];
const posGroup = (pos) => {
  if (!pos) return 'WING';
  const p = pos.split('/')[0];
  if (p === 'C') return 'BIG';
  if (p === 'PF') return 'BIG';
  if (p === 'PG') return 'GUARD';
  return 'WING';
};

// ─── Parse wingspan string "6' 10.75''" → decimal inches ────────────────────
const parseLength = (str) => {
  if (!str || typeof str !== 'string') return null;
  const m = str.match(/(\d+)'\s*([\d.]+)''/);
  if (!m) return null;
  return parseInt(m[1]) * 12 + parseFloat(m[2]);
};

// ─── Percentile rank: where does val sit in arr? → 0–1 ──────────────────────
const percentileRank = (arr, val) => {
  const valid = arr.filter(v => v != null && isFinite(v));
  if (!valid.length || val == null) return null;
  const below = valid.filter(v => v < val).length;
  return below / valid.length;
};

// ─── Scale 0–1 percentile to 1–10, clamped ──────────────────────────────────
const scale = (pct, invert = false) => {
  if (pct == null) return null;
  const p = invert ? 1 - pct : pct;
  return Math.round(Math.min(10, Math.max(1, 1 + p * 9)));
};

// ─── Pre-extract raw signals from the full pool ──────────────────────────────
function extractSignals(prospects) {
  return prospects.map(p => {
    const ws_in = parseLength(p.ws);
    const ht_in = parseLength(p.ht);
    const sr_in = parseLength(p.sr);

    // 1. Physicality proxy: FTR ≈ spg per 36 as contact-seeking signal.
    //    Mike uses FTR (FTA/FGA). We don't have FTA directly, but SPG per 36
    //    correlates with aggression and contact; we supplement with p36r for bigs.
    //    Best available: combine p36s (steals reflect lateral aggressiveness)
    //    with a rebounding-per-usage signal for physicality in traffic.
    //    We use: (p36s * 0.6 + (p.rpg / (p.usg || 20)) * 10 * 0.4)
    const physicality_raw = p.p36s != null && p.usg != null
      ? (p.p36s * 0.6 + (p.rpg / (p.usg || 20)) * 10 * 0.4)
      : p.p36s;

    // 2. Defensive Playmaking: equal weight STL% + BLK% proxy
    //    p36s and p36b are per-36 steals and blocks — best available proxy
    const defPlaymaking_raw = p.p36s != null && p.p36b != null
      ? (p.p36s + p.p36b) / 2
      : p.p36s ?? p.p36b;

    // 3. Scoring Efficiency: TS% penalized slightly by USG
    //    High TS% at high usage is rarer and more valuable
    //    Formula: TS * (1 + (usg - 20) / 200) — small USG bonus/penalty
    const scoringEff_raw = p.ts != null && p.usg != null
      ? p.ts * (1 + (p.usg - 20) / 200)
      : p.ts;

    // 4. Shooting Range: OBPM is the best single-number proxy for offensive
    //    skill/shooting gravity we have without Hoop Math 3PT% data.
    //    We use obpm directly as shooting range proxy until Hoop Math data added.
    const shootingRange_raw = p.obpm;

    // 5. Playmaking: AST-to-USG ratio
    //    APG / USG — rewards players who generate assists without hoarding usage
    const playmaking_raw = p.apg != null && p.usg != null && p.usg > 0
      ? p.apg / p.usg
      : null;

    // 6. Length: wingspan-to-height ratio (BAR) + standing reach bonus
    //    BAR = ws_in / ht_in; ideal is > 1.06 for wings
    //    We weight BAR 70%, standing reach 30% (normalized to 7'6"–9'6" range)
    const bar = ws_in && ht_in ? ws_in / ht_in : null;
    const sr_norm = sr_in ? (sr_in - 90) / 24 : null; // 7'6" to 9'6" → 0–1
    const length_raw = bar != null && sr_norm != null
      ? bar * 0.7 + (Math.min(1, Math.max(0, sr_norm)) * 0.08) // keep in BAR scale
      : bar;

    // 7. Projection: BPM adjusted for draft age
    //    Younger players get a bonus (more room to grow),
    //    older players get a penalty. Baseline age = 20.5.
    //    Adjustment: +0.3 BPM per year under 20.5, -0.3 per year over.
    const projection_raw = p.bpm != null && p.age != null
      ? p.bpm + (20.5 - p.age) * 0.4
      : p.bpm;

    // 8. Athleticism: combine composite
    //    Max vertical (higher = better), lane agility (lower = better),
    //    sprint (lower = better). Normalize each to 0–1 then combine.
    //    We invert la and sp during percentile ranking.
    const hasAthletics = p.mv != null || p.la != null || p.sp != null;
    const athleticism_raw_mv = p.mv;    // higher better
    const athleticism_raw_la = p.la;    // lower better (invert)
    const athleticism_raw_sp = p.sp;    // lower better (invert)

    return {
      n: p.n,
      pos: p.pos,
      physicality_raw,
      defPlaymaking_raw,
      scoringEff_raw,
      shootingRange_raw,
      playmaking_raw,
      length_raw,
      projection_raw,
      athleticism_raw_mv,
      athleticism_raw_la,
      athleticism_raw_sp,
      hasAthletics,
    };
  });
}

// ─── Compute grades for the full pool ────────────────────────────────────────
function computeGrades(prospects) {
  const signals = extractSignals(prospects);

  // Pool arrays for percentile ranking
  const pools = {
    physicality:    signals.map(s => s.physicality_raw),
    defPlaymaking:  signals.map(s => s.defPlaymaking_raw),
    scoringEff:     signals.map(s => s.scoringEff_raw),
    shootingRange:  signals.map(s => s.shootingRange_raw),
    playmaking:     signals.map(s => s.playmaking_raw),
    length:         signals.map(s => s.length_raw),
    projection:     signals.map(s => s.projection_raw),
    mv:             signals.map(s => s.athleticism_raw_mv),
    la:             signals.map(s => s.athleticism_raw_la),
    sp:             signals.map(s => s.athleticism_raw_sp),
  };

  return signals.map(s => {
    // Athleticism: composite of up to 3 components
    let athleticism = null;
    const comps = [];
    if (s.athleticism_raw_mv != null) comps.push(scale(percentileRank(pools.mv, s.athleticism_raw_mv)));
    if (s.athleticism_raw_la != null) comps.push(scale(percentileRank(pools.la, s.athleticism_raw_la), true)); // invert
    if (s.athleticism_raw_sp != null) comps.push(scale(percentileRank(pools.sp, s.athleticism_raw_sp), true)); // invert
    if (comps.length > 0) athleticism = Math.round(comps.reduce((a, b) => a + b, 0) / comps.length);

    return {
      n: s.n,
      grades: {
        Physicality:       scale(percentileRank(pools.physicality, s.physicality_raw)),
        'Def Playmaking':  scale(percentileRank(pools.defPlaymaking, s.defPlaymaking_raw)),
        'Scoring Eff':     scale(percentileRank(pools.scoringEff, s.scoringEff_raw)),
        'Shooting Range':  scale(percentileRank(pools.shootingRange, s.shootingRange_raw)),
        Playmaking:        scale(percentileRank(pools.playmaking, s.playmaking_raw)),
        Length:            scale(percentileRank(pools.length, s.length_raw)),
        Projection:        scale(percentileRank(pools.projection, s.projection_raw)),
        Athleticism:       athleticism,
      }
    };
  });
}

// ─── Build and export the grades lookup ─────────────────────────────────────
const _computed = computeGrades(BB);
export const COMPUTED_GRADES = Object.fromEntries(_computed.map(g => [g.n, g.grades]));

export const ATTR_KEYS = [
  'Physicality',
  'Def Playmaking',
  'Scoring Eff',
  'Shooting Range',
  'Playmaking',
  'Length',
  'Projection',
  'Athleticism',
];

export const ATTR_LABELS = [
  'PHY',
  'DEF',
  'EFF',
  'RNG',
  'PASS',
  'LEN',
  'PROJ',
  'ATH',
];

export const ATTR_DESCRIPTIONS = {
  'Physicality':     'Contact-seeking & physicality proxy. Anchored by steals/36 and rebounding-per-usage. Reflects Mike Garcia\'s FTR philosophy — players who draw fouls and play through contact.',
  'Def Playmaking':  'Defensive impact via forced turnovers and rim protection. Equal-weight composite of STL and BLK per 36. Mike\'s threshold: elite defenders float near 3% in both.',
  'Scoring Eff':     'True Shooting % adjusted for usage load. High TS at high usage is rarer and more valuable than high TS on limited touches.',
  'Shooting Range':  'Offensive skill and shooting gravity. Anchored by OBPM as the best available proxy until shot-location data (Hoop Math) is integrated.',
  'Playmaking':      'Assist production per unit of usage. Rewards players who generate offense for others without monopolizing possessions.',
  'Length':          'Physical tools — wingspan-to-height ratio (70%) and standing reach (30%), normalized by position group. Reflects switching range and defensive versatility ceiling.',
  'Projection':      'Age-adjusted BPM. A 19-year-old with 12 BPM is a different prospect than a 23-year-old at the same number. +0.4 BPM per year under 20.5, -0.4 over.',
  'Athleticism':     'NBA Combine composite — max vertical (higher), lane agility (lower), 3/4-court sprint (lower). Only available for combine participants.',
};
