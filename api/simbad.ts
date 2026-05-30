import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const { id } = req.query;
    if (!id || typeof id !== 'string') return res.status(400).json({ error: 'id required' });

    try {
        const { data } = await axios.get('https://simbad.cds.unistra.fr/simbad/sim-tap/sync', {
            params: {
                REQUEST: 'doQuery',
                LANG: 'ADQL',
                FORMAT: 'json',
                QUERY: `SELECT main_id, otype, ra, dec FROM basic JOIN ident ON oid=ident.oidref WHERE id='${id}'`,
            },
            timeout: 8000,
        });
        res.setHeader('Cache-Control', 's-maxage=86400');
        return res.status(200).json(data);
    } catch (err) {
        if (axios.isAxiosError(err)) return res.status(err.response?.status ?? 500).json({ error: err.message });
        return res.status(500).json({ error: 'Proxy error' });
    }
}