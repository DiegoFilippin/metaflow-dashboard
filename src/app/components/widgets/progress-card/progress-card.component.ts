import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Widget } from '../../../models/dashboard.models';

export interface ProgressData {
  current: number;
  target: number;
  label: string;
  unit?: string;
  showPercentage?: boolean;
}

@Component({
  selector: 'app-progress-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full bg-white rounded-xl p-6 flex flex-col">
      <h3 class="text-sm font-semibold text-gray-700 mb-4">{{ widget.title }}</h3>
      
      <div class="flex-1 flex flex-col justify-center">
        <div class="flex items-end justify-between mb-2">
          <div>
            <span class="text-3xl font-bold text-gray-900">{{ formatNumber(data.current) }}</span>
            <span class="text-lg text-gray-400 ml-1">/ {{ formatNumber(data.target) }}</span>
            @if (data.unit) {
              <span class="text-sm text-gray-500 ml-1">{{ data.unit }}</span>
            }
          </div>
          <span [class]="getPercentageClass()">
            {{ percentage.toFixed(0) }}%
          </span>
        </div>
        
        <div class="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
          <div 
            class="h-full rounded-full transition-all duration-700 ease-out"
            [class]="getProgressBarClass()"
            [style.width.%]="Math.min(percentage, 100)"
          ></div>
        </div>
        
        <p class="text-sm text-gray-500 mt-3">{{ data.label }}</p>
        
        @if (percentage >= 100) {
          <div class="flex items-center gap-1 mt-2 text-green-600">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            <span class="text-xs font-medium">Meta atingida!</span>
          </div>
        }
      </div>
    </div>
  `
})
export class ProgressCardComponent {
  @Input({ required: true }) widget!: Widget;
  
  Math = Math;

  get data(): ProgressData {
    return this.widget.data as ProgressData;
  }

  get percentage(): number {
    if (this.data.target === 0) return 0;
    return (this.data.current / this.data.target) * 100;
  }

  getPercentageClass(): string {
    const base = 'text-lg font-bold';
    if (this.percentage >= 100) return `${base} text-green-600`;
    if (this.percentage >= 70) return `${base} text-yellow-600`;
    return `${base} text-red-500`;
  }

  getProgressBarClass(): string {
    if (this.percentage >= 100) return 'bg-green-500';
    if (this.percentage >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  }

  formatNumber(value: number): string {
    return value.toLocaleString('pt-BR');
  }
}
