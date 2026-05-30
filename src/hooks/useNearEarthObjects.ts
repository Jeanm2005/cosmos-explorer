import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import type { Asteroid, DateRange, NeoWsFeedResponse, NeoWsObjectRaw } from '../types';
import { normalizeAsteroid } from '../utils/normalizers';

function feedUrl(dateRange: DateRange): string {
    if (import.meta.env.DEV) {
        const key = import.meta.env.VITE_NASA_API_KEY ?? 'DEMO_KEY';
        return `https://api.nasa.gov/neo/rest/v1/feed?start_date=${dateRange.start}&end_date=${dateRange.end}&api_key=${key}`;
    }
    return `/api/neo?start=${dateRange.start}&end=${dateRange.end}`;
}

function detailUrl(id: string): string {
    if (import.meta.env.DEV) {
        const key = import.meta.env.VITE_NASA_API_KEY ?? 'DEMO_KEY';
        return `https://api.nasa.gov/neo/rest/v1/neo/${id}?api_key=${key}`;
    }
    return `/api/neo-detail?id=${id}`;
}

async function fetchNearEarthObjects(dateRange: DateRange): Promise<Asteroid[]> {
    // Fetch the feed to get the list
    const { data } = await axios.get<NeoWsFeedResponse>(feedUrl(dateRange));
    const rawList: NeoWsObjectRaw[] = Object.values(data.near_earth_objects).flat();

    // Fetch orbital details for each asteroid (cap at 20 to avoid rate limits)
    const capped = rawList.slice(0, 20);
    const detailed = await Promise.allSettled(
        capped.map((raw) =>
            axios.get<NeoWsObjectRaw>(detailUrl(raw.id)).then((r) => r.data).catch(() => raw)
        )
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