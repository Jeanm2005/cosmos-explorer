import type { Asteroid, NeoWsObjectRaw, OrbitalElements } from '../types';

export function normalizeAsteroid(raw: NeoWsObjectRaw): Asteroid {
    const od = raw.orbital_data;
    const orbitalElements: OrbitalElements = od
        ? {
            semiMajorAxis: parseFloat(od.semi_major_axis),
            eccentricity: parseFloat(od.eccentricity),
            inclination: parseFloat(od.inclination),
            longitudeAscendingNode: parseFloat(od.ascending_node_longitude),
            argumentOfPerihelion: parseFloat(od.perihelion_argument),
            meanAnomaly: parseFloat(od.mean_anomaly),
            }
        : fallbackOrbit(raw);

    return {
        id: raw.id,
        name: raw.name.replace(/[()]/g, '').trim(),
        designation: raw.designation,
        diameterMin: raw.estimated_diameter.meters.estimated_diameter_min,
        diameterMax: raw.estimated_diameter.meters.estimated_diameter_max,
        isPotentiallyHazardous: raw.is_potentially_hazardous_asteroid,
        absoluteMagnitude: raw.absolute_magnitude_h,
        orbitalElements,
        closeApproaches: raw.close_approach_data.map((ca) => ({
            date: ca.close_approach_date,
            distanceAU: parseFloat(ca.miss_distance.astronomical),
            distanceLD: parseFloat(ca.miss_distance.lunar),
            relativeVelocityKmS: parseFloat(ca.relative_velocity.kilometers_per_second),
        })),
    };
}

export function formatDiameter(min: number, max: number): string {
    const avg = (min + max) / 2;
    if (avg >= 1000) return `${(avg / 1000).toFixed(1)} km`;
    return `${Math.round(avg)} m`;
}

export function formatDistance(au: number): string {
    if (au < 0.01) return `${(au * 149597871).toFixed(0)} km`;
    return `${au.toFixed(4)} AU`;
}

// Deterministic pseudo-random from a string
function hashToUnit(str: string): number {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
    return (Math.abs(h) % 10000) / 10000; // 0..1
}

function fallbackOrbit(raw: NeoWsObjectRaw): OrbitalElements {
    const seed = hashToUnit(raw.id);
    const seed2 = hashToUnit(raw.id + 'x');
    // Near-Earth asteroids mostly sit 0.8-2.5 AU with modest eccentricity
    const ca = raw.close_approach_data?.[0];
    const approachAU = ca ? parseFloat(ca.miss_distance.astronomical) : 0;
    return {
        semiMajorAxis: 0.9 + seed * 1.6,
        eccentricity: 0.05 + seed2 * 0.35,
        inclination: seed * 25,
        longitudeAscendingNode: seed * 360,
        argumentOfPerihelion: seed2 * 360,
        meanAnomaly: (seed + seed2 + approachAU) * 360 % 360, // scatter starting position
    };
}