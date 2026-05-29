import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const query = `SELECT pl_name,hostname,disc_year,discoverymethod,pl_orbper,pl_orbsmax,pl_rade,pl_bmasse,pl_eqt,sy_dist FROM ps WHERE default_flag=1 AND pl_rade IS NOT NULL ORDER BY disc_year DESC`;

    try {
        const { data } = await axios.get('https://exoplanetarchive.ipac.caltech.edu/TAP/sync', {
            params: { query, format: 'json' },
            timeout: 20000,
        });
        res.setHeader('Cache-Control', 's-maxage=3600');
        return res.status(200).json(data);
    } catch (err) {
        if (axios.isAxiosError(err)) return res.status(err.response?.status ?? 500).json({ error: err.message });
        return res.status(500).json({ error: 'Proxy error' });
    }
}