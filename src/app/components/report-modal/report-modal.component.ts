import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-report-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (dashboardService.isReportModalOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center">
        <!-- Backdrop -->
        <div 
          class="absolute inset-0 bg-black/50 backdrop-blur-sm"
          (click)="close()"
        ></div>
        
        <!-- Modal -->
        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
          <!-- Header -->
          <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-900">Novo Relatório</h2>
            <button 
              (click)="close()"
              class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          
          <!-- Form -->
          <form (ngSubmit)="save()" class="p-6 space-y-5">
            <p class="text-sm text-gray-600">
              Criar um novo relatório mensal para o projeto 
              <strong>{{ dashboardService.currentProject()?.name }}</strong>
            </p>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Mês</label>
                <select
                  [(ngModel)]="selectedMonth"
                  name="month"
                  class="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  @for (m of months; track m.value) {
                    <option [value]="m.value">{{ m.label }}</option>
                  }
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Ano</label>
                <select
                  [(ngModel)]="selectedYear"
                  name="year"
                  class="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  @for (y of years; track y) {
                    <option [value]="y">{{ y }}</option>
                  }
                </select>
              </div>
            </div>
            
            <!-- Copy Option -->
            <div class="bg-gray-50 rounded-lg p-4">
              <label class="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  [(ngModel)]="copyFromPrevious"
                  name="copyFromPrevious"
                  class="mt-0.5 w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
                />
                <div>
                  <span class="text-sm font-medium text-gray-900">Copiar widgets do relatório atual</span>
                  <p class="text-xs text-gray-500 mt-0.5">
                    Os widgets serão duplicados com a mesma estrutura, mas você poderá atualizar os dados.
                  </p>
                </div>
              </label>
            </div>
            
            <!-- Actions -->
            <div class="flex gap-3 pt-2">
              <button
                type="button"
                (click)="close()"
                class="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="flex-1 px-4 py-2.5 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
              >
                Criar Relatório
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `
})
export class ReportModalComponent {
  dashboardService = inject(DashboardService);
  
  selectedMonth = new Date().getMonth() + 1;
  selectedYear = new Date().getFullYear();
  copyFromPrevious = true;
  
  months = [
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' }
  ];
  
  years = [2023, 2024, 2025, 2026];
  
  save(): void {
    this.dashboardService.createReport(this.selectedMonth, this.selectedYear, this.copyFromPrevious);
    this.close();
  }
  
  close(): void {
    this.copyFromPrevious = true;
    this.dashboardService.closeReportModal();
  }
}
