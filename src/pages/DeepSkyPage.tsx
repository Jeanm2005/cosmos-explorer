import { useState } from 'react';
import { Telescope } from 'lucide-react';
import type { DeepSkyObject } from '../hooks/useDeepSkyObjects';
import { useDeepSkyObjects } from '../hooks/useDeepSkyObjects';
import DSOCard from '../components/DSOCard';
import { DSO_TYPE_COLORS, DSO_TYPE_ICONS } from '../utils/DSOStyle';

const ACCENT = '#c084d8';
const MONO = "'JetBrains Mono', ui-monospace, monospace";

function LoadingState({ label }: { label: string}) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh', gap: 16 }}>
            <div style={{ width: 40, height: 40, border: `2px solid ${ACCENT}33`, borderTopColor: ACCENT, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <div style={{ fontFamily: MONO, fontSize: 12, color: 'var(--muted-foreground' }}>{label}</div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }` }</style>
        </div>
    );
}

export default function DeepSkyPage() {
    const [selectedDSO, setSelectedDSO] = useState<DeepSkyObject | null>(null);
    const { data: dsos = [], isLoading} = useDeepSkyObjects();

    return (
        <div style={{ minHeight: '100vh', color: 'var(--foreground)' }}>
            <div style={{ padding: '28px 32px 0' }}>
                <div style={{ marginBottom: 24 }}>
                    <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: ACCENT, marginBottom: 10 }}>
                        SIMBAD · Messier & NGC
                    </div>
                    <h1 style={{ margin: 0, fontFamily: 'Orbitron, sans-serif', fontSize: 28, fontWeight: 600, color: 'var(--foreground)' }}>
                        Deep-Sky Objects
                    </h1>
                    <p style={{ margin: '8px 0 0', fontSize: 13, color: 'var(--muted-foreground)' }}>
                        {dsos.length > 0 ? `${dsos.length} curated objects` : 'Curated objects'} · galaxies, nebulae, clusters and more, resolved through SIMBAD.
                    </p>
                </div>
            </div>
 
            {isLoading ? (
                <LoadingState label="Querying SIMBAD database…" />
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, padding: '0 32px 32px', alignItems: 'start' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                        {dsos.map((dso) => {
                            const color = DSO_TYPE_COLORS[dso.type] ?? DSO_TYPE_COLORS.other;
                            const Icon = DSO_TYPE_ICONS[dso.type] ?? Telescope;
                            const isSelected = selectedDSO?.id === dso.id;
                            return (
                                <div key={dso.id} onClick={() => setSelectedDSO(dso)}
                                    style={{ padding: 14, borderRadius: 10, cursor: 'pointer', border: `1px solid ${isSelected ? color : 'var(--border)'}`, background: isSelected ? `${color}14` : 'rgba(255,255,255,0.02)', transition: 'all 0.15s' }}>
                                    <Icon size={20} strokeWidth={1.6} style={{ color, marginBottom: 8 }} />
                                    <div style={{ fontSize: 13, color: 'var(--foreground)', fontWeight: 600, marginBottom: 3 }}>{dso.name}</div>
                                    <div style={{ fontFamily: MONO, fontSize: 10, color, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{dso.typeLabel}</div>
                                    {dso.magnitude != null && <div style={{ fontFamily: MONO, fontSize: 10, color: 'var(--muted-foreground)', marginTop: 4 }}>mag {dso.magnitude.toFixed(1)}</div>}
                                </div>
                            );
                        })}
                    </div>
                    <div>
                        {selectedDSO
                            ? <DSOCard dso={selectedDSO} onClose={() => setSelectedDSO(null)} />
                            : (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 200, color: 'var(--muted-foreground)', opacity: 0.6, fontSize: 13, gap: 10, textAlign: 'center' }}>
                                    <Telescope size={30} strokeWidth={1.4} style={{ color: ACCENT, opacity: 0.7 }} />
                                    Select an object to inspect its coordinates and imagery.
                                </div>
                            )}
                    </div>
                </div>
            )}
        </div>
    );
}