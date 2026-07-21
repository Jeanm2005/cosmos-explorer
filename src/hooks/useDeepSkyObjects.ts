import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export type DSOType = 'galaxy' | 'nebula' | 'pulsar' | 'quasar' | 'black_hole' | 'cluster' | 'other';

export interface DeepSkyObject {
    id: string;
    name: string;
    type: DSOType;
    typeLabel: string;
    ra: number;
    dec: number;
    magnitude: number | null;
    distance: string | null;
    redshift: number | null;
    description: string;
}

// SIMBAD object type codes → our DSOType
const TYPE_MAP: Record<string, DSOType> = {
    'G': 'galaxy', 'GiG': 'galaxy', 'GiC': 'galaxy', 'BiC': 'galaxy',
    'PN': 'nebula', 'SNR': 'nebula', 'HII': 'nebula', 'MoC': 'nebula', 'DNe': 'nebula',
    'Psr': 'pulsar',
    'QSO': 'quasar', 'AGN': 'quasar', 'Sy1': 'quasar', 'Sy2': 'quasar',
    'BH': 'black_hole',
    'GlC': 'cluster', 'OpC': 'cluster',
};

const TYPE_LABELS: Record<DSOType, string> = {
    galaxy: 'Galaxy',
    nebula: 'Nebula',
    pulsar: 'Pulsar',
    quasar: 'Quasar',
    black_hole: 'Black Hole',
    cluster: 'Star cluster',
    other: 'Other',
};

// Curated list of famous DSOs with known SIMBAD identifiers
const DSO_IDENTIFIERS = [
    'M1', 'M8', 'M13', 'M16', 'M17', 'M20', 'M27', 'M31', 'M32', 'M33',
    'M42', 'M43', 'M51', 'M57', 'M63', 'M64', 'M74', 'M77', 'M81', 'M82',
    'M87', 'M97', 'M101', 'M104', 'NGC 1052', 'NGC 1275', 'NGC 4889',
    'Crab Pulsar', '3C 273', 'Sgr A*', 'Cygnus X-1',
];

async function fetchDSO(identifier: string): Promise<DeepSkyObject | null> {
    try {
        const { data } = await axios.get('/api/simbad', {
            params: { id: identifier },
            timeout: 8000,
        });

        const row = data?.data?.[0];
        if (!row) return null;

        const [name, otype, ra, dec] = row;
        const dsoType = TYPE_MAP[otype] ?? 'other';

        return {
            id: identifier,
            name: name ?? identifier,
            type: dsoType,
            typeLabel: TYPE_LABELS[dsoType],
            ra: parseFloat(ra) || 0,
            dec: parseFloat(dec) || 0,
            magnitude: null,
            distance: null,
            redshift: null,
            description: '',
        };
    } catch {
        return null;
    }
}

// Run workers over `items` with bounded concurrency so we don't fire all ~31
// SIMBAD lookups at once (which bursts past the proxy rate limit and can time
// out the upstream). fetchDSO never throws — it resolves to null on failure.
async function fetchWithConcurrency(
    items: string[],
    worker: (item: string) => Promise<DeepSkyObject | null>,
    concurrency = 5,
): Promise<(DeepSkyObject | null)[]> {
    const results: (DeepSkyObject | null)[] = new Array(items.length).fill(null);
    let cursor = 0;
    async function runner() {
        while (cursor < items.length) {
            const i = cursor++;
            results[i] = await worker(items[i]);
        }
    }
    await Promise.all(
        Array.from({ length: Math.min(concurrency, items.length) }, runner),
    );
    return results;
}

async function fetchAllDSOs(): Promise<DeepSkyObject[]> {
    const results = await fetchWithConcurrency(DSO_IDENTIFIERS, fetchDSO, 5);
    return results.filter((v): v is DeepSkyObject => v !== null);
}

export function useDeepSkyObjects() {
    return useQuery({
        queryKey: ['dso'],
        queryFn: fetchAllDSOs,
        staleTime: 1000 * 60 * 60 * 24,
        gcTime: 1000 * 60 * 60 * 24,
        retry: 1,
    });
}