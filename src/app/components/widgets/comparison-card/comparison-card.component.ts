import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Widget } from '../../../models/dashboard.models';

export interface ComparisonData {
  current: number;
  previous: number;
  currentLabel: string;
  previousLabel: string;
  prefix?: string;
  suffix?: string;
}

@Component({
  selector: 'app-comparison-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full bg-white rounded-xl p-6 flex flex-col">
      <h3 class="text-sm font-semibold text-gray-700 mb-4">{{ widget.title }}</h3>
      
      <div class="flex-1 flex flex-col justify-center">
        <!-- Current Value -->
        <div class="mb-4">
          <p class="text-xs text-gray-500 uppercase tracking-wider mb-1">{{ data.currentLabel }}</p>
          <p class="text-3xl font-bold text-gray-900">
            {{ data.prefix || '' }}{{ formatNumber(data.current) }}{{ data.suffix || '' }}
          </p>
        </div>
        
        <!-- Comparison -->
        <div class="flex items-center gap-3 p-3 rounded-lg" [class]="getComparisonBgClass()">
          <div [class]="getIconClass()">
            @if (variation > 0) {
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
              </svg>
            } @else if (variation < 0) {
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"/>
              </svg>
            } @else {
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14"/>
              </svg>
            }
          </div>
          <div class="flex-1">
            <p [class]="getVariationTextClass()">
              {{ variation > 0 ? '+' : '' }}{{ variation.toFixed(1) }}%
            </p>
            <p class="text-xs text-gray-500">vs {{ data.previousLabel }}</p>
          </div>
          <div class="text-right">
            <p class="text-sm text-gray-600">
              {{ data.prefix || '' }}{{ formatNumber(data.previous) }}{{ data.suffix || '' }}
            </p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ComparisonCardComponent {
  @Input({ required: true }) widget!: Widget;

  get data(): ComparisonData {
    return this.widget.data as ComparisonData;
  }

  get variation(): number {
    if (this.data.previous === 0) return this.data.current > 0 ? 100 : 0;
    return ((this.data.current - this.data.previous) / this.data.previous) * 100;
  }

  getComparisonBgClass(): string {
    if (this.variation > 0) return 'bg-green-50';
    if (this.variation < 0) return 'bg-red-50';
    return 'bg-gray-50';
  }

  getIconClass(): string {
    const base = 'w-10 h-10 rounded-full flex items-center justify-center';
    if (this.variation > 0) return `${base} bg-green-100 text-green-600`;
    if (this.variation < 0) return `${base} bg-red-100 text-red-600`;
    return `${base} bg-gray-100 text-gray-600`;
  }

  getVariationTextClass(): string {
    const base = 'text-lg font-bold';
    if (this.variation > 0) return `${base} text-green-600`;
    if (this.variation < 0) return `${base} text-red-600`;
    return `${base} text-gray-600`;
  }

  formatNumber(value: number): string {
    return value.toLocaleString('pt-BR');
  }
}
