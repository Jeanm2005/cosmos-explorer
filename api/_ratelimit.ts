import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import type { VercelRequest } from '@vercel/node';

const redis = Redis.fromEnv();

export const dataLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, '60 s'),
    prefix: 'rl:data',
    analytics: true,
});

export function clientIp(req: VercelRequest): string {
    const fwd = req.headers['x-forwarded-for'];
    if (typeof fwd === 'string') return fwd.split(',')[0].trim();
    if (Array.isArray(fwd)) return fwd[0];
    return 'anonymous';
}

export async function checkRateLimit(limiter: Ratelimit, req: VercelRequest) {
    const ip = clientIp(req);
    try {
        const { success, limit, remaining } = await limiter.limit(ip);
        return { ok: success, limit, remaining};
    } catch (err) {
        return { ok: true, limit: 0, remaining: 0 };
    }
}