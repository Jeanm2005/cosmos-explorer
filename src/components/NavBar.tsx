import { useState } from 'react';
import { NavLink} from 'react-router-dom';
import { AnimatePresence, motion} from 'motion/react';
import { Telescope, Satellite, Star, Globe, Info, Sun, Moon, Menu, X } from 'lucide-react';

const LINKS = [
    { to: '/neos', label: 'NEOs & Solar', icon: <Satellite size={15} /> },
    { to: '/stars', label: 'Stars', icon: <Star size={15} /> },
    { to: '/exoplanets', label: 'Exoplanets', icon: <Globe size={15} /> },
    { to: '/deepsky', label: 'Deep-Sky', icon: <Telescope size={15} /> },
    { to: '/about', label: 'About', icon: <Info size={15} /> },
];

const AMBER = '#f59e0b';

export default function NavBar({ isDark, toggle}: { isDark: boolean; toggle: () => void }) {
    const [menuOpen, setMenuOpen] = useState(false);

    const linkStyle = (isActive: boolean): React.CSSProperties => ({
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 12px',
        borderRadius: 8,
        fontSize: 13,
        fontWeight: 500,
        transition: 'all 0.2s',
        background: isActive ? 'rgba(245,158,11,0.12)' : 'transparent',
        color: isActive ? AMBER : isDark ? '#94a3b8' : '#64748b',
        border: isActive ? '1px solid rgba(245,158,11,0.3)' : '1px solid transparent',
        textDecoration: 'none',
    });

    return (
        <header
            className="fixed top-0 left-0 right-0"
            style={{
                zIndex: 50,
                borderBottom: '1px solid var(--border)',
                background: isDark ? 'rgba(2,8,23,0.85)' : 'rgba(240,244,255,0.9)',
                backdropFilter: 'blur(20px)',
            }}
        >
            <div className="max-w-screen-xl mx-auto flex items-center h-16 px-4 gap-4">
                {/* Logo */}
                <NavLink to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, textDecoration: 'none' }}>
                    <div
                        style={{
                            width: 32, height: 32, borderRadius: 9,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'rgba(245,158,11,0.14)',
                            border: '1px solid rgba(245,158,11,0.35)',
                        }}
                    >
                        <Telescope size={17} style={{ color: AMBER }} />
                    </div>
                    <span
                        className="hidden sm:block"
                        style={{
                            fontFamily: 'Orbitron, sans-serif', fontWeight: 600, fontSize: 14,
                            letterSpacing: '0.08em', color: isDark ? '#e2e9f0' : '#0f172a',
                        }}
                    >
                        COSMOS<span style={{ color: AMBER }}> EXPLORER</span>
                    </span>
                </NavLink>

                {/* Desktop nav */}
                <nav className="hidden lg:flex items-center gap-1 ml-4">
                    {LINKS.map((l) => (
                        <NavLink key={l.to} to={l.to} style={({ isActive}) => linkStyle(isActive)}>
                            {l.icon}{l.label}
                        </NavLink>
                    ))}
                </nav>

                <div style={{ flex: 1 }} />

                {/* Theme toggle */}
                <button
                    onClick={toggle}
                    aria-label="Toggle theme"
                    style={{
                        width: 32, height: 32, borderRadius: 8,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: '1px solid var(--border)', background: 'transparent',
                        color: isDark ? '#94a3b8' : '#64748b', cursor: 'pointer',
                    }}
                >
                    {isDark ? <Sun size={15} /> : <Moon size={15} />}
                </button>

                {/* Mobile hamburger */}
                <button
                    className="lg:hidden"
                    onClick={() => setMenuOpen((o) => !0)}
                    aria-label="Open menu"
                    style={{
                        width: 32, height: 32, borderRadius: 8,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: '1px solid var(--border)', background: 'transparent',
                        color: isDark ? '#94a3b8' : '#64748b', cursor: 'pointer',
                    }}
                >
                    {menuOpen ? <X size={16} /> : <Menu size={16} />}
                </button>
            </div>

            {/* Mobile menu */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        className="lg:hidden overflow-hidden"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ borderTop: '1px solid var(--border)' }}
                    >
                        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {LINKS.map((l) => (
                                <NavLink
                                    key={l.to}
                                    to={l.to}
                                    onClick={() => setMenuOpen(false)}
                                    style={({ isActive }) => ({ ...linkStyle(isActive), padding: '10px 12px' })}
                                >
                                    {l.icon}{l.label}
                                </NavLink>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}