import { useState, useMemo } from 'react';
import { PLANETS, MOON_COUNT_AS_OF, type PlanetData } from '../utils/planetData';

const MONO = "'JetBrains Mono', ui-monospace, monospace";
const AMBER = '#f59e0b';

type SortKey = keyof Pick<PlanetData,
  'name' | 'diameterKm' | 'massEarth' | 'densityGcm3' | 'gravityEarth' | 'rotationHours' | 'orbitalDays' | 'orbitalSpeedKms' | 'moons'>;

interface Column {
  key: SortKey;
  label: string;
  align: 'left' | 'right';
  format: (p: PlanetData) => string;
  // extra column rendered alongside (rotation direction note)
}

const fmt = (n: number, d = 0) => n.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });

const COLUMNS: Column[] = [
  { key: 'name', label: 'Body', align: 'left', format: (p) => p.name },
  { key: 'diameterKm', label: 'Diameter (km)', align: 'right', format: (p) => fmt(p.diameterKm) },
  { key: 'massEarth', label: 'Mass (M⊕)', align: 'right', format: (p) => p.massEarth >= 100 ? fmt(p.massEarth) : fmt(p.massEarth, 3) },
  { key: 'densityGcm3', label: 'Density (g/cm³)', align: 'right', format: (p) => fmt(p.densityGcm3, 2) },
  { key: 'gravityEarth', label: 'Gravity (g⊕)', align: 'right', format: (p) => fmt(p.gravityEarth, 2) },
  { key: 'rotationHours', label: 'Rotation', align: 'right', format: (p) => p.rotationHours >= 48 ? `${fmt(p.rotationHours / 24, 1)} d` : `${fmt(p.rotationHours, 1)} h` },
  { key: 'orbitalDays', label: 'Orbit', align: 'right', format: (p) => p.orbitalDays === 0 ? '—' : p.orbitalDays >= 365 ? `${fmt(p.orbitalDays / 365.25, 1)} yr` : `${fmt(p.orbitalDays, 1)} d` },
  { key: 'orbitalSpeedKms', label: 'Speed (km/s)', align: 'right', format: (p) => p.orbitalSpeedKms === 0 ? '—' : fmt(p.orbitalSpeedKms, 1) },
  { key: 'moons', label: 'Moons', align: 'right', format: (p) => fmt(p.moons) },
];

interface Props {
  selectedName?: string | null;
  onSelectPlanet?: (planet: PlanetData | null) => void;
}

export default function PlanetTable({ selectedName, onSelectPlanet }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('diameterKm');
  const [asc, setAsc] = useState(false);

  const sorted = useMemo(() => {
    const arr = [...PLANETS];
    arr.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === 'string' && typeof bv === 'string') {
        return asc ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return asc ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
    return arr;
  }, [sortKey, asc]);

  function toggleSort(key: SortKey) {
    if (key === sortKey) setAsc((a) => !a);
    else { setSortKey(key); setAsc(false); }
  }

  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontFamily: MONO, fontSize: 11, color: 'var(--muted-foreground)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Planetary Physical Data
        </span>
        <span style={{ fontFamily: MONO, fontSize: 9.5, color: 'var(--muted-foreground)' }}>
          NASA fact sheet · moons as of {MOON_COUNT_AS_OF}
        </span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: MONO, fontSize: 12 }}>
          <thead>
            <tr>
              {COLUMNS.map((c) => (
                <th
                  key={c.key}
                  onClick={() => toggleSort(c.key)}
                  style={{
                    textAlign: c.align, padding: '10px 14px', cursor: 'pointer', userSelect: 'none',
                    fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600,
                    color: sortKey === c.key ? AMBER : 'var(--muted-foreground)',
                    borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap',
                  }}
                >
                  {c.label}{sortKey === c.key ? (asc ? ' ▲' : ' ▼') : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((p) => {
              const isSel = p.name === selectedName;
              return (
                <tr
                  key={p.name}
                  onClick={() => onSelectPlanet?.(isSel ? null : p)}
                  style={{
                    cursor: 'pointer',
                    background: isSel ? 'rgba(245,158,11,0.10)' : 'transparent',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => { if (!isSel) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                  onMouseLeave={(e) => { if (!isSel) e.currentTarget.style.background = 'transparent'; }}
                >
                  {COLUMNS.map((c, ci) => (
                    <td
                      key={c.key}
                      style={{
                        textAlign: c.align, padding: '9px 14px', whiteSpace: 'nowrap',
                        color: c.key === 'name' ? 'var(--foreground)' : 'var(--muted-foreground)',
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        borderLeft: isSel && ci === 0 ? `2px solid ${AMBER}` : '2px solid transparent',
                      }}
                    >
                      {c.key === 'name' ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ width: 9, height: 9, borderRadius: '50%', background: p.color, boxShadow: `0 0 6px ${p.color}88`, flexShrink: 0 }} />
                          <span style={{ fontWeight: 600 }}>{p.name}</span>
                          {c.key === 'name' && (
                            <span title={`${p.rotationDir} rotation`} style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>
                              {p.rotationDir === 'retrograde' ? '↺' : '↻'}
                            </span>
                          )}
                        </span>
                      ) : c.format(p)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ padding: '8px 16px', borderTop: '1px solid var(--border)', fontSize: 9.5, color: 'var(--muted-foreground)', lineHeight: 1.5 }}>
        ↻ prograde · ↺ retrograde rotation. Mass and gravity relative to Earth. Click a row to highlight on the map; click a column to sort.
      </div>
    </div>
  );
}