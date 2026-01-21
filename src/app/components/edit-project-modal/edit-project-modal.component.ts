import { Component, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-edit-project-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (dashboardService.isEditProjectModalOpen()) {
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
            <h2 class="text-lg font-semibold text-gray-900">Editar Projeto</h2>
            <button 
              (click)="close()"
              class="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Content -->
          <div class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nome do Projeto *</label>
              <input 
                type="text" 
                [(ngModel)]="projectName"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="Ex: Relatório Mensal"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <textarea 
                [(ngModel)]="projectDescription"
                rows="3"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                placeholder="Descrição opcional do projeto"
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Cor do Projeto</label>
              <div class="flex flex-wrap gap-2">
                @for (color of colorOptions; track color.value) {
                  <button
                    (click)="projectColor = color.value"
                    [style.backgroundColor]="color.value"
                    [class]="projectColor === color.value ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''"
                    class="w-8 h-8 rounded-full transition-all duration-150 hover:scale-105"
                    [title]="color.label"
                  ></button>
                }
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 bg-gray-50 flex items-center justify-between">
            <button
              (click)="confirmDelete()"
              class="px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
            >
              Excluir Projeto
            </button>
            <div class="flex gap-3">
              <button
                (click)="close()"
                class="px-4 py-2 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                (click)="save()"
                [disabled]="!projectName.trim()"
                class="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class EditProjectModalComponent {
  dashboardService = inject(DashboardService);

  projectName = '';
  projectDescription = '';
  projectColor = '#7c3aed';

  colorOptions = [
    { value: '#7c3aed', label: 'Roxo' },
    { value: '#06b6d4', label: 'Ciano' },
    { value: '#84cc16', label: 'Lima' },
    { value: '#f59e0b', label: 'Âmbar' },
    { value: '#ef4444', label: 'Vermelho' },
    { value: '#ec4899', label: 'Rosa' },
    { value: '#6366f1', label: 'Índigo' },
    { value: '#14b8a6', label: 'Teal' },
    { value: '#8b5cf6', label: 'Violeta' },
    { value: '#10b981', label: 'Esmeralda' }
  ];

  constructor() {
    effect(() => {
      const project = this.dashboardService.getEditingProject();
      if (project) {
        this.projectName = project.name;
        this.projectDescription = project.description || '';
        this.projectColor = project.color;
      }
    });
  }

  close(): void {
    this.dashboardService.closeEditProjectModal();
  }

  async save(): Promise<void> {
    const projectId = this.dashboardService.getEditingProjectId();
    if (!projectId || !this.projectName.trim()) return;

    await this.dashboardService.updateProject(projectId, {
      name: this.projectName.trim(),
      description: this.projectDescription.trim() || undefined,
      color: this.projectColor
    });
  }

  async confirmDelete(): Promise<void> {
    const project = this.dashboardService.getEditingProject();
    if (!project) return;

    if (confirm(`Tem certeza que deseja excluir o projeto "${project.name}"?\n\nTodos os painéis, relatórios e widgets serão removidos permanentemente.`)) {
      await this.dashboardService.deleteProject(project.id);
    }
  }
}
