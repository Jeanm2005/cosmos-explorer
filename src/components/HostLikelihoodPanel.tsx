import { useHostLikelihood, type StarParams } from '../hooks/useHostLikelihood';

interface Props {
  params: StarParams | null;
  starName?: string;
}

const FEATURE_LABELS: Record<string, string> = {
  teff: 'Temperature',
  radius: 'Radius',
  mass: 'Mass',
  metallicity: 'Metallicity',
  luminosity: 'Luminosity',
};

function likelihoodLabel(p: number): { text: string; color: string } {
  if (p >= 0.6) return { text: 'Elevated host likelihood', color: '#4dd9ff' };
  if (p >= 0.4) return { text: 'Typical host likelihood', color: '#a5d6a7' };
  return { text: 'Low host likelihood', color: '#ff8a65' };
}

export default function HostLikelihoodPanel({ params, starName }: Props) {
  const { data, isLoading, isError } = useHostLikelihood(params);

  if (!params) return null;

  return (
    <div style={{ marginTop: 16, padding: '14px 16px', background: 'rgba(10,15,30,0.6)', border: '1px solid rgba(77,217,255,0.15)', borderRadius: 10 }}>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
        ML Host-Likelihood {starName && `· ${starName}`}
      </div>

      {isLoading && (
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
          Computing… <span style={{ fontSize: 10, opacity: 0.6 }}>(first call may take ~30s while the model service wakes)</span>
        </div>
      )}

      {isError && (
        <div style={{ fontSize: 12, color: '#ff8a65' }}>Couldn’t reach the prediction service. Try again in a moment.</div>
      )}

      {data && (
        <>
          {(() => {
            const lab = likelihoodLabel(data.host_likelihood);
            return (
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontSize: 28, fontWeight: 700, color: lab.color }}>
                    {(data.host_likelihood * 100).toFixed(0)}%
                  </span>
                  <span style={{ fontSize: 12, color: lab.color }}>{lab.text}</span>
                </div>
                <div style={{ marginTop: 6, height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${data.host_likelihood * 100}%`, height: '100%', background: lab.color }} />
                </div>
              </div>
            );
          })()}

          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginBottom: 6, letterSpacing: '0.05em' }}>
            WHAT DRIVES THE MODEL
          </div>
          {Object.entries(data.feature_importance)
            .sort((a, b) => b[1] - a[1])
            .map(([feat, imp]) => (
              <div key={feat} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', width: 80 }}>
                  {FEATURE_LABELS[feat] ?? feat}
                </span>
                <div style={{ flex: 1, height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${imp * 100 / 0.3}%`, maxWidth: '100%', height: '100%', background: 'rgba(77,217,255,0.5)' }} />
                </div>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', width: 34, textAlign: 'right' }}>
                  {(imp * 100).toFixed(0)}%
                </span>
              </div>
            ))}

          <div style={{ marginTop: 10, fontSize: 9.5, color: 'rgba(255,255,255,0.3)', lineHeight: 1.5 }}>
            {data.note}
          </div>
        </>
      )}
    </div>
  );
}