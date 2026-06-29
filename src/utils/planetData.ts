export interface PlanetData {
    name: string;
    type: 'star' | 'terrestrial' | 'gas giant' | 'ice giant';
    color: string; // display tint (roughly true color)
    diameterKm: number; // equatorial diameter
    massEarth: number; // mass relative to Earth
    densityGcm3: number; // mean density, g/cm³
    gravityEarth: number; // surface gravity relative to Earth
    rotationHours: number; // sidereal rotation period, hours (abs value)
    rotationDir: 'prograde' | 'retrograde';
    orbitalDays: number; // orbital period, Earth days (0 for the Sun)
    orbitalSpeedKms: number; // mean orbital velocity, km/s (0 for the Sun)
    moons: number; // confirmed natural satellites
}

export const PLANETS: PlanetData[] = [
    {
        name: 'Sun', type: 'star', color: '#ffd96b',
        diameterKm: 1392700, massEarth: 333000, densityGcm3: 1.41, gravityEarth: 28.0,
        rotationHours: 609.12, rotationDir: 'prograde', orbitalDays: 0, orbitalSpeedKms: 0, moons: 0,
    },
    {
        name: 'Mercury', type: 'terrestrial', color: '#b6b2ad',
        diameterKm: 4879, massEarth: 0.0553, densityGcm3: 5.43, gravityEarth: 0.38,
        rotationHours: 1407.6, rotationDir: 'prograde', orbitalDays: 88.0, orbitalSpeedKms: 47.4, moons: 0,
    },
    {
        name: 'Venus', type: 'terrestrial', color: '#e8cda0',
        diameterKm: 12104, massEarth: 0.815, densityGcm3: 5.24, gravityEarth: 0.91,
        rotationHours: 5832.5, rotationDir: 'retrograde', orbitalDays: 224.7, orbitalSpeedKms: 35.0, moons: 0,
    },
    {
        name: 'Earth', type: 'terrestrial', color: '#6b93d6',
        diameterKm: 12756, massEarth: 1.0, densityGcm3: 5.51, gravityEarth: 1.0,
        rotationHours: 23.93, rotationDir: 'prograde', orbitalDays: 365.2, orbitalSpeedKms: 29.8, moons: 1,
    },
    {
        name: 'Mars', type: 'terrestrial', color: '#c1440e',
        diameterKm: 6792, massEarth: 0.107, densityGcm3: 3.93, gravityEarth: 0.38,
        rotationHours: 24.62, rotationDir: 'prograde', orbitalDays: 687.0, orbitalSpeedKms: 24.1, moons: 2,
    },
    {
        name: 'Jupiter', type: 'gas giant', color: '#c9a06b',
        diameterKm: 142984, massEarth: 317.8, densityGcm3: 1.33, gravityEarth: 2.53,
        rotationHours: 9.93, rotationDir: 'prograde', orbitalDays: 4331, orbitalSpeedKms: 13.1, moons: 115,
    },
    {
        name: 'Saturn', type: 'gas giant', color: '#e0c994',
        diameterKm: 120536, massEarth: 95.2, densityGcm3: 0.69, gravityEarth: 1.07,
        rotationHours: 10.66, rotationDir: 'prograde', orbitalDays: 10747, orbitalSpeedKms: 9.7, moons: 293,
    },
    {
        name: 'Uranus', type: 'ice giant', color: '#a6d8d8',
        diameterKm: 51118, massEarth: 14.5, densityGcm3: 1.27, gravityEarth: 0.89,
        rotationHours: 17.24, rotationDir: 'retrograde', orbitalDays: 30589, orbitalSpeedKms: 6.8, moons: 29,
    },
    {
        name: 'Neptune', type: 'ice giant', color: '#5b8fed',
        diameterKm: 49528, massEarth: 17.1, densityGcm3: 1.64, gravityEarth: 1.14,
        rotationHours: 16.11, rotationDir: 'prograde', orbitalDays: 59800, orbitalSpeedKms: 5.4, moons: 16,
    },
];

export const MOON_COUNT_AS_OF = 'June 2026';