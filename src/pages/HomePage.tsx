import { Link } from 'react-router-dom';
import { Satellite, Star, Globe, Telescope } from 'lucide-react';

const MONO = "'JetBrains Mono', ui-monospace, monospace";

interface Section {
    to: string;
    label: string;
    tag: string;
    blurb: string;
    accent: string;
    icon: React.ReactNode;
}

const SECTIONS: Section[] = [
    {
        to: '/neos',
        label: 'NEOs & Solar System',
        tag: 'NASA JPL · NeoWs',
        blurb: 'Track near-Earth asteroids on a live heliocentric map, with real orbital elements and close-approach data.',
        accent: '#f59e0b',
        icon: <Satellite size={20} />,
    },
    {
        to: '/stars',
        label: 'Star Catalog',
        tag: 'Hipparcos · VizieR',
        blurb: 'Browse bright stars by position and magnitude, with spectral classification and habitable-zone physics derived from real measurements.',
        accent: '#aabfff',
        icon: <Star size={20} />,
    },
    {
        to: '/exoplants',
        label: 'Exoplanets',
        tag: 'NASA Exoplanet Archive',
        blurb: 'Explore confirmed exoplanets with discovery methods, orbital data, and an ML model scoring host-star likelihood.',
        accent: '#34d399',
        icon: <Globe size={20} />,
    },
    {
        to: '/deepsky',
        label: 'Deep-Sky Objects',
        tag: 'SIMBAD · CDS',
        blurb: 'Nebulae, galaxies, and clusters resolved against real survey imagery from the digitized sky.',
        accent: '#c084d8',
        icon: <Telescope size={20} />,
    },
];

function SectionCard({ s }: { s: Section }) {
  return (
    <Link
      to={s.to}
      style={{
        display: 'block',
        textDecoration: 'none',
        padding: '22px 22px 24px',
        borderRadius: 14,
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid var(--border)',
        transition: 'transform 0.18s, border-color 0.18s, background 0.18s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.borderColor = `${s.accent}66`;
        e.currentTarget.style.background = `${s.accent}0c`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
      }}
    >
      <div
        style={{
          width: 44, height: 44, borderRadius: 11, marginBottom: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `${s.accent}1a`, border: `1px solid ${s.accent}44`, color: s.accent,
        }}
      >
        {s.icon}
      </div>
      <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: s.accent, marginBottom: 8 }}>
        {s.tag}
      </div>
      <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 16, fontWeight: 600, color: 'var(--foreground)', marginBottom: 8 }}>
        {s.label}
      </div>
      <div style={{ fontSize: 13, lineHeight: 1.55, color: 'var(--muted-foreground)' }}>
        {s.blurb}
      </div>
    </Link>
  );
}
 
export default function HomePage() {
  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: '64px 32px 80px' }}>
      <div style={{ marginBottom: 48, maxWidth: 640 }}>
        <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#f59e0b', marginBottom: 16 }}>
          Cosmos Explorer
        </div>
        <h1 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 38, fontWeight: 600, lineHeight: 1.15, margin: '0 0 18px', color: 'var(--foreground)' }}>
          A working view of the sky, built on real data.
        </h1>
        <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--muted-foreground)', margin: 0 }}>
          Live orbital mechanics, catalog astronomy, and a machine-learning model — drawing directly from NASA, ESA, and CDS archives. Pick a domain to explore.
        </p>
      </div>
 
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18 }}>
        {SECTIONS.map((s) => <SectionCard key={s.to} s={s} />)}
      </div>
    </div>
  );
}
