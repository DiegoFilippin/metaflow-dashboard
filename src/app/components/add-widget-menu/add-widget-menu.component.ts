import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../services/dashboard.service';
import { WidgetType } from '../../models/dashboard.models';

@Component({
  selector: 'app-add-widget-menu',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (dashboardService.isEditMode()) {
      <div class="fixed bottom-6 right-6 z-50">
        <!-- Menu Options -->
        @if (isOpen) {
          <div class="absolute bottom-16 right-0 bg-white rounded-xl shadow-xl border border-gray-200 p-2 min-w-[200px] animate-fade-in">
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 py-2">Adicionar Widget</p>
            @for (option of widgetOptions; track option.type) {
              <button
                (click)="addWidget(option.type)"
                class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-gray-50 transition-colors"
              >
                <div [class]="option.iconBg" class="w-8 h-8 rounded-lg flex items-center justify-center">
                  <span [innerHTML]="option.icon" class="w-4 h-4"></span>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ option.label }}</p>
                  <p class="text-xs text-gray-500">{{ option.description }}</p>
                </div>
              </button>
            }
          </div>
        }

        <!-- FAB Button -->
        <button
          (click)="isOpen = !isOpen"
          [class]="isOpen ? 'bg-gray-600 rotate-45' : 'bg-brand-600 hover:bg-brand-700'"
          class="w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white transition-all duration-200"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
        </button>
      </div>
    }
  `,
  styles: [`
    @keyframes fade-in {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fade-in 0.2s ease-out;
    }
  `]
})
export class AddWidgetMenuComponent {
  dashboardService = inject(DashboardService);
  isOpen = false;

  widgetOptions = [
    {
      type: 'kpi-card' as WidgetType,
      label: 'KPI Card',
      description: 'Número em destaque',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"/></svg>',
      iconBg: 'bg-purple-100 text-purple-600'
    },
    {
      type: 'comparison-card' as WidgetType,
      label: 'Comparativo',
      description: 'Mês atual vs anterior',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>',
      iconBg: 'bg-green-100 text-green-600'
    },
    {
      type: 'progress-card' as WidgetType,
      label: 'Barra de Progresso',
      description: 'Meta vs Realizado',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
      iconBg: 'bg-blue-100 text-blue-600'
    },
    {
      type: 'gauge-chart' as WidgetType,
      label: 'Indicador (Gauge)',
      description: 'Velocímetro de meta',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>',
      iconBg: 'bg-orange-100 text-orange-600'
    },
    {
      type: 'bar-chart' as WidgetType,
      label: 'Gráfico de Barras',
      description: 'Comparação de valores',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>',
      iconBg: 'bg-cyan-100 text-cyan-600'
    },
    {
      type: 'line-chart' as WidgetType,
      label: 'Gráfico de Linha',
      description: 'Tendência ao longo do tempo',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4"/></svg>',
      iconBg: 'bg-indigo-100 text-indigo-600'
    },
    {
      type: 'pie-chart' as WidgetType,
      label: 'Gráfico de Pizza',
      description: 'Distribuição percentual',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"/></svg>',
      iconBg: 'bg-lime-100 text-lime-600'
    },
    {
      type: 'data-table' as WidgetType,
      label: 'Tabela de Dados',
      description: 'Lista com status',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>',
      iconBg: 'bg-amber-100 text-amber-600'
    },
    {
      type: 'text-block' as WidgetType,
      label: 'Bloco de Texto',
      description: 'Resumos e observações',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>',
      iconBg: 'bg-gray-100 text-gray-600'
    },
    {
      type: 'task-list' as WidgetType,
      label: 'Lista de Tarefas',
      description: 'Acompanhamento de atividades',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>',
      iconBg: 'bg-teal-100 text-teal-600'
    }
  ];

  addWidget(type: WidgetType): void {
    this.dashboardService.addWidget(type);
    this.isOpen = false;
  }
}
