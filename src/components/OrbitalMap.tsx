import { useMemo, useState } from 'react';
import * as d3 from 'd3';
import type { Asteroid } from '../types';
import { generateOrbitPath, auToPixels, earthPositionForDate, orbitalElementsToXY } from '../utils/orbitMath';
import { formatDiameter, formatDistance } from '../utils/normalizers';

interface Props {
  asteroids: Asteroid[];
  size?: number;
  onSelectAsteroid?: (asteroid: Asteroid | null) => void;
  selectedId?: string | null;
}

const MAX_AU = 2.5;
const ORBIT_STEPS = 120;
const hazardColor = '#ff4d4d';
const safeColor = '#4dd9ff';
const dimOrbitColor = 'rgba(255,255,255,0.08)';
const earthOrbitColor = 'rgba(100,200,255,0.25)';

export default function OrbitalMap({ asteroids, size = 600, onSelectAsteroid, selectedId }: Props) {
  const [tooltip, setTooltip] = useState<{ asteroid: Asteroid; px: number; py: number } | null>(null);

  const earthPos = useMemo(() => {
    const au = earthPositionForDate(new Date());
    return auToPixels(au, size, MAX_AU);
  }, [size]);

  const renderData = useMemo(() => {
    return asteroids.map((asteroid) => {
      const orbitAU = generateOrbitPath(asteroid.orbitalElements, ORBIT_STEPS);
      const orbitPx = orbitAU.map((p) => auToPixels(p, size, MAX_AU));
      const posAU = orbitalElementsToXY(asteroid.orbitalElements);
      const posPx = auToPixels(posAU, size, MAX_AU);
      return { asteroid, orbitPx, posPx };
    });
  }, [asteroids, size]);

  const lineGen = useMemo(
    () =>
      d3.line<{ px: number; py: number }>()
        .x((d) => d.px)
        .y((d) => d.py)
        .curve(d3.curveCatmullRomClosed),
    []
  );

  const earthOrbitRadius = (size / 2 / MAX_AU) * 1.0;

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <svg
        width={size}
        height={size}
        style={{ background: 'transparent', cursor: 'crosshair' }}
        onClick={() => { setTooltip(null); onSelectAsteroid?.(null); }}
      >
        <circle cx={size / 2} cy={size / 2} r={earthOrbitRadius} fill="none" stroke={earthOrbitColor} strokeWidth={1} strokeDasharray="4 4" />

        {renderData.map(({ asteroid, orbitPx }) => (
          <path
            key={`orbit-${asteroid.id}`}
            d={lineGen(orbitPx) ?? ''}
            fill="none"
            stroke={asteroid.isPotentiallyHazardous ? 'rgba(255,77,77,0.18)' : dimOrbitColor}
            strokeWidth={selectedId === asteroid.id ? 1.5 : 0.8}
          />
        ))}

        <circle cx={size / 2} cy={size / 2} r={8} fill="#FFD700" opacity={0.95} />
        <circle cx={size / 2} cy={size / 2} r={14} fill="#FFD700" opacity={0.08} />
        <circle cx={earthPos.px} cy={earthPos.py} r={5} fill="#4fc3f7" opacity={0.9} />

        {renderData.map(({ asteroid, posPx }) => {
          const isSelected = selectedId === asteroid.id;
          const isHazardous = asteroid.isPotentiallyHazardous;
          const r = isSelected ? 7 : isHazardous ? 4.5 : 3.5;
          const color = isHazardous ? hazardColor : safeColor;
          return (
            <g key={`dot-${asteroid.id}`}>
              {isSelected && (
                <circle cx={posPx.px} cy={posPx.py} r={r + 5} fill={color} opacity={0.15} />
              )}
              <circle
                cx={posPx.px}
                cy={posPx.py}
                r={r}
                fill={color}
                opacity={isSelected ? 1 : 0.8}
                style={{ cursor: 'pointer' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setTooltip({ asteroid, px: posPx.px, py: posPx.py });
                  onSelectAsteroid?.(asteroid);
                }}
                onMouseEnter={() => setTooltip({ asteroid, px: posPx.px, py: posPx.py })}
                onMouseLeave={() => { if (!isSelected) setTooltip(null); }}
              />
            </g>
          );
        })}

        <text x={size / 2 + earthOrbitRadius + 6} y={size / 2 + 4} fill="rgba(255,255,255,0.3)" fontSize={10}>Earth orbit</text>
        <text x={size / 2 + 11} y={size / 2 - 10} fill="rgba(255,200,0,0.6)" fontSize={10}>Sun</text>
      </svg>

      {tooltip && (
        <div style={{
          position: 'absolute',
          left: tooltip.px + 14,
          top: tooltip.py - 10,
          background: 'rgba(10,15,30,0.92)',
          border: `1px solid ${tooltip.asteroid.isPotentiallyHazardous ? hazardColor : safeColor}`,
          borderRadius: 6,
          padding: '8px 12px',
          pointerEvents: 'none',
          fontSize: 12,
          color: '#e0e8ff',
          maxWidth: 200,
          zIndex: 10,
        }}>
          <div style={{ fontWeight: 700, marginBottom: 4, fontSize: 13 }}>{tooltip.asteroid.name}</div>
          <div>Diameter: {formatDiameter(tooltip.asteroid.diameterMin, tooltip.asteroid.diameterMax)}</div>
          {tooltip.asteroid.closeApproaches[0] && (
            <div>Closest: {formatDistance(tooltip.asteroid.closeApproaches[0].distanceAU)}</div>
          )}
          {tooltip.asteroid.isPotentiallyHazardous && (
            <div style={{ color: hazardColor, marginTop: 4, fontWeight: 600 }}>⚠ Potentially Hazardous</div>
          )}
        </div>
      )}
    </div>
  );
}