import { useMemo, useRef, useEffect, useState } from 'react';
import type { Star } from '../types';

interface Props {
    stars: Star[];
    width?: number;
    height?: number;
    onSelectStar?: (star: Star | null) => void;
    selectedId?: string | null;
}

// Map B-V color index to a CSS color
function bvToColor(bv?: number): string {
    if (bv === undefined) return '#ffffff';
    if (bv < -0.3) return '#9bb0ff'; // blue
    if (bv < 0.0) return '#aabfff'; // blue-white
    if (bv < 0.3) return '#cad7ff'; // white
    if (bv < 0.6) return '#fff4ea'; // yellow-white
    if (bv < 1.0) return '#ffd2a1'; // orange
    return '#ffad51'; // red-orange
}

export default function StarField({ stars, width = 700, height = 500, onSelectStar, selectedId }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [tooltip, setTooltip] = useState<{ star: Star; x: number; y: number } | null>(null);

    // Compute RA/Dec bounds from data
    const bounds = useMemo(() => {
        if (!stars.length) return { raMin: 0, raMax: 1, decMin: 0, decMax: 1 };
        const ras = stars.map((s) => s.ra);
        const decs = stars.map((s) => s.dec);
        const pad = 0.1;
        return {
            raMin: Math.min(...ras) - pad,
            raMax: Math.max(...ras) + pad,
            decMin: Math.min(...decs) - pad,
            decMax: Math.max(...decs) + pad,
        };
    }, [stars]);
    
    // Project RA/Dec to canvas pixels
    function project(ra: number, dec: number) {
        const x = ((ra - bounds.raMin) / (bounds.raMax - bounds.raMin)) * width;
        const y = height - ((dec - bounds.decMin) / (bounds.decMax - bounds.decMin)) * height;
        return { x, y };
    }

    // Magnitude to radius: brighter = bigger dot
    function magToRadius(mag: number): number {
        return Math.max(0.5, 4.5 - mag * 0.4);
    }

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, width, height);

        for (const star of stars) {
            const { x, y } = project(star.ra, star.dec);
            const r = magToRadius(star.magnitude);
            const color = bvToColor(star.colorIndex);
            const isSelected = star.id === selectedId;

            if (isSelected) {
                ctx.beginPath();
                ctx.arc(x, y, r + 4, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(170,191,255,0.25)';
                ctx.fill();
            }

            // Glow for bright stars
            if (r > 2) {
                const grd = ctx.createRadialGradient(x, y, 0, x, y, r * 3);
                grd.addColorStop(0, color + 'aa');
                grd.addColorStop(1, color + '00');
                ctx.beginPath();
                ctx.arc(x, y, r * 3, 0, Math.PI * 2);
                ctx.fillStyle = grd;
                ctx.fill();
            }

            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
        }
    }, [stars, bounds, width, height, selectedId]);

    function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
        const rect = canvasRef.current!.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        // Find nearest star within 8px
        let nearest: Star | null = null;
        let nearestDist = 8;
        for (const star of stars) {
            const { x, y } = project(star.ra, star.dec);
            const dist = Math.sqrt((mx - x) ** 2 + (my - y) ** 2);
            if (dist < nearestDist) { nearest = star; nearestDist = dist; }
        }
        setTooltip(nearest ? { star: nearest, x: mx, y: my } : null);
    }

    return (
        <div style={{ position: 'relative', display: 'inline-block' }}>
            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                style={{ cursor: 'crosshair', display: 'block' }}
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setTooltip(null)}
                onClick={() => { if (tooltip) onSelectStar?.(tooltip.star); else onSelectStar?.(null); }}
            />
            {tooltip && (
                <div style={{
                    position: 'absolute', left: tooltip.x + 12, top: tooltip.y - 10,
                    background: 'rgba(10,13,24,0.88)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
                    border: '1px solid rgba(170,191,255,0.35)',
                    borderRadius: 8, padding: '8px 12px', pointerEvents: 'none',
                    fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                    fontSize: 11, color: 'var(--foreground)', zIndex: 10, whiteSpace: 'nowrap',
                }}>
                    <div style={{ fontWeight: 700, marginBottom: 3 }}>{tooltip.star.id}</div>
                    <div>Magnitude: {tooltip.star.magnitude.toFixed(2)}</div>
                    {tooltip.star.colorIndex !== undefined && (
                        <div>B-V: {tooltip.star.colorIndex.toFixed(3)}</div>
                    )}
                    <div style={{ color: 'var(--muted-foreground)', fontSize: 10, marginTop: 3 }}>
                        RA {tooltip.star.ra.toFixed(4)}° / Dec {tooltip.star.dec.toFixed(4)}°
                    </div>
                </div>
            )}
        </div>
    );
}