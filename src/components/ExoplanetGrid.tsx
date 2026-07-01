import { useState, useMemo } from 'react';
import { Search, Sprout } from 'lucide-react';
import type { Exoplanet } from '../hooks/useExoplanets';

interface Props {
    exoplanets: Exoplanet[];
    selectedId: string | null;
    onSelect: (e: Exoplanet) => void;
}

type FilterMethod = 'All' | 'Transit' | 'Radial Velocity' | 'Imaging' | 'Other';

const ACCENT = '#34d399';
const MONO = "'JetBrains Mono', ui-monospace, monospace";

// Size-class color encoding (blue = small/rocky → coral = gas giant)
function getPlanetColor(radius: number | null): string {
    if (!radius) return '#8a94a6';
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
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Search size={13} style={{ position: 'absolute', left: 10, color: 'var(--muted-foreground)', opacity: 0.6, pointerEvents: 'none' }} />
                    <input
                        placeholder="Search planet or star…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ padding: '6px 12px 6px 30px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--foreground)', fontSize: 12, width: 190, outline: 'none' }}
                    />
                </div>
                {methods.map((m) => {
                    const active = filterMethod === m;
                    return (
                        <button key={m} onClick={() => setFilterMethod(m)}
                            style={{ padding: '5px 12px', fontFamily: MONO, fontSize: 11, borderRadius: 7, cursor: 'pointer', border: `1px solid ${active ? ACCENT + '55' : 'var(--border)'}`, background: active ? ACCENT + '1a' : 'rgba(255,255,255,0.03)', color: active ? ACCENT : 'var(--muted-foreground)', transition: 'all 0.15s' }}>
                            {m}
                        </button>
                    );
                })}
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--muted-foreground)', cursor: 'pointer' }}>
                    <input type="checkbox" checked={habitableOnly} onChange={(e) => setHabitableOnly(e.target.checked)} style={{ accentColor: ACCENT }} />
                    Habitable zone only
                </label>
                <span style={{ marginLeft: 'auto', fontFamily: MONO, fontSize: 11, color: 'var(--muted-foreground)', opacity: 0.7 }}>{filtered.length} planets</span>
            </div>

            {/* Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10, maxHeight: '65vh', overflowY: 'auto' }}>
                {filtered.map((planet) => {
                    const color = getPlanetColor(planet.radius);
                    const isSelected = selectedId === planet.id;
                    const dotSize = Math.min(28, Math.max(8, (planet.radius ?? 3) * 3));
                    return (
                        <div key={planet.id} onClick={() => onSelect(planet)}
                            style={{ padding: '12px', borderRadius: 10, cursor: 'pointer', border: `1px solid ${isSelected ? color : 'var(--border)'}`, background: isSelected ? `${color}14` : 'rgba(255,255,255,0.02)', transition: 'all 0.15s', display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: dotSize, height: dotSize, borderRadius: '50%', background: `radial-gradient(circle at 35% 35%, ${color}cc, ${color}44)`, flexShrink: 0 }} />
                                <div style={{ fontSize: 12, color: 'var(--foreground)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{planet.name}</div>
                            </div>
                            <div style={{ fontSize: 10, color: 'var(--muted-foreground)' }}>{planet.hostStar}</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: MONO, fontSize: 10, color: 'var(--muted-foreground)' }}>
                                <span>{planet.radius ? `${planet.radius.toFixed(1)} R⊕` : '—'}</span>
                                <span style={{ opacity: 0.7 }}>{planet.discoveryYear}</span>
                            </div>
                            {planet.isInHabitableZone && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: MONO, fontSize: 9, color: ACCENT, letterSpacing: '0.05em' }}>
                                    <Sprout size={11} /> HABITABLE ZONE
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}