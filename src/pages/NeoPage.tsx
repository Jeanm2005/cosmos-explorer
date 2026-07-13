import { useState, useMemo } from 'react';
import type { Asteroid, AppFilters } from '../types';
import OrbitalMap from '../components/OrbitalMap';
import AsteroidTable from '../components/AsteroidTable';
import AsteroidCard from '../components/AsteroidCard';
import { useNearEarthObjects, getDefaultDateRange } from '../hooks/useNearEarthObjects';
import PlanetTable from '../components/PlanetTable';
import type { PlanetData } from '../utils/planetData';
import { PLANETS } from '../utils/planetData';
import { HAZARD_COLOR, SAFE_COLOR } from '../utils/neoStyle';

const MONO = "'JetBrains Mono', ui-monospace, monospace";
const AMBER = '#f59e0b';

const defaultFilters: AppFilters = {
  dateRange: getDefaultDateRange(),
  showHazardousOnly: false,
  minDiameter: 0,
  maxDiameter: 100000,
};

const inputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid var(--border)',
  borderRadius: 5,
  color: 'var(--foreground)',
  padding: '4px 8px',
  fontSize: 12,
  fontFamily: MONO,
  colorScheme: 'dark',
};

function Stat({ label, value, color, small }: { label: string; value: string | number; color: string; small?: boolean }) {
  return (
    <div style={{ textAlign: 'right' }}>
      <div style={{ fontFamily: MONO, fontSize: small ? 12 : 22, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontFamily: MONO, fontSize: 10, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
    </div>
  );
}

function LoadingState() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh', gap: 16 }}>
      <div style={{ width: 40, height: 40, border: '2px solid rgba(245,158,11,0.2)', borderTopColor: AMBER, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <div style={{ fontSize: 13, color: 'var(--muted-foreground)' }}>Fetching orbital data from NASA JPL…</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function ErrorState({ message }: { message?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '40vh', gap: 12 }}>
      <div style={{ fontSize: 32 }}>⚠</div>
      <div style={{ fontSize: 14, color: 'rgba(255,77,77,0.8)' }}>Failed to load asteroid data</div>
      {message && <div style={{ fontSize: 12, color: 'var(--muted-foreground)', maxWidth: 400, textAlign: 'center' }}>{message}</div>}
      <div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginTop: 4 }}>If this persists, the NeoWs service may be rate-limited — try again in a moment.</div>
    </div>
  );
}

export default function NEOPage() {
  const [filters, setFilters] = useState<AppFilters>(defaultFilters);
  const [selectedAsteroid, setSelectedAsteroid] = useState<Asteroid | null>(null);
  const { data: asteroids = [], isLoading, isError, error } = useNearEarthObjects(filters.dateRange);
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetData | null>(null);

  const filtered = useMemo(() => asteroids.filter((a) => {
    if (filters.showHazardousOnly && !a.isPotentiallyHazardous) return false;
    const avgDiam = (a.diameterMin + a.diameterMax) / 2;
    return avgDiam >= filters.minDiameter && avgDiam <= filters.maxDiameter;
  }), [asteroids, filters]);

  const hazardCount = filtered.filter((a) => a.isPotentiallyHazardous).length;

  return (
    <div style={{ minHeight: '100vh', color: 'var(--foreground)' }}>
      <div style={{ padding: '28px 32px 0' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ margin: 0, fontFamily: 'Orbitron, sans-serif', fontSize: 26, fontWeight: 600 }}>Near-Earth Objects</h1>
            <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--muted-foreground)' }}>Asteroids with orbital paths crossing Earth's orbit. Data from NASA JPL NeoWs.</p>
          </div>
          {!isLoading && (
            <div style={{ display: 'flex', gap: 20 }}>
              <Stat label="Total" value={filtered.length} color={AMBER} />
              <Stat label="Hazardous" value={hazardCount} color={HAZARD_COLOR} />
              <Stat label="Date range" value={`${filters.dateRange.start} → ${filters.dateRange.end}`} color="var(--muted-foreground)" small />
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--muted-foreground)', cursor: 'pointer' }}>
            Start date:
            <input type="date" value={filters.dateRange.start} onChange={(e) => setFilters((f) => ({ ...f, dateRange: { ...f.dateRange, start: e.target.value } }))} style={inputStyle} />
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--muted-foreground)', cursor: 'pointer' }}>
            End date:
            <input type="date" value={filters.dateRange.end} onChange={(e) => setFilters((f) => ({ ...f, dateRange: { ...f.dateRange, end: e.target.value } }))} style={inputStyle} />
          </label>
          <div style={{ width: 1, height: 20, background: 'var(--border)' }} />
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--muted-foreground)', cursor: 'pointer' }}>
            <input type="checkbox" checked={filters.showHazardousOnly} onChange={(e) => setFilters((f) => ({ ...f, showHazardousOnly: e.target.checked }))} style={{ accentColor: HAZARD_COLOR }} />
            Hazardous only
          </label>
          <div style={{ marginLeft: 'auto', fontFamily: MONO, fontSize: 11, color: 'var(--muted-foreground)' }}>NeoWs API · 7-day window max</div>
        </div>
      </div>

      {isLoading && <LoadingState />}
      {isError && <ErrorState message={(error as Error)?.message} />}
      {!isLoading && !isError && (
        <div style={{ display: 'grid', gridTemplateColumns: '560px 1fr', gap: 24, padding: '0 32px 32px', alignItems: 'start' }}>
          <div>
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontFamily: MONO, fontSize: 11, color: 'var(--muted-foreground)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Heliocentric View · Ecliptic Plane
              </div>
              <OrbitalMap 
                asteroids={filtered}
                size={520}
                selectedId={selectedAsteroid?.id}
                onSelectAsteroid={setSelectedAsteroid}
                highlightedPlanet={selectedPlanet?.name ?? null}
                onSelectPlanet={(name) => setSelectedPlanet(name ? PLANETS.find((p) => p.name === name) ?? null : null)}
              />
            </div>
            <div style={{ marginTop: 10, fontFamily: MONO, fontSize: 10, color: 'var(--muted-foreground)', textAlign: 'center' }}>
              <span style={{ color: SAFE_COLOR }}>●</span> safe &nbsp;
              <span style={{ color: HAZARD_COLOR }}>●</span> potentially hazardous &nbsp;
              <span style={{ color: '#4fc3f7' }}>●</span> Earth &nbsp;
              <span style={{ color: '#FFD700' }}>●</span> Sun
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {selectedAsteroid && <AsteroidCard asteroid={selectedAsteroid} onClose={() => setSelectedAsteroid(null)} />}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontFamily: MONO, fontSize: 11, color: 'var(--muted-foreground)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                {filtered.length} Objects · Click to inspect
              </div>
              <AsteroidTable asteroids={filtered} selectedId={selectedAsteroid?.id} onSelect={setSelectedAsteroid} />
            </div>
          </div>
        </div>
      )}
      <div style={{ padding: '0 32px 32px' }}>
          <PlanetTable
            selectedName={selectedPlanet?.name ?? null}
            onSelectPlanet={setSelectedPlanet}
          />
        </div>
    </div>
  );
}