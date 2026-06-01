import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface NASAImageResult {
    url: string;
    title: string;
    description: string;
}

async function fetchNASAImage(query: string): Promise<NASAImageResult | null> {
    const { data } = await axios.get('https://images-api.nasa.gov/search', {
        params: { q: query, media_type: 'image', page_size: 5},
        timeout: 8000,
    });

    const items = data?.collection?.items;
    if (!items?.length) return null;

    // Pick first item that has a usable image link
    for (const item of items) {
        const links = item.links;
        const meta = item.data?.[0];
        // Prefer ~orig or ~large, fall back to ~small
        const imageLink = links?.find((l: any) => l.href?.includes('~orig') || l.href?.includes('~large'))
            ?? links?.find((l: any) => l.href?.includes('.jpg') || l.href?.includes('.png'));

        if (imageLink?.href) {
            return {
                url: imageLink.href,
                title: meta?.title ?? query,
                description: meta?.description ?? '',
            };
        }
    }
    return null;
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