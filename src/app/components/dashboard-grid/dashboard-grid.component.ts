import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../services/dashboard.service';
import { KpiCardComponent } from '../widgets/kpi-card/kpi-card.component';
import { BarChartComponent } from '../widgets/bar-chart/bar-chart.component';
import { PieChartComponent } from '../widgets/pie-chart/pie-chart.component';
import { DataTableComponent } from '../widgets/data-table/data-table.component';
import { GaugeChartComponent } from '../widgets/gauge-chart/gauge-chart.component';
import { LineChartComponent } from '../widgets/line-chart/line-chart.component';
import { ProgressCardComponent } from '../widgets/progress-card/progress-card.component';
import { ComparisonCardComponent } from '../widgets/comparison-card/comparison-card.component';
import { TextBlockComponent } from '../widgets/text-block/text-block.component';
import { TaskListComponent } from '../widgets/task-list/task-list.component';
import { Widget } from '../../models/dashboard.models';

@Component({
  selector: 'app-dashboard-grid',
  standalone: true,
  imports: [
    CommonModule,
    KpiCardComponent,
    BarChartComponent,
    PieChartComponent,
    DataTableComponent,
    GaugeChartComponent,
    LineChartComponent,
    ProgressCardComponent,
    ComparisonCardComponent,
    TextBlockComponent,
    TaskListComponent
  ],
  template: `
    <div class="p-6 overflow-y-auto h-full">
      @if (dashboardService.currentReport(); as report) {
        <div class="grid grid-cols-3 gap-6 auto-rows-min">
          @for (widget of report.widgets; track widget.id; let i = $index; let first = $first; let last = $last) {
            <div 
              [class]="getWidgetContainerClass(widget)"
              (click)="onWidgetClick(widget)"
              class="relative group"
            >
              <!-- Move buttons (visible in edit mode) -->
              @if (dashboardService.isEditMode()) {
                <div class="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  @if (!first) {
                    <button 
                      (click)="moveWidget(widget.id, 'up', $event)"
                      class="p-1.5 bg-white/90 hover:bg-white rounded-lg shadow-sm border border-gray-200 text-gray-600 hover:text-brand-600 transition-colors"
                      title="Mover para cima"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/>
                      </svg>
                    </button>
                  }
                  @if (!last) {
                    <button 
                      (click)="moveWidget(widget.id, 'down', $event)"
                      class="p-1.5 bg-white/90 hover:bg-white rounded-lg shadow-sm border border-gray-200 text-gray-600 hover:text-brand-600 transition-colors"
                      title="Mover para baixo"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                      </svg>
                    </button>
                  }
                </div>
              }
              
              @switch (widget.type) {
                @case ('kpi-card') {
                  <app-kpi-card [widget]="widget" />
                }
                @case ('bar-chart') {
                  <app-bar-chart [widget]="widget" />
                }
                @case ('pie-chart') {
                  <app-pie-chart [widget]="widget" />
                }
                @case ('data-table') {
                  <app-data-table [widget]="widget" />
                }
                @case ('gauge-chart') {
                  <app-gauge-chart [widget]="widget" />
                }
                @case ('line-chart') {
                  <app-line-chart [widget]="widget" />
                }
                @case ('progress-card') {
                  <app-progress-card [widget]="widget" />
                }
                @case ('comparison-card') {
                  <app-comparison-card [widget]="widget" />
                }
                @case ('text-block') {
                  <app-text-block [widget]="widget" />
                }
                @case ('task-list') {
                  <app-task-list [widget]="widget" />
                }
              }
            </div>
          }
        </div>
      } @else {
        <div class="flex items-center justify-center h-full">
          <div class="text-center">
            <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-1">Nenhum relatório selecionado</h3>
            <p class="text-sm text-gray-500">Selecione um projeto e mês para visualizar o dashboard</p>
          </div>
        </div>
      }
    </div>
  `
})
export class DashboardGridComponent {
  dashboardService = inject(DashboardService);

  getWidgetContainerClass(widget: Widget): string {
    const colSpanClass = {
      1: 'col-span-1',
      2: 'col-span-2',
      3: 'col-span-3'
    }[widget.colSpan] || 'col-span-1';

    const isSelected = this.dashboardService.currentWidgetId() === widget.id;
    const isEditMode = this.dashboardService.isEditMode();

    let classes = `${colSpanClass} min-h-[140px]`;

    if (isEditMode) {
      classes += ' cursor-pointer transition-all duration-200';
      if (isSelected) {
        classes += ' ring-2 ring-brand-500 ring-offset-2 rounded-xl';
      } else {
        classes += ' hover:ring-2 hover:ring-brand-300 hover:ring-offset-2 rounded-xl';
      }
    }

    return classes;
  }

  onWidgetClick(widget: Widget): void {
    if (this.dashboardService.isEditMode()) {
      this.dashboardService.selectWidget(widget.id);
    }
  }

  moveWidget(widgetId: string, direction: 'up' | 'down', event: Event): void {
    event.stopPropagation();
    this.dashboardService.moveWidget(widgetId, direction);
  }
}
