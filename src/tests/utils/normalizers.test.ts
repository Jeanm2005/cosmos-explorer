import { describe, it, expect } from 'vitest';
import { normalizeAsteroid, formatDiameter, formatDistance } from '../../utils/normalizers';
import type { NeoWsObjectRaw } from '../../types';

const rawAsteroid: NeoWsObjectRaw = {
    id: '3542519',
    name: '(2010 PK9)',
    designation: '2010 PK9',
    absolute_magnitude_h: 22.1,
    estimated_diameter: {
        meters: { estimated_diameter_min: 97.3, estimated_diameter_max: 217.5 },
    },
    is_potentially_hazardous_asteroid: false,
    close_approach_data: [
        {
            close_approach_date: '2025-01-10',
            miss_distance: { astronomical: '0.0423', lunar: '16.45' },
            relative_velocity: { kilometers_per_second: '14.32' },
        },
    ],
    orbital_data: {
        semi_major_axis: '1.452',
        eccentricity: '0.312',
        inclination: '4.78',
        ascending_node_longitude: '167.3',
        perihelion_argument: '201.4',
        mean_anomaly: '88.6',
    },
};

describe('normalizeAsteroid', () => {
    it('strips parentheses from name', () => {
        expect(normalizeAsteroid(rawAsteroid).name).toBe('2010 PK9');
    });
    it('parses orbital elements as numbers', () => {
        const a = normalizeAsteroid(rawAsteroid);
        expect(a.orbitalElements.semiMajorAxis).toBeCloseTo(1.452);
    });
    it('parses close approach data correctly', () => {
        const a = normalizeAsteroid(rawAsteroid);
        expect(a.closeApproaches[0].distanceAU).toBeCloseTo(0.0423);
    });
    it('uses fallback orbital elements when orbital_data is missing', () => {
        const a = normalizeAsteroid({ ...rawAsteroid, orbital_data: undefined });
        expect(a.orbitalElements.semiMajorAxis).toBeGreaterThan(0);
    });
});

describe('formatDiameter', () => {
    it('formats meters', () => { expect(formatDiameter(100, 200)).toBe('150 m'); });
    it('formats km for large asteroids', () => { expect(formatDiameter(1500, 2500)).toBe('2.0 km'); });
});

describe('formatDistance', () => {
    it('formats AU', () => { expect(formatDistance(0.05)).toBe('0.0500 AU'); });
    it('formats km for very close approaches', () => { expect(formatDistance(0.001)).toContain('km'); });
});