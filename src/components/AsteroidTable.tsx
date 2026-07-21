import { useState } from 'react';
import type { Asteroid } from '../types';
import { formatDiameter, formatDistance } from '../utils/normalizers';
import { HAZARD_COLOR, SAFE_COLOR } from '../utils/neoStyle';

type SortKey = 'name' | 'diameter' | 'distance' | 'velocity' | 'date';
type SortDir = 'asc' | 'desc';

const MONO = "'JetBrains Mono', ui-monospace, monospace";
const AMBER = '#f59e0b';

interface Props {
    asteroids: Asteroid[];
    selectedId?: string | null;
    onSelect: (asteroid: Asteroid) => void;
}

function getClosest(a: Asteroid) {
    return a.closeApproaches.reduce(
        (min, ca) => (ca.distanceAU < min.distanceAU ? ca : min),
        a.closeApproaches[0]
    );
}

// Hoisted out of the render body so it isn't recreated each render.
// Receives sort state and the handler as props.
function ColHeader({
    label, k, sortKey, sortDir, onSort,
}: {
    label: string;
    k: SortKey;
    sortKey: SortKey;
    sortDir: SortDir;
    onSort: (k: SortKey) => void;
}) {
    const active = sortKey === k;
    return (
        <th
            onClick={() => onSort(k)}
            style={{
                cursor: 'pointer', padding: '10px 14px', textAlign: 'left',
                fontFamily: MONO, fontWeight: active ? 700 : 500,
                color: active ? AMBER : 'var(--muted-foreground)',
                fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase',
                whiteSpace: 'nowrap', userSelect: 'none',
                borderBottom: '1px solid var(--border)',
            }}
        >
            {label} {active ? (sortDir === 'asc' ? '↑' : '↓') : ''}
        </th>
    );
}

export default function AsteroidTable({ asteroids, selectedId, onSelect }: Props) {
    const [sortKey, setSortKey] = useState<SortKey>('distance');
    const [sortDir, setSortDir] = useState<SortDir>('asc');

    function handleSort(key: SortKey) {
        if (key === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        else { setSortKey(key); setSortDir('asc'); }
    }

    const sorted = [...asteroids].sort((a, b) => {
        const caA = getClosest(a);
        const caB = getClosest(b);
        let cmp = 0;
        switch (sortKey) {
            case 'name': cmp = a.name.localeCompare(b.name); break;
            case 'diameter': cmp = (a.diameterMin + a.diameterMax) / 2 - (b.diameterMin + b.diameterMax) / 2; break;
            case 'distance': cmp = (caA?.distanceAU ?? 0) - (caB?.distanceAU ?? 0); break;
            case 'velocity': cmp = (caA?.relativeVelocityKmS ?? 0) - (caB?.relativeVelocityKmS ?? 0); break;
            case 'date': cmp = (caA?.date ?? '').localeCompare(caB?.date ?? ''); break;
        }
        return sortDir === 'asc' ? cmp : -cmp;
    });

    const headerProps = { sortKey, sortDir, onSort: handleSort };

    return (
        <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '60vh' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, fontFamily: MONO }}>
                <thead style={{ position: 'sticky', top: 0, background: '#0a1020', zIndex: 2 }}>
                    <tr>
                        <ColHeader label="Name" k="name" {...headerProps} />
                        <ColHeader label="Diameter" k="diameter" {...headerProps} />
                        <ColHeader label="Miss Distance" k="distance" {...headerProps} />
                        <ColHeader label="Velocity (km/s)" k="velocity" {...headerProps} />
                        <ColHeader label="Date" k="date" {...headerProps} />
                        <th style={{ padding: '10px 14px', fontFamily: MONO, color: 'var(--muted-foreground)', fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase', borderBottom: '1px solid var(--border)' }}>Risk</th>
                    </tr>
                </thead>
                <tbody>
                    {sorted.map((asteroid) => {
                        const ca = getClosest(asteroid);
                        const isSelected = selectedId === asteroid.id;
                        return (
                            <tr
                                key={asteroid.id}
                                onClick={() => onSelect(asteroid)}
                                style={{
                                    cursor: 'pointer',
                                    background: isSelected ? 'rgba(245,158,11,0.08)' : 'transparent',
                                    borderLeft: isSelected ? `2px solid ${AMBER}` : '2px solid transparent',
                                    transition: 'background 0.15s',
                                }}
                                onMouseEnter={(e) => { if (!isSelected) (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(255,255,255,0.04)'; }}
                                onMouseLeave={(e) => { if (!isSelected) (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'; }}
                            >
                                <td style={{ padding: '9px 14px', color: 'var(--foreground)', fontWeight: isSelected ? 600 : 400 }}>{asteroid.name}</td>
                                <td style={{ padding: '9px 14px', color: 'var(--muted-foreground)' }}>{formatDiameter(asteroid.diameterMin, asteroid.diameterMax)}</td>
                                <td style={{ padding: '9px 14px', color: 'var(--muted-foreground)' }}>{ca ? formatDistance(ca.distanceAU) : '—'}</td>
                                <td style={{ padding: '9px 14px', color: 'var(--muted-foreground)' }}>{ca ? ca.relativeVelocityKmS.toFixed(2) : '—'}</td>
                                <td style={{ padding: '9px 14px', color: 'var(--muted-foreground)', fontSize: 12 }}>{ca?.date ?? '—'}</td>
                                <td style={{ padding: '9px 14px' }}>
                                    {asteroid.isPotentiallyHazardous
                                        ? <span style={{ color: HAZARD_COLOR, fontSize: 11, fontWeight: 600 }}>PHA</span>
                                        : <span style={{ color: SAFE_COLOR, opacity: 0.75, fontSize: 11 }}>safe</span>}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            {sorted.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted-foreground)', fontSize: 13 }}>
                    No asteroids found for selected filters.
                </div>
            )}
        </div>
    );
}