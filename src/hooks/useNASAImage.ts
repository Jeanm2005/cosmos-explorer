import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface NASAImageResult {
    url: string;
    title: string;
    description: string;
}

async function searchNASA(query: string): Promise<NASAImageResult | null> {
    const { data } = await axios.get('https://images-api.nasa.gov/search', {
        params: { q: query, media_type: 'image', page_size: 5},
        timeout: 8000,
    });

    const items = data?.collections?.items;
    if (!items?.length) return null;

    for (const item of items) {
        const links = item.links as Array<{ href: string }>;
        const meta = item.data?.[0];
        if (!links?.length) continue;

        const best = 
            links.find(l => l.href?.includes('~large.jpg')) ??
            links.find(l => l.href?.includes('~medium.jpg')) ??
            links.find(l => l.href?.includes('~small.jpg')) ??
            links.find(l => l.href?.endsWith('.jpg') || l.href?.endsWith('.png'));

        if (best?.href) {
            return {
                url: best.href,
                title: meta?.title ?? query,
                description: meta?.description?.slice(0, 200) ?? '',
            };
        }
    }
    return null;
}

async function fetchNASAImage(primaryQuery: string, fallbackQuery?: string): Promise<NASAImageResult | null> {
    const result = await searchNASA(primaryQuery);
    if (result) return result;
    if (fallbackQuery) return searchNASA(fallbackQuery);
    return null;
}

export function useNASAImage(primaryQuery: string, fallbackQuery?: string, enabled = true) {
    return useQuery({
        queryKey: ['nasa-image', primaryQuery, fallbackQuery],
        queryFn: () => fetchNASAImage(primaryQuery, fallbackQuery),
        staleTime: 1000 * 60 * 60 * 24,
        gcTime: 1000 * 60 * 60 * 24,
        retry: 1,
        enabled: enabled && Boolean(primaryQuery),
    });
}