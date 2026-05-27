import type { Asteroid, NeoWsObjectRaw, OrbitalElements } from '../types';

const DEFAULT_ORBITAL: OrbitalElements = {
    semiMajorAxis: 1.5,
    eccentricity: 0.2,
    inclination: 5,
    longitudeAscendingNode: 0,
    argumentOfPerihelion: 0,
    meanAnomaly: 0,
};

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
        : DEFAULT_ORBITAL;

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