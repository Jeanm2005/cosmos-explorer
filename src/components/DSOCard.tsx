import type { DeepSkyObject } from '../hooks/useDeepSkyObjects';
import NASAImagePanel from './NASAImagePanel';

interface Props {
    dso: DeepSkyObject;
    onClose: () => void;
}

const TYPE_COLORS: Record<string, string> = {
    galaxy: '#ce93d8',
    nebula: '#4dd9ff',
    pulsar: '#fff176',
    quasar: '#ff8a65',
    black_hole: '#ef9a9a',
    cluster: '#a5d6a7',
    other: '#90a4ae',
};

const TYPE_ICONS: Record<string, string> = {
    galaxy: '🌌',
    nebula: '🌫',
    pulsar: '⚡',
    quasar: '💫',
    black_hole: '⚫',
    cluster: '✨',
    other: '🔭',
};

export default function DSOCard({ dso, onClose }: Props) {
    const color = TYPE_COLORS[dso.type] ?? '#90a4ae';
    const icon = TYPE_ICONS[dso.type] ?? '🔭';

    return (
        <div style={{ background: 'rgba(10,15,30,0.97)', border: `1px solid ${color}44`, borderRadius: 10, padding: 20, position: 'relative' }}>
            <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 18 }}>×</button>
            <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
                <h3 style={{ margin: 0, fontSize: 16, color: '#e0e8ff', fontWeight: 700 }}>{dso.name}</h3>
                <div style={{ marginTop: 6, padding: '3px 8px', background: `${color}18`, border: `1px solid ${color}44`, borderRadius: 4, color, fontSize: 10, fontWeight: 600, display: 'inline-block', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    {dso.typeLabel}
                </div>
            </div>
            {[
                ['Right Ascension', `${dso.ra.toFixed(4)}°`],
                ['Declination', `${dso.dec.toFixed(4)}°`],
                ['Magnitude', dso.magnitude?.toFixed(2) ?? '—'],
                ['Redshift (z)', dso.redshift?.toFixed(4) ?? '—'],
                ['Distance', dso.distance ?? '—'],
            ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>{label}</span>
                    <span style={{ color: '#e0e8ff', fontSize: 12, fontWeight: 500 }}>{value}</span>
                </div>
            ))}
            <NASAImagePanel query={dso.name} />
        </div>
    );
}