import { useState } from 'react';
import type { Asteroid } from '../types';
import { formatDiameter, formatDistance } from '../utils/normalizers';

type SortKey = 'name' | 'diameter' | 'distance' | 'velocity' | 'date';
type SortDir = 'asc' | 'desc';

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

    function ColHeader({ label, k }: { label: string; k: SortKey }) {
        const active = sortKey === k;
        return (
            <th onClick={() => handleSort(k)} style={{ cursor: 'pointer', padding: '10px 14px', textAlign: 'left', fontWeight: active ? 700 : 500, color: active ? '#4dd9ff' : 'rgba(255,255,2550.55)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap', userSelect: 'none', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                {label} {active ? (sortDir === 'asc' ? '↑' : '↓') : ''}
            </th>
        );
    }

    return (
        <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '60vh' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead style={{ position: 'sticky', top: 0, background: '#0a0f1e', zIndex: 2 }}>
                    <tr>
                        <ColHeader label="Name" k="name" />
                        <ColHeader label="Diameter" k="diameter" />
                        <ColHeader label="Miss Distance" k="distance" />
                        <ColHeader label="Velocity (km/s)" k="velocity" />
                        <ColHeader label="Date" k="date" />
                        <th style={{ padding: '10px 14px', color: 'rgba(255,255,255,0.55)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>Risk</th>
                    </tr>
                </thead>
                <tbody>
                    {sorted.map((asteroid) => {
                        const ca = getClosest(asteroid);
                        const isSelected = selectedId === asteroid.id;
                        return (
                            <tr key={asteroid.id} onClick={() => onSelect(asteroid)}
                                style={{ cursor: 'pointer', background: isSelected ? 'rgba(77,217,255,0.07)' : 'transparent', borderLeft: isSelected ? '2px solid #4dd9ff' : '2px solid transparent', transition: 'background 0.15s' }}
                                onMouseEnter={(e) => { if (!isSelected) (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(255,255,255,0.04)'; }}
                                onMouseLeave={(e) => { if (!isSelected) (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'; }}
                            >
                                <td style={{ padding: '9px 14px', color: '#e0e8ff', fontWeight: isSelected ? 600 : 400 }}>{asteroid.name}</td>
                                <td style={{ padding: '9px 14px', color: 'rgba(255,255,255,0.7)' }}>{formatDiameter(asteroid.diameterMin, asteroid.diameterMax)}</td>
                                <td style={{ padding: '9px 14px', color: 'rgba(255,255,255,0.7)' }}>{ca ? formatDistance(ca.distanceAU) : '—'}</td>
                                <td style={{ padding: '9px 14px', color: 'rgba(255,255,255,0.7)' }}>{ca ? ca.relativeVelocityKmS.toFixed(2) : '—'}</td>
                                <td style={{ padding: '9px 14px', color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>{ca?.date ?? '—'}</td>
                                <td style={{ padding: '9px 14px' }}>
                                    {asteroid.isPotentiallyHazardous
                                        ? <span style={{ color: '#ff4d4d', fontSize: 11, fontWeight: 600 }}>⚠ PHA</span>
                                        : <span style={{ color: 'rgba(77,217,255,0.5)', fontSize: 11 }}>safe</span>}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            {sorted.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
                    No asteroids found for selected filters.
                </div>
            )}
        </div>
    );
}