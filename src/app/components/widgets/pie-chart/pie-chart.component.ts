import { Component, Input, ElementRef, AfterViewInit, OnChanges, ViewChild, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as d3 from 'd3';
import { Widget, ChartDataPoint } from '../../../models/dashboard.models';

@Component({
  selector: 'app-pie-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full bg-white rounded-xl p-6 flex flex-col">
      <h3 class="text-sm font-semibold text-gray-700 mb-4">{{ widget.title }}</h3>
      <div class="flex-1 flex items-center gap-4">
        <div #chartContainer class="flex-shrink-0" style="width: 160px; height: 160px;"></div>
        @if (widget.config.showLegend) {
          <div class="flex-1 space-y-2">
            @for (item of data; track item.label) {
              <div class="flex items-center gap-2 text-sm">
                <div 
                  class="w-3 h-3 rounded-full flex-shrink-0"
                  [style.backgroundColor]="item.color || getColor(data.indexOf(item))"
                ></div>
                <span class="text-gray-600 truncate">{{ item.label }}</span>
                <span class="text-gray-900 font-medium ml-auto">{{ item.value }}%</span>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `
})
export class PieChartComponent implements AfterViewInit, OnChanges {
  @Input({ required: true }) widget!: Widget;
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;

  private svg: any;
  private colors = ['#7c3aed', '#06b6d4', '#84cc16', '#f59e0b', '#ef4444', '#ec4899'];

  get data(): ChartDataPoint[] {
    return this.widget.data as ChartDataPoint[];
  }

  getColor(index: number): string {
    return this.colors[index % this.colors.length];
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
    const size = 160;

    d3.select(element).selectAll('*').remove();

    this.svg = d3.select(element)
      .append('svg')
      .attr('width', size)
      .attr('height', size)
      .append('g')
      .attr('transform', `translate(${size / 2},${size / 2})`);

    this.updateChart();
  }

  private updateChart(): void {
    if (!this.data || this.data.length === 0) return;

    const size = 160;
    const radius = size / 2;
    const innerRadius = radius * 0.6;

    this.svg.selectAll('*').remove();

    const pie = d3.pie<ChartDataPoint>()
      .value(d => d.value)
      .sort(null);

    const arc = d3.arc<d3.PieArcDatum<ChartDataPoint>>()
      .innerRadius(innerRadius)
      .outerRadius(radius - 5)
      .cornerRadius(3)
      .padAngle(0.02);

    const arcs = this.svg.selectAll('.arc')
      .data(pie(this.data))
      .enter()
      .append('g')
      .attr('class', 'arc');

    arcs.append('path')
      .attr('d', arc)
      .attr('fill', (d: d3.PieArcDatum<ChartDataPoint>, i: number) => d.data.color || this.getColor(i))
      .attr('opacity', 0)
      .transition()
      .duration(600)
      .attr('opacity', 1);

    // Center text
    const total = this.data.reduce((sum, d) => sum + d.value, 0);
    this.svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.2em')
      .attr('class', 'text-2xl font-bold fill-gray-900')
      .text(total);

    this.svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1.2em')
      .attr('class', 'text-xs fill-gray-500')
      .text('Total');
  }
}
