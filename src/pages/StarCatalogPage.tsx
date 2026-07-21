import { useState } from 'react';
import { Star as StarIcon, X } from 'lucide-react';
import type { Star } from '../types';
import StarField from '../components/StarField';
import StarHistogram from '../components/StarHistogram';
import { useStarCatalog, DEFAULT_STAR_QUERY, type StarQueryParams } from '../hooks/useStarCatalog';
import NASAImagePanel from '../components/NASAImagePanel';
import StellarPhysicsPanel from '../components/StellarPhysicsPanel';

const ACCENT = '#aabfff';
const MONO = "'JetBrains Mono', ui-monospace, monospace";

const PRESETS = [
  { label: 'Orion Nebula', ra: 83.8221, dec: -5.3911 },
  { label: 'Pleiades', ra: 56.75, dec: 24.1167 },
  { label: 'Galactic Center', ra: 266.405, dec: -28.9362 },
  { label: 'Andromeda', ra: 10.6847, dec: 41.2691 },
];

const inputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid var(--border)',
  borderRadius: 6,
  color: 'var(--foreground)',
  padding: '4px 8px',
  fontFamily: MONO,
  fontSize: 12,
  outline: 'none',
};

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontFamily: MONO, fontSize: 11, color: 'var(--muted-foreground)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
      {children}
    </div>
  );
}

export default function StarCatalogPage() {
  const [params, setParams] = useState<StarQueryParams>(DEFAULT_STAR_QUERY);
  const [selectedStar, setSelectedStar] = useState<Star | null>(null);
  const { data: stars = [], isLoading, isError } = useStarCatalog(params);

  const isPresetActive = (p: typeof PRESETS[number]) =>
    Math.abs(params.ra - p.ra) < 1e-4 && Math.abs(params.dec - p.dec) < 1e-4;

  return (
    <div style={{ minHeight: '100vh', color: 'var(--foreground)' }}>
      <div style={{ padding: '28px 32px 0' }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: ACCENT, marginBottom: 10 }}>
            Hipparcos · via VizieR
          </div>
          <h1 style={{ margin: 0, fontFamily: 'Orbitron, sans-serif', fontSize: 28, fontWeight: 600, color: 'var(--foreground)' }}>
            Star Catalog
          </h1>
          <p style={{ margin: '8px 0 0', fontSize: 13, color: 'var(--muted-foreground)' }}>
            {stars.length > 0 ? `${stars.length} stars loaded` : 'Astrometric survey'} · click any star for its spectral class and derived physics.
          </p>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 10, marginBottom: 24 }}>
          <span style={{ fontFamily: MONO, fontSize: 11, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Presets</span>
          {PRESETS.map((p) => {
            const active = isPresetActive(p);
            return (
              <button key={p.label} onClick={() => setParams((prev) => ({ ...prev, ra: p.ra, dec: p.dec }))}
                style={{ padding: '5px 12px', fontSize: 12, borderRadius: 7, cursor: 'pointer', background: active ? `${ACCENT}1a` : 'rgba(255,255,255,0.04)', border: `1px solid ${active ? ACCENT + '55' : 'var(--border)'}`, color: active ? ACCENT : 'var(--muted-foreground)', transition: 'all 0.15s' }}>
                {p.label}
              </button>
            );
          })}
          <div style={{ width: 1, height: 20, background: 'var(--border)' }} />
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--muted-foreground)' }}>
            Radius (°)
            <input type="number" min={0.1} max={5} step={0.1} value={params.radius}
              onChange={(e) => setParams((p) => ({ ...p, radius: parseFloat(e.target.value) }))}
              style={{ ...inputStyle, width: 62 }} />
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--muted-foreground)' }}>
            Max stars
            <select value={params.limit} onChange={(e) => setParams((p) => ({ ...p, limit: parseInt(e.target.value) }))}
              style={inputStyle}>
              <option value={200}>200</option>
              <option value={500}>500</option>
              <option value={1000}>1000</option>
            </select>
          </label>
        </div>
      </div>

      {isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh', gap: 16 }}>
          <div style={{ width: 40, height: 40, border: `2px solid ${ACCENT}33`, borderTopColor: ACCENT, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <div style={{ fontFamily: MONO, fontSize: 12, color: 'var(--muted-foreground)' }}>Querying Hipparcos catalog via VizieR…</div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {isError && (
        <div style={{ textAlign: 'center', padding: '80px 0', fontSize: 13, color: '#f87171' }}>
          Failed to load star catalog. VizieR may be temporarily unavailable.
        </div>
      )}

      {!isLoading && !isError && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 520px', gap: 24, padding: '0 32px 32px', alignItems: 'start' }}>
          {/* Left: star field + histogram */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
              <SectionHeader>Sky View · RA/Dec Projection</SectionHeader>
              <StarField stars={stars} width={700} height={460} selectedId={selectedStar?.id} onSelectStar={setSelectedStar} />
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
              <SectionHeader>Magnitude Distribution</SectionHeader>
              <div style={{ padding: 16 }}>
                <StarHistogram stars={stars} width={660} height={200} />
              </div>
            </div>
          </div>

          {/* Right: selected star detail */}
          <div>
            {selectedStar ? (
              <div style={{ background: 'rgba(10,13,24,0.82)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', border: `1px solid ${ACCENT}44`, borderRadius: 12, padding: 20, position: 'relative' }}>
                <button onClick={() => setSelectedStar(null)} aria-label="Close"
                  style={{ position: 'absolute', top: 14, right: 14, background: 'none', border: 'none', color: 'var(--muted-foreground)', cursor: 'pointer', display: 'flex', padding: 2 }}>
                  <X size={18} />
                </button>
                <h3 style={{ margin: '0 0 16px', fontFamily: 'Orbitron, sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--foreground)' }}>
                  {selectedStar.name ?? selectedStar.id}
                </h3>
                {([
                  ['Right Ascension', `${selectedStar.ra.toFixed(4)}°`],
                  ['Declination', `${selectedStar.dec.toFixed(4)}°`],
                  ['Visual Magnitude', selectedStar.magnitude.toFixed(2)],
                  ['B-V Color Index', selectedStar.colorIndex?.toFixed(3) ?? '—'],
                ] as const).map(([label, value]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{label}</span>
                    <span style={{ color: 'var(--foreground)', fontFamily: MONO, fontSize: 12, fontWeight: 500 }}>{value}</span>
                  </div>
                ))}
                <NASAImagePanel
                  query={selectedStar.name ?? selectedStar.id}
                  fallback="Hubble space telescope star"
                  objectType="star"
                />
                <StellarPhysicsPanel
                  colorIndex={selectedStar.colorIndex}
                  magnitude={selectedStar.magnitude}
                  distance={selectedStar.distance}
                  starName={selectedStar.name ?? selectedStar.id}
                />
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 200, color: 'var(--muted-foreground)', opacity: 0.6, fontSize: 13, gap: 10, textAlign: 'center' }}>
                <StarIcon size={30} strokeWidth={1.4} style={{ color: ACCENT, opacity: 0.7 }} />
                Select a star to inspect its physics.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}