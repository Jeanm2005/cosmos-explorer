import { Satellite, Star, Globe, Telescope, ExternalLink, Database, Layers } from "lucide-react";

const AMBER = '#f59e0b';
const MONO = "'JetBrains Mono', ui-monospace,monospace";
const MODEL_AUC = 0.703;
const CURATED_HOSTS = 1346;

const SOURCES = [
    { icon: Satellite, accent: '#f59e0b', name: 'NASA JPL — NeoWs', use: 'Near-Earth object orbits, close approaches, and hazard classification.' },
    { icon: Star, accent: '#aabfff', name: 'Hipparcos, via VizieR', use: 'Astrometric catalogue: positions, magnitudes, parallaxes, B-V colour indices.' },
    { icon: Globe, accent: '#34d399', name: 'NASA Exoplanet Archive', use: 'Confirmed exoplanets with orbital and physical parameters.' },
    { icon: Telescope, accent: '#c084d8', name: 'SIMBAD', use: 'Deep-sky object resolution: galaxies, nebulae, pulsars, quasars.' },
    { icon: Database, accent: '#5eead4', name: 'Gaia DR3', use: 'Uniform stellar parameters underpinning the host-likelihood model.' },
    { icon: Layers, accent: '#94a3b8', name: 'NASA Image Library', use: 'Reference imagery, shown only where a genuine match exists.' },
];

const CITATIONS = [
    'This research has made use of the NASA Exoplanet Archive, which is operated by the California Institute of Technology, under contract with the National Aeronautics and Space Administration under the Exoplanet Exploration Program.',
    'This research has made use of the SIMBAD database, operated at CDS, Strasbourg, France.',
    'This research has made use of the VizieR catalogue access tool, CDS, Strasbourg, France (DOI: 10.26093/cds/vizier).',
    'This work has made use of data from the European Space Agency (ESA) mission Gaia, processed by the Gaia Data Processing and Analysis Consortium (DPAC).',
];

function SectionTag({ children }: { children: React.ReactNode }) {
    return (
        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: AMBER, marginBottom: 12 }}>
            {children}
        </div>
    );
}

function Prose({ children }: { children: React.ReactNode }) {
    return <p style={{ margin: '0 0 14px', fontSize: 13.5, lineHeight: 1.75, color: 'var(--muted-foreground' }}>{children}</p>;
}

function SubHead({ children }: { children: React.ReactNode }) {
    return <h3 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 600, color: 'var(--foreground)' }}>{children}</h3>;
}
 
