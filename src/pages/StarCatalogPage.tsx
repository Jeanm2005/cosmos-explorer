import { useState } from 'react';
import type { Star } from '../types';
import StarField from '../components/StarField';
import StarHistogram from '../components/StarHistogram';
import { useStarCatalog, DEFAULT_STAR_QUERY, type StarQueryParams } from '../hooks/useStarCatalog';
import NASAImagePanel from '../components/NASAImagePanel';

const PRESETS = [
  { label: 'Orion Nebula', ra: 83.8221, dec: -5.3911 },
  { label: 'Pleiades', ra: 56.75, dec: 24.1167 },
  { label: 'Galactic Center', ra: 266.405, dec: -28.9362 },
  { label: 'Andromeda', ra: 10.6847, dec: 41.2691 },
];

export default function StarCatalogPage() {
  const [params, setParams] = useState<StarQueryParams>(DEFAULT_STAR_QUERY);
  const [selectedStar, setSelectedStar] = useState<Star | null>(null);
  const { data: stars = [], isLoading, isError } = useStarCatalog(params);

  return (
    <div style={{ minHeight: '100vh', background: '#050814', color: '#e0e8ff', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ padding: '28px 32px 0' }}>
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700 }}>Star Catalog</h1>
          <p style={{ margin: '6px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
            Hipparcos catalog via VizieR · {stars.length} stars loaded
          </p>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', padding: '12px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, marginBottom: 24 }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Presets:</span>
          {PRESETS.map((p) => (
            <button key={p.label} onClick={() => setParams((prev) => ({ ...prev, ra: p.ra, dec: p.dec }))}
              style={{ padding: '5px 12px', fontSize: 12, borderRadius: 5, cursor: 'pointer', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#e0e8ff', transition: 'all 0.15s' }}>
              {p.label}
            </button>
          ))}
          <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.1)' }} />
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
            Radius (°):
            <input type="number" min={0.1} max={5} step={0.1} value={params.radius}
              onChange={(e) => setParams((p) => ({ ...p, radius: parseFloat(e.target.value) }))}
              style={{ width: 60, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 5, color: '#e0e8ff', padding: '4px 8px', fontSize: 12 }} />
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
            Max stars:
            <select value={params.limit} onChange={(e) => setParams((p) => ({ ...p, limit: parseInt(e.target.value) }))}
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 5, color: '#e0e8ff', padding: '4px 8px', fontSize: 12 }}>
              <option value={200}>200</option>
              <option value={500}>500</option>
              <option value={1000}>1000</option>
            </select>
          </label>
        </div>
      </div>

      {isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh', gap: 16 }}>
          <div style={{ width: 40, height: 40, border: '2px solid rgba(77,217,255,0.2)', borderTopColor: '#4dd9ff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>Querying Hipparcos catalog via VizieR…</div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {isError && (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'rgba(255,77,77,0.8)' }}>
          Failed to load star catalog. VizieR may be temporarily unavailable.
        </div>
      )}

      {!isLoading && !isError && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 520px', gap: 24, padding: '0 32px 32px', alignItems: 'start' }}>
          {/* Left: star field + histogram */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 11, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Sky View · RA/Dec Projection
              </div>
              <StarField stars={stars} width={700} height={460} selectedId={selectedStar?.id} onSelectStar={setSelectedStar} />
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 11, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Magnitude Distribution
              </div>
              <div style={{ padding: '16px' }}>
                <StarHistogram stars={stars} width={660} height={200} />
              </div>
            </div>
          </div>

          {/* Right: selected star detail */}
          <div>
            {selectedStar ? (
              <div style={{ background: 'rgba(10,15,30,0.97)', border: '1px solid rgba(77,217,255,0.25)', borderRadius: 10, padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
                  <h3 style={{ margin: 0, fontSize: 17, color: '#e0e8ff' }}>{selectedStar.id}</h3>
                  <button onClick={() => setSelectedStar(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 18 }}>×</button>
                </div>
                {[
                  ['Right Ascension', `${selectedStar.ra.toFixed(4)}°`],
                  ['Declination', `${selectedStar.dec.toFixed(4)}°`],
                  ['Visual Magnitude', selectedStar.magnitude.toFixed(2)],
                  ['B-V Color Index', selectedStar.colorIndex?.toFixed(3) ?? '—'],
                ].map(([label, value]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>{label}</span>
                    <span style={{ color: '#e0e8ff', fontSize: 12, fontWeight: 500 }}>{value}</span>
                  </div>
                ))}
                <NASAImagePanel query={selectedStar.name ?? selectedStar.id} />
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 200, color: 'rgba(255,255,255,0.2)', fontSize: 13, gap: 8 }}>
                <span style={{ fontSize: 32 }}>✦</span>
                Click a star to inspect it
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}