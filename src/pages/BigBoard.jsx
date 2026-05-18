import { useState, useMemo } from 'react';
import { BB, LAL_TARGETS } from '../data/bigboard';
import { PROSPECT_LOGO } from '../data/draftOrder';
import Logo from '../components/Logo';
import ProspectDrawer from '../components/ProspectDrawer';
import { GOLD, PURPLE, CARD, BORDER, TEXT, MUTED, SURFACE, DARK } from '../theme';

const fmt = (v, d = 1) => v == null ? '—' : Number(v).toFixed(d);
const fmtP = (v) => v == null ? '—' : (v * 100).toFixed(1) + '%';

const POSITIONS = ['All', 'PG', 'SG', 'SF', 'PF', 'C'];
const CLASSES = ['All', 'Freshman', 'Sophomore', 'Junior', 'Senior', 'International'];

const COLS = [
  { col: 'rank', label: 'RANK' },
  { col: 'n', label: 'NAME' },
  { col: 'combine', label: 'COMBINE', title: 'NBA Combine participant' },
  { col: 'pos', label: 'POS' },
  { col: 'sch', label: 'SCHOOL' },
  { col: 'cls', label: 'CLASS' },
  { col: 'age', label: 'AGE' },
  { col: 'htT', label: 'HEIGHT' },
  { col: 'wtT', label: 'WEIGHT' },
];

