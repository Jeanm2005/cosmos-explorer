import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import { dataLimiter, checkRateLimit } from './_ratelimit';

const NASA_BASE = 'https://api.nasa.gov/neo/rest/v1/feed';

const ALLOWED_ORIGINS = [
    'https://cosmos-explorer-kappa.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000',
];

function setCors(req: VercelRequest, res: VercelResponse) {
    const origin = req.headers.origin;
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Vary', 'Origin');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    setCors(req, res);

    const rl = await checkRateLimit(dataLimiter, req);
    res.setHeader('X-RateLimit-Limit', String(rl.limit));
    res.setHeader('X-RateLimit-Remaining', String(rl.remaining));
    if (!rl.ok) {
        return res.status(429).json({ error: 'Rate limit exceeded. Try again shortly.' });
    }

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
            const status = err.response?.status ?? 502;
            return res.status(status).json({ error: 'Upstream request failed' });
        }
        return res.status(500).json({ error: 'Unexpected proxy error' });
    }
}