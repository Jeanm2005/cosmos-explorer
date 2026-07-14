import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import type { Exoplanet } from './useExoplanets';
import type { HostLikelihoodResult } from './useHostLikelihood';

export interface InterpretPayload {
    planetName: string;
    hostName: string | null;
    radiusEarth: number | null;
    massEarth: number | null;
    orbitalPeriodDays: number | null;
    semiMajorAxisAU: number | null;
    equilibriumTempK: number | null;
    distancePc: number | null;
    discoveryYear: number | null;
    discoveryMethod: string | null;
    inHabitableZone: boolean;
    hostLikelihood: number | null;
    featureImportance: Record<string, number> | null;
}

export function buildPayload(planet: Exoplanet, hostScore?: HostLikelihoodResult | null ): InterpretPayload {
    return {
        planetName: planet.name,
        hostName: planet.hostStar ?? null,
        radiusEarth: planet.radius ?? null,
        massEarth: planet.mass ?? null,
        orbitalPeriodDays: planet.orbitalPeriod ?? null,
        semiMajorAxisAU: planet.semiMajorAxis ?? null,
        equilibriumTempK: planet.equilibriumTemp ?? null,
        distancePc: planet.distanceFromEarth ?? null,
        discoveryMethod: planet.discoveryMethod ?? null,
        discoveryYear: planet.discoveryYear ?? null,
        inHabitableZone: Boolean(planet.isInHabitableZone),
        hostLikelihood: hostScore?.host_likelihood ?? null,
        featureImportance: hostScore?.feature_importance ?? null,
    };
}

async function fetchInterpretation(payload: InterpretPayload): Promise<string> {
    const { data } = await axios.post<{ interpretation: string }>('/api/interpreter', payload, {
        timeout: 30000,
    });
    return data.interpretation;
}

export function useInterpretation() {
    return useMutation({ mutationFn: fetchInterpretation });
}