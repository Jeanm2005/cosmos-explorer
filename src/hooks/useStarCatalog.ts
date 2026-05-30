import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import type { Star } from '../types';

export interface StarQueryParams {
    ra: number; // right ascension, degrees
    dec: number; // declination, degrees
    radius: number; // search radius, degrees
    limit: number; // max stars to return
}

// Default: center on Orion nebula region
export const DEFAULT_STAR_QUERY: StarQueryParams = {
    ra: 83.8221,
    dec: -5.3911,
    radius: 2.0,
    limit: 500,
};

async function fetchStars(params: StarQueryParams): Promise<Star[]> {
    const tsvUrl = `https://vizier.cds.unistra.fr/viz-bin/asu-tsv?-source=I/239/hip_main&-c=${params.ra}+${params.dec}&-c.rd=${params.radius}&-out=HIP,RAhms,DEdms,Vmag,B-V&-out.max=${params.limit}`;
    const { data } = await axios.get<string>(tsvUrl, { timeout: 15000 });
    return parseTSV(data);
}

function parseTSV(raw: string): Star[] {
    const lines = raw.split('\n').filter((l) => l.trim() && !l.startsWith('#') && !l.startsWith('-'));
    const stars: Star[] = [];

    // Find header line
    const headerIdx = lines.findIndex((l) => l.includes('HIP'));
    if (headerIdx === -1) return [];

    const headers = lines[headerIdx].split('\t').map((h) => h.trim());
    const hipIdx = headers.indexOf('HIP');
    const raIdx = headers.findIndex((h) => h.includes('RA') || h.includes('RAhms'));
    const decIdx = headers.findIndex((h) => h.includes('DE') || h.includes('DEdms'));
    const magIdx = headers.findIndex((h) => h.includes('Vmag'));
    const bvIdx = headers.findIndex((h) => h.includes('B-V'));

    for (const line of lines.slice(headerIdx + 1)) {
        const cols = line.split('\t').map((c) => c.trim());
        if (cols.length < 4) continue;

        const mag = parseFloat(cols[magIdx]);
        if (isNaN(mag)) continue;

        // Parse RA from HH MM SS.s format to degrees
        const raRaw = cols[raIdx] ?? '';
        const decRaw = cols[decIdx] ?? '';
        const ra = hmsToDecimal(raRaw) * 15; // hours to degrees
        const dec = dmsToDecimal(decRaw);

        if (isNaN(ra) || isNaN(dec)) continue;

        stars.push({
            id: `HIP${cols[hipIdx] ?? stars.length}`,
            ra,
            dec,
            magnitude: mag,
            colorIndex: parseFloat(cols[bvIdx]) || undefined,
        });
    }
    return stars;
}

function hmsToDecimal(hms: string): number {
    const parts = hms.trim().split(/\s+/);
    if (parts.length < 3) return NaN;
    const [h, m, s] = parts.map(Number);
    return h + m / 60 + s / 3600;
}

function dmsToDecimal(dms: string): number {
    const parts = dms.trim().split(/\s+/);
    if (parts.length < 3) return NaN;
    const sign = parts[0].startsWith('-') ? -1 : 1;
    const [d, m, s] = [Math.abs(Number(parts[0])), Number(parts[1]), Number(parts[2])];
    return sign * (d + m / 60 + s / 3600);
}

export function useStarCatalog(params: StarQueryParams) {
    return useQuery({
        queryKey: ['stars', params.ra, params.dec, params.radius, params.limit],
        queryFn: () => fetchStars(params),
        staleTime: 1000 * 60 * 30,
        gcTime: 1000 * 60 * 60,
        retry: 2,
    });
}