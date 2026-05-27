/**
 * orbitMath.ts
 *
 * Converts Keplerian orbital elements into 2D (x, y) ecliptic-plane coordinates
 * suitable for rendering in D3. All angles are internally converted to radians.
 *
 * Coordinate system: heliocentric ecliptic, AU units.
 * Sun sits at origin. x-axis points toward vernal equinox.
 *
 * Resources used:
 *   - Meeus, "Astronomical Algorithms" ch. 29-30
 *   - NASA JPL "Keplerian Elements" tutorial
 */

import type { OrbitalElements } from '../types';

const DEG = Math.PI / 180;

/**
 * Solve Kepler's equation M = E - e*sin(E) for eccentric anomaly E.
 * Uses Newton-Raphson iteration; converges in ~5 steps for e < 0.9.
 */
export function solveKepler(meanAnomaly: number, eccentricity: number): number {
    const M = meanAnomaly * DEG;
    let E = M; // initial guess

    for (let i = 0; i < 100; i++) {
        const dE = (M - E + eccentricity * Math.sin(E)) / (1 - eccentricity * Math.cos(E));
        E += dE;
        if (Math.abs(dE) < 1e-10) break;
    }
    return E;
}

/**
 * Convert orbital elements to heliocentric ecliptic (x, y) in AU.
 * We project onto the ecliptic plane (z ignored for 2D map).
 */
export function orbitalElementsToXY(
    elements: OrbitalElements
): { x: number; y: number} {
    const { semiMajorAxis: a, eccentricity: e, argumentOfPerihelion, meanAnomaly } = elements;

    const E = solveKepler(meanAnomaly, e);

    // True anomaly v
    const sinV = (Math.sqrt(1 - e * e) * Math.sin(E)) / (1 - e * Math.cos(E));
    const cosV = (Math.cos(E) - e) / (1 - e * Math.cos(E));
    const nu = Math.atan2(sinV, cosV);
    
    // Distance from Sun (AU)
    const r = (a * (1 - e * e)) / (1 + e * Math.cos(nu));

    // Argument of perihelion in radians
    const omega = argumentOfPerihelion * DEG;

    // Project onto ecliptic plane (simplified: ignore inclination for 2D map)
    const x = r * Math.cos(nu + omega);
    const y = r * Math.sin(nu + omega);

    return { x, y };
}

/**
 * Generate a full orbital ellipse as an array of (x, y) points.
 * Used to draw the orbit path, not just the current position.
 */
export function generateOrbitPath(
    elements: OrbitalElements,
    steps = 180
): Array<{ x: number; y: number}> {
    const { semiMajorAxis: a, eccentricity: e, argumentOfPerihelion } = elements;
    const omega = argumentOfPerihelion * DEG;
    const points: Array<{ x: number; y: number }> = [];

    for (let i = 0; i <= steps; i++) {
        const nu = (i / steps) * 2 * Math.PI;
        const r = (a * (1 - e * e)) / (1 + e * Math.cos(nu));
        points.push({
            x: r * Math.cos(nu + omega),
            y: r * Math.sin(nu + omega),
        });
    }
    return points;
}

/**
 * Earth's approximate position for a given day-of-year.
 * Good enough for a visual reference ring.
 */
export function earthPositionForDate(date: Date): { x: number; y: number } {
    const start = new Date(date.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((date.getTime() - start.getTime()) / 86400000);
    const angle = (dayOfYear / 365.25) * 2 * Math.PI;
    return { x: Math.cos(angle), y: Math.sin(angle) };
}

/**
 * Scale AU coordinates to SVG pixels.
 * maxAU: the radius (in AU) that maps to the canvas edge.
 */
export function auToPixels(
    au: { x: number; y: number },
    svgSize: number,
    maxAU = 2.5
): { px: number; py: number} {
    const scale = (svgSize / 2) / maxAU;
    return {
        px: svgSize / 2 + au.x * scale,
        py: svgSize / 2 - au.y * scale, // flip y: SVG y grows downward
    };
}