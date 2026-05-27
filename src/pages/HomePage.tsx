import { useState, useMemo } from 'react';
import type { Asteroid, AppFilters } from '../types';
import OrbitalMap from '../components/OrbitalMap';
import AsteroidTable from '../components/AsteroidTable';
import AsteroidCard from '../components/AsteroidCard';
import { useNearEarthObjects, getDefaultDateRange } from '../hooks/useNearEarthObjects';

const defaultFilters: AppFilters = {
  dateRange: getDefaultDateRange(),
  showHazardousOnly: false,
  minDiameter: 0,
  maxDiameter: 100000,
};

const inputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 5,
  color: '#e0e8ff',
  padding: '4px 8px',
  fontSize: 12,
  colorScheme: 'dark',
};

function Stat({ label, value, color, small }: { label: string; value: string | number; color: string; small?: boolean }) {
  return (
    <div style={{ textAlign: 'right' }}>
      <div style={{ fontSize: small ? 12 : 22, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
    </div>
  );
}

function LoadingState() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh', gap: 16 }}>
      <div style={{ width: 40, height: 40, border: '2px solid rgba(77,217,255,0.2)', borderTopColor: '#4dd9ff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>Fetching orbital data from NASA JPL…</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function ErrorState({ message }: { message?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '40vh', gap: 12 }}>
      <div style={{ fontSize: 32 }}>⚠</div>
      <div style={{ fontSize: 14, color: 'rgba(255,77,77,0.8)' }}>Failed to load asteroid data</div>
      {message && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', maxWidth: 400, textAlign: 'center' }}>{message}</div>}
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 4 }}>NASA DEMO_KEY has rate limits — try again in a minute, or add a real API key.</div>
    </div>
  );
}

export default function HomePage() {
  const [filters, setFilters] = useState<AppFilters>(defaultFilters);
  const [selectedAsteroid, setSelectedAsteroid] = useState<Asteroid | null>(null);
  const { data: asteroids = [], isLoading, isError, error } = useNearEarthObjects(filters.dateRange);

  const filtered = useMemo(() => asteroids.filter((a) => {
    if (filters.showHazardousOnly && !a.isPotentiallyHazardous) return false;
    const avgDiam = (a.diameterMin + a.diameterMax) / 2;
    return avgDiam >= filters.minDiameter && avgDiam <= filters.maxDiameter;
  }), [asteroids, filters]);

  const hazardCount = filtered.filter((a) => a.isPotentiallyHazardous).length;

  return (
    <div style={{ minHeight: '100vh', background: '#050814', color: '#e0e8ff', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ padding: '28px 32px 0' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700 }}>Near-Earth Objects</h1>
            <p style={{ margin: '6px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Asteroids with orbital paths crossing Earth's orbit. Data from NASA JPL NeoWs.</p>
          </div>
          {!isLoading && (
            <div style={{ display: 'flex', gap: 20 }}>
              <Stat label="Total" value={filtered.length} color="#4dd9ff" />
              <Stat label="Hazardous" value={hazardCount} color="#ff4d4d" />
              <Stat label="Date range" value={`${filters.dateRange.start} → ${filters.dateRange.end}`} color="rgba(255,255,255,0.4)" small />
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, marginBottom: 24 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>
            Start date:
            <input type="date" value={filters.dateRange.start} onChange={(e) => setFilters((f) => ({ ...f, dateRange: { ...f.dateRange, start: e.target.value } }))} style={inputStyle} />
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>
            End date:
            <input type="date" value={filters.dateRange.end} onChange={(e) => setFilters((f) => ({ ...f, dateRange: { ...f.dateRange, end: e.target.value } }))} style={inputStyle} />
          </label>
          <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.1)' }} />
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>
            <input type="checkbox" checked={filters.showHazardousOnly} onChange={(e) => setFilters((f) => ({ ...f, showHazardousOnly: e.target.checked }))} style={{ accentColor: '#ff4d4d' }} />
            Hazardous only
          </label>
          <div style={{ marginLeft: 'auto', fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>NeoWs API · 7-day window max</div>
        </div>
      </div>

      {isLoading && <LoadingState />}
      {isError && <ErrorState message={(error as Error)?.message} />}
      {!isLoading && !isError && (
        <div style={{ display: 'grid', gridTemplateColumns: '560px 1fr', gap: 24, padding: '0 32px 32px', alignItems: 'start' }}>
          <div>
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 11, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Heliocentric View · Ecliptic Plane
              </div>
              <OrbitalMap asteroids={filtered} size={520} selectedId={selectedAsteroid?.id} onSelectAsteroid={setSelectedAsteroid} />
            </div>
            <div style={{ marginTop: 10, fontSize: 10, color: 'rgba(255,255,255,0.2)', textAlign: 'center' }}>
              <span style={{ color: '#4dd9ff' }}>●</span> safe &nbsp;
              <span style={{ color: '#ff4d4d' }}>●</span> potentially hazardous &nbsp;
              <span style={{ color: '#4fc3f7' }}>●</span> Earth &nbsp;
              <span style={{ color: '#FFD700' }}>●</span> Sun
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {selectedAsteroid && <AsteroidCard asteroid={selectedAsteroid} onClose={() => setSelectedAsteroid(null)} />}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 11, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                {filtered.length} Objects · Click to inspect
              </div>
              <AsteroidTable asteroids={filtered} selectedId={selectedAsteroid?.id} onSelect={setSelectedAsteroid} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}