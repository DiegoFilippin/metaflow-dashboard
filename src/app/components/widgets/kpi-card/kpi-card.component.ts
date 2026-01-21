import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Widget, KpiData } from '../../../models/dashboard.models';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="h-full rounded-xl p-6 flex flex-col justify-between min-h-[140px]"
      [style.backgroundColor]="widget.config.backgroundColor || '#7c3aed'"
    >
      <div>
        <h3 
          class="text-sm font-medium opacity-90 mb-1"
          [style.color]="widget.config.textColor || '#ffffff'"
        >
          {{ widget.title }}
        </h3>
        <p 
          class="text-3xl font-bold tracking-tight"
          [style.color]="widget.config.textColor || '#ffffff'"
        >
          {{ formatValue(data) }}
        </p>
      </div>
      <p 
        class="text-sm opacity-75"
        [style.color]="widget.config.textColor || '#ffffff'"
      >
        {{ data.label }}
      </p>
    </div>
  `
})
export class KpiCardComponent {
  @Input({ required: true }) widget!: Widget;

  get data(): KpiData {
    return this.widget.data as KpiData;
  }

  formatValue(data: KpiData): string {
    const value = typeof data.value === 'number' 
      ? data.value.toLocaleString('pt-BR')
      : data.value;
    return `${data.prefix || ''}${value}${data.suffix || ''}`;
  }
}
