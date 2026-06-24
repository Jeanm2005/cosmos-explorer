import curated from '../data/curated_stars.json';
import type { StarParams } from '../hooks/useHostLikelihood';

interface CuratedStar extends StarParams {
    name: string;
}

const stars = curated as CuratedStar[];

const byName = new Map<string, StarParams>();
for (const s of stars) {
    byName.set(s.name.trim().toLowerCase(), {
        teff: s.teff, radius: s.radius, mass: s.mass,
        metallicity: s.metallicity, luminosity: s.luminosity,
    });
}

export function findHostParams(hostName: string): StarParams | null {
    if (!hostName) return null;
    return byName.get(hostName.trim().toLowerCase()) ?? null;
}

export const curatedStarList = stars;