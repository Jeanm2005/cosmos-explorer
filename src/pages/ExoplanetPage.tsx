import { useState } from 'react';
import { Globe } from 'lucide-react';
import type { Exoplanet } from '../hooks/useExoplanets';
import { useExoplanets } from '../hooks/useExoplanets';
import ExoplanetGrid from '../components/ExoplanetGrid';
import ExoplanetCard from '../components/ExoplanetCard';

const ACCENT = '#34d499';
const MONO = "'JetBrains Mono', ui-monospace, monospace";

function LoadingState({ label }: { label: string}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh', gap: 16}}>
      <div style={{ width: 40, height: 40, border: `2px solid ${ACCENT}33`, borderTopColor: ACCENT, borderRadius: '50%', animation: 'sping 0.8s linear infinite' }}/>
      <div style={{ fontFamily: MONO, fontSize: 12, color: 'var(--muted-foreground)'}}>{label}</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } `}</style>
    </div>
  );
}

function EmptyDetail() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 200, color: 'var(--muted-foreground)', opacity: 0.6, fontSize: 13, gap: 10, textAlign: 'center'}}>
      <Globe size={30} strokeWidth={1.4} style={{ color: ACCENT, opacity: 0.7 }}/>
      Select a planet to inspect its orbital data and host-likelihood score.
    </div>
  );
}

export default function ExoplanetPage() {
  const [selectedExoplanet, setSelectedExoplanet] = useState<Exoplanet | null>(null);
  const { data: exoplanets = [], isLoading } = useExoplanets();

  return (
    <div style={{ minHeight: '100vh', color: 'var(--foreground)' }}>
      <div style={{ padding: '28px 32px 0' }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: ACCENT, marginBottom: 10 }}>
            NASA Exoplanet Archive
          </div>
          <h1 style={{ margin: 0, fontFamily: 'Orbitron, sans-serif', fontSize: 28, fontWeight: 600, color: 'var(--foreground)' }}>
            Exoplanets
          </h1>
          <p style={{ margin: '8px 0 0', fontSize: 13, color: 'var(--muted-foreground)' }}>
            {exoplanets.length > 0 ? `${exoplanets.length} confirmed planets` : 'Confirmed planets'} · click any to inspect orbital data and the ML host-likelihood score.
          </p>
        </div>
      </div>
 
      {isLoading ? (
        <LoadingState label="Fetching exoplanet catalog from NASA…" />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, padding: '0 32px 32px', alignItems: 'start' }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
            <ExoplanetGrid
              exoplanets={exoplanets}
              selectedId={selectedExoplanet?.id ?? null}
              onSelect={setSelectedExoplanet}
            />
          </div>
          <div>
            {selectedExoplanet
              ? <ExoplanetCard exoplanet={selectedExoplanet} onClose={() => setSelectedExoplanet(null)} />
              : <EmptyDetail />}
          </div>
        </div>
      )}
    </div>
  );
}