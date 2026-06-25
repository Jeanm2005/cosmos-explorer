import { deriveStellar } from '../utils/stellarPhysics';

interface Props {
  colorIndex?: number;
  magnitude: number;
  distance?: number;
  starName?: string;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>{label}</span>
      <span style={{ color: '#e0e8ff', fontSize: 12, fontWeight: 500 }}>{value}</span>
    </div>
  );
}

export default function StellarPhysicsPanel({ colorIndex, magnitude, distance }: Props) {
  const { tempK, luminosity, spectral, hz } = deriveStellar({ colorIndex, magnitude, distance });

  return (
    <div style={{ marginTop: 16, padding: '14px 16px', background: 'rgba(10,15,30,0.6)', border: '1px solid rgba(77,217,255,0.15)', borderRadius: 10 }}>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
        Stellar Physics
      </div>

      {/* Spectral class badge */}
      {spectral ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <div style={{
            width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
            background: `radial-gradient(circle at 35% 35%, ${spectral.color}, ${spectral.color}66)`,
            boxShadow: `0 0 18px ${spectral.color}55`,
          }} />
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: spectral.color }}>
              Type {spectral.letter}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{spectral.label}</div>
          </div>
        </div>
      ) : (
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 12 }}>
          Spectral class unavailable (no color index for this star).
        </div>
      )}

      {tempK != null && <Row label="Temperature" value={`${Math.round(tempK).toLocaleString()} K`} />}
      {luminosity != null && (
        <Row label="Luminosity" value={luminosity >= 100
          ? `${luminosity.toFixed(0)} L☉`
          : `${luminosity.toFixed(luminosity < 1 ? 3 : 2)} L☉`} />
      )}

      {/* Habitable zone */}
      {hz ? (
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginBottom: 8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Habitable Zone
          </div>
          <div style={{ fontSize: 13, color: '#81c784', fontWeight: 600, marginBottom: 8 }}>
            {hz.inner.toFixed(2)} – {hz.outer.toFixed(2)} AU
          </div>
          {/* Simple visual: HZ band on a log-ish AU scale */}
          <HZBar inner={hz.inner} outer={hz.outer} />
          <div style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.3)', marginTop: 8, lineHeight: 1.5 }}>
            Range where liquid water could exist on a planet's surface, scaled from stellar luminosity (Kopparapu-style boundaries).
          </div>
        </div>
      ) : (
        <div style={{ marginTop: 12, fontSize: 11, color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>
          Habitable zone needs luminosity, which requires distance — not available for this star.
        </div>
      )}
    </div>
  );
}

/** Small horizontal scale (0–5 AU clamped) with the HZ band highlighted. */
function HZBar({ inner, outer }: { inner: number; outer: number }) {
  const MAX_AU = Math.max(5, outer * 1.3);
  const pct = (au: number) => Math.min(100, (au / MAX_AU) * 100);
  const left = pct(inner);
  const width = pct(outer) - left;

  return (
    <div style={{ position: 'relative', height: 10, background: 'rgba(255,255,255,0.06)', borderRadius: 5, overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', left: `${left}%`, width: `${width}%`, height: '100%',
        background: 'linear-gradient(90deg, rgba(129,199,132,0.7), rgba(77,217,255,0.7))',
      }} />
      {/* Earth reference marker at 1 AU */}
      <div style={{ position: 'absolute', left: `${pct(1)}%`, top: -2, width: 1, height: 14, background: 'rgba(255,255,255,0.5)' }} title="1 AU (Earth)" />
    </div>
  );
}