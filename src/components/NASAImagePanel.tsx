import { useNASAImage } from '../hooks/useNASAImage';

interface Props {
    query: string;
}

export default function NASAImagePanel({ query }: Props) {
    const { data, isLoading } = useNASAImage(query);

    if (isLoading) {
        return (
            <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
                <div style={{ width: 24, height: 24, border: '2px solid rgba(77,217,255,0.2)', borderTopColor: '#4dd9ff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } } `}</style>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div style={{ marginTop: 16, borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)' }}>
            <img
                src={data.url}
                alt={data.title}
                style={{ width: '100%', display: 'block', maxHeight: 220, objectFit: 'cover' }}
                onError={(e) => { (e.target as HTMLImageElement).style.display= 'none'; }}
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