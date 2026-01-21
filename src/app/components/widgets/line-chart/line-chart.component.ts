import { Component, Input, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as d3 from 'd3';
import { Widget, ChartDataPoint } from '../../../models/dashboard.models';

@Component({
  selector: 'app-line-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full bg-white rounded-xl p-6 flex flex-col">
      <h3 class="text-sm font-semibold text-gray-700 mb-4">{{ widget.title }}</h3>
      <div #chartContainer class="flex-1 min-h-[200px]"></div>
    </div>
  `
})
export class LineChartComponent implements AfterViewInit {
  @Input({ required: true }) widget!: Widget;
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;

  private margin = { top: 20, right: 30, bottom: 40, left: 50 };

  get data(): ChartDataPoint[] {
    return this.widget.data as ChartDataPoint[];
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.createChart(), 100);
  }

  private createChart(): void {
    const element = this.chartContainer.nativeElement;
    const width = element.offsetWidth || 400;
    const height = element.offsetHeight || 250;
    const innerWidth = width - this.margin.left - this.margin.right;
    const innerHeight = height - this.margin.top - this.margin.bottom;

    d3.select(element).selectAll('*').remove();

    const svg = d3.select(element)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    const g = svg.append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

    const x = d3.scalePoint()
      .domain(this.data.map(d => d.label))
      .range([0, innerWidth]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(this.data, d => d.value) as number * 1.1])
      .nice()
      .range([innerHeight, 0]);

    // Grid lines
    g.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(y).ticks(5).tickSize(-innerWidth).tickFormat(() => ''))
      .selectAll('line')
      .attr('stroke', '#e5e7eb')
      .attr('stroke-dasharray', '2,2');

    g.selectAll('.domain').attr('stroke', '#e5e7eb');

    // X Axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('class', 'text-xs fill-gray-500');

    // Y Axis
    g.append('g')
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => this.formatNumber(d as number)))
      .selectAll('text')
      .attr('class', 'text-xs fill-gray-500');

    // Gradient for area
    const defs = svg.append('defs');
    const gradient = defs.append('linearGradient')
      .attr('id', `area-gradient-${this.widget.id}`)
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#7c3aed')
      .attr('stop-opacity', 0.3);

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#7c3aed')
      .attr('stop-opacity', 0);

    // Area
    const area = d3.area<ChartDataPoint>()
      .x(d => x(d.label) as number)
      .y0(innerHeight)
      .y1(d => y(d.value))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(this.data)
      .attr('fill', `url(#area-gradient-${this.widget.id})`)
      .attr('d', area);

    // Line
    const line = d3.line<ChartDataPoint>()
      .x(d => x(d.label) as number)
      .y(d => y(d.value))
      .curve(d3.curveMonotoneX);

    const path = g.append('path')
      .datum(this.data)
      .attr('fill', 'none')
      .attr('stroke', '#7c3aed')
      .attr('stroke-width', 2.5)
      .attr('d', line);

    // Animate line
    const totalLength = (path.node() as SVGPathElement).getTotalLength();
    path
      .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
      .attr('stroke-dashoffset', totalLength)
      .transition()
      .duration(1000)
      .attr('stroke-dashoffset', 0);

    // Dots
    g.selectAll('.dot')
      .data(this.data)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', d => x(d.label) as number)
      .attr('cy', d => y(d.value))
      .attr('r', 4)
      .attr('fill', '#7c3aed')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('opacity', 0)
      .transition()
      .delay(800)
      .duration(300)
      .style('opacity', 1);

    // Value labels
    g.selectAll('.label')
      .data(this.data)
      .enter()
      .append('text')
      .attr('class', 'text-xs fill-gray-600 font-medium')
      .attr('x', d => x(d.label) as number)
      .attr('y', d => y(d.value) - 12)
      .attr('text-anchor', 'middle')
      .style('opacity', 0)
      .text(d => this.formatNumber(d.value))
      .transition()
      .delay(800)
      .duration(300)
      .style('opacity', 1);
  }

  private formatNumber(value: number): string {
    if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
    if (value >= 1000) return (value / 1000).toFixed(0) + 'K';
    return value.toString();
  }
}
