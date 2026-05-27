import { NavLink } from 'react-router-dom';

const links = [
    { to: '/', label: 'Near-Earth Objects', icon: '☄' },
    { to: '/stars', label: 'Star Catalog', icon: '✦', comingSoon: true},
    { to: '/exoplanets', label: 'Exoplanets', icon: '🪐', comingSoon: true },
];

export default function NavBar() {
    return (
        <nav style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 32px', height: 58,
            background: 'rgba(5,8,20,0.92)',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            backdropFilter: 'blur(12px)',
            position: 'sticky', top: 0, zIndex: 100,
        }}>
            <div style={{ display:'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 22 }}>🌌</span>
                <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: '0.02em', color: '#e0e8ff'}}>
                    Cosmos Explorer
                </span>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
                {links.map(({ to, label, icon, comingSoon }) =>
                    comingSoon ? (
                        <div key={to} style={{ padding: '6px 14px', fontSize: 12, borderRadius: 6, color: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span>{icon}</span><span>{label}</span>
                            <span style={{ fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(77,217,255,0.4)', border: '1px solid rgba(77,217,255,0.2)', borderRadius: 3, padding: '1px 5px' }}>soon</span>
                        </div>
                    ) : (
                        <NavLink key={to} to={to} style={({ isActive }) => ({
                            padding: '6px 14px', fontSize: 12, borderRadius: 6,
                            color: isActive ? '#4dd9ff' : 'rgba(255,255,255,0.6)',
                            background: isActive ? 'rgba(77,2177,255,0.1)' : 'transparent',
                            textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.15s',
                        })}>
                            <span>{icon}</span><span>{label}</span>
                        </NavLink>
                    )
                )}
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.05em' }}>
                DATA: NASA JPL • ESA Gaia
            </div>
        </nav>
    );
}