function Card({ children, accent }: { children: React.ReactNode; accent?: string }) {
    return (
        <div style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${accent ? accent + '33' : 'var(--border)'}`, borderRadius: 12, padding: 20 }}>
            {children}
        </div>
    );
}
 
export default function AboutPage() {
    return (
        <div style={{ minHeight: '100vh', color: 'var(--foreground)' }}>
            <div style={{ maxWidth: 780, margin: '0 auto', padding: '28px 32px 64px' }}>
 
                {/* Mission */}
                <SectionTag>About</SectionTag>
                <h1 style={{ margin: '0 0 16px', fontFamily: 'Orbitron, sans-serif', fontSize: 28, fontWeight: 600 }}>Cosmos Explorer</h1>
                <Prose>
                    Cosmos Explorer is an interactive window onto public astronomical archives. It pulls live data
                    from the same catalogues professional astronomers use — NASA's near-Earth object service, the
                    Exoplanet Archive, the Hipparcos star catalogue, SIMBAD — and presents it as something you can
                    navigate rather than query.
                </Prose>
                <Prose>
                    Every figure shown here is either measured by one of those archives or derived from measurements
                    by a method described on this page. Nothing is filled in for the sake of a complete-looking
                    interface. Where a value is unknown — an exoplanet's mass, a star's distance, a deep-sky
                    object's redshift — the interface says so and leaves it blank.
                </Prose>
 
                {/* Data sources */}
                <div style={{ marginTop: 44 }}>
                    <SectionTag>Data Sources</SectionTag>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 12 }}>
                        {SOURCES.map((s) => {
                            const Icon = s.icon;
                            return (
                                <Card key={s.name} accent={s.accent}>
                                    <Icon size={17} strokeWidth={1.6} style={{ color: s.accent, marginBottom: 10 }} />
                                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 5 }}>{s.name}</div>
                                    <div style={{ fontSize: 12, lineHeight: 1.55, color: 'var(--muted-foreground)' }}>{s.use}</div>
                                </Card>
                            );
                        })}
                    </div>
                </div>
 
                {/* Methodology */}
                <div style={{ marginTop: 44 }}>
                    <SectionTag>Methodology</SectionTag>
                    <Prose>
                        Some numbers in this app are reported straight from an archive. Others are computed from
                        those measurements. This section covers the second kind, because a derived value is only as
                        trustworthy as the method behind it.
                    </Prose>
 
                    <div style={{ marginTop: 24 }}>
                        <SubHead>Stellar properties</SubHead>
                        <Prose>
                            The star catalogue supplies position, apparent magnitude, parallax, and B-V colour index —
                            not temperature or luminosity. Those are derived. Effective temperature comes from the
                            colour index via Ballesteros' formula; absolute magnitude from apparent magnitude and
                            parallax distance; luminosity from absolute magnitude against a solar reference of 4.83.
                            Spectral class follows the Harvard scheme from the resulting temperature.
                        </Prose>
                        <Prose>
                            Habitable-zone boundaries scale with the square root of luminosity, using conservative
                            Kopparapu-style limits — the runaway-greenhouse edge at 0.95√L and the maximum-greenhouse
                            edge at 1.67√L. A star without a parallax measurement gets no luminosity, and therefore no
                            habitable zone; the panel says as much rather than guessing.
                        </Prose>
                    </div>
 
                    <div style={{ marginTop: 28 }}>
                        <SubHead>The host-likelihood model</SubHead>
                        <Prose>
                            Each catalogued host star can be scored by a gradient-boosted classifier trained to
                            estimate how likely a star of its kind is to host a planet. It uses five Gaia DR3
                            parameters — effective temperature, radius, mass, metallicity, luminosity — and is
                            trained on {CURATED_HOSTS.toLocaleString()} confirmed hosts. On held-out data it reaches
                            a ROC-AUC of {MODEL_AUC.toFixed(2)}.
                        </Prose>
                        <Prose>
                            An earlier version of this model scored a perfect 1.0. That was not a success but a bug:
                            host and comparison stars had been drawn from different catalogues, so the classifier
                            learned to recognise which file a row came from rather than any property of the star.
                            Rebuilding both groups from identical Gaia columns dropped the score to
                            about {MODEL_AUC.toFixed(2)}, which is what the signal is actually worth.
                        </Prose>
                        <Prose>
                            The comparison sample is also matched to the known hosts, which deliberately costs
                            accuracy. Planet surveys preferentially target bright, nearby, well-observed stars, so an
                            unmatched model can score highly by learning which stars astronomers have looked at
                            hardest — measuring telescope time rather than planet formation. Matching removes that
                            shortcut and leaves a weaker, more honest signal.
                        </Prose>
                    </div>
 
                    <div style={{ marginTop: 24 }}>
                        <Card accent={AMBER}>
                            <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: AMBER, marginBottom: 10 }}>
                                How to read these scores
                            </div>
                            <div style={{ fontSize: 12.5, lineHeight: 1.7, color: 'var(--muted-foreground)' }}>
                                A ROC-AUC of {MODEL_AUC.toFixed(2)} means the model ranks a true host above a
                                non-host roughly {Math.round(MODEL_AUC * 100)}% of the time — better than a coin
                                flip, well short of a prediction. Treat a host-likelihood score as a weak prior about
                                a <em>class</em> of star, never as a claim about a specific one. Stars lacking complete
                                Gaia parameters are not scored at all, and no score here implies a planet has been
                                detected.
                            </div>
                        </Card>
                    </div>
                </div>
 
                {/* Acknowledgements */}
                <div style={{ marginTop: 44 }}>
                    <SectionTag>Data Credits</SectionTag>
                    <Prose>
                        This project is built entirely on archives maintained by other people, and those archives ask
                        to be cited. Their standard acknowledgements:
                    </Prose>
                    <Card>
                        {CITATIONS.map((c, i) => (
                            <div key={i} style={{ padding: i === 0 ? '0 0 12px' : i === CITATIONS.length - 1 ? '12px 0 0' : '12px 0', borderBottom: i === CITATIONS.length - 1 ? 'none' : '1px solid var(--border)', fontSize: 12, lineHeight: 1.65, color: 'var(--muted-foreground)' }}>
                                {c}
                            </div>
                        ))}
                    </Card>
                    <div style={{ marginTop: 12, fontSize: 11.5, lineHeight: 1.6, color: 'var(--muted-foreground)', opacity: 0.8 }}>
                        Imagery is drawn from the NASA Image and Video Library. Near-Earth object data is provided by
                        NASA's Jet Propulsion Laboratory through the NeoWs service.
                    </div>
                </div>
 
                {/* Source */}
                <div style={{ marginTop: 40 }}>
                    <a
                        href="https://github.com/Jeanm2005/cosmos-explorer"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '10px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'rgba(255,255,255,0.03)', color: 'var(--foreground)', textDecoration: 'none', fontSize: 13 }}
                    >
                        <ExternalLink size={16} />
                        Source code and model training pipeline
                    </a>
                </div>
 
            </div>
        </div>
    );
}