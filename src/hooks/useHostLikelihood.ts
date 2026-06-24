import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const API_URL = 'https://cosmos-explorer-63ek.onrender.com';

export interface StarParams {
    teff: number;
    radius: number;
    mass: number;
    metallicity: number;
    luminosity: number;
}

export interface HostLikelihoodResult {
    host_likelihood: number;
    feature_importance: Record<string, number>;
    note: string;
}

async function fetchLikelihood(params: StarParams): Promise<HostLikelihoodResult> {
    const { data } = await axios.post<HostLikelihoodResult>(`${API_URL}/predict`, params, {
        timeout: 60000,
    });
    return data;
}

export function useHostLikelihood(params: StarParams | null) {
    return useQuery({
        queryKey: ['host-likelihood', params],
        queryFn: () => fetchLikelihood(params!),
        enabled: params !== null,
        staleTime: 1000 * 60 * 60,
        gcTime: 1000 * 60 * 60,
        retry: 1,
    });
}