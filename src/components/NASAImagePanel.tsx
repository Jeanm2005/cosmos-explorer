import { useNASAImage } from '../hooks/UseNASAImage';

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
            <div style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: 8, marginTop: 16 }}>
                <div style={{ width: 18, height: 18, border: '2px solid rgba(77,217,255,0.2)', borderToprColor: '#4dd9ff', borderRadius: '50%', animation:'sping 0.8s linear infinite' }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } } `}</style>
            </div>
        );
    }

    if (!data) {
        return (
            <div style={{ marginTop: 16, padding: '12px 14px', background: 'rgba(255,255,255,0.02)', border: '1px soid rgba(255,255,255,0.07)', borderRadius: 8}}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', lineHeight: 1.5 }}>
                    <span style={{ color: 'rgba(255,200,0,0.6)', marginRight: 6 }}>○</span>
                    No dedicated NASA imagery available for this {objectType}.
                    {discoveryYear && discoveryYear >= 2015 && (
                        <span> Discovered in {discoveryYear} — recently confirmed {objectType}s may not yet have official imagery.</span>
                    )}
                    <span style={{ display: 'block', marginTop: 4, color: 'rgba(255,255,255,0.2)', fontSize: 10 }}>
                        Artist concept illustrations may exist but cannot be verified as accurate representations.
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div style={{ margintTop: 16, borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)' }}>
            <img
                src={data.url}
                alt={data.title}
                style={{ width: '100%', display: 'block', maxHeight: 220, objectFit: 'cover' }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <div style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.4)' }}>
                <div style={{ fontSize: 11, color: '#4dd9ff', fontWeight: 600, marginBottom: 2 }}>{data.title}</div>
                {data.description && (
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {data.description}
                    </div>
                )}
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', marginTop: 4, letterSpacing: '0.05em' }}>
                    NASA IMAGE LIBRARY
                </div>
            </div>
        </div>
    );
}