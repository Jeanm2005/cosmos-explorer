export interface OrbitalElements {
    semiMajorAxis: number;
    eccentricity: number;
    inclination: number;
    longitudeAscendingNode: number;
    argumentOfPerihelion: number;
    meanAnomaly: number;
}

export interface CloseApproach {
    date: string;
    distanceAU: number;
    distanceLD: number;
    relativeVelocityKmS: number;
}

export interface Asteroid {
    id: string;
    name: string;
    designation: string;
    diameterMin: number;
    diameterMax: number;
    isPotentiallyHazardous: boolean;
    absoluteMagnitude: number;
    orbitalElements: OrbitalElements;
    closeApproaches: CloseApproach[];
}

export interface NeoWsCloseApproachRaw {
    close_approach_date: string;
    miss_distance: { astronomical: string; lunar: string };
    relative_velocity: { kilometers_per_second: string };
}

export interface NeoWsObjectRaw {
    id: string;
    name: string;
    designation: string;
    absolute_magnitude_h: number;
    estimated_diameter: {
        meters: { estimated_diameter_min: number; estimated_diameter_max: number };
    };
    is_potentially_hazardous_asteroid: boolean;
    close_approach_data: NeoWsCloseApproachRaw[];
    orbital_data?: {
        semi_major_axis: string;
        eccentricity: string;
        inclination: string;
        ascending_node_longitude: string;
        perihelion_argument: string;
        mean_anomaly: string;
    };
}

export interface NeoWsFeedResponse {
    near_earth_objects: Record<string, NeoWsObjectRaw[]>;
}

export interface Star {
    id: string;
    name?: string;
    ra: number;
    dec: number;
    magnitude: number;
    colorIndex?: number;
    distance?: number;
    spectralType?: string;
}

export type DateRange = { start: string; end: string };
export type ViewMode = 'orbital' | 'table' | 'detail';

export interface AppFilters {
    dateRange: DateRange;
    showHazardousOnly: boolean;
    minDiameter: number;
    maxDiameter: number;
}