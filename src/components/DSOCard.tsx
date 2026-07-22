import { X } from 'lucide-react';
import type { DeepSkyObject } from '../hooks/useDeepSkyObjects';
import { DSO_TYPE_COLORS, DSO_TYPE_ICONS } from '../utils/DSOStyle';

const MONO = "'JetBrains Mono', ui-monospace, monospace";

interface Props {
    dso: DeepSkyObject;
    onClose: () => void;
}

export default function DSOCard({ dso, onClose }: Props) {
    const color = DSO_TYPE_COLORS[dso.type] ?? DSO_TYPE_COLORS.other;
    const Icon = DSO_TYPE_ICONS[dso.type] ?? DSO_TYPE_ICONS.other;

    return (
        <div style={{ background: 'rgba(10,13,24,0.82)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', border: `1px solid ${color}55`, borderRadius: 12, padding: 20, position: 'relative' }}>
            <button onClick={onClose} aria-label="Close" style={{ position: 'absolute', top: 14, right: 14, background: 'none', border: 'none', color: 'var(--muted-foreground)', cursor: 'pointer', display: 'flex', padding: 2 }}>
                <X size={18} />
            </button>
            <div style={{ marginBottom: 16 }}>
                <Icon size={26} strokeWidth={1.5} style={{ color, marginBottom: 10 }} />
                <h3 style={{ margin: 0, fontFamily: 'Orbitron, sans-serif', fontSize: 16, color: 'var(--foreground)', fontWeight: 700 }}>{dso.name}</h3>
                <div style={{ marginTop: 8, padding: '3px 8px', background: `${color}1a`, border: `1px solid ${color}55`, borderRadius: 5, color, fontFamily: MONO, fontSize: 10, fontWeight: 600, display: 'inline-block', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    {dso.typeLabel}
                </div>
            </div>
            {([
                ['Right Ascension', `${dso.ra.toFixed(4)}°`],
                ['Declination', `${dso.dec.toFixed(4)}°`],
                ['Magnitude', dso.magnitude?.toFixed(2) ?? '—'],
                ['Redshift (z)', dso.redshift?.toFixed(4) ?? '—'],
                ['Distance', dso.distance ?? '—'],
            ] as const).map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{label}</span>
                    <span style={{ color: 'var(--foreground)', fontFamily: MONO, fontSize: 12, fontWeight: 500 }}>{value}</span>
                </div>
            ))}
        </div>
    );
}