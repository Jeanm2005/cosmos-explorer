import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

const ALLOWED_ORIGINS = [
    'https://cosmos-explorer-kappa.vercel.app',
    'https://localhost:5173',
    'https://localhost:3000',
];

const VALID_ID = /^[A-Za-z0-9 +\-*.]{1,32}$/;

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

    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const { id } = req.query;
    if (!id || typeof id !== 'string') return res.status(400).json({ error: 'id required' });

    // Reject anything that isn't a plausible catalog identifier before building the query.
    if (!VALID_ID.test(id)) {
        return res.status(400).json({ error: 'Invalid identifier format' });
    }

    const safeId = id.replace(/'/g, "''");

    try {
        const { data } = await axios.get('https://simbad.cds.unistra.fr/simbad/sim-tap/sync', {
            params: {
                REQUEST: 'doQuery',
                LANG: 'ADQL',
                FORMAT: 'json',
                QUERY: `SELECT main_id, otype, ra, dec FROM basic JOIN ident ON oid=ident.oidref WHERE id='${safeId}'`,
            },
            timeout: 8000,
        });
        res.setHeader('Cache-Control', 's-maxage=86400');
        return res.status(200).json(data);
    } catch (err) {
        // Error hygiene
        if (axios.isAxiosError(err)) {
            return res.status(err.response?.status ?? 502).json({ error: 'Upstream query failed' });
        }
        return res.status(500).json({ error: 'Proxy error' });
    }
}