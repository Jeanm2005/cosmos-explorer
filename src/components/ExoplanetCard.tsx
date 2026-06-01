import type { Exoplanet } from '../hooks/useExoplanets';
import NASAImagePanel from './NASAImagePanel';

interface Props {
    exoplanet: Exoplanet;
    onClose: () => void;
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>{label}</span>
            <span style={{ color: '#e0e8ff', fontSize: 12, fontWeight: 500 }}>{value}</span>
        </div>
    );
}

function getPlanetColor(radius: number | null): string {
    if (!radius) return '#4dd9ff';
    if (radius < 1.25) return '#4fc3f7'; // rocky / Earth-life
    if (radius < 2.0)  return '#81c784';   // super-Earth
    if (radius < 4.0)  return '#ffb74d';   // mini-Neptune
    if (radius < 10.0) return '#ce93d8';   // Neptune-like
    return '#ff8a65';                       // gas giant / Jupiter+
}

function getSizeClass(radius: number | null): string {
    if (!radius) return 'Unknown';
    if (radius < 1.25) return 'Rocky / Earth-like';
    if (radius < 2.0)  return 'Super-Earth';
    if (radius < 4.0)  return 'Mini-Neptune';
    if (radius < 10.0) return 'Neptune-like';
    return 'Gas Giant';
}

export default function ExoplanetCard({ exoplanet, onClose }: Props) {
    const color = getPlanetColor(exoplanet.radius);
    const dotSize = Math.min(60, Math.max(16, (exoplanet.radius ?? 4) * 8));

    return (
        <div style={{ background: 'rgba(10,15,30,0.97)', border: `1px solid ${exoplanet.isInHabitableZone ? 'rgba(129,199,132,0.4)' : 'rgba(77,217,255,0.2)'}`, borderRadius: 10, padding: 20, position: 'relative' }}>
            <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 18 }}>×</button>

            {/* Planet visual */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                <div style={{
                    width: dotSize, height: dotSize, borderRadius: '50%',
                    background: `radial-gradient(circle at 35% 35%, ${color}cc, ${color}44)`,
                    boxShadow: `0 0 ${dotSize}px ${color}44`,
                    flexShrink: 0,
                }} />
                <div>
                    <h3 style={{ margin: 0, fontSize: 16, color: '#e0e8ff', fontWeight: 700 }}>{exoplanet.name}</h3>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>Host: {exoplanet.hostStar}</div>
                    {exoplanet.isInHabitableZone && (
                        <div style={{ marginTop: 6, padding: '3px 8px', background: 'rgba(129,199,132,0.1)', border: '1px solid rgba(129,199,132,0.3)', borderRadius: 4, color: '#81c784', fontSize: 10, fontWeight: 600, display: 'inline-block', letterSpacing: '0.05em' }}>
                            🌱 HABITABLE ZONE
                        </div>
                    )}
                </div>
            </div>

            <Row label="Size Class" value={getSizeClass(exoplanet.radius)} />
            <Row label="Radius" value={exoplanet.radius ? `${exoplanet.radius.toFixed(2)} R⊕` : '—'} />
            <Row label="Mass" value={exoplanet.mass ? `${exoplanet.mass.toFixed(2)} M⊕` : '—'} />
            <Row label="Orbital Period" value={exoplanet.orbitalPeriod ? `${exoplanet.orbitalPeriod.toFixed(2)} days` : '—'} />
            <Row label="Semi-major Axis" value={exoplanet.semiMajorAxis ? `${exoplanet.semiMajorAxis.toFixed(3)} AU` : '—'} />
            <Row label="Eq. Temperature" value={exoplanet.equilibriumTemp ? `${exoplanet.equilibriumTemp} K` : '—'} />
            <Row label="Distance" value={exoplanet.distanceFromEarth ? `${exoplanet.distanceFromEarth.toFixed(1)} pc` : '—'} />
            <Row label="Discovery Method" value={exoplanet.discoveryMethod} />
            <Row label="Discovery Year" value={String(exoplanet.discoveryYear)} />

            <NASAImagePanel query={`${exoplanet.name} exoplanet artist concept`} />
        </div>
    );
}