import { X } from 'lucide-react';
import type { DeepSkyObject } from '../hooks/useDeepSkyObjects';
import NASAImagePanel from './NASAImagePanel';
import { DSO_TYPE_COLORS, DSO_TYPE_ICONS } from '../utils/DSOStyle';

const MONO = "'JetBrains Mono', ui-monospace, monospace";

interface Props {
    dso: DeepSkyObject;
    onClose: () => void;
}

const DSO_SEARCH_NAMES: Record<string, string> = {
    'M1': 'Crab Nebula',
    'M8': 'Lagoon Nebula',
    'M13': 'Hercules globular cluster',
    'M16': 'Eagle Nebula',
    'M17': 'Omega Nebula',
    'M20': 'Trifid Nebula',
    'M27': 'Dumbbell Nebula',
    'M31': 'Andromeda Galaxy',
    'M32': 'Andromeda companion galaxy',
    'M33': 'Triangulum Galaxy',
    'M42': 'Orion Nebula',
    'M43': 'Orion Nebula',
    'M51': 'Whirlpool Galaxy',
    'M57': 'Ring Nebula',
    'M63': 'Sunflower Galaxy',
    'M64': 'Black Eye Galaxy',
    'M74': 'Phantom Galaxy',
    'M77': 'Cetus galaxy',
    'M81': "Bode's Galaxy",
    'M82': 'Cigar Galaxy',
    'M87': 'M87 black hole galaxy',
    'M97': 'Owl Nebula',
    'M101': 'Pinwheel Galaxy',
    'M104': 'Sombrero Galaxy',
    'NGC 1052': 'NGC 1052 galaxy',
    'NGC 1275': 'Perseus A galaxy',
    'NGC 4889': 'Coma cluster galaxy',
    'Crab Pulsar': 'Crab Nebula',
    '3C 273': 'quasar 3C 273',
    'Sgr A*': 'Sagittarius A black hole',
    'Cygnus X-1': 'Cygnus X-1 black hole',
};

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
            <NASAImagePanel
                query={DSO_SEARCH_NAMES[dso.id] ?? dso.name}
                objectType={dso.typeLabel.toLowerCase()}
            />
        </div>
    );
}