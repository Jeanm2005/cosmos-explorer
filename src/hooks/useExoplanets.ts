import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export interface Exoplanet {
    id: string;
    name: string;
    hostStar: string;
    discoveryYear: number;
    discoveryMethod: string;
    orbitalPeriod: number | null; // days
    semiMajorAxis: number | null; // AU
    radius: number | null; // Earth radii
    mass: number | null; // Earth masses
    equilibriumTemp: number | null; //Kelvin
    distanceFromEarth: number | null; // parsecs
    isInHabitableZone: boolean;
}

interface NasaExoplanetRow {
    pl_name: string;
    hostname: string;
    disc_year: string;
    discoverymethod: string;
    pl_orbper: string;
    pl_orbsmax: string;
    pl_rade: string;
    pl_bmasse: string;
    pl_eqt: string;
    sy_dist: string;
}

function isInHabitableZone(semiMajorAxis: number | null, starTemp = 5778): boolean {
    if (!semiMajorAxis) return false;
    const inner = Math.sqrt(starTemp / 7200);
    const outer = Math.sqrt(starTemp / 2500);
    return semiMajorAxis >= inner && semiMajorAxis <= outer;
}

function normalizeExoplanet(row: NasaExoplanetRow, index: number): Exoplanet {
    const sma = parseFloat(row.pl_orbsmax) || null;
    return {
        id: `exo-${index}`,
        name: row.pl_name,
        hostStar: row.hostname,
        discoveryYear: parseInt(row.disc_year) || 0,
        discoveryMethod: row.discoverymethod,
        orbitalPeriod: parseFloat(row.pl_orbper) || null,
        semiMajorAxis: sma,
        radius: parseFloat(row.pl_rade) || null,
        mass: parseFloat(row.pl_bmasse) || null,
        equilibriumTemp: parseFloat(row.pl_eqt) || null,
        distanceFromEarth: parseFloat(row.sy_dist) || null,
        isInHabitableZone: isInHabitableZone(sma),
    };
}

async function fetchExoplanets(): Promise<Exoplanet[]> {
    const { data } = await axios.get<NasaExoplanetRow[]>('/api/exoplanets', {
        timeout: 20000,
    });
    return data.map(normalizeExoplanet);
}

export function useExoplanets() {
    return useQuery({
        queryKey: ['exoplanets'],
        queryFn: fetchExoplanets,
        staleTime: 1000 * 60 * 60,
        gcTime: 1000 * 60 * 60 * 2,
        retry: 2,
    });
}