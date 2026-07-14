import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import { llmLimiter, checkRateLimit } from './_ratelimit';

const ALLOWED_ORIGINS = [
    'https://cosmos-explorer-kappa.vercel.app',
    'https://localhost:5173',
    'https://localhost:3000',
];

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/complete';
const MODEL = 'claude-haiku-4-5-20251001';

function setCors(req: VercelRequest, res: VercelResponse) {
    const origin = req.headers.origin;
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Vary', 'Origin');
}

/** Only finite numbers survive */
function num(v: unknown): number | null {
    return typeof v === 'number' && isFinite(v) ? v : null;
}

/** Names are the only free text that is accepted. They are tightly bound */
function name(v: unknown): string | null {
    if (typeof v !== 'string') return null;
    const trimmed = v.trim().slice(0, 64);
    return /^[A-Za-z0-9 +\-*.'()']{1,64}$/.test(trimmed) ? trimmed : null;
}

interface Facts {
    planetName: string;
    hostName: string | null;
    radiusEarth: number | null;
    massEarth: number | null;
    orbitalPeriodDays: number | null;
    semiMajorAxisAU: number | null;
    equilibriumTempK: number | null;
    distancePc: number | null;
    discoveryYear: number | null;
    discoveryMethod: string | null;
    inHabitableZone: boolean;
    hostLikelihood: number | null;
    featureImportance: Record<string, number> | null;
}

function sanitize(body: unknown): Facts | null {
    if (typeof body !== 'object' || body === null) return null;
    const b = body as Record<string, unknown>;

    const planetName = name(b.planetName);
    if (!planetName) return null;

    let featureImportance: Record<string, number> | null = null;
    const ALLOWED_FEATURES = ['teff', 'radius', 'mass', 'metallicity', 'luminosity'];
    if (typeof b.featureImportance === 'object' && b.featureImportance !== null) {
        const src = b.featureImportance as Record<string, unknown>;
        const out: Record<string, number> = {};
        for (const k of ALLOWED_FEATURES) {
            const v = num(src[k]);
            if (v !== null) out[k] = v;
        }
        if (Object.keys(out).length > 0) featureImportance = out;
    }

    const hl = num(b.hostLikelihood);

    return {
        planetName,
        hostName: name(b.hostName),
        radiusEarth: num(b.radiusEarth),
        massEarth: num(b.massEarth),
        orbitalPeriodDays: num(b.orbitalPeriodDays),
        semiMajorAxisAU: num(b.semiMajorAxisAU),
        equilibriumTempK: num(b.equilibriumTempK),
        distancePc: num(b.distancePc),
        discoveryYear: num(b.discoveryYear),
        discoveryMethod: name(b.discoveryMethod),
        inHabitableZone: b.inHabitableZone === true,
        hostLikelihood: hl !== null && hl >= 0 && hl <= 1 ? hl : null,
        featureImportance,
    };
}

const SYSTEM_PROMPT = `You explain astronomical data to curious non-specialists inside an app called Cosmos Explorer.
 
You will receive a JSON object of measurements for one confirmed exoplanet, drawn from the NASA Exoplanet Archive, plus (sometimes) a machine-learning "host-likelihood" score for its host star.
 
Rules, in order of importance:
1. Use ONLY the numbers in the JSON. Never introduce a fact, name, mission, or figure that is not there. You have no other knowledge of this planet.
2. A null or missing field means the value is unknown. Say it is unknown, or stay silent about it. Never estimate, infer, or fill it in.
3. The host-likelihood score is NOT evidence about this planet. The planet is already confirmed to exist. The score only reflects how planet-hosting-typical the star's properties are, from a weak model (ROC-AUC about 0.70) trained on Gaia stellar parameters. Never phrase it as a probability that the planet exists, or that more planets are present. If the score is high or low, say what it means about the STAR being typical or unusual among known hosts, and note the model is weak.
4. Do not speculate about habitability, life, or colonisation. If the planet sits in the habitable zone, that is a statement about the orbital distance where liquid water could exist given the star's output — nothing more. Equilibrium temperature ignores atmosphere.
5. Be concrete. Compare to Earth, the Sun, or the Solar System where the JSON supports it (e.g. an orbital period of 3 days is far tighter than Mercury's 88).
 
Write 2 to 4 short paragraphs of plain prose. No headings, no bullet points, no markdown, no preamble. Do not restate the raw numbers as a list; interpret them.`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
    setCors(req, res);

    if (req.method === 'OPTIONS') return res.status(204).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'Interpretation service is not configured.' });

    const rl = await checkRateLimit(llmLimiter, req);
    res.setHeader('X-RateLimit-Limit', String(rl.limit));
    res.setHeader('X-RateLimit-Remaining', String(rl.remaining));
    if(!rl.ok) {
        return res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
    }

    const facts = sanitize(req.body);
    if (!facts) {
        return res.status(400).json({ error: 'Invalid request body. Please provide valid exoplanet data.' });
    }

    try {
        const { data } = await axios.post(
            ANTHROPIC_URL,
            {
                model: MODEL,
                max_tokens: 700,
                system: SYSTEM_PROMPT,
                messages: [{ role: 'user', content: JSON.stringify(facts) }],
            },
            {
                headers: {
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01',
                    'content-type': 'application/json',
                },
                timeout: 25000,
            },
        );

        const blocks = (data?.content ?? []) as Array<{ type: string; text?: string }>;
        const text = blocks
            .filter((b) => b.type === 'text' && typeof b.text === 'string')
            .map((b) => b.text as string)
            .join('\n')
            .trim();

        if (!text) return res.status(502).json({ error: 'Interpretation service returned no text.' });

        // Same planet + same score always yields the same reading.
        res.setHeader('Cache-Control', 's-maxage=86400');
        return res.status(200).json({ interpretation: text});
    } catch (err) {
        if (axios.isAxiosError(err)) {
            const status = err.response?.status ?? 502;
            return res.status(status === 429 ? 429 : 502).json({ 
                error: status === 429
                    ? 'The model service is busy. Please try again later.' 
                    : 'Sorry. Could not generate an interpretation. Please try again later.',
            });
        }
        return res.status(500).json({ error: 'Interpretation failed' });
    }
}