export default function BigBoard() {
  const [drawer, setDrawer] = useState(null);
  const [posFilter, setPosFilter] = useState('All');
  const [clsFilter, setClsFilter] = useState('All');
  const [sortCol, setSortCol] = useState('rank');
  const [sortDir, setSortDir] = useState('asc');

  const filtered = useMemo(() => {
    let data = [...BB];
    if (posFilter !== 'All') data = data.filter(p => p.pos?.split('/')[0] === posFilter);
    if (clsFilter !== 'All') data = data.filter(p => p.cls === clsFilter);
    data.sort((a, b) => {
      let av = a[sortCol], bv = b[sortCol];
      if (sortCol === 'rank') { av = a.rank ?? 9999; bv = b.rank ?? 9999; }
      if (av == null) return 1;
      if (bv == null) return -1;
      return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
    return data;
  }, [posFilter, clsFilter, sortCol, sortDir]);

  const handleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir(col === 'rank' ? 'asc' : 'desc'); }
  };

  const SortIcon = ({ col }) => {
    if (sortCol !== col) return <span style={{ marginLeft: 3, opacity: 0.4 }}>↕</span>;
    return <span style={{ marginLeft: 3, color: GOLD }}>{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div style={{ background: SURFACE, minHeight: '100vh' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ width: 40, height: 3, background: GOLD, marginBottom: 16, borderRadius: 2 }} />
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 40, letterSpacing: 2, marginBottom: 6, color: TEXT }}>
          INTERACTIVE BIG BOARD
        </h2>
        <p style={{ color: MUTED, fontSize: 14, marginBottom: 8 }}>
          Click any prospect to open their profile. Gold rows = Lakers targets. Shaded = #15–40 scouting window.
        </p>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: MUTED, fontFamily: "'DM Mono', monospace" }}>POS:</span>
            {POSITIONS.map(p => (
              <button key={p} onClick={() => setPosFilter(p)} style={{
                background: posFilter === p ? GOLD : '#1a1a26', color: posFilter === p ? '#000' : MUTED,
                border: `1px solid ${posFilter === p ? GOLD : '#2a2a3a'}`,
                borderRadius: 4, padding: '4px 9px', fontSize: 11, cursor: 'pointer',
                fontFamily: "'DM Mono', monospace",
              }}>{p}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: MUTED, fontFamily: "'DM Mono', monospace" }}>CLASS:</span>
            {CLASSES.map(c => (
              <button key={c} onClick={() => setClsFilter(c)} style={{
                background: clsFilter === c ? GOLD : '#1a1a26', color: clsFilter === c ? '#000' : MUTED,
                border: `1px solid ${clsFilter === c ? GOLD : '#2a2a3a'}`,
                borderRadius: 4, padding: '4px 9px', fontSize: 11, cursor: 'pointer',
                fontFamily: "'DM Mono', monospace",
              }}>{c === 'International' ? 'Intl' : c}</button>
            ))}
          </div>
          <div style={{ marginLeft: 'auto', fontSize: 11, color: MUTED, fontFamily: "'DM Mono', monospace" }}>
            {filtered.length} prospects
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto', borderRadius: 10, border: `1px solid ${BORDER}` }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead style={{ background: DARK }}>
              <tr>
                {COLS.map(({ col, label, title }) => (
                  <th key={col} onClick={() => col !== 'combine' && handleSort(col)} title={title} style={{
                    padding: '10px 14px', textAlign: 'left', fontSize: 10,
                    fontFamily: "'DM Mono', monospace", color: sortCol === col ? GOLD : MUTED,
                    cursor: col !== 'combine' ? 'pointer' : 'default', whiteSpace: 'nowrap', userSelect: 'none',
                    borderBottom: `1px solid ${BORDER}`,
                  }}>
                    {label}{col !== 'combine' && <SortIcon col={col} />}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => {
                const isTarget = LAL_TARGETS.includes(p.n);
                const hasCombine = !!(p.ht || p.ws || p.mv || p.la);
                const inWindow = p.rank != null && p.rank >= 15 && p.rank <= 40;
                const rowBg = isTarget ? `${GOLD}14` : inWindow ? `${GOLD}07` : i % 2 === 0 ? CARD : `${CARD}cc`;
                const logoKey = PROSPECT_LOGO[p.n];
                return (
                  <tr
                    key={p.n + i}
                    onClick={() => setDrawer(p)}
                    style={{
                      background: rowBg,
                      borderLeft: isTarget ? `3px solid ${GOLD}` : inWindow ? `3px solid ${GOLD}33` : '3px solid transparent',
                      cursor: 'pointer', transition: 'background 0.12s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = isTarget ? `${GOLD}22` : `${GOLD}0a`}
                    onMouseLeave={e => e.currentTarget.style.background = rowBg}
                  >
                    <td style={{ padding: '9px 14px', fontFamily: "'DM Mono', monospace", fontSize: 12, color: p.rank ? TEXT : MUTED }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        {inWindow && !isTarget && <span style={{ width: 5, height: 5, borderRadius: '50%', background: `${GOLD}55`, display: 'inline-block' }} />}
                        {p.rd}
                      </div>
                    </td>
                    <td style={{ padding: '9px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Logo logoKey={logoKey} size={22} fallback={p.sch} />
                        {isTarget && (
                          <span style={{
                            background: GOLD, color: '#000', borderRadius: 3,
                            padding: '1px 5px', fontSize: 9, fontWeight: 700,
                            fontFamily: "'DM Mono', monospace", flexShrink: 0,
                          }}>LAL</span>
                        )}
                        <span style={{ color: isTarget ? GOLD : TEXT, fontWeight: isTarget ? 600 : 400 }}>{p.n}</span>
                      </div>
                    </td>
                    <td style={{ padding: '9px 14px' }}>
                      {hasCombine ? (
                        <span title="NBA Combine participant" style={{
                          display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
                          background: '#60a5fa',
                        }} />
                      ) : (
                        <span style={{
                          display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
                          background: BORDER,
                        }} />
                      )}
                    </td>
                    <td style={{ padding: '9px 14px', color: MUTED, fontSize: 12 }}>{p.pos}</td>
                    <td style={{ padding: '9px 14px', color: MUTED, fontSize: 12, whiteSpace: 'nowrap' }}>{p.sch}</td>
                    <td style={{ padding: '9px 14px', color: MUTED, fontSize: 12 }}>{p.cls}</td>
                    <td style={{ padding: '9px 14px', fontFamily: "'DM Mono', monospace", fontSize: 12, color: MUTED }}>{fmt(p.age, 1)}</td>
                    <td style={{ padding: '9px 14px', fontFamily: "'DM Mono', monospace", fontSize: 12, color: MUTED }}>
                      {p.ht || p.htT || '—'}
                    </td>
                    <td style={{ padding: '9px 14px', fontFamily: "'DM Mono', monospace", fontSize: 12, color: MUTED }}>
                      {p.wc ? `${Math.round(p.wc)} lbs` : p.wtT ? `${p.wtT} lbs` : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
          {[
            { c: GOLD, l: 'LAL target — click for full scouting profile' },
            { c: `${GOLD}44`, l: '#15–40 Lakers scouting window' },
            { c: '#60a5fa', l: 'NBA Combine participant', dot: true },
            { c: BORDER, l: 'No combine data', dot: true },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: MUTED }}>
              <span style={{
                width: item.dot ? 8 : 10, height: item.dot ? 8 : 10,
                background: item.c, borderRadius: item.dot ? '50%' : 2,
                display: 'inline-block', flexShrink: 0,
              }} />
              {item.l}
            </div>
          ))}
        </div>
      </div>

      {/* Prospect Drawer */}
      {drawer && <ProspectDrawer prospect={drawer} onClose={() => setDrawer(null)} />}
    </div>
  );
}
