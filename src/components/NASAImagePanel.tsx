import { useNASAImage } from '../hooks/useNASAImage';

const MONO = "'JetBrains Mono', ui-monospace, monospace";

interface Props {
    query: string;
    fallback?: string;
    objectType?: string;
    discoveryYear?: number;
}

export default function NASAImagePanel({ query, fallback, objectType = 'object', discoveryYear }: Props) {
    const { data, isLoading } = useNASAImage(query, fallback);

    if (isLoading) {
        return (
            <div style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: 8, marginTop: 16 }}>
                <div style={{ width: 18, height: 18, border: '2px solid var(--border)', borderTopColor: 'var(--muted-foreground)', borderRadius: '50%', animation: 'nasaimg-spin 0.8s linear infinite' }} />
                <style>{`@keyframes nasaimg-spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (!data) {
        return (
            <div style={{ marginTop: 16, padding: '12px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: 'var(--muted-foreground)', lineHeight: 1.5 }}>
                    <span style={{ color: '#fbbf24', marginRight: 6 }}>○</span>
                    No dedicated NASA imagery available for this {objectType}.
                    {discoveryYear && discoveryYear >= 2015 && (
                        <span> Discovered in {discoveryYear} — recently confirmed {objectType}s may not yet have official imagery.</span>
                    )}
                    <span style={{ display: 'block', marginTop: 4, color: 'var(--muted-foreground)', opacity: 0.7, fontSize: 10 }}>
                        Artist concept illustrations may exist but cannot be verified as accurate representations.
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div style={{ marginTop: 16, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)' }}>
            <img
                src={data.url}
                alt={data.title}
                style={{ width: '100%', display: 'block', maxHeight: 220, objectFit: 'cover' }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <div style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.45)' }}>
                <div style={{ fontFamily: MONO, fontSize: 11, color: 'var(--foreground)', fontWeight: 600, marginBottom: 2 }}>{data.title}</div>
                {data.description && (
                    <div style={{ fontSize: 10, color: 'var(--muted-foreground)', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {data.description}
                    </div>
                )}
                <div style={{ fontFamily: MONO, fontSize: 9, color: 'var(--muted-foreground)', opacity: 0.7, marginTop: 4, letterSpacing: '0.08em' }}>
                    NASA IMAGE LIBRARY
                </div>
            </div>
        </div>
    );
}