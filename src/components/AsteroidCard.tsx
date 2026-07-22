import { X, TriangleAlert } from 'lucide-react';
import type { Asteroid } from '../types';
import { formatDiameter, formatDistance } from '../utils/normalizers';
import { HAZARD_COLOR, SAFE_COLOR } from '../utils/neoStyle';

const MONO = "'JetBrains Mono', ui-monospace, monospace";

interface Props {
    asteroid: Asteroid;
    onClose: () => void;
}

function DataRow({ label, value }: { label: string; value: string | number }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{label}</span>
            <span style={{ color: 'var(--foreground)', fontFamily: MONO, fontSize: 12, fontWeight: 500 }}>{value}</span>
        </div>
    );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-foreground)', marginBottom: 8 }}>
            {children}
        </div>
    );
}

export default function AsteroidCard({ asteroid, onClose }: Props) {
    const oe = asteroid.orbitalElements;
    const statusColor = asteroid.isPotentiallyHazardous ? HAZARD_COLOR : SAFE_COLOR;

    return (
        <div style={{ background: 'rgba(10,13,24,0.82)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', border: `1px solid ${statusColor}66`, borderRadius: 12, padding: 20, position: 'relative' }}>
            <button onClick={onClose} aria-label="Close"
                style={{ position: 'absolute', top: 14, right: 14, background: 'none', border: 'none', color: 'var(--muted-foreground)', cursor: 'pointer', display: 'flex', padding: 2 }}>
                <X size={18} />
            </button>

            <div style={{ marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontFamily: 'Orbitron, sans-serif', fontSize: 16, color: 'var(--foreground)', fontWeight: 700 }}>{asteroid.name}</h3>
                <div style={{ fontFamily: MONO, fontSize: 11, color: 'var(--muted-foreground)', marginTop: 4 }}>{asteroid.designation}</div>
                {asteroid.isPotentiallyHazardous && (
                    <div style={{ marginTop: 8, padding: '4px 9px', background: `${HAZARD_COLOR}1a`, border: `1px solid ${HAZARD_COLOR}55`, borderRadius: 5, color: HAZARD_COLOR, fontFamily: MONO, fontSize: 10, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5, letterSpacing: '0.05em' }}>
                        <TriangleAlert size={11} /> POTENTIALLY HAZARDOUS
                    </div>
                )}
            </div>

            <div style={{ marginBottom: 14 }}>
                <SectionLabel>Physical Properties</SectionLabel>
                <DataRow label="Diameter" value={formatDiameter(asteroid.diameterMin, asteroid.diameterMax)} />
                <DataRow label="Abs. Magnitude (H)" value={asteroid.absoluteMagnitude.toFixed(1)} />
            </div>

            <div style={{ marginBottom: 14 }}>
                <SectionLabel>Orbital Elements</SectionLabel>
                <DataRow label="Semi-major axis" value={`${oe.semiMajorAxis.toFixed(4)} AU`} />
                <DataRow label="Eccentricity" value={oe.eccentricity.toFixed(5)} />
                <DataRow label="Inclination" value={`${oe.inclination.toFixed(3)}°`} />
                <DataRow label="Arg. of perihelion" value={`${oe.argumentOfPerihelion.toFixed(3)}°`} />
                <DataRow label="Mean anomaly" value={`${oe.meanAnomaly.toFixed(3)}°`} />
            </div>

            {asteroid.closeApproaches.length > 0 && (
                <div>
                    <SectionLabel>Close Approaches</SectionLabel>
                    {asteroid.closeApproaches.slice(0, 5).map((ca, i) => (
                        <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4, fontFamily: MONO, fontSize: 11 }}>
                            <span style={{ color: 'var(--foreground)' }}>{ca.date}</span>
                            <span style={{ color: 'var(--muted-foreground)' }}>{formatDistance(ca.distanceAU)}</span>
                            <span style={{ color: 'var(--muted-foreground)' }}>{ca.relativeVelocityKmS.toFixed(1)} km/s</span>
                        </div>
                    ))}
                </div>
            )}

        </div>
    );
}