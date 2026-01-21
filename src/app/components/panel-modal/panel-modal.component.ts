import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-panel-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (dashboardService.isPanelModalOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center">
        <!-- Backdrop -->
        <div 
          class="absolute inset-0 bg-black/50 backdrop-blur-sm"
          (click)="close()"
        ></div>
        
        <!-- Modal -->
        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
          <!-- Header -->
          <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-900">Novo Painel</h2>
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
              Criar um novo painel para o projeto 
              <strong>{{ dashboardService.currentProject()?.name }}</strong>
            </p>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Nome do Painel *</label>
              <input
                type="text"
                [(ngModel)]="panelName"
                name="name"
                placeholder="Ex: Painel Financeiro, Painel de Equipe..."
                class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                required
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
              <textarea
                [(ngModel)]="panelDescription"
                name="description"
                rows="2"
                placeholder="Descrição opcional do painel..."
                class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
              ></textarea>
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
                [disabled]="!panelName.trim()"
                class="flex-1 px-4 py-2.5 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Criar Painel
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `
})
export class PanelModalComponent {
  dashboardService = inject(DashboardService);
  
  panelName = '';
  panelDescription = '';
  
  save(): void {
    if (this.panelName.trim()) {
      this.dashboardService.createPanel(this.panelName.trim(), this.panelDescription.trim() || undefined);
      this.resetForm();
      this.close();
    }
  }
  
  close(): void {
    this.resetForm();
    this.dashboardService.closePanelModal();
  }
  
  private resetForm(): void {
    this.panelName = '';
    this.panelDescription = '';
  }
}
