import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import data from './data.json';

interface Point {
  id: number;
  term: string;
  x: number;
  y: number;
  category: string;
}

export default function App() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selected, setSelected] = useState<Point | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = 800;
    const height = 800;
    const padding = 50;

    const svg = d3.select(svgRef.current)
      .attr('viewBox', `0 0 ${width} ${height}`);

    svg.selectAll('*').remove();

    const xScale = d3.scaleLinear()
      .domain([0, 100])
      .range([padding, width - padding]);

    const yScale = d3.scaleLinear()
      .domain([0, 100])
      .range([padding, height - padding]);

    const colorScale = d3.scaleOrdinal<string>()
      .domain(['embodied', 'ai', 'bridge'])
      .range(['#ff4b2b', '#001ebc', '#8e44ad']);

    // Zoom behavior
    const g = svg.append('g');
    
    svg.call(d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 5])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      }));

    // Draw lines/background connections (simple)
    // could add Delaunay here for "map" vibe

    const points = g.selectAll('.point')
      .data(data as Point[])
      .enter()
      .append('g')
      .attr('class', 'point')
      .attr('transform', d => `translate(${xScale(d.x)},${yScale(d.y)})`)
      .on('click', (e, d) => setSelected(d))
      .style('cursor', 'pointer');

    points.append('circle')
      .attr('r', d => d.term === 'embodied knowledge' || d.term === 'artificial intelligence' ? 8 : 4)
      .attr('fill', d => colorScale(d.category))
      .attr('opacity', 0.7);

    points.append('text')
      .text(d => d.term)
      .attr('x', 10)
      .attr('y', 5)
      .style('font-size', d => d.term === 'embodied knowledge' || d.term === 'artificial intelligence' ? '16px' : '10px')
      .style('font-weight', d => d.term === 'embodied knowledge' || d.term === 'artificial intelligence' ? 'bold' : 'normal')
      .style('font-family', 'Geist, sans-serif')
      .style('fill', '#333');

  }, []);

  return (
    <div className="w-full h-screen bg-neutral-50 flex flex-col items-center p-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-neutral-900 tracking-tight mb-2">Teach Us How To Feel</h1>
        <p className="text-neutral-500 italic">Exploring the intersection of Embodied Knowledge & AI</p>
      </header>

      <div className="relative w-full max-w-3xl aspect-square bg-white rounded-2xl shadow-xl overflow-hidden border border-neutral-200">
        <svg ref={svgRef} className="w-full h-full" />
        {selected && (
          <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur p-4 rounded-lg border border-neutral-200">
            <h3 className="font-bold text-neutral-900 capitalize">{selected.term}</h3>
            <p className="text-sm text-neutral-600">Category: {selected.category}</p>
          </div>
        )}
      </div>

      <footer className="mt-8 text-neutral-400 text-xs">
        &copy; 2026 Clawky & Tom &middot; Powered by UMAP-TSNE Embeddings
      </footer>
    </div>
  );
}
