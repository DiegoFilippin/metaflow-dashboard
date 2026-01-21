import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../services/dashboard.service';
import { PdfExportService } from '../../services/pdf-export.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <!-- Left: Project Info & Selectors -->
      <div class="flex items-center gap-4">
        @if (dashboardService.currentProject(); as project) {
          <div class="pr-4 border-r border-gray-200">
            <h1 class="text-lg font-bold text-gray-900">{{ project.name }}</h1>
          </div>
        }

        <!-- Panel Selector -->
        <div class="flex items-center gap-2">
          <div class="relative">
            <select
              (change)="onPanelChange($event)"
              [value]="dashboardService.currentPanel()?.id"
              class="appearance-none bg-brand-50 border border-brand-200 rounded-lg px-3 py-1.5 pr-8 text-sm font-medium text-brand-700 hover:bg-brand-100 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer transition-colors"
            >
              @for (panel of dashboardService.availablePanels(); track panel.id) {
                <option [value]="panel.id">{{ panel.name }}</option>
              }
            </select>
            <div class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg class="w-3 h-3 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </div>
          </div>
          <button
            (click)="dashboardService.openPanelModal()"
            class="p-1.5 text-brand-400 hover:text-brand-600 hover:bg-brand-50 rounded transition-colors"
            title="Novo Painel"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
          </button>
        </div>

        <!-- Report Selector -->
        <div class="flex items-center gap-2">
          <div class="relative">
            <select
              (change)="onReportChange($event)"
              [value]="dashboardService.currentReport()?.id"
              class="appearance-none bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 pr-8 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer transition-colors"
            >
              @for (report of dashboardService.availableReports(); track report.id) {
                <option [value]="report.id">{{ report.title }}</option>
              }
            </select>
            <div class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg class="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </div>
          </div>
          <button
            (click)="dashboardService.openReportModal()"
            class="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded transition-colors"
            title="Novo Relatório"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Right: Actions -->
      <div class="flex items-center gap-3">
        <!-- Edit Mode Toggle -->
        <button
          (click)="dashboardService.toggleEditMode()"
          [class]="getEditButtonClass()"
          class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
        >
          @if (dashboardService.isEditMode()) {
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            <span>Salvar</span>
          } @else {
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
            <span>Editar Painel</span>
          }
        </button>

        <!-- Export Button -->
        <button 
          (click)="exportToPdf()"
          class="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
          </svg>
          <span>Exportar PDF</span>
        </button>
      </div>
    </header>
  `
})
export class TopbarComponent {
  dashboardService = inject(DashboardService);
  private pdfExportService = inject(PdfExportService);

  onPanelChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.dashboardService.selectPanel(select.value);
  }

  onReportChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.dashboardService.selectReport(select.value);
  }

  exportToPdf(): void {
    this.pdfExportService.exportToPdf();
  }

  getEditButtonClass(): string {
    return this.dashboardService.isEditMode()
      ? 'bg-brand-600 text-white hover:bg-brand-700'
      : 'bg-brand-50 text-brand-700 hover:bg-brand-100';
  }
}
