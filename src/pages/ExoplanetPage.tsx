import { useState } from 'react';
import type { Exoplanet } from '../hooks/useExoplanets';
import type { DeepSkyObject } from '../hooks/useDeepSkyObjects';
import { useExoplanets } from '../hooks/useExoplanets';
import { useDeepSkyObjects } from '../hooks/useDeepSkyObjects';
import ExoplanetGrid from '../components/ExoplanetGrid';
import ExoplanetCard from '../components/ExoplanetCard';
import DSOCard from '../components/DSOCard';

type Tab = 'exoplanets' | 'deepsky';

const TYPE_COLORS: Record<string, string> = {
  galaxy: '#ce93d8', nebula: '#4dd9ff', pulsar: '#fff176',
  quasar: '#ff8a65', black_hole: '#ef9a9a', cluster: '#a5d6a7', other: '#90a4ae',
};
const TYPE_ICONS: Record<string, string> = {
  galaxy: '🌌', nebula: '🌫', pulsar: '⚡', quasar: '💫',
  black_hole: '⚫', cluster: '✨', other: '🔭',
};

function LoadingState({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh', gap: 16 }}>
      <div style={{ width: 40, height: 40, border: '2px solid rgba(77,217,255,0.2)', borderTopColor: '#4dd9ff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>{label}</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function ExoplanetPage() {
  const [tab, setTab] = useState<Tab>('exoplanets');
  const [selectedExoplanet, setSelectedExoplanet] = useState<Exoplanet | null>(null);
  const [selectedDSO, setSelectedDSO] = useState<DeepSkyObject | null>(null);

  const { data: exoplanets = [], isLoading: exoLoading } = useExoplanets();
  const { data: dsos = [], isLoading: dsoLoading } = useDeepSkyObjects();

  return (
    <div style={{ minHeight: '100vh', background: '#050814', color: '#e0e8ff', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ padding: '28px 32px 0' }}>
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700 }}>Deep Space Explorer</h1>
          <p style={{ margin: '6px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
            Exoplanets via NASA Exoplanet Archive · Deep sky objects via SIMBAD
          </p>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: 4, width: 'fit-content' }}>
          {([['exoplanets', '🪐', 'Exoplanets'], ['deepsky', '🌌', 'Deep Sky Objects']] as const).map(([key, icon, label]) => (
            <button key={key} onClick={() => setTab(key)}
              style={{ padding: '7px 18px', fontSize: 12, borderRadius: 6, cursor: 'pointer', border: 'none', background: tab === key ? 'rgba(77,217,255,0.15)' : 'transparent', color: tab === key ? '#4dd9ff' : 'rgba(255,255,255,0.5)', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>{icon}</span><span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Exoplanets tab */}
      {tab === 'exoplanets' && (
        exoLoading ? <LoadingState label="Fetching exoplanet catalog from NASA…" /> : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, padding: '0 32px 32px', alignItems: 'start' }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: 20 }}>
              <ExoplanetGrid exoplanets={exoplanets} selectedId={selectedExoplanet?.id ?? null} onSelect={setSelectedExoplanet} />
            </div>
            <div>
              {selectedExoplanet
                ? <ExoplanetCard exoplanet={selectedExoplanet} onClose={() => setSelectedExoplanet(null)} />
                : <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 200, color: 'rgba(255,255,255,0.2)', fontSize: 13, gap: 8 }}>
                    <span style={{ fontSize: 32 }}>🪐</span>Click a planet to inspect it
                  </div>
              }
            </div>
          </div>
        )
      )}

      {/* Deep Sky Objects tab */}
      {tab === 'deepsky' && (
        dsoLoading ? <LoadingState label="Querying SIMBAD database…" /> : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, padding: '0 32px 32px', alignItems: 'start' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
              {dsos.map((dso) => {
                const color = TYPE_COLORS[dso.type] ?? '#90a4ae';
                const icon = TYPE_ICONS[dso.type] ?? '🔭';
                const isSelected = selectedDSO?.id === dso.id;
                return (
                  <div key={dso.id} onClick={() => setSelectedDSO(dso)}
                    style={{ padding: 14, borderRadius: 8, cursor: 'pointer', border: `1px solid ${isSelected ? color : 'rgba(255,255,255,0.07)'}`, background: isSelected ? `${color}11` : 'rgba(255,255,255,0.02)', transition: 'all 0.15s' }}>
                    <div style={{ fontSize: 20, marginBottom: 6 }}>{icon}</div>
                    <div style={{ fontSize: 13, color: '#e0e8ff', fontWeight: 600, marginBottom: 3 }}>{dso.name}</div>
                    <div style={{ fontSize: 10, color, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{dso.typeLabel}</div>
                    {dso.magnitude && <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>mag {dso.magnitude.toFixed(1)}</div>}
                  </div>
                );
              })}
            </div>
            <div>
              {selectedDSO
                ? <DSOCard dso={selectedDSO} onClose={() => setSelectedDSO(null)} />
                : <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 200, color: 'rgba(255,255,255,0.2)', fontSize: 13, gap: 8 }}>
                    <span style={{ fontSize: 32 }}>🌌</span>Click an object to inspect it
                  </div>
              }
            </div>
          </div>
        )
      )}
    </div>
  );
}