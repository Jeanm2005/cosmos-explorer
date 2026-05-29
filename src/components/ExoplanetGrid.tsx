import { useState, useMemo } from 'react';
import type { Exoplanet } from '../hooks/useExoplanets';

interface Props {
    exoplanets: Exoplanet[];
    selectedId: string | null;
    onSelect: (e: Exoplanet) => void;
}

type FilterMethod = 'All' | 'Transit' | 'Radial Velocity' | 'Imaging' | 'Other';

function getPlanetColor(radius: number | null): string {
    if (!radius) return '#4dd9ff';
    if (radius < 1.25) return '#4fc3f7';
    if (radius < 2.0) return '#81c784';
    if (radius < 4.0) return '#ffb74d';
    if (radius < 10.0) return '#ce93d8';
    return '#ff8a65';
}

export default function ExoplanetGrid({ exoplanets, selectedId, onSelect }: Props) {
    const [filterMethod, setFilterMethod] = useState<FilterMethod>('All');
    const [habitableOnly, setHabitableOnly] = useState(false);
    const [search, setSearch] = useState('');

    const methods: FilterMethod[] = ['All', 'Transit', 'Radial Velocity', 'Imaging', 'Other'];

    const filtered = useMemo(() => {
        return exoplanets.filter((e) => {
            if (habitableOnly && !e.isInHabitableZone) return false;
            if (filterMethod !== 'All') {
                if (filterMethod === 'Other') {
                    if (['Transit', 'Radial Velocity', 'Imaging'].includes(e.discoveryMethod)) return false;
                } else if (!e.discoveryMethod.includes(filterMethod)) return false;
            }
            if (search && !e.name.toLowerCase().includes(search.toLowerCase()) &&
                !e.hostStar.toLowerCase().includes(search.toLowerCase())) return false;
            return true;
        });
    }, [exoplanets, filterMethod, habitableOnly, search]);

    return (
        <div>
            {/* Filter bar */}
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
                <input
                    placeholder="Search planet or star…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, color: '#e0e8ff', fontSize: 12, width: 200 }}
                />
                {methods.map((m) => (
                    <button key={m} onClick={() => setFilterMethod(m)}
                    style={{ padding: '5px 12px', fontSize: 11, borderRadius: 5, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.12)', background: filterMethod === m ? 'rgba(77,217,255,0.15)' : 'rgba(255,255,255,0.04)', color: filterMethod === m ? '#4dd9ff' : 'rgba(255,255,255,0.5)', transition: 'all 0.15s' }}>
                    {m}
                    </button>
                ))}
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>
                    <input type="checkbox" checked={habitableOnly} onChange={(e) => setHabitableOnly(e.target.checked)} style={{ accentColor: '#81c784' }} />
                        Habitable zone only
                    </label>
                    <span style={{ marginLeft: 'auto', fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>{filtered.length} planets</span>
                </div>

                {/* Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10, maxHeight: '65vh', overflowY: 'auto' }}>
                    {filtered.map((planet) => {
                        const color = getPlanetColor(planet.radius);
                        const isSelected = selectedId === planet.id;
                        const dotSize = Math.min(28, Math.max(8, (planet.radius ?? 3) * 3));
                        return (
                            <div key={planet.id} onClick={() => onSelect(planet)}
                                style={{ padding: '12px', borderRadius: 8, cursor: 'pointer', border: `1px solid ${isSelected ? color : 'rgba(255,255,255,0.07)'}`, background: isSelected ? `${color}11` : 'rgba(255,255,255,0.02)', transition: 'all 0.15s', display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{ width: dotSize, height: dotSize, borderRadius: '50%', background: `radial-gradient(circle at 35% 35%, ${color}cc, ${color}44)`, flexShrink: 0 }} />
                                    <div style={{ fontSize: 12, color: '#e0e8ff', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{planet.name}</div>
                                </div>
                                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>{planet.hostStar}</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
                                    <span style={{ color: 'rgba(255,255,255,0.4)' }}>{planet.radius ? `${planet.radius.toFixed(1)} R⊕` : '—'}</span>
                                    <span style={{ color: 'rgba(255,255,255,0.3)' }}>{planet.discoveryYear}</span>
                                </div>
                                {planet.isInHabitableZone && (
                                    <div style={{ fontSize: 9, color: '#81c784', letterSpacing: '0.05em' }}>🌱 HABITABLE ZONE</div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
    );
}