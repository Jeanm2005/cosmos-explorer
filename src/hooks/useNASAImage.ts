import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface NASAImageResult {
    url: string;
    title: string;
    description: string;
}

async function fetchNASAImage(query: string): Promise<NASAImageResult | null> {
    const { data } = await axios.get('https://images-api.nasa.gov/search', {
        params: { q: query, media_type: 'image', page_size: 1},
        timeout: 8000,
    });

    const item = data?.collection?.items?.[0];
    if (!item) return null;

    const links = item.links;
    const meta = item.data?.[0];
    if (!links?.[0]?.href) return null;

    return {
        url: links[0].href,
        title: meta?.title ?? query,
        description: meta?.description ?? '',
    };
}

export function useNASAImage(query: string, enabled = true) {
    return useQuery({
        queryKey: ['nasa-image', query],
        queryFn: () => fetchNASAImage(query),
        staleTime: 1000 * 60 * 60 * 24,
        gcTime: 1000 * 60 * 60 * 24,
        retry: 1,
        enabled: enabled && Boolean(query),
    });
}