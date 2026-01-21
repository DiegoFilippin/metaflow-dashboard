import { Component, Input, ElementRef, AfterViewInit, OnChanges, ViewChild, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as d3 from 'd3';
import { Widget, ChartDataPoint } from '../../../models/dashboard.models';

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full bg-white rounded-xl p-6 flex flex-col">
      <h3 class="text-sm font-semibold text-gray-700 mb-4">{{ widget.title }}</h3>
      <div #chartContainer class="flex-1 min-h-[200px]"></div>
    </div>
  `
})
export class BarChartComponent implements AfterViewInit, OnChanges {
  @Input({ required: true }) widget!: Widget;
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;

  private svg: any;
  private margin = { top: 20, right: 20, bottom: 40, left: 60 };

  get data(): ChartDataPoint[] {
    return this.widget.data as ChartDataPoint[];
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.createChart(), 100);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['widget'] && this.svg) {
      setTimeout(() => this.updateChart(), 50);
    }
  }

  private createChart(): void {
    const element = this.chartContainer.nativeElement;
    const width = element.offsetWidth;
    const height = element.offsetHeight || 250;

    d3.select(element).selectAll('*').remove();

    this.svg = d3.select(element)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    this.updateChart();
  }

  private updateChart(): void {
    if (!this.data || this.data.length === 0) return;

    const element = this.chartContainer.nativeElement;
    const width = element.offsetWidth || 400;
    const height = element.offsetHeight || 250;
    const innerWidth = width - this.margin.left - this.margin.right;
    const innerHeight = height - this.margin.top - this.margin.bottom;

    this.svg.selectAll('g').remove();

    const g = this.svg.append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

    const x = d3.scaleBand()
      .domain(this.data.map(d => d.label))
      .range([0, innerWidth])
      .padding(0.3);

    const y = d3.scaleLinear()
      .domain([0, d3.max(this.data, d => d.value) as number * 1.1])
      .nice()
      .range([innerHeight, 0]);

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

    // Grid lines
    g.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(y).ticks(5).tickSize(-innerWidth).tickFormat(() => ''))
      .selectAll('line')
      .attr('stroke', '#e5e7eb')
      .attr('stroke-dasharray', '2,2');

    g.selectAll('.domain').attr('stroke', '#e5e7eb');

    // Bars with gradient
    const defs = this.svg.append('defs');
    const gradient = defs.append('linearGradient')
      .attr('id', `bar-gradient-${this.widget.id}`)
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#7c3aed');

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#a855f7');

    // Bars
    g.selectAll('.bar')
      .data(this.data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d: ChartDataPoint) => x(d.label) as number)
      .attr('y', innerHeight)
      .attr('width', x.bandwidth())
      .attr('height', 0)
      .attr('fill', `url(#bar-gradient-${this.widget.id})`)
      .attr('rx', 4)
      .transition()
      .duration(600)
      .attr('y', (d: ChartDataPoint) => y(d.value))
      .attr('height', (d: ChartDataPoint) => innerHeight - y(d.value));

    // Value labels on top of bars
    g.selectAll('.label')
      .data(this.data)
      .enter()
      .append('text')
      .attr('class', 'text-xs fill-gray-600 font-medium')
      .attr('x', (d: ChartDataPoint) => (x(d.label) as number) + x.bandwidth() / 2)
      .attr('y', (d: ChartDataPoint) => y(d.value) - 8)
      .attr('text-anchor', 'middle')
      .text((d: ChartDataPoint) => this.formatNumber(d.value));
  }

  private formatNumber(value: number): string {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(0) + 'K';
    }
    return value.toString();
  }
}
