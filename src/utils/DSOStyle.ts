import { Aperture, Cloud, Radio, Sun, CircleDot, Sparkles, Telescope, type LucideIcon } from 'lucide-react';
import type { DSOType } from '../hooks/useDeepSkyObjects';

export const DSO_TYPE_COLORS: Record<DSOType, string> = {
    galaxy: '#c084d8',
    nebula: '#f472b6',
    pulsar: '#fcd34d',
    quasar: '#fb923c',
    black_hole: '#f87171',
    cluster: '#5eead4',
    other: '#94a3b8',
};

export const DSO_TYPE_ICONS: Record<DSOType, LucideIcon> = {
    galaxy: Aperture,
    nebula: Cloud,
    pulsar: Radio,
    quasar: Sun,
    black_hole: CircleDot,
    cluster: Sparkles,
    other: Telescope,
};