import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import { dataLimiter, checkRateLimit} from './_ratelimit';

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

// NASA NeoWs asteroid IDs are numeric (e.g. "3542519", "2000433").
const VALID_ID = /^\d{1,12}$/;

export default async function handler(req: VercelRequest, res: VercelResponse) {
    setCors(req, res);

    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
    const rl = await checkRateLimit(dataLimiter, req);
    res.setHeader('X-RateLimit-Limit', String(rl.limit));
    res.setHeader('X-RateLimit-Remaining', String(rl.remaining));
    if (!rl.ok) {
        return res.status(429).json({ error: 'Rate limit exceeded. Try again shortly.' });
    }

    const { id } = req.query;
    if (!id || typeof id !== 'string') return res.status(400).json({ error: 'id required' });

    if (!VALID_ID.test(id)) {
        return res.status(400).json({ error: 'Invalid asteroid id' });
    }

    const apiKey = process.env.NASA_API_KEY ?? 'DEMO_KEY';

    try {
        const { data } = await axios.get(
        `https://api.nasa.gov/neo/rest/v1/neo/${id}`,
        { params: { api_key: apiKey }, timeout: 8000 }
    );
        res.setHeader('Cache-Control', 's-maxage=86400');
        return res.status(200).json(data);
    } catch (err) {
        if (axios.isAxiosError(err)) {
        return res.status(err.response?.status ?? 502).json({ error: 'Upstream request failed' });
    }
        return res.status(500).json({ error: 'Proxy error' });
    }
}