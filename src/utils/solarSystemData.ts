import type { OrbitalElements } from '../types';

export interface OrbitingBody {
    id: string;
    name: string;
    kind: 'planet' | 'comet';
    color: string;
    radiusPx: number;
    elements: OrbitalElements;
    periodDays: number;
}

// J2000 orbital elements. a in AU, angles in degrees.
export const PLANETS: OrbitingBody[] = [
    { id: 'mercury', name: 'Mercury', kind: 'planet', color: '#b1adad', radiusPx: 3, periodDays: 87.97,
        elements: { semiMajorAxis: 0.38710, eccentricity: 0.20563, inclination: 7.005, longitudeAscendingNode: 48.331, argumentOfPerihelion: 29.124, meanAnomaly: 174.796 } },
    { id: 'venus', name: 'Venus', kind: 'planet', color: '#e8cda2', radiusPx: 5, periodDays: 224.70,
        elements: { semiMajorAxis: 0.72333, eccentricity: 0.00677, inclination: 3.395, longitudeAscendingNode: 76.680, argumentOfPerihelion: 54.884, meanAnomaly: 50.115 } },
    { id: 'earth', name: 'Earth', kind: 'planet', color: '#4fc3f7', radiusPx: 5, periodDays: 365.25,
        elements: { semiMajorAxis: 1.00000, eccentricity: 0.01671, inclination: 0.000, longitudeAscendingNode: -11.260, argumentOfPerihelion: 114.208, meanAnomaly: 357.529 } },
    { id: 'mars', name: 'Mars', kind: 'planet', color: '#e27b58', radiusPx: 4, periodDays: 686.98,
        elements: { semiMajorAxis: 1.52371, eccentricity: 0.09340, inclination: 1.850, longitudeAscendingNode: 49.558, argumentOfPerihelion: 286.502, meanAnomaly: 19.373 } },
    { id: 'jupiter', name: 'Jupiter', kind: 'planet', color: '#d8ca9d', radiusPx: 9, periodDays: 4332.59,
        elements: { semiMajorAxis: 5.20288, eccentricity: 0.04839, inclination: 1.304, longitudeAscendingNode: 100.464, argumentOfPerihelion: 273.867, meanAnomaly: 20.020 } },
    { id: 'saturn', name: 'Saturn', kind: 'planet', color: '#e3d9b0', radiusPx: 8, periodDays: 10759.22,
        elements: { semiMajorAxis: 9.53667, eccentricity: 0.05386, inclination: 2.486, longitudeAscendingNode: 113.666, argumentOfPerihelion: 339.392, meanAnomaly: 317.020 } },
    { id: 'uranus', name: 'Uranus', kind: 'planet', color: '#b5e3e3', radiusPx: 7, periodDays: 30688.5,
        elements: { semiMajorAxis: 19.18916, eccentricity: 0.04726, inclination: 0.773, longitudeAscendingNode: 74.006, argumentOfPerihelion: 96.999, meanAnomaly: 142.239 } },
    { id: 'neptune', name: 'Neptune', kind: 'planet', color: '#5b8fdd', radiusPx: 7, periodDays: 60182,
        elements: { semiMajorAxis: 30.06992, eccentricity: 0.00859, inclination: 1.770, longitudeAscendingNode: 131.784, argumentOfPerihelion: 276.336, meanAnomaly: 256.228 } },
];

export const COMETS: OrbitingBody[] = [
    { id: 'halley', name: "1P/Halley", kind: 'comet', color: '#7fffd4', radiusPx: 3, periodDays: 27759,
        elements: { semiMajorAxis: 17.834, eccentricity: 0.96714, inclination: 162.26, longitudeAscendingNode: 58.42, argumentOfPerihelion: 111.33, meanAnomaly: 38.38 } },
    { id: 'encke', name: "2P/Encke", kind: 'comet', color: '#9affd4', radiusPx: 3, periodDays: 1204,
        elements: { semiMajorAxis: 2.2152, eccentricity: 0.84833, inclination: 11.78, longitudeAscendingNode: 334.57, argumentOfPerihelion: 186.55, meanAnomaly: 100.0 } },
];

export const SOLAR_SYSTEM_BODIES: OrbitingBody[] = [...PLANETS, ...COMETS];