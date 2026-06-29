import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import type { Asteroid, DateRange, NeoWsFeedResponse, NeoWsObjectRaw } from '../types';
import { normalizeAsteroid } from '../utils/normalizers';

function feedUrl(dateRange: DateRange): string {
    return `/api/neo?start=${dateRange.start}&end=${dateRange.end}`;
}

async function fetchNearEarthObjects(dateRange: DateRange): Promise<Asteroid[]> {
    const { data } = await axios.get<NeoWsFeedResponse>(feedUrl(dateRange));
    const rawList: NeoWsObjectRaw[] = Object.values(data.near_earth_objects).flat();
    const capped = rawList.slice(0, 10);
    const detailed = await Promise.allSettled(
        capped.map((raw, i) => {
            const jplId = raw.neo_reference_id ?? raw.id;
            const url = `/api/neo-detail?id=${jplId}`;
            return new Promise<NeoWsObjectRaw>((resolve) =>
                setTimeout(() => {
                    axios.get<NeoWsObjectRaw>(url).then((r) => resolve(r.data)).catch(() => resolve(raw));
                }, i * 300)
            );
        })
    );

    return detailed.map((result, i) => {
        const raw = result.status === 'fulfilled' ? result.value : capped[i];
        return normalizeAsteroid(raw);
    });
}

export function useNearEarthObjects(dateRange: DateRange) {
    return useQuery({
        queryKey: ['neo', dateRange.start, dateRange.end],
        queryFn: () => fetchNearEarthObjects(dateRange),
        staleTime: 1000 * 60 * 10,
        gcTime: 1000 * 60 * 30,
        retry: 2,
        enabled: Boolean(dateRange.start && dateRange.end),
    });
}

export function getDefaultDateRange(): DateRange {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - 2);
    const end = new Date(now);
    end.setDate(now.getDate() + 5);
    return {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0],
    };
}