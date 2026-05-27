import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import type { Asteroid, DateRange, NeoWsFeedResponse } from '../types';
import { normalizeAsteroid } from '../utils/normalizers';

const IS_DEV = import.meta.env.DEV;
const NASA_DEMO_KEY = 'DEMO_KEY';

function buildUrl(dateRange: DateRange): string {
    if (IS_DEV) {
        return `https://api.nasa.gov/neo/rest/v1/feed?start_date=${dateRange.start}&end_date=${dateRange.end}&api_key=${NASA_DEMO_KEY}`;
    }
    return `/api/neo?start=${dateRange.start}&end=${dateRange.end}`;
}

async function fetchNearEarthObjects(dateRange: DateRange): Promise<Asteroid[]> {
    const url = buildUrl(dateRange);
    const { data } = await axios.get<NeoWsFeedResponse>(url);
    const allObjects = Object.values(data.near_earth_objects).flat();
    return allObjects.map(normalizeAsteroid);
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