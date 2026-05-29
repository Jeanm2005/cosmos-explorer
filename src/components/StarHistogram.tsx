import { useMemo, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import type { Star } from '../types';

interface Props {
    stars: Star[];
    width?: number;
    height?: number;
}

export default function StarHistogram({ stars, width = 500, height = 220 }: Props) {
    const svgRef = useRef<SVGSVGElement>(null);
    const margin = { top: 16, right: 20, bottom: 40, left: 44};
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    const bins = useMemo(() => {
        if (!stars.length) return [];
        const mags = stars.map((s) => s.magnitude);
        const x = d3.scaleLinear().domain([d3.min(mags)! - 0.5, d3.max(mags)! + 0.5]);
        const histogram = d3.bin().domain(x.domain() as [number, number]).thresholds(20);
        return histogram(mags);
    }, [stars]);

    useEffect(() => {
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();
        if (!bins.length) return;

        const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

        const x = d3.scaleLinear()
            .domain([bins[0].x0!, bins[bins.length - 1].x1!])
            .range([0, innerW]);

        const y = d3.scaleLinear()
            .domain([0, d3.max(bins, (b) => b.length)!])
            .nice()
            .range([innerH, 0]);

        // Bars
        g.selectAll('rect')
            .data(bins)
            .join('rect')
            .attr('x', (b) => x(b.x0!) + 1)
            .attr('width', (b) => Math.max(0, x(b.x1!) - x(b.x0!) - 1))
            .attr('y', (b) => y(b.length))
            .attr('height', (b) => innerH - y(b.length))
            .attr('fill', '#4dd9ff')
            .attr('opacity', 0.7);

        // X axis
        g.append('g')
            .attr('transform', `translate(0,${innerH})`)
            .call(d3.axisBottom(x).ticks(8).tickFormat((d) => `${d}`))
            .call((ax: d3.Selection<SVGGElement, unknown, null, undefined>) => {
                ax.selectAll('text').attr('fill', 'rgba(255,255,255,0.5)').attr('font-size', 10);
                ax.selectAll('line,path').attr('stroke', 'rgba(255,255,255,0.15)');
            });

        // Y axis
        g.append('g')
            .call(d3.axisLeft(y).ticks(4))
            .call((ax: d3.Selection<SVGGElement, unknown, null, undefined>) => {
                ax.selectAll('text').attr('fill', 'rgba(255,255,255,0.5)').attr('font-size', 10);
                ax.selectAll('line,path').attr('stroke', 'rgba(255,255,255,0.15)');
            });

        // X label
        g.append('text')
            .attr('x', innerW / 2).attr('y', innerH + 34)
            .attr('text-anchor', 'middle').attr('fill', 'rgba(255,255,255,0.35)').attr('font-size', 11)
            .text('Visual Magnitude (V)');

        // Y label
        g.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('x', -innerH / 2).attr('y', -34)
            .attr('text-anchor', 'middle').attr('fill', 'rgba(255,255,255,0.35)').attr('font-size', 11)
            .text('Star Count');
    }, [bins, innerW, innerH]);

    return (
        <svg ref={svgRef} width={width} height={height} style={{ overflow: 'visible' }} />
    );
}