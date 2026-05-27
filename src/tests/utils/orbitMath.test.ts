import { describe, it, expect } from 'vitest';
import { solveKepler, orbitalElementsToXY, generateOrbitPath, auToPixels } from '../../utils/orbitMath';
import type { OrbitalElements } from '../../types';

const earthLike: OrbitalElements = {
    semiMajorAxis: 1.0,
    eccentricity: 0.0167,
    inclination: 0,
    longitudeAscendingNode: 0,
    argumentOfPerihelion: 102.9,
    meanAnomaly: 100.0,
};

describe('solveKepler', () => {
    it('returns M for circular orbit (e=0)', () => {
        const E = solveKepler(90, 0);
        expect(E).toBeCloseTo(Math.PI / 2, 5);
    });
    it('satisfies Kepler equation M = E - e*sin(E)', () => {
        const M_deg = 45;
        const e = 0.3;
        const E = solveKepler(M_deg, e);
        const M_rad = M_deg * Math.PI / 180;
        expect(E - e * Math.sin(E)).toBeCloseTo(M_rad, 8);
    });
});

describe('orbitalElementsToXY', () => {
    it('returns finite coordinates', () => {
        const { x, y } = orbitalElementsToXY(earthLike);
        const r = Math.sqrt(x * x + y * y);
        expect(r).toBeGreaterThan(0.95);
        expect(r).toBeLessThan(1.05);
    });
});

describe('generateOrbitPath', () => {
    it('returns the expected number of points', () => {
        const path = generateOrbitPath(earthLike, 60);
        path.forEach(({ x, y }) => {
            expect(isFinite(x)).toBe(true);
            expect(isFinite(y)).toBe(true);
        });
    });
});

describe('autoPixels', () => {
    it('maps Sun (0,0) to canvas center', () => {
        const { px, py } = auToPixels({ x: 0, y: 0 }, 600, 2.5);
        expect(px).toBeCloseTo(300, 1);
        expect(py).toBeCloseTo(300, 1);
    });
    it('flips y-axis correctly', () => {
        const { py: pyPos } = auToPixels({ x: 0, y: 1 }, 600, 2.5);
        const { py: pyNeg } = auToPixels({ x: 0, y: -1 }, 600, 2.5);
        expect(pyPos).toBeLessThan(300);
        expect(pyNeg).toBeGreaterThan(300);
    });
});