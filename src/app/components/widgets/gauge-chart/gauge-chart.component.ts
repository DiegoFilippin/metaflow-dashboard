import { Component, Input, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as d3 from 'd3';
import { Widget } from '../../../models/dashboard.models';

export interface GaugeData {
  value: number;
  min: number;
  max: number;
  target?: number;
  label: string;
  unit?: string;
}

@Component({
  selector: 'app-gauge-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full bg-white rounded-xl p-6 flex flex-col">
      <h3 class="text-sm font-semibold text-gray-700 mb-2">{{ widget.title }}</h3>
      <div class="flex-1 flex items-center justify-center">
        <div #chartContainer class="relative" style="width: 180px; height: 120px;"></div>
      </div>
      <div class="text-center mt-2">
        <p class="text-2xl font-bold text-gray-900">{{ data.value }}{{ data.unit || '%' }}</p>
        <p class="text-xs text-gray-500">{{ data.label }}</p>
        @if (data.target) {
          <p class="text-xs text-gray-400 mt-1">Meta: {{ data.target }}{{ data.unit || '%' }}</p>
        }
      </div>
    </div>
  `
})
export class GaugeChartComponent implements AfterViewInit {
  @Input({ required: true }) widget!: Widget;
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;

  get data(): GaugeData {
    return this.widget.data as GaugeData;
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.createGauge(), 100);
  }

  private createGauge(): void {
    const element = this.chartContainer.nativeElement;
    const width = 180;
    const height = 120;
    const radius = 80;

    d3.select(element).selectAll('*').remove();

    const svg = d3.select(element)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height - 10})`);

    const scale = d3.scaleLinear()
      .domain([this.data.min, this.data.max])
      .range([-Math.PI / 2, Math.PI / 2]);

    const arc = d3.arc()
      .innerRadius(radius - 15)
      .outerRadius(radius)
      .startAngle(-Math.PI / 2);

    // Background arc
    svg.append('path')
      .datum({ endAngle: Math.PI / 2 })
      .style('fill', '#e5e7eb')
      .attr('d', arc as any);

    // Value arc with gradient color based on percentage
    const percentage = (this.data.value - this.data.min) / (this.data.max - this.data.min);
    let color = '#ef4444'; // red
    if (percentage >= 0.8) color = '#22c55e'; // green
    else if (percentage >= 0.5) color = '#f59e0b'; // yellow

    svg.append('path')
      .datum({ endAngle: scale(this.data.value) })
      .style('fill', color)
      .attr('d', arc as any)
      .transition()
      .duration(800)
      .attrTween('d', (d: any) => {
        const interpolate = d3.interpolate(-Math.PI / 2, scale(this.data.value));
        return (t: number) => {
          d.endAngle = interpolate(t);
          return (arc as any)(d);
        };
      });

    // Target marker
    if (this.data.target) {
      const targetAngle = scale(this.data.target);
      svg.append('line')
        .attr('x1', Math.cos(targetAngle - Math.PI / 2) * (radius - 20))
        .attr('y1', Math.sin(targetAngle - Math.PI / 2) * (radius - 20))
        .attr('x2', Math.cos(targetAngle - Math.PI / 2) * (radius + 5))
        .attr('y2', Math.sin(targetAngle - Math.PI / 2) * (radius + 5))
        .attr('stroke', '#374151')
        .attr('stroke-width', 2);
    }
  }
}
