import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-project-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (dashboardService.isProjectModalOpen()) {
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
            <h2 class="text-lg font-semibold text-gray-900">
              {{ editingProject() ? 'Editar Projeto' : 'Novo Projeto' }}
            </h2>
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
            <!-- Name -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Nome do Projeto</label>
              <input
                type="text"
                [(ngModel)]="projectName"
                name="name"
                required
                autocomplete="off"
                class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="Ex: Projeto 2025"
              />
            </div>
            
            <!-- Description -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
              <textarea
                [(ngModel)]="projectDescription"
                name="description"
                rows="2"
                class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                placeholder="Breve descrição do projeto..."
              ></textarea>
            </div>
            
            <!-- Color -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Cor do Projeto</label>
              <div class="flex gap-2 flex-wrap">
                @for (color of colorOptions; track color) {
                  <button
                    type="button"
                    (click)="projectColor = color"
                    [class.ring-2]="projectColor === color"
                    [class.ring-offset-2]="projectColor === color"
                    class="w-10 h-10 rounded-lg ring-gray-900 transition-all hover:scale-105"
                    [style.backgroundColor]="color"
                  ></button>
                }
              </div>
            </div>
            
            <!-- Initial Report -->
            @if (!editingProject()) {
              <div class="p-4 bg-gray-50 rounded-lg">
                <p class="text-sm font-medium text-gray-700 mb-3">Relatório Inicial</p>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs text-gray-500 mb-1">Mês</label>
                    <select
                      [(ngModel)]="initialMonth"
                      name="month"
                      class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      @for (m of months; track m.value) {
                        <option [value]="m.value">{{ m.label }}</option>
                      }
                    </select>
                  </div>
                  <div>
                    <label class="block text-xs text-gray-500 mb-1">Ano</label>
                    <select
                      [(ngModel)]="initialYear"
                      name="year"
                      class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      @for (y of years; track y) {
                        <option [value]="y">{{ y }}</option>
                      }
                    </select>
                  </div>
                </div>
              </div>
            }
            
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
                [disabled]="!projectName"
                class="flex-1 px-4 py-2.5 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {{ editingProject() ? 'Salvar' : 'Criar Projeto' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `
})
export class ProjectModalComponent {
  dashboardService = inject(DashboardService);
  
  editingProject = signal<string | null>(null);
  
  projectName = '';
  projectDescription = '';
  projectColor = '#7c3aed';
  initialMonth = new Date().getMonth() + 1;
  initialYear = new Date().getFullYear();
  
  colorOptions = [
    '#7c3aed', '#06b6d4', '#84cc16', '#f59e0b', 
    '#ef4444', '#ec4899', '#6366f1', '#14b8a6',
    '#8b5cf6', '#0ea5e9', '#22c55e', '#eab308'
  ];
  
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
    if (!this.projectName) return;
    
    if (this.editingProject()) {
      this.dashboardService.updateProject(this.editingProject()!, {
        name: this.projectName,
        description: this.projectDescription,
        color: this.projectColor
      });
    } else {
      this.dashboardService.createProject({
        name: this.projectName,
        description: this.projectDescription,
        color: this.projectColor,
        initialMonth: this.initialMonth,
        initialYear: this.initialYear
      });
    }
    
    this.close();
  }
  
  close(): void {
    this.dashboardService.closeProjectModal();
    this.resetForm();
  }
  
  private resetForm(): void {
    this.projectName = '';
    this.projectDescription = '';
    this.projectColor = '#7c3aed';
    this.initialMonth = new Date().getMonth() + 1;
    this.initialYear = new Date().getFullYear();
    this.editingProject.set(null);
  }
}
