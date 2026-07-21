import { X, Sprout, Info } from 'lucide-react';
import type { Exoplanet } from '../hooks/useExoplanets';
import NASAImagePanel from './NASAImagePanel';
import HostLikelihoodPanel from './HostLikelihoodPanel';
import InterpretationPanel from './InterpretationPanel';
import { useHostLikelihood } from '../hooks/useHostLikelihood';
import { findHostParams, curatedStarList } from '../utils/curatedStars';

const curatedCount = curatedStarList.length;
const ACCENT = '#34d399';
const MONO = "'JetBrains Mono', ui-monospace, monospace";

interface Props {
    exoplanet: Exoplanet;
    onClose: () => void;
}

function Row({ label, value }: { label: string; value: string}) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{label}</span>
            <span style={{ color: 'var(--foreground)', fontFamily: MONO, fontSize: 12, fontWeight: 500 }}>{value}</span>
        </div>
    );
}

function getPlanetColor(radius: number | null): string {
    if (!radius) return '#9a94a6';
    if (radius < 1.25) return '#4fc3f7';
    if (radius < 2.0)  return '#81c784';
    if (radius < 4.0)  return '#ffb74d';
    if (radius < 10.0) return '#ce93d8';
    return '#ff8a65';
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
    const hostParams = findHostParams(exoplanet.hostStar);
    // Same queryKey as HostLikelihoodPanel's own call, so React Query serves this
    // from cache rather than issuing a second request to the model service.
    const { data: hostScore } = useHostLikelihood(hostParams);
    const dotSize = Math.min(60, Math.max(16, (exoplanet.radius ?? 4) * 8));
 
    return (
        <div style={{ background: 'rgba(10,13,24,0.82)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', border: `1px solid ${exoplanet.isInHabitableZone ? ACCENT + '55' : 'var(--border)'}`, borderRadius: 12, padding: 20, position: 'relative' }}>
            <button onClick={onClose} aria-label="Close" style={{ position: 'absolute', top: 14, right: 14, background: 'none', border: 'none', color: 'var(--muted-foreground)', cursor: 'pointer', display: 'flex', padding: 2 }}>
                <X size={18} />
            </button>
 
            {/* Planet visual */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                <div style={{
                    width: dotSize, height: dotSize, borderRadius: '50%',
                    background: `radial-gradient(circle at 35% 35%, ${color}cc, ${color}44)`,
                    boxShadow: `0 0 ${dotSize}px ${color}44`,
                    flexShrink: 0,
                }} />
                <div>
                    <h3 style={{ margin: 0, fontFamily: 'Orbitron, sans-serif', fontSize: 16, color: 'var(--foreground)', fontWeight: 700 }}>{exoplanet.name}</h3>
                    <div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginTop: 2 }}>Host: {exoplanet.hostStar}</div>
                    {exoplanet.isInHabitableZone && (
                        <div style={{ marginTop: 6, padding: '3px 8px', background: `${ACCENT}1a`, border: `1px solid ${ACCENT}55`, borderRadius: 5, color: ACCENT, fontFamily: MONO, fontSize: 10, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5, letterSpacing: '0.05em' }}>
                            <Sprout size={11} /> HABITABLE ZONE
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
 
            <NASAImagePanel
                query={exoplanet.name}
                objectType="exoplanet"
                discoveryYear={exoplanet.discoveryYear}
            />
            {(() => {
                return hostParams ? (
                    <HostLikelihoodPanel params={hostParams} starName={exoplanet.hostStar} />
                ) : (
                    <div style={{ marginTop: 16, padding: '12px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 11, color: 'var(--muted-foreground)', lineHeight: 1.5, display: 'flex', gap: 8 }}>
                        <Info size={14} style={{ color: ACCENT, flexShrink: 0, marginTop: 1 }} />
                        <span>Uniform Gaia stellar parameters not available for {exoplanet.hostStar}, so the ML host-likelihood model can't score it. The model covers {curatedCount} confirmed hosts with complete Gaia DR3 parameters.</span>
                    </div>
                );
            })()}

            <InterpretationPanel planet={exoplanet} hostScore={hostScore} />
        </div>
    );
}