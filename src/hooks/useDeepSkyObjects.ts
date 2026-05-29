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
        const url = `https://simbad.cds.unistra.fr/simbad/sim-tap/sync`;
        const query = `SELECT main_id, otype, ra, dec FROM basic JOIN ident ON oid=ident.oidref WHERE id='${identifier}'`;
        const { data } = await axios.get(url, {
            params: { REQUEST: 'doQuery', LANG: 'ADQL', FORMAT: 'json', QUERY: query },
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

async function fetchAllDSOs(): Promise<DeepSkyObject[]> {
    const results = await Promise.allSettled(DSO_IDENTIFIERS.map(fetchDSO));
    return results
        .filter((r): r is PromiseFulfilledResult<DeepSkyObject> => r.status === 'fulfilled' && r.value !== null)
        .map((r) => r.value);
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