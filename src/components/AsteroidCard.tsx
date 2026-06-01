import type { Asteroid } from '../types';
import { formatDiameter, formatDistance } from '../utils/normalizers';
import NASAImagePanel from './NASAImagePanel';

interface Props {
    asteroid: Asteroid;
    onClose: () => void;
}

function DataRow({ label, value }: { label: string; value: string | number }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>{label}</span>
            <span style={{ color: '#e0e8ff', fontSize: 12, fontWeight: 500 }}>{value}</span>
        </div>
    );
}

export default function AsteroidCard({ asteroid, onClose }: Props) {
    const oe = asteroid.orbitalElements;
    return (
        <div style={{ background: 'rgba(10,15,30,0.97)', border: `1px solid ${asteroid.isPotentiallyHazardous ? 'rgba(255,77,77,0.4' : 'rgba(77,217,255,0.5)'}`, borderRadius: 10, padding: '20px', position: 'relative' }}>
            <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 18 }}>×</button>
            <div style={{ marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: 17, color: '#e0e8ff', fontWeight: 700 }}>{asteroid.name}</h3>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 3 }}>Designation: {asteroid.designation}</div>
                {asteroid.isPotentiallyHazardous && (
                    <div style={{ marginTop: 8, padding: '5px 10px', background: 'rgba(255,77,77,0.1)', border: '1px solid rgba(255,77,77,0.3)', borderRadius: 4, color: '#ff4d4d', fontSize: 11, fontWeight: 600, display: 'inline-block' }}>
                        ⚠ POTENTIALLY HAZARDOUS ASTEROID
                    </div>
                )}
            </div>
            <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 8 }}>Physical Properties</div>
                <DataRow label="Diameter" value={formatDiameter(asteroid.diameterMin, asteroid.diameterMax)} />
                <DataRow label="Abs. Magnitude (H)" value={asteroid.absoluteMagnitude.toFixed(1)} />
            </div>
            <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 8 }}>Orbital Elements</div>
                <DataRow label="Semi-major axis" value={`${oe.semiMajorAxis.toFixed(4)} AU`} />
                <DataRow label="Eccentricity" value={oe.eccentricity.toFixed(5)} />
                <DataRow label="Inclination" value={`${oe.inclination.toFixed(3)}°`} />
                <DataRow label="Arg. of perihelion" value={`${oe.argumentOfPerihelion.toFixed(3)}°`} />
                <DataRow label="Mean anomaly" value={`${oe.meanAnomaly.toFixed(3)}°`} />
            </div>
            {asteroid.closeApproaches.length > 0 && (
                <div>
                    <div style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 8 }}>Close Approaches</div>
                    {asteroid.closeApproaches.slice(0, 5).map((ca, i) => (
                        <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4 }}>
                            <span style={{ fontSize: 11, color: '#e0e8ff' }}>{ca.date}</span>
                            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{formatDistance(ca.distanceAU)}</span>
                            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{ca.relativeVelocityKmS.toFixed(1)} km/s</span>
                        </div>
                    ))}
                </div>
            )}
            <NASAImagePanel query={asteroid.name} />
        </div>
    );
}