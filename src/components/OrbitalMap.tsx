import { useMemo, useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { Asteroid } from '../types';
import { generateOrbitPath, auToPixels, bodyPositionAtDate, periodFromSemiMajorAxis } from '../utils/orbitMath';
import { formatDiameter, formatDistance } from '../utils/normalizers';
import { PLANETS, COMETS, type OrbitingBody } from '../utils/solarSystemData';

interface Props {
  asteroids: Asteroid[];
  size?: number;
  onSelectAsteroid?: (asteroid: Asteroid | null) => void;
  selectedId?: string | null;
}

const ORBIT_STEPS = 180;
const hazardColor = '#ff4d4d';
const safeColor = '#4dd9ff';
const dimOrbitColor = 'rgba(255,255,255,0.08)';

// Zoom presets: maxAU controls how much of the system is visible
const ZOOM_LEVELS = [
  { label: 'Inner (asteroids)', maxAU: 2.5 },
  { label: 'Inner planets', maxAU: 6 },
  { label: 'Full system', maxAU: 32 },
  { label: 'Wide (comets)', maxAU: 40 },
];

export default function OrbitalMap({ asteroids, size = 600, onSelectAsteroid, selectedId }: Props) {
  const [tooltip, setTooltip] = useState<{ asteroid: Asteroid; px: number; py: number } | null>(null);
  const [bodyTip, setBodyTip] = useState<{ body: OrbitingBody; px: number; py: number } | null>(null);
  const [zoomIdx, setZoomIdx] = useState(0);
  const maxAU = ZOOM_LEVELS[zoomIdx].maxAU;

  const J2000 = useMemo(() => new Date(Date.UTC(2000, 0, 1, 12)), []);
  const [dayOffset, setDayOffset] = useState(() => (Date.now() - J2000.getTime()) / 86400000);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(5); // days advanced per animation frame
  const rafRef = useRef<number | null>(null);

  const currentDate = useMemo(() => new Date(J2000.getTime() + dayOffset * 86400000), [J2000, dayOffset]);

  useEffect(() => {
    if (!playing) return;
    const tick = () => {
      setDayOffset((d) => d + speed);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [playing, speed]);

  // Planets + comets: orbit paths and current positions
  const bodyData = useMemo(() => {
    return [...PLANETS, ...COMETS].map((body) => {
      const orbitAU = generateOrbitPath(body.elements, ORBIT_STEPS);
      const orbitPx = orbitAU.map((p) => auToPixels(p, size, maxAU));
      const posAU = bodyPositionAtDate(body.elements, body.periodDays, currentDate);
      const posPx = auToPixels(posAU, size, maxAU);
      return { body, orbitPx, posPx };
    });
  }, [size, maxAU, currentDate]);

  const renderData = useMemo(() => {
    return asteroids.map((asteroid) => {
      const orbitAU = generateOrbitPath(asteroid.orbitalElements, ORBIT_STEPS);
      const orbitPx = orbitAU.map((p) => auToPixels(p, size, maxAU));
      const period = periodFromSemiMajorAxis(asteroid.orbitalElements.semiMajorAxis);
      const posAU = bodyPositionAtDate(asteroid.orbitalElements, period, currentDate);
      const posPx = auToPixels(posAU, size, maxAU);
      return { asteroid, orbitPx, posPx };
    });
  }, [asteroids, size, maxAU, currentDate]);

  const lineGen = useMemo(
    () =>
      d3.line<{ px: number; py: number }>()
        .x((d) => d.px)
        .y((d) => d.py)
        .curve(d3.curveCatmullRomClosed),
    []
  );

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
        {ZOOM_LEVELS.map((z, i) => (
          <button
            key={z.label}
            onClick={() => setZoomIdx(i)}
            style={{
              padding: '5px 11px', fontSize: 11, borderRadius: 5, cursor: 'pointer',
              border: `1px solid ${zoomIdx === i ? 'rgba(77,217,255,0.5)' : 'rgba(255,255,255,0.12)'}`,
              background: zoomIdx === i ? 'rgba(77,217,255,0.12)' : 'transparent',
              color: zoomIdx === i ? '#4dd9ff' : 'rgba(255,255,255,0.55)',
            }}
          >
            {z.label}
          </button>
        ))}
      </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <button
            onClick={() => setPlaying((p) => !p)}
            style={{
              padding: '5px 14px', fontSize: 12, borderRadius: 5, cursor: 'pointer',
              border: '1px solid rgba(77,217,255,0.4)', background: 'rgba(77,217,255,0.12)',
            }}
          >
            {playing ? '❚❚ Pause' : '▶ Play'}
          </button>

          <input
            type="range"
            min={-3650}
            max={3650}
            value={dayOffset - (Date.now() - J2000.getTime()) / 86400000}
            onChange={(e) => {
              setPlaying(false);
              setDayOffset((Date.now() - J2000.getTime()) / 86400000 + Number(e.target.value));
            }}
            style={{ flex: 1, accentColor: '#4dd9ff', cursor: 'pointer'}}
          />

          <select
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            style={{ background: 'rgba(10,15,30,0.9)', color: '#e0e8ff', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 4, fontSize: 11, padding: '3px 6px' }}
          >
            <option value={1}>1×</option>
            <option value={5}>5×</option>
            <option value={20}>20×</option>
            <option value={60}>60×</option>
          </select>

          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', minWidth: 90, textAlign: 'right'}}>
            {currentDate.toISOString().split('T')[0]}
          </span>
        </div>

      <svg
        width={size}
        height={size}
        style={{ background: 'transparent', cursor: 'crosshair' }}
        onClick={() => { setTooltip(null); setBodyTip(null); onSelectAsteroid?.(null); }}
      >
        {/* Planet & comet orbits */}
        {bodyData.map(({ body, orbitPx }) => {
          const isHovered = bodyTip?.body.id === body.id;
          const baseColor = body.kind === 'comet' ? '127,255,212' : '150,180,255';
          return (
            <path
              key={`orbit-${body.id}`}
              d={lineGen(orbitPx) ?? ''}
              fill="none"
              stroke={`rgba(${baseColor},${isHovered ? 0.7 : 0.2})`}
              strokeWidth={isHovered ? 2 : 0.8}
              strokeDasharray={body.kind === 'comet' ? '3 3' : undefined}
            />
          );
        })}

        {/* Asteroid orbits */}
        {renderData.map(({ asteroid, orbitPx }) => {
          const active = tooltip?.asteroid.id === asteroid.id || selectedId === asteroid.id;
          return (
            <path
              key={`orbit-${asteroid.id}`}
              d={lineGen(orbitPx) ?? ''}
              fill="none"
              stroke={asteroid.isPotentiallyHazardous
                ? `rgba(255,77,77,${active ? 0.6 : 0.18})`
                : active ? 'rgba(77,217,255,0.5)' : dimOrbitColor}
              strokeWidth={active ? 1.8 : 0.8}
            />
          );
        })}

        {/* Sun */}
        <circle cx={size / 2} cy={size / 2} r={9} fill="#FFD700" opacity={0.95} />
        <circle cx={size / 2} cy={size / 2} r={16} fill="#FFD700" opacity={0.08} />

        {/* Planets & comets */}
        {bodyData.map(({ body, posPx }) => (
          <g key={`body-${body.id}`}>
            <circle
              cx={posPx.px}
              cy={posPx.py}
              r={body.radiusPx}
              fill={body.color}
              opacity={0.95}
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setBodyTip({ body, px: posPx.px, py: posPx.py })}
              onMouseLeave={() => setBodyTip(null)}
            />
            {body.kind === 'planet' && maxAU <= 6 && (
              <text x={posPx.px + body.radiusPx + 3} y={posPx.py + 3} fill="rgba(255,255,255,0.4)" fontSize={9}>
                {body.name}
              </text>
            )}
          </g>
        ))}

        {/* Asteroids */}
        {renderData.map(({ asteroid, posPx }) => {
          const isSelected = selectedId === asteroid.id;
          const isHazardous = asteroid.isPotentiallyHazardous;
          const r = isSelected ? 7 : isHazardous ? 4.5 : 3.5;
          const color = isHazardous ? hazardColor : safeColor;
          return (
            <g key={`dot-${asteroid.id}`}>
              {isSelected && <circle cx={posPx.px} cy={posPx.py} r={r + 5} fill={color} opacity={0.15} />}
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

        <text x={size / 2 + 13} y={size / 2 - 11} fill="rgba(255,200,0,0.6)" fontSize={10}>Sun</text>
      </svg>

      {bodyTip && (
        <div style={{
          position: 'absolute', left: bodyTip.px + 14, top: bodyTip.py - 10,
          background: 'rgba(10,15,30,0.92)', border: `1px solid ${bodyTip.body.color}`,
          borderRadius: 6, padding: '6px 10px', pointerEvents: 'none', fontSize: 12, color: '#e0e8ff', zIndex: 10,
        }}>
          <div style={{ fontWeight: 700 }}>{bodyTip.body.name}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
            {bodyTip.body.kind === 'comet' ? 'Comet' : 'Planet'} · a = {bodyTip.body.elements.semiMajorAxis.toFixed(2)} AU
          </div>
        </div>
      )}

      {tooltip && (
        <div style={{
          position: 'absolute', left: tooltip.px + 14, top: tooltip.py - 10,
          background: 'rgba(10,15,30,0.92)',
          border: `1px solid ${tooltip.asteroid.isPotentiallyHazardous ? hazardColor : safeColor}`,
          borderRadius: 6, padding: '8px 12px', pointerEvents: 'none', fontSize: 12, color: '#e0e8ff', maxWidth: 200, zIndex: 10,
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