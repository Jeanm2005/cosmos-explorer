import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

const NASA_BASE = 'https://api.nasa.gov/neo/rest/v1/feed';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { start, end } = req.query;

    if (!start || !end || typeof start !== 'string' || typeof end !== 'string') {
        return res.status(400).json({ error: 'start and end query params required' });
    }

    const apiKey = process.env.NASA_API_KEY ?? 'DEMO_KEY';

    try {
        const upstream = await axios.get(NASA_BASE, {
            params: { start_date: start, end_date: end, api_key: apiKey },
            timeout: 10000,
        });
        res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=60');
        return res.status(200).json(upstream.data);
    } catch (err) {
        if (axios.isAxiosError(err)) {
            const status = err.response?.status ?? 500;
            const message = err.response?.data?.error_message ?? err.message;
            return res.status(status).json({ error: message });
        }
        return res.status(500).json({ error: 'Unexpected proxy error' });
    }
}