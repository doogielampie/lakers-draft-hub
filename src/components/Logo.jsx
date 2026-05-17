import { useState } from 'react';
import { BORDER, MUTED } from '../theme';

// Maps the logo keys used in data files to actual public paths
// e.g. 'nba-la-lakers' -> '/logos/nba/la-lakers.svg'
// e.g. 'ncaa-iowa-state' -> '/logos/ncaa/iowa-state.svg'
function logoPath(key) {
  if (!key) return null;
  const base = import.meta.env.BASE_URL;
  const [league, ...rest] = key.split('-');
  if (league === 'nba') {
    return `${base}logos/nba/${rest.join('-')}.svg`;
  }
  if (league === 'ncaa') {
    const name = rest.join('-');
    const fixes = {
      'st-john-s': 'st.-johns',
      'texas-a-m': 'texas-a&m',
    };
    return `${base}logos/ncaa/${fixes[name] || name}.svg`;
  }
  return null;
}

export default function Logo({ logoKey, size = 28, fallback = '' }) {
  const [err, setErr] = useState(false);
  const src = logoPath(logoKey);

  if (!src || err) {
    return (
      <div style={{
        width: size, height: size, borderRadius: 4,
        background: BORDER, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: size * 0.35,
        color: MUTED, fontFamily: "'DM Mono', monospace", flexShrink: 0,
      }}>
        {fallback.slice(0, 3).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={src}
      width={size}
      height={size}
      style={{ objectFit: 'contain', flexShrink: 0 }}
      onError={() => setErr(true)}
      alt={fallback}
    />
  );
}
