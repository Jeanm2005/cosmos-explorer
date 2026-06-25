/**
 * Stellar physics derivations for the Star Catalog panel.
 * All from first principles using fields available on the Star object.
 */

const SUN_ABS_MAG = 4.83; // absolute magnitude of the Sun (V band)

/** Effective temperature (K) from B-V color index. */
export function tempFromColorIndex(bv: number): number {
    return 4600 * (1 / (0.92 * bv + 1.7) + 1 / (0.92 * bv + 0.62));
}

/** Absolute magnitude from apparent magnitude and distance (parsecs). */
export function absoluteMagnitude(apparentMag: number, distancePc: number): number {
    return apparentMag - 5 * Math.log10(distancePc / 10);
}

/** Luminosity (L/L☉) from absolute magnitude. */
export function luminosityFromAbsMag(absMag: number): number {
    return Math.pow(10, (SUN_ABS_MAG - absMag) / 2.5);
}

/** Habitable-zone inner/outer boundaries (AU) scaling with √luminosity. */
export function habitableZone(luminosity: number): { inner: number; outer: number} {
    // Conservative Kopparu-style boundaries, simplified to luminosity scaling.
    return {
        inner: 0.95 * Math.sqrt(luminosity), // runaway greenhouse
        outer: 1.67 * Math.sqrt(luminosity), // maximum greenhouse
    };
}

export interface SpectralClass {
    letter: string;
    label: string;
    color: string;
}

/** Harvard spectral classification from effective temperature (K). */
export function spectralClass(tempK: number): SpectralClass {
    if (tempK >= 30000) return { letter: 'O', label: 'Blue supergiant', color: '#9bb0ff' };
    if (tempK >= 10000) return { letter: 'B', label: 'Blue-white', color: '#aabfff' };
    if (tempK >= 7500)  return { letter: 'A', label: 'White', color: '#cad8ff' };
    if (tempK >= 6000)  return { letter: 'F', label: 'Yellow-white', color: '#f8f7ff' };
    if (tempK >= 5200)  return { letter: 'G', label: 'Yellow (Sun-like)', color: '#fff4ea' };
    if (tempK >= 3700)  return { letter: 'K', label: 'Orange', color: '#ffd2a1' };
    return { letter: 'M', label: 'Red dwarf', color: '#ffb56c' };
}

export interface StellarDerivation {
    tempK: number | null;
    luminosity: number | null;
    spectral: SpectralClass | null;
    hz: { inner: number; outer: number} | null;
}

/** Derive everything available from a star's raw fields. */
export function deriveStellar(opts: {
    colorIndex?: number;
    magnitude: number;
    distance?: number;
}): StellarDerivation {
    const { colorIndex, magnitude, distance } = opts;

    const tempK = colorIndex != null ? tempFromColorIndex(colorIndex) : null;
    const spectral = tempK != null ? spectralClass(tempK): null;

    let luminosity: number | null = null;
    if (distance != null && distance > 0) {
        luminosity = luminosityFromAbsMag(absoluteMagnitude(magnitude, distance));
    }
    const hz = luminosity != null ? habitableZone(luminosity) : null;

    return { tempK, luminosity, spectral, hz };